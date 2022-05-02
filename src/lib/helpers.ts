import User from '../entities/User'
import jwt from 'jsonwebtoken'

export const generateRefreshToken = (user: User) => jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!)

export const generateAccessToken = (user: User, admin: boolean = false) => {
  if (admin) {
    return jwt.sign({ name: 'admin', role: 'admin' }, process.env.JWT_SECRET!)
  }

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET!)
}
