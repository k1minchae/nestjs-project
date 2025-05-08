import { Post } from 'src/post/post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('Images')
export class Images {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  image_id: number;

  @Column()
  post_id: number;

  @Column({ length: 2048 })
  image_url: string;

  @Column({ default: false })
  is_delete: boolean;

  @ManyToOne(() => Post, (post) => post.images)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
