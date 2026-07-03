import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}
