import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Files } from 'src/files/file.entity';
import { Images } from 'src/files/image.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/user/user.entity';
import { Like } from 'src/like/like.entity';
import { Comment } from 'src/comment/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Files, Images, User, Like, Comment]),
    forwardRef(() => AuthModule),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
