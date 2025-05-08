import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'test@example.com', description: '이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123', description: '비밀번호' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '홍길동', description: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '길동이', description: '닉네임' })
  @IsNotEmpty()
  nickname: string;
}
