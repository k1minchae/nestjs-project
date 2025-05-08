import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'test@example.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: 'Password123', description: '비밀번호' })
  @IsString()
  password: string;
}
