import Long from "long";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function generateQueryPath(url: string, params: {}): string {
  const definedEntries = Object.entries(params).filter(
    ([_key, value]: [string, unknown]) => value !== undefined,
  );

  if (!definedEntries.length) {
    return url;
  }

  const paramsString = definedEntries
    .map(([key, value]: [string, unknown]) => `${key}=${value}`)
    .join('&');
  return `${url}?${paramsString}`;
}

export function parseToPrimitives<T>(x: T): T {
  if (typeof x === 'number' || typeof x === 'string' || typeof x === 'boolean' || x === null) {
    return x;
  }

  if (Array.isArray(x)) {
    return x.map((item) => parseToPrimitives(item)) as T;
  }

  if (Long.isLong(x)) {
    return x.toString() as T;
  }

  if (x instanceof Uint8Array) {
    return bytesToBigInt(x).toString() as T;
  }

  if (x instanceof Date) {
    return x.toString() as T;
  }

  if (typeof x === 'object') {
    const parsedObj: { [key: string]: any } = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key in x) {
      if (Object.prototype.hasOwnProperty.call(x, key)) {
        parsedObj[key] = parseToPrimitives((x as any)[key]);
      }
    }
    return parsedObj as T;
  }

  if (typeof x === 'bigint') {
    return x.toString() as T;
  }

  throw new Error(`Unsupported data type: ${typeof x}`);
}

/**
 * Converts a byte array (representing an arbitrary-size signed integer) into a bigint.
 * @param u Array of bytes represented as a Uint8Array.
 */
function bytesToBigInt(u: Uint8Array): bigint {
  if (u.length <= 1) {
    return BigInt(0);
  }
  // eslint-disable-next-line no-bitwise
  const negated: boolean = (u[0] & 1) === 1;
  const hex: string = Buffer.from(u.slice(1)).toString('hex');
  const abs: bigint = BigInt(`0x${hex}`);
  return negated ? -abs : abs;
}
