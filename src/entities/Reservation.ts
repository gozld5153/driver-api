import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import Place from './Place'
import User from './User'

@Entity('reservations')
class Reservation {
  constructor(reservation?: Partial<Reservation>) {
    if (reservation) Object.assign(this, reservation)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  isEvent: boolean

  @Column()
  dueDate: Date

  @Column()
  dueEndDate?: Date

  @Column()
  fee: number

  @Column()
  comment: string

  @ManyToOne(() => Place, { cascade: ['insert', 'update'] })
  departure: Place

  @ManyToOne(() => Place, { cascade: ['insert', 'update'] })
  destination: Place

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, user => user.reservations)
  driver: User

  @ManyToOne(() => User, user => user.reservations)
  hero: User

  @ManyToMany(() => User)
  applicants: User[]

  @BeforeInsert()
  checkDueEndDate() {
    if (this.isEvent && !this.dueEndDate) this.dueEndDate = this.dueDate
  }
}

export default Reservation
