import express, { Request, Response } from 'express'
import path from 'path'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import multer from 'multer'
import User from '../entities/User'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import fs from 'fs'
import { certRepository, userRepository } from '../db/repositories'
import BadRequestError from '../errors/BadRequestError'
import Certification from '../entities/Certification'
import { UserRole } from '../types/user'
import ForbiddenError from '../errors/ForbiddenError'
import notifyByPush from '../lib/push'

const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const router = express.Router()

const upload = multer({
  storage: multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, path.join(__dirname, '../uploads'))
    },
    filename: function (_req, file, cb) {
      cb(null, file.originalname)
    },
  }),
})

const handlePostUpload = async (req: Request, res: Response) => {
  try {
    console.log({ file: req.file, body: req.body, headers: req.headers })
    const file = req.file
    if (!file) throw new BadRequestError('file not found')

    const { licenseNumber } = req.body
    if (!licenseNumber) throw new BadRequestError('no license number')

    const user = res.locals.user as User
    const imageUrl = `${process.env.API_URL}/uploads/${file.originalname}`

    const storedCert = await certRepository.findOneBy({ user: { id: user.id } })
    if (storedCert) {
      storedCert.licenseNumber = licenseNumber
      storedCert.imageUrl = imageUrl
      storedCert.status = 'verifying'

      await certRepository.save(storedCert)

      return res.json(storedCert)
    }

    const cert = new Certification({
      type: user.role,
      licenseNumber,
      imageUrl,
      status: 'verifying',
      user,
    })

    await certRepository.save(cert)

    return res.json(cert)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handleGetCheck = async (_req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    const cert = await certRepository.findOneBy({ user: { id: user.id } })

    if (!cert) return res.json({ certStatus: 'not-registered' })

    return res.json({ certStatus: cert.status })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handlePostEvaluate = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    const { heroId, certStatus } = req.body
    if (!heroId || !certStatus) throw new BadRequestError('heroId, certStatus')

    if (user.role !== UserRole.ADMIN) throw new ForbiddenError('admin only')

    // const cert = await certRepository.findOneOrFail({ where: { id: Number(certId) }, relations: { user: true } })
    // cert.status = certStatus
    // await certRepository.save(cert)
    const hero = await userRepository.findOneOrFail({
      where: { id: Number(heroId) },
      relations: { certification: true },
    })

    if (!hero) throw new BadRequestError('hero not found')

    const cert = hero.certification
    cert.status = certStatus

    await certRepository.save(cert)

    const body =
      certStatus === 'accepted'
        ? `제출하신 자격증이 승인되었습니다. ${hero.name}님의 멋진 히어로 활동을 응원할게요!`
        : `${hero.name}님이 제출하신 자격증이 거절되었습니다. 자격정보를 확인후 다시 등록해 주세요`

    if (hero.pushToken) {
      notifyByPush({
        token: hero.pushToken,
        data: { certificationStatus: cert.status },
        notification: { title: '자격증 검토결과', body },
      })
    }

    return res.json(hero)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

router.post('/evaluate', user, auth, handlePostEvaluate)
// router.post('/evaluate', user, auth, handlePostEvaluate)
router.get('/check', user, auth, handleGetCheck)
router.post('/upload', user, auth, upload.single('image'), handlePostUpload)

export default router
