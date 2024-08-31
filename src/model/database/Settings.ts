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
  })
  backgroundImageName: string;

  @Column({
    type: "enum",
    enum: Theme,
    default: Theme.WHITE,
  })
  theme: Theme;

  @Column({
    type: "enum",
    enum: BackgroundTint,
    nullable: true,
  })
  backgroundTint: BackgroundTint;

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
    type: "enum",
    enum: NicknameColor,
    default: NicknameColor.BLACK,
  })
  nicknameColor: NicknameColor;

  @Column({
    type: "enum",
    enum: Language,
    default: Language.RUSSIAN,
  })
  language = Language;

  @OneToOne(() => User, (user) => user.settings, {
    onDelete: "CASCADE",
  })
  user: User;
}
