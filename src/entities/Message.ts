import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    nullable: false,
    unique: false,
  })
  body: string;

  @Column({
    nullable: false,
    unique: false,
  })
  chat: number;

  @Column({
    nullable: false,
    unique: false,
  })
  user: number;

  @CreateDateColumn()
  sent?: Date;
}
