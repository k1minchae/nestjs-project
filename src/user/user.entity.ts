import { Like } from 'src/like/like.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  user_id: number;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 20 })
  nickname: string;

  @Column({ default: false })
  is_delete: boolean;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @Column({ nullable: true, type: 'text' })
  refresh_token: string | null;

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
