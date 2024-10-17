export interface MintData {
    group: string;
    batch: bigint;
    amount: number;
}
export interface DepositData {
    chain: string;
    asset: string;
    transaction: string;
    index: bigint;
    amount: number;
}
export interface WithdrawData {
    address: string;
    tag: string;
    chain?: string;
    asset?: string;
}
export interface Input {
    hash: string;
    index: number;
    genesis?: string;
    deposit?: DepositData;
    mint?: MintData;
}
export interface Output {
    type?: number;
    amount: string;
    keys: string[];
    withdrawal?: WithdrawData;
    script?: string;
    mask?: string;
}
export interface Aggregated {
    signers: number[];
    signature: string;
}
export interface Transaction {
    hash?: string;
    snapshot?: string;
    signatures?: {
        [key: number]: string;
    };
    aggregated?: {
        signers: number[];
        signature: string;
    };
    version?: number;
    asset: string;
    inputs?: Input[];
    outputs?: Output[];
    extra: string;
}
