import { Exclude } from 'class-transformer'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm'
import { invitationRepository } from '../db/repositories'
import Organization from './Organization'

@Entity('invitations')
class Invitation {
  constructor(profile?: Partial<Invitation>) {
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
  code?: string

  @ManyToOne(() => Organization, organization => organization.profiles)
  organization: Organization

  @Exclude()
  @CreateDateColumn()
  createdAt: Date

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date

  @BeforeInsert()
  async addSecret() {
    let code = ''
    let codeFound = false
    do {
      code = String(Math.round(Math.random() * 1000000)).padStart(6, '0')

      const foundProfile = await invitationRepository.findOneBy({ code })
      codeFound = foundProfile !== null
    } while (codeFound)

    this.code = code
  }
}

export default Invitation
