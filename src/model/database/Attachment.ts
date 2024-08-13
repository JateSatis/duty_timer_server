import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Message } from "./Message";

//# СУЩНОСТЬ КАРТИНКА (Picture)

@Entity("attachment")
export class Attachment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "messageId",
  })
  message: Message;
}
