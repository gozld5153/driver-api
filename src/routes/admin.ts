import express, { Request, Response } from 'express'
import {
  invitationRepository,
  locationQueryRepository,
  locationRecordRepository,
  organizationRepository,
  userRepository,
} from '../db/repositories'
import LocationQuery from '../entities/LocationQuery'
import Organization from '../entities/Organization'
import User from '../entities/User'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import admin from '../middlewares/admin'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import { UserRole } from '../types/user'
import { decryptAES } from './auth'

const router = express.Router()

const getOrganizations = async (req: Request, res: Response) => {
  try {
    const { type } = req.params
    if (!type) throw new BadRequestError('type is mandatory')

    const agencies = await organizationRepository.find({ where: { type: type as any }, relations: { partners: true } })

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
    const organization = await organizationRepository.findOneOrFail({
      where: { id: Number(id), type: type as any },
      relations: { partners: true },
    })

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
    const { id, password } = req.body as { id: string; password: string }
    const { name, licenseNumber, address, profileImage, email, phoneNumber, coordinate, affiliation } =
      req.body as Partial<Organization>
    if (!type || !name || !licenseNumber || !address || !email || !phoneNumber || !affiliation)
      throw new BadRequestError(
        'type, name, licenseNumber, address, profileImage, email, phoneNumber, type, affiliation is mandatory',
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
      coordinate,
      affiliation,
      type: type as any,
      isVerified: false,
    })
    await organizationRepository.save(org)

    if (type === 'hospital') {
      const publicClient = new User({
        identifier: id,
        name,
        password,
        role: UserRole.CLIENT_PUBLIC,
        organization: org,
      })

      await userRepository.save(publicClient)
    }

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
      relations: { organization: true, certification: true },
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

    const users = await userRepository.find({
      where: { role: role as UserRole },
      relations: {
        organization: true,
        certification: true,
      },
    })

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

const handleGetLocationRecords = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    const query = new LocationQuery({ user, ip: ip?.toString() ?? 'IP-MISSING' })
    await locationQueryRepository.save(query)

    const records = await locationRecordRepository.find({ relations: { user: true } })
    const decrypted = records.map(record => ({
      ...record,
      latitude: decryptAES(record.latitude),
      longitude: decryptAES(record.longitude),
    }))

    return res.json(decrypted)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handleGetLocationQueries = async (_req: Request, res: Response) => {
  try {
    const queries = await locationQueryRepository.find({ relations: { user: true } })
    return res.json(queries)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const updatePartners = async (req: Request<any, any, { partnersId: number; hospitalId: number }>, res: Response) => {
  try {
    const { partnersId, hospitalId } = req.body

    const hospital = await organizationRepository.findOneOrFail({
      where: { id: hospitalId },
      relations: { partners: true },
    })

    if (partnersId === 0 && !hospital.partners) return res.json({ hospital })

    if (partnersId === 0 && hospital.partners) {
      const agency = await organizationRepository.findOneByOrFail({ id: hospital.partners.id })

      hospital.partners = null
      agency.partners = null

      await organizationRepository.save(hospital)
      await organizationRepository.save(agency)
      return res.json({ hospital })
    }

    const agency = await organizationRepository.findOneByOrFail({ id: partnersId })
    hospital.partners = agency

    const newHospital = await organizationRepository.findOneByOrFail({ id: hospitalId })
    agency.partners = newHospital
    await organizationRepository.save(hospital)
    await organizationRepository.save(agency)
    return res.json({ hospital })
  } catch (err) {
    console.log(err)
    return res.status(500)
  }
}

type ArrDrivers = User & { distancd: number }

const getDrivers = async (_req: Request, res: Response) => {
  try {
    const user: User = res.locals.user

    const hospital = await organizationRepository.findOneByOrFail({
      id: user.organization.id,
    })

    const drivers: ArrDrivers[] = await userRepository
      .createQueryBuilder('user')
      .select(`*, st_distance_sphere(user.location, st_geomfromtext('${hospital.point}', 4326)) as distance`)
      .where({ role: UserRole.DRIVER })
      .andWhere({ status: 'ready' })
      .andWhere(`st_distance_sphere(user.location, st_geomfromtext('${hospital.point}', 4326)) <= 10000`)
      .orderBy('distance')
      .getRawMany()

    console.log({ drivers })
    res.json({ drivers })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

router.get('/locations/records', user, auth, admin, handleGetLocationRecords)
router.get('/locations/queries', user, auth, admin, handleGetLocationQueries)

router.get('/organizations/:type/:id/invitations', getInvitations)
router.get('/users/:role', getUsers)
router.get('/users/:role/:id', getUser)

// router.get('/organizations/:type/invitations', user, auth, admin, getInvitations)
router.get('/organizations/:type/:id', user, auth, admin, getOrganization)
router.get('/organizations/:type', user, auth, admin, getOrganizations)
router.put('/organizations/:type/update', user, auth, admin, updateOrganization)
router.post('/organizations/:type/register', user, auth, admin, registerOrganization)

router.put('/partners', user, auth, admin, updatePartners)

router.get('/drivers', user, auth, getDrivers)

// router.get('/users/:role', user, auth,admin, getUsers)

export default router
