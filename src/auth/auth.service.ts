// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(user: User) {
    const payload = { sub: user.user_id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
