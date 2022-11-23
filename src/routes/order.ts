import dayjs from 'dayjs'
import express, { Request, Response } from 'express'
import { In, Not } from 'typeorm'
import {
  invoiceRepository,
  offerRepository,
  orderRepository,
  placeRepository,
  userRepository,
} from '../db/repositories'
import Invoice from '../entities/Invoice'
import Offer, { OfferStatus } from '../entities/Offer'
import { OrderStatus } from '../entities/Order'
import Place from '../entities/Place'
import User from '../entities/User'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import { getExpectedFee, getRouteFromCoords } from '../lib/helpers'
import notifyByPush from '../lib/push'
import sendSMS from '../lib/sendSMS'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import keyValStore from '../services/keyValStore'
import { Coord } from '../types/map'
import { UserRole } from '../types/user'

const router = express.Router()

const handleRequestOrder = async (req: Request, res: Response) => {
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

    const routes = await getRouteFromCoords(departure, destination)
    const expectedFee = getExpectedFee(routes?.distance)

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
      expectedFee,
    })

    if (routes) await keyValStore.set(String(order.id), routes)

    const hospital = await userRepository.findOneOrFail({
      where: { id: user.id },
      relations: { organization: { partners: true } },
    })

    const sameAffiliationDriverUsers = await userRepository.find({
      where: { role: UserRole.DRIVER, organization: { affiliation: user.organization.affiliation } },
      relations: { organization: true },
    })

    const partnersDriverUsers = sameAffiliationDriverUsers.filter(
      du => du.organization.id === hospital.organization.partners?.id,
    )

    const sameAffiliationDriverUsersIds = sameAffiliationDriverUsers.map(du => du.id)
    const partnersDriverUsersIds = partnersDriverUsers.map(du => du.id)

    console.log({ sameAffiliationDriverUsersIds })
    console.log({ partnersDriverUsersIds })

    let driver: (User & { distance: number }) | undefined = await userRepository
      .createQueryBuilder('user')
      .select(`*, st_distance_sphere(user.location, st_geomfromtext('${departure?.point}', 4326)) as distance`)
      .where('role=:role', { role: UserRole.DRIVER })
      .andWhere('status=:status', { status: 'ready' })
      .andWhere({ id: In(partnersDriverUsersIds) })
      .andWhere(`st_distance_sphere(st_geomfromtext('${departure?.point}', 4326), user.location) <= 10000`)
      .orderBy('distance')
      .getRawOne()

    if (!driver) {
      driver = await userRepository
        .createQueryBuilder('user')
        .select(`*, st_distance_sphere(user.location, st_geomfromtext('${departure?.point}', 4326)) as distance`)
        .where('role=:role', { role: UserRole.DRIVER })
        .andWhere('status=:status', { status: 'ready' })
        .andWhere({ id: In(sameAffiliationDriverUsersIds) })
        .andWhere(`st_distance_sphere(st_geomfromtext('${departure?.point}', 4326), user.location) <= 10000`)
        .orderBy('distance')
        .getRawOne()
    }

    if (!driver) {
      await sendSMS(order.clientPhoneNumber, '반경 10km 내 드라이버가 없습니다.')
      order.status = OrderStatus.NO_DRIVER
      const savedOrder = await orderRepository.save(order)
      return res.json(savedOrder)
    }

    const offerDriver = await userRepository.findOneByOrFail({ id: driver.id })
    offerDriver.status = 'working'
    await userRepository.save(offerDriver)

    const offer = new Offer({ order, type: driver.role, user: driver, status: OfferStatus.PENDING })
    offer.order = order
    await offerRepository.save(offer)

    // send offer id to driver via push and check offer status after 2000 sec
    notifyOfferThenCheckIt({
      offerId: offer.id,
      token: driver.pushToken,
      title: '이송 요청',
      body: `${departure.name}에서 이송을 요청했습니다.`,
    })

    // return to client with order
    return res.json(order)
  } catch (err) {
    console.log({ err })
    return handleErrorAndSendResponse(err, res)
  }
}

type NotifyOfferThenCheckItType = { offerId: number; token: string; title: string; body: string; timeout?: number }
const notifyOfferThenCheckIt = async ({ offerId, token, title, body, timeout = 30000 }: NotifyOfferThenCheckItType) => {
  try {
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
  } catch (error) {
    console.log({ error })
  }
}

