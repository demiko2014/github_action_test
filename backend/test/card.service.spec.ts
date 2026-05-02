import { Test, TestingModule } from "@nestjs/testing";
import { CardService } from "../src/card/card.service";

describe("CardService", () => {
  let service: CardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardService],
    }).compile();

    service = module.get<CardService>(CardService);
  });

  describe("save", () => {
    it("スキャン結果を保存して UUID 付きで返す", () => {
      const result = service.save({
        idm: "0311aabbccddeeff",
        pmm: "aabbccddeeff0011",
      });
      expect(result.id).toBeDefined();
      expect(result.idm).toBe("0311aabbccddeeff");
      expect(result.cardType).toContain("交通系");
    });

    it("残高情報も一緒に保存できる", () => {
      const result = service.save({
        idm: "0311aabbccddeeff",
        pmm: "aabbccddeeff0011",
        balance: 3200,
      });
      expect(result.balance).toBe(3200);
    });
  });

  describe("findAll", () => {
    it("保存した件数分返す", () => {
      service.save({ idm: "0311000000000001", pmm: "aa" });
      service.save({ idm: "0311000000000002", pmm: "bb" });
      expect(service.findAll()).toHaveLength(2);
    });
  });

  describe("findOne", () => {
    it("存在する ID で取得できる", () => {
      const saved = service.save({ idm: "0311000000000003", pmm: "cc" });
      expect(service.findOne(saved.id)).toEqual(saved);
    });

    it("存在しない ID は undefined を返す", () => {
      expect(service.findOne("non-existent-id")).toBeUndefined();
    });
  });
});
