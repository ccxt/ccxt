import { parse } from './_uuid.js';
import BigNumber from './_bignumber.js';
import type { Aggregated, Input, Output } from '../types';
import { parseUnits } from './amount.js';

const MaximumEncodingInt = 0xffff;

const AggregatedSignaturePrefix = 0xff01;

export const magic = Buffer.from([0x77, 0x77]);
const empty = Buffer.from([0x00, 0x00]);

export const integerToBytes = (x: number) => {
  const bytes = [];
  let i = x;
  do {
    bytes.unshift(i & 255);
    i = (i / 2 ** 8) | 0;
  } while (i !== 0);
  return bytes;
};

export const bigNumberToBytes = (x) => {
  const bytes = [];
  let i = x;
  do {
    bytes.unshift(i.mod(256).toNumber());
    i = i.dividedToIntegerBy(256);
  } while (!i.isZero());
  return Buffer.from(bytes);
};

export const putUvarInt = (x: number) => {
  const buf = [];
  let i = 0;
  while (x >= 0x80) {
    buf[i] = x | 0x80;
    x >>= 7;
    i++;
  }
  buf[i] = x;
  return buf;
};

export class Encoder {
  buf: Buffer;

  constructor(buf: Buffer | undefined) {
    this.buf = Buffer.from('');
    if (buf) {
      this.buf = buf;
    }
  }

  hex() {
    return this.buf.toString('hex');
  }

  write(buf: Buffer) {
    this.buf = Buffer.concat([this.buf, buf]);
  }

  writeBytes(buf: Buffer) {
    const len = buf.byteLength;
    this.writeInt(len);
    this.write(buf);
  }

  writeSlice(buf: Buffer) {
    const l = buf.length;
    if (l > 128) throw new Error(`slice too long, length ${l}, maximum 128`);
    this.write(Buffer.from([l]));
    this.write(buf);
  }

  writeInt(i: number) {
    if (i > MaximumEncodingInt) {
      throw new Error(`invalid integer ${i}, maximum ${MaximumEncodingInt}`);
    }
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(i);
    this.write(buf);
  }

  writeUint16(i: number) {
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(i);
    this.write(buf);
  }

  writeUint32(i: number) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(i);
    this.write(buf);
  }

  writeUint64(i: bigint) {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(i);
    this.write(buf);
  }

  writeInteger(i: typeof BigNumber) {
    const b = bigNumberToBytes(i);
    this.writeInt(b.byteLength);
    this.write(b);
  }

  // TODO convert array like to array
  writeUUID(id: string) {
    const uuid: any = parse(id);
    for (let i = 0; i < uuid.length; i += 1) {
      this.write(Buffer.from([uuid[i]]));
    }
  }

  encodeInput(input: Input) {
    const i = input;
    this.write(Buffer.from(i.hash, 'hex'));
    this.writeInt(i.index);

    if (!i.genesis) i.genesis = '';
    this.writeInt(i.genesis.length);
    this.write(Buffer.from(i.genesis));
    const d = i.deposit;
    if (typeof d === 'undefined') {
      this.write(empty);
    } else {
      // TODO... to test...
      this.write(magic);
      this.write(Buffer.from(d.chain, 'hex'));

      const asset = Buffer.from(d.asset);
      this.writeInt(asset.byteLength);
      this.write(asset);

      const tx = Buffer.from(d.transaction);
      this.writeInt(tx.byteLength);
      this.write(tx);

      this.writeUint64(d.index);
      this.writeInteger(parseUnits(Number(d.amount).toFixed(8), 8));
    }
    const m = i.mint;
    if (typeof m === 'undefined') {
      this.write(empty);
    } else {
      this.write(magic);
      if (!m.group) m.group = '';
      this.writeInt(m.group.length);
      this.write(Buffer.from(m.group));

      this.writeUint64(m.batch);
      this.writeInteger(parseUnits(Number(m.amount).toFixed(8), 8));
    }
  }

  encodeOutput(output: Output) {
    const o = output;
    if (!o.type) o.type = 0;
    this.write(Buffer.from([0x00, o.type]));
    this.writeInteger(parseUnits(Number(o.amount).toFixed(8), 8));

    this.writeInt(o.keys.length);
    o.keys.forEach(k => this.write(Buffer.from(k, 'hex')));

    this.write(o.mask ? Buffer.from(o.mask, 'hex') : Buffer.alloc(32, 0));

    if (!o.script) o.script = '';
    const s = Buffer.from(o.script, 'hex');
    this.writeInt(s.byteLength);
    this.write(s);

    const w = o.withdrawal;
    if (!w) {
      this.write(empty);
    } else {
      this.write(magic);

      const addr = Buffer.from(w.address);
      this.writeInt(addr.byteLength);
      this.write(addr);

      const tag = Buffer.from(w.tag);
      this.writeInt(tag.byteLength);
      this.write(tag);
    }
  }

  encodeAggregatedSignature(js: Aggregated) {
    this.writeInt(MaximumEncodingInt);
    this.writeInt(AggregatedSignaturePrefix);
    this.write(Buffer.from(js.signature, 'hex'));

    if (js.signers.length === 0) {
      this.write(Buffer.from([0x00]));
      this.writeInt(0);
      return;
    }

    js.signers.forEach((m, i) => {
      if (i > 0 && m <= js.signers[i - 1]) {
        throw new Error('signers not sorted');
      }
      if (m > MaximumEncodingInt) {
        throw new Error('signer overflow');
      }
    });

    const max = js.signers[js.signers.length - 1];

    if (((((max / 8) | 0) + 1) | 0) > js.signature.length * 2) {
      // TODO... not check...
      this.write(Buffer.from([0x01]));
      this.writeInt(js.signature.length);
      js.signers.forEach(m => this.writeInt(m));
      return;
    }

    const masks = Buffer.alloc((((max / 8) | 0) + 1) | 0);
    js.signers.forEach(m => {
      masks[(m / 8) | 0] ^= 1 << (m % 8 | 0);
    });
    this.write(Buffer.from([0x00]));
    this.writeInt(masks.length);
    this.write(masks);
  }

  encodeSignature(sm: { [key: number]: string }) {
    const ss = Object.entries(sm)
      .map(([k, v]) => ({ index: k, sig: v }))
      .sort((a, b) => Number(a.index) - Number(b.index));

    this.writeInt(ss.length);
    ss.forEach(s => {
      this.writeUint16(Number(s.index));
      this.write(Buffer.from(s.sig, 'hex'));
    });
  }
}

export default Encoder;