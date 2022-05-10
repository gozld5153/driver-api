import dataSource from './data-source'
import Place from '../entities/Place'
import User from '../entities/User'
import Organization from '../entities/Organization'
import Order from '../entities/Order'

export const placeRepository = dataSource.getRepository(Place)
export const userRepository = dataSource.getRepository(User)
export const organizationRepository = dataSource.getRepository(Organization)
export const orderRepository = dataSource.getRepository(Order)
