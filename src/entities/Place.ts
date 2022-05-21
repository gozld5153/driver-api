import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  ManyToOne,
} from 'typeorm'
import { PlaceType } from '../types/map'
import Order from './Order'
import Organization from './Organization'

@Entity('places')
class Place {
  constructor(place?: Partial<Place>) {
    if (place) Object.assign(this, place)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ type: 'enum', enum: PlaceType, default: PlaceType.HOSPOTAL })
  type: PlaceType

  @Column('double')
  latitude: number

  @Column('double')
  longitude: number

  @Index({ spatial: true })
  @Column({ type: 'point', spatialFeatureType: 'Point', srid: 4326 })
  point: string

  @Column({ nullable: true })
  address: string

  @Column({ nullable: true })
  roadAddress: string

  @OneToMany(() => Order, order => order.departure, { nullable: true })
  ordersAsDepature: Order[]

  @OneToMany(() => Order, order => order.destination, { nullable: true })
  ordersAsArrival: Order[]

  @ManyToOne(() => Organization, organization => organization.places, { cascade: ['insert'], nullable: true })
  organization: Organization

  @BeforeInsert()
  @BeforeUpdate()
  convertCoordToPoint() {
    this.point = `POINT(${this.latitude} ${this.longitude})`
  }
}

export default Place
