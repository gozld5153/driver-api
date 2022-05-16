import User from '../entities/User'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { Coord } from '../types/map'

export const generateRefreshToken = (user: User) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '15d' })
// export const generateRefreshToken = (user: User) => jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!)

export const generateAccessToken = (user: User) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
// export const generateAccessToken = (user: User) => jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '5m' })

type arrCoord = [number, number]
export const getRouteFromCoords = async (departure: Coord, destination: Coord) => {
  const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${departure.longitude},${departure.latitude}&goal=${destination.longitude},${destination.latitude}`
  console.log(url)
  const response = await axios.get(url, {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': process.env.NCP_CLIENT_ID!,
      'X-NCP-APIGW-API-KEY': process.env.NCP_CLIENT_SECRET!,
    },
  })
  if (response.status === 200 && response.data.code === 0) {
    const { bbox, distance, duration }: { bbox: [arrCoord, arrCoord]; distance: number; duration: number } =
      response.data.route?.traoptimal[0]?.summary

    const minCoord = { latitude: bbox[0][1], longitude: bbox[0][0] }
    const maxCoord = { latitude: bbox[1][1], longitude: bbox[1][0] }

    const boundPoints = { minCoord, maxCoord }

    const route: Coord[] = response.data.route.traoptimal[0].path.map((path: [number, number]) => ({
      latitude: path[1],
      longitude: path[0],
    }))

    return { route, boundPoints, distance, duration }
  }

  return null
}
