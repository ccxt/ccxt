/**
 * @param {any} provider
 * @returns {JsonRpcSigner}
 */
export function newRpcSignerWithProvider(provider: any): JsonRpcSigner;
/**
 * @param {any} signer
 * @param {string} pub_key
 * @param {string} chain_id
 * @returns {JsonRpcSigner}
 */
export function newRpcSignerWithSigner(signer: any, pub_key: string, chain_id: string): JsonRpcSigner;
/**
 * @param {ChangePubKeyBuilder} builder
 * @returns {ChangePubKey}
 */
export function newChangePubkey(builder: ChangePubKeyBuilder): ChangePubKey;
/**
 * @param {LiquidationBuilder} builder
 * @returns {Liquidation}
 */
export function newLiquidation(builder: LiquidationBuilder): Liquidation;
/**
 * @param {ForcedExitBuilder} builder
 * @returns {ForcedExit}
 */
export function newForcedExit(builder: ForcedExitBuilder): ForcedExit;
/**
 * @param {TransferBuilder} builder
 * @returns {Transfer}
 */
export function newTransfer(builder: TransferBuilder): Transfer;
/**
 * @param {AutoDeleveragingBuilder} builder
 * @returns {AutoDeleveraging}
 */
export function newAutoDeleveraging(builder: AutoDeleveragingBuilder): AutoDeleveraging;
/**
 * @param {UpdateGlobalVarBuilder} builder
 * @returns {UpdateGlobalVar}
 */
export function newUpdateGlobalVar(builder: UpdateGlobalVarBuilder): UpdateGlobalVar;
/**
 * @param {FundingBuilder} builder
 * @returns {Funding}
 */
export function newFunding(builder: FundingBuilder): Funding;
/**
 * @param {WithdrawBuilder} builder
 * @returns {Withdraw}
 */
export function newWithdraw(builder: WithdrawBuilder): Withdraw;
/**
 * @param {ContractMatchingBuilder} builder
 * @returns {ContractMatching}
 */
export function newContractMatching(builder: ContractMatchingBuilder): ContractMatching;
/**
 * @param {ContractBuilder} builder
 * @returns {Contract}
 */
export function newContract(builder: ContractBuilder): Contract;
/**
 * @param {OrderMatchingBuilder} builder
 * @returns {OrderMatching}
 */
export function newOrderMatching(builder: OrderMatchingBuilder): OrderMatching;
/**
 * @param {string} amount
 * @returns {boolean}
 */
export function isTokenAmountPackable(amount: string): boolean;
/**
 * @param {string} fee
 * @returns {boolean}
 */
export function isFeeAmountPackable(fee: string): boolean;
/**
 * @param {string} amount
 * @returns {string}
 */
export function closestPackableTransactionAmount(amount: string): string;
/**
 * @param {string} fee
 * @returns {string}
 */
export function closestPackableTransactionFee(fee: string): string;
/**
 */
export const WaitForTxStatus: Readonly<{
    Success: 0;
    0: "Success";
    Failed: 1;
    1: "Failed";
    Pending: 2;
    2: "Pending";
}>;
/**
 */
export const EthAuthType: Readonly<{
    OnChain: 0;
    0: "OnChain";
    EthECDSA: 1;
    1: "EthECDSA";
    EthCREATE2: 2;
    2: "EthCREATE2";
}>;
/**
 */
export const L1SignatureType: Readonly<{
    Eth: 0;
    0: "Eth";
    Eip1271: 1;
    1: "Eip1271";
    Stark: 2;
    2: "Stark";
}>;
/**
 * A set of L2 transaction type supported by the zklink network.
 */
export const ZkLinkTxType: Readonly<{
    Deposit: 1;
    1: "Deposit";
    FullExit: 5;
    5: "FullExit";
    ChangePubKey: 6;
    6: "ChangePubKey";
    Transfer: 4;
    4: "Transfer";
    Withdraw: 3;
    3: "Withdraw";
    ForcedExit: 7;
    7: "ForcedExit";
    OrderMatching: 8;
    8: "OrderMatching";
    AutoDeleveraging: 11;
    11: "AutoDeleveraging";
    ContractMatching: 9;
    9: "ContractMatching";
    Funding: 13;
    13: "Funding";
    Liquidation: 10;
    10: "Liquidation";
    UpdateGlobalVar: 12;
    12: "UpdateGlobalVar";
}>;
/**
 */
