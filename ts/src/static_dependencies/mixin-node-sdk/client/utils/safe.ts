import { validate, v4 } from './_uuid';
import BigNumber from './_bignumber';
import { ed25519 } from './_noble-curves/ed25519';
import type { Input, Output, GhostKey, GhostKeyRequest, PaymentParams, SafeTransaction, SafeTransactionRecipient, SafeUtxoOutput } from '../types';
import { Encoder, magic } from './encoder';
import { Decoder } from './decoder';
import { base64RawURLEncode } from './base64';
import { TIPBodyForSequencerRegister } from './tip';
import { getPublicFromMainnetAddress, buildMixAddress, parseMixAddress } from './address';
import { encodeScript } from './multisigs';
import { blake3Hash, newHash, sha512Hash } from './uniq';
import { edwards25519 as ed, getRandomBytes } from './ed25519';

export const TxVersionHashSignature = 0x05;
export const OutputTypeScript = 0x00;
export const OutputTypeWithdrawalSubmit = 0xa1;

/**
 * Build Payment Uri on https://mixin.one
 * Destination can be set with
 *   1. uuid: uuid of the Mixin user or bot
 *   2. mainnetAddress: Mixin mainnet address started with "XIN"
 *   3. mixAddress: address encoded with members and threshold and started with "MIX"
 *   4. members and threshold: multisigs members' uuid or mainnet address, and threshold
 */
