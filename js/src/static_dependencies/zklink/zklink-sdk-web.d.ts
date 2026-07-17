/**
 * @param {any} provider
 * @returns {JsonRpcSigner}
 */
export declare function newRpcSignerWithProvider(provider: any): JsonRpcSigner;
/**
 * @param {any} signer
 * @param {string} pub_key
 * @param {string} chain_id
 * @returns {JsonRpcSigner}
 */
export declare function newRpcSignerWithSigner(signer: any, pub_key: string, chain_id: string): JsonRpcSigner;
/**
 * @param {ChangePubKeyBuilder} builder
 * @returns {ChangePubKey}
 */
export declare function newChangePubkey(builder: ChangePubKeyBuilder): ChangePubKey;
/**
 * @param {LiquidationBuilder} builder
 * @returns {Liquidation}
 */
export declare function newLiquidation(builder: LiquidationBuilder): Liquidation;
/**
 * @param {ForcedExitBuilder} builder
 * @returns {ForcedExit}
 */
export declare function newForcedExit(builder: ForcedExitBuilder): ForcedExit;
/**
 * @param {TransferBuilder} builder
 * @returns {Transfer}
 */
export declare function newTransfer(builder: TransferBuilder): Transfer;
/**
 * @param {AutoDeleveragingBuilder} builder
 * @returns {AutoDeleveraging}
 */
export declare function newAutoDeleveraging(builder: AutoDeleveragingBuilder): AutoDeleveraging;
/**
 * @param {UpdateGlobalVarBuilder} builder
 * @returns {UpdateGlobalVar}
 */
export declare function newUpdateGlobalVar(builder: UpdateGlobalVarBuilder): UpdateGlobalVar;
/**
 * @param {FundingBuilder} builder
 * @returns {Funding}
 */
export declare function newFunding(builder: FundingBuilder): Funding;
/**
 * @param {WithdrawBuilder} builder
 * @returns {Withdraw}
 */
export declare function newWithdraw(builder: WithdrawBuilder): Withdraw;
/**
 * @param {ContractMatchingBuilder} builder
 * @returns {ContractMatching}
 */
export declare function newContractMatching(builder: ContractMatchingBuilder): ContractMatching;
/**
 * @param {ContractBuilder} builder
 * @returns {Contract}
 */
export declare function newContract(builder: ContractBuilder): Contract;
/**
 * @param {OrderMatchingBuilder} builder
 * @returns {OrderMatching}
 */
export declare function newOrderMatching(builder: OrderMatchingBuilder): OrderMatching;
/**
 * @param {string} amount
 * @returns {boolean}
 */
export declare function isTokenAmountPackable(amount: string): boolean;
/**
 * @param {string} fee
 * @returns {boolean}
 */
export declare function isFeeAmountPackable(fee: string): boolean;
/**
 * @param {string} amount
 * @returns {string}
 */
export declare function closestPackableTransactionAmount(amount: string): string;
/**
 * @param {string} fee
 * @returns {string}
 */
export declare function closestPackableTransactionFee(fee: string): string;
/**
 */
export declare const WaitForTxStatus: Readonly<{
    Success: 0;
    0: "Success";
    Failed: 1;
    1: "Failed";
    Pending: 2;
    2: "Pending";
}>;
/**
 */
export declare const EthAuthType: Readonly<{
    OnChain: 0;
    0: "OnChain";
    EthECDSA: 1;
    1: "EthECDSA";
    EthCREATE2: 2;
    2: "EthCREATE2";
}>;
/**
 */
