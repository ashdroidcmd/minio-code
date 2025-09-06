import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:4173',
      'https://acebookv2.172.16.10.70.nip.io',
      'http://acebookv2.172.16.10.70.nip.io',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3002);
}

bootstrap();
