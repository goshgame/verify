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

export const probabilitys = [0.00001, 0.00009, 0.0999, 1.4, 2.5, 9, 2, 40];

export const topGridNum = 5;

export const bottomGridNum = 25;
