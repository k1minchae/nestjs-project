import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Access Token + Refresh Token 발급
   */
  generateTokens(payload: { user_id: number; email: string }) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? 'access-secret',
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh Token 저장 (로그인 또는 재발급 시)
   */
  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.userRepo.update(userId, { refresh_token: refreshToken });
  }

  /**
   * Refresh Token 무효화 (로그아웃)
   */
  async removeRefreshToken(userId: number): Promise<void> {
    await this.userRepo.update(userId, {
      refresh_token: null as string | null,
    });
  }

  /**
   * Access Token 재발급 (선택 구현)
   */
  async reissueAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
      });

      const user = await this.userRepo.findOne({
        where: { user_id: payload.user_id },
      });

      if (!user || user.refresh_token !== refreshToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      const newAccessToken = this.jwtService.sign(
        { user_id: user.user_id, email: user.email },
        {
          secret: process.env.JWT_SECRET ?? 'access-secret',
          expiresIn: '1h',
        },
      );

      return { accessToken: newAccessToken };
    } catch (e) {
      throw new UnauthorizedException('리프레시 토큰 검증 실패');
    }
  }
}
