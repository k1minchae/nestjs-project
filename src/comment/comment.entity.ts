import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('Comment')
export class Comment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  comment_id: number;

  @ManyToOne(() => User, (user) => user.posts, { eager: false })
  @JoinColumn({ name: 'user_id' }) // 외래키 컬럼 명시
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ nullable: true })
  parent_comment_id: number;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @Column({ length: 1000 })
  comment_content: string;

  @Column({ default: false })
  is_delete: boolean;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at?: Date;
}
