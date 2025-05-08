import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '이 글 정말 유익하네요!',
    maxLength: 1000,
  })
  comment_content: string;

  @ApiProperty({
    description: '댓글을 작성할 게시글 ID',
    example: 1,
  })
  post_id: number;

  @ApiPropertyOptional({
    description: '부모 댓글 ID (대댓글인 경우에만 포함)',
    example: 5,
  })
  @IsOptional()
  parent_comment_id?: number;
}
