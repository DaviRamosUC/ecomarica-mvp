import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';
import { AppModule } from './app.module';

// fotoEvidenciaUrl chega como data URL base64 (sem upload multipart/S3, fora
// do escopo do MVP), então o corpo JSON precisa acomodar fotos de câmera
// (facilmente vários MB) muito além do limite padrão de 100kb do Express.
const JSON_BODY_LIMIT = '15mb';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(json({ limit: JSON_BODY_LIMIT }));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3333);
}
void bootstrap();
