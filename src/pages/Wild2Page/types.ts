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
  0.00004, 0.0001, 0.0003, 0.05, 0.2, 0.5, 1.0996, 2.00396, 5.22449, 49.92151,
];

export const topGridNum = 6;

export const bottomGridNum = 20;
