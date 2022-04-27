import 'reflect-metadata'
import { DataSource } from 'typeorm'

const rootDir = process.env.NODE_ENV === 'development' ? 'src' : 'build'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT as unknown as number,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  logger: 'advanced-console',
  entities: [rootDir + '/entities/**/*{.ts,.js}'],
  migrations: [rootDir + '/migrations/**/*{.ts,.js}'],
  subscribers: [rootDir + '/subscribers/**/*{.ts,.js}'],
  legacySpatialSupport: false,
})

export default AppDataSource
