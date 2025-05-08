import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({ description: '게시글 제목', maxLength: 255 })
  @IsOptional()
  @IsString()
  post_title?: string;

  @ApiPropertyOptional({ description: '게시글 내용', maxLength: 70000 })
  @IsOptional()
  @IsString()
  post_content?: string;

  @ApiPropertyOptional({
    description: '이미지 URL 배열',
    type: [String],
    example: ['https://picsum.photos/200/300', 'https://picsum.photos/300/300'],
  })
  @IsOptional()
  @IsString({ each: true })
  images?: string[];
}
