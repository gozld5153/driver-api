import express, { Request, Response } from 'express'
import { invoiceRepository, orderRepository } from '../db/repositories'
import { OrderStatus } from '../entities/Order'
import User from '../entities/User'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import notifyByPush from '../lib/push'
import auth from '../middlewares/auth'
import user from '../middlewares/user'

const router = express.Router()

const handlePostTotalFee = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    const { fee, orderId } = req.body

    const order = await orderRepository.findOneOrFail({
      where: { id: orderId },
      relations: { hero: true, invoice: true },
    })
    order.status = OrderStatus.FEE_REQUESTED
    await orderRepository.save(order)

    if (order.invoice) {
      order.invoice.totalFee = fee
      order.invoice.driverFee = fee * 0.8
      order.invoice.heroFee = fee * 0.2
      order.invoice.goochooriFee = fee * 0

      await invoiceRepository.save(order.invoice)
    }

    // save invoice
    const invoice =
      order.invoice ??
      (await invoiceRepository.save({
        type: 'driver-hero',
        totalFee: fee,
        driverFee: fee * 0.8,
        heroFee: fee * 0.2,
        goochooriFee: fee * 0,
        transferStartedAt: order.departedAt ?? order.loadedAt,
        transferFinishedAt: order.arrivedAt,
        order,
      }))

    if (!order.hero.pushToken) throw new Error('cannot find hero')

    // push invoice to hero
    notifyByPush({
      token: order.hero.pushToken,
      data: { invoiceId: String(invoice.id) },
      notification: { title: `이송료 확인`, body: `${user.name}님이 이송료를 입력했습니다` },
    })

    return res.json(invoice)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handlePostConfirmFee = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    const { orderId } = req.body
    console.log({ orderId, user })

    const order = await orderRepository.findOneOrFail({
      where: { id: Number(orderId) },
      relations: { driver: true, invoice: true },
    })
    order.feeCaculatedAt = new Date()
    order.status = OrderStatus.COMPLETED
    await orderRepository.save(order)

    order.invoice.calculatedAt = new Date()
    await invoiceRepository.save(order.invoice)

    if (!order.driver.pushToken) throw new BadRequestError('no driver find')

    // push to driver
    notifyByPush({
      token: order.driver.pushToken,
      data: { completedOrderId: String(order.id) },
      notification: { title: `이송 종료`, body: `${user.name}님과 함께한 이송 업무가 종료됐습니다.` },
    })

    return res.json(order)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handleGetInvoice = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params
    console.log({ invoiceId })

    const invoice = await invoiceRepository.findOneByOrFail({ id: Number(invoiceId) })

    return res.json(invoice)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handlePostSoloComplete = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    const { orderId, fee } = req.body

    const order = await orderRepository.findOneOrFail({
      where: { id: Number(orderId) },
      relations: { invoice: true },
    })

    order.invoice.totalFee = fee
    order.invoice.driverFee = fee - 3000
    order.invoice.goochooriFee = 3000
    order.invoice.transferStartedAt = order.loadedAt
    order.invoice.transferFinishedAt = order.arrivedAt
    order.invoice.calculatedAt = new Date()

    const savedInvoice = await invoiceRepository.save(order.invoice)

    order.feeRequestedAt = new Date()
    order.feeCaculatedAt = new Date()
    order.status = OrderStatus.COMPLETED

    const savedOrder = await orderRepository.save(order)

    notifyByPush({
      token: user.pushToken,
      data: { completedOrderId: String(savedOrder.id) },
      notification: { title: '이송 완료', body: '수고하셨습니다. 이송이 정상적으로 완료되었습니다.' },
    })

    const { feeRequestedAt, feeCaculatedAt, completedAt } = savedOrder
    console.log({ feeRequestedAt, feeCaculatedAt, completedAt })

    return res.json({ order: savedOrder, invoice: savedInvoice })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

router.post('/solo', user, auth, handlePostSoloComplete)
router.post('/total-fee', user, auth, handlePostTotalFee)
router.get('/invoice/:invoiceId', user, auth, handleGetInvoice)
router.post('/confirm-fee', user, auth, handlePostConfirmFee)

export default router
