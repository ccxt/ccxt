export type UtxoState = 'unspent' | 'signed' | 'spent';

export interface UtxoOutput {
    utxo_id: string;
    transaction_hash: string;
    output_index: number;
    asset: string;
    amount: string;
    mask: string;
    keys: string[];
    threshold: number;
    extra: string;
    state: UtxoState;
    created_at: string;
    updated_at: string;
    signed_by: string;
    signed_at: string;
    spent_at: string;
}

export interface SafeUtxoOutput extends UtxoOutput {
    asset_id: string;
    kernel_asset_id: string;
    receivers: string[];
    receivers_hash: string;
    receivers_threshold: number;
    senders: string[];
    senders_hash: string;
    senders_threshold: number;
    sequence: number;
}