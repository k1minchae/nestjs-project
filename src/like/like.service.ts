import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './like.entity';
import { Post } from '../post/post.entity';
import { User } from '../user/user.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * 좋아요 토글
   * - 이미 좋아요가 눌린 경우: 좋아요 취소
   * - 좋아요가 눌리지 않은 경우: 좋아요 추가
   */
  async toggleLike(
    postId: number,
    userId: number,
  ): Promise<{ liked: boolean }> {
    const post = await this.postRepo.findOneBy({ post_id: postId });
    if (!post || post.is_delete)
      throw new NotFoundException('게시글이 존재하지 않습니다.');

    const user = await this.userRepo.findOneBy({ user_id: userId });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    let like = await this.likeRepo.findOne({
      where: { post: { post_id: postId }, user: { user_id: userId } },
    });

    if (like) {
      like.liked = !like.liked;
      like.updated_at = new Date();
    } else {
      like = this.likeRepo.create({
        post,
        user,
        liked: true,
        updated_at: new Date(),
      });
    }

    await this.likeRepo.save(like);
    return { liked: like.liked };
  }
}
