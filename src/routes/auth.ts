import express, { NextFunction, Request, Response } from 'express'
import {
  agreementRepository,
  locationRecordRepository,
  organizationRepository,
  reasonSecessionRepository,
  userRepository,
} from '../db/repositories'
import User from '../entities/User'
import faker from '../lib/faker'
import { generateAccessToken, generateRefreshToken } from '../lib/helpers'
import user from '../middlewares/user'
import { LoginRequestDTO, LoginResponseDTO } from '../types/dto'
import jwt, { TokenExpiredError } from 'jsonwebtoken'
import passport from 'passport'
import { IspType, UserRole } from '../types/user'
import auth from '../middlewares/auth'
import Organization from '../entities/Organization'
import bcrypt from 'bcrypt'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import LocationRecord from '../entities/LocationRecord'
import CryptoJS from 'crypto-js'
import Agreement from '../entities/Agreement'
// *import Bank from '../entities/Bank'
import Certification from '../entities/Certification'
import keyValStore from '../services/keyValStore'
import sendSMS from '../lib/sendSMS'
import ReasonSecession from '../entities/ResonSecession'

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
  const { role, name, email, isp, ispId, profileImage, coord, pushToken, phoneNumber }: LoginRequestDTO = req.body

  console.log({ dto: req.body })
  try {
    const foundUser = await userRepository.findOne({
      where: { role, isp, ispId },
      relations: {
        organization: true,
        certification: true,
      },
    })

    if (foundUser) {
      const accessToken = generateAccessToken(foundUser)
      const refreshToken = generateRefreshToken(foundUser)

      if (pushToken) {
        foundUser.pushToken = pushToken
        await userRepository.save(foundUser)
      }

      return res.json({
        user: foundUser,
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
      phoneNumber,
      profileImage: profileImage ?? faker.image.avatar(),
    })

    await userRepository.save(newUser)

    const accessToken = generateAccessToken(newUser)
    const refreshToken = generateRefreshToken(newUser)

    const responseDTO: LoginResponseDTO = {
      user: newUser,
      accessToken,
      refreshToken,
    }

    return res.json(responseDTO)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleMobileLogin = async (req: Request, res: Response) => {
  const { role, isp, ispId, pushToken }: LoginRequestDTO = req.body

  try {
    const foundUser = await userRepository.findOne({
      where: { role, isp, ispId },
      relations: {
        agreements: true,
        certification: true,
        bank: true,
      },
    })

    if (!foundUser) return res.json({ needToRegister: true })

    const accessToken = generateAccessToken(foundUser)
    const refreshToken = generateRefreshToken(foundUser)

    if (pushToken) {
      foundUser.pushToken = pushToken
      await userRepository.save(foundUser)
    }

    return res.json({
      user: foundUser,
      accessToken,
      refreshToken,
    })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

type RegisterHeroReqDTO = {
  role: UserRole
  name: string
  email: string
  pushToken: string
  coord: {
    latitude: string
    longitude: string
  }
  profileImage: string
  status: 'rest'
  auth: {
    isp: IspType
    ispId: string
  }
  agreements: {
    location: boolean
    service: boolean
    privacy: boolean
    marketing: boolean
  }
  phoneNumber: string
  friendPhoneNumber: string
  bank: {
    bankName: string
    bankAccount: string
  }
  certification: {
    licenseNumber: string
    imageUrl: string
    status: string
  }
}

const registerHero = async (req: Request, res: Response) => {
  const {
    role,
    name,
    email,
    pushToken,
    coord,
    profileImage,
    status,
    auth,
    phoneNumber,
    friendPhoneNumber,
    agreements,
    // *bank,
    certification,
  }: RegisterHeroReqDTO = req.body

  try {
    const user = new User({
      role,
      isp: auth.isp,
      ispId: auth.ispId,
      name,
      email,
      pushToken,
      coord: { latitude: Number(coord.latitude), longitude: Number(coord.longitude) },
      profileImage,
      status,
      phoneNumber,
    })

    if (friendPhoneNumber) {
      const friend = await userRepository.findOneBy({
        phoneNumber: friendPhoneNumber,
      })

      if (friend) user.friend = friend
    }

    const { location, marketing, privacy, service } = agreements
    const agreeLocation = new Agreement({ type: 'location', agreed: location })
    const agreeService = new Agreement({ type: 'service', agreed: service })
    const agreePrivacy = new Agreement({ type: 'privacy', agreed: privacy })
    const agreeMarketing = new Agreement({ type: 'marketing', agreed: marketing })

    user.agreements = []
    user.agreements.push(agreeLocation)
    user.agreements.push(agreeService)
    user.agreements.push(agreePrivacy)
    user.agreements.push(agreeMarketing)

    // *user.bank = new Bank({ bankAccount: bank.bankAccount, bankName: bank.bankName })
    user.certification = new Certification({
      status: 'verifying',
      licenseNumber: certification.licenseNumber,
      imageUrl: certification.imageUrl,
    })

    await userRepository.save(user)

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    return res.json({
      user,
      accessToken,
      refreshToken,
    })
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

export function encryptAES(n: number) {
  const pass = process.env.AES_PASSPHRASE
  if (!pass) return 'CANNOT-ENCRYPT'
  return CryptoJS.AES.encrypt(String(n), pass).toString()
}

export function decryptAES(en: string) {
  const pass = process.env.AES_PASSPHRASE
  if (!pass) return NaN
  const bytes = CryptoJS.AES.decrypt(en, pass)
  const text = bytes.toString(CryptoJS.enc.Utf8)
  return Number(text)
}

const reportLocation = async (req: Request, res: Response) => {
  const { latitude, longitude, platform } = req.body
  const user: User = res.locals.user

  try {
    user.coord = { latitude, longitude }
    await userRepository.save(user)

    // location record
    const record = new LocationRecord({
      userRole: user.role as 'driver' | 'hero',
      latitude: encryptAES(latitude),
      longitude: encryptAES(longitude),
      platform,
      user: user,
    })

    await locationRecordRepository.save(record)

    console.log('location record:', record)

    return res.status(200).send()
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const reportStatus = async (req: Request, res: Response) => {
  const { status, pushToken } = req.body
  const user: User = res.locals.user
  try {
    user.status = status
    user.pushToken = pushToken
    await userRepository.save(user)

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

    return res.status(403).json({ error: err.message })
  }
}

const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) throw new Error('token is empty')

    const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!)
    if (!payload || !payload.id) throw new Error('token is invalid')

    const user = await userRepository.findOne({
      where: { id: payload.id },
      relations: {
        organization: true,
        certification: true,
      },
    })
    if (!user) throw new Error('cannot find user given token')

    return res.json({
      user,
      accessToken: generateAccessToken(user),
    })
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
      maxAge: 1000 * 60 * 60 * 24 * 15,
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
      maxAge: 1000 * 60 * 60 * 24 * 15,
      path: '/',
    })

    return res.json({ user, accessToken })
  } catch (err) {
    return handleErrorAndSendResponse(err, res)
  }
}

const loginAdmin = async (req: Request, res: Response) => {
  const { id, password } = req.body
  try {
    const admin = await userRepository.findOneByOrFail({ identifier: id, role: UserRole.ADMIN })
    const match = await bcrypt.compare(password, admin.password!)
    if (!match) throw new BadRequestError('wrong password')

    const accessToken = generateAccessToken(admin)
    const refreshToken = generateRefreshToken(admin)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 15,
      path: '/',
    })

    return res.json({ admin, accessToken })
  } catch (err) {
    return handleErrorAndSendResponse(err, res)
  }
}

