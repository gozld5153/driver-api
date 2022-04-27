import dotenv from 'dotenv'
dotenv.config()
import express, { Request, Response, urlencoded } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { LessThan, Raw } from 'typeorm'

import dataSource from './data-source'
import Place from './entities/Place'

const app = express()
const PORT = process.env.PORT || 5030

app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(cors())
app.use(urlencoded({ extended: false }))

const placeRepository = dataSource.getRepository(Place)

function getRandomSpot() {
  const minX = 126.85197
  const maxX = 128.37172
  const maxY = 37.690873
  const minY = 35.370498

  const dx = maxX - minX
  const dy = maxY - minY

  const x = minX + dx * Math.random()
  const y = minY + dy * Math.random()

  return { longitude: x, latitude: y }
}

type pointType = { latitude: number; longitude: number }

function generatePolygon(p1: pointType, p2: pointType) {
  return `MULTIPOINT(${p1.latitude} ${p1.longitude}, ${p2.latitude} ${p2.longitude})`
}

async function bulkInsert(howmany: number) {
  const places: Place[] = []
  for (let i = 0; i < howmany; i++) {
    const newSpot = getRandomSpot()
    const place = new Place()
    place.longitude = newSpot.longitude
    place.latitude = newSpot.latitude
    places.push(place)
  }

  return places
}

app.get('/', (_: Request, res: Response) => {
  res.send('hello goochoori')
})

app.get('/bulk/:quantity', async (req: Request, res: Response) => {
  const { quantity } = req.params
  const bulk = await bulkInsert(parseInt(quantity))
  await placeRepository.save(bulk, { chunk: bulk.length / 1000 })
  res.send(bulk)
})

app.get('/random', async (_: Request, res: Response) => {
  const newSpot = getRandomSpot()
  console.log({ newSpot })

  const place = new Place()
  place.longitude = newSpot.longitude
  place.latitude = newSpot.latitude

  await placeRepository.save(place)
  res.send(place)
})

app.get('/contain', async (_: Request, res: Response) => {
  const p1: pointType = {
    longitude: 127.039289,
    latitude: 37.610593,
  }
  const p2: pointType = {
    longitude: 127.063589,
    latitude: 37.640893,
  }

  const containeds = await placeRepository.findBy({
    point: Raw(point => `MBRIntersects(ST_GeomFromText('${generatePolygon(p1, p2)}', 4326), ${point})`),
  })

  res.send(containeds)
})

app.get('/closest', async (_: Request, res: Response) => {
  const closest = await placeRepository
    .createQueryBuilder()
    .select(
      `id, longitude, latitude, st_distance_sphere(point, st_geomfromtext('POINT(37.610329 127.037739)', 4326)) as distance`,
    )
    .orderBy('distance')
    .take(3)
    .getRawMany()

  res.send(closest)
})

app.get('/count', async (_: Request, res: Response) => {
  const [places, placeCount] = await placeRepository.findAndCount({
    select: { id: true, latitude: true },
    where: { latitude: LessThan(35.372) },
    order: { id: 'DESC' },
  })

  res.send({ placeCount, places })
})

app.listen(PORT, async () => {
  try {
    await dataSource.initialize()

    console.log(`server running at http://localhost:${PORT}`)
  } catch (error) {
    console.log({ startupError: error })
  }
})
