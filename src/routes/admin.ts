import express, { Request, Response } from 'express'
import { invitationRepository, organizationRepository, userRepository } from '../db/repositories'
import Organization from '../entities/Organization'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import admin from '../middlewares/admin'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import { UserRole } from '../types/user'

const router = express.Router()

const getOrganizations = async (req: Request, res: Response) => {
  try {
    const { type } = req.params
    if (!type) throw new BadRequestError('type is mandatory')

    const agencies = await organizationRepository.findBy({ type: type as any })

    return res.json(agencies)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const getOrganization = async (req: Request, res: Response) => {
  try {
    const { id, type } = req.params
    if (!id || !type) throw new BadRequestError('id, type is mandatory')
    const organization = await organizationRepository.findOneByOrFail({ id: Number(id), type: type as any })

    return res.json(organization)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { type } = req.params
    const { id, name, licenseNumber, profileImage, email, phoneNumber, address, isVerified } = req.body

    if (!id || !type) throw new BadRequestError('id, type is mandatory')

    const organization = await organizationRepository.findOneByOrFail({ id: Number(id), type: type as any })

    if (name) organization.name = name
    if (licenseNumber) organization.licenseNumber = licenseNumber
    if (profileImage) organization.profileImage = profileImage
    if (email) organization.email = email
    if (phoneNumber) organization.phoneNumber = phoneNumber
    if (address) organization.address = address
    if (isVerified !== undefined) organization.isVerified = isVerified

    console.log({ organization })

    await organizationRepository.save(organization)

    return res.json({ success: true, organization })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const registerOrganization = async (req: Request, res: Response) => {
  try {
    const { type } = req.params
    const { name, licenseNumber, address, profileImage, email, phoneNumber } = req.body as Partial<Organization>
    if (!type || !name || !licenseNumber || !address || !email || !phoneNumber)
      throw new BadRequestError(
        'type, name, licenseNumber, address, profileImage, email, phoneNumber, type is mandatory',
      )

    const foundOrg = await organizationRepository.findOneBy({
      name,
      licenseNumber,
      address,
      profileImage,
      email,
      phoneNumber,
      type: type as any,
    })
    if (foundOrg) throw new BadRequestError('the organization already exists')

    const org = new Organization({
      name,
      licenseNumber,
      address,
      profileImage,
      email,
      phoneNumber,
      type: type as any,
      isVerified: false,
    })
    await organizationRepository.save(org)

    return res.json({ success: true, organization: org })
  } catch (err) {
    console.log(err)
    return handleErrorAndSendResponse(err, res)
  }
}

const getUser = async (req: Request, res: Response) => {
  try {
    const { role, id } = req.params

    const users = await userRepository.findOneOrFail({
      where: { role: role as UserRole, id: Number(id) },
      relations: { organization: true },
    })

    return res.json(users)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const getUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.params

    const users = await userRepository.find({ where: { role: role as UserRole }, relations: { organization: true } })

    return res.json(users)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const getInvitations = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params
    const invitations = await invitationRepository.find({
      // relations: { organization: true },
      where: {
        organization: {
          type: type as any,
          id: id as any,
        },
      },
    })

    return res.json(invitations)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

router.get('/organizations/:type/:id/invitations', getInvitations)
router.get('/users/:role', getUsers)
router.get('/users/:role/:id', getUser)

// router.get('/organizations/:type/invitations', user, auth, admin, getInvitations)
router.get('/organizations/:type/:id', user, auth, admin, getOrganization)
router.get('/organizations/:type', user, auth, admin, getOrganizations)
router.put('/organizations/:type/update', user, auth, admin, updateOrganization)
router.post('/organizations/:type/register', user, auth, admin, registerOrganization)

// router.get('/users/:role', user, auth,admin, getUsers)

export default router
