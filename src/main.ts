import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuring Swagger documentation options
  const options = new DocumentBuilder()
    .setTitle('Henry Challenge - Courses')
    .setDescription('API REST for new courses functionality by Agustín Prado.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  // Documentation route
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
