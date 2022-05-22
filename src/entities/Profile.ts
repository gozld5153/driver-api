import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  ManyToOne,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm'
import { profileRepository } from '../db/repositories'
import Organization from './Organization'
import User from './User'

@Entity('profiles')
class Profile {
  constructor(profile?: Partial<Profile>) {
    if (profile) Object.assign(this, profile)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  phoneNumber: string

  @Column({ nullable: true })
  address?: string

  @Column({ nullable: true })
  email?: string

  @Column()
  licenseNumber: string

  @Column()
  secret?: string

  @ManyToOne(() => Organization, organization => organization.profiles)
  organization: Organization

  @OneToOne(() => User, user => user.profile, { nullable: true })
  @JoinColumn()
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date

  @BeforeInsert()
  async addSecret() {
    let secret = ''
    let secretFound = false
    do {
      secret = String(Math.round(Math.random() * 1000000)).padStart(6, '0')

      const foundProfile = await profileRepository.findOneBy({ secret })
      secretFound = foundProfile !== null
    } while (secretFound)

    this.secret = secret
  }
}

export default Profile
