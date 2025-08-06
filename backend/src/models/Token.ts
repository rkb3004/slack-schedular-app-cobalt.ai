import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tokens')
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  userId?: string;

  @Column({ unique: true })
  teamId?: string;

  @Column()
  teamName?: string;

  @Column()
  accessToken?: string;

  @Column()
  refreshToken?: string;

  @Column()
  expiresAt?: Date;

  @Column({ nullable: true })
  scope?: string;

  @Column({ nullable: true })
  botUserId?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}

export interface Token {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
