import { Module } from "@nestjs/common";
import { FelicaService } from "./felica.service";
import { NfcReaderService } from "./nfc-reader.service";
import { ReadCommand } from "./read.command";

@Module({
  providers: [FelicaService, NfcReaderService, ReadCommand],
  exports: [FelicaService],
})
export class FelicaModule {}
