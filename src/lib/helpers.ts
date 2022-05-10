import User from '../entities/User'
import jwt from 'jsonwebtoken'

export const generateRefreshToken = (user: User) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '15d' })
// export const generateRefreshToken = (user: User) => jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!)

export const generateAccessToken = (user: User) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
// export const generateAccessToken = (user: User) => jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '5m' })
