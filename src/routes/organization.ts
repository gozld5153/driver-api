import { Request, Response, Router } from 'express'
import { carInfoRepository, organizationRepository, userRepository } from '../db/repositories'
import CarInfo from '../entities/CarInfo'
import Organization from '../entities/Organization'
import User from '../entities/User'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import { UserRole } from '../types/user'

const router = Router()

const registerOrganization = async (req: Request, res: Response) => {
  try {
    const { name, licenseNumber, address, profileImage, email, phoneNumber, type, certificate, affiliation } =
      req.body as Partial<Organization>
    if (!name || !licenseNumber || !address || !email || !phoneNumber || !type)
      throw new BadRequestError('name, licenseNumber, address, profileImage, email, phoneNumber, type is mandatory')

    const user = res.locals.user as User
    if (type === 'agency' && user.role !== UserRole.AGENCY)
      throw new BadRequestError('only agency manager can register the organization')

    if (type === 'hospital' && user.role !== UserRole.CLIENT_MANAGER)
      throw new BadRequestError('only hospital manager can register the organization')

    const foundOrg = await organizationRepository.findOneBy({
      name,
      licenseNumber,
      address,
      profileImage,
      email,
      phoneNumber,
      type,
    })
    if (foundOrg) throw new BadRequestError('the organization already exists')

    const org = new Organization({
      name,
      licenseNumber,
      address,
      profileImage,
      email,
      phoneNumber,
      type,
      certificate,
      affiliation,
    })
    await organizationRepository.save(org)

    user.organization = org
    await userRepository.save(user)

    return res.json({ success: true, organization: org })
  } catch (err) {
    console.log(err)
    return handleErrorAndSendResponse(err, res)
  }
}

const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id, name, licenseNumber, address, phoneNumber, email, type, certificate, affiliation } = req.body
    if (!id) throw new BadRequestError('id is mandatory')

    const user = res.locals.user as User
    if (type === 'agency' && user.role !== UserRole.AGENCY)
      throw new BadRequestError('only agency manager can update the organization')

    if (type === 'hospital' && user.role !== UserRole.CLIENT_MANAGER)
      throw new BadRequestError('only hospital manager can update the organization')

    const org = await organizationRepository.findOneBy({ id })
    if (!org) throw new BadRequestError('cannot find the organization with given id')

    if (name) org.name = name
    if (licenseNumber) org.licenseNumber = licenseNumber
    if (address) org.address = address
    if (phoneNumber) org.phoneNumber = phoneNumber
    if (email) org.email = email
    if (certificate) org.certificate = certificate
    if (affiliation) org.affiliation = affiliation

    await organizationRepository.save(org)

    return res.json({ success: true, organization: org })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const registerVichelInfo = async (req: Request<any, any, { vichelNumber: string }>, res: Response) => {
  try {
    const user: User = res.locals.user
    const { vichelNumber } = req.body
    const agency = await organizationRepository.findOneByOrFail({ id: user.organization.id })

    const carInfo = new CarInfo({
      certificateNumber: vichelNumber,
      organization: agency,
    })

    await carInfoRepository.save(carInfo)

    console.log('agency: ', JSON.stringify(agency, null, 2))
    res.json({ success: true })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const getVichelInfo = async (_: Request, res: Response) => {
  try {
    const user: User = res.locals.user

    const vichelInfo = await carInfoRepository.findBy({
      organization: {
        id: user.organization.id,
      },
    })

    res.json({ vichelInfo })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

// /organization
router.post('/register', user, auth, registerOrganization)
router.put('/update', user, auth, updateOrganization)

router.post('/agency/vichel/register', user, auth, registerVichelInfo)
router.get('/vichel', user, auth, getVichelInfo)

export default router
