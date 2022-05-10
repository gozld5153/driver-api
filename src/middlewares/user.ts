import { NextFunction, Request, Response } from 'express'
import jwt, { TokenExpiredError } from 'jsonwebtoken'
import { userRepository } from '../db/repositories'

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1] ?? req.cookies.accessToken

    if (!accessToken) return next()

    const payload: any = jwt.verify(accessToken, process.env.JWT_SECRET!)
    if (!payload) throw new Error('wrong token')

    if (!payload.id) throw new Error('cannot identify you. your token is not valid')

    const foundUser = await userRepository.findOneBy({ id: payload.id })

    if (foundUser) res.locals.user = foundUser

    return next()
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      console.log('token expired')
      return res.status(403).json({ error: err })
    }

    throw err as Error
  }
}
