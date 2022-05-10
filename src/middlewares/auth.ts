import { NextFunction, Request, Response } from 'express'
import User from '../entities/User'

export default async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User = res.locals.user

    if (!user) return res.status(403).json({ error: 'Unauthenticated' })

    return next()
  } catch (err) {
    throw err as Error
  }
}
