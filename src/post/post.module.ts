import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Files } from 'src/files/file.entity';
import { Images } from 'src/files/image.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Files, Images]),
    forwardRef(() => AuthModule),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
