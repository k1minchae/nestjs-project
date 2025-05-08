// src/post/post.controller.ts
import {
  Body,
  Controller,
  Get,
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
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/post.create.dto';

@ApiTags('Post')
@Controller('/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiQuery({ name: 'sort', enum: ['recent', 'popular'], required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PostResponseListDto, isArray: true })
  async getPosts(@Query() query: PostQueryListDto) {
    return this.postService.getPostList(query);
  }

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
}
