// result
export interface IDiceResult {
  hash: string;
  dice1: number;
  dice2: number;
  dice3: number;
  total: number;
}

export interface IQueryInfo {
  gameHash: string;
  preAmount: string;
  app?: string;
}
