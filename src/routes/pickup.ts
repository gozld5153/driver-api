import express, { Request, Response } from 'express'
import { orderRepository, userRepository } from '../db/repositories'
import User from '../entities/User'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import notifyByPush from '../lib/push'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import { UserRole } from '../types/user'

const router = express.Router()

const handleRequestPickup = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    if (user.role !== UserRole.HERO) throw new BadRequestError('hero only')

    const { orderId, pickup } = req.body
    if (!orderId) throw new BadRequestError('orderId is mandatory')

    const order = await orderRepository.findOneOrFail({
      relations: {
        driver: {
          organization: true,
        },
      },
      where: {
        id: orderId,
        hero: {
          id: user.id,
        },
      },
    })

    if (!order.driver?.pushToken) throw new Error('driver cannot receive push')

    const title = pickup ? '픽업 요청' : '히어로 배정됨(픽업 없음)'
    const body = pickup ? `${user.name}님이 픽업을 요청했습니다.` : `${user.name}님이 목적지로 직접이동합니다.`

    await notifyByPush({
      token: order.driver.pushToken,
      data: { heroId: String(user.id), pickup: String(pickup) },
      notification: { title, body },
    })

    return res.json({ success: true })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handleGetHero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const hero = await userRepository.findOneByOrFail({ id: Number(id) })

    return res.json(hero)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

router.get('/hero/:id', user, auth, handleGetHero)

router.post('/request', user, auth, handleRequestPickup)

export default router
