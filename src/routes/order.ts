import express, { Request, Response } from 'express'
import { messaging } from 'firebase-admin'
import { In, Not } from 'typeorm'
import { offerRepository, orderRepository, placeRepository, userRepository } from '../db/repositories'
import Offer, { OfferStatus } from '../entities/Offer'
import { OrderStatus } from '../entities/Order'
import Place from '../entities/Place'
import User from '../entities/User'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import { getRouteFromCoords } from '../lib/helpers'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import keyValStore from '../services/keyValStore'
import { Coord } from '../types/map'
import { UserRole } from '../types/user'

const router = express.Router()

const handleOrderRequest = async (req: Request, res: Response) => {
  try {
    const {
      departure: d1,
      destination: d2,
      phoneNumber: clientPhoneNumber,
      patientName,
      patientPhoneNumber,
      companionName,
      companionPhoneNumber,
      description,
      gear,
      etc,
    } = req.body
    const user: User = res.locals.user
    if (!d2 || !d1 || !clientPhoneNumber || !patientName || !patientPhoneNumber)
      throw new BadRequestError('destination, departure, phoneNumber, patient, patientPhoneNumber is mandatory')

    const departure = (await placeRepository.findOneBy({ ...d1 })) ?? (await placeRepository.save(new Place(d1)))
    const destination = (await placeRepository.findOneBy({ ...d2 })) ?? (await placeRepository.save(new Place(d2)))

    console.log({ d1, departure, d2, destination })

    const order = await orderRepository.save({
      client: user,
      destination,
      departure,
      clientPhoneNumber,
      patientName,
      patientPhoneNumber,
      companionName,
      companionPhoneNumber,
      description,
      gear,
      etc,
      status: OrderStatus.PENDING,
    })

    const routes = await getRouteFromCoords(departure, destination)
    if (routes) await keyValStore.set(String(order.id), routes)

    const driver: (User & { distance: number }) | undefined = await userRepository
      .createQueryBuilder()
      .select(`*, st_distance_sphere(location, st_geomfromtext('${departure?.point}', 4326)) as distance`)
      .where('role=:role', { role: UserRole.DRIVER })
      .andWhere('status=:status', { status: 'ready' })
      .orderBy('distance')
      .getRawOne()

    if (!driver?.pushToken) {
      // TODO: driver가 없다는 것을 client에게 알림
      // TODO: 주기적으로 이 order 처리할 드라이버 찾아서 처리
      return res.json(order)
    }

    const offer = new Offer({ order, type: driver.role, user: driver, status: OfferStatus.PENDING })
    offer.order = order
    await offerRepository.save(offer)

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
    return handleErrorAndSendResponse(err, res)
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
const notifyOfferThenCheckIt = async ({ offerId, token, title, body, timeout = 20000 }: NotifyOfferThenCheckItType) => {
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

        // TODO: 타임아웃되었다고 해당 드라이버|히어로에게 푸시로 알려줌
        await notifyByPush({
          token: offer.user?.pushToken,
          data: { timeoutOfferId: String(offer.id) },
          notification: { title: '시간초과로 취소되었습니다.', body: `offerId: ${offer.id}` },
        })

        const workerIds = offer.order.offers.filter(of => of.type === offer.type).map(offer => offer.user.id)
        console.log({ workers: workerIds })

        // find other worker (driver or hero) and push
        const worker: (User & { distance: number }) | undefined = await userRepository
          .createQueryBuilder()
          .select(
            `*, st_distance_sphere(location, st_geomfromtext('${offer.order.departure?.point}', 4326)) as distance`,
          )
          .where({
            role: offer.user.role,
            status: 'ready',
            id: Not(In(workerIds)),
          })
          .orderBy('distance')
          .getRawOne()
        if (!worker?.pushToken) throw new Error('no worker available')

        const newOffer = new Offer({ order: offer.order, type: worker.role, user: worker, status: OfferStatus.PENDING })
        await offerRepository.save(newOffer)

        await notifyOfferThenCheckIt({
          offerId: newOffer.id,
          token: worker.pushToken,
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

    const user: User = res.locals.user

    const offer = await offerRepository.findOneOrFail({
      where: {
        id: offerId,
      },
      relations: {
        user: true,
        order: {
          destination: true,
          departure: true,
          offers: {
            user: true,
          },
        },
      },
    })

    if (response === 'reject') {
      offer.status = OfferStatus.REJECTED
      await offerRepository.save(offer)

      const workerIds = offer.order.offers.filter(of => of.type === offer.type).map(of => of.user.id)
      console.log({ workers: workerIds })

      // find other driver and push
      const worker: (User & { distance: number }) | undefined = await userRepository
        .createQueryBuilder()
        .select(`*, st_distance_sphere(location, st_geomfromtext('${offer.order.departure?.point}', 4326)) as distance`)
        .where({
          role: offer.user.role,
          status: 'ready',
          id: Not(In(workerIds)),
        })
        .orderBy('distance')
        .getRawOne()
      if (!worker?.pushToken) return res.json({ success: true, offerId, message: 'no worker available' })

      const newOffer = new Offer({
        order: offer.order,
        type: worker.role,
        user: worker,
        status: OfferStatus.PENDING,
      })
      await offerRepository.save(newOffer)

      await notifyOfferThenCheckIt({
        offerId: newOffer.id,
        token: worker.pushToken,
        title: '이송 요청',
        body: `${newOffer.order.departure.name}에서 이송을 요청했습니다.`,
      })

      return res.status(200).send({ success: true, offerId, message: `you rejected order: ${offerId}` })
    }

    if (response === 'accept') {
      offer.status = OfferStatus.ACCEPTED

      if (user.role === UserRole.DRIVER) offer.order.driver = user
      if (user.role === UserRole.HERO) offer.order.hero = user

      if (user.role === UserRole.DRIVER) offer.order.status = OrderStatus.DRIVER_MATCHED
      if (user.role === UserRole.HERO) offer.order.status = OrderStatus.HERO_MATCHED

      await offerRepository.save(offer)

      return res.status(200).send({ success: true, offerId, message: `you accepted order: ${offerId}` })
    }

    return res.status(204).send()
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
      },
      relations: {
        order: {
          departure: true,
          destination: true,
          driver: true,
          hero: true,
        },
      },
    })
    if (!offer) throw new Error('cannot find offer')

    type RouteData = {
      route: Coord[]
      boundPoints: {
        minCoord: {
          latitude: number
          longitude: number
        }
        maxCoord: {
          latitude: number
          longitude: number
        }
      }
      distance: number
      duration: number
    }

    // route
    const routeData: RouteData = await keyValStore.get(String(offer.order.id))

    return res.json({ offer, routeData })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleHeroRequest = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body
    const driver: User = res.locals.user

    if (!orderId) throw new Error('orderId is mandatory')

    const order = await orderRepository.findOneOrFail({ where: { id: orderId }, relations: { departure: true } })
    const hero = await userRepository
      .createQueryBuilder()
      .select(`*, st_distance_sphere(location, st_geomfromtext('${order.departure?.point}', 4326)) as distance`)
      .where({
        role: UserRole.HERO,
        status: 'ready',
      })
      .orderBy('distance')
      .getRawOne()
    if (!hero?.pushToken) throw new Error('no hero available')

    const offer = new Offer({ order, type: hero.role, user: hero, status: OfferStatus.PENDING })
    await offerRepository.save(offer)

    // notify offer to hero
    await notifyOfferThenCheckIt({
      offerId: offer.id,
      token: hero.pushToken,
      title: '출동 요청',
      body: `${driver.name}께서 ${order.departure.name} 출발 건을 요청했습니다.`,
      timeout: 20000,
    })

    return res.json({ success: true, message: 'hero request is processing', hero: hero.id })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await orderRepository.find({
      where: { client: { id: res.locals.user.id } },
      relations: {
        departure: true,
        destination: true,
        driver: true,
        hero: true,
        client: true,
      },
    })
    return res.json(orders)
  } catch (err) {
    return handleErrorAndSendResponse(err, res)
  }
}

// /order
router.post('/request', user, auth, handleOrderRequest)
router.get('/offer/:id', user, auth, handleGetOffer)
router.post('/offer/response', user, auth, handleOfferResponse)
router.post('/hero', user, auth, handleHeroRequest)
router.get('/', user, auth, getOrders)
router.get('/:id', user, auth, getOrder)

export default router
