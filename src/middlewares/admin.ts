import { NextFunction, Request, Response } from 'express'
import User from '../entities/User'
import { UserRole } from '../types/user'

export default async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User = res.locals.user

    if (user.role !== UserRole.ADMIN) return res.status(403).json({ error: 'admin only' })

    return next()
  } catch (err) {
    throw err as Error
  }
}