export const buildMixinOneSafePaymentUri = (params: PaymentParams) => {
  let address = '';
  if (params.uuid && validate(params.uuid)) address = params.uuid;
  else if (params.mainnetAddress && getPublicFromMainnetAddress(params.mainnetAddress)) address = params.mainnetAddress;
  else if (params.mixAddress && parseMixAddress(params.mixAddress)) address = params.mixAddress;
  else if (params.members && params.threshold) {
    address = buildMixAddress({
      members: params.members,
      threshold: params.threshold,
    });
  } else throw new Error('fail to get payment destination address');

  const baseUrl = `https://mixin.one/pay/${address}`;
  const p = {
    asset: params.asset,
    amount: params.amount,
    memo: params.memo,
    trace: params.trace ?? v4(),
    return_to: params.returnTo && encodeURIComponent(params.returnTo),
  };
  const query = Object.entries(p)
    .filter(([key, value]) => key && value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return `${baseUrl}?${query}`;
};

export const signSafeRegistration = (user_id: string, tipPin: string, privateKey: Buffer) => {
  const public_key = Buffer.from(ed25519.getPublicKey(privateKey)).toString('hex');

  const hash = newHash(Buffer.from(user_id));
  let signData = ed25519.sign(hash, privateKey);
  const signature = base64RawURLEncode(signData);

  const tipBody = TIPBodyForSequencerRegister(user_id, public_key);
  signData = ed25519.sign(tipBody, tipPin);

  return {
    public_key,
    signature,
    pin_base64: Buffer.from(signData).toString('hex'),
  };
};

export const deriveGhostPublicKey = (r: Buffer, A: Buffer, B: Buffer, index: number) => {
  const x = ed.hashScalar(ed.keyMultPubPriv(A, r), index);
  const p1 = ed.newPoint(B);
  const p2 = ed.scalarBaseMultToPoint(x);
  const p4 = p1.add(p2);
  // @ts-ignore
  return Buffer.from(p4.toRawBytes());
};

export const getMainnetAddressGhostKey = (recipient: GhostKeyRequest, hexSeed = '') => {
  if (recipient.receivers.length === 0) return undefined;
  if (hexSeed && hexSeed.length !== 128) return undefined;

  const publics = recipient.receivers.map(d => getPublicFromMainnetAddress(d));
  if (!publics.every(p => !!p)) return undefined;

  const seed = hexSeed ? Buffer.from(hexSeed, 'hex') : getRandomBytes(64);
  const r = Buffer.from(ed.scalar.toBytes(ed.setUniformBytes(seed)));
  const keys = publics.map(addressPubic => {
    const spendKey = addressPubic!.subarray(0, 32);
    const viewKey = addressPubic!.subarray(32, 64);
    const k = deriveGhostPublicKey(r, viewKey, spendKey, recipient.index);
    return k.toString('hex');
  });
  return {
    mask: ed.publicFromPrivate(r).toString('hex'),
    keys,
  };
};

export const buildSafeTransactionRecipient = (members: string[], threshold: number, amount: string): SafeTransactionRecipient => ({
  members,
  threshold,
  amount,
  mixAddress: buildMixAddress({ members, threshold }),
});

export const getUnspentOutputsForRecipients = (outputs: SafeUtxoOutput[], rs: SafeTransactionRecipient[]) => {
  const totalOutput = rs.reduce((prev, cur) => prev.plus(BigNumber(cur.amount)), BigNumber('0'));

  let totalInput = BigNumber('0');
  for (let i = 0; i < outputs.length; i++) {
    const o = outputs[i];
    if (o.state !== 'unspent') continue;
    totalInput = totalInput.plus(BigNumber(o.amount));
    if (totalInput.minus(totalOutput).isNegative()) continue;

    return {
      utxos: outputs.slice(0, i + 1),
      change: totalInput.minus(totalOutput),
    };
  }
  throw new Error('insufficient total input outputs');
};

export const encodeSafeTransaction = (tx: SafeTransaction, sigs: Record<number, string>[] = []) => {
  const enc = new Encoder(Buffer.from([]));

  enc.write(magic);
  enc.write(Buffer.from([0x00, tx.version]));
  enc.write(Buffer.from(tx.asset, 'hex'));

  enc.writeInt(tx.inputs.length);
  tx.inputs.forEach(input => {
    enc.encodeInput(input);
  });

  enc.writeInt(tx.outputs.length);
  tx.outputs.forEach(output => {
    enc.encodeOutput(output);
  });

  enc.writeInt(tx.references.length);
  tx.references.forEach(r => {
    enc.write(Buffer.from(r, 'hex'));
  });

  const extra = Buffer.from(tx.extra);
  enc.writeUint32(extra.byteLength);
  enc.write(extra);

  enc.writeInt(sigs.length);
  sigs.forEach(s => {
    enc.encodeSignature(s);
  });

  return enc.buf.toString('hex');
};

export const decodeSafeTransaction = (raw: string): SafeTransaction => {
  const dec = new Decoder(Buffer.from(raw, 'hex'));

  const prefix = dec.subarray(0, 2);
  if (!prefix.equals(magic)) throw new Error('invalid magic');
  dec.read(3);

  const version = dec.readByte();
  if (version !== TxVersionHashSignature) throw new Error('invalid version');

  const asset = dec.subarray(0, 32).toString('hex');
  dec.read(32);

  const lenInput = dec.readInt();
  const inputs = [];
  for (let i = 0; i < lenInput; i++) {
    inputs.push(dec.decodeInput());
  }

  const lenOutput = dec.readInt();
  const outputs = [];
  for (let i = 0; i < lenOutput; i++) {
    outputs.push(dec.decodeOutput());
  }

  const lenRefs = dec.readInt();
  const references = [];
  for (let i = 0; i < lenRefs; i++) {
    const hash = dec.subarray(0, 32).toString('hex');
    dec.read(32);
    references.push(hash);
  }

  const lenExtra = dec.readUint32();
  const extra = dec.subarray(0, lenExtra).toString();
  dec.read(lenExtra);

  const lenSigs = dec.readInt();
  const signatureMap = [];
  for (let i = 0; i < lenSigs; i++) {
    signatureMap.push(dec.decodeSignature());
  }

  return {
    version,
    asset,
    extra,
    inputs,
    outputs,
    references,
    signatureMap,
  };
};

export const buildSafeTransaction = (utxos: SafeUtxoOutput[], rs: SafeTransactionRecipient[], gs: GhostKey[], extra: string, references: string[] = []): SafeTransaction => {
  if (utxos.length === 0) throw new Error('empty inputs');
  if (Buffer.from(extra).byteLength > 512) throw new Error('extra data is too long');

  let asset = '';
  const inputs: Input[] = [];
  utxos.forEach(o => {
    if (!asset) asset = o.asset;
    if (o.asset !== asset) throw new Error('inconsistent asset in outputs');
    inputs.push({ hash: o.transaction_hash, index: o.output_index });
  });

  const outputs: Output[] = [];
  for (let i = 0; i < rs.length; i++) {
    const r = rs[i];
    if ('destination' in r) {
      outputs.push({
        type: OutputTypeWithdrawalSubmit,
        amount: r.amount,
        withdrawal: {
          address: r.destination,
          tag: r.tag ?? '',
        },
        keys: [],
      });
      continue;
    }

    outputs.push({
      type: OutputTypeScript,
      amount: r.amount,
      keys: gs[i].keys,
      mask: gs[i].mask,
      script: encodeScript(r.threshold),
    });
  }

  return {
    version: TxVersionHashSignature,
    asset,
    extra,
    inputs,
    outputs,
    references,
    signatureMap: [],
  };
};

export const signSafeTransaction = (tx: SafeTransaction, views: string[], privateKey: string, index = 0) => {
  const raw = encodeSafeTransaction(tx);
  const msg = blake3Hash(Buffer.from(raw, 'hex'));

  const spenty = sha512Hash(Buffer.from(privateKey.slice(0, 64), 'hex'));
  const y = ed.setBytesWithClamping(spenty.subarray(0, 32));

  const signaturesMap = [];
  for (let i = 0; i < tx.inputs.length; i++) {
    const viewBuffer = Buffer.from(views[i], 'hex');
    const x = ed.setCanonicalBytes(viewBuffer);
    const t = ed.scalar.add(x, y);
    const key = Buffer.from(ed.scalar.toBytes(t));
    const sig = ed.sign(msg, key);
    const sigs: Record<number, string> = {};
    sigs[index] = sig.toString('hex');
    signaturesMap.push(sigs);
  }

  return encodeSafeTransaction(tx, signaturesMap);
};