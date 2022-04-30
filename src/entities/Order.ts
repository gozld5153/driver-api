import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import Place from './Place'
import User from './User'

@Entity('orders')
class Order {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, user => user.ordersAsDriver, { nullable: true })
  driver: User

  @ManyToOne(() => User, user => user.ordersAsHero, { nullable: true })
  hero: User

  @ManyToOne(() => User, user => user.ordersAsClient, { nullable: true })
  client: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Place, place => place.ordersAsDepature, { nullable: true })
  departure: Place

  @ManyToOne(() => Place, place => place.ordersAsArrival, { nullable: true })
  arrival: Place

  @Column()
  driverMatchedAt: Date

  @Column()
  heroMatchedAt: Date

  @Column()
  heropickUpedAt: Date

  @Column()
  departedAt: Date

  @Column()
  loadedAt: Date

  @Column()
  arrivedAt: Date

  @Column()
  feeCaculatedAt: Date

  @Column()
  completedAt: Date
}

export default Order
