import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  value: string;
}

export class SubmitResponseDto {
  @IsString()
  @IsNotEmpty({ message: "Ім'я респондента є обов'язковим" })
  respondentName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
