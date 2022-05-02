import express, { Request, Response } from 'express'
import { userRepository } from '../db/repositories'
import User from '../entities/User'
import faker from '../lib/faker'
import { generateAccessToken, generateRefreshToken } from '../lib/helpers'
import { LoginRequestDTO, LoginResponseDTO } from '../types/dto'

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

const login = async (req: Request, res: Response) => {
  const { role, name, email, isp, ispId, profileImage, coord, pushToken }: LoginRequestDTO = req.body
  try {
    const existingUser = await userRepository.findOneBy({ role, isp, ispId })

    if (existingUser) {
      const accessToken = generateAccessToken(existingUser)
      const refreshToken = generateRefreshToken(existingUser)

      return res.json({ id: existingUser.id, name, email, accessToken, refreshToken })
    }

    const newUser = new User({
      role,
      name,
      email,
      isp,
      ispId,
      coord,
      pushToken,
      profileImage: profileImage ?? faker.image.avatar(),
    })

    await userRepository.save(newUser)

    const accessToken = generateAccessToken(newUser)
    const refreshToken = generateRefreshToken(newUser)

    const responseDTO: LoginResponseDTO = {
      id: newUser.id,
      name,
      email,
      accessToken,
      refreshToken,
      profileImage: newUser.profileImage,
    }

    return res.json(responseDTO)
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
