import { Module } from "@nestjs/common";
import { CardModule } from "./card/card.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [CardModule],
  controllers: [HealthController],
})
export class AppModule {}
