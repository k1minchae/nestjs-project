// src/post/post.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Repository } from 'typeorm';
import { PostResponseListDto } from './dto/post.response.list.dto';
import { PostQueryListDto } from './dto/post.query.list.dto';
import { CreatePostDto } from './dto/post.create.dto';
import { Files } from '../files/file.entity';
import { Images } from '../files/image.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(Files)
    private readonly fileRepo: Repository<Files>,

    @InjectRepository(Images)
    private readonly imageRepo: Repository<Images>,
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
        comment_count: post.comments.length,
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
      comment_count: post.comments.length,
      created_at: post.created_at,
      popularity_score:
        post.view_count + post.likes.length * 2 + post.comments.length * 1.5,
    }));
  }

  // 게시글 작성
  // 파일 업로드 및 이미지 URL 등록
  async createPost(
    dto: CreatePostDto,
    files: Express.Multer.File[],
    userId: number,
  ) {
    const post = this.postRepo.create({
      post_title: dto.post_title,
      post_content: dto.post_content,
      user_id: userId,
      created_at: new Date(),
    });

    const savedPost = await this.postRepo.save(post);

    // ✅ 이미지 URL 등록 (없을 수도 있으므로 안전하게 처리)
    const imageUrls = Array.isArray(dto.images)
      ? dto.images
      : dto.images
        ? [dto.images]
        : [];

    if (imageUrls.length > 0) {
      const imageEntities = imageUrls.map((url) =>
        this.imageRepo.create({
          image_url: url,
          post: savedPost,
        }),
      );
      await this.imageRepo.save(imageEntities);
    }

    // ✅ 파일 업로드 처리 (files는 Express.Multer.File[]이므로 바로 사용 가능)
    if (files?.length) {
      const fileEntities = files.map((file) =>
        this.fileRepo.create({
          file_title: file.originalname,
          file_path: file.path,
          file_size: file.size,
          file_type: file.mimetype,
          post: savedPost,
        }),
      );
      await this.fileRepo.save(fileEntities);
    }

    return savedPost;
  }
}
