import express, { Request, Response } from 'express'
import { orderRepository } from '../db/repositories'
import { OrderStatus } from '../entities/Order'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import notifyByPush from '../lib/push'
import auth from '../middlewares/auth'
import user from '../middlewares/user'

const router = express.Router()

const handleStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body

    const order = await orderRepository.findOneOrFail({
      where: { id: orderId },
      relations: {
        driver: true,
      },
    })
    order.status = status
    const savedOrder = await orderRepository.save(order)

    // data: { timeoutOfferId: String(offer.id) },
    // notification: { title: '시간초과로 취소되었습니다.', body: `offerId: ${offer.id}` },
    const statusString =
      order.status === OrderStatus.LOADED
        ? '환자탑승'
        : order.status === OrderStatus.ARRIVED
        ? '목적지 도착'
        : order.status === OrderStatus.COMPLETED
        ? '완료'
        : '알 수 없는 이송상태'

    const body = `${user.name}님이 이송상태를 ${statusString}(으)로 변경했습니다`

    notifyByPush({
      token: order.driver.pushToken,
      data: { transferStatus: savedOrder.status },
      notification: { title: `이송상태 변경됨`, body },
    })
    // push to driver
    console.log({ orderId: savedOrder.id, status: savedOrder.status })

    return res.json(savedOrder)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

router.post('/status', user, auth, handleStatus)

export default router
