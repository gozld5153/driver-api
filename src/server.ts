import express, { urlencoded } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import admin from 'firebase-admin'

import mapRoutes from './routes/map'
import orderRoutes from './routes/order'
import placesRoutes from './routes/places'
import setupRoutes from './routes/setup'
import dataSource from './db/data-source'
import authRoutes from './routes/auth'
import backdoorRoutes from './routes/backdoor'
import passport from 'passport'
import configureOAuth from './lib/oauthConfig'

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: [process.env.HOSPITAL_URL!, process.env.AGENCY_URL!],
    optionsSuccessStatus: 200, // default 204 no content
  }),
)
app.use(urlencoded({ extended: false }))

// oauth
configureOAuth()
app.use(passport.initialize())

app.use('/auth', authRoutes)
app.use('/map', mapRoutes)
app.use('/setup', setupRoutes)
app.use('/backdoor', backdoorRoutes)
app.use('/places', placesRoutes)
app.use('/order', orderRoutes)
app.get('/', (_, res) => res.send('hello'))

const PORT = process.env.PORT

app.listen(PORT, async () => {
  try {
    await dataSource.initialize()
    console.log(`db connected at ${new Date()}`)
  } catch (error) {
    console.log({ startupError: error })
  } finally {
    console.log(`server running at http://localhost:${PORT}`)
  }
})
