import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import Order from './Order'

export enum IspType {
  NAVER = 'naver',
  KAKAO = 'kakao',
  APPLE = 'apple',
  NONE = 'none',
}

export enum UserRole {
  DRIVER = 'driver',
  HERO = 'hero',
  AGENCY = 'agency',
  CLIENT = 'client',
  CLIENT_MANAGER = 'client-manager',
  NONE = 'none',
}

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'enum', enum: UserRole, default: UserRole.NONE })
  role: UserRole

  @Column()
  name: string

  @Column({ nullable: true })
  email?: string

  @Column({ type: 'enum', enum: IspType, default: IspType.NONE, nullable: true })
  isp: IspType

  @Column({ nullable: true })
  ispId?: string

  @Column({ nullable: true })
  ispProfileImage?: string

  @Column({ type: 'simple-json', nullable: true })
  location?: { latitude: number; longitude: number }

  @OneToMany(() => Order, order => order.driver)
  ordersAsDriver: Order[]

  @OneToMany(() => Order, order => order.hero)
  ordersAsHero: Order[]

  @OneToMany(() => Order, order => order.client)
  ordersAsClient: Order[]
}

export default User
