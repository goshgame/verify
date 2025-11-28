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
  0.0001, 0.2204, 0.2542, 1.5085, 1.7627, 1.7778, 60.9,
];

export const topGridNum = 3;

export const bottomGridNum = 10;
