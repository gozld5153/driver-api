import dataSource from './data-source'
import Place from '../entities/Place'
import User from '../entities/User'
import Organization from '../entities/Organization'
import Order from '../entities/Order'
import Offer from '../entities/Offer'
import Invitation from '../entities/Invitation'
import Invoice from '../entities/Invoice'
import Certification from '../entities/Certification'
import LocationRecord from '../entities/LocationRecord'
import LocationQuery from '../entities/LocationQuery'
import Reservation from '../entities/Reservation'
import ReasonSecession from '../entities/ResonSecession'
import Agreement from '../entities/Agreement'

export const placeRepository = dataSource.getRepository(Place)
export const userRepository = dataSource.getRepository(User)
export const organizationRepository = dataSource.getRepository(Organization)
export const orderRepository = dataSource.getRepository(Order)
export const offerRepository = dataSource.getRepository(Offer)
export const invitationRepository = dataSource.getRepository(Invitation)
export const invoiceRepository = dataSource.getRepository(Invoice)
export const certRepository = dataSource.getRepository(Certification)
export const locationRecordRepository = dataSource.getRepository(LocationRecord)
export const locationQueryRepository = dataSource.getRepository(LocationQuery)
export const reservationRepository = dataSource.getRepository(Reservation)
export const reasonSecessionRepository = dataSource.getRepository(ReasonSecession)
export const agreementRepository = dataSource.getRepository(Agreement)
