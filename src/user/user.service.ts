import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    // 중복 이메일 존재 여부 확인 (is_delete = false 인 경우만)
    const existing = await this.userRepo.findOne({
      where: {
        email: dto.email,
        is_delete: false,
      },
    });

    // 비밀번호 유효성 검사
    if (typeof dto.password !== 'string') {
      throw new BadRequestException('비밀번호는 문자열로 전달해주세요.');
    }

    // 이메일 중복 검사
    if (existing) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 저장
    const hashedPw = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPw,
      created_at: new Date(),
    });

    return this.userRepo.save(user);
  }

  async login(dto: LoginDto): Promise<User> {
    const user = await this.userRepo.findOne({
      where: {
        email: dto.email,
        is_delete: false,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return user;
  }
}
