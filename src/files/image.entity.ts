import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Image")
export class Image {
  @PrimaryGeneratedColumn({ type: "bigint" })
  image_id: number;

  @Column()
  post_id: number;

  @Column({ length: 2048 })
  image_url: string;

  @Column({ default: false })
  is_delete: boolean;
}
