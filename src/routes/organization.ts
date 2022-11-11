import { Request, Response, Router } from 'express'
import { Between, In } from 'typeorm'
import { carInfoRepository, orderRepository, organizationRepository, userRepository } from '../db/repositories'
import CarInfo from '../entities/CarInfo'
import { OrderStatus } from '../entities/Order'
import Organization from '../entities/Organization'
import User from '../entities/User'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import { addDays } from '../lib/helpers'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import { UserRole } from '../types/user'

const router = Router()

const registerOrganization = async (req: Request, res: Response) => {
  try {
    const {
      name,
      licenseNumber,
      address,
      profileImage,
      email,
      phoneNumber,
      type,
      certificate,
      affiliation,
      coordinate,
    } = req.body as Partial<Organization>
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
      coordinate,
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

const registerVehicleInfo = async (
  req: Request<any, any, { vehicleNumber: string; type: 'normal' | 'special' }>,
  res: Response,
) => {
  try {
    const user: User = res.locals.user
    const { vehicleNumber, type } = req.body
    const agency = await organizationRepository.findOneByOrFail({ id: user.organization.id })

    const carInfo = new CarInfo({
      certificateNumber: vehicleNumber,
      organization: agency,
      type,
    })

    await carInfoRepository.save(carInfo)

    const vehicleInfo = await carInfoRepository.findBy({
      organization: {
        id: user.organization.id,
      },
    })

    // console.log('agency: ', JSON.stringify(agency, null, 2))
    res.json({ success: true, vehicles: vehicleInfo })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const getVehicleInfo = async (_: Request, res: Response) => {
  try {
    const user: User = res.locals.user

    const vehicleInfo = await carInfoRepository.findBy({
      organization: {
        id: user.organization.id,
      },
    })

    res.json({ vehicleInfo })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('id is mandatory')

    const vehicle = await carInfoRepository.findOneByOrFail({ id: Number(id) })
    await carInfoRepository.softRemove(vehicle)

    return res.json({ message: 'ok', deletedId: id })
  } catch (error) {
    console.log(error)
    return res.status(500)
  }
}

const getDriver = async (_: Request, res: Response) => {
  try {
    const user = res.locals.user
    const drivers = await userRepository.findBy({
      organization: {
        id: user.organization.id,
      },
      role: UserRole.DRIVER,
    })

    res.json({ drivers })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const getDriverSales = async (req: Request<{ driverId: string }>, res: Response) => {
  try {
    const driverId = Number(req.params.driverId)

    const sales = await orderRepository.find({
      where: {
        driver: {
          id: driverId,
        },
        status: OrderStatus.COMPLETED,
      },
      relations: {
        invoice: true,
      },
    })

    const invoice = sales.map(o => o.invoice)
    res.json({ invoice })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const getAllDriverSales = async (
  req: Request<
    { startDate: string; lastDate: string; agencyId: string },
    any,
    any,
    { driverId: string; page: string; listNum: string }
  >,
  res: Response,
) => {
  try {
    const { startDate, lastDate, agencyId } = req.params
    const newStartDate = addDays(startDate, -1)
    const newLastDate = addDays(lastDate, 1)
    const { driverId, page, listNum } = req.query
    let driverIds

    if (!driverId) {
      const drivers = await userRepository.findBy({
        organization: {
          id: Number(agencyId),
        },
        role: UserRole.DRIVER,
      })
      driverIds = drivers.map(d => d.id)
    } else {
      driverIds = [Number(driverId)]
    }

    const orders = await orderRepository.findAndCount({
      where: {
        driver: {
          id: In(driverIds),
        },
        status: OrderStatus.COMPLETED,
        completedAt: Between(new Date(newStartDate), new Date(newLastDate)),
      },
      relations: {
        invoice: true,
        driver: true,
        departure: true,
        destination: true,
      },
      take: Number(listNum),
      skip: Number(listNum) * (Number(page) - 1),
      order: { id: 'DESC' },
    })

    res.json({ orders })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

// /organization
router.post('/register', user, auth, registerOrganization)
router.put('/update', user, auth, updateOrganization)

router.post('/agency/vehicle/register', user, auth, registerVehicleInfo)
router.get('/vehicle', user, auth, getVehicleInfo)
router.delete('/vehicle/:id', user, auth, deleteVehicle)

router.get('/drivers', user, auth, getDriver)

router.get('/sales/:driverId', user, auth, getDriverSales)
router.get('/sales/:startDate/:lastDate/:agencyId', user, auth, getAllDriverSales)

export default router
