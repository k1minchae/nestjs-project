// src/post/dto/post.read.list.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PostResponseListDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  view_count: number;

  @ApiProperty()
  like_count: number;

  @ApiProperty()
  comment_count: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ required: false })
  popularity_score?: number;

  @ApiProperty({ required: false })
  image_count?: number;

  @ApiProperty({ required: false })
  file_count?: number;
}
