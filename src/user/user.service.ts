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
import { UserUpdateDto } from './dto/user.update.dto';
import { DeleteUserDto } from './dto/user.delete.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * 회원가입
   * - 이메일 중복 확인
   * - 비밀번호 해싱 후 저장
   */
  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: {
        email: dto.email,
        is_delete: false,
      },
    });

    if (existing) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    if (typeof dto.password !== 'string') {
      throw new BadRequestException('비밀번호는 문자열로 전달해주세요.');
    }

    const hashedPw = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPw,
      created_at: new Date(),
    });

    return this.userRepo.save(user);
  }

  /**
   * 유저 인증
   * - 이메일 & 비밀번호 확인
   * - 유저 정보만 반환 (토큰 발급은 AuthService에서)
   */
  async validateUser(dto: LoginDto): Promise<User> {
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

  /**
   * 사용자 ID로 조회
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { user_id: id, is_delete: false },
    });
  }

  /**
   * 사용자 정보 수정
   * - 이메일은 수정 불가
   */
  async updateProfile(userId: number, dto: UserUpdateDto): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { user_id: userId, is_delete: false },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 이메일은 수정 불가
    user.name = dto.name ?? user.name;
    user.nickname = dto.nickname ?? user.nickname;
    user.updated_at = new Date();

    return this.userRepo.save(user);
  }

  /**
   * 사용자 소프트 삭제
   * - is_delete 값을 true로 변경
   * - refresh_token 초기화
   */
  async softDelete(userId: number, dto: DeleteUserDto): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { user_id: userId, is_delete: false },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // 이메일이 일치하지 않으면 거부
    if (user.email !== dto.email) {
      throw new UnauthorizedException('이메일이 일치하지 않습니다.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // Soft Delete + Refresh Token 무효화
    user.is_delete = true;
    user.refresh_token = null;
    await this.userRepo.save(user);
  }
}
