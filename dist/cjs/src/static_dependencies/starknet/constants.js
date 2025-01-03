'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../scure-base/index.js');

// import { ETransactionVersion } from './types/api';
/**
 * Cairo Felt support storing max 31 character
 */
const TEXT_TO_FELT_MAX_LEN = 31;
/**
 * Alternatively use directly from api specification
 * types.RPC.ETransactionVersion
 * For BN do BigInt(TRANSACTION_VERSION.*)
 */
// export { ETransactionVersion as TRANSACTION_VERSION };
const ZERO = 0n;
const MASK_250 = 2n ** 250n - 1n; // 2 ** 250 - 1
const PRIME = 2n ** 251n + 17n * 2n ** 192n + 1n;
// based on: https://github.com/starkware-libs/cairo-lang/blob/v0.12.3/src/starkware/starknet/common/storage.cairo#L3
const MAX_STORAGE_ITEM_SIZE = 256n;
const ADDR_BOUND = 2n ** 251n - MAX_STORAGE_ITEM_SIZE;
const range = (min, max) => ({ min, max });
const RANGE_FELT = range(ZERO, PRIME - 1n);
const RANGE_I128 = range(-(2n ** 127n), 2n ** 127n - 1n);
const RANGE_U128 = range(ZERO, 2n ** 128n - 1n);
exports.BaseUrl = void 0;
(function (BaseUrl) {
    BaseUrl["SN_MAIN"] = "https://alpha-mainnet.starknet.io";
    BaseUrl["SN_SEPOLIA"] = "https://alpha-sepolia.starknet.io";
})(exports.BaseUrl || (exports.BaseUrl = {}));
exports.NetworkName = void 0;
(function (NetworkName) {
    NetworkName["SN_MAIN"] = "SN_MAIN";
    NetworkName["SN_SEPOLIA"] = "SN_SEPOLIA";
})(exports.NetworkName || (exports.NetworkName = {}));
exports.StarknetChainId = void 0;
(function (StarknetChainId) {
    StarknetChainId["SN_MAIN"] = "0x534e5f4d41494e";
    StarknetChainId["SN_SEPOLIA"] = "0x534e5f5345504f4c4941";
})(exports.StarknetChainId || (exports.StarknetChainId = {}));
exports.TransactionHashPrefix = void 0;
(function (TransactionHashPrefix) {
    TransactionHashPrefix["DECLARE"] = "0x6465636c617265";
    TransactionHashPrefix["DEPLOY"] = "0x6465706c6f79";
    TransactionHashPrefix["DEPLOY_ACCOUNT"] = "0x6465706c6f795f6163636f756e74";
    TransactionHashPrefix["INVOKE"] = "0x696e766f6b65";
    TransactionHashPrefix["L1_HANDLER"] = "0x6c315f68616e646c6572";
})(exports.TransactionHashPrefix || (exports.TransactionHashPrefix = {}));

exports.ADDR_BOUND = ADDR_BOUND;
exports.MASK_250 = MASK_250;
exports.MAX_STORAGE_ITEM_SIZE = MAX_STORAGE_ITEM_SIZE;
exports.PRIME = PRIME;
exports.RANGE_FELT = RANGE_FELT;
exports.RANGE_I128 = RANGE_I128;
exports.RANGE_U128 = RANGE_U128;
exports.TEXT_TO_FELT_MAX_LEN = TEXT_TO_FELT_MAX_LEN;
exports.ZERO = ZERO;
