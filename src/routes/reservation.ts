import express, { Request, Response } from 'express'
import { auth } from 'firebase-admin'
import User from '../entities/User'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import user from '../middlewares/user'

const router = express.Router()

const handleCreateReservation = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    const { properties } = req.body
    console.log({ properties, user })

    return res.json()
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

router.post('/', user, auth, handleCreateReservation)

export default router
