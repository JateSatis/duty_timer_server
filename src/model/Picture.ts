import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Message } from "./Message";

//# СУЩНОСТЬ ИЗОБРАЖЕНИЕ (PICTURE)
//# - Идентификатор = GeneratedId
//# - Ссылка: String, nullable = false
//# - Ширина: Int, nullable = false
//# - Высота: Int, nullable = false
//# - Сообщение: отношение ManyToOne к сущности Message

@Entity("picture")
export class Picture extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image_ling: string;

  @Column()
  width_px: number;

  @Column()
  height_px: number;

  @ManyToOne(() => Message, (message) => message.pictures, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "message_id",
  })
  message: Message;
}
