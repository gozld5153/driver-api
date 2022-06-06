import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import User from './User'

@Entity('location_queries')
class LocationQuery {
  constructor(query?: Partial<LocationQuery>) {
    if (query) Object.assign(this, query)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  ip: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User)
  user: User
}

export default LocationQuery
