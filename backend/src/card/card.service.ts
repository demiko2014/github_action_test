import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { CreateCardScanDto } from "./dto/create-card-scan.dto";
import { CardScan } from "./entities/card-scan.entity";

@Injectable()
export class CardService {
  // インメモリストア（本番では DB に置き換える）
  private readonly scans: CardScan[] = [];

  save(dto: CreateCardScanDto): CardScan {
    const scan: CardScan = {
      id: randomUUID(),
      idm: dto.idm,
      pmm: dto.pmm,
      systemCode: dto.systemCode,
      balance: dto.balance,
      cardType: this.identifyCard(dto.idm),
      scannedAt: new Date(),
    };
    this.scans.push(scan);
    return scan;
  }

  findAll(): CardScan[] {
    return this.scans;
  }

  findOne(id: string): CardScan | undefined {
    return this.scans.find((s) => s.id === id);
  }

  private identifyCard(idm: string): string {
    const prefix = idm.substring(0, 2).toUpperCase();
    const map: Record<string, string> = {
      "03": "交通系 IC (Suica/PASMO 等)",
      "88": "電子マネー (Edy/nanaco/WAON 等)",
      RC: "FeliCa Lite",
    };
    return map[prefix] ?? `不明 (prefix: ${prefix})`;
  }
}
