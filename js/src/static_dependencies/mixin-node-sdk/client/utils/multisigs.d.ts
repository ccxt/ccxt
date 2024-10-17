import type { MultisigTransaction, UtxoOutput } from '../types';
export declare const TxVersion = 2;
export declare const getTotalBalanceFromOutputs: (outputs: UtxoOutput[]) => any;
export declare const encodeScript: (threshold: number) => string;
export declare const encodeTx: (tx: MultisigTransaction) => string;
/**
 * Generate raw for multi-signature transaction.
 * The total amount of input utxos should be equal to the total amount of output utxos.
 * */
export declare const buildMultiSigsTransaction: (transaction: MultisigTransaction) => string;
