import { Post } from 'src/post/post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('File')
export class Files {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  file_id: number;

  @Column({ length: 56 })
  file_title: string;

  @Column({ length: 2048 })
  file_path: string;

  @Column()
  file_size: number;

  @Column({ length: 126 })
  file_type: string;

  @Column({ default: false })
  is_delete: boolean;

  @ManyToOne(() => Post, (post) => post.files)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
