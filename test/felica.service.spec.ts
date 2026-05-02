import { Test, TestingModule } from "@nestjs/testing";
import { FelicaService } from "../src/felica/felica.service";

describe("FelicaService", () => {
  let service: FelicaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FelicaService],
    }).compile();

    service = module.get<FelicaService>(FelicaService);
  });

  describe("identifyCard", () => {
    it("交通系 IC を識別できる", () => {
      const result = service.identifyCard("0311223344556677");
      expect(result).toContain("交通系");
    });

    it("不明カードの場合は prefix を含むメッセージを返す", () => {
      const result = service.identifyCard("FF11223344556677");
      expect(result).toContain("FF");
    });
  });

  describe("parseBalance", () => {
    it("リトルエンディアンでオフセット 10-11 バイトから残高を読む", () => {
      const data = Buffer.alloc(16, 0);
      // 残高 1000 円 = 0x03E8 → LE で [0xE8, 0x03]
      data.writeUInt16LE(1000, 10);
      expect(service.parseBalance(data)).toBe(1000);
    });

    it("残高 0 円のデータを正しく解析する", () => {
      const data = Buffer.alloc(16, 0);
      expect(service.parseBalance(data)).toBe(0);
    });

    it("最大値 65535 円を正しく解析する", () => {
      const data = Buffer.alloc(16, 0);
      data.writeUInt16LE(65535, 10);
      expect(service.parseBalance(data)).toBe(65535);
    });
  });

  describe("formatCardInfo", () => {
    it("IDm と PMm を含む文字列を返す", () => {
      const result = service.formatCardInfo({
        idm: "0311223344556677",
        pmm: "aabbccddeeff0011",
      });
      expect(result).toContain("0311223344556677".toUpperCase());
      expect(result).toContain("aabbccddeeff0011".toUpperCase());
    });
  });

  describe("formatBalanceInfo", () => {
    it("残高を円表記で含む文字列を返す", () => {
      const result = service.formatBalanceInfo({
        idm: "0311223344556677",
        balance: 5000,
        rawData: "deadbeef00000000000000003813000000000000",
      });
      expect(result).toContain("5,000");
      expect(result).toContain("円");
    });
  });
});
