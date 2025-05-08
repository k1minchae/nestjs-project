// src/post/dto/create-post.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: '제목입니당', description: '게시글 제목' })
  post_title: string;

  @ApiProperty({ example: '내용입니당', description: '게시글 내용' })
  post_content: string;

  @ApiProperty({
    description: '이미지 URL 배열',
    type: [String],
    example: ['https://picsum.photos/200/300', 'https://picsum.photos/300/300'],
  })
  images?: string[];
}
