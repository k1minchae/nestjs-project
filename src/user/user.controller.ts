import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';

interface JwtPayload {
  user_id: number;
  email: string;
}

@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  async signUp(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return {
      message: '회원가입 성공',
      user_id: user.user_id,
      email: user.email,
    };
  }

  @Post('/login')
  async login(@Body() dto: LoginDto) {
    const user = await this.userService.login(dto);
    const token = this.authService.generateToken(user);
    return {
      message: '로그인 성공',
      access_token: token,
      user: {
        id: user.user_id,
        email: user.email,
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUserById(
    @Param('id') id: string,
    @Req() req: Request & { user?: JwtPayload }, // ✅ 타입 명시
  ) {
    const targetUser = await this.userService.findById(+id);
    if (!targetUser) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const isOwner = req.user?.user_id === targetUser.user_id;

    return {
      user_id: targetUser.user_id,
      name: targetUser.name,
      nickname: targetUser.nickname,
      ...(isOwner && { email: targetUser.email }),
    };
  }
}
