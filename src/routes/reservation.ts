import express, { Request, Response } from 'express'
import User from '../entities/User'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import user from '../middlewares/user'
import auth from '../middlewares/auth'
import { placeRepository, reservationRepository } from '../db/repositories'
import Place from '../entities/Place'

const router = express.Router()

type ReservationPlace = {
  name: string
  latitude: number
  longitude: number
  point: string
  address: string
  roadAddress: string
}
type CreateReservationDTO = {
  isEvent: boolean
  dueDate: string
  dueEndDate?: string
  d1: ReservationPlace
  d2?: ReservationPlace
  fee: number
  comment: string
}
const handleCreateReservation = async (req: Request<{}, {}, { reservation: CreateReservationDTO }>, res: Response) => {
  try {
    const user = res.locals.user as User
    const { reservation: _res } = req.body

    const departure = await placeRepository.save(new Place({ ..._res.d1, id: undefined }))
    const destination = _res.d2 ? await placeRepository.save(new Place({ ..._res.d2, id: undefined })) : departure
    const dueDate = new Date(_res.dueDate)
    const dueEndDate = _res.dueEndDate ? new Date(_res.dueEndDate) : dueDate

    const reservation = await reservationRepository.save({
      isEvent: _res.isEvent,
      fee: _res.fee,
      comment: _res.comment,
      dueDate,
      dueEndDate,
      departure,
      destination,
      driver: user,
    })

    return res.json({ success: true, reservation })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handleGetReservations = async (_req: Request, res: Response) => {
  try {
    const reservations = await reservationRepository.find({
      relations: ['driver', 'departure', 'destination'],
      order: { createdAt: 'DESC' },
    })

    return res.json({ reservations })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

router.get('/', user, auth, handleGetReservations)
router.post('/', user, auth, handleCreateReservation)

export default router