const checkOfferStatus = (offerId: number, timeout: number) => {
  setTimeout(async () => {
    try {
      const offer = await offerRepository.findOneOrFail({
        where: {
          id: offerId,
        },
        relations: {
          user: {
            organization: true,
          },
          order: {
            offers: {
              user: true,
            },
            client: {
              organization: {
                partners: true,
              },
            },
            departure: true,
            destination: true,
          },
        },
      })

      const order = await orderRepository.findOneByOrFail({ id: offer.order.id })

      if (offer.status === OfferStatus.PENDING) {
        // mark offer as timeout
        offer.status = OfferStatus.TIMEOUT
        await offerRepository.save(offer)

        const timeOutWorker = await userRepository.findOneByOrFail({ id: offer.user.id })
        timeOutWorker.status = 'ready'
        await userRepository.save(timeOutWorker)

        // TODO: 타임아웃되었다고 해당 드라이버|히어로에게 푸시로 알려줌

        await notifyByPush({
          token: offer.user?.pushToken,
          data: { timeoutOfferId: String(offer.id) },
          notification: { title: '시간초과로 취소되었습니다.', body: `offerId: ${offer.id}` },
        })

        const notSameAffiliationDrivers = await userRepository.find({
          relations: {
            organization: true,
          },
          where: {
            organization: {
              affiliation: Not(offer.user.organization?.affiliation),
            },
            role: UserRole.DRIVER,
          },
        })

        let workerIds = offer.order.offers.filter(of => of.type === offer.type).map(offer => offer.user.id)
        workerIds = [...workerIds, ...notSameAffiliationDrivers.map(d => d.id)]
        console.log({ workers: workerIds })

        // find other worker (driver or hero) and push

        //TODO: driver 일 때 협력관계인 드라이버에게 먼저 호출
        let worker: (User & { distance: number }) | undefined
        const hospital = offer.order.client

        if (offer.user.role === UserRole.DRIVER && hospital.organization.partners) {
          const partnerDrivers = await userRepository.find({
            where: {
              organization: {
                id: hospital.organization.partners.id,
              },
            },
          })

          const partnerDriverIds = partnerDrivers.map(pd => pd.id)

          worker = await userRepository
            .createQueryBuilder()
            .select(
              `*, st_distance_sphere(location, st_geomfromtext('${offer.order.departure?.point}', 4326)) as distance`,
            )
            .where({
              role: UserRole.DRIVER,
              status: 'ready',
              id: Not(In(workerIds)),
            })
            .andWhere({
              id: In(partnerDriverIds),
            })
            .orderBy('distance')
            .getRawOne()
        }

        if (!worker) {
          worker = await userRepository
            .createQueryBuilder()
            .select(
              `*, st_distance_sphere(location, st_geomfromtext('${offer.order.departure?.point}', 4326)) as distance`,
            )
            .where({
              role: offer.user.role,
              status: 'ready',
              id: Not(In(workerIds)),
            })
            .andWhere(`st_distance_sphere(st_geomfromtext('${offer.order.departure?.point}', 4326), location) <= 10000`)
            .orderBy('distance')
            .getRawOne()
        }

        console.log('timeout', { worker })

        if (!worker?.pushToken) {
          if (offer.user.role === UserRole.DRIVER) {
            await sendSMS(order.clientPhoneNumber, '반경 10km 내 드라이버가 없습니다.')
            order.status = OrderStatus.CANCELLED
            await orderRepository.save(order)
          }
          throw new Error('no worker available')
        }

        const nextOfferWorker = await userRepository.findOneByOrFail({ id: worker.id })
        nextOfferWorker.status = 'working'
        await userRepository.save(nextOfferWorker)

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

const handleGetOrder = async (req: Request, res: Response) => {
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
        invoice: true,
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
        user: { organization: true },
        order: {
          client: {
            organization: {
              partners: true,
            },
          },
          destination: true,
          departure: true,
          offers: {
            user: true,
          },
        },
      },
    })

    const order = await orderRepository.findOneByOrFail({ id: offer.order.id })

    if (response === 'reject') {
      offer.status = OfferStatus.REJECTED
      await offerRepository.save(offer)

      user.status = 'ready'
      await userRepository.save(user)

      let workerIds = offer.order.offers.filter(of => of.type === offer.type).map(of => of.user.id)

      if (user.role === UserRole.DRIVER) {
        const notSameAffiliationdrivers = await userRepository.find({
          relations: { organization: true },
          where: {
            organization: {
              affiliation: Not(user.organization.affiliation),
            },
            role: UserRole.DRIVER,
          },
        })

        workerIds = [...workerIds, ...notSameAffiliationdrivers.map(d => d.id)]
      }

      console.log({ workersIncludeNotSameAffiliation: workerIds })

      // find other driver and push

      // TODO: 거절했을 때 협력업체 드라이버에게 우선권
      let worker: (User & { distance: number }) | undefined
      const hospital = offer.order.client

      if (offer.user.role === UserRole.DRIVER && hospital.organization.partners) {
        const partnerDrivers = await userRepository.find({
          where: {
            organization: {
              id: hospital.organization.partners.id,
            },
          },
        })
        const partnerDriverIds = partnerDrivers.map(pd => pd.id)

        worker = await userRepository
          .createQueryBuilder()
          .select(
            `*, st_distance_sphere(location, st_geomfromtext('${offer.order.departure?.point}', 4326)) as distance`,
          )
          .where({
            role: UserRole.DRIVER,
            status: 'ready',
            id: Not(In(workerIds)),
          })
          .andWhere({
            id: In(partnerDriverIds),
          })
          .orderBy('distance')
          .getRawOne()
      }

      if (!worker) {
        worker = await userRepository
          .createQueryBuilder()
          .select(
            `*, st_distance_sphere(location, st_geomfromtext('${offer.order.departure?.point}', 4326)) as distance`,
          )
          .where({
            role: offer.user.role,
            status: 'ready',
            id: Not(In(workerIds)),
          })
          .andWhere(`st_distance_sphere(st_geomfromtext('${offer.order.departure?.point}', 4326), location) <= 10000`)
          .orderBy('distance')
          .getRawOne()
      }

      if (!worker?.pushToken) {
        if (offer.user.role === UserRole.DRIVER) {
          await sendSMS(order.clientPhoneNumber, '반경 10km 내 드라이버가 없습니다.')
          order.status = OrderStatus.CANCELLED
          await orderRepository.save(order)
        }
        return res.json({ success: true, offerId, message: 'no worker available' })
      }

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
      user.status = 'working'

      if (user.role === UserRole.DRIVER) {
        offer.order.driver = user
        await sendSMS(order.clientPhoneNumber, '드라이버가 매칭되었습니다.')
      }
      if (user.role === UserRole.HERO) offer.order.hero = user

      if (user.role === UserRole.DRIVER) offer.order.status = OrderStatus.DRIVER_MATCHED
      if (user.role === UserRole.HERO) offer.order.status = OrderStatus.HERO_MATCHED

      await userRepository.save(user)
      await offerRepository.save(offer)

      return res.send({
        success: true,
        offerId,
        orderId: offer.order.id,
        message: `you accepted order: ${offerId}`,
      })
    }

    return res.status(204).send()
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
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
        createdAt: true,
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

const handleRequestHero = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body
    const driver: User = res.locals.user

    if (!orderId) throw new Error('orderId is mandatory')

    const order = await orderRepository.findOneOrFail({ where: { id: orderId }, relations: { departure: true } })
    order.status = OrderStatus.HERO_REQUESTED
    await orderRepository.save(order)

    const hero: User | undefined = await userRepository
      .createQueryBuilder()
      .select(`*, st_distance_sphere(location, st_geomfromtext('${order.departure?.point}', 4326)) as distance`)
      .where({
        role: UserRole.HERO,
        status: 'ready',
      })
      .andWhere(`st_distance_sphere(st_geomfromtext('${order.departure?.point}', 4326), location) <= 10000`)
      .orderBy('distance')
      .getRawOne()
    if (!hero?.pushToken) throw new Error('no hero available')

    const offerHero = await userRepository.findOneByOrFail({ id: hero.id })
    offerHero.status = 'working'
    await userRepository.save(offerHero)

    const offer = new Offer({ order, type: hero.role, user: hero, status: OfferStatus.PENDING })
    await offerRepository.save(offer)

    // notify offer to hero
    await notifyOfferThenCheckIt({
      offerId: offer.id,
      token: hero.pushToken,
      title: '출동 요청',
      body: `${driver.name}께서 ${order.departure.name} 출발 건을 요청했습니다.`,
      timeout: 30000,
    })

    return res.json({ success: true, message: 'hero request is processing', hero: hero.id })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleRejectHero = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body
    const order = await orderRepository.findOneByOrFail({ id: orderId })
    order.status = OrderStatus.HERO_REJECTED
    await orderRepository.save(order)

    const invoice = new Invoice({ type: 'driver', order, goochooriFee: 3000 })
    //const savedInvoice = await invoiceRepository.save(invoice)

    await invoiceRepository.save(invoice)

    // order.invoice = invoice
    // await orderRepository.save(order)

    return res.json({ invoice, order })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleGetOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await orderRepository.find({
      withDeleted: true,
      where: { client: { id: res.locals.user.id } },
      relations: {
        departure: true,
        destination: true,
        driver: {
          organization: true,
        },
        hero: true,
        client: true,
        invoice: true,
      },
    })
    return res.json(orders)
  } catch (err) {
    return handleErrorAndSendResponse(err, res)
  }
}

const getCompletedOrder = async (req: Request<{ role: 'driver' | 'hero' }>, res: Response) => {
  try {
    const user = res.locals.user
    const { role } = req.params
    const { year, month } = req.query
    let order

    const forDate = dayjs(`${year}-${month}`).format('YYYY-MM')

    if (role === 'driver') {
      order = await orderRepository.find({
        withDeleted: true,
        relations: { invoice: true, hero: true, departure: true, destination: true },
        where: {
          status: OrderStatus.COMPLETED,
          driver: { id: user.id },
        },
      })
    }

    if (role === 'hero') {
      order = await orderRepository.find({
        withDeleted: true,
        relations: { invoice: true, driver: true, departure: true, destination: true },
        where: { status: OrderStatus.COMPLETED, hero: { id: user.id } },
      })
    }

    order = order?.filter(o => dayjs(o.completedAt).format('YYYY-MM') === forDate)

    res.json({ order })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const orderCheck = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId)
    console.log({ orderId })

    const order = await orderRepository.findOneOrFail({
      where: { id: orderId },
      relations: { hero: true },
    })

    console.log(order)

    if (order.hero) return res.json({ possibleReject: false })

    return res.json({ possibleReject: true })
  } catch (err) {
    console.log(err)
    return res.status(500)
  }
}

