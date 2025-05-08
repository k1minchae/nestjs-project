import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
  @IsEmail()
  @ApiProperty({ example: 'test@example.com', description: '이메일' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'Password123', description: '비밀번호' })
  password: string;
}
