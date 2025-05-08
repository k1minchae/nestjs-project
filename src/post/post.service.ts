// src/post/post.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets } from 'typeorm';
import { Post } from './post.entity';
import { Repository } from 'typeorm';
import { PostResponseListDto } from './dto/post.response.list.dto';
import { PostQueryListDto } from './dto/post.query.list.dto';
import { CreatePostDto } from './dto/post.create.dto';
import { Files } from '../files/file.entity';
import { Images } from '../files/image.entity';
import { Like } from '../like/like.entity';
import { Comment } from '../comment/comment.entity';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import {
  ParentCommentDto,
  PostDetailResponseDto,
  ReplyCommentDto,
} from './dto/post.detail.response.dto';
import { User } from 'src/user/user.entity';
import { UpdatePostDto } from './dto/post.update.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(Files)
    private readonly fileRepo: Repository<Files>,

    @InjectRepository(Images)
    private readonly imageRepo: Repository<Images>,
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
        view_count: post.views ?? 0,
        like_count: post.likes?.filter((c) => c.liked).length ?? 0,
        comment_count: post.comments?.filter((c) => !c.is_delete).length ?? 0,
        image_count: post.images?.filter((i) => !i.is_delete).length ?? 0,
        file_count: post.files?.filter((f) => !f.is_delete).length ?? 0,
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
      view_count: post.views ?? 0,
      like_count: post.likes?.filter((c) => c.liked).length ?? 0,
      comment_count: post.comments?.filter((c) => !c.is_delete).length ?? 0,
      image_count: post.images?.filter((i) => !i.is_delete).length ?? 0,
      file_count: post.files?.filter((f) => !f.is_delete).length ?? 0,
      created_at: post.created_at,
      popularity_score: this.calculatePopularityScore(
        post.view_count ?? 0,
        post.likes?.filter((c) => c.liked).length ?? 0,
        post.comments?.filter((c) => !c.is_delete).length ?? 0,
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
    const user = await this.userRepo.findOneByOrFail({ user_id: userId });

    const post = this.postRepo.create({
      post_title: dto.post_title,
      post_content: dto.post_content,
      user: { user_id: user.user_id },
      created_at: new Date(),
    });

    const savedPost = await this.postRepo.save(post);

    // 이미지 URL 등록 (없을 수도 있으므로)
    const imageUrls: string[] = Array.isArray(dto.images)
      ? dto.images
      : typeof dto.images === 'string'
        ? (dto.images as string).split(',').map((url) => url.trim())
        : [];
    // console.log('이미지 url 받아오기 @@@@: ', imageUrls);

    if (imageUrls.length > 0) {
      const imageEntities = imageUrls.map((url) =>
        this.imageRepo.create({
          image_url: url,
          post: savedPost,
        }),
      );
      await this.imageRepo.save(imageEntities);
      // console.log('이미지 엔티티들 @@@@: ', imageEntities);
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

  // 게시글 상세 보기
  async getPostDetail(
    postId: number,
    userId: number,
  ): Promise<PostDetailResponseDto> {
    const post = await this.postRepo.findOne({
      where: { post_id: postId, is_delete: false },
      relations: ['user'],
    });

    if (!post) throw new NotFoundException('게시글이 존재하지 않습니다.');

    const [files, images, likes, comments] = await Promise.all([
      this.fileRepo.find({
        where: { post: { post_id: postId }, is_delete: false },
      }),
      this.imageRepo.find({
        where: { post: { post_id: postId }, is_delete: false },
      }),
      this.likeRepo.find({ where: { post: { post_id: postId } } }),
      this.commentRepo.find({
        where: { post: { post_id: postId }, is_delete: false },
        relations: ['user', 'parent', 'parent.user'],
        order: { created_at: 'ASC' },
      }),
    ]);

    const likeCount = likes.filter((l) => l.liked).length;
    const isLikedByMe = likes.some((l) => l.user.user_id === userId && l.liked);

    const parentComments: ParentCommentDto[] = comments
      .filter((c) => !c.parent)
      .map((parent) => ({
        comment_id: parent.comment_id,
        content: parent.comment_content,
        created_at: parent.created_at,
        user: {
          user_id: parent.user.user_id,
          nickname: parent.user.nickname,
        },
        // 삭제된 댓글은 제외
        replies: comments
          .filter(
            (c) => c.parent?.comment_id === parent.comment_id && !c.is_delete,
          )
          .map(
            (reply): ReplyCommentDto => ({
              comment_id: reply.comment_id,
              content: reply.comment_content,
              created_at: reply.created_at,
              parent_comment_id: parent.comment_id,
              parent_user: {
                user_id: parent.user.user_id,
                nickname: parent.user.nickname,
              },
              user: {
                user_id: reply.user.user_id,
                nickname: reply.user.nickname,
              },
            }),
          ),
      }));

    // 게시글 조회수 증가
    await this.postRepo.increment({ post_id: postId }, 'views', 1);

    return {
      id: post.post_id,
      title: post.post_title,
      content: post.post_content,
      view_count: post.views ?? 0,
      like_count: likeCount,
      is_liked_by_me: isLikedByMe,
      author: {
        user_id: post.user.user_id,
        nickname: post.user.nickname,
      },
      files: files.map((f) => ({
        file_id: f.file_id,
        file_title: f.file_title,
        file_path: f.file_path,
        file_type: f.file_type,
        file_size: f.file_size,
      })),
      images: images.map((i) => ({
        image_id: i.image_id,
        image_url: i.image_url,
      })),
      comments: parentComments,
    };
  }

  // 게시글 수정
  async updatePost(
    postId: number,
    userId: number,
    dto: UpdatePostDto,
    files: Express.Multer.File[],
  ): Promise<void> {
    const post = await this.postRepo.findOne({
      where: { post_id: postId },
      relations: ['user', 'images', 'files'],
    });
    console.log('수정할 게시글 @@@@: ', post);

    if (!post || post.is_delete)
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    if (post.user_id !== userId)
      throw new ForbiddenException('수정 권한이 없습니다.');

    post.post_title = dto.post_title ?? post.post_title;
    post.post_content = dto.post_content ?? post.post_content;
    post.updated_at = new Date();
    await this.postRepo.save(post);

    console.log('기존 이미지 @@@@: ', post.images);

    // 이미지 전체 삭제 후 재등록
    if (post.images?.length) {
      await this.imageRepo.update(
        { post: { post_id: postId } },
        { is_delete: true },
      );
    }
    const imageUrls: string[] = Array.isArray(dto.images)
      ? dto.images.filter((url) => url && url.trim() !== '')
      : typeof dto.images === 'string'
        ? (dto.images as string)
            .split(',')
            .map((url) => url.trim())
            .filter((url) => url !== '')
        : [];

    console.log('수정할 이미지 url @@@@: ', imageUrls);

    if (imageUrls.length > 0) {
      const imageEntities = imageUrls.map((url) =>
        this.imageRepo.create({
          image_url: url,
          post: post,
        }),
      );
      await this.imageRepo.save(imageEntities);
    }

    // 파일 전체 삭제 후 재등록
    if (post.files?.length) {
      await this.fileRepo.update(
        { post: { post_id: postId } },
        { is_delete: true },
      );
    }
    const timestamp = Date.now();
    const baseDir = 'uploads';

    const fileEntities = files.map((file) => {
      const ext = extname(file.originalname);
      const filePath = `${baseDir}/${userId}/${ext}/${timestamp}-${uuid()}`;

      return this.fileRepo.create({
        file_title: file.originalname,
        file_path: filePath,
        file_size: file.size,
        file_type: file.mimetype,
        post,
      });
    });

    await this.fileRepo.save(fileEntities);
  }

  // 게시글 삭제
  // soft delete 처리
  async deletePost(postId: number, userId: number): Promise<void> {
    const post = await this.postRepo.findOne({
      where: { post_id: postId },
      relations: ['user', 'images', 'files'],
    });

    if (!post || post.is_delete) {
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    if (post.user.user_id !== userId) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    // 게시글 soft delete
    post.is_delete = true;
    post.updated_at = new Date();
    await this.postRepo.save(post);

    // 첨부 이미지 soft delete
    if (post.images?.length) {
      await this.imageRepo.update(
        { post: { post_id: postId } },
        { is_delete: true },
      );
    }

    // 첨부 파일 soft delete
    if (post.files?.length) {
      await this.fileRepo.update(
        { post: { post_id: postId } },
        { is_delete: true },
      );
    }
  }

  // 게시글 검색 기능
  async searchPosts(
    query: string,
    type: 'title' | 'content' | 'nickname',
    page = 1,
    limit = 10,
  ): Promise<PostResponseListDto[]> {
    const skip = (page - 1) * limit;

    // 최소 글자수 2자 이상
    if (query.length < 2) {
      throw new NotFoundException('검색어는 2자 이상이어야 합니다.');
    }

    const posts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.images', 'images', 'images.is_delete = false')
      .leftJoinAndSelect('post.files', 'files', 'files.is_delete = false')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect(
        'post.comments',
        'comments',
        'comments.is_delete = false',
      )
      .where('post.is_delete = false')
      .andWhere(
        new Brackets((qb) => {
          if (type === 'title') {
            qb.where('post.post_title ILIKE :query', { query: `%${query}%` });
          } else if (type === 'content') {
            qb.where('post.post_content ILIKE :query', { query: `%${query}%` });
          } else if (type === 'nickname') {
            qb.where('user.nickname ILIKE :query', { query: `%${query}%` });
          } else {
            // 기본: 제목 + 내용 + 닉네임 전체 검색
            qb.where('post.post_title ILIKE :query', { query: `%${query}%` })
              .orWhere('post.post_content ILIKE :query', {
                query: `%${query}%`,
              })
              .orWhere('user.nickname ILIKE :query', { query: `%${query}%` });
          }
        }),
      )
      .orderBy('post.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return posts.map((post) => ({
      id: post.post_id,
      title: post.post_title,
      view_count: post.views ?? 0,
      like_count: post.likes?.filter((l) => l.liked).length ?? 0,
      comment_count: post.comments?.filter((c) => !c.is_delete).length ?? 0,
      image_count: post.images?.filter((i) => !i.is_delete).length ?? 0,
      file_count: post.files?.filter((f) => !f.is_delete).length ?? 0,
      created_at: post.created_at,
    }));
  }
}
