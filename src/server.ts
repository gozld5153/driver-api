import express, { urlencoded } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import admin from 'firebase-admin'

import mapRoutes from './routes/map'
import setupRoutes from './routes/setup'
import dataSource from './db/data-source'
import authRoutes from './routes/auth'
import backdoorRoutes from './routes/backdoor'

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(cors())
app.use(urlencoded({ extended: false }))

app.use('/auth', authRoutes)
app.use('/map', mapRoutes)
app.use('/setup', setupRoutes)
app.use('/backdoor', backdoorRoutes)
app.get('/', (_, res) => res.send('hello'))

const PORT = process.env.PORT || 5030
app.listen(PORT, async () => {
  try {
    await dataSource.initialize()
    console.log(`db connected at ${new Date()}`)

    console.log(`server running at http://localhost:${PORT}`)
  } catch (error) {
    console.log({ startupError: error })
  }
})
