export interface ITablList {
  nonce: number;
  result: {
    top: number[];
    bottom: number[];
    number: number;
  };
}
export interface IQueryInfo {
  serverSeed?: string;
  clientSeed?: string;
  nonce?: string;
  app?: string;
}

export const probabilitys = [
  0.000001, 0.000001, 0.00001, 0.004998, 0.050099, 0.10004, 0.44, 2, 6, 6.05,
  40.304851,
];

export const topGridNum = 5;

export const bottomGridNum = 15;