//* hero 전용
const offerCheck = async (req: Request<{ offerId: string }>, res: Response) => {
  try {
    const offerId = Number(req.params.offerId)
    const user: User = res.locals.user

    const offer = await offerRepository.findOneOrFail({
      where: { id: offerId },
      relations: { order: { driver: true } },
    })

    const driverOffer = await offerRepository.findOneByOrFail({
      order: { id: offer.order.id },
      user: { id: offer.order.driver.id },
    })

    if (driverOffer.status === OfferStatus.REJECTED) {
      user.status = 'ready'
      await userRepository.save(user)

      offer.status = OfferStatus.REJECTED
      await offerRepository.save(offer)
    }

    res.json({ isRejected: driverOffer.status === OfferStatus.REJECTED })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const getOrderStatus = async (req: Request<{ orderId: string; driverId: string }>, res: Response) => {
  try {
    const orderId = Number(req.params.orderId)
    const driverId = Number(req.params.driverId)

    const order = await orderRepository.findOne({ where: { id: orderId }, relations: { invoice: true } })
    const driver = await userRepository.findOneByOrFail({ id: driverId })

    res.json({ order, driver })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

// /order
router.post('/request', user, auth, handleRequestOrder)

router.get('/offer/:id', user, auth, handleGetOffer)
router.post('/offer/response', user, auth, handleOfferResponse)

router.post('/request-hero', user, auth, handleRequestHero)
router.post('/reject-hero', user, auth, handleRejectHero)

router.get('/', user, auth, handleGetOrders)
router.get('/:id', user, auth, handleGetOrder)
router.get('/completed/:role', user, auth, getCompletedOrder)

router.get('/check/:orderId', user, auth, orderCheck) //* driver
router.get('/check/offer/:offerId', user, auth, offerCheck) //* hero
router.get('/status/:orderId/:driverId', user, auth, getOrderStatus) //*hospital

export default router
