import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Place from './Place'
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

  @OneToMany(() => User, user => user.organization)
  users: User[]

  @OneToMany(() => Place, place => place.organization, { cascade: ['insert'] })
  places: Place[]
}

export default Organization
