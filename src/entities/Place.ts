import { Entity, PrimaryGeneratedColumn, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm'

@Entity()
class Place {
  @PrimaryGeneratedColumn()
  id: number

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
