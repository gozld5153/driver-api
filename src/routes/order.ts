import express, { Request, Response } from 'express'
import { messaging } from 'firebase-admin'
import { In, Not } from 'typeorm'
import { offerRepository, orderRepository, userRepository } from '../db/repositories'
import Offer, { OfferStatus } from '../entities/Offer'
import Order from '../entities/Order'
import User from '../entities/User'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import { UserRole } from '../types/user'

const router = express.Router()

const handleOrderRequest = async (req: Request, res: Response) => {
  try {
    const { destination, departure } = req.body
    const user: User = res.locals.user
    if (!destination || !departure) throw new Error('destination, departure is mandatory')

    // find driver nearest to departure
    const driver: (User & { distance: number }) | undefined = await userRepository
      .createQueryBuilder()
      .select(`*, st_distance_sphere(location, st_geomfromtext('${departure?.point}', 4326)) as distance`)
      .where('role=:role', { role: UserRole.DRIVER })
      .andWhere('status=:status', { status: 'ready' })
      .orderBy('distance')
      .getRawOne()
    if (!driver?.pushToken) throw new Error('no driver available')

    // make new order, offer
    const order = new Order({ client: user, destination, departure })
    const offer = new Offer({ order, type: driver.role, user: driver, status: OfferStatus.PENDING })
    offer.order = order
    await offerRepository.save(offer) // order will be saved in cascade manner

    // send offer id to driver via push and check offer status after 2000 sec
    await notifyOfferThenCheckIt({
      offerId: offer.id,
      token: driver.pushToken,
      title: '이송 요청',
      body: `${departure.name}에서 이송을 요청했습니다.`,
    })

    // return to client with order
    return res.json(order)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

type NotifyByPushType = { token: string; data: any; notification: any }
const notifyByPush = async ({ token, data, notification }: NotifyByPushType) => {
  const pushResult = await messaging().send({
    token: token,
    notification,
    data,
    android: {
      notification: {
        channelId: 'riders',
        vibrateTimingsMillis: [0, 500, 500, 500],
        priority: 'high',
        defaultVibrateTimings: false,
      },
      priority: 'high',
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          category: 'riders',
          contentAvailable: true,
        },
      },
    },
  })

  return pushResult
}

type NotifyOfferThenCheckItType = { offerId: number; token: string; title: string; body: string; timeout?: number }
const notifyOfferThenCheckIt = async ({ offerId, token, title, body, timeout = 10000 }: NotifyOfferThenCheckItType) => {
  const pushResult = await notifyByPush({
    token,
    notification: {
      title,
      body,
    },
    data: { offerId: String(offerId) },
  })

  console.log({ pushResult })

  checkOfferStatus(offerId, timeout)
}

const checkOfferStatus = (offerId: number, timeout: number) => {
  setTimeout(async () => {
    try {
      const offer = await offerRepository.findOneOrFail({
        where: {
          id: offerId,
        },
        relations: {
          user: true,
          order: {
            offers: {
              user: true,
            },
            departure: true,
            destination: true,
          },
        },
      })

      if (offer.status === OfferStatus.PENDING) {
        // mark offer as timeout
        offer.status = OfferStatus.TIMEOUT
        await offerRepository.save(offer)

        // TODO: 타임아웃되었다고 해당 드라이버에게 푸시로 알려줌
        await notifyByPush({
          token: offer.user?.pushToken,
          data: { timeoutOfferId: String(offer.id) },
          notification: { title: '시간초과로 취소되었습니다.', body: `offerId: ${offer.id}` },
        })

        const driverIds = offer.order.offers.filter(of => of.type === offer.type).map(offer => offer.user.id)
        console.log({ drivers: driverIds })

        // find other driver and push
        const driver: (User & { distance: number }) | undefined = await userRepository
          .createQueryBuilder()
          .select(
            `*, st_distance_sphere(location, st_geomfromtext('${offer.order.departure?.point}', 4326)) as distance`,
          )
          .where('role=:role', { role: UserRole.DRIVER })
          .andWhere('status=:status', { status: 'ready' })
          .andWhere({ id: Not(In(driverIds)) })
          .orderBy('distance')
          .getRawOne()
        if (!driver?.pushToken) throw new Error('no driver available')

        const newOffer = new Offer({ order: offer.order, type: driver.role, user: driver, status: OfferStatus.PENDING })
        await offerRepository.save(newOffer)

        await notifyOfferThenCheckIt({
          offerId: newOffer.id,
          token: driver.pushToken,
          title: '이송 요청',
          body: `${newOffer.order.departure.name}에서 이송을 요청했습니다.`,
        })
      }
    } catch (error) {
      console.log({ error })
    }
  }, timeout)
}

const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const order = await orderRepository.findOne({
      where: { id: Number(id) },
      relations: {
        destination: true,
        departure: true,
        client: true,
        driver: true,
        hero: true,
      },
    })
    return res.json(order)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleOfferResponse = async (req: Request, res: Response) => {
  try {
    const { response, offerId } = req.body
    if (!response || !offerId) throw new Error('response, offerId is mandatory')

    const offer = await offerRepository.findOneOrFail({
      where: {
        id: offerId,
      },
      relations: {
        order: {
          destination: true,
          departure: true,
          offers: {
            user: true,
          },
        },
      },
    })

    if (response === 'reject' && offer.type === UserRole.DRIVER) {
      offer.status = OfferStatus.REJECTED
      await offerRepository.save(offer)

      const driverIds = offer.order.offers.filter(of => of.type === offer.type).map(of => of.user.id)
      console.log({ drivers: driverIds })

      // find other driver and push
      const driver: (User & { distance: number }) | undefined = await userRepository
        .createQueryBuilder()
        .select(`*, st_distance_sphere(location, st_geomfromtext('${offer.order.departure?.point}', 4326)) as distance`)
        .where('role=:role', { role: UserRole.DRIVER })
        .andWhere('status=:status', { status: 'ready' })
        .andWhere({ id: Not(In(driverIds)) })
        .orderBy('distance')
        .getRawOne()
      if (!driver?.pushToken) return res.json({ message: 'no driver available' })

      const newOffer = new Offer({
        order: offer.order,
        type: driver.role,
        user: driver,
        status: OfferStatus.PENDING,
      })
      await offerRepository.save(newOffer)

      await notifyOfferThenCheckIt({
        offerId: newOffer.id,
        token: driver.pushToken,
        title: '이송 요청',
        body: `${newOffer.order.departure.name}에서 이송을 요청했습니다.`,
      })
    }

    return res.status(200).send({ success: true, offerId, message: `you rejected order: ${offerId}` })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleGetOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) throw new Error('offer id is mandatory')

    const offer = await offerRepository.findOne({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        type: true,
        order: {
          id: true,
        },
      },
      relations: {
        order: {
          departure: true,
          destination: true,
        },
      },
    })
    if (!offer) throw new Error('cannot find offer')

    return res.json(offer)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

// /order
router.post('/request', user, auth, handleOrderRequest)
router.get('/offer/:id', user, auth, handleGetOffer)
router.post('/offer/response', user, auth, handleOfferResponse)

router.get('/:id', user, auth, getOrder)

export default router
