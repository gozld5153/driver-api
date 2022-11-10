import { Exclude } from 'class-transformer'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import Organization from './Organization'
import User from './User'
@Entity('carInfo')
class CarInfo {
  constructor(carInfo?: Partial<CarInfo>) {
    if (carInfo) Object.assign(this, carInfo)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  certificateNumber: string

  @Column({ nullable: true })
  registration: string

  @Column()
  type: 'normal' | 'special'

  @OneToOne(() => User, user => user.carInfo)
  @JoinColumn()
  driver: User

  @ManyToOne(() => Organization, org => org.carInfo)
  organization: Organization

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date

  @Exclude()
  @CreateDateColumn()
  createdAt: Date

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date
}

export default CarInfo
