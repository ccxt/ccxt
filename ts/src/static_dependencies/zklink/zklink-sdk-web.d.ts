/* tslint:disable */
/* eslint-disable */
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
export enum WaitForTxStatus {
  Success = 0,
  Failed = 1,
  Pending = 2,
}
/**
 */
export enum EthAuthType {
  OnChain = 0,
  EthECDSA = 1,
  EthCREATE2 = 2,
}
/**
 */
export enum L1SignatureType {
  Eth = 0,
  Eip1271 = 1,
  Stark = 2,
}
/**
 * A set of L2 transaction type supported by the zklink network.
 */
export enum ZkLinkTxType {
  Deposit = 1,
  FullExit = 5,
  ChangePubKey = 6,
  Transfer = 4,
  Withdraw = 3,
  ForcedExit = 7,
  OrderMatching = 8,
  AutoDeleveraging = 11,
  ContractMatching = 9,
  Funding = 13,
  Liquidation = 10,
  UpdateGlobalVar = 12,
}
/**
 */
export enum BlockNumber {
  Latest = 0,
  Finalized = 1,
  Safe = 2,
  Earliest = 3,
  Pending = 4,
  Number = 5,
}
/**
 */
export enum ParameterType {
  FeeAccount = 0,
  InsuranceFundAccount = 1,
  MarginInfo = 2,
  FundingInfos = 3,
  ContractInfo = 4,
}
/**
 */
export enum AccountQueryType {
  AccountId = 0,
  Address = 1,
}
/**
 */
export class AccountQuery {
  free(): void;
  /**
   * @param {AccountQueryType} query_type
   * @param {string} query_param
   */
  constructor(query_type: AccountQueryType, query_param: string);
}
/**
 */
export class AutoDeleveraging {
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
  constructor(
    account_id: number,
    sub_account_id: number,
    sub_account_nonce: number,
    contract_prices: any[],
    margin_prices: any[],
    adl_account_id: number,
    pair_id: number,
    adl_size: string,
    adl_price: string,
    fee: string,
    fee_token: number
  );
  /**
   * @returns {AutoDeleveraging}
   */
  build(): AutoDeleveraging;
}
/**
 */
export class ChangePubKey {
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
  constructor(
    chain_id: number,
    account_id: number,
    sub_account_id: number,
    new_pubkey_hash: string,
    fee_token: number,
    fee: string,
    nonce: number,
    eth_signature?: string,
    ts?: number
  );
  /**
   * @returns {ChangePubKey}
   */
  build(): ChangePubKey;
}
/**
 */
export class Contract {
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
  constructor(
    account_id: number,
    sub_account_id: number,
    slot_id: number,
    nonce: number,
    pair_id: number,
    size: string,
    price: string,
    direction: boolean,
    maker_fee_rate: number,
    taker_fee_rate: number,
    has_subsidy: boolean
  );
  /**
   * @returns {Contract}
   */
  build(): Contract;
}
/**
 */
