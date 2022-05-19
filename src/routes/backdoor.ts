import express, { Request, Response } from 'express'
import {
  offerRepository,
  orderRepository,
  organizationRepository,
  placeRepository,
  userRepository,
} from '../db/repositories'
import { UserRole } from '../types/user'

const router = express.Router()

const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userRepository.find()
    return res.json(users)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getClients = async (_req: Request, res: Response) => {
  try {
    const clients = await userRepository.find({
      where: [{ role: UserRole.CLIENT }, { role: UserRole.CLIENT_PUBLIC }],
      order: { id: 'desc' },
      relations: {
        ordersAsClient: true,
        organization: true,
      },
    })
    return res.json(clients)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getDrivers = async (_req: Request, res: Response) => {
  try {
    const drivers = await userRepository.find({
      where: { role: UserRole.DRIVER },
      order: { id: 'desc' },
      relations: {
        ordersAsDriver: true,
        organization: true,
      },
    })
    return res.json(drivers)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}
const getHeros = async (_req: Request, res: Response) => {
  try {
    const heros = await userRepository.find({
      where: { role: UserRole.HERO },
      order: { id: 'desc' },
      relations: {
        ordersAsHero: true,
        organization: true,
      },
    })
    return res.json(heros)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getOrganization = async (_req: Request, res: Response) => {
  try {
    const organizations = await organizationRepository.find({
      relations: { users: true, places: true },
      order: {
        id: 'DESC',
      },
    })

    return res.json(organizations)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getPlaces = async (_req: Request, res: Response) => {
  try {
    const places = await placeRepository.find({
      order: { id: 'desc' },
      relations: {
        organization: true,
        ordersAsArrival: true,
        ordersAsDepature: true,
      },
    })

    return res.json(places)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await orderRepository.find({
      relations: {
        client: {
          organization: true,
        },
        departure: true,
        destination: true,
        offers: {
          user: true,
        },
      },
    })

    return res.json(orders)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await offerRepository.find()

    return res.json(offers)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

router.post('/users', getUsers)
router.get('/organizations', getOrganization)
router.get('/Places', getPlaces)
router.get('/users', getUsers)
router.get('/clients', getClients)
router.get('/drivers', getDrivers)
router.get('/heros', getHeros)
router.get('/orders', getOrders)
router.get('/offers', getOffers)

export default router
