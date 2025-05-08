import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PostQueryListDto {
  @ApiPropertyOptional({
    description: '정렬 기준 (recent: 최신순, popular: 인기순)',
    enum: ['recent', 'popular'],
    default: 'recent',
  })
  @IsIn(['recent', 'popular'])
  @IsOptional()
  sort: 'recent' | 'popular' = 'recent';

  @ApiPropertyOptional({
    description: '페이지 번호 (1부터 시작)',
    type: Number,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: '한 페이지당 항목 수',
    type: Number,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 10;
}
