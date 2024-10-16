import type { Input, Output } from '../types';
import { magic } from './encoder';
import { formatUnits } from './amount';

export const bytesToInterger = (b: Buffer) => {
  let x = 0;
  for (let i = 0; i < b.byteLength; i++) {
    const byte = b.at(i);
    x *= 0x100;
    if (byte) x += byte;
  }
  return x;
};

export class Decoder {
  buf: Buffer;

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  subarray(start: number, end?: number) {
    return this.buf.subarray(start, end);
  }

  read(offset: number) {
    this.buf = this.buf.subarray(offset);
  }

  readByte() {
    const value = this.buf.readUint8();
    this.read(1);
    return value;
  }

  readBytes() {
    const len = this.readByte();
    const value = this.buf.subarray(0, len).toString('hex');
    this.read(len);
    return value;
  }

  readInt() {
    const value = this.buf.readUInt16BE();
    this.read(2);
    return value;
  }

  readUint32() {
    const value = this.buf.readUInt32BE();
    this.read(4);
    return value;
  }

  readUInt64() {
    const value = this.buf.readBigUInt64BE();
    this.read(8);
    return value;
  }

  readUUID() {
    const value = this.buf.subarray(0, 16);
    this.read(16);
    return value;
  }

  readInteger() {
    const len = this.readInt();
    const value = this.buf.subarray(0, len);
    this.read(len);
    return bytesToInterger(value);
  }

  decodeInput() {
    const hash = this.subarray(0, 32).toString('hex');
    this.read(32);
    const index = this.readInt();
    const input: Input = {
      hash,
      index,
    };

    const lenGenesis = this.readInt();
    if (lenGenesis > 0) {
      input.genesis = this.buf.subarray(0, lenGenesis).toString('hex');
      this.read(lenGenesis);
    }

    const depositPrefix = this.subarray(0, 2);
    this.read(2);
    if (depositPrefix.equals(magic)) {
      const chain = this.subarray(0, 32).toString('hex');
      this.read(32);
      const asset = this.readBytes();
      const transaction = this.readBytes();
      const index = this.readUInt64();
      const amount = this.readInteger();

      input.deposit = {
        chain,
        asset,
        transaction,
        index,
        amount,
      };
    }

    const mintPrefix = this.subarray(0, 2);
    this.read(2);
    if (mintPrefix.equals(magic)) {
      const group = this.readBytes();
      const batch = this.readUInt64();
      const amount = this.readInteger();

      input.mint = {
        group,
        batch,
        amount,
      };
    }

    return input;
  }

  decodeOutput() {
    const t = this.subarray(0, 2);
    this.read(2);
    if (t.at(0) !== 0) throw new Error(`invalid output type ${t.at(0)}`);
    const type = t.at(1);
    const amount = this.readInteger();

    const lenKey = this.readInt();
    const keys = [];
    for (let i = 0; i < lenKey; i++) {
      const key = this.subarray(0, 32).toString('hex');
      this.read(32);
      keys.push(key);
    }
    const mask = this.subarray(0, 32).toString('hex');
    this.read(32);
    const lenScript = this.readInt();
    const script = this.buf.subarray(0, lenScript).toString('hex');
    this.read(lenScript);

    const output: Output = {
      type,
      amount: formatUnits(amount, 8).toString(),
      keys,
      mask,
      script,
    };

    const prefix = this.subarray(0, 2);
    this.read(2);
    if (prefix.equals(magic)) {
      const address = this.readBytes();
      const tag = this.readBytes();
      output.withdrawal = {
        address,
        tag,
      };
    }

    return output;
  }

  decodeSignature() {
    const len = this.readInt();
    const sigs: Record<number, string> = {};
    for (let i = 0; i < len; i++) {
      const index = this.readInt();
      const sig = this.buf.subarray(0, 64).toString('hex');
      sigs[index] = sig;
    }
    return sigs;
  }
}