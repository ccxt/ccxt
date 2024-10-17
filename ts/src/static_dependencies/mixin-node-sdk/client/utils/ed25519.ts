import { ed25519, edwardsToMontgomery, edwardsToMontgomeryPriv, x25519 } from './_noble-curves/ed25519.js';
import { Field } from './_noble-curves/abstract/modular.js';
import { numberToBytesLE, bytesToNumberLE } from './_noble-curves/abstract/utils.js';
import { blake3Hash, sha512Hash } from './uniq.js';
import { putUvarInt } from './encoder.js';
import { randomBytes } from './_noble-hashes/utils.js';

const scMinusOne = Buffer.from('ecd3f55c1a631258d69cf7a2def9de1400000000000000000000000000000010', 'hex');
const base = ed25519.ExtendedPoint.fromHex('5866666666666666666666666666666666666666666666666666666666666666');
const fn = Field(ed25519.CURVE.n, undefined, true);

const isReduced = (x: Buffer) => {
  for (let i = x.byteLength - 1; i >= 0; i--) {
    if (x.at(i)! > scMinusOne.at(i)!) return false;
    if (x.at(i)! < scMinusOne.at(i)!) return true;
  }
  return true;
};

const setBytesWithClamping = (x: Buffer) => {
  if (x.byteLength !== 32) throw new Error('edwards25519: invalid SetBytesWithClamping input length');
  const wideBytes = Buffer.alloc(64);
  x.copy(wideBytes, 0, 0, 32);
  wideBytes[0] &= 248;
  wideBytes[31] &= 63;
  wideBytes[31] |= 64;
  const m = fn.create(bytesToNumberLE(wideBytes.subarray(0, 32)));
  return m;
};

const setUniformBytes = (x: Buffer) => {
  if (x.byteLength !== 64) throw new Error('edwards25519: invalid setUniformBytes input length');
  const wideBytes = Buffer.alloc(64);
  x.copy(wideBytes);
  const m = fn.create(bytesToNumberLE(wideBytes));
  return m;
};

const setCanonicalBytes = (x: Buffer) => {
  if (x.byteLength !== 32) throw new Error('invalid scalar length');
  if (!isReduced(x)) throw new Error('invalid scalar encoding');
  const s = fn.create(bytesToNumberLE(x));
  return s;
};

const scalarBaseMult = (x: bigint) => {
  const res = base.multiply(x);
  // @ts-ignore
  return Buffer.from(res.toRawBytes());
};

const scalarBaseMultToPoint = (x: bigint) => base.multiply(x);

const publicFromPrivate = (priv: Buffer) => {
  const x = setCanonicalBytes(priv);
  const v = scalarBaseMult(x);
  return v;
};

const sign = (msg: Buffer, key: Buffer) => {
  const digest1 = sha512Hash(key.subarray(0, 32));
  const messageDigest = sha512Hash(Buffer.concat([digest1.subarray(32), msg]));

  const z = setUniformBytes(messageDigest);
  const r = scalarBaseMult(z);

  const pub = publicFromPrivate(key);
  const hramDigest = sha512Hash(Buffer.concat([r, pub, msg]));

  const x = setUniformBytes(hramDigest);
  const y = setCanonicalBytes(key);
  const s = numberToBytesLE(fn.add(fn.mul(x, y), z), 32);
  return Buffer.concat([r, s]);
};

const newPoint = (x: Buffer) => ed25519.ExtendedPoint.fromHex(x.toString('hex'));

const keyMultPubPriv = (pub: Buffer, priv: Buffer) => {
  const q = newPoint(pub);
  const x = setCanonicalBytes(priv);
  const res = q.multiply(x);
  // @ts-ignore
  return Buffer.from(res.toRawBytes());
};

const hashScalar = (k: Buffer, index: number) => {
  const tmp = Buffer.from(putUvarInt(index));
  const src = Buffer.alloc(64);
  let hash = blake3Hash(Buffer.concat([k, tmp]));
  hash.copy(src, 0, 0, 32);
  hash = blake3Hash(hash);
  hash.copy(src, 32, 0, 32);
  const s = setUniformBytes(src);

  hash = blake3Hash(Buffer.from(numberToBytesLE(s, 32)));
  hash.copy(src, 0, 0, 32);
  hash = blake3Hash(hash);
  hash.copy(src, 32, 0, 32);
  return setUniformBytes(src);
};

export const getRandomBytes = (len?: number) => Buffer.from(randomBytes(len ?? ed25519.CURVE.Fp.BYTES));

export const edwards25519 = {
  scalar: fn,
  x25519,
  edwardsToMontgomery,
  edwardsToMontgomeryPriv,

  setBytesWithClamping,
  setCanonicalBytes,
  setUniformBytes,

  isReduced,
  publicFromPrivate,
  scalarBaseMult,
  scalarBaseMultToPoint,
  sign,

  newPoint,
  keyMultPubPriv,
  hashScalar,
};