import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum NoticeType {
  NOTICE = 'notice',
  EVENT = 'event',
}

@Entity('notices')
export default class Notice {
  constructor(notice?: Partial<Notice>) {
    if (notice) Object.assign(this, notice)
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'enum', enum: NoticeType, default: NoticeType.NOTICE })
  type: NoticeType

  @Column()
  title: string

  @Column({ type: 'text' })
  content: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
