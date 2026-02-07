import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Vercel frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',           // Local development
      'https://*.vercel.app',            // Any Vercel deployment
      /^https:\/\/.*\.vercel\.app$/,    // Vercel deployment regex
    ],
    credentials: true,
  });

  const port = process.env.PORT || 5001;
  await app.listen(port);
}
bootstrap();
