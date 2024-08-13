import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  Long,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

//# СУЩНОСТЬ ТАЙМЕР (Timer)
//# - Идентификатор = GeneratedId
//# - Начало: Date, nullabel = false
//# - Конец: Date, nullable = false
//# - Пользователи: отношение OneToMany к сущности User

@Entity("timer")
export class Timer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "bigint",
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value), // Convert string to number
    },
  })
  startTimeMillis: number;

  @Column({
    type: "bigint",
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value), // Convert string to number
    },
  })
  endTimeMillis: number;

  @OneToMany(() => User, (user) => user.timer, {
    cascade: true,
  })
  @JoinColumn({
    name: "userId",
  })
  users: User[];
}
