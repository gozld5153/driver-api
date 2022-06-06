import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import User from './User'

@Entity('location_records')
class LocationRecord {
  constructor(record?: Partial<LocationRecord>) {
    if (record) Object.assign(this, record)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userRole: 'driver' | 'hero'

  @Column()
  latitude: string

  @Column()
  longitude: string

  @Column()
  platform: 'ios' | 'android'

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User)
  user: User
}

export default LocationRecord
