import {
  Body,
  Controller,
  Post as HttpPost,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/comment.create.dto';
import { CommentService } from './comment.service';
import { CommentDeleteResponseDto } from './dto/comment.delete.response.dto';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpPost(':postId')
  @ApiOperation({ summary: '게시글에 댓글 작성' })
  async createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.commentService.createComment(postId, req.user.user_id, dto);
  }

  // 댓글 삭제
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':commentId')
  @ApiOperation({ summary: '댓글 삭제 (작성자만 가능)' })
  @ApiResponse({ status: 200, type: CommentDeleteResponseDto })
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: any,
  ): Promise<CommentDeleteResponseDto> {
    const userId = req.user.user_id;
    await this.commentService.deleteComment(commentId, userId);
    return { message: '댓글이 삭제되었습니다.' };
  }
}
