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

@Entity("image")
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Message, (message) => message.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "message_id",
  })
  message: Message;
}
