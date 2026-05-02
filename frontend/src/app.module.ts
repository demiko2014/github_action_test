import { Module } from "@nestjs/common";
import { FelicaModule } from "./felica/felica.module";

@Module({
  imports: [FelicaModule],
})
export class AppModule {}
