import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // فقط فیلدهای تعریف‌شده در DTO
      forbidNonWhitelisted: true,   // اگر فیلد اضافه بیاد → خطا
      transform: true,              // استفاده از class-transformer
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,   // برای جلوگیری از خطای 500 روی ورودی ناشناخته
      // errorHttpStatusCode: 422,  // (اختیاری) اگر بخوای خطای ولیدیشن به جای 400 → 422 بشه
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000', // فرانت Next
    credentials: true,
  });

  await app.listen(3001);
  console.log(`🚀 Students API is running on: http://localhost:3001`);
}

bootstrap();
