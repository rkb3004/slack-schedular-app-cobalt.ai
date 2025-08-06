import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MessageStatus {
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

// TypeORM entity for potential future use with TypeORM
@Entity('scheduled_messages')
// ...existing code...
export class ScheduledMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  teamId?: string;

  @Column()
  channelId!: string;

  @Column({ nullable: true })
  channelName?: string;

  @Column('text')
  message!: string;

  @Column()
  scheduledTime!: Date;

  @Column({
    type: 'simple-enum',
    enum: MessageStatus,
    default: MessageStatus.SCHEDULED
  })
  status!: MessageStatus;

  @Column({ nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
// ...existing code...

// Simple interface used by our current implementation
export interface ScheduledMessage {
  id: string;
  userId: string;
  channel: string;  // This represents channelId in the DB
  text: string;     // This represents message in the DB
  scheduledTime: Date;
  status?: MessageStatus;
  errorMessage?: string;
}

// Mapping function to convert between Entity and Interface
export function toScheduledMessage(entity: ScheduledMessageEntity): ScheduledMessage {
  return {
    id: entity.id,
    userId: entity.userId,
    channel: entity.channelId,
    text: entity.message,
    scheduledTime: entity.scheduledTime,
    status: entity.status,
    errorMessage: entity.errorMessage
  };
}

// Mapping function to convert from Interface to Entity
export function toScheduledMessageEntity(message: ScheduledMessage): ScheduledMessageEntity {
  const entity = new ScheduledMessageEntity();
  entity.id = message.id;
  entity.userId = message.userId;
  entity.channelId = message.channel;
  entity.message = message.text;
  entity.scheduledTime = message.scheduledTime;
  entity.status = message.status || MessageStatus.SCHEDULED;
  entity.errorMessage = message.errorMessage;
  return entity;
}
