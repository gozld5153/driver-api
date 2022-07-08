import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { UserRole } from '../types/user'
import { instanceToPlain } from 'class-transformer'
import User from './User'

@Entity('certifications')
class Certification {
  constructor(cert?: Partial<Certification>) {
    if (cert) Object.assign(this, cert)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.HERO })
  type: UserRole

  @Column()
  licenseNumber: string

  @Column()
  imageUrl: string

  @Column({ default: 'rest' })
  status: 'not-registred' | 'verifying' | 'accepted' | 'rejected'

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => User, user => user.certification)
  @JoinColumn()
  user: User

  toJSON() {
    return instanceToPlain(this)
  }
}

export default Certification
