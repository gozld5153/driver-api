import express, { Request, Response } from 'express'
import { messaging } from 'firebase-admin'
import { orderRepository, placeRepository, userRepository } from '../db/repositories'
import Order from '../entities/Order'
import User from '../entities/User'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import { UserRole } from '../types/user'

const router = express.Router()

const makeOrder = async (req: Request, res: Response) => {
  const { destination, departure } = req.body
  const user: User = res.locals.user

  try {
    const order = new Order({ destination, departure, client: user })
    await orderRepository.save(order)

    const storedDeparture = await placeRepository.findOneBy({ id: departure.id })

    // pick driver
    const driver = await userRepository
      .createQueryBuilder()
      .select(`*, st_distance_sphere(location, st_geomfromtext('${storedDeparture?.point}', 4326)) as distance`)
      .where('role=:role', { role: UserRole.DRIVER })
      .andWhere('status=:status', { status: 'ready' })
      .orderBy('distance')
      .getRawOne()

    // push to driver
    if (driver && driver.pushToken) {
      const result = await messaging().send({
        token: driver.pushToken,
        notification: {
          title: '이송 요청',
          body: `${departure.name}에서 이송을 요청했습니다.`,
        },
        data: { orderId: String(order.id) },
        android: {
          notification: {
            channelId: 'riders',
            vibrateTimingsMillis: [0, 500, 500, 500],
            priority: 'high',
            defaultVibrateTimings: false,
          },
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

      console.log({ result })
    }

    const hero = await userRepository
      .createQueryBuilder()
      .select(`*, st_distance_sphere(location, st_geomfromtext('${storedDeparture?.point}', 4326)) as distance`)
      .where('role=:role', { role: UserRole.HERO })
      .andWhere('status=:status', { status: 'ready' })
      .orderBy('distance')
      .getRawOne()

    if (hero && hero.pushToken) {
      const result = await messaging().send({
        token: hero.pushToken,
        notification: {
          title: '이송 요청',
          body: `${departure.name}에서 이송을 요청했습니다.`,
        },
        data: { orderId: String(order.id) },
        android: {
          notification: {
            channelId: 'riders',
            vibrateTimingsMillis: [0, 500, 500, 500],
            priority: 'high',
            defaultVibrateTimings: false,
          },
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

      console.log({ result })
    }

    // 가까운 driver 선정, push 보내기
    // const driver = await userRepository.createQueryBuilder('driver')
    //   .where()

    // 가까운 hero 선정, push 보내기

    return res.json(order)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
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

router.post('/', user, auth, makeOrder)
router.get('/:id', user, auth, getOrder)

export default router
