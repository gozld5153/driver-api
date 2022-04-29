import { Entity, PrimaryGeneratedColumn, Column, Index, BeforeInsert, BeforeUpdate, BaseEntity } from 'typeorm'

export enum PlaceType {
  HOSPOTAL = 'hospital',
}

@Entity('places')
class Place extends BaseEntity {
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

  @BeforeInsert()
  @BeforeUpdate()
  convertCoordToPoint() {
    this.point = `POINT(${this.latitude} ${this.longitude})`
  }
}

export default Place
