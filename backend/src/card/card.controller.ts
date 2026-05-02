import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { CardService } from "./card.service";
import { CreateCardScanDto } from "./dto/create-card-scan.dto";

@Controller("cards")
export class CardController {
  constructor(private readonly cardService: CardService) {}

  /** フロントエンド (CLI) からカードスキャン結果を受信して保存 */
  @Post("scan")
  scan(@Body() dto: CreateCardScanDto) {
    return this.cardService.save(dto);
  }

  /** スキャン履歴を全件取得 */
  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  /** ID で 1 件取得 */
  @Get(":id")
  findOne(@Param("id") id: string) {
    const scan = this.cardService.findOne(id);
    if (!scan) throw new NotFoundException(`scan ${id} not found`);
    return scan;
  }
}
