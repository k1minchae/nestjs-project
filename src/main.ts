import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';

// NODE_ENV에 따라 환경변수 파일 선택
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
config({ path: envFile });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // 개발 환경일 경우 요청 로그 미들웨어 활성화
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      const { method, originalUrl } = req;
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        const log = `${method} ${originalUrl} ${res.statusCode} ${res.statusMessage} - ${duration}ms`;
        console.log(log);
      });

      next();
    });
  }

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Board API')
    .setDescription('게시판 API 문서입니다')
    .setVersion('1.0')
    .addTag('user')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
