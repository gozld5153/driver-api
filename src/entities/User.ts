import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm'
import bcrypt from 'bcrypt'
import { Coord } from '../types/map'
import { IspType, UserRole } from '../types/user'
import Offer from './Offer'
import Order from './Order'
import Organization from './Organization'
@Entity('users')
class User {
  constructor(user?: Partial<User>) {
    if (user) Object.assign(this, user)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.NONE })
  role: UserRole

  @Column()
  name: string

  @Column({ nullable: true })
  email?: string

  @Index()
  @Column({ type: 'enum', enum: IspType, default: IspType.NONE, nullable: true })
  isp?: IspType

  @Index()
  @Column({ nullable: true })
  ispId?: string

  @Column({ nullable: true })
  identifier?: string

  @Column({ nullable: true })
  password?: string

  @Column({ nullable: true })
  profileImage?: string

  @Column({ type: 'simple-json', nullable: true })
  coord?: Coord

  // @Index({ spatial: true })
  @Column({ type: 'point', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location: string

  @Column({ nullable: true })
  pushToken: string

  @Column({ default: 'rest' })
  status: 'rest' | 'ready' | 'working'

  @OneToMany(() => Order, order => order.driver)
  ordersAsDriver: Order[]

  @OneToMany(() => Order, order => order.hero)
  ordersAsHero: Order[]

  @OneToMany(() => Order, order => order.client)
  ordersAsClient: Order[]

  @ManyToOne(() => Organization, organization => organization.users, { cascade: ['insert'] })
  organization: Organization

  @OneToMany(() => Offer, offer => offer.user)
  offers: Offer[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  @BeforeUpdate()
  convertCoordToPoint() {
    if (this.coord && this.coord?.latitude) this.location = `POINT(${this.coord.latitude} ${this.coord.longitude})`
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) this.password = await bcrypt.hash(this.password, 6)
  }

  @BeforeInsert()
  ensureProfileImage() {
    if (!this.profileImage) this.profileImage = 'https://cdn.icon-icons.com/icons2/1465/PNG/512/607ambulance_100711.png'
  }
}

export default User
