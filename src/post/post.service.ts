// src/post/post.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Repository } from 'typeorm';
import { PostResponseListDto } from './dto/post.response.list.dto';
import { PostQueryListDto } from './dto/post.query.list.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async getPostList(query: PostQueryListDto): Promise<PostResponseListDto[]> {
    const { sort, page, limit } = query;
    const skip = (page - 1) * limit;

    if (sort === 'recent') {
      const posts = await this.postRepo.find({
        where: { is_delete: false },
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      });

      return posts.map((post) => ({
        id: post.post_id,
        title: post.post_title,
        view_count: post.view_count,
        like_count: post.likes.length,
        comment_count: post.comment_count,
        created_at: post.created_at,
      }));
    }

    // 인기순 정렬 (가중치 계산)
    const posts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.comments', 'comment')
      .leftJoin('post.likes', 'like')
      .where('post.is_delete = false')
      .loadRelationCountAndMap('post.comment_count', 'post.comments')
      .loadRelationCountAndMap('post.like_count', 'post.likes')
      .addSelect(
        `(post.view_count + COUNT(DISTINCT like.id) * 2 + COUNT(DISTINCT comment.id) * 1.5)`,
        'popularity_score',
      )
      .groupBy('post.id')
      .orderBy('popularity_score', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return posts.map((post) => ({
      id: post.post_id,
      title: post.post_title,
      view_count: post.view_count,
      like_count: post.likes.length,
      comment_count: post.comment_count,
      created_at: post.created_at,
      popularity_score:
        post.view_count + post.likes.length * 2 + post.comment_count * 1.5,
    }));
  }
}
