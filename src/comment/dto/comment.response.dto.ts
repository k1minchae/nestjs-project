import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({ type: Number })
  comment_id: number;

  @ApiProperty({ type: String })
  comment_content: string;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: String })
  user_name: string;

  @ApiProperty({ type: String })
  user_nickname: string;

  @ApiProperty({ type: Number, nullable: true })
  parent_comment_id: number | null;

  @ApiProperty({
    type: 'object',
    properties: {
      post_id: { type: 'number' },
      post_title: { type: 'string' },
      post_content: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' },
    },
  })
  post: {
    post_id: number;
    post_title: string;
    post_content: string;
    created_at: Date;
  };
}
