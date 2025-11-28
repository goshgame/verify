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
  0.00008, 0.0002, 0.001, 0.005, 0.32, 0.38, 1.2, 5, 61.27554,
];

export const topGridNum = 6;

export const bottomGridNum = 25;
