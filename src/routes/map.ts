import express, { Request, Response } from 'express'
import { Raw } from 'typeorm'
import { placeRepository } from '../db/repositories'
import { Coord } from '../types/map'

const router = express.Router()

router.post('/camera', async (req: Request, res: Response) => {
  const { region } = req.body as { region: Coord[] }

  const polygon = `POLYGON((${region.map(spot => `${spot.latitude} ${spot.longitude}`).toString()}))`
  const spots = await placeRepository.findBy({
    point: Raw(point => `MBRIntersects(ST_GeomFromText('${polygon}', 4326), ${point})`),
  })

  return res.json(spots)
})

router.get('/closest', async (_: Request, res: Response) => {
  const closest = await placeRepository
    .createQueryBuilder()
    .select(`*, st_distance_sphere(point, st_geomfromtext('POINT(37.610329 127.037739)', 4326)) as distance`)
    .orderBy('distance')
    .take(3)
    .getRawMany()

  res.send(closest)
})

router.get('/count', async (_: Request, res: Response) => {
  const placeCount = await placeRepository.count()

  res.send({ placeCount })
})

export default router
