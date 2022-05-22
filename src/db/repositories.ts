import dataSource from './data-source'
import Place from '../entities/Place'
import User from '../entities/User'
import Organization from '../entities/Organization'
import Order from '../entities/Order'
import Offer from '../entities/Offer'
import Profile from '../entities/Profile'

export const placeRepository = dataSource.getRepository(Place)
export const userRepository = dataSource.getRepository(User)
export const organizationRepository = dataSource.getRepository(Organization)
export const orderRepository = dataSource.getRepository(Order)
export const offerRepository = dataSource.getRepository(Offer)
export const profileRepository = dataSource.getRepository(Profile)
