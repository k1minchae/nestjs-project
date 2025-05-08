import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Comment")
export class Comment {
  @PrimaryGeneratedColumn({ type: "bigint" })
  comment_id: number;

  @Column()
  user_id: number;

  @Column()
  post_id: number;

  @Column({ nullable: true })
  parent_comment_id: number;

  @Column({ length: 1000 })
  comment_content: string;

  @Column({ default: false })
  is_delete: boolean;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at?: Date;
}
