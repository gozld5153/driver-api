import express, { Request, Response } from 'express'
import { organizationRepository, placeRepository, userRepository } from '../db/repositories'
import Place from '../entities/Place'
import User from '../entities/User'
import auth from '../middlewares/auth'
// import User from '../entities/User'
import user from '../middlewares/user'

const router = express.Router()

const getPlaces = async (_req: Request, res: Response) => {
  try {
    const places = await placeRepository.find()

    res.json(places)
  } catch (error) {
    console.log({ error })
  }
}

const addPlace = async (req: Request, res: Response) => {
  // const user: User = res.locals.user
  const { name, latitude, longitude, type } = req.body

  if (!name || !latitude || !longitude || !type) throw new Error('name, latitude, longitude is mandatory')
  try {
    const place = new Place({ name, latitude, longitude, type })
    await placeRepository.save(place)
    return res.json(place)
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ error })
  }
}

const reportOrganizationLocation = async (req: Request, res: Response) => {
  const { latitude, longitude } = req.body
  const { id }: User = res.locals.user
  try {
    const user = await userRepository.findOne({
      where: { id },
      relations: {
        organization: {
          places: true,
        },
      },
    })

    const organization = user?.organization
    organization?.places?.push(new Place({ name: organization?.name, latitude, longitude }))

    if (organization) await organizationRepository.save(organization)

    console.log({ organization })
    return res.json(organization)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

const getOrganization = async (_req: Request, res: Response) => {
  const user: User = res.locals.user

  try {
    const foundUser = await userRepository.findOne({
      where: { id: user.id },
      relations: { organization: { places: true } },
    })

    return res.json(foundUser?.organization)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

router.get('/', getPlaces)
router.get('/organization', user, auth, getOrganization)
router.post('/report-organization-location', user, auth, reportOrganizationLocation)
router.post('/add', user, auth, addPlace)

export default router
