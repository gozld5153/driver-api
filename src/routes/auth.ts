import express, { Request, Response } from 'express'
import { userRepository } from '../db/repositories'
import User from '../entities/User'
import faker from '../lib/faker'
import { generateAccessToken, generateRefreshToken } from '../lib/helpers'
import user from '../middlewares/user'
import { LoginRequestDTO, LoginResponseDTO } from '../types/dto'
import jwt from 'jsonwebtoken'
import { messaging } from 'firebase-admin'
import passport from 'passport'
import { IspType, UserRole } from '../types/user'
import cookie from 'cookie'

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

  console.log({ dto: req.body })
  try {
    const existingUser = await userRepository.findOneBy({ role, isp, ispId })

    if (existingUser) {
      const accessToken = generateAccessToken(existingUser)
      const refreshToken = generateRefreshToken(existingUser)

      existingUser.pushToken = pushToken
      await userRepository.save(existingUser)

      return res.json({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        profileImage: existingUser.profileImage,
        accessToken,
        refreshToken,
      })
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

const reportLocation = async (req: Request, res: Response) => {
  const { latitude, longitude } = req.body
  const user: User = res.locals.user

  try {
    user.coord = { latitude, longitude }
    await userRepository.save(user)

    console.log({ locationSavedUser: user })

    return res.status(200)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const reportStatus = async (req: Request, res: Response) => {
  const { status } = req.body
  const user: User = res.locals.user
  try {
    user.status = status
    await userRepository.save(user)

    if (user.pushToken) {
      const result = await messaging().send({
        token: user.pushToken,
        notification: {
          title: '상태변경',
          body: `상태가 ${user.status}로 변경됐습니다.`,
        },
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
            },
          },
        },
      })

      console.log({ result })
    }

    return res.status(200).json({ status })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) throw new Error('token is empty')

    const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!)
    if (!payload || !payload.id) throw new Error('token is invalid')

    const user = await userRepository.findOneBy({ id: payload.id })
    if (!user) throw new Error('cannot find user given token')

    const { id, name, email, coord, profileImage, status } = user

    return res.json({ user: { id, name, email, coord, profileImage, status }, accessToken: generateAccessToken(user) })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

router.post('/report-location', user, reportLocation)
router.post('/report-status', user, reportStatus)
router.get('/avatar', avatar)
router.post('/register', register)
router.post('/login', login)
router.post('/phonetoken', phoneToken)
router.post('/refresh-token', handleRefreshToken)

type oauthResult = {
  email: string
  name: string
  profileImage: string
  role: UserRole
  isp: IspType
  ispId: string
  redirectURL: string
}

const oauthController = async (req: Request, res: Response) => {
  const { role, isp, ispId, email, name, profileImage, redirectURL } = req.user as oauthResult

  console.log({ role, isp, ispId, email, name, profileImage, redirectURL })

  try {
    const existingUser = await userRepository.findOneBy({ role, isp, ispId })

    // user already existed
    if (existingUser) {
      console.log({ existingUser })
      const accessToken = generateAccessToken(existingUser)
      const refreshToken = generateRefreshToken(existingUser)

      res.set('Set-Cookie', [
        cookie.serialize('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600,
          path: '/',
        }),
        cookie.serialize('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600,
          path: '/',
        }),
      ])

      return res.redirect(redirectURL)
    }

    const user = new User({ role, isp, ispId, email, name, profileImage })
    await userRepository.save(user)
    console.log({ user })

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    res.set('Set-Cookie', [
      cookie.serialize('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600,
        path: '/',
      }),
      cookie.serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600,
        path: '/',
      }),
    ])

    return res.redirect(redirectURL)
  } catch (error) {
    return res.redirect(redirectURL)
  }
}

router.get(
  '/google/hospital',
  passport.authenticate('google-hospital', {
    scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email'],
  }),
)
router.get('/google/hospital/callback', passport.authenticate('google-hospital', { session: false }), oauthController)

router.get(
  '/google/agency',
  passport.authenticate('google-agency', {
    scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email'],
  }),
)
router.get('/google/agency/callback', passport.authenticate('google-agency', { session: false }), oauthController)

router.get('/naver/hospital', passport.authenticate('naver-hospital', { session: false }))
router.get('/naver/hospital/callback', passport.authenticate('naver-hospital', { session: false }), oauthController)

router.get('/naver/agency', passport.authenticate('naver-agency', { session: false }))
router.get('/naver/agency/callback', passport.authenticate('naver-agency', { session: false }), oauthController)

router.get('/kakao/hospital', passport.authenticate('kakao-hospital', { session: false }))
router.get('/kakao/hospital/callback', passport.authenticate('kakao-hospital', { session: false }), oauthController)

router.get('/kakao/agency', passport.authenticate('kakao-agency', { session: false }))
router.get('/kakao/agency/callback', passport.authenticate('kakao-agency', { session: false }), oauthController)

const handleMe = async (_req: Request, res: Response) => {
  const user: User = res.locals.user
  try {
    return res.json(user)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

router.get('/me', user, handleMe)

export default router
