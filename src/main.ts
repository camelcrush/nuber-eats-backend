import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // S3 파일 업로드 할 때 Cross-Origin 권한 문제 해결을 위해 추가
  app.enableCors();
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
