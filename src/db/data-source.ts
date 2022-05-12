import 'reflect-metadata'
import { DataSource } from 'typeorm'
// import dotenv from 'dotenv'
// dotenv.config()

const rootDir = process.env.NODE_ENV === 'development' ? 'src' : 'build'

export default new DataSource({
  type: process.env.DB_DIALECT as 'mysql' | 'mariadb' | 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logger: 'advanced-console',
  logging: false, // process.env.NODE_ENV === 'development',
  entities: [rootDir + '/entities/**/*{.ts,.js}'],
  migrations: [rootDir + '/migrations/**/*{.ts,.js}'],
  subscribers: [rootDir + '/subscribers/**/*{.ts,.js}'],
  legacySpatialSupport: false,
})
