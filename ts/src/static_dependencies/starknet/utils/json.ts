import * as json from 'lossless-json.js';

/**
 * Convert string to number or bigint based on size
 */
const parseIntAsNumberOrBigInt = (x: string) => {
  if (!json.isInteger(x)) return parseFloat(x);
  const v = parseInt(x, 10);
  return Number.isSafeInteger(v) ? v : BigInt(x);
};

/**
 * Convert JSON string to JSON object
 *
 * NOTE: the String() wrapping is used so the behavior conforms to JSON.parse()
 * which can accept simple data types but is not represented in the default typing
 * @param x JSON string
 */
export const parse = (x: string): any => json.parse(String(x), undefined, parseIntAsNumberOrBigInt);

/**
 * Convert JSON string to JSON object with all numbers as bigint
 * @param x JSON string
 */
export const parseAlwaysAsBig = (x: string): any =>
  json.parse(String(x), undefined, json.parseNumberAndBigInt);

/**
 * Convert JSON object to JSON string
 *
 * NOTE: the not-null assertion is used so the return type conforms to JSON.stringify()
 * which can also return undefined but is not represented in the default typing
 * @returns JSON string
 */
export const stringify = (
  value: unknown,
  replacer?: any,
  space?: string | number | undefined,
  numberStringifiers?: json.NumberStringifier[] | undefined
): string => json.stringify(value, replacer, space, numberStringifiers)!;

/** @deprecated equivalent to 'stringify', alias will be removed */
export const stringifyAlwaysAsBig = stringify;
