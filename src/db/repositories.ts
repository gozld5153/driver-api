import dataSource from './data-source'
import Place from '../entities/Place'
import User from '../entities/User'

export const placeRepository = dataSource.getRepository(Place)
export const userRepository = dataSource.getRepository(User)
