import { Entity, PrimaryGeneratedColumn, Column, Index, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm'
import Order from './Order'

export enum PlaceType {
  HOSPOTAL = 'hospital',
}

@Entity('places')
class Place {
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

  @OneToMany(() => Order, order => order.departure, { nullable: true })
  ordersAsDepature: Order[]

  @OneToMany(() => Order, order => order.arrival, { nullable: true })
  ordersAsArrival: Order[]

  @BeforeInsert()
  @BeforeUpdate()
  convertCoordToPoint() {
    this.point = `POINT(${this.latitude} ${this.longitude})`
  }
}

export default Place
