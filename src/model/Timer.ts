import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
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
    type: "date",
  })
  start_time: Date;

  @Column({
    type: "date",
  })
  end_time: Date;

  @OneToMany(() => User, (user) => user.timer, {
    cascade: true,
  })
  @JoinColumn({
    name: "user_id",
  })
  users: User[];
}
