import type { Input, Output } from './mixin_transaction.js';
export interface MultisigTransaction {
    /** 2 */
    version: number;
    /** mixin_id of asset */
    asset: string;
    inputs: Input[];
    outputs: Output[];
    extra: string;
}
export interface SafeTransaction extends MultisigTransaction {
    references: string[];
    signatureMap?: Record<number, string>[];
}
