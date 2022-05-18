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
      where: { role: UserRole.CLIENT },
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

const getOrganization = async (_req: Request, res: Response) => {
  try {
    const organizations = await organizationRepository.find({ relations: { users: true, places: true } })

    return res.json(organizations)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getPlaces = async (_req: Request, res: Response) => {
  try {
    const places = await placeRepository.find()

    return res.json(places)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await orderRepository.find()

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
router.get('/orders', getOrders)
router.get('/offers', getOffers)

export default router
