import { ApiProperty } from '@nestjs/swagger';

export class PostFileDto {
  @ApiProperty()
  file_id: number;

  @ApiProperty()
  file_title: string;

  @ApiProperty()
  file_path: string;

  @ApiProperty()
  file_type: string;

  @ApiProperty()
  file_size: number;
}

export class PostImageDto {
  @ApiProperty()
  image_id: number;

  @ApiProperty()
  image_url: string;
}

export class PostUserDto {
  @ApiProperty()
  user_id: number;

  @ApiProperty()
  nickname: string;
}

export class ReplyCommentDto {
  @ApiProperty()
  comment_id: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  parent_comment_id: number;

  @ApiProperty({ type: () => PostUserDto })
  parent_user: PostUserDto;

  @ApiProperty({ type: () => PostUserDto })
  user: PostUserDto;

  @ApiProperty()
  created_at: Date;
}

export class ParentCommentDto {
  @ApiProperty()
  comment_id: number;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: () => PostUserDto })
  user: PostUserDto;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ type: () => [ReplyCommentDto] })
  replies: ReplyCommentDto[];
}

export class PostDetailResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: () => PostUserDto })
  author: PostUserDto;

  @ApiProperty()
  view_count: number;

  @ApiProperty()
  like_count: number;

  @ApiProperty()
  is_liked_by_me: boolean;

  @ApiProperty({ type: () => [PostFileDto] })
  files: PostFileDto[];

  @ApiProperty({ type: () => [PostImageDto] })
  images: PostImageDto[];

  @ApiProperty({ type: () => [ParentCommentDto] })
  comments: ParentCommentDto[];
}
