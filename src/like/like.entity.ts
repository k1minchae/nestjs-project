import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Like")
export class Like {
  @PrimaryGeneratedColumn({ type: "bigint" })
  like_id: number;

  @Column()
  user_id: number;

  @Column()
  post_id: number;

  @Column({ default: true })
  liked: boolean;

  @Column()
  updated_at: Date;
}
