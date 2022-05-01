import express, { Request, Response } from 'express'
import { userRepository } from '../db/repositories'
import User from '../entities/User'
import faker from '../lib/faker'
import { Coord } from '../types/map'
import { IspType, UserRole } from '../types/user'

const router = express.Router()

const register = async (_: Request, res: Response) => {
  // const { properties } = req.params
  try {
    return res.send('register')
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

type LoginDTO = {
  role: UserRole
  name: string
  email: string
  isp: IspType
  ispId: string
  ispProfileImage: string
  coord: Coord
}
const login = async (req: Request, res: Response) => {
  const { role, name, email, isp, ispId, ispProfileImage, coord }: LoginDTO = req.body
  try {
    const existingUser = await userRepository.findOneBy({ role, isp, ispId })

    if (existingUser) {
      // generate JWT
      // return with JWT & profile
      return res.json(existingUser)
    }
    const newUser = new User({ role, name, email, isp, ispId, ispProfileImage, coord })

    await userRepository.save(newUser)

    return res.json(newUser)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}
const avatar = async (_: Request, res: Response) => {
  // const { properties } = req.params
  try {
    const avatar = faker.image.avatar()
    return res.send({ greeting: 'hello', avatar })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const phoneToken = async (req: Request, res: Response) => {
  const { token } = req.body
  try {
    console.log({ token })

    return res.json({ token })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

router.get('/avatar', avatar)
router.post('/register', register)
router.post('/login', login)
router.post('/phonetoken', phoneToken)

export default router
