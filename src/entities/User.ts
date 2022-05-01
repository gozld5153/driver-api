import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, BeforeInsert, BeforeUpdate } from 'typeorm'
import { Coord } from '../types/map'
import { IspType, UserRole } from '../types/user'
import Order from './Order'
@Entity('users')
class User {
  constructor(user: Partial<User>) {
    Object.assign(this, user)
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
  ispProfileImage?: string

  @Column({ type: 'simple-json', nullable: true })
  coord?: Coord

  @Index({ spatial: true })
  @Column({ type: 'point', spatialFeatureType: 'Point', srid: 4326 })
  location: string

  @OneToMany(() => Order, order => order.driver)
  ordersAsDriver: Order[]

  @OneToMany(() => Order, order => order.hero)
  ordersAsHero: Order[]

  @OneToMany(() => Order, order => order.client)
  ordersAsClient: Order[]

  @BeforeInsert()
  @BeforeUpdate()
  convertCoordToPoint() {
    if (this.coord && this.coord?.latitude) this.location = `POINT(${this.coord.latitude} ${this.coord.longitude})`
  }
}

export default User
