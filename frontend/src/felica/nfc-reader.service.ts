import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import {
  FelicaService,
  CardInfo,
  BalanceInfo,
  SERVICE_CODE_TRANSPORT_BALANCE,
} from "./felica.service";

// nfc-pcsc は実行時に動的 require（ネイティブビルドが必要なため ESM export なし）
const { NFC } = require("nfc-pcsc");

export type ReadMode = "info" | "balance";

@Injectable()
export class NfcReaderService implements OnModuleDestroy {
  private readonly logger = new Logger(NfcReaderService.name);
  private nfc: any;
  private isRunning = false;

  constructor(private readonly felicaService: FelicaService) {}

  /**
   * PaSoRi を起動してカード読み取りを開始する
   * @param mode    'info' = IDm/PMm 表示、'balance' = 残高読み取り
   * @param timeout タイムアウト(ms)。0 = 無制限
   */
  startReading(mode: ReadMode = "info", timeout = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
      this.nfc = new NFC();
      this.isRunning = true;

      let timer: NodeJS.Timeout | null = null;
      if (timeout > 0) {
        timer = setTimeout(() => {
          this.logger.warn(
            `タイムアウト: ${timeout}ms 以内にカードが検出されませんでした`,
          );
          this.stop();
          resolve();
        }, timeout);
      }

      this.nfc.on("reader", (reader: any) => {
        this.logger.log(`リーダー検出: ${reader.name}`);

        reader.on("card", async (card: any) => {
          try {
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }

            const cardInfo: CardInfo = {
              idm: card.uid ?? card.atr?.toString("hex") ?? "不明",
              pmm: card.data?.toString("hex") ?? "",
              systemCode: undefined,
            };

            console.log(this.felicaService.formatCardInfo(cardInfo));

            // 残高モード: 交通系 IC の場合に残高を読み取る
            if (mode === "balance") {
              await this.readBalance(reader, cardInfo.idm);
            }

            this.stop();
            resolve();
          } catch (err) {
            this.logger.error("カード処理エラー", err);
            this.stop();
            reject(err);
          }
        });

        reader.on("card.off", (_card: any) => {
          this.logger.log("カードが取り外されました");
        });

        reader.on("error", (err: Error) => {
          this.logger.error(`リーダーエラー: ${err.message}`);
        });
      });

      this.nfc.on("error", (err: Error) => {
        this.logger.error(`NFC エラー: ${err.message}`);
        if (err.message.includes("No readers available")) {
          console.error(
            "\n⚠  PaSoRi が接続されていないか、ドライバが認識されていません。",
          );
          console.error("   USB を確認して再度実行してください。\n");
        }
        reject(err);
      });
    });
  }

  /**
   * FeliCa Read Without Encryption コマンドで残高データを読み取る
   */
  private async readBalance(reader: any, idm: string): Promise<void> {
    try {
      // Read Without Encryption コマンド構築
      // [Length][0x04 = Read w/o Enc][IDm 8B][サービス数 1B][サービスコード 2B][ブロック数 1B][ブロックリスト]
      const idmBuf = Buffer.from(idm, "hex");
      const serviceCode = SERVICE_CODE_TRANSPORT_BALANCE;
      const blockList = Buffer.from([0x80, 0x00]); // ブロック 0

      const cmd = Buffer.alloc(16);
      let offset = 0;
      cmd[offset++] = 16; // Length（後で上書き）
      cmd[offset++] = 0x06; // コマンドコード: Read Without Encryption
      idmBuf.copy(cmd, offset);
      offset += 8;
      cmd[offset++] = 0x01; // サービス数
      cmd.writeUInt16LE(serviceCode, offset);
      offset += 2;
      cmd[offset++] = 0x01; // ブロック数
      blockList.copy(cmd, offset);
      offset += blockList.length;
      cmd[0] = offset; // 正確な Length を先頭に

      const response: Buffer = await reader.transmit(cmd.slice(0, offset), 256);

      // レスポンス: [Length][0x07][IDm 8B][Status1][Status2][ブロック数][データ 16B×n]
      if (response.length < 12) {
        console.log("  残高データの取得に失敗しました（レスポンス短すぎ）");
        return;
      }

      const status1 = response[10];
      const status2 = response[11];
      if (status1 !== 0x00 || status2 !== 0x00) {
        console.log(
          `  残高読み取りエラー: Status1=0x${status1.toString(16)} Status2=0x${status2.toString(16)}`,
        );
        console.log(
          "  ※ このカードは交通系 IC ではないか、残高サービスに未対応です",
        );
        return;
      }

      const blockData = response.slice(13, 13 + 16);
      const balance = this.felicaService.parseBalance(blockData);
      const info: BalanceInfo = {
        idm,
        balance,
        rawData: blockData.toString("hex"),
      };

      console.log(this.felicaService.formatBalanceInfo(info));
    } catch (err: any) {
      this.logger.warn(`残高読み取りをスキップ: ${err.message}`);
      console.log(
        "  ※ 残高の読み取りに失敗しました（非 FeliCa カードの可能性があります）",
      );
    }
  }

  stop(): void {
    if (this.isRunning && this.nfc) {
      this.nfc.close?.();
      this.isRunning = false;
    }
  }

  onModuleDestroy(): void {
    this.stop();
  }
}
