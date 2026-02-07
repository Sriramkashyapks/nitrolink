import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS - allow all origins for hackathon
  app.enableCors({
    origin: true,  // Allows all origins
    credentials: true,
  });
  
  const port = process.env.PORT || 5001;
  
  // IMPORTANT: Bind to 0.0.0.0 for Railway
  await app.listen(port, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
