import { Request, Response, Router } from 'express'
import { profileRepository } from '../db/repositories'
import Profile from '../entities/Profile'
import User from '../entities/User'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import { UserRole } from '../types/user'

const createProfile = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    if (user.role !== UserRole.AGENCY) throw new BadRequestError('agency manager only')

    const { name, licenseNumber, address, phoneNumber, email } = req.body
    if (!name || !licenseNumber || !address || !phoneNumber || !email)
      throw new BadRequestError('every properties are mandatory')

    const profile = new Profile({ name, licenseNumber, address, phoneNumber, email })
    profile.organization = user.organization

    await profileRepository.save(profile)

    return res.json({ success: true, profile })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const getProfiles = async (_req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    if (user.role !== UserRole.AGENCY) throw new BadRequestError('agency manager only')

    const profiles = await profileRepository.find({
      relations: { organization: true },
      where: {
        organization: {
          id: user.organization.id,
        },
      },
    })

    return res.json(profiles)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, licenseNumber, address, phoneNumber, email } = req.body

    const profile = await profileRepository.findOneByOrFail({ id: Number(id) })

    if (name) profile.name = name
    if (licenseNumber) profile.licenseNumber = licenseNumber
    if (address) profile.address = address
    if (phoneNumber) profile.phoneNumber = phoneNumber
    if (email) profile.email = email

    await profileRepository.save(profile)

    return res.json({ success: true, profile })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await profileRepository.softDelete({ id: Number(id) })

    return res.json({ success: true, result })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const getProfile = async (req: Request, res: Response) => {
  try {
    // const user = res.locals.user as User
    const { id } = req.params

    const profile = await profileRepository.findOneByOrFail({ id: Number(id) })

    return res.json(profile)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const router = Router() // /profiles
router.post('/', user, auth, createProfile)
router.get('/', user, auth, getProfiles)
router.get('/:id', user, auth, getProfile)
router.put('/:id', user, auth, updateProfile)
router.delete('/:id', user, auth, deleteProfile)

export default router
