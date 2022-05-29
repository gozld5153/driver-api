import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import Order from './Order'

type TransferType = 'driver-hero' | 'driver'

@Entity('invoices')
class Invoice {
  constructor(invoice?: Partial<Invoice>) {
    if (invoice) Object.assign(this, invoice)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: 'driver-hero ' })
  type: TransferType

  @Column({ default: 0 })
  totalFee: number

  @Column({ default: 0 })
  driverFee: number

  @Column({ default: 0 })
  heroFee: number

  @Column({ default: 0 })
  goochooriFee: number

  @Column({ nullable: true })
  transferStartedAt: Date

  @Column({ nullable: true })
  transferFinishedAt: Date

  @Column({ nullable: true })
  calculatedAt: Date

  @OneToOne(() => Order, order => order.invoice)
  order: Order
}

export default Invoice
