import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Post } from '../post/post.entity';
import { User } from '../user/user.entity';
import { CreateCommentDto } from './dto/comment.create.dto';
import { CommentResponseDto } from './dto/comment.response.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createComment(
    postId: number,
    userId: number,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const post = await this.postRepo.findOneByOrFail({ post_id: postId });
    if (!post || post.is_delete) {
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    const user = await this.userRepo.findOneByOrFail({ user_id: userId });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    let parent: Comment | null = null;
    if (dto.parent_comment_id) {
      parent = await this.commentRepo.findOneByOrFail({
        comment_id: dto.parent_comment_id,
      });
      if (!parent)
        throw new NotFoundException('부모 댓글이 존재하지 않습니다.');
    }

    const comment = this.commentRepo.create({
      post,
      user,
      parent: parent ?? undefined,
      comment_content: dto.comment_content,
      created_at: new Date(),
    });
    const saveComment = await this.commentRepo.save(comment);

    const responseDto: CommentResponseDto = {
      comment_id: saveComment.comment_id,
      comment_content: saveComment.comment_content,
      parent_comment_id: saveComment.parent?.comment_id ?? null,
      created_at: saveComment.created_at,
      user_id: saveComment.user.user_id,
      user_name: saveComment.user.name,
      user_nickname: saveComment.user.nickname,
      post: {
        post_id: saveComment.post.post_id,
        post_title: saveComment.post.post_title,
        post_content: saveComment.post.post_content,
        created_at: saveComment.post.created_at,
      },
    };

    return responseDto;
  }
}
