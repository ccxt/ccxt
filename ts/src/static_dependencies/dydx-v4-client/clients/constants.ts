import { PageRequest } from '@dydxprotocol/v4-proto/src/codegen/cosmos/base/query/v1beta1/pagination';
import { AxiosProxyConfig } from 'axios';
import Long from 'long';

import { BroadcastOptions, DenomConfig } from './types';

export * from '../lib/constants';

/**
 * Disclaimer: Note that as of the date hereof, the testnet and dYdX Chain deployment by DYDX
 * token holders are the only known deployments of the dYdX v4 software, and other deployment
 * options may be added.
 * For more information, please see https://dydx.exchange/dydx-chain-front-end-options
 */

// Chain ID
export const DEV_CHAIN_ID = 'dydxprotocol-testnet';
export const STAGING_CHAIN_ID = 'dydxprotocol-testnet';
export const TESTNET_CHAIN_ID = 'dydx-testnet-4';
export const LOCAL_CHAIN_ID = 'localdydxprotocol';
// For the deployment by DYDX token holders
export const MAINNET_CHAIN_ID = 'dydx-mainnet-1';

// ------------ API URLs ------------
export enum IndexerApiHost {
  TESTNET = 'https://indexer.v4testnet.dydx.exchange/',
  STAGING = 'https://indexer.v4staging.dydx.exchange/',
  LOCAL = 'http://localhost:3002',
  // For the deployment by DYDX token holders
  MAINNET = 'https://indexer.dydx.trade',
}

export enum IndexerWSHost {
  TESTNET = 'wss://indexer.v4testnet.dydx.exchange/v4/ws',
  STAGING = 'wss://indexer.v4staging.dydx.exchange/v4/ws',
  LOCAL = 'ws://localhost:3003',
  // For the deployment by DYDX token holders
  MAINNET = 'wss://indexer.dydx.trade/v4/ws',
}

export enum FaucetApiHost {
  TESTNET = 'https://faucet.v4testnet.dydx.exchange',
}

export enum ValidatorApiHost {
  TESTNET = 'https://test-dydx-rpc.kingnodes.com',
  STAGING = 'https://validator.v4staging.dydx.exchange',
  LOCAL = 'http://localhost:26657',
  // For the deployment by DYDX token holders
  MAINNET = 'https://dydx-ops-rpc.kingnodes.com:443',
}

// ------------ Network IDs ------------

export enum NetworkId {
  TESTNET = 'dydx-testnet-4',
  // For the deployment by DYDX token holders
  MAINNET = 'dydx-mainnet-1',
}
export const NETWORK_ID_TESTNET: string = 'dydxprotocol-testnet';
// For the deployment by DYDX token holders
export const NETWORK_ID_MAINNET: string = 'dydx-mainnet-1';

// ------------ Gas Denoms ------------
export enum SelectedGasDenom {
  NATIVE = 'NATIVE',
  USDC = 'USDC',
}

// ------------ MsgType URLs ------------
// Default CosmosSDK
// x/bank
export const TYPE_URL_MSG_SEND = '/cosmos.bank.v1beta1.MsgSend';

// x/gov
export const TYPE_URL_MSG_SUBMIT_PROPOSAL = '/cosmos.gov.v1.MsgSubmitProposal';

// dYdX Specific
// x/clob
export const TYPE_URL_MSG_PLACE_ORDER = '/dydxprotocol.clob.MsgPlaceOrder';
export const TYPE_URL_MSG_CANCEL_ORDER = '/dydxprotocol.clob.MsgCancelOrder';
export const TYPE_URL_BATCH_CANCEL = '/dydxprotocol.clob.MsgBatchCancel';
export const TYPE_URL_MSG_CREATE_CLOB_PAIR = '/dydxprotocol.clob.MsgCreateClobPair';
export const TYPE_URL_MSG_UPDATE_CLOB_PAIR = '/dydxprotocol.clob.MsgUpdateClobPair';

// x/delaymsg
export const TYPE_URL_MSG_DELAY_MESSAGE = '/dydxprotocol.delaymsg.MsgDelayMessage';

// x/listing
export const TYPE_URL_MSG_CREATE_MARKET_PERMISSIONLESS =
  '/dydxprotocol.listing.MsgCreateMarketPermissionless';

// x/perpetuals
export const TYPE_URL_MSG_CREATE_PERPETUAL = '/dydxprotocol.perpetuals.MsgCreatePerpetual';

// x/prices
export const TYPE_URL_MSG_CREATE_ORACLE_MARKET = '/dydxprotocol.prices.MsgCreateOracleMarket';

