import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import User from './User'

@Entity('reason_secession')
class ReasonSecession {
  constructor(query?: Partial<ReasonSecession>) {
    if (query) Object.assign(this, query)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  reason: string

  @CreateDateColumn()
  createdAt: Date

  @OneToOne(() => User, user => user.reasonSecession)
  @JoinColumn()
  user: User
}

export default ReasonSecession
