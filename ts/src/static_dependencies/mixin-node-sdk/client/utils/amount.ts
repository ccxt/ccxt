import BigNumber from './_bignumber.js';

let zeros = '0';
while (zeros.length < 256) {
  zeros += zeros;
}

const getMultiplier = (n: number) => BigNumber(`1${zeros.substring(0, n)}`);

export const formatUnits = (amount: string | number, unit: number) => {
  const m = getMultiplier(unit);
  return BigNumber(amount).dividedBy(m);
};
export const parseUnits = (amount: string | number, unit: number) => {
  const m = getMultiplier(unit);
  return BigNumber(amount).times(m);
};