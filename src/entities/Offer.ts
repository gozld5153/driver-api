import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { UserRole } from '../types/user'
import Order from './Order'
import User from './User'

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  TIMEOUT = 'timeout',
  CANCLED = 'cancled',
}

export enum OfferType {
  DRIVER = 'driver',
  HERO = 'hero',
}

@Entity('offers')
class Offer {
  constructor(offer?: Partial<Offer>) {
    if (offer) Object.assign(this, offer)
  }

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, user => user.offers)
  user: User

  @ManyToOne(() => Order, order => order.offers, { cascade: ['insert', 'update'] })
  order: Order

  @Column({ type: 'enum', enum: UserRole })
  type: UserRole

  @Column({ type: 'enum', enum: OfferStatus, default: OfferStatus.PENDING })
  status: OfferStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

export default Offer