const handleRefreshPushToken = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    const { pushToken } = req.body
    if (!pushToken) throw new BadRequestError('no push token')

    user.pushToken = pushToken
    await userRepository.save(pushToken)

    return res.json(user)
  } catch (error) {
    return handleErrorAndSendResponse(error, res)
  }
}

export const getRandom6Digits = () => Math.floor(100000 + Math.random() * 900000)

const handleRequestPhoneCode = async (req: Request<any, any, { phoneNumber: string }>, res: Response) => {
  try {
    const { phoneNumber } = req.body
    const code = getRandom6Digits()
    await keyValStore.set(phoneNumber, code, 15 * 1000)
    const smsResult = await sendSMS(phoneNumber, `[구출이] 인증번호는 ${code} 입니다.`)

    return res.json({ success: smsResult })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handleAnswerPhoneCode = async (req: Request<any, any, { phoneNumber: string; code: string }>, res: Response) => {
  try {
    const { phoneNumber, code } = req.body
    const storedCode = await keyValStore.get(phoneNumber)

    console.log({ phoneNumber, code, storedCode })

    return res.json({ match: Number(code) === storedCode })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

type RegisterDriverDTO = RegisterHeroReqDTO & { orgId: number }

const registerDriver = async (req: Request, res: Response) => {
  const {
    role,
    name,
    email,
    pushToken,
    coord,
    profileImage,
    status,
    auth,
    phoneNumber,
    agreements,
    orgId,
  }: RegisterDriverDTO = req.body

  try {
    const org = await organizationRepository.findOneBy({ id: orgId })
    if (!org) throw new BadRequestError('There is no organization given id: ' + orgId)

    const user = new User({
      role,
      isp: auth.isp,
      ispId: auth.ispId,
      name,
      email,
      pushToken,
      coord: { latitude: Number(coord.latitude), longitude: Number(coord.longitude) },
      profileImage,
      status,
      phoneNumber,
      organization: org,
    })

    const { location, marketing, privacy, service } = agreements
    const agreeLocation = new Agreement({ type: 'location', agreed: location })
    const agreeService = new Agreement({ type: 'service', agreed: service })
    const agreePrivacy = new Agreement({ type: 'privacy', agreed: privacy })
    const agreeMarketing = new Agreement({ type: 'marketing', agreed: marketing })

    user.agreements = []
    user.agreements.push(agreeLocation)
    user.agreements.push(agreeService)
    user.agreements.push(agreePrivacy)
    user.agreements.push(agreeMarketing)

    await userRepository.save(user)

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    return res.json({
      user,
      accessToken,
      refreshToken,
    })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleSecession = async (_: Request, res: Response) => {
  try {
    const user = res.locals.user

    const findUser = await userRepository.findOneByOrFail({ id: user.id })

    await userRepository.softRemove(findUser)

    res.json('success')
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Something went wrong.' })
  }
}

const handleSecessionReason = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user
    const reason = req.body.reason

    const rs = new ReasonSecession({
      user,
      reason,
    })

    await reasonSecessionRepository.save(rs)
    res.json({ result: rs })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const getMarketingAgree = async (_: Request, res: Response) => {
  try {
    const user = res.locals.user

    const isMarketingAgree = await agreementRepository.findOneByOrFail({ user: { id: user.id }, type: 'marketing' })

    res.json({ isMarketingAgree })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const handleMarketing = async (req: Request<any, any, { value: boolean }>, res: Response) => {
  try {
    const user = res.locals.user
    const { value } = req.body

    const agreement = await agreementRepository.findOneByOrFail({ user: { id: user.id }, type: 'marketing' })

    agreement.agreed = value

    await agreementRepository.save(agreement)

    res.json({ agreement })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const updateProfileImage = async (req: Request<any, any, { profileUrl: string }>, res: Response) => {
  try {
    const user = res.locals.user
    const { profileUrl } = req.body

    const findUser = await userRepository.findOneByOrFail({ id: user.id })

    findUser.profileImage = profileUrl

    await userRepository.save(findUser)

    res.json({ findUser })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

router.get('/me', user, auth, handleMe)
router.get('/refresh-token', handleWebRefreshToken)
router.post('/refresh-token', handleRefreshToken)
router.post('/refresh-push-token', auth, user, handleRefreshPushToken)

// for mobile
router.post('/login', login)
router.get('/logout', user, logout)

router.post('/login-hero', handleMobileLogin)
router.post('/login-driver', handleMobileLogin)

router.post('/register-hero', registerHero)
router.post('/register-driver', registerDriver)

router.post('/request-phone-code', handleRequestPhoneCode)
router.post('/answer-phone-code', handleAnswerPhoneCode)

router.get('/secession', user, auth, handleSecession)
router.post('/secession/reason', user, auth, handleSecessionReason)

router.get('/agree', user, auth, getMarketingAgree)
router.put('/marketing', user, auth, handleMarketing)

router.put('/profile-image', user, auth, updateProfileImage)

// for public client
router.post('/public-register', registerPublicClient)
router.post('/public-login', loginPublicClient)
router.post('/admin-login', loginAdmin)

router.post('/report-location', user, reportLocation)
router.post('/report-status', user, reportStatus)

router.get('/avatar', avatar)
router.post('/phonetoken', phoneToken)

// for web oauth
router.get('/:isp/:role', handleOauth)
router.get('/:isp/:role/callback', handleOauthCallback, oauthController)

export default router
