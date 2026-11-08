import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rawCors = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const configuredOrigins = rawCors
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      // Check configured origins, wildcard, or common trusted domain patterns
      const isAllowed =
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.devesec.com') ||
        normalizedOrigin.endsWith('.icontainer.run') ||
        normalizedOrigin.includes('localhost') ||
        normalizedOrigin.includes('127.0.0.1');

      if (isAllowed) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  });

  // Disable X-Powered-By header for security hardening
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && typeof (httpAdapter as any).getInstance === 'function') {
    (httpAdapter.getInstance() as any)?.disable?.('x-powered-by');
  }

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 NestJS Backend running at: http://localhost:${port}/api`);
}

bootstrap();
