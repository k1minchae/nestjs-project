// src/post/post.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResponseListDto } from './dto/post.response.list.dto';
import { PostQueryListDto } from './dto/post.query.list.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

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
}
