import express, { urlencoded } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import mapRoute from './routes/map'
import setupRoute from './routes/setup'
import { createConnection } from 'typeorm'

const app = express()
const PORT = process.env.PORT || 5030

app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(cors())
app.use(urlencoded({ extended: false }))

app.use('/map', mapRoute)
app.use('/setup', setupRoute)

app.listen(PORT, async () => {
  try {
    await createConnection()
    console.log(`db connected at ${new Date()}`)

    console.log(`server running at http://localhost:${PORT}`)
  } catch (error) {
    console.log({ startupError: error })
  }
})
