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

export const probabilitys = [10, 20, 70];

export const topGridNum = 3;

export const bottomGridNum = 10;

export interface GenCardPowerResult {
  number: string;
  codes: string[];
}
