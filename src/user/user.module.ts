import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Comment } from '../comment/comment.entity';
import { Post } from '../post/post.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Comment, Post]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
