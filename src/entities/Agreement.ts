import { Exclude } from 'class-transformer'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import User from './User'

@Entity('agreements')
class Agreement {
  constructor(agreement?: Partial<Agreement>) {
    if (agreement) Object.assign(this, agreement)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: 'service' | 'camera' | 'album' | 'notification'

  @Column()
  agreed: boolean

  @ManyToOne(() => User, user => user.agreements)
  user: User

  @Exclude()
  @CreateDateColumn()
  createdAt: Date

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date
}

export default Agreement