export const BlockNumber: Readonly<{
    Latest: 0;
    0: "Latest";
    Finalized: 1;
    1: "Finalized";
    Safe: 2;
    2: "Safe";
    Earliest: 3;
    3: "Earliest";
    Pending: 4;
    4: "Pending";
    Number: 5;
    5: "Number";
}>;
/**
 */
export const ParameterType: Readonly<{
    FeeAccount: 0;
    0: "FeeAccount";
    InsuranceFundAccount: 1;
    1: "InsuranceFundAccount";
    MarginInfo: 2;
    2: "MarginInfo";
    FundingInfos: 3;
    3: "FundingInfos";
    ContractInfo: 4;
    4: "ContractInfo";
}>;
/**
 */
export const AccountQueryType: Readonly<{
    AccountId: 0;
    0: "AccountId";
    Address: 1;
    1: "Address";
}>;
/**
 */
export class AccountQuery {
    /**
     * @param {AccountQueryType} query_type
     * @param {string} query_param
     */
    constructor(query_type: Readonly<{
        AccountId: 0;
        0: "AccountId";
        Address: 1;
        1: "Address";
    }>, query_param: string);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
}
/**
 */
export class AutoDeleveraging {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class AutoDeleveragingBuilder {
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {number} sub_account_nonce
     * @param {any[]} contract_prices
     * @param {any[]} margin_prices
     * @param {number} adl_account_id
     * @param {number} pair_id
     * @param {string} adl_size
     * @param {string} adl_price
     * @param {string} fee
     * @param {number} fee_token
     */
    constructor(account_id: number, sub_account_id: number, sub_account_nonce: number, contract_prices: any[], margin_prices: any[], adl_account_id: number, pair_id: number, adl_size: string, adl_price: string, fee: string, fee_token: number);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {AutoDeleveraging}
     */
    build(): AutoDeleveraging;
}
/**
 */
export class ChangePubKey {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {number} layer_one_chain_id
     * @param {string} verifying_contract
     * @returns {string}
     */
    getChangePubkeyMessage(layer_one_chain_id: number, verifying_contract: string): string;
    /**
     * @param {number} nonce
     * @param {number} account_id
     * @returns {string}
     */
    getEthSignMsg(nonce: number, account_id: number): string;
    /**
     * @param {string} sig
     * @returns {any}
     */
    setEthAuthData(sig: string): any;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class ChangePubKeyBuilder {
    /**
     * @param {number} chain_id
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {string} new_pubkey_hash
     * @param {number} fee_token
     * @param {string} fee
     * @param {number} nonce
     * @param {string | undefined} [eth_signature]
     * @param {number | undefined} [ts]
     */
    constructor(chain_id: number, account_id: number, sub_account_id: number, new_pubkey_hash: string, fee_token: number, fee: string, nonce: number, eth_signature?: string | undefined, ts?: number | undefined);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {ChangePubKey}
     */
    build(): ChangePubKey;
}
/**
 */
export class Contract {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class ContractBuilder {
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {number} slot_id
     * @param {number} nonce
     * @param {number} pair_id
     * @param {string} size
     * @param {string} price
     * @param {boolean} direction
     * @param {number} maker_fee_rate
     * @param {number} taker_fee_rate
     * @param {boolean} has_subsidy
     */
    constructor(account_id: number, sub_account_id: number, slot_id: number, nonce: number, pair_id: number, size: string, price: string, direction: boolean, maker_fee_rate: number, taker_fee_rate: number, has_subsidy: boolean);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {Contract}
     */
    build(): Contract;
}
/**
 */
export class ContractInfo {
    /**
     * @param {number} pair_id
     * @param {string} symbol
     * @param {number} initial_margin_rate
     * @param {number} maintenance_margin_rate
     */
    constructor(pair_id: number, symbol: string, initial_margin_rate: number, maintenance_margin_rate: number);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export class ContractMatching {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class ContractMatchingBuilder {
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {any} taker
     * @param {any[]} maker
     * @param {string} fee
     * @param {number} fee_token
     * @param {any[]} contract_prices
     * @param {any[]} margin_prices
     */
    constructor(account_id: number, sub_account_id: number, taker: any, maker: any[], fee: string, fee_token: number, contract_prices: any[], margin_prices: any[]);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {ContractMatching}
     */
    build(): ContractMatching;
}
/**
 */
export class ContractPrice {
    /**
     * @param {number} pair_id
     * @param {string} market_price
     */
    constructor(pair_id: number, market_price: string);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export class Create2Data {
    /**
     * @param {string} creator_address
     * @param {string} salt
     * @param {string} code_hash
     */
    constructor(creator_address: string, salt: string, code_hash: string);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @param {string} pubkey_hash
     * @returns {string}
     */
    salt(pubkey_hash: string): string;
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export class EthTxOption {
    /**
     * @param {boolean} is_support_eip1559
     * @param {string} to
     * @param {number | undefined} [nonce]
     * @param {string | undefined} [value]
     * @param {number | undefined} [gas]
     * @param {string | undefined} [gas_price]
     */
    constructor(is_support_eip1559: boolean, to: string, nonce?: number | undefined, value?: string | undefined, gas?: number | undefined, gas_price?: string | undefined);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export class ForcedExit {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class ForcedExitBuilder {
    /**
     * @param {number} to_chain_id
     * @param {number} initiator_account_id
     * @param {number} initiator_sub_account_id
     * @param {number} target_sub_account_id
     * @param {string} target
     * @param {number} l2_source_token
     * @param {number} l1_target_token
     * @param {string} exit_amount
     * @param {number} initiator_nonce
     * @param {boolean} withdraw_to_l1
     * @param {number | undefined} [ts]
     */
    constructor(to_chain_id: number, initiator_account_id: number, initiator_sub_account_id: number, target_sub_account_id: number, target: string, l2_source_token: number, l1_target_token: number, exit_amount: string, initiator_nonce: number, withdraw_to_l1: boolean, ts?: number | undefined);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {ForcedExit}
     */
    build(): ForcedExit;
}
/**
 */
export class Funding {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class FundingBuilder {
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {number} sub_account_nonce
     * @param {Uint32Array} funding_account_ids
     * @param {string} fee
     * @param {number} fee_token
     */
    constructor(account_id: number, sub_account_id: number, sub_account_nonce: number, funding_account_ids: Uint32Array, fee: string, fee_token: number);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {Funding}
     */
    build(): Funding;
}
/**
 */
export class FundingInfo {
    /**
     * @param {number} pair_id
     * @param {number} funding_rate
     * @param {string} price
     */
    constructor(pair_id: number, funding_rate: number, price: string);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export class JsonRpcSigner {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @param {string | undefined} [signature]
     * @returns {Promise<void>}
     */
    initZklinkSigner(signature?: string | undefined): Promise<void>;
    /**
     * @returns {string}
     */
    getPubkey(): string;
    /**
     * @returns {string}
     */
    pubkeyHash(): string;
    /**
     * @returns {string | undefined}
     */
    address(): string | undefined;
    /**
     * @returns {string}
     */
    signatureSeed(): string;
    /**
     * @param {ChangePubKey} tx
     * @returns {any}
     */
    signChangePubkeyWithOnchain(tx: ChangePubKey): any;
    /**
     * @param {ChangePubKey} tx
     * @returns {Promise<any>}
     */
    signChangePubkeyWithEthEcdsaAuth(tx: ChangePubKey): Promise<any>;
    /**
     * @param {ChangePubKey} tx
     * @param {Create2Data} create2_data
     * @returns {any}
     */
    signChangePubkeyWithCreate2DataAuth(tx: ChangePubKey, create2_data: Create2Data): any;
    /**
     * @param {Transfer} tx
     * @param {string} token_symbol
     * @returns {Promise<any>}
     */
    signTransfer(tx: Transfer, token_symbol: string): Promise<any>;
    /**
     * @param {Order} order
     * @returns {any}
     */
    createSignedOrder(order: Order): any;
    /**
     * @param {OrderMatching} tx
     * @returns {any}
     */
    signOrderMatching(tx: OrderMatching): any;
    /**
     * @param {Withdraw} tx
     * @param {string} token_symbol
     * @returns {Promise<any>}
     */
    signWithdraw(tx: Withdraw, token_symbol: string): Promise<any>;
    /**
     * @param {ForcedExit} tx
     * @returns {any}
     */
    signForcedExit(tx: ForcedExit): any;
    /**
     * @param {AutoDeleveraging} tx
     * @returns {any}
     */
    signAutoDeleveraging(tx: AutoDeleveraging): any;
    /**
     * @param {Contract} contract
     * @returns {any}
     */
    createSignedContract(contract: Contract): any;
    /**
     * @param {ContractMatching} tx
     * @returns {any}
     */
    signContractMatching(tx: ContractMatching): any;
    /**
     * @param {Funding} tx
     * @returns {any}
     */
    signFunding(tx: Funding): any;
    /**
     * @param {Liquidation} tx
     * @returns {any}
     */
    signLiquidation(tx: Liquidation): any;
    /**
     * @param {Uint8Array} msg
     * @returns {TxZkLinkSignature}
     */
    signMusig(msg: Uint8Array): TxZkLinkSignature;
    /**
     * @returns {ZkLinkSigner}
     */
    getZkLinkSigner(): ZkLinkSigner;
}
/**
 */
export class Liquidation {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class LiquidationBuilder {
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {number} sub_account_nonce
     * @param {any[]} contract_prices
     * @param {any[]} margin_prices
     * @param {number} liquidation_account_id
     * @param {string} fee
     * @param {number} fee_token
     */
    constructor(account_id: number, sub_account_id: number, sub_account_nonce: number, contract_prices: any[], margin_prices: any[], liquidation_account_id: number, fee: string, fee_token: number);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {Liquidation}
     */
    build(): Liquidation;
}
/**
 */
export class MarginInfo {
    /**
     * @param {number} margin_id
     * @param {number} token_id
     * @param {number} ratio
     */
    constructor(margin_id: number, token_id: number, ratio: number);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export class Order {
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {number} slot_id
     * @param {number} nonce
     * @param {number} base_token_id
     * @param {number} quote_token_id
     * @param {string} amount
     * @param {string} price
     * @param {boolean} is_sell
     * @param {number} maker_fee_rate
     * @param {number} taker_fee_rate
     * @param {boolean} has_subsidy
     */
    constructor(account_id: number, sub_account_id: number, slot_id: number, nonce: number, base_token_id: number, quote_token_id: number, amount: string, price: string, is_sell: boolean, maker_fee_rate: number, taker_fee_rate: number, has_subsidy: boolean);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class OrderMatching {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export class OrderMatchingBuilder {
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {any} taker
     * @param {any} maker
     * @param {string} fee
     * @param {number} fee_token
     * @param {any[]} contract_prices
     * @param {any[]} margin_prices
     * @param {string} expect_base_amount
     * @param {string} expect_quote_amount
     */
    constructor(account_id: number, sub_account_id: number, taker: any, maker: any, fee: string, fee_token: number, contract_prices: any[], margin_prices: any[], expect_base_amount: string, expect_quote_amount: string);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {OrderMatching}
     */
    build(): OrderMatching;
}
/**
 */
export class Parameter {
    /**
     * @param {ParameterType} parameter_type
     * @param {any} parameter_value
     */
    constructor(parameter_type: Readonly<{
        FeeAccount: 0;
        0: "FeeAccount";
        InsuranceFundAccount: 1;
        1: "InsuranceFundAccount";
        MarginInfo: 2;
        2: "MarginInfo";
        FundingInfos: 3;
        3: "FundingInfos";
        ContractInfo: 4;
        4: "ContractInfo";
    }>, parameter_value: any);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
}
/**
 */
export class RequestArguments {
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
}
/**
 */
export class RpcClient {
    /**
     * @param {string} network
     * @param {string | undefined} [custom_url]
     */
    constructor(network: string, custom_url?: string | undefined);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {Promise<any>}
     */
    getSupportTokens(): Promise<any>;
    /**
     * @param {AccountQuery} account_query
     * @param {number | undefined} [sub_account_id]
     * @param {number | undefined} [block_number]
     * @returns {Promise<any>}
     */
    getAccountSnapshot(account_query: AccountQuery, sub_account_id?: number | undefined, block_number?: number | undefined): Promise<any>;
    /**
     * @param {any} tx
     * @param {TxLayer1Signature | undefined} [l1_signature]
     * @param {TxZkLinkSignature | undefined} [l2_signature]
     * @returns {Promise<any>}
     */
    sendTransaction(tx: any, l1_signature?: TxLayer1Signature | undefined, l2_signature?: TxZkLinkSignature | undefined): Promise<any>;
    /**
     * @returns {Promise<any>}
     */
    getSupportChains(): Promise<any>;
    /**
     * @returns {Promise<any>}
     */
    getLatestBlockNumber(): Promise<any>;
    /**
     * @param {number | undefined} block_number
     * @param {boolean} include_tx
     * @param {boolean} include_update
     * @returns {Promise<any>}
     */
    getBlockByNumber(block_number: number | undefined, include_tx: boolean, include_update: boolean): Promise<any>;
    /**
     * @param {bigint} last_tx_timestamp_micro
     * @param {boolean} include_tx
     * @param {boolean} include_update
     * @param {number | undefined} [limit]
     * @returns {Promise<any>}
     */
    getPendingBlock(last_tx_timestamp_micro: bigint, include_tx: boolean, include_update: boolean, limit?: number | undefined): Promise<any>;
    /**
     * @param {number} block_number
     * @returns {Promise<any>}
     */
    getBlockOnChainByNumber(block_number: number): Promise<any>;
    /**
     * @param {AccountQuery} account_query
     * @returns {Promise<any>}
     */
    getAccount(account_query: AccountQuery): Promise<any>;
    /**
     * @param {number} account_id
     * @param {number | undefined} [sub_account_id]
     * @returns {Promise<any>}
     */
    getAccountBalances(account_id: number, sub_account_id?: number | undefined): Promise<any>;
    /**
     * @param {number} account_id
     * @param {number | undefined} [sub_account_id]
     * @returns {Promise<any>}
     */
    getAccountOrderSlots(account_id: number, sub_account_id?: number | undefined): Promise<any>;
    /**
     * @param {number} token_id
     * @param {boolean} mapping
     * @returns {Promise<any>}
     */
    getTokenReserve(token_id: number, mapping: boolean): Promise<any>;
    /**
     * @param {string} hash
     * @param {boolean} include_update
     * @returns {Promise<any>}
     */
    getTransactionByHash(hash: string, include_update: boolean): Promise<any>;
    /**
     * @param {ZkLinkTxType} tx_type
     * @param {string} address
     * @param {bigint} page_index
     * @param {number} page_size
     * @returns {Promise<any>}
     */
    getAccountTransactionHistory(tx_type: Readonly<{
        Deposit: 1;
        1: "Deposit";
        FullExit: 5;
        5: "FullExit";
        ChangePubKey: 6;
        6: "ChangePubKey";
        Transfer: 4;
        4: "Transfer";
        Withdraw: 3;
        3: "Withdraw";
        ForcedExit: 7;
        7: "ForcedExit";
        OrderMatching: 8;
        8: "OrderMatching";
        AutoDeleveraging: 11;
        11: "AutoDeleveraging";
        ContractMatching: 9;
        9: "ContractMatching";
        Funding: 13;
        13: "Funding";
        Liquidation: 10;
        10: "Liquidation";
        UpdateGlobalVar: 12;
        12: "UpdateGlobalVar";
    }>, address: string, page_index: bigint, page_size: number): Promise<any>;
    /**
     * @param {bigint} last_tx_timestamp
     * @param {number} max_txs
     * @returns {Promise<any>}
     */
    getWithdrawTxs(last_tx_timestamp: bigint, max_txs: number): Promise<any>;
    /**
     * @param {number} sub_account_id
     * @param {bigint} offset_id
     * @param {bigint} limit
     * @returns {Promise<any>}
     */
    pullForwardTxs(sub_account_id: number, offset_id: bigint, limit: bigint): Promise<any>;
    /**
     * @param {string} topic
     * @param {number} from_topic_index_included
     * @param {number | undefined} [limit]
     * @returns {Promise<any>}
     */
    getWebSocketEvents(topic: string, from_topic_index_included: number, limit?: number | undefined): Promise<any>;
}
/**
 */
export class SpotPriceInfo {
    /**
     * @param {number} token_id
     * @param {string} price
     */
    constructor(token_id: number, price: string);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export class Transfer {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {string} token_symbol
     * @returns {string}
     */
    getEthSignMsg(token_symbol: string): string;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class TransferBuilder {
    /**
     * @param {number} account_id
     * @param {string} to_address
     * @param {number} from_sub_account_id
     * @param {number} to_sub_account_id
     * @param {number} token
     * @param {string} fee
     * @param {string} amount
     * @param {number} nonce
     * @param {number | undefined} [ts]
     */
    constructor(account_id: number, to_address: string, from_sub_account_id: number, to_sub_account_id: number, token: number, fee: string, amount: string, nonce: number, ts?: number | undefined);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {Transfer}
     */
    build(): Transfer;
}
/**
 */
export class TxLayer1Signature {
    /**
     * @param {L1SignatureType} sign_type
     * @param {string} signature
     */
    constructor(sign_type: Readonly<{
        Eth: 0;
        0: "Eth";
        Eip1271: 1;
        1: "Eip1271";
        Stark: 2;
        2: "Stark";
    }>, signature: string);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {L1SignatureType}
     */
    signType(): Readonly<{
        Eth: 0;
        0: "Eth";
        Eip1271: 1;
        1: "Eip1271";
        Stark: 2;
        2: "Stark";
    }>;
    /**
     * @returns {string}
     */
    signature(): string;
}
/**
 */
export class TxZkLinkSignature {
    static __wrap(ptr: any): any;
    /**
     * @param {string} pub_key
     * @param {string} signature
     */
    constructor(pub_key: string, signature: string);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {string}
     */
    pubKey(): string;
    /**
     * @returns {string}
     */
    signature(): string;
}
/**
 */
export class UpdateGlobalVar {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @returns {any}
     */
    zklinkTx(): any;
}
/**
 */
export class UpdateGlobalVarBuilder {
    /**
     * @param {number} from_chain_id
     * @param {number} sub_account_id
     * @param {Parameter} parameter
     * @param {number} serial_id
     */
    constructor(from_chain_id: number, sub_account_id: number, parameter: Parameter, serial_id: number);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {UpdateGlobalVar}
     */
    build(): UpdateGlobalVar;
}
/**
 */
export class Wallet {
    /**
     * @param {string} url
     * @param {string} private_key
     */
    constructor(url: string, private_key: string);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {Promise<string>}
     */
    getBalance(): Promise<string>;
    /**
     * @param {BlockNumber} block_number
     * @param {number | undefined} [block]
     * @returns {Promise<number>}
     */
    getNonce(block_number: Readonly<{
        Latest: 0;
        0: "Latest";
        Finalized: 1;
        1: "Finalized";
        Safe: 2;
        2: "Safe";
        Earliest: 3;
        3: "Earliest";
        Pending: 4;
        4: "Pending";
        Number: 5;
        5: "Number";
    }>, block?: number | undefined): Promise<number>;
    /**
     * @param {EthTxOption} eth_params
     * @returns {Promise<string>}
     */
    getDepositFee(eth_params: EthTxOption): Promise<string>;
    /**
     * @param {string} tx_hash
     * @param {number | undefined} [timeout]
     * @returns {Promise<WaitForTxStatus>}
     */
    waitForTransaction(tx_hash: string, timeout?: number | undefined): Promise<Readonly<{
        Success: 0;
        0: "Success";
        Failed: 1;
        1: "Failed";
        Pending: 2;
        2: "Pending";
    }>>;
    /**
     * @param {string} contract
     * @param {string} amount
     * @param {EthTxOption} eth_params
     * @returns {Promise<string>}
     */
    approveERC20(contract: string, amount: string, eth_params: EthTxOption): Promise<string>;
    /**
     * @param {number} sub_account_id
     * @param {string} deposit_to
     * @param {string} token_addr
     * @param {string} amount
     * @param {boolean} mapping
     * @param {EthTxOption} eth_params
     * @param {boolean} is_gateway
     * @returns {Promise<string>}
     */
    depositERC20(sub_account_id: number, deposit_to: string, token_addr: string, amount: string, mapping: boolean, eth_params: EthTxOption, is_gateway: boolean): Promise<string>;
    /**
     * @param {number} sub_account_id
     * @param {string} deposit_to
     * @param {EthTxOption} eth_params
     * @param {boolean} is_gateway
     * @returns {Promise<string>}
     */
    depositETH(sub_account_id: number, deposit_to: string, eth_params: EthTxOption, is_gateway: boolean): Promise<string>;
    /**
     * @param {number} nonce
     * @param {string} new_pubkey_hash
     * @param {EthTxOption} eth_params
     * @returns {Promise<string>}
     */
    setAuthPubkeyHash(nonce: number, new_pubkey_hash: string, eth_params: EthTxOption): Promise<string>;
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {number} token_id
     * @param {boolean} mapping
     * @param {EthTxOption} eth_params
     * @returns {Promise<string>}
     */
    fullExit(account_id: number, sub_account_id: number, token_id: number, mapping: boolean, eth_params: EthTxOption): Promise<string>;
}
/**
 */
export class Withdraw {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
    /**
     * @param {string} token_symbol
     * @returns {string}
     */
    getEthSignMsg(token_symbol: string): string;
    /**
     * @param {ZkLinkSigner} signer
     * @returns {any}
     */
    sign(signer: ZkLinkSigner): any;
}
/**
 */
export class WithdrawBuilder {
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {number} to_chain_id
     * @param {string} to_address
     * @param {number} l2_source_token
     * @param {number} l1_target_token
     * @param {string} amount
     * @param {string | undefined} call_data
     * @param {string} fee
     * @param {number} nonce
     * @param {boolean} withdraw_to_l1
     * @param {number} withdraw_fee_ratio
     * @param {number | undefined} [ts]
     */
    constructor(account_id: number, sub_account_id: number, to_chain_id: number, to_address: string, l2_source_token: number, l1_target_token: number, amount: string, call_data: string | undefined, fee: string, nonce: number, withdraw_to_l1: boolean, withdraw_fee_ratio: number, ts?: number | undefined);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @returns {Withdraw}
     */
    build(): Withdraw;
}
/**
 */
export class ZkLinkSigner {
    static __wrap(ptr: any): any;
    /**
     * @param {string} sig
     * @returns {ZkLinkSigner}
     */
    static ethSig(sig: string): ZkLinkSigner;
    /**
     * @param {string} sig
     * @returns {ZkLinkSigner}
     */
    static starknetSig(sig: string): ZkLinkSigner;
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
}
/**
 */
export class ZkLinkTx {
    /**
     * @param {number} tx_type
     * @param {any} tx
     */
    constructor(tx_type: number, tx: any);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
}
export default __wbg_init;
export function initSync(module: any): any;
declare function __wbg_init(input: any): Promise<any>;
