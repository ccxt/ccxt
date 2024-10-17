import BigNumber from './_bignumber.js';
import type { MultisigTransaction, UtxoOutput } from '../types';
import { Encoder, magic } from './encoder.js';

export const TxVersion = 0x02;

export const getTotalBalanceFromOutputs = (outputs: UtxoOutput[]) => outputs.reduce((prev, cur) => prev.plus(BigNumber(cur.amount)), BigNumber('0'));

export const encodeScript = (threshold: number) => {
  let s = threshold.toString(16);
  if (s.length === 1) s = `0${s}`;
  if (s.length > 2) throw new Error(`INVALID THRESHOLD ${threshold}`);

  return `fffe${s}`;
};

export const encodeTx = (tx: MultisigTransaction) => {
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

  const extra = Buffer.from(tx.extra);
  enc.writeInt(extra.byteLength);
  enc.write(extra);

  enc.writeInt(0);
  enc.write(Buffer.from([]));

  return enc.buf.toString('hex');
};

/**
 * Generate raw for multi-signature transaction.
 * The total amount of input utxos should be equal to the total amount of output utxos.
 * */
export const buildMultiSigsTransaction = (transaction: MultisigTransaction) => {
  if (transaction.version !== TxVersion) throw new Error('Invalid Version!');

  const tx = {
    ...transaction,
    outputs: transaction.outputs.filter(output => !!output.mask),
  };
  return encodeTx(tx);
};