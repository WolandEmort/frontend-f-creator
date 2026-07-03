import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddCollaboratorDto } from './dto/add-collaborator.dto';

@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Get('public/:id')
  getPublicForm(@Param('id') id: string) {
    return this.formService.getPublicForm(id);
  }

  @Post('public/:id/responses')
  submitResponse(
    @Param('id') id: string,
    @Body() submitResponseDto: SubmitResponseDto,
  ) {
    return this.formService.submitResponse(id, submitResponseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createFormDto: CreateFormDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.formService.create(createFormDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: { user: { id: string } }) {
    return this.formService.findAll(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.formService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: CreateFormDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.formService.update(id, req.user.id, updateFormDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.formService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/responses')
  getResponses(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.formService.getResponses(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/collaborators')
  addCollaborator(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
    @Body() dto: AddCollaboratorDto,
  ) {
    return this.formService.addCollaborator(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/collaborators')
  getCollaborators(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.formService.getCollaborators(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/collaborators/:userId')
  removeCollaborator(
    @Param('id') id: string,
    @Param('userId') collaboratorUserId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.formService.removeCollaborator(
      id,
      req.user.id,
      collaboratorUserId,
    );
  }
}
