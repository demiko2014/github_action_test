import { Logger } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";
import { NfcReaderService, ReadMode } from "./nfc-reader.service";

interface ReadCommandOptions {
  mode: ReadMode;
  timeout: number;
}

@Command({
  name: "read",
  description: "PaSoRi で FeliCa カードを読み取ります",
  arguments: "",
})
export class ReadCommand extends CommandRunner {
  private readonly logger = new Logger(ReadCommand.name);

  constructor(private readonly nfcReaderService: NfcReaderService) {
    super();
  }

  async run(_inputs: string[], options: ReadCommandOptions): Promise<void> {
    const mode = options.mode ?? "info";
    const timeout = options.timeout ?? 30000;

    console.log("\n PaSoRi FeliCa リーダー");
    console.log("========================================");
    console.log(
      `  モード   : ${mode === "info" ? "カード情報" : "残高読み取り"}`,
    );
    console.log(`  タイムアウト: ${timeout === 0 ? "無制限" : `${timeout}ms`}`);
    console.log("========================================");
    console.log("  カードをリーダーにタッチしてください...\n");

    try {
      await this.nfcReaderService.startReading(mode, timeout);
    } catch (err: any) {
      this.logger.error("読み取りに失敗しました", err.message);
      process.exit(1);
    }
  }

  @Option({
    flags: "-m, --mode <mode>",
    description: "読み取りモード: info (カード情報) または balance (残高)",
    defaultValue: "info",
  })
  parseMode(val: string): ReadMode {
    if (val !== "info" && val !== "balance") {
      throw new Error(`--mode には "info" か "balance" を指定してください`);
    }
    return val;
  }

  @Option({
    flags: "-t, --timeout <ms>",
    description: "タイムアウト(ms)。0 で無制限 (デフォルト: 30000)",
    defaultValue: 30000,
  })
  parseTimeout(val: string): number {
    return parseInt(val, 10);
  }
}
