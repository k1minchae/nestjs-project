import {
  Controller,
  Post as HttpPost,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Like')
@Controller('/like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpPost(':postId')
  @ApiOperation({ summary: '게시글 좋아요 토글' })
  @ApiResponse({ status: 200, description: '좋아요 상태 반환' })
  async toggleLike(@Param('postId') postId: number, @Req() req: any) {
    return this.likeService.toggleLike(postId, req.user.user_id);
  }
}
