import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../post/post.entity';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { Like } from './like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, User, Post]), // 필요한 엔티티 등록
    forwardRef(() => AuthModule),
  ],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
