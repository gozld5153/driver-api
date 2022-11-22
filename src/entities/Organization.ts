import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import Place from './Place'
import Invitation from './Invitation'
import User from './User'
import CarInfo from './CarInfo'

type OrganizationType = 'hospital' | 'agency'
type Coordinate = {
  longitude: string
  latitude: string
}

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

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  manager: string

  @Column()
  phoneNumber: string

  @Column()
  address: string

  @Column({ type: 'simple-json', nullable: true })
  coordinate?: Coordinate

  @Column({ type: 'point', spatialFeatureType: 'Point', srid: 4326 })
  point: string

  @Column({ nullable: true })
  certificate?: string

  @Column()
  affiliation: string

  @Column({ default: false })
  isVerified: boolean

  @OneToOne(() => Organization, { cascade: ['insert', 'update'] })
  @JoinColumn()
  partners: Organization | null

  @OneToMany(() => User, user => user.organization)
  users: User[]

  @OneToMany(() => Place, place => place.organization, { cascade: ['insert'] })
  places: Place[]

  @OneToMany(() => CarInfo, carInfo => carInfo.organization)
  carInfo: CarInfo

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Invitation, profile => profile.organization)
  profiles: Invitation[]

  @BeforeInsert()
  @BeforeUpdate()
  convertCoordToPoint() {
    this.point = this.coordinate
      ? `POINT(${Number(this.coordinate.latitude)} ${Number(this.coordinate.longitude)})`
      : 'POINT(0 0)'
  }

  @BeforeInsert()
  ensureProfileImage() {
    if (!this.profileImage)
      this.profileImage =
        'https://www.promarinetrade.com/cache/promarine/public/shop_product_picture/_1200x800x0/4618_G.jpg'
  }
}

export default Organization