export class ContractInfo {
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
export class ContractMatching {
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
  constructor(
    account_id: number,
    sub_account_id: number,
    taker: any,
    maker: any[],
    fee: string,
    fee_token: number,
    contract_prices: any[],
    margin_prices: any[]
  );
  /**
   * @returns {ContractMatching}
   */
  build(): ContractMatching;
}
/**
 */
export class ContractPrice {
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
export class Create2Data {
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
export class EthTxOption {
  free(): void;
  /**
   * @param {boolean} is_support_eip1559
   * @param {string} to
   * @param {number | undefined} [nonce]
   * @param {string | undefined} [value]
   * @param {number | undefined} [gas]
   * @param {string | undefined} [gas_price]
   */
  constructor(
    is_support_eip1559: boolean,
    to: string,
    nonce?: number,
    value?: string,
    gas?: number,
    gas_price?: string
  );
  /**
   * @returns {any}
   */
  jsValue(): any;
}
/**
 */
export class ForcedExit {
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
  constructor(
    to_chain_id: number,
    initiator_account_id: number,
    initiator_sub_account_id: number,
    target_sub_account_id: number,
    target: string,
    l2_source_token: number,
    l1_target_token: number,
    exit_amount: string,
    initiator_nonce: number,
    withdraw_to_l1: boolean,
    ts?: number
  );
  /**
   * @returns {ForcedExit}
   */
  build(): ForcedExit;
}
/**
 */
export class Funding {
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
  free(): void;
  /**
   * @param {number} account_id
   * @param {number} sub_account_id
   * @param {number} sub_account_nonce
   * @param {Uint32Array} funding_account_ids
   * @param {string} fee
   * @param {number} fee_token
   */
  constructor(
    account_id: number,
    sub_account_id: number,
    sub_account_nonce: number,
    funding_account_ids: Uint32Array,
    fee: string,
    fee_token: number
  );
  /**
   * @returns {Funding}
   */
  build(): Funding;
}
/**
 */
export class FundingInfo {
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
export class JsonRpcSigner {
  free(): void;
  /**
   * @param {string | undefined} [signature]
   * @returns {Promise<void>}
   */
  initZklinkSigner(signature?: string): Promise<void>;
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
  constructor(
    account_id: number,
    sub_account_id: number,
    sub_account_nonce: number,
    contract_prices: any[],
    margin_prices: any[],
    liquidation_account_id: number,
    fee: string,
    fee_token: number
  );
  /**
   * @returns {Liquidation}
   */
  build(): Liquidation;
}
/**
 */
export class MarginInfo {
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
export class Order {
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
  constructor(
    account_id: number,
    sub_account_id: number,
    slot_id: number,
    nonce: number,
    base_token_id: number,
    quote_token_id: number,
    amount: string,
    price: string,
    is_sell: boolean,
    maker_fee_rate: number,
    taker_fee_rate: number,
    has_subsidy: boolean
  );
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
  free(): void;
  /**
   * @returns {any}
   */
  jsValue(): any;
}
/**
 */
export class OrderMatchingBuilder {
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
  constructor(
    account_id: number,
    sub_account_id: number,
    taker: any,
    maker: any,
    fee: string,
    fee_token: number,
    contract_prices: any[],
    margin_prices: any[],
    expect_base_amount: string,
    expect_quote_amount: string
  );
  /**
   * @returns {OrderMatching}
   */
  build(): OrderMatching;
}
/**
 */
export class Parameter {
  free(): void;
  /**
   * @param {ParameterType} parameter_type
   * @param {any} parameter_value
   */
  constructor(parameter_type: ParameterType, parameter_value: any);
}
/**
 */
export class RequestArguments {
  free(): void;
}
/**
 */
export class RpcClient {
  free(): void;
  /**
   * @param {string} network
   * @param {string | undefined} [custom_url]
   */
  constructor(network: string, custom_url?: string);
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
  getAccountSnapshot(account_query: AccountQuery, sub_account_id?: number, block_number?: number): Promise<any>;
  /**
   * @param {any} tx
   * @param {TxLayer1Signature | undefined} [l1_signature]
   * @param {TxZkLinkSignature | undefined} [l2_signature]
   * @returns {Promise<any>}
   */
  sendTransaction(tx: any, l1_signature?: TxLayer1Signature, l2_signature?: TxZkLinkSignature): Promise<any>;
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
  getPendingBlock(
    last_tx_timestamp_micro: bigint,
    include_tx: boolean,
    include_update: boolean,
    limit?: number
  ): Promise<any>;
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
  getAccountBalances(account_id: number, sub_account_id?: number): Promise<any>;
  /**
   * @param {number} account_id
   * @param {number | undefined} [sub_account_id]
   * @returns {Promise<any>}
   */
  getAccountOrderSlots(account_id: number, sub_account_id?: number): Promise<any>;
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
  getAccountTransactionHistory(
    tx_type: ZkLinkTxType,
    address: string,
    page_index: bigint,
    page_size: number
  ): Promise<any>;
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
  getWebSocketEvents(topic: string, from_topic_index_included: number, limit?: number): Promise<any>;
}
/**
 */
export class SpotPriceInfo {
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
export class Transfer {
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
  constructor(
    account_id: number,
    to_address: string,
    from_sub_account_id: number,
    to_sub_account_id: number,
    token: number,
    fee: string,
    amount: string,
    nonce: number,
    ts?: number
  );
  /**
   * @returns {Transfer}
   */
  build(): Transfer;
}
/**
 */
export class TxLayer1Signature {
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
export class TxZkLinkSignature {
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
export class UpdateGlobalVar {
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
export class Wallet {
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
  getNonce(block_number: BlockNumber, block?: number): Promise<number>;
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
  waitForTransaction(tx_hash: string, timeout?: number): Promise<WaitForTxStatus>;
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
  depositERC20(
    sub_account_id: number,
    deposit_to: string,
    token_addr: string,
    amount: string,
    mapping: boolean,
    eth_params: EthTxOption,
    is_gateway: boolean
  ): Promise<string>;
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
  fullExit(
    account_id: number,
    sub_account_id: number,
    token_id: number,
    mapping: boolean,
    eth_params: EthTxOption
  ): Promise<string>;
}
/**
 */
export class Withdraw {
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
  constructor(
    account_id: number,
    sub_account_id: number,
    to_chain_id: number,
    to_address: string,
    l2_source_token: number,
    l1_target_token: number,
    amount: string,
    call_data: string | undefined,
    fee: string,
    nonce: number,
    withdraw_to_l1: boolean,
    withdraw_fee_ratio: number,
    ts?: number
  );
  /**
   * @returns {Withdraw}
   */
  build(): Withdraw;
}
/**
 */
export class ZkLinkSigner {
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
export class ZkLinkTx {
  free(): void;
  /**
   * @param {number} tx_type
   * @param {any} tx
   */
  constructor(tx_type: number, tx: any);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_jsonrpcsigner_free: (a: number) => void;
  readonly newRpcSignerWithProvider: (a: number, b: number) => void;
  readonly newRpcSignerWithSigner: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly jsonrpcsigner_initZklinkSigner: (a: number, b: number, c: number) => number;
  readonly jsonrpcsigner_getPubkey: (a: number, b: number) => void;
  readonly jsonrpcsigner_pubkeyHash: (a: number, b: number) => void;
  readonly jsonrpcsigner_address: (a: number, b: number) => void;
  readonly jsonrpcsigner_signatureSeed: (a: number, b: number) => void;
  readonly jsonrpcsigner_signChangePubkeyWithOnchain: (a: number, b: number, c: number) => void;
  readonly jsonrpcsigner_signChangePubkeyWithEthEcdsaAuth: (a: number, b: number) => number;
  readonly jsonrpcsigner_signChangePubkeyWithCreate2DataAuth: (a: number, b: number, c: number, d: number) => void;
  readonly jsonrpcsigner_signTransfer: (a: number, b: number, c: number, d: number) => number;
  readonly jsonrpcsigner_createSignedOrder: (a: number, b: number, c: number) => void;
  readonly jsonrpcsigner_signOrderMatching: (a: number, b: number, c: number) => void;
  readonly jsonrpcsigner_signWithdraw: (a: number, b: number, c: number, d: number) => number;
  readonly jsonrpcsigner_signForcedExit: (a: number, b: number, c: number) => void;
  readonly jsonrpcsigner_signAutoDeleveraging: (a: number, b: number, c: number) => void;
  readonly jsonrpcsigner_createSignedContract: (a: number, b: number, c: number) => void;
  readonly jsonrpcsigner_signContractMatching: (a: number, b: number, c: number) => void;
  readonly jsonrpcsigner_signFunding: (a: number, b: number, c: number) => void;
  readonly jsonrpcsigner_signLiquidation: (a: number, b: number, c: number) => void;
  readonly jsonrpcsigner_signMusig: (a: number, b: number, c: number, d: number) => void;
  readonly jsonrpcsigner_getZkLinkSigner: (a: number) => number;
  readonly __wbg_create2data_free: (a: number) => void;
  readonly __wbg_changepubkey_free: (a: number) => void;
  readonly create2data_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly create2data_salt: (a: number, b: number, c: number, d: number) => void;
  readonly create2data_jsValue: (a: number, b: number) => void;
  readonly changepubkey_jsValue: (a: number, b: number) => void;
  readonly changepubkey_getChangePubkeyMessage: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly changepubkey_getEthSignMsg: (a: number, b: number, c: number, d: number) => void;
  readonly changepubkey_setEthAuthData: (a: number, b: number, c: number, d: number) => void;
  readonly changepubkey_sign: (a: number, b: number, c: number) => void;
  readonly __wbg_changepubkeybuilder_free: (a: number) => void;
  readonly changepubkeybuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number,
    n: number
  ) => void;
  readonly changepubkeybuilder_build: (a: number) => number;
  readonly newChangePubkey: (a: number) => number;
  readonly __wbg_liquidation_free: (a: number) => void;
  readonly liquidation_jsValue: (a: number, b: number) => void;
  readonly liquidation_sign: (a: number, b: number, c: number) => void;
  readonly __wbg_liquidationbuilder_free: (a: number) => void;
  readonly liquidationbuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number
  ) => void;
  readonly liquidationbuilder_build: (a: number) => number;
  readonly newLiquidation: (a: number) => number;
  readonly __wbg_forcedexit_free: (a: number) => void;
  readonly forcedexit_jsValue: (a: number, b: number) => void;
  readonly forcedexit_sign: (a: number, b: number, c: number) => void;
  readonly __wbg_forcedexitbuilder_free: (a: number) => void;
  readonly forcedexitbuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number,
    n: number,
    o: number
  ) => void;
  readonly forcedexitbuilder_build: (a: number) => number;
  readonly newForcedExit: (a: number) => number;
  readonly __wbg_transfer_free: (a: number) => void;
  readonly transfer_jsValue: (a: number, b: number) => void;
  readonly transfer_getEthSignMsg: (a: number, b: number, c: number, d: number) => void;
  readonly transfer_sign: (a: number, b: number, c: number) => void;
  readonly __wbg_transferbuilder_free: (a: number) => void;
  readonly transferbuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number,
    n: number
  ) => void;
  readonly transferbuilder_build: (a: number) => number;
  readonly newTransfer: (a: number) => number;
  readonly __wbg_autodeleveraging_free: (a: number) => void;
  readonly autodeleveraging_jsValue: (a: number, b: number) => void;
  readonly autodeleveraging_sign: (a: number, b: number, c: number) => void;
  readonly __wbg_autodeleveragingbuilder_free: (a: number) => void;
  readonly autodeleveragingbuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number,
    n: number,
    o: number,
    p: number,
    q: number
  ) => void;
  readonly autodeleveragingbuilder_build: (a: number) => number;
  readonly newAutoDeleveraging: (a: number) => number;
  readonly __wbg_updateglobalvar_free: (a: number) => void;
  readonly updateglobalvar_jsValue: (a: number, b: number) => void;
  readonly updateglobalvar_zklinkTx: (a: number, b: number) => void;
  readonly updateglobalvarbuilder_new: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly updateglobalvarbuilder_build: (a: number) => number;
  readonly newUpdateGlobalVar: (a: number) => number;
  readonly __wbg_parameter_free: (a: number) => void;
  readonly parameter_new: (a: number, b: number) => number;
  readonly __wbg_margininfo_free: (a: number) => void;
  readonly margininfo_new: (a: number, b: number, c: number) => number;
  readonly margininfo_jsValue: (a: number, b: number) => void;
  readonly __wbg_contractinfo_free: (a: number) => void;
  readonly contractinfo_new: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly contractinfo_jsValue: (a: number, b: number) => void;
  readonly __wbg_ethtxoption_free: (a: number) => void;
  readonly ethtxoption_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number
  ) => void;
  readonly ethtxoption_jsValue: (a: number, b: number) => void;
  readonly __wbg_wallet_free: (a: number) => void;
  readonly wallet_new: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wallet_getBalance: (a: number) => number;
  readonly wallet_getNonce: (a: number, b: number, c: number, d: number) => number;
  readonly wallet_getDepositFee: (a: number, b: number) => number;
  readonly wallet_waitForTransaction: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly wallet_approveERC20: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly wallet_depositERC20: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number
  ) => number;
  readonly wallet_depositETH: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly wallet_setAuthPubkeyHash: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly wallet_fullExit: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly __wbg_zklinksigner_free: (a: number) => void;
  readonly zklinksigner_ethSig: (a: number, b: number, c: number) => void;
  readonly zklinksigner_starknetSig: (a: number, b: number, c: number) => void;
  readonly __wbg_updateglobalvarbuilder_free: (a: number) => void;
  readonly __wbg_rpcclient_free: (a: number) => void;
  readonly rpcclient_new: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly rpcclient_getSupportTokens: (a: number) => number;
  readonly rpcclient_getAccountSnapshot: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly rpcclient_sendTransaction: (a: number, b: number, c: number, d: number) => number;
  readonly rpcclient_getSupportChains: (a: number) => number;
  readonly rpcclient_getLatestBlockNumber: (a: number) => number;
  readonly rpcclient_getBlockByNumber: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly rpcclient_getPendingBlock: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly rpcclient_getBlockOnChainByNumber: (a: number, b: number) => number;
  readonly rpcclient_getAccount: (a: number, b: number) => number;
  readonly rpcclient_getAccountBalances: (a: number, b: number, c: number) => number;
  readonly rpcclient_getAccountOrderSlots: (a: number, b: number, c: number) => number;
  readonly rpcclient_getTokenReserve: (a: number, b: number, c: number) => number;
  readonly rpcclient_getTransactionByHash: (a: number, b: number, c: number, d: number) => number;
  readonly rpcclient_getAccountTransactionHistory: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) => number;
  readonly rpcclient_getWithdrawTxs: (a: number, b: number, c: number) => number;
  readonly rpcclient_pullForwardTxs: (a: number, b: number, c: number, d: number) => number;
  readonly rpcclient_getWebSocketEvents: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly __wbg_accountquery_free: (a: number) => void;
  readonly __wbg_txzklinksignature_free: (a: number) => void;
  readonly __wbg_zklinktx_free: (a: number) => void;
  readonly txzklinksignature_new: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly accountquery_new: (a: number, b: number, c: number) => number;
  readonly txlayer1signature_new: (a: number, b: number, c: number) => number;
  readonly txlayer1signature_signType: (a: number) => number;
  readonly txlayer1signature_signature: (a: number, b: number) => void;
  readonly txzklinksignature_pubKey: (a: number, b: number) => void;
  readonly txzklinksignature_signature: (a: number, b: number) => void;
  readonly zklinktx_new: (a: number, b: number) => number;
  readonly __wbg_fundinginfo_free: (a: number) => void;
  readonly fundinginfo_new: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly fundinginfo_jsValue: (a: number, b: number) => void;
  readonly __wbg_funding_free: (a: number) => void;
  readonly funding_jsValue: (a: number, b: number) => void;
  readonly funding_sign: (a: number, b: number, c: number) => void;
  readonly __wbg_fundingbuilder_free: (a: number) => void;
  readonly fundingbuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number
  ) => void;
  readonly fundingbuilder_build: (a: number) => number;
  readonly newFunding: (a: number) => number;
  readonly __wbg_contractprice_free: (a: number) => void;
  readonly contractprice_new: (a: number, b: number, c: number, d: number) => void;
  readonly contractprice_jsValue: (a: number, b: number) => void;
  readonly __wbg_spotpriceinfo_free: (a: number) => void;
  readonly spotpriceinfo_new: (a: number, b: number, c: number, d: number) => void;
  readonly spotpriceinfo_jsValue: (a: number, b: number) => void;
  readonly __wbg_withdraw_free: (a: number) => void;
  readonly withdraw_jsValue: (a: number, b: number) => void;
  readonly withdraw_getEthSignMsg: (a: number, b: number, c: number, d: number) => void;
  readonly withdraw_sign: (a: number, b: number, c: number) => void;
  readonly __wbg_withdrawbuilder_free: (a: number) => void;
  readonly withdrawbuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number,
    n: number,
    o: number,
    p: number,
    q: number,
    r: number,
    s: number
  ) => void;
  readonly withdrawbuilder_build: (a: number) => number;
  readonly newWithdraw: (a: number) => number;
  readonly __wbg_txlayer1signature_free: (a: number) => void;
  readonly __wbg_contractmatching_free: (a: number) => void;
  readonly contractmatching_jsValue: (a: number, b: number) => void;
  readonly contractmatching_sign: (a: number, b: number, c: number) => void;
  readonly __wbg_contractmatchingbuilder_free: (a: number) => void;
  readonly contractmatchingbuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number
  ) => void;
  readonly contractmatchingbuilder_build: (a: number) => number;
  readonly newContractMatching: (a: number) => number;
  readonly __wbg_contract_free: (a: number) => void;
  readonly contract_jsValue: (a: number, b: number) => void;
  readonly contract_sign: (a: number, b: number, c: number) => void;
  readonly __wbg_contractbuilder_free: (a: number) => void;
  readonly contractbuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number,
    n: number
  ) => void;
  readonly contractbuilder_build: (a: number) => number;
  readonly newContract: (a: number) => number;
  readonly __wbg_order_free: (a: number) => void;
  readonly __wbg_ordermatching_free: (a: number) => void;
  readonly order_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number,
    n: number,
    o: number
  ) => void;
  readonly order_jsValue: (a: number, b: number) => void;
  readonly order_sign: (a: number, b: number, c: number) => void;
  readonly ordermatching_jsValue: (a: number, b: number) => void;
  readonly __wbg_ordermatchingbuilder_free: (a: number) => void;
  readonly ordermatchingbuilder_new: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number,
    n: number,
    o: number,
    p: number
  ) => void;
  readonly ordermatchingbuilder_build: (a: number) => number;
  readonly newOrderMatching: (a: number) => number;
  readonly isTokenAmountPackable: (a: number, b: number, c: number) => void;
  readonly isFeeAmountPackable: (a: number, b: number, c: number) => void;
  readonly closestPackableTransactionAmount: (a: number, b: number, c: number) => void;
  readonly closestPackableTransactionFee: (a: number, b: number, c: number) => void;
  readonly __wbg_requestarguments_free: (a: number) => void;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: (a: number, b: number) => void;
  readonly __wbindgen_export_4: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_5: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_6: (a: number) => void;
  readonly __wbindgen_export_7: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {SyncInitInput} module
 *
 * @returns {InitOutput}
 */
export function initSync(module: SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
