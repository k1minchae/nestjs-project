import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Post")
export class Post {
  @PrimaryGeneratedColumn({ type: "bigint" })
  post_id: number;

  @Column()
  user_id: number;

  @Column({ default: 0 })
  views: number;

  @Column({ length: 255, nullable: true })
  post_title: string;

  @Column({ length: 70000, nullable: true })
  post_content: string;

  @Column({ default: false })
  is_delete: boolean;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at?: Date;
}
