import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import User from './User'

@Entity('banks')
class Bank {
  constructor(user?: Partial<Bank>) {
    if (user) Object.assign(this, user)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  bankName: string

  @Column()
  bankAccount: string

  @OneToOne(() => User, user => user.bank)
  @JoinColumn()
  user: User
}

export default Bank