// x/sending
export const TYPE_URL_MSG_CREATE_TRANSFER = '/dydxprotocol.sending.MsgCreateTransfer';
export const TYPE_URL_MSG_WITHDRAW_FROM_SUBACCOUNT =
  '/dydxprotocol.sending.MsgWithdrawFromSubaccount';
export const TYPE_URL_MSG_DEPOSIT_TO_SUBACCOUNT = '/dydxprotocol.sending.MsgDepositToSubaccount';

// x/affiliates
export const TYPE_URL_MSG_REGISTER_AFFILIATE = '/dydxprotocol.affiliates.MsgRegisterAffiliate';

// x/vault
export const TYPE_URL_MSG_DEPOSIT_TO_MEGAVAULT = '/dydxprotocol.vault.MsgDepositToMegavault';
export const TYPE_URL_MSG_WITHDRAW_FROM_MEGAVAULT = '/dydxprotocol.vault.MsgWithdrawFromMegavault';

// x/staking
export const TYPE_URL_MSG_DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate';
export const TYPE_URL_MSG_UNDELEGATE = '/cosmos.staking.v1beta1.MsgUndelegate';

// x/distribution
export const TYPE_URL_MSG_WITHDRAW_DELEGATOR_REWARD =
  '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward';

// x/accountplus
export const TYPE_URL_MSG_ADD_AUTHENTICATOR = '/dydxprotocol.accountplus.MsgAddAuthenticator';
export const TYPE_URL_MSG_REMOVE_AUTHENTICATOR = '/dydxprotocol.accountplus.MsgRemoveAuthenticator';

// ------------ Chain Constants ------------
// The following are same across different networks / deployments.
export const GOV_MODULE_ADDRESS = 'dydx10d07y265gmmuvt4z0w9aw880jnsr700jnmapky';
export const DELAYMSG_MODULE_ADDRESS = 'dydx1mkkvp26dngu6n8rmalaxyp3gwkjuzztq5zx6tr';
export const MEGAVAULT_MODULE_ADDRESS = 'dydx18tkxrnrkqc2t0lr3zxr5g6a4hdvqksylxqje4r';

// ------------ Market Statistic Day Types ------------
export enum MarketStatisticDay {
  ONE = '1',
  SEVEN = '7',
  THIRTY = '30',
}

// ------------ Order Types ------------
// This should match OrderType in Abacus
export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LIMIT = 'STOP_LIMIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT',
  STOP_MARKET = 'STOP_MARKET',
  TAKE_PROFIT_MARKET = 'TAKE_PROFIT_MARKET',
}

// ------------ Order Side ------------
// This should match OrderSide in Abacus
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

// ------------ Order TimeInForce ------------
// This should match OrderTimeInForce in Abacus
export enum OrderTimeInForce {
  GTT = 'GTT',
  IOC = 'IOC',
  FOK = 'FOK',
}

// ------------ Order Execution ------------
// This should match OrderExecution in Abacus
export enum OrderExecution {
  DEFAULT = 'DEFAULT',
  IOC = 'IOC',
  FOK = 'FOK',
  POST_ONLY = 'POST_ONLY',
}

// ------------ Order Status ------------
// This should match OrderStatus in Abacus
export enum OrderStatus {
  BEST_EFFORT_OPENED = 'BEST_EFFORT_OPENED',
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  BEST_EFFORT_CANCELED = 'BEST_EFFORT_CANCELED',
  CANCELED = 'CANCELED',
}

export enum TickerType {
  PERPETUAL = 'PERPETUAL', // Only PERPETUAL is supported right now
}

export enum PositionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LIQUIDATED = 'LIQUIDATED',
}

// ----------- Time Period for Sparklines -------------

export enum TimePeriod {
  ONE_DAY = 'ONE_DAY',
  SEVEN_DAYS = 'SEVEN_DAYS',
}

export enum PnlTickInterval {
  HOUR = 'hour',
  day = 'day',
}

// ----------- Authenticators -------------

export enum AuthenticatorType {
  ALL_OF = 'AllOf',
  ANY_OF = 'AnyOf',
  SIGNATURE_VERIFICATION = 'SignatureVerification',
  MESSAGE_FILTER = 'MessageFilter',
  CLOB_PAIR_ID_FILTER = 'ClobPairIdFilter',
  SUBACCOUNT_FILTER = 'SubaccountFilter',
}

export interface Authenticator {
  type: AuthenticatorType;
  config: string | Authenticator[];
}

export enum TradingRewardAggregationPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

// ------------ API Defaults ------------
export const DEFAULT_API_TIMEOUT: number = 3_000;

export const MAX_MEMO_CHARACTERS: number = 256;

