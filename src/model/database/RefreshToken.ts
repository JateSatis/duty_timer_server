import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Chat } from "./Chat";
import { User } from "./User";
import { Image } from "./Image";

//# СУЩНОСТЬ СООБЩЕНИЕ (Message)
//# - Идентификатор = GeneratedId
//# - Текст сообщения: String, nullable = false
//# - Дата создания: Date, nullable = false
//# - Редактировано: Boolean
//# - Прочитано: Boolean
//# - Изображения: отношение OneToMany к сущности Picture
//# - Чат: отношение ManyToOne к сущности Chat
//# - Пользователь: отношение ManyToOne к сущности User

@Entity("refreshToken")
export class RefreshToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.refreshToken)
  @JoinColumn({
    name: "userId",
  })
  user: User;

  @CreateDateColumn()
  token: string;

  @Column({
    type: "boolean",
    default: false,
  })
  isRevoked: boolean;

  @Column({
    type: "bigint",
  })
  expiresAt: number;

  @Column({
    type: "bigint",
  })
  createdAt: number;

  @Column({
    type: "bigint",
  })
  updatedAt: number;
}
