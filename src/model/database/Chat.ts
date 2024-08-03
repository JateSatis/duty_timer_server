import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Long,
} from "typeorm";
import { Message } from "./Message";
import { User } from "./User";

//# СУЩНОСТЬ ЧАТ (Chat)
//# - Идентификатор = GeneratedId
//# - Последнее обновление: Date, nullable = false. Обновляется каждый раз когда в чате появляется новое сообщение. Нужно для сортировки чатов по релевантности
//# - Кол-во непрочитанных сообщений: Int
//# - Сообщения: отношение OneToMany к сущности Message
//# - Пользователи: отношение ManyToMany к сущности User

@Entity("chat")
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "bigint",
  })
  last_update_time: Long;

  @Column()
  unread_messages_amount: number;

  @OneToMany(() => Message, (message) => message.chat, {
		cascade: true,
  })
  messages: Message[];

  @ManyToMany(() => User, (user) => user.chats, {
    onDelete: "CASCADE",
  })
  users: User[];
}
