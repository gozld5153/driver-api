import express, { Request, Response } from 'express'
import { placeRepository } from '../db/repositories'
import Organization from '../entities/Organization'
import Place from '../entities/Place'
import faker from '../lib/faker'

const router = express.Router()

const insertBulkplaces = async (req: Request, res: Response) => {
  const { quantity } = req.params
  try {
    const places = await createBulkPlaces(parseInt(quantity))

    await placeRepository.save(places)

    return res.send(places)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

router.get('/bulk/:quantity', insertBulkplaces)

export default router

async function createBulkPlaces(quantity: number) {
  const places: Place[] = []

  for (let i = 0; i < quantity; i++) {
    const coord = getRandomCoord()

    const name = faker.name.firstName() + '병원'

    const organization = new Organization({
      type: 'hospital',
      name,
    })

    const place = new Place({
      longitude: coord.longitude,
      latitude: coord.latitude,
      name,
      organization,
    })

    places.push(place)
  }

  return places
}

function getRandomCoord() {
  const minX = 126.72182081983624
  const minY = 36.891665362714306
  const maxX = 127.25712426219445
  const maxY = 37.8125227396323

  const dx = maxX - minX
  const dy = maxY - minY

  const x = minX + dx * Math.random()
  const y = minY + dy * Math.random()

  return { longitude: x, latitude: y }
}
