import { ApiProperty } from '@nestjs/swagger';

export class CommentDeleteResponseDto {
  @ApiProperty({ example: '댓글이 삭제되었습니다.' })
  message: string;
}
