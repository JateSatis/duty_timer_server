import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

//# СУЩНОСТЬ СОБЫТИЕ (Event)
//# - Идентификатор: GeneratedId
//# - Название: String, nullable = false
//# - Дата: Date, nullable = false
//# - Пользователь: отношение ManyToOne к сущности User

@Entity("event")
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: "date",
  })
  date: Date;

  @ManyToOne(() => User, (user) => user.events, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "user_id",
  })
  user: User;
}
