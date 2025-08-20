import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors();

  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("Subscription Manager API")
    .setDescription("API documentation for subscription management")
    .setVersion("1.0")
    .addTag("users")
    .addTag("charges")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Server running on port ${port}`);
  console.log(`API available at: http://localhost:${port}/api`);
  console.log(
    `API Documentation available at: http://localhost:${port}/api/docs`
  );
}

bootstrap();
