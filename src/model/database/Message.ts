import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Chat } from "./Chat";
import { User } from "./User";
import { Attachment } from "./Attachment";

//# СУЩНОСТЬ СООБЩЕНИЕ (Message)
//# - Идентификатор = GeneratedId
//# - Текст сообщения: String, nullable = false
//# - Дата создания: Date, nullable = false
//# - Редактировано: Boolean
//# - Прочитано: Boolean
//# - Изображения: отношение OneToMany к сущности Picture
//# - Чат: отношение ManyToOne к сущности Chat
//# - Пользователь: отношение ManyToOne к сущности User

@Entity("message")
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @CreateDateColumn()
  creationTime: Date;

  @Column({
    type: "boolean",
    default: false,
  })
  edited: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  read: boolean;

  @OneToMany(() => Attachment, (attachment) => attachment.message)
  attachments: Attachment[];

  @ManyToOne(() => Chat, (chat) => chat.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "chat_id",
  })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "userId",
  })
  sender: User;
}
