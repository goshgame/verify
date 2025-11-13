export interface ITablList {
  hash: string;
  result: number[];
}
export interface IQueryInfo {
  gameHash?: string;
  preAmount?: string;
  app?: string;
}

export enum QuickRaceBetType {
  QuickRaceBetType1 = 6,
  QuickRaceBetType2 = 7,
  QuickRaceBetType3 = 8,
  QuickRaceBetType4 = 9,
  QuickRaceBetType5 = 10,
  QuickRaceBetType6 = 11,
  QuickRaceBetType7 = 12,
  QuickRaceBetType8 = 13,
  QuickRaceBetType9 = 14,
  QuickRaceBetType10 = 15,
}

export const resultNum = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
