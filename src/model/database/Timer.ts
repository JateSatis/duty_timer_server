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
  })
  startTimeMillis: number;

  @Column({
    type: "bigint",
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
