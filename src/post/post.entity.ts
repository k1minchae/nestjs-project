import { Like } from 'src/like/like.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Files } from 'src/files/file.entity';
import { Images } from 'src/files/image.entity';
import { Comment } from 'src/comment/comment.entity';
import { User } from 'src/user/user.entity';

@Entity('Post')
export class Post {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  post_id: number;

  @Column()
  user_id: number; // DB에는 이 값이 저장됨

  @ManyToOne(() => User, (user) => user.posts, { eager: false })
  @JoinColumn({ name: 'user_id' }) // 외래키 컬럼 명시
  user: User;

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
  view_count: number;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Files, (files) => files.post, { cascade: true })
  files: Files[];

  @OneToMany(() => Images, (images) => images.post, { cascade: true })
  images: Images[];
}
