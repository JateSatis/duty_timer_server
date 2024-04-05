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
import { BackgroundTint, Language, NicknameColor, Theme } from "./utils/Enums";

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

  @Column({
    nullable: true,
  })
  background_image_link: string;

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
  background_tint: BackgroundTint;

  @Column({
    default: 50,
  })
  @Check(`"background_tint_opacity" >= 0 AND "background_tint_opacity" <= 100`)
  background_tint_opacity: number;

  @Column({
    type: "boolean",
    default: false,
  })
  background_animation: Boolean;

  @Column({
    type: "enum",
    enum: NicknameColor,
    default: NicknameColor.BLACK,
  })
  nickname_color: NicknameColor;

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
