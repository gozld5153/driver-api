import { Exclude } from 'class-transformer'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import User from './User'

@Entity('permissions')
class Permission {
  constructor(permission: Partial<Permission>) {
    if (permission) Object.assign(this, permission)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: 'location' | 'camera' | 'album' | 'notification'

  @Column()
  agreed: boolean

  @ManyToOne(() => User, user => user.permissions)
  user: User

  @Exclude()
  @CreateDateColumn()
  createdAt: Date

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date
}

export default Permission
