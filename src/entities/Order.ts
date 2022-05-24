import {
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import Invoice from './Invoice'
import Offer from './Offer'
import Place from './Place'
import User from './User'

export enum OrderStatus {
  PENDING = 'pending',
  DRIVER_MATCHED = 'driver-matched',
  HERO_MATCHED = 'hero-matched',
  HERO_PICKUPED = 'hero-pickuped',
  LOADED = 'loaded',
  DEPARTED = 'departed',
  ARRIVED = 'arrived',
  FEE_CALCULATED = 'fee-calculated',
  COMPLETED = 'completed',
  CANCELLED = 'canceled',
}

@Entity('orders')
class Order {
  constructor(order?: Partial<Order>) {
    if (order) Object.assign(this, order)
  }

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, user => user.ordersAsDriver, { nullable: true })
  driver: User

  @ManyToOne(() => User, user => user.ordersAsHero, { nullable: true })
  hero: User

  @ManyToOne(() => User, user => user.ordersAsClient, { nullable: true })
  client: User

  @OneToMany(() => Offer, offer => offer.order)
  offers: Offer[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Place, place => place.ordersAsDepature, { nullable: true })
  departure: Place

  @ManyToOne(() => Place, place => place.ordersAsArrival, { nullable: true })
  destination: Place

  @Column({ nullable: true })
  driverMatchedAt: Date

  @Column({ nullable: true })
  heroMatchedAt: Date

  @Column({ nullable: true })
  heroPickUpedAt: Date

  @Column({ nullable: true })
  departedAt: Date

  @Column({ nullable: true })
  loadedAt: Date

  @Column({ nullable: true })
  arrivedAt: Date

  @Column({ nullable: true })
  feeCaculatedAt: Date

  @Column({ nullable: true })
  completedAt: Date

  @Column()
  clientPhoneNumber: string

  @Column({ nullable: true })
  patientName: string

  @Column({ nullable: true })
  patientPhoneNumber: string

  @Column({ nullable: true })
  companionName: string

  @Column({ nullable: true })
  companionPhoneNumber: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  gear: string

  @Column({ nullable: true })
  etc: string

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus

  @OneToOne(() => Invoice, invoice => invoice.order)
  @JoinColumn()
  invoice: Invoice

  @BeforeUpdate()
  recordMatchTime() {
    if (this.driver) this.driverMatchedAt = new Date()
    if (this.hero) this.heroMatchedAt = new Date()
  }
}

export default Order
