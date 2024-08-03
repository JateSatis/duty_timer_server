import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity("friendship_request")
export class FriendshipRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sent_friendship_requests, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "sender_id",
  })
  sender: User;

  @ManyToOne(() => User, (user) => user.recieved_friendship_requests, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "reciever_id",
  })
  reciever: User;
}
