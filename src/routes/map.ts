import express, { Request, Response } from 'express'
import { Raw } from 'typeorm'
import { organizationRepository, placeRepository } from '../db/repositories'
import { Coord } from '../types/map'

const router = express.Router()

const camera = async (req: Request, res: Response) => {
  const { region }: { region: Coord[] } = req.body
  try {
    const polygon = `POLYGON((${region.map(coord => `${coord.latitude} ${coord.longitude}`).toString()}))`

    const organization = await organizationRepository.findBy({
      point: Raw(point => `MBRIntersects(ST_GeomFromText('${polygon}', 4326), ${point})`),
      isVerified: true,
      type: 'hospital',
    })

    return res.json(organization)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}
const getClosest = async (_: Request, res: Response) => {
  // const { properties } = req.params
  try {
    const closest = await placeRepository
      .createQueryBuilder()
      .select(`*, st_distance_sphere(point, st_geomfromtext('POINT(37.610329 127.037739)', 4326)) as distance`)
      .orderBy('distance')
      .take(3)
      .getRawMany()

    return res.send(closest)
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}
const count = async (_: Request, res: Response) => {
  // const { properties } = req.params
  try {
    const placeCount = await placeRepository.count()

    return res.send({ placeCount })
  } catch (err) {
    console.log(err)

    return res.status(500).json({ error: 'Something went wrong.' })
  }
}

router.post('/camera', camera)
router.get('/closest', getClosest)
router.get('/count', count)

export default router
