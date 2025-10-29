export function greedyValueRes(rNum: number, weights: number[]): number {
  for (let idx = 0; idx < weights.length; idx++) {
    const w = weights[idx];
    if (rNum < w) {
      return idx + 1;
    }
    rNum -= w;
  }
  return 0;
}
