// フロントエンド(CLI) からカード情報を送信する DTO
export class CreateCardScanDto {
  idm: string;          // 製造 ID（16 進数文字列）
  pmm: string;          // 製造パラメータ
  systemCode?: string;  // システムコード（任意）
  balance?: number; // 残高（交通系 IC の場合）
}
