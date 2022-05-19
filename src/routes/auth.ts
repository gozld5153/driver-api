import express, { NextFunction, Request, Response } from 'express'
import { organizationRepository, userRepository } from '../db/repositories'
import User from '../entities/User'
import faker from '../lib/faker'
import { generateAccessToken, generateRefreshToken } from '../lib/helpers'
import user from '../middlewares/user'
import { LoginRequestDTO, LoginResponseDTO } from '../types/dto'
import jwt, { TokenExpiredError } from 'jsonwebtoken'
import { messaging } from 'firebase-admin'
import passport from 'passport'
import { IspType, UserRole } from '../types/user'
import auth from '../middlewares/auth'
import Organization from '../entities/Organization'
import bcrypt from 'bcrypt'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'

const router = express.Router()

const handleMe = async (_req: Request, res: Response) => {
  const user: User = res.locals.user
  try {
    return res.json(user)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const login = async (req: Request, res: Response) => {
  const { role, name, email, isp, ispId, profileImage, coord, pushToken }: LoginRequestDTO = req.body

  console.log({ dto: req.body })
  try {
    const foundUser = await userRepository.findOneBy({ role, isp, ispId })

    if (foundUser) {
      const accessToken = generateAccessToken(foundUser)
      const refreshToken = generateRefreshToken(foundUser)

      if (pushToken) {
        foundUser.pushToken = pushToken
        await userRepository.save(foundUser)
      }

      return res.json({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        profileImage: foundUser.profileImage,
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

    console.log(user.pushToken)

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

const handleWebRefreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) throw new Error('token is empty')

    const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!)
    if (!payload || !payload.id) throw new Error('token is invalid')

    const user = await userRepository.findOneBy({ id: payload.id })
    if (!user) throw new Error('cannot find user given token')

    return res.json(generateAccessToken(user))
  } catch (err) {
    console.log(err)

    if (err instanceof TokenExpiredError) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
      return res.status(403).json({ error: err })
    }

    return res.status(403).json({ error: err })
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
    console.log({ err })

    if (err instanceof TokenExpiredError) return res.status(403).json({ error: err })

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleOauth = (req: Request, res: Response, next: NextFunction) => {
  const { isp, role } = req.params
  const options =
    isp === 'google'
      ? {
          scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email'],
        }
      : { session: false }
  const oauthName = `${isp}-${role}`

  const handler = passport.authenticate(oauthName, options)
  handler(req, res, next)
}

const handleOauthCallback = (req: Request, res: Response, next: NextFunction) => {
  const { isp, role } = req.params
  const options = { session: false }
  const oauthName = `${isp}-${role}`

  const handler = passport.authenticate(oauthName, options)
  handler(req, res, next)
}

const oauthController = async (req: Request, res: Response) => {
  type oauthResult = {
    email: string
    name: string
    profileImage: string
    role: UserRole
    isp: IspType
    ispId: string
    redirectURL: string
  }

  const { role, isp, ispId, email, name, profileImage, redirectURL } = req.user as oauthResult

  try {
    let user = await userRepository.findOneBy({ role, isp, ispId })

    if (!user) {
      user = new User({ role, isp, ispId, email, name, profileImage })

      // const organization = await organizationRepository.save({
      //   type: 'hospital',
      //   name: faker.name.firstName() + '병원',
      // })

      // user.organization = organization

      await userRepository.save(user)
    }

    const refreshToken = generateRefreshToken(user)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60,
      path: '/',
    })

    return res.redirect(redirectURL)
  } catch (error) {
    return res.redirect(redirectURL)
  }
}

const logout = (_: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  return res.status(200).json({ success: true })
}

const registerPublicClient = async (req: Request, res: Response) => {
  try {
    const { id, password, name, organization } = req.body
    if (!id || !password || !name || !organization) throw new Error('id, password, name, organization is mandatory')

    const foundUser = await userRepository.findOneBy({ identifier: id })
    if (foundUser) throw new Error('There is a public user with given id')

    const foundOrganization = await organizationRepository.findOneBy({ name: organization })
    if (foundOrganization) throw new Error('There is a organization with given name')

    const newOrganization = new Organization({ name: organization, type: 'hospital' })
    const user = new User({
      identifier: id,
      password,
      name,
      organization: newOrganization,
      profileImage:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgWO8d-CFmENoZg_EF8TlBJ8PDS1PLqyDPFA&usqp=CAU',
      role: UserRole.CLIENT_PUBLIC,
    })
    await userRepository.save(user)

    return res.json(user)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: err.message ?? 'Something went wrong.' })
  }
}

const loginPublicClient = async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body
    if (!id || !password) throw new BadRequestError('id, password is mandatory')

    const user = await userRepository.findOneOrFail({
      where: { identifier: id },
      relations: {
        organization: {
          places: true,
        },
        ordersAsClient: true,
      },
    })
    const match = await bcrypt.compare(password, user.password!)
    if (!match) throw new BadRequestError('wrong password')

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60,
      path: '/',
    })

    return res.json({ user, accessToken })
  } catch (err) {
    return handleErrorAndSendResponse(err, res)
  }
}

router.get('/me', user, auth, handleMe)
router.get('/refresh-token', handleWebRefreshToken)
router.post('/refresh-token', handleRefreshToken)

// for mobile
router.post('/login', login)
router.get('/logout', user, logout)

// for public client
router.post('/public-register', registerPublicClient)
router.post('/public-login', loginPublicClient)

router.post('/report-location', user, reportLocation)
router.post('/report-status', user, reportStatus)

router.get('/avatar', avatar)
router.post('/phonetoken', phoneToken)

// for web oauth
router.get('/:isp/:role', handleOauth)
router.get('/:isp/:role/callback', handleOauthCallback, oauthController)

export default router
