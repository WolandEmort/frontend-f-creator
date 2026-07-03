import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, name } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        'Користувач з таким email вже існує',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // eslint-disable-next-line
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Невірні облікові дані');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірні облікові дані');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: userWithoutPassword,
    };
  }
}
