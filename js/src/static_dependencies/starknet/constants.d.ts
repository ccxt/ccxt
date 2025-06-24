export { IS_BROWSER } from './utils/encode.js';
/**
 * Cairo Felt support storing max 31 character
 */
export declare const TEXT_TO_FELT_MAX_LEN = 31;
/**
 * Alternatively use directly from api specification
 * types.RPC.ETransactionVersion
 * For BN do BigInt(TRANSACTION_VERSION.*)
 */
export declare const ZERO = 0n;
export declare const MASK_250: bigint;
export declare const API_VERSION = 0n;
export declare const PRIME: bigint;
export declare const MAX_STORAGE_ITEM_SIZE = 256n;
export declare const ADDR_BOUND: bigint;
export declare const RANGE_FELT: {
    readonly min: bigint;
    readonly max: bigint;
};
export declare const RANGE_I128: {
    readonly min: bigint;
    readonly max: bigint;
};
export declare const RANGE_U128: {
    readonly min: bigint;
    readonly max: bigint;
};
export declare enum BaseUrl {
    SN_MAIN = "https://alpha-mainnet.starknet.io",
    SN_SEPOLIA = "https://alpha-sepolia.starknet.io"
}
export declare enum NetworkName {
    SN_MAIN = "SN_MAIN",
    SN_SEPOLIA = "SN_SEPOLIA"
}
export declare enum StarknetChainId {
    SN_MAIN = "0x534e5f4d41494e",
    SN_SEPOLIA = "0x534e5f5345504f4c4941"
}
export declare enum TransactionHashPrefix {
    DECLARE = "0x6465636c617265",
    DEPLOY = "0x6465706c6f79",
    DEPLOY_ACCOUNT = "0x6465706c6f795f6163636f756e74",
    INVOKE = "0x696e766f6b65",
    L1_HANDLER = "0x6c315f68616e646c6572"
}
export declare const enum feeMarginPercentage {
    L1_BOUND_MAX_AMOUNT = 50,
    L1_BOUND_MAX_PRICE_PER_UNIT = 50,
    MAX_FEE = 50
}
export declare const UDC: {
    ADDRESS: string;
    ENTRYPOINT: string;
};
export declare const RPC_DEFAULT_VERSION = "v0_7";
export declare const RPC_NODES: {
    SN_MAIN: string[];
    SN_SEPOLIA: string[];
};
