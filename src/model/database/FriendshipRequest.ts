import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity("friendshipRequest")
export class FriendshipRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentFriendshipRequests, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "senderId",
  })
  sender: User;

  @ManyToOne(() => User, (user) => user.recievedFriendshipRequests, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "recieverId",
  })
  reciever: User;
}
