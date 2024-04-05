import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Timer } from "./Timer";
import { Event } from "./Event";
import { Settings } from "./Settings";
import { Chat } from "./Chat";
import { Message } from "./Message";
import { Subscription } from "./Subscription";
import { UserType } from "./utils/Enums";

//# СУЩНОСТЬ ПОЛЬЗОВАТЕЛЬ (User)
//# - Идентификатор: GeneratedId
//# - Имя: String, nullable = false
//# - Фамилия: String, nullable = false
//# - Никнейм: String, nullable = false, unique = true
//# - Аватар: String (ссылка), nullable = true
//# - Тип пользователя: Enum(“Солдат", "Офицер", "Курсант", "Родственник солдата"), nullable = false, default = “Солдат”
//# - ХэшКод пароля: String, nullable = false
//# - Salt пароля: String, nullable = false
//# - Таймер: отношение ManyToOne к сущности Timer. Одному таймеру могут соответствовать несколько пользователей
//# - События: отношение OneToMany к сущности Event
//# - Друзья: отношение ManyToMany к сущности User. По ней будет создана таблица user_friend
//# - Настройки: отношение OneToOne к сущности Settings
//# - Чаты: отношение ManyToMany к сущности Chat. Таким образом одному чату может принадлежать как два пользователя, так и больше если мы захотим сделать групповые чаты.
//# - Сообщения: отношение OneToMany к сущности Message
//# - Подписка: отношение OneToOne к сущности Subscription.

@Entity("user")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
  })
  name: string;

  @Column({
    length: 20,
  })
  surname: string;

  @Column({
    unique: true,
    length: 20,
  })
  nickname: string;

  @Column({
    nullable: true,
  })
  avatar_link: string;

  @Column({
    type: "enum",
    enum: UserType,
    default: UserType.SOLDIER,
  })
  user_type: UserType;

  @Column({
    unique: true,
  })
  password_hash: string;

  @Column({
    unique: true,
  })
  password_salt: string;

  @ManyToOne(() => Timer, (timer) => timer.users)
  @JoinColumn({
    name: "timer_id",
  })
  timer: Timer;

  @OneToMany(() => Event, (event) => event.user, {
    cascade: true,
  })
  events: Event[];

  @OneToMany(() => User, (user) => user.friendOf, {
    cascade: true,
  })
  friends: User[];

  @ManyToOne(() => User, (user) => user.friends)
  @JoinColumn({
    name: "friend_id",
  })
  friendOf: User;

  @OneToOne(() => Settings, (settings) => settings.user, {
    cascade: true,
  })
  @JoinColumn({
    name: "settings_id",
  })
  settings: Settings;

  @ManyToMany(() => Chat, (chat) => chat.users, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinTable({
    name: "users_chats",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "chat_id",
      referencedColumnName: "id",
    },
  })
  chats: Chat[];

  @OneToMany(() => Message, (message) => message.user, {
    cascade: true,
  })
  messages: Message[];

  @OneToOne(() => Subscription, (subscription) => subscription.user, {
    cascade: true,
  })
  @JoinColumn({
    name: "subscription_id",
  })
  subscription: Subscription;
}
