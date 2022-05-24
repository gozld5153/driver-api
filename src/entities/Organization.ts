import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import Place from './Place'
import Invitation from './Invitation'
import User from './User'

type OrganizationType = 'hospital' | 'agency'

@Entity('organizations')
class Organization {
  constructor(organization?: Partial<Organization>) {
    if (organization) Object.assign(this, organization)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: OrganizationType

  @Column()
  name: string

  @Column({ default: 'not-registered' })
  licenseNumber: string

  @Column()
  profileImage?: string

  @Column()
  email: string

  @Column()
  phoneNumber: string

  @Column()
  address: string

  @Column({ default: false })
  isVerified: boolean

  @OneToMany(() => User, user => user.organization)
  users: User[]

  @OneToMany(() => Place, place => place.organization, { cascade: ['insert'] })
  places: Place[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Invitation, profile => profile.organization)
  profiles: Invitation[]

  @BeforeInsert()
  ensureProfileImage() {
    if (!this.profileImage)
      this.profileImage =
        'https://www.promarinetrade.com/cache/promarine/public/shop_product_picture/_1200x800x0/4618_G.jpg'
  }
}

export default Organization
