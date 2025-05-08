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
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

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

  private calculatePopularityScore(
    viewCount: number,
    likeCount: number,
    commentCount: number,
  ): number {
    return viewCount + likeCount * 2 + commentCount * 1.5;
  }

  async getPostList(query: PostQueryListDto): Promise<PostResponseListDto[]> {
    const { sort, page, limit } = query;
    const skip = (page - 1) * limit;

    if (sort === 'recent') {
      const posts = await this.postRepo.find({
        where: { is_delete: false },
        order: { created_at: 'DESC' },
        skip,
        take: limit,
        relations: ['likes', 'comments', 'images', 'files'],
      });

      return posts.map((post) => ({
        id: post.post_id,
        title: post.post_title,
        view_count: post.view_count ?? 0,
        like_count: post.likes?.length ?? 0,
        comment_count: post.comments?.length ?? 0,
        image_count: post.images?.length ?? 0,
        file_count: post.files?.length ?? 0,
        created_at: post.created_at,
      }));
    }

    // 인기순 정렬
    const posts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.comments', 'comment')
      .leftJoin('post.likes', 'like')
      .leftJoinAndSelect('post.images', 'image')
      .leftJoinAndSelect('post.files', 'file')
      .where('post.is_delete = false')
      .loadRelationCountAndMap('post.comment_count', 'post.comments')
      .loadRelationCountAndMap('post.like_count', 'post.likes')
      .addSelect(
        `(post.view_count + COUNT(DISTINCT like.id) * 2 + COUNT(DISTINCT comment.id) * 1.5)`,
        'popularity_score',
      )
      .groupBy('post.post_id')
      .addGroupBy('image.post_id')
      .addGroupBy('file.post_id')
      .orderBy('popularity_score', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return posts.map((post: any) => ({
      id: post.post_id,
      title: post.post_title,
      view_count: post.view_count ?? 0,
      like_count: post.like_count ?? 0,
      comment_count: post.comment_count ?? 0,
      image_count: post.images?.length ?? 0,
      file_count: post.files?.length ?? 0,
      created_at: post.created_at,
      popularity_score: this.calculatePopularityScore(
        post.view_count ?? 0,
        post.like_count ?? 0,
        post.comment_count ?? 0,
      ),
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

    // 이미지 URL 등록 (없을 수도 있으므로 안전하게 처리)
    const imageUrls = Array.isArray(dto.images) ? dto.images : [];

    if (imageUrls.length > 0) {
      const imageEntities = imageUrls.map((url) =>
        this.imageRepo.create({
          image_url: url,
          post: savedPost,
        }),
      );
      await this.imageRepo.save(imageEntities);
    }

    // 파일 업로드 처리 (files는 Express.Multer.File[])
    if (files?.length) {
      const timestamp = Date.now();
      const baseDir = 'uploads';

      const fileEntities = files.map((file) => {
        const ext = extname(file.originalname);
        const random = uuid();
        const filePath = `${baseDir}/${userId}/${ext}/${timestamp}${random}`;

        return this.fileRepo.create({
          file_title: file.originalname,
          file_path: filePath,
          file_size: file.size,
          file_type: file.mimetype,
          post: savedPost,
        });
      });

      await this.fileRepo.save(fileEntities);
    }

    return savedPost;
  }
}
