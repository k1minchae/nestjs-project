import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    console.log('받은 요청:', dto);
    const user = await this.userService.login(dto);
    return {
      message: '로그인 성공',
      user_id: user.user_id,
      email: user.email,
    };
  }
}
