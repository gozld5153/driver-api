import express, { Request, Response } from 'express'
import { userRepository } from '../db/repositories'

const router = express.Router()

const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userRepository.find()
    return res.json(users)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

router.post('/users', getUsers)

export default router
