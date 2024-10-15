import { randomUUID } from 'crypto';
import { randomFillSync } from 'crypto';

// https://github.com/uuidjs/uuid/blob/1e0f9870db864ca93f7a69db0d468b5e1b7605e7/src/regex.ts
const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

// https://github.com/uuidjs/uuid/blob/1e0f9870db864ca93f7a69db0d468b5e1b7605e7/src/validate.ts
function validate(uuid: unknown) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

// https://github.com/uuidjs/uuid/blob/8a8c85894bc4d7017224e7cecbafe4ce53168937/src/stringify.ts
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex: string[] = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

export function unsafeStringify(arr: Uint8Array, offset = 0): string {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  //
  // Note to future-self: No, you can't remove the `toLowerCase()` call.
  // REF: https://github.com/uuidjs/uuid/pull/677#issuecomment-1757351351
  return (
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    '-' +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    '-' +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    '-' +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    '-' +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase();
}

function stringify(arr: Uint8Array, offset = 0) {
  const uuid = unsafeStringify(arr, offset);

  // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields
  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

function parse(uuid: string) {
  if (!validate(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  return Uint8Array.of(
    (v = parseInt(uuid.slice(0, 8), 16)) >>> 24,
    (v >>> 16) & 0xff,
    (v >>> 8) & 0xff,
    v & 0xff,

    // Parse ........-####-....-....-............
    (v = parseInt(uuid.slice(9, 13), 16)) >>> 8,
    v & 0xff,

    // Parse ........-....-####-....-............
    (v = parseInt(uuid.slice(14, 18), 16)) >>> 8,
    v & 0xff,

    // Parse ........-....-....-####-............
    (v = parseInt(uuid.slice(19, 23), 16)) >>> 8,
    v & 0xff,

    // Parse ........-....-....-....-############
    // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)
    ((v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000) & 0xff,
    (v / 0x100000000) & 0xff,
    (v >>> 24) & 0xff,
    (v >>> 16) & 0xff,
    (v >>> 8) & 0xff,
    v & 0xff
  );
}

export type UUIDTypes = string | Uint8Array;

export type Version1Options = {
  node?: Uint8Array;
  clockseq?: number;
  random?: Uint8Array;
  rng?: () => Uint8Array;
  msecs?: number;
  nsecs?: number;
  _v6?: boolean; // Internal use only!
};

export type Version4Options = {
  random?: Uint8Array;
  rng?: () => Uint8Array;
};

export type Version6Options = Version1Options;

export type Version7Options = {
  random?: Uint8Array;
  msecs?: number;
  seq?: number;
  rng?: () => Uint8Array;
};

// https://github.com/uuidjs/uuid/blob/1e0f9870db864ca93f7a69db0d468b5e1b7605e7/src/rng.ts
const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate
let poolPtr = rnds8Pool.length;

export default function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, (poolPtr += 16));
}

// https://github.com/uuidjs/uuid/blob/1e0f9870db864ca93f7a69db0d468b5e1b7605e7/src/v4.ts
function v4(options?: Version4Options, buf?: undefined, offset?: number): string;
function v4(options?: Version4Options, buf?: Uint8Array, offset?: number): Uint8Array;
function v4(options?: Version4Options, buf?: Uint8Array, offset?: number): UUIDTypes {
  options ??= {};

  if (!buf && !options) {
    return randomUUID();
  }

  options = options || {};

  const rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return unsafeStringify(rnds);
}

export { stringify, parse, v4 };
