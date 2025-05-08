import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiProperty({ example: '홍길돈', description: '수정할 이름' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiProperty({ example: '길돈돈', description: '수정할 닉네임' })
  nickname?: string;
}