export const SHORT_BLOCK_WINDOW: number = 20;

export const SHORT_BLOCK_FORWARD: number = 3;

// Querying
export const PAGE_REQUEST: PageRequest = {
  key: new Uint8Array(),
  offset: Long.UZERO,
  limit: Long.MAX_UNSIGNED_VALUE,
  countTotal: true,
  reverse: false,
};

export class IndexerConfig {
  public restEndpoint: string;
  public websocketEndpoint: string;
  public proxy?: AxiosProxyConfig;

  constructor(restEndpoint: string, websocketEndpoint: string, proxy?: AxiosProxyConfig) {
    this.restEndpoint = restEndpoint;
    this.websocketEndpoint = websocketEndpoint;
    this.proxy = proxy;
  }
}

export class ValidatorConfig {
  public restEndpoint: string;
  public chainId: string;
  public denoms: DenomConfig;
  public broadcastOptions?: BroadcastOptions;
  public defaultClientMemo?: string;
  public useTimestampNonce?: boolean;
  public timestampNonceOffsetMs?: number;

  constructor(
    restEndpoint: string,
    chainId: string,
    denoms: DenomConfig,
    broadcastOptions?: BroadcastOptions,
    defaultClientMemo?: string,
    useTimestampNonce?: boolean,
    timestampNonceOffsetMs?: number,
  ) {
    this.restEndpoint = restEndpoint?.endsWith('/') ? restEndpoint.slice(0, -1) : restEndpoint;
    this.chainId = chainId;

    this.denoms = denoms;
    this.broadcastOptions = broadcastOptions;
    this.defaultClientMemo = defaultClientMemo;
    this.useTimestampNonce = useTimestampNonce;
    this.timestampNonceOffsetMs = timestampNonceOffsetMs;
  }
}

export class Network {
  constructor(
    public env: string,
    public indexerConfig: IndexerConfig,
    public validatorConfig: ValidatorConfig,
  ) {}

  static testnet(): Network {
    const indexerConfig = new IndexerConfig(IndexerApiHost.TESTNET, IndexerWSHost.TESTNET);
    const validatorConfig = new ValidatorConfig(
      ValidatorApiHost.TESTNET,
      TESTNET_CHAIN_ID,
      {
        CHAINTOKEN_DENOM: 'adv4tnt',
        USDC_DENOM: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
        USDC_GAS_DENOM: 'uusdc',
        USDC_DECIMALS: 6,
        CHAINTOKEN_DECIMALS: 18,
      },
      undefined,
      'Client Example',
    );
    return new Network('testnet', indexerConfig, validatorConfig);
  }

  static staging(): Network {
    const indexerConfig = new IndexerConfig(IndexerApiHost.STAGING, IndexerWSHost.STAGING);
    const validatorConfig = new ValidatorConfig(
      ValidatorApiHost.STAGING,
      STAGING_CHAIN_ID,
      {
        CHAINTOKEN_DENOM: 'adv4tnt',
        USDC_DENOM: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
        USDC_GAS_DENOM: 'uusdc',
        USDC_DECIMALS: 6,
        CHAINTOKEN_DECIMALS: 18,
      },
      undefined,
      'Client Example',
    );
    return new Network('staging', indexerConfig, validatorConfig);
  }

  static local(): Network {
    const indexerConfig = new IndexerConfig(IndexerApiHost.LOCAL, IndexerWSHost.LOCAL);
    const validatorConfig = new ValidatorConfig(
      ValidatorApiHost.LOCAL,
      LOCAL_CHAIN_ID,
      {
        CHAINTOKEN_DENOM: 'adv4tnt',
        USDC_DENOM: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
        USDC_GAS_DENOM: 'uusdc',
        USDC_DECIMALS: 6,
        CHAINTOKEN_DECIMALS: 18,
      },
      undefined,
      'Client Example',
    );
    return new Network('local', indexerConfig, validatorConfig);
  }

  // For the deployment by DYDX token holders.
  static mainnet(): Network {
    const indexerConfig = new IndexerConfig(IndexerApiHost.MAINNET, IndexerWSHost.MAINNET);
    const validatorConfig = new ValidatorConfig(
      ValidatorApiHost.MAINNET,
      MAINNET_CHAIN_ID,
      {
        CHAINTOKEN_DENOM: 'adydx',
        USDC_DENOM: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
        USDC_GAS_DENOM: 'uusdc',
        USDC_DECIMALS: 6,
        CHAINTOKEN_DECIMALS: 18,
      },
      undefined,
      'Client Example',
    );
    return new Network('mainnet', indexerConfig, validatorConfig);
  }

  getString(): string {
    return this.env;
  }
}
