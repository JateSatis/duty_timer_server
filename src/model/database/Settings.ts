import {
  BaseEntity,
  Check,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { BackgroundTint, Language, NicknameColor, Theme } from "../utils/Enums";

//# СУЩНОСТЬ НАСТРОЙКИ (Settings)
//# - Идентификатор = UserId
//# - Ссылка на фон: String
//# - Тема: Enum(...colors), nullable = false, default = white
//# - Цвет затемнения фона: Enum(“black”, “red”, “none”)
//# - Значение затемнения фона: range[0;100], default = 0
//# - Анимация фона: Boolean, default = false
//# - Цвет никнейма: Enum(...colors), nullable = false, default = black
//# - Язык: Enum(“Русский", "Белорусский", "Английский"), nullabel = false, default = UserLang || “Русский”
//# - Пользователь: отношение OneToOne к сущности User

@Entity("settings")
export class Settings extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text", {
    nullable: true,
    default: null,
  })
  backgroundImageName: string | null;

  @Column("text", {
    nullable: true,
    default: null,
  })
  recievedBackgroundImageName: string | null;

  @Column({
    type: "text",
    default: "WHITE",
  })
  theme: string;

  @Column({
    type: "text",
    default: null,
  })
  backgroundTint: string | null;

  @Column({
    default: 50,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value), // Convert string to number
    },
  })
  @Check(`"backgroundTintOpacity" >= 0 AND "backgroundTintOpacity" <= 100`)
  backgroundTintOpacity: number;

  @Column({
    type: "boolean",
    default: false,
  })
  backgroundAnimation: Boolean;

  @Column({
    type: "text",
    default: "BLACK",
  })
  nicknameColor: string;

  @Column({
    type: "text",
    default: "RUSSIAN",
  })
  language: string;

  @OneToOne(() => User, (user) => user.settings, {
    onDelete: "CASCADE",
  })
  user: User;
}
