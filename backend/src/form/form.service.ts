import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { AddCollaboratorDto } from './dto/add-collaborator.dto';

@Injectable()
export class FormService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.form.findMany({
      where: {
        OR: [
          { userId: userId },
          { collaborators: { some: { userId: userId } } },
        ],
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });
  }

  async create(data: CreateFormDto, userId: string) {
    const newForm = await this.prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        user: {
          connect: { id: userId },
        },
        questions: {
          create: data.questions.map((question) => ({
            type: question.type,
            title: question.title,
            description: question.description,
            isRequired: question.isRequired,
            order: question.order,
            validationRules: question.validationRules,
            options:
              question.options && question.options.length > 0
                ? {
                    create: question.options.map((option) => ({
                      text: option.text,
                      order: option.order,
                    })),
                  }
                : undefined,
          })),
        },
      },

      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return newForm;
  }

  async findOne(id: string, userId: string) {
    // 1. Знаходимо форму та підтягуємо список співавторів
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        collaborators: true,
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Форму не знайдено');
    }

    // 2. Перевіряємо права доступу на рівні коду
    const isOwner = form.userId === userId;
    const isCollaborator = form.collaborators.some((c) => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException('У вас немає доступу до цієї форми');
    }

    return form;
  }

  async update(id: string, userId: string, data: CreateFormDto) {
    // 1. Знаходимо форму та перевіряємо права
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: { collaborators: true },
    });

    if (!form) {
      throw new NotFoundException('Форму не знайдено');
    }

    const isOwner = form.userId === userId;
    const isCollaborator = form.collaborators.some((c) => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException('У вас немає доступу до редагування');
    }

    // 2. Оновлюємо дані
    const updatedForm = await this.prisma.form.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        questions: {
          deleteMany: {},
          create: data.questions.map((question) => ({
            type: question.type,
            title: question.title,
            description: question.description,
            isRequired: question.isRequired,
            order: question.order,
            validationRules: question.validationRules,
            options:
              question.options && question.options.length > 0
                ? {
                    create: question.options.map((option) => ({
                      text: option.text,
                      order: option.order,
                    })),
                  }
                : undefined,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return updatedForm;
  }

  async getPublicForm(id: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Форму не знайдено');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, ...publicData } = form;
    return publicData;
  }

  async submitResponse(formId: string, data: SubmitResponseDto) {
    const formExists = await this.prisma.form.findUnique({
      where: { id: formId },
    });
    if (!formExists) {
      throw new NotFoundException('Форму не знайдено');
    }

    const response = await this.prisma.response.create({
      data: {
        formId,
        respondentName: data.respondentName,
        answers: {
          create: data.answers.map((ans) => ({
            questionId: ans.questionId,
            value: ans.value,
          })),
        },
      },
    });

    return response;
  }

  async remove(id: string, userId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      throw new NotFoundException('Форму не знайдено');
    }

    if (form.userId !== userId) {
      throw new ForbiddenException('У вас немає прав для видалення цієї форми');
    }

    await this.prisma.form.delete({
      where: { id },
    });

    return { message: 'Форму успішно видалено' };
  }

  async getResponses(id: string, userId: string) {
    // 1. Знаходимо форму та перевіряємо права
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: { collaborators: true },
    });

    if (!form) {
      throw new NotFoundException('Форму не знайдено');
    }

    const isOwner = form.userId === userId;
    const isCollaborator = form.collaborators.some((c) => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException(
        'У вас немає доступу до відповідей цієї форми',
      );
    }

    // 2. Повертаємо відповіді
    return this.prisma.response.findMany({
      where: { formId: id },
      orderBy: { created_at: 'desc' },
      include: {
        answers: true,
      },
    });
  }

  async addCollaborator(
    formId: string,
    ownerId: string,
    data: AddCollaboratorDto,
  ) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });

    if (!form) {
      throw new NotFoundException('Форму не знайдено');
    }
    if (form.userId !== ownerId) {
      throw new ForbiddenException('Тільки власник може додавати співавторів');
    }

    const userToAdd = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!userToAdd) {
      throw new NotFoundException('Користувача з таким email не знайдено');
    }

    if (userToAdd.id === ownerId) {
      throw new BadRequestException('Ви не можете додати себе як співавтора');
    }

    const collaborator = await this.prisma.formCollaborator.upsert({
      where: {
        formId_userId: {
          formId: form.id,
          userId: userToAdd.id,
        },
      },
      update: {},
      create: {
        formId: form.id,
        userId: userToAdd.id,
      },
    });

    return { message: 'Співавтора успішно додано', collaborator };
  }

  async removeCollaborator(
    formId: string,
    ownerId: string,
    collaboratorUserId: string,
  ) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });

    if (!form || form.userId !== ownerId) {
      throw new ForbiddenException('Тільки власник може видаляти співавторів');
    }

    await this.prisma.formCollaborator.deleteMany({
      where: {
        formId: formId,
        userId: collaboratorUserId,
      },
    });

    return { message: 'Співавтора видалено' };
  }

  async getCollaborators(formId: string, userId: string) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });

    if (!form || form.userId !== userId) {
      throw new ForbiddenException('Немає доступу');
    }

    return this.prisma.formCollaborator.findMany({
      where: { formId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