export declare const L1SignatureType: Readonly<{
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
export declare const ZkLinkTxType: Readonly<{
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
export declare const BlockNumber: Readonly<{
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
export declare const ParameterType: Readonly<{
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
export declare const AccountQueryType: Readonly<{
    AccountId: 0;
    0: "AccountId";
    Address: 1;
    1: "Address";
}>;
/**
 */
export declare class AccountQuery {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {AccountQueryType} query_type
     * @param {string} query_param
     */
    constructor(query_type: AccountQueryType, query_param: string);
}
/**
 */
export declare class AutoDeleveraging {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class AutoDeleveragingBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
    /**
     * @returns {AutoDeleveraging}
     */
    build(): AutoDeleveraging;
}
/**
 */
export declare class ChangePubKey {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class ChangePubKeyBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
    /**
     * @returns {ChangePubKey}
     */
    build(): ChangePubKey;
}
/**
 */
export declare class Contract {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class ContractBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
    /**
     * @returns {Contract}
     */
    build(): Contract;
}
/**
 */
export declare class ContractInfo {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {number} pair_id
     * @param {string} symbol
     * @param {number} initial_margin_rate
     * @param {number} maintenance_margin_rate
     */
    constructor(pair_id: number, symbol: string, initial_margin_rate: number, maintenance_margin_rate: number);
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export declare class ContractMatching {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class ContractMatchingBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
    /**
     * @returns {ContractMatching}
     */
    build(): ContractMatching;
}
/**
 */
export declare class ContractPrice {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {number} pair_id
     * @param {string} market_price
     */
    constructor(pair_id: number, market_price: string);
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export declare class Create2Data {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {string} creator_address
     * @param {string} salt
     * @param {string} code_hash
     */
    constructor(creator_address: string, salt: string, code_hash: string);
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
export declare class EthTxOption {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {boolean} is_support_eip1559
     * @param {string} to
     * @param {number | undefined} [nonce]
     * @param {string | undefined} [value]
     * @param {number | undefined} [gas]
     * @param {string | undefined} [gas_price]
     */
    constructor(is_support_eip1559: boolean, to: string, nonce?: number | undefined, value?: string | undefined, gas?: number | undefined, gas_price?: string | undefined);
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export declare class ForcedExit {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class ForcedExitBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
    /**
     * @returns {ForcedExit}
     */
    build(): ForcedExit;
}
/**
 */
export declare class Funding {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class FundingBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {number} account_id
     * @param {number} sub_account_id
     * @param {number} sub_account_nonce
     * @param {Uint32Array} funding_account_ids
     * @param {string} fee
     * @param {number} fee_token
     */
    constructor(account_id: number, sub_account_id: number, sub_account_nonce: number, funding_account_ids: Uint32Array, fee: string, fee_token: number);
    /**
     * @returns {Funding}
     */
    build(): Funding;
}
/**
 */
export declare class FundingInfo {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {number} pair_id
     * @param {number} funding_rate
     * @param {string} price
     */
    constructor(pair_id: number, funding_rate: number, price: string);
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export declare class JsonRpcSigner {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class Liquidation {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class LiquidationBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
    /**
     * @returns {Liquidation}
     */
    build(): Liquidation;
}
/**
 */
export declare class MarginInfo {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {number} margin_id
     * @param {number} token_id
     * @param {number} ratio
     */
    constructor(margin_id: number, token_id: number, ratio: number);
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export declare class Order {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
export declare class OrderMatching {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export declare class OrderMatchingBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
    /**
     * @returns {OrderMatching}
     */
    build(): OrderMatching;
}
/**
 */
export declare class Parameter {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {ParameterType} parameter_type
     * @param {any} parameter_value
     */
    constructor(parameter_type: ParameterType, parameter_value: any);
}
/**
 */
export declare class RequestArguments {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
}
/**
 */
export declare class RpcClient {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {string} network
     * @param {string | undefined} [custom_url]
     */
    constructor(network: string, custom_url?: string | undefined);
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
    getAccountTransactionHistory(tx_type: ZkLinkTxType, address: string, page_index: bigint, page_size: number): Promise<any>;
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
export declare class SpotPriceInfo {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {number} token_id
     * @param {string} price
     */
    constructor(token_id: number, price: string);
    /**
     * @returns {any}
     */
    jsValue(): any;
}
/**
 */
export declare class Transfer {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class TransferBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
    /**
     * @returns {Transfer}
     */
    build(): Transfer;
}
/**
 */
export declare class TxLayer1Signature {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {L1SignatureType} sign_type
     * @param {string} signature
     */
    constructor(sign_type: L1SignatureType, signature: string);
    /**
     * @returns {L1SignatureType}
     */
    signType(): L1SignatureType;
    /**
     * @returns {string}
     */
    signature(): string;
}
/**
 */
export declare class TxZkLinkSignature {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {string} pub_key
     * @param {string} signature
     */
    constructor(pub_key: string, signature: string);
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
export declare class UpdateGlobalVar {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class UpdateGlobalVarBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {number} from_chain_id
     * @param {number} sub_account_id
     * @param {Parameter} parameter
     * @param {number} serial_id
     */
    constructor(from_chain_id: number, sub_account_id: number, parameter: Parameter, serial_id: number);
    /**
     * @returns {UpdateGlobalVar}
     */
    build(): UpdateGlobalVar;
}
/**
 */
export declare class Wallet {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {string} url
     * @param {string} private_key
     */
    constructor(url: string, private_key: string);
    /**
     * @returns {Promise<string>}
     */
    getBalance(): Promise<string>;
    /**
     * @param {BlockNumber} block_number
     * @param {number | undefined} [block]
     * @returns {Promise<number>}
     */
    getNonce(block_number: BlockNumber, block?: number | undefined): Promise<number>;
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
    waitForTransaction(tx_hash: string, timeout?: number | undefined): Promise<WaitForTxStatus>;
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
export declare class Withdraw {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
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
export declare class WithdrawBuilder {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
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
    /**
     * @returns {Withdraw}
     */
    build(): Withdraw;
}
/**
 */
export declare class ZkLinkSigner {
    __wbg_ptr: number;
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    free(): void;
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
}
/**
 */
export declare class ZkLinkTx {
    __wbg_ptr: number;
    __destroy_into_raw(): number;
    free(): void;
    /**
     * @param {number} tx_type
     * @param {any} tx
     */
    constructor(tx_type: number, tx: any);
}
declare function initSync(module: any): any;
declare function __wbg_init(input: any): Promise<any>;
export { initSync };
export default __wbg_init;
