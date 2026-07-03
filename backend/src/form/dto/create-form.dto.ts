import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

export class CreateOptionDto {
  @IsString()
  text: string;

  @IsInt()
  order: number;
}

export class CreateQuestionDto {
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsOptional()
  options?: CreateOptionDto[];

  @IsObject()
  @IsOptional()
  validationRules?: Record<string, any>;
}

export class CreateFormDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
