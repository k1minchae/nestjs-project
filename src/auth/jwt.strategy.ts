import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'secretKey',
    });
  }

  async validate(payload: any) {
    // console.log('jwt payload @@@@@@@@@:', payload);

    return {
      user_id: payload.user_id,
      email: payload.email,
    };
  }
}
