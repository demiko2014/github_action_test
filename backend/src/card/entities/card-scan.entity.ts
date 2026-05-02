export interface CardScan {
  id: string;
  idm: string;
  pmm: string;
  systemCode?: string;
  balance?: number;
  cardType: string;
  scannedAt: Date;
}
