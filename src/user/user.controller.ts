import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Patch,
  Req,
  Get,
  Delete,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { DeleteUserDto } from './dto/user.delete.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserUpdateDto } from './dto/user.update.dto';

interface JwtPayload {
  user_id: number;
  email: string;
}

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  @ApiOperation({
    summary: '회원가입',
    description: '새로운 사용자를 생성합니다.',
  })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  async signUp(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return {
      message: '회원가입 성공',
      user_id: user.user_id,
      email: user.email,
    };
  }

  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response, // ✅ Express 응답 객체 사용
  ) {
    const user = await this.userService.validateUser(dto);
    // console.log('user:', user);
    const tokens = this.authService.generateTokens({
      user_id: user.user_id,
      email: user.email,
    });
    // console.log('tokens:', tokens);
    await this.authService.saveRefreshToken(user.user_id, tokens.refreshToken);

    // ✅ Refresh Token을 HttpOnly 쿠키에 설정
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true, // ✅ HTTPS에서만 전달
      sameSite: 'strict', // ✅ CSRF 방지
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return {
      message: '로그인 성공',
      access_token: tokens.accessToken,
      user: {
        id: user.user_id,
        email: user.email,
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '유저 정보 조회',
    description:
      '특정 유저의 정보를 조회합니다. 본인일 경우 이메일이 포함됩니다.',
  })
  @ApiParam({ name: 'id', type: 'number', description: '조회할 유저의 ID' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      example: {
        user_id: 1,
        name: '홍길동',
        nickname: '길동이',
        email: 'test@example.com',
      },
    },
  })
  async getUserById(
    @Param('id') id: string,
    @Req() req: Request & { user?: JwtPayload },
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

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '로그아웃',
    description: 'Refresh Token을 무효화합니다.',
  })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@Req() req: Request & { user: { user_id: number } }) {
    // console.log('user in request:', req.user);
    await this.authService.removeRefreshToken(req.user.user_id);
    return { message: '로그아웃 완료' };
  }

  // 내 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 프로필 수정',
    description:
      '이름(name)과 닉네임(nickname)만 수정할 수 있으며, 이메일은 수정할 수 없습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
    schema: {
      example: {
        message: '프로필이 수정되었습니다.',
        user: {
          user_id: 1,
          name: '홍길동',
          nickname: '길동이',
          email: 'hong@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패 (토큰 없음 또는 만료)' })
  async updateMyProfile(
    @Req() req: Request & { user: { user_id: number } },
    @Body() dto: UserUpdateDto,
  ) {
    const userId = req.user.user_id;
    const updated = await this.userService.updateProfile(userId, dto);

    return {
      message: '프로필이 수정되었습니다.',
      user: {
        user_id: updated.user_id,
        name: updated.name,
        nickname: updated.nickname,
        email: updated.email,
      },
    };
  }

  // 회원 탈퇴 (소프트 삭제)
  @UseGuards(AuthGuard('jwt'))
  @Delete('/me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '회원 탈퇴',
    description: '비밀번호를 재확인한 후 탈퇴합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '탈퇴 완료',
    schema: {
      example: {
        message: '회원 탈퇴가 완료되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패 또는 비밀번호 불일치' })
  async deleteMyAccount(
    @Req() req: Request & { user: { user_id: number } },
    @Body() dto: DeleteUserDto,
  ) {
    await this.userService.softDelete(req.user.user_id, dto);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
