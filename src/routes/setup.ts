import faker from '@faker-js/faker/locale/ko'
import express, { Request, Response } from 'express'
import { placeRepository } from '../db/repositories'
import Place from '../entities/Place'

const router = express.Router()

router.get('/bulk/:quantity', async (req: Request, res: Response) => {
  const { quantity } = req.params
  const places = await getBulkPlaces(parseInt(quantity))
  // await Place.save(places, { chunk: places.length / 1000 })
  await placeRepository.save(places)
  res.send(places)
})

router.get('/', (_: Request, res: Response) => {
  const avatar = faker.image.avatar()
  res.send({ greeting: 'hello', avatar })
})

export default router

async function getBulkPlaces(howmany: number) {
  const places: Place[] = []
  for (let i = 0; i < howmany; i++) {
    const newSpot = getRandomSpot()
    const place = new Place()
    place.longitude = newSpot.longitude
    place.latitude = newSpot.latitude
    place.name = faker.name.firstName() + '병원'
    places.push(place)
  }

  return places
}

function getRandomSpot() {
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
