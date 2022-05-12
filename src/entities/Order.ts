import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import Offer from './Offer'
import Place from './Place'
import User from './User'

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
}

export default Order
