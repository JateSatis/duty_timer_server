import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity("otpVerification")
export class OTPVerification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  otpHash: string;

  @Column("text")
  salt: string;

  @Column("text")
  email: string;

  @Column({
    type: "bigint",
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value), // Convert string to number
    },
  })
  otpExpiresAt: number;

  @Column({
    type: "bigint",
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value), // Convert string to number
    },
  })
  accountExpiresAt: number;

  @OneToOne(() => User, (user) => user.otpVerification, {
    onDelete: "CASCADE",
  })
  user: User;
}
