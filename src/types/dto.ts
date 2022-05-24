import User from '../entities/User'
import { Coord } from './map'
import { IspType, UserRole } from './user'

export type LoginRequestDTO = {
  role: UserRole
  name: string
  email: string
  isp: IspType
  ispId: string
  profileImage: string
  coord: Coord
  pushToken: string
}

export type LoginResponseDTO = {
  user: User
  accessToken: string
  refreshToken: string
}
