import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Azure App Service はポート 8080 を使用する
  const port = process.env.PORT ?? 8080;

  // フロントエンド CLI からのリクエストを許可
  app.enableCors();

  // グローバルプレフィックス
  app.setGlobalPrefix("api");

  await app.listen(port);
  console.log(`Backend API running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
