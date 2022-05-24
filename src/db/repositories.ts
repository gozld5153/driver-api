import dataSource from './data-source'
import Place from '../entities/Place'
import User from '../entities/User'
import Organization from '../entities/Organization'
import Order from '../entities/Order'
import Offer from '../entities/Offer'
import Invitation from '../entities/Invitation'
import Invoice from '../entities/Invoice'

export const placeRepository = dataSource.getRepository(Place)
export const userRepository = dataSource.getRepository(User)
export const organizationRepository = dataSource.getRepository(Organization)
export const orderRepository = dataSource.getRepository(Order)
export const offerRepository = dataSource.getRepository(Offer)
export const invitationRepository = dataSource.getRepository(Invitation)
export const invoiceRepository = dataSource.getRepository(Invoice)
