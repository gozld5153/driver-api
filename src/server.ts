import dotenv from 'dotenv'
dotenv.config()

import express, { Request, Response, urlencoded } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import admin from 'firebase-admin'
import passport from 'passport'

import mapRoutes from './routes/map'
import certificateRoutes from './routes/certificate'

import transferRoutes from './routes/transfer'
import adminRoutes from './routes/admin'
import orderRoutes from './routes/order'
import invitationRoutes from './routes/invitation'
import placesRoutes from './routes/places'
import setupRoutes from './routes/setup'
import authRoutes from './routes/auth'
import uploadRoutes from './routes/upload'
import pickupRoutes from './routes/pickup'
import organizationRoutes from './routes/organization'
import backdoorRoutes from './routes/backdoor'
import calculationRoutes from './routes/calculation'
import reservationRoutes from './routes/reservation'

import dataSource from './db/data-source'
import configureOAuth from './lib/oauthConfig'
import ensureAdmin from './db/ensureAdmin'
import ensureClientPublic from './db/ensureClientPublic'
import path from 'path'

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

const app = express()

app.set('view engine', 'pug')
app.get('/marketing', (_req: Request, res: Response) => {
  res.render('marketing')
})
app.get('/terms', (_req: Request, res: Response) => {
  res.render('terms')
})
app.get('/location-terms', (_req: Request, res: Response) => {
  res.render('locationTerms')
})
app.get('/privacy-policy', (_req: Request, res: Response) => {
  res.render('privacyPolicy')
})
app.get('/privacy-agreement', (_req: Request, res: Response) => {
  res.render('privacyAgreement')
})

app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: [process.env.HOSPITAL_URL!, process.env.AGENCY_URL!, process.env.ADMIN_URL!],
    optionsSuccessStatus: 200, // default 204 no content
  }),
)
app.use(urlencoded({ extended: false }))

// oauth
configureOAuth()
app.use(passport.initialize())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/upload', uploadRoutes)
app.use('/auth', authRoutes)
app.use('/map', mapRoutes)
app.use('/setup', setupRoutes)
app.use('/backdoor', backdoorRoutes)
app.use('/places', placesRoutes)
app.use('/order', orderRoutes)
app.use('/organization', organizationRoutes)
app.use('/invitations', invitationRoutes)
app.use('/admin', adminRoutes)
app.use('/pickup', pickupRoutes)
app.use('/transfer', transferRoutes)
app.use('/calculation', calculationRoutes)
app.use('/certificate', certificateRoutes)
app.use('/reservations', reservationRoutes)
app.get('/', (_, res) => res.send('hello'))

const PORT = process.env.PORT

app.listen(PORT, async () => {
  try {
    await dataSource.initialize()
    console.log(`db connected at ${new Date()}`)
    await ensureAdmin()
    await ensureClientPublic()
  } catch (error) {
    console.log({ startupError: error })
  } finally {
    console.log(`server running at http://localhost:${PORT}`)
  }
})
