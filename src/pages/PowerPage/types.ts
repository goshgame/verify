export interface ITablList {
  nonce: number;
  result: GenCardPowerResult;
}
export interface IQueryInfo {
  serverSeed?: string;
  clientSeed?: string;
  nonce?: string;
  app?: string;
}

export const probabilitys = [
  0.0000059085, 0.0000090849, 0.0098636164, 0.0395908492, 0.2959084923,
  1.006361641, 3.9590849229, 11.9181698458, 39.86361641,
];

export const probabilitysStr = [
  "20",
  "money",
  "20x",
  "5x",
  "money",
  "20",
  "money",
  "money",
  "money",
];

export interface GenCardPowerResult {
  number: string;
  codes: string[];
}
