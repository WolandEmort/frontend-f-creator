import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Обов'язково експортуємо, щоб інші сервіси мали до нього доступ
})
export class PrismaModule {}
