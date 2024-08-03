import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  Long,
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
    type: "bigint",
  })
  timeMillis: Long;

  @ManyToOne(() => User, (user) => user.events, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "userId",
  })
  user: User;
}
