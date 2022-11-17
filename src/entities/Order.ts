import {
  BeforeInsert,
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
  NO_DRIVER = 'no-driver',
  PENDING = 'pending',
  STARTED = 'started',
  DRIVER_MATCHED = 'driver-matched',
  HERO_REQUESTED = 'hero-requested',
  HERO_REJECTED = 'hero-rejected',
  PICKUP_REQUESTED = 'pickup-requested',
  PICKUP_REJECTED = 'pickup-rejected',
  HERO_MATCHED = 'hero-matched',
  HERO_PICKUPED = 'hero-pickuped',
  LOADED = 'loaded',
  DEPARTED = 'departed',
  ARRIVED = 'arrived',
  FEE_REQUESTED = 'fee-requested',
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
  startedAt: Date

  @Column({ nullable: true })
  heroRequestedAt: Date

  @Column({ nullable: true })
  heroRejectedAt: Date

  @Column({ nullable: true })
  pickupRequestedAt: Date

  @Column({ nullable: true })
  pickupRejectedAt: Date

  @Column({ nullable: true })
  departedAt: Date

  @Column({ nullable: true })
  loadedAt: Date

  @Column({ nullable: true })
  arrivedAt: Date

  @Column({ nullable: true })
  feeRequestedAt: Date

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

  @Column({ nullable: true })
  expectedFee: number

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus

  @OneToOne(() => Invoice, invoice => invoice.order)
  @JoinColumn()
  invoice: Invoice

  @BeforeUpdate()
  @BeforeInsert()
  recordMatchTime() {
    if (this.driver) this.driverMatchedAt = new Date()
    if (this.hero) this.heroMatchedAt = new Date()
    if (this.status === OrderStatus.STARTED) this.startedAt = new Date()
    if (this.status === OrderStatus.HERO_REJECTED) this.heroRejectedAt = new Date()
    if (this.status === OrderStatus.HERO_REQUESTED) this.heroRequestedAt = new Date()
    if (this.status === OrderStatus.PICKUP_REQUESTED) this.pickupRequestedAt = new Date()
    if (this.status === OrderStatus.PICKUP_REJECTED) this.pickupRejectedAt = new Date()
    if (this.status === OrderStatus.DEPARTED) this.departedAt = new Date()
    if (this.status === OrderStatus.LOADED) this.loadedAt = new Date()
    if (this.status === OrderStatus.ARRIVED) this.arrivedAt = new Date()
    if (this.status === OrderStatus.FEE_REQUESTED) this.feeRequestedAt = new Date()
    if (this.status === OrderStatus.FEE_CALCULATED) this.feeCaculatedAt = new Date()
    if (this.status === OrderStatus.COMPLETED) this.completedAt = new Date()
  }
}

export default Order
