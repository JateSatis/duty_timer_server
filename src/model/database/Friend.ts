import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity("friend")
export class Friend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.friends, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "userId",
  })
  user: User;

  @Column({
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value), // Convert string to number
    },
  })
  friendId: number;
}
