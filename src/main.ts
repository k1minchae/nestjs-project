import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // ✅ Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Board API') // API 이름
    .setDescription('게시판 API 문서입니다') // 설명
    .setVersion('1.0')
    .addTag('user') // 선택 사항
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // /api 경로에 Swagger UI 생성

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
