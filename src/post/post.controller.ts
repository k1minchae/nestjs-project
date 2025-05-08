// src/post/post.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostResponseListDto } from './dto/post.response.list.dto';
import { PostQueryListDto } from './dto/post.query.list.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/post.create.dto';
import { PostDetailResponseDto } from './dto/post.detail.response.dto';
import { UpdatePostDto } from './dto/post.update.dto';

@ApiTags('Post')
@Controller('/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // 전체 게시글 조회
  @Get()
  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiQuery({ name: 'sort', enum: ['recent', 'popular'], required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PostResponseListDto, isArray: true })
  async getPosts(@Query() query: PostQueryListDto) {
    return this.postService.getPostList(query);
  }

  // 게시글 생성
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '게시글 작성 (파일 업로드 + 이미지 URL 등록)',
    description: '파일은 직접 업로드하며, 이미지는 URL로만 등록합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        post_title: { type: 'string' },
        post_content: { type: 'string' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            example: 'https://picsum.photos/200/300',
          },
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async createPost(
    @Body() dto: CreatePostDto,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userId = req.user.user_id;
    console.log('토큰잘들어왔는지 확인@@: ', userId);
    return this.postService.createPost(dto, files, userId);
  }

  // 게시글 상세 조회
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({
    summary: '게시글 상세 조회',
    description:
      '게시글 내용, 첨부파일, 이미지, 작성자, 좋아요 수, 내가 좋아요 눌렀는지 여부, 댓글 및 대댓글까지 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '게시글 ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '게시글 상세 조회 성공',
    type: PostDetailResponseDto,
  })
  async getPostDetail(
    @Param('id') id: number,
    @Req() req: any,
  ): Promise<PostDetailResponseDto> {
    const userId = req.user.user_id;
    return this.postService.getPostDetail(id, userId);
  }

  // 게시글 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch(':postId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '게시글 수정 (이미지 및 파일 포함)',
    description:
      '작성자만 수정할 수 있습니다. 이미지 URL 및 업로드 파일 모두 수정 가능합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        post_title: { type: 'string' },
        post_content: { type: 'string' },
        images: {
          type: 'array',
          items: { type: 'string' },
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiResponse({ status: 200, description: '수정 성공' })
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: UpdatePostDto,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('DTO 확인@@@@: ', dto);
    await this.postService.updatePost(postId, req.user.user_id, dto, files);
    return { message: '게시글이 수정되었습니다.' };
  }

  // 게시글 삭제
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':postId')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '작성자만 삭제할 수 있습니다.',
  })
  @ApiParam({ name: 'postId', type: Number })
  @ApiResponse({ status: 200, description: '게시글 삭제 성공' })
  async deletePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: any,
  ) {
    await this.postService.deletePost(postId, req.user.user_id);
    return { message: '게시글이 삭제되었습니다.' };
  }
}
