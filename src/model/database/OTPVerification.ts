import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  Long,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

//# СУЩНОСТЬ ТАЙМЕР (Timer)
//# - Идентификатор = GeneratedId
//# - Начало: Date, nullabel = false
//# - Конец: Date, nullable = false
//# - Пользователи: отношение OneToMany к сущности User

@Entity("OTPVerification")
export class OTPVerification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("string")
  otpHash: string;

  @Column({
    type: "bigint",
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value), // Convert string to number
    },
  })
  createdAt: number;

  @Column({
    type: "bigint",
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value), // Convert string to number
    },
  })
  expiresAt: number;

  @OneToOne(() => User, (user) => user.OTPVerification, {
    cascade: true,
  })
  @JoinColumn({
    name: "userId",
  })
  user: User;
}
