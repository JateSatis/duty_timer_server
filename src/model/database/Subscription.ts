import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

//# СУЩНОСТЬ ПОДПИСКА (Subscription)
//# - Идентификатор = UserId
//# - Статус: Boolean, default = false
//# - Дата конца подписки: Date

@Entity("subscription")
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "boolean",
    default: false,
  })
  active: boolean;

  @Column({
    type: "date",
  })
  expirationDate: Date;

  @OneToOne(() => User, (user) => user.settings, {
    onDelete: "CASCADE",
  })
  user: User;
}
