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
import { Friend } from "./Friend";
import { Timer } from "./Timer";
import { Event } from "./Event";
import { Settings } from "./Settings";
import { Chat } from "./Chat";
import { Message } from "./Message";
import { Subscription } from "./Subscription";
import { UserType } from "../utils/Enums";
import { FriendshipRequest } from "./FriendshipRequest";
import { RefreshToken } from "./RefreshToken";

//# СУЩНОСТЬ ПОЛЬЗОВАТЕЛЬ (User)
//# - Идентификатор: GeneratedId
//# - Логин: String
//# - Имя: String, nullable = false
//# - Фамилия: String, nullable = false
//# - Никнейм: String, nullable = false, unique = true
//# - Аватар: String (ссылка), nullable = true
//# - Тип пользователя: Enum(“Солдат", "Офицер", "Курсант", "Родственник солдата"), nullable = false, default = “Солдат”
//# - ХэшКод пароля: String, nullable = false
//# - Salt пароля: String, nullable = false
//# - В сети: Boolean
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

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;

  @Column()
  login: string;

  @Column({
    length: 20,
  })
  name: string;

  @Column({
    unique: true,
    length: 20,
  })
  nickname: string;

  @Column({
    nullable: true,
  })
  avatarImageName: string;

  @Column({
    type: "enum",
    enum: UserType,
    default: UserType.SOLDIER,
  })
  userType: UserType;

  @Column({
    unique: true,
  })
  password_hash: string;

  @Column({
    unique: true,
  })
  passwordSalt: string;

  @Column({
    type: "boolean",
    default: "false",
  })
  online: boolean;

  @ManyToOne(() => Timer, (timer) => timer.users)
  @JoinColumn({
    name: "timer_id",
  })
  timer: Timer;

  @OneToMany(() => Event, (event) => event.user, {
    cascade: true,
  })
  events: Event[];

  @OneToMany(
    () => FriendshipRequest,
    (friendshipRequest) => friendshipRequest.sender,
    {
      cascade: true,
    }
  )
  sentFriendshipRequests: FriendshipRequest[];

  @OneToMany(
    () => FriendshipRequest,
    (friendshipRequest) => friendshipRequest.reciever,
    {
      cascade: true,
    }
  )
  recievedFriendshipRequests: FriendshipRequest[];

  @OneToMany(() => Friend, (friend) => friend.user, {
    cascade: true,
  })
  friends: Friend[];

  @OneToOne(() => Settings, (settings) => settings.user, {
    cascade: true,
  })
  @JoinColumn({
    name: "settingsId",
  })
  settings: Settings;

  @ManyToMany(() => Chat, (chat) => chat.users, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinTable({
    name: "usersChats",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "chatId",
      referencedColumnName: "id",
    },
  })
  chats: Chat[];

  @OneToMany(() => Message, (message) => message.sender, {
    cascade: true,
  })
  messages: Message[];

  @OneToOne(() => Subscription, (subscription) => subscription.user, {
    cascade: true,
  })
  @JoinColumn({
    name: "subscriptionId",
  })
  subscription: Subscription;
}
