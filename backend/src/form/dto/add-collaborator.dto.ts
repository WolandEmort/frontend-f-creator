import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddCollaboratorDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  @IsNotEmpty()
  email: string;
}
