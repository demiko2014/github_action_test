import { Injectable, Logger } from '@nestjs/common';

// FeliCa システムコード定義
export const FELICA_SYSTEM_CODES = {
  SUICA: 0x0003,
  PASMO: 0x0003,   // 交通系 IC は同じシステムコード
  EDY:   0x88b4,
  NANACO: 0x88b4,
  WAON:  0x88b4,
} as const;

// 交通系 IC サービスコード（残高読み取り）
export const SERVICE_CODE_TRANSPORT_BALANCE = 0x008b;

export interface CardInfo {
  idm: string;       // 製造 ID（8 バイト、16 進数文字列）
  pmm: string;       // 製造パラメータ（8 バイト）
  systemCode?: string;
}

export interface BalanceInfo {
  idm: string;
  balance: number;   // 残高（円）
  rawData: string;   // 生データ（16 進数）
}

@Injectable()
export class FelicaService {
  private readonly logger = new Logger(FelicaService.name);

  /**
   * IDm から推定できるカード種類を返す
   * 実際の判別はシステムコードで行うが、IDm の先頭バイトで目安が分かる
   */
  identifyCard(idm: string): string {
    const prefix = idm.substring(0, 2).toUpperCase();
    const prefixMap: Record<string, string> = {
      '01': 'FeliCa Standard',
      '02': 'FeliCa Standard',
      '03': '交通系 IC (Suica/PASMO 等)',
      '0B': 'iD',
      '88': '電子マネー (Edy/nanaco/WAON 等)',
      'RC': 'FeliCa Lite',
    };
    return prefixMap[prefix] ?? `不明 (IDm prefix: ${prefix})`;
  }

  /**
   * 残高データ（16 バイト）から残高を解析する
   * 交通系 IC の残高はバイト 11-12 にリトルエンディアンで格納
   */
  parseBalance(data: Buffer): number {
    // 交通系 IC: オフセット 10-11 (0-indexed) がリトルエンディアン残高
    return data.readUInt16LE(10);
  }

  /**
   * 読み取り結果をコンソール表示用に整形する
   */
  formatCardInfo(info: CardInfo): string {
    const lines = [
      '========================================',
      '  FeliCa カード読み取り結果',
      '========================================',
      `  IDm         : ${info.idm.toUpperCase()}`,
      `  PMm         : ${info.pmm.toUpperCase()}`,
    ];
    if (info.systemCode) {
      lines.push(`  システムコード: ${info.systemCode.toUpperCase()}`);
    }
    lines.push(`  カード種類   : ${this.identifyCard(info.idm)}`);
    lines.push('========================================');
    return lines.join('\n');
  }

  formatBalanceInfo(info: BalanceInfo): string {
    return [
      '----------------------------------------',
      `  IDm    : ${info.idm.toUpperCase()}`,
      `  残高   : ${info.balance.toLocaleString()} 円`,
      `  生データ: ${info.rawData.toUpperCase()}`,
      '----------------------------------------',
    ].join('\n');
  }
}
