import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

// TypeORM Entities are classes used to manage rows in the database
@Entity()
export class Message {
  // .id
  @PrimaryGeneratedColumn()
  id?: number;

  // .body
  @Column({
    nullable: false,
    unique: false,
  })
  body: string;

  // .chat
  @Column({
    nullable: false,
    unique: false,
  })
  chat: number;

  // .user
  @Column({
    nullable: false,
    unique: false,
  })
  user: number;

  // .sent
  @CreateDateColumn()
  sent?: Date;
}
