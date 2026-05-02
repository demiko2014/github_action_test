import "reflect-metadata";
import { CommandFactory } from "nest-commander";
import { AppModule } from "./app.module";

async function bootstrap() {
  // enablePositionalOptions: --mode などのオプションをサブコマンドに正しく渡す
  await CommandFactory.run(AppModule, {
    logger: ["error", "warn"],
    enablePositionalOptions: true,
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
