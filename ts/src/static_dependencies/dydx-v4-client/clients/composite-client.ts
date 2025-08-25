import { TextDecoder } from 'util';

import { EncodeObject } from '@cosmjs/proto-signing';
import { Account, GasPrice, IndexedTx, StdFee } from '@cosmjs/stargate';
import { Method } from '@cosmjs/tendermint-rpc';
import {
  BroadcastTxAsyncResponse,
  BroadcastTxSyncResponse,
} from '@cosmjs/tendermint-rpc/build/tendermint37';
import { GetAuthenticatorsResponse } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/accountplus/query';
import {
  Order_ConditionType,
  Order_TimeInForce,
} from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/order';
import { parseUnits } from 'ethers';
import Long from 'long';
import protobuf from 'protobufjs';

import { bigIntToBytes } from '../lib/helpers';
import { isStatefulOrder, verifyOrderFlags } from '../lib/validation';
import { GovAddNewMarketParams, OrderFlags } from '../types';
import {
  Authenticator,
  AuthenticatorType,
  Network,
  OrderExecution,
  OrderSide,
  OrderTimeInForce,
  OrderType,
  SHORT_BLOCK_FORWARD,
  SHORT_BLOCK_WINDOW,
  SelectedGasDenom,
} from './constants';
import {
  calculateQuantums,
  calculateSubticks,
  calculateSide,
  calculateTimeInForce,
  calculateOrderFlags,
  calculateClientMetadata,
  calculateConditionType,
  calculateConditionalOrderTriggerSubticks,
  calculateVaultQuantums,
} from './helpers/chain-helpers';
import { IndexerClient } from './indexer-client';
import { UserError } from './lib/errors';
import { generateRegistry } from './lib/registry';
import LocalWallet from './modules/local-wallet';
import { SubaccountInfo } from './subaccount';
import { BroadcastMode, OrderBatch } from './types';
import { ValidatorClient } from './validator-client';

// Required for encoding and decoding queries that are of type Long.
// Must be done once but since the individal modules should be usable
// - must be set in each module that encounters encoding/decoding Longs.
// Reference: https://github.com/protobufjs/protobuf.js/issues/921
protobuf.util.Long = Long;
protobuf.configure();

export interface MarketInfo {
  clobPairId: number;
  atomicResolution: number;
  stepBaseQuantums: number;
  quantumConversionExponent: number;
  subticksPerTick: number;
}

export interface OrderBatchWithMarketId {
  marketId: string;
  clobPairId?: number;
  clientIds: number[];
}

export interface PermissionedKeysAccountAuth {
  authenticators: Long[];
  accountForOrder: SubaccountInfo;
}

export type PlaceOrderPayload = {
  subaccountNumber: number;
  marketId: string;
  type: OrderType;
  side: OrderSide;
  price: number;
  size: number;
  clientId: number;
  timeInForce?: OrderTimeInForce;
  goodTilTimeInSeconds?: number;
  execution?: OrderExecution;
  postOnly?: boolean;
  reduceOnly?: boolean;
  triggerPrice?: number;
  marketInfo?: MarketInfo;
  currentHeight?: number;
  goodTilBlock?: number;
};

export type CancelRawOrderPayload = {
  subaccountNumber: number;
  clientId: number;
  orderFlags: OrderFlags;
  clobPairId: number;
  goodTilBlock?: number;
  goodTilBlockTime?: number;
};

export type TransferToSubaccountPayload = {
  sourceSubaccountNumber: number;
  recipientSubaccountNumber: number;
  transferAmount: string;
};

export class CompositeClient {
  public readonly network: Network;
  public gasDenom: SelectedGasDenom = SelectedGasDenom.USDC;
  private _indexerClient: IndexerClient;
  private _validatorClient?: ValidatorClient;

  static async connect(network: Network): Promise<CompositeClient> {
    const client = new CompositeClient(network);
    await client.initialize();
    return client;
  }

  private constructor(network: Network, apiTimeout?: number) {
    this.network = network;
    this._indexerClient = new IndexerClient(network.indexerConfig, apiTimeout);
  }

  private async initialize(): Promise<void> {
    this._validatorClient = await ValidatorClient.connect(this.network.validatorConfig);
  }

  get indexerClient(): IndexerClient {
    /**
     * Get the validator client
     */
    return this._indexerClient!;
  }

  get validatorClient(): ValidatorClient {
    /**
     * Get the validator client
     */
    return this._validatorClient!;
  }

  get selectedGasDenom(): SelectedGasDenom | undefined {
    if (!this._validatorClient) return undefined;
    return this._validatorClient.selectedGasDenom;
  }

  setSelectedGasDenom(gasDenom: SelectedGasDenom): void {
    if (!this._validatorClient) throw new Error('Validator client not initialized');
    this._validatorClient.setSelectedGasDenom(gasDenom);
  }

  async populateAccountNumberCache(address: string): Promise<void> {
    if (!this._validatorClient) throw new Error('Validator client not initialized');
    await this._validatorClient.populateAccountNumberCache(address);
  }

  /**
   * @description Sign a list of messages with a wallet.
   * the calling function is responsible for creating the messages.
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The Signature.
   */
  async sign(
    wallet: LocalWallet,
    messaging: () => Promise<EncodeObject[]>,
    zeroFee: boolean,
    gasPrice?: GasPrice,
    memo?: string,
    account?: () => Promise<Account>,
  ): Promise<Uint8Array> {
    return this.validatorClient.post.sign(wallet, messaging, zeroFee, gasPrice, memo, account);
  }

  /**
   * @description Send a list of messages with a wallet.
   * the calling function is responsible for creating the messages.
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The Transaction Hash.
   */
  async send(
    wallet: LocalWallet,
    messaging: () => Promise<EncodeObject[]>,
    zeroFee: boolean,
    gasPrice?: GasPrice,
    memo?: string,
    broadcastMode?: BroadcastMode,
    account?: () => Promise<Account>,
    authenticators?: Long[],
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.validatorClient.post.send(
      wallet,
      messaging,
      zeroFee,
      gasPrice,
      memo,
      broadcastMode,
      account,
      undefined,
      authenticators,
    );
  }

  /**
   * @description Send a signed transaction.
   *
   * @param signedTransaction The signed transaction to send.
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The Transaction Hash.
   */
  async sendSignedTransaction(
    signedTransaction: Uint8Array,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.validatorClient.post.sendSignedTransaction(signedTransaction);
  }

  /**
   * @description Simulate a list of messages with a wallet.
   * the calling function is responsible for creating the messages.
   *
   * To send multiple messages with gas estimate:
   * 1. Client is responsible for creating the messages.
   * 2. Call simulate() to get the gas estimate.
   * 3. Call send() to send the messages.
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The gas estimate.
   */
  async simulate(
    wallet: LocalWallet,
    messaging: () => Promise<EncodeObject[]>,
    gasPrice?: GasPrice,
    memo?: string,
    account?: () => Promise<Account>,
  ): Promise<StdFee> {
    return this.validatorClient.post.simulate(wallet, messaging, gasPrice, memo, account);
  }

  /**
   * @description Calculate the goodTilBlock value for a SHORT_TERM order
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The goodTilBlock value
   */

  private async calculateGoodTilBlock(
    orderFlags: OrderFlags,
    currentHeight?: number,
    goodTilBlock?: number,
  ): Promise<number> {
    if (orderFlags === OrderFlags.SHORT_TERM) {
      if (goodTilBlock !== undefined && goodTilBlock !== 0 && goodTilBlock !== null) {
        return Promise.resolve(goodTilBlock);
      } else {
        const height = currentHeight ?? (await this.validatorClient.get.latestBlockHeight());
        return height + SHORT_BLOCK_FORWARD;
      }
    } else {
      return Promise.resolve(0);
    }
  }

  /**
   * @description Validate the goodTilBlock value for a SHORT_TERM order
   *
   * @param goodTilBlock Number of blocks from the current block height the order will
   * be valid for.
   *
   * @throws UserError if the goodTilBlock value is not valid given latest block height and
   * SHORT_BLOCK_WINDOW.
   */
  private async validateGoodTilBlock(goodTilBlock: number): Promise<void> {
    const height = await this.validatorClient.get.latestBlockHeight();
    const nextValidBlockHeight = height + 1;
    const lowerBound = nextValidBlockHeight;
    const upperBound = nextValidBlockHeight + SHORT_BLOCK_WINDOW;
    if (goodTilBlock < lowerBound || goodTilBlock > upperBound) {
      throw new UserError(`Invalid Short-Term order GoodTilBlock.
        Should be greater-than-or-equal-to ${lowerBound} and less-than-or-equal-to ${upperBound}.
        Provided good til block: ${goodTilBlock}`);
    }
  }

  /**
   * @description Calculate the goodTilBlockTime value for a LONG_TERM order
   * the calling function is responsible for creating the messages.
   *
   * @param goodTilTimeInSeconds The goodTilTimeInSeconds of the order to place.
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The goodTilBlockTime value
   */
  private calculateGoodTilBlockTime(goodTilTimeInSeconds: number): number {
    const now = new Date();
    const millisecondsPerSecond = 1000;
    const interval = goodTilTimeInSeconds * millisecondsPerSecond;
    const future = new Date(now.valueOf() + interval);
    return Math.round(future.getTime() / 1000);
  }

  /**
   * @description Place a short term order with human readable input.
   *
   * Use human readable form of input, including price and size
   * The quantum and subticks are calculated and submitted
   *
   * @param subaccount The subaccount to place the order under
   * @param marketId The market to place the order on
   * @param side The side of the order to place
   * @param price The price of the order to place
   * @param size The size of the order to place
   * @param clientId The client id of the order to place
   * @param timeInForce The time in force of the order to place
   * @param goodTilBlock The goodTilBlock of the order to place
   * @param reduceOnly The reduceOnly of the order to place
   *
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The transaction hash.
   */
  async placeShortTermOrder(
    subaccount: SubaccountInfo,
    marketId: string,
    side: OrderSide,
    price: number,
    size: number,
    clientId: number,
    goodTilBlock: number,
    timeInForce: Order_TimeInForce,
    reduceOnly: boolean,
    memo?: string,
    permissionedKeysAccountAuth?: PermissionedKeysAccountAuth,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    // For permissioned orders, use the permissioning account details instead of the subaccount
    // This allows placing orders on behalf of another account when using permissioned keys
    const accountForOrder = permissionedKeysAccountAuth
      ? permissionedKeysAccountAuth.accountForOrder
      : subaccount;
    const msgs: Promise<EncodeObject[]> = new Promise((resolve, reject) => {
      const msg = this.placeShortTermOrderMessage(
        accountForOrder,
        marketId,
        side,
        price,
        size,
        clientId,
        goodTilBlock,
        timeInForce,
        reduceOnly,
      );
      msg
        .then((it) => {
          resolve([it]);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
    const account: Promise<Account> = this.validatorClient.post.account(
      accountForOrder.address,
      undefined,
    );
    return this.send(
      subaccount.wallet,
      () => msgs,
      true,
      undefined,
      memo,
      undefined,
      () => account,
      permissionedKeysAccountAuth?.authenticators,
    );
  }

  /**
   * @description Place an order with human readable input.
   *
   * Only MARKET and LIMIT types are supported right now
   * Use human readable form of input, including price and size
   * The quantum and subticks are calculated and submitted
   *
   * @param subaccount The subaccount to place the order on.
   * @param marketId The market to place the order on.
   * @param type The type of order to place.
   * @param side The side of the order to place.
   * @param price The price of the order to place.
   * @param size The size of the order to place.
   * @param clientId The client id of the order to place.
   * @param timeInForce The time in force of the order to place.
   * @param goodTilTimeInSeconds The goodTilTimeInSeconds of the order to place.
   * @param execution The execution of the order to place.
   * @param postOnly The postOnly of the order to place.
   * @param reduceOnly The reduceOnly of the order to place.
   * @param triggerPrice The trigger price of conditional orders.
   * @param marketInfo optional market information for calculating quantums and subticks.
   *        This can be constructed from Indexer API. If set to null, additional round
   *        trip to Indexer API will be made.
   * @param currentHeight Current block height. This can be obtained from ValidatorClient.
   *        If set to null, additional round trip to ValidatorClient will be made.
   *
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The transaction hash.
   */
  async placeOrder(
    subaccount: SubaccountInfo,
    marketId: string,
    type: OrderType,
    side: OrderSide,
    price: number,
    size: number,
    clientId: number,
    timeInForce?: OrderTimeInForce,
    goodTilTimeInSeconds?: number,
    execution?: OrderExecution,
    postOnly?: boolean,
    reduceOnly?: boolean,
    triggerPrice?: number,
    marketInfo?: MarketInfo,
    currentHeight?: number,
    goodTilBlock?: number,
    memo?: string,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msgs: Promise<EncodeObject[]> = new Promise((resolve) => {
      const msg = this.placeOrderMessage(
        subaccount,
        marketId,
        type,
        side,
        price,
        size,
        clientId,
        timeInForce,
        goodTilTimeInSeconds,
        execution,
        postOnly,
        reduceOnly,
        triggerPrice,
        marketInfo,
        currentHeight,
        goodTilBlock,
      );
      msg
        .then((it) => resolve([it]))
        .catch((err) => {
          throw err;
        });
    });
    const orderFlags = calculateOrderFlags(type, timeInForce);
    const account: Promise<Account> = this.validatorClient.post.account(
      subaccount.address,
      orderFlags,
    );
    return this.send(
      subaccount.wallet,
      () => msgs,
      true,
      undefined,
      memo,
      undefined,
      () => account,
    );
  }

  /**
   * @description Calculate and create the place order message
   *
   * Only MARKET and LIMIT types are supported right now
   * Use human readable form of input, including price and size
   * The quantum and subticks are calculated and submitted
   *
   * @param subaccount The subaccount to place the order under
   * @param marketId The market to place the order on
   * @param type The type of order to place
   * @param side The side of the order to place
   * @param price The price of the order to place
   * @param size The size of the order to place
   * @param clientId The client id of the order to place
   * @param timeInForce The time in force of the order to place
   * @param goodTilTimeInSeconds The goodTilTimeInSeconds of the order to place
   * @param execution The execution of the order to place
   * @param postOnly The postOnly of the order to place
   * @param reduceOnly The reduceOnly of the order to place
   *
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The message to be passed into the protocol
   */
  private async placeOrderMessage(
    subaccount: SubaccountInfo,
    marketId: string,
    type: OrderType,
    side: OrderSide,
    price: number,
    size: number,
    clientId: number,
    timeInForce?: OrderTimeInForce,
    goodTilTimeInSeconds?: number,
    execution?: OrderExecution,
    postOnly?: boolean,
    reduceOnly?: boolean,
    triggerPrice?: number,
    marketInfo?: MarketInfo,
    currentHeight?: number,
    goodTilBlock?: number,
  ): Promise<EncodeObject> {
    const orderFlags = calculateOrderFlags(type, timeInForce);

    const result = await Promise.all([
      this.calculateGoodTilBlock(orderFlags, currentHeight, goodTilBlock),
      this.retrieveMarketInfo(marketId, marketInfo),
    ]);
    const desiredGoodTilBlock = result[0];
    const clobPairId = result[1].clobPairId;
    const atomicResolution = result[1].atomicResolution;
    const stepBaseQuantums = result[1].stepBaseQuantums;
    const quantumConversionExponent = result[1].quantumConversionExponent;
    const subticksPerTick = result[1].subticksPerTick;
    const orderSide = calculateSide(side);
    const quantums = calculateQuantums(size, atomicResolution, stepBaseQuantums);
    const subticks = calculateSubticks(
      price,
      atomicResolution,
      quantumConversionExponent,
      subticksPerTick,
    );
    const orderTimeInForce = calculateTimeInForce(type, timeInForce, execution, postOnly);
    let goodTilBlockTime = 0;
    if (orderFlags === OrderFlags.LONG_TERM || orderFlags === OrderFlags.CONDITIONAL) {
      if (goodTilTimeInSeconds == null) {
        throw new Error('goodTilTimeInSeconds must be set for LONG_TERM or CONDITIONAL order');
      } else {
        goodTilBlockTime = this.calculateGoodTilBlockTime(goodTilTimeInSeconds);
      }
    }
    const clientMetadata = calculateClientMetadata(type);
    const conditionalType = calculateConditionType(type);
    const conditionalOrderTriggerSubticks = calculateConditionalOrderTriggerSubticks(
      type,
      atomicResolution,
      quantumConversionExponent,
      subticksPerTick,
      triggerPrice,
    );
    return this.validatorClient.post.composer.composeMsgPlaceOrder(
      subaccount.address,
      subaccount.subaccountNumber,
      clientId,
      clobPairId,
      orderFlags,
      desiredGoodTilBlock,
      goodTilBlockTime,
      orderSide,
      quantums,
      subticks,
      orderTimeInForce,
      reduceOnly ?? false,
      clientMetadata,
      conditionalType,
      conditionalOrderTriggerSubticks,
    );
  }

  private async retrieveMarketInfo(marketId: string, marketInfo?: MarketInfo): Promise<MarketInfo> {
    if (marketInfo) {
      return Promise.resolve(marketInfo);
    } else {
      const marketsResponse = await this.indexerClient.markets.getPerpetualMarkets(marketId);
      const market = marketsResponse.markets[marketId];
      const clobPairId = market.clobPairId;
      const atomicResolution = market.atomicResolution;
      const stepBaseQuantums = market.stepBaseQuantums;
      const quantumConversionExponent = market.quantumConversionExponent;
      const subticksPerTick = market.subticksPerTick;
      return {
        clobPairId,
        atomicResolution,
        stepBaseQuantums,
        quantumConversionExponent,
        subticksPerTick,
      };
    }
  }

  /**
   * @description Calculate and create the short term place order message
   *
   * Use human readable form of input, including price and size
   * The quantum and subticks are calculated and submitted
   *
   * @param subaccount The subaccount to place the order under
   * @param marketId The market to place the order on
   * @param side The side of the order to place
   * @param price The price of the order to place
   * @param size The size of the order to place
   * @param clientId The client id of the order to place
   * @param timeInForce The time in force of the order to place
   * @param goodTilBlock The goodTilBlock of the order to place
   * @param reduceOnly The reduceOnly of the order to place
   *
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The message to be passed into the protocol
   */
  private async placeShortTermOrderMessage(
    subaccount: SubaccountInfo,
    marketId: string,
    side: OrderSide,
    price: number,
    size: number,
    clientId: number,
    goodTilBlock: number,
    timeInForce: Order_TimeInForce,
    reduceOnly: boolean,
  ): Promise<EncodeObject> {
    await this.validateGoodTilBlock(goodTilBlock);

    const marketsResponse = await this.indexerClient.markets.getPerpetualMarkets(marketId);
    const market = marketsResponse.markets[marketId];
    const clobPairId = market.clobPairId;
    const atomicResolution = market.atomicResolution;
    const stepBaseQuantums = market.stepBaseQuantums;
    const quantumConversionExponent = market.quantumConversionExponent;
    const subticksPerTick = market.subticksPerTick;
    const orderSide = calculateSide(side);
    const quantums = calculateQuantums(size, atomicResolution, stepBaseQuantums);
    const subticks = calculateSubticks(
      price,
      atomicResolution,
      quantumConversionExponent,
      subticksPerTick,
    );
    const orderFlags = OrderFlags.SHORT_TERM;
    return this.validatorClient.post.composer.composeMsgPlaceOrder(
      subaccount.address,
      subaccount.subaccountNumber,
      clientId,
      clobPairId,
      orderFlags,
      goodTilBlock,
      0, // Short term orders use goodTilBlock.
      orderSide,
      quantums,
      subticks,
      timeInForce,
      reduceOnly,
      0, // Client metadata is 0 for short term orders.
      Order_ConditionType.CONDITION_TYPE_UNSPECIFIED, // Short term orders cannot be conditional.
      Long.fromInt(0), // Short term orders cannot be conditional.
    );
  }

  /**
   * @description Cancel an order with order information from web socket or REST.
   *
   * @param subaccount The subaccount to cancel the order from
   * @param clientId The client id of the order to cancel
   * @param orderFlags The order flags of the order to cancel
   * @param clobPairId The clob pair id of the order to cancel
   * @param goodTilBlock The goodTilBlock of the order to cancel
   * @param goodTilBlockTime The goodTilBlockTime of the order to cancel
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The transaction hash.
   */
  async cancelRawOrder(
    subaccount: SubaccountInfo,
    clientId: number,
    orderFlags: OrderFlags,
    clobPairId: number,
    goodTilBlock?: number,
    goodTilBlockTime?: number,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.validatorClient.post.cancelOrder(
      subaccount,
      clientId,
      orderFlags,
      clobPairId,
      goodTilBlock,
      goodTilBlockTime,
    );
  }

  /**
   * @description Cancel an order with human readable input.
   *
   * @param subaccount The subaccount to cancel the order from
   * @param clientId The client id of the order to cancel
   * @param orderFlags The order flags of the order to cancel
   * @param marketId The market to cancel the order on
   * @param goodTilBlock The goodTilBlock of the order to cancel
   * @param goodTilBlockTime The goodTilBlockTime of the order to cancel
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The transaction hash.
   */
  async cancelOrder(
    subaccount: SubaccountInfo,
    clientId: number,
    orderFlags: OrderFlags,
    marketId: string,
    goodTilBlock?: number,
    goodTilTimeInSeconds?: number,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const marketsResponse = await this.indexerClient.markets.getPerpetualMarkets(marketId);
    const market = marketsResponse.markets[marketId];
    const clobPairId = market.clobPairId;

    if (!verifyOrderFlags(orderFlags)) {
      throw new Error(`Invalid order flags: ${orderFlags}`);
    }

    let goodTilBlockTime;
    if (isStatefulOrder(orderFlags)) {
      if (goodTilTimeInSeconds === undefined || goodTilTimeInSeconds === 0) {
        throw new Error('goodTilTimeInSeconds must be set for LONG_TERM or CONDITIONAL order');
      }
      if (goodTilBlock !== 0) {
        throw new Error(
          'goodTilBlock should be zero since LONG_TERM or CONDITIONAL orders ' +
            'use goodTilTimeInSeconds instead of goodTilBlock.',
        );
      }
      goodTilBlockTime = this.calculateGoodTilBlockTime(goodTilTimeInSeconds);
    } else {
      if (goodTilBlock === undefined || goodTilBlock === 0) {
        throw new Error('goodTilBlock must be non-zero for SHORT_TERM orders');
      }
      if (goodTilTimeInSeconds !== undefined && goodTilTimeInSeconds !== 0) {
        throw new Error(
          'goodTilTimeInSeconds should be zero since SHORT_TERM orders use goodTilBlock instead of goodTilTimeInSeconds.',
        );
      }
    }

    return this.validatorClient.post.cancelOrder(
      subaccount,
      clientId,
      orderFlags,
      clobPairId,
      goodTilBlock,
      goodTilBlockTime,
    );
  }

  /**
   * @description Batch cancel short term orders using marketId to clobPairId translation.
   *
   * @param subaccount The subaccount to cancel the order from
   * @param shortTermOrders The list of short term order batches to cancel with marketId
   * @param goodTilBlock The goodTilBlock of the order to cancel
   * @returns The transaction hash.
   */
  async batchCancelShortTermOrdersWithMarketId(
    subaccount: SubaccountInfo,
    shortTermOrders: OrderBatchWithMarketId[],
    goodTilBlock: number,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const orderBatches = await Promise.all(
      shortTermOrders.map(async ({ marketId, clobPairId, clientIds }) => ({
        clobPairId: (
          clobPairId ??
          (await this.indexerClient.markets.getPerpetualMarkets(marketId)).markets[marketId]
        ).clobPairId,
        clientIds,
      })),
    );

    return this.validatorClient.post.batchCancelShortTermOrders(
      subaccount,
      orderBatches,
      goodTilBlock,
      broadcastMode,
    );
  }

  /**
   * @description Batch cancel short term orders using clobPairId.
   *
   * @param subaccount The subaccount to cancel the order from
   * @param shortTermOrders The list of short term order batches to cancel with clobPairId
   * @param goodTilBlock The goodTilBlock of the order to cancel
   * @returns The transaction hash.
   */
  async batchCancelShortTermOrdersWithClobPairId(
    subaccount: SubaccountInfo,
    shortTermOrders: OrderBatch[],
    goodTilBlock: number,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.validatorClient.post.batchCancelShortTermOrders(
      subaccount,
      shortTermOrders,
      goodTilBlock,
      broadcastMode,
    );
  }

  /**
   * @description Transfer from a subaccount to another subaccount
   *
   * @param subaccount The subaccount to transfer from
   * @param recipientAddress The recipient address
   * @param recipientSubaccountNumber The recipient subaccount number
   * @param amount The amount to transfer
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The transaction hash.
   */
  async transferToSubaccount(
    subaccount: SubaccountInfo,
    recipientAddress: string,
    recipientSubaccountNumber: number,
    amount: string,
    memo?: string,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msgs: Promise<EncodeObject[]> = new Promise((resolve) => {
      const msg = this.transferToSubaccountMessage(
        subaccount,
        recipientAddress,
        recipientSubaccountNumber,
        amount,
      );
      resolve([msg]);
    });
    return this.send(
      subaccount.wallet,
      () => msgs,
      false,
      undefined,
      memo,
      broadcastMode ?? Method.BroadcastTxCommit,
    );
  }

  /**
   * @description Create message to transfer from a subaccount to another subaccount
   *
   * @param subaccount The subaccount to transfer from
   * @param recipientAddress The recipient address
   * @param recipientSubaccountNumber The recipient subaccount number
   * @param amount The amount to transfer
   *
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The message
   */
  transferToSubaccountMessage(
    subaccount: SubaccountInfo,
    recipientAddress: string,
    recipientSubaccountNumber: number,
    amount: string,
  ): EncodeObject {
    const validatorClient = this._validatorClient;
    if (validatorClient === undefined) {
      throw new Error('validatorClient not set');
    }
    const quantums = parseUnits(amount, validatorClient.config.denoms.USDC_DECIMALS);
    if (quantums > BigInt(Long.MAX_VALUE.toString())) {
      throw new Error('amount to large');
    }
    if (quantums < 0) {
      throw new Error('amount must be positive');
    }

    return this.validatorClient.post.composer.composeMsgTransfer(
      subaccount.address,
      subaccount.subaccountNumber,
      recipientAddress,
      recipientSubaccountNumber,
      0,
      Long.fromString(quantums.toString()),
    );
  }

  /**
   * @description Deposit from wallet to subaccount
   *
   * @param subaccount The subaccount to deposit to
   * @param amount The amount to deposit
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The transaction hash.
   */
  async depositToSubaccount(
    subaccount: SubaccountInfo,
    amount: string,
    memo?: string,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msgs: Promise<EncodeObject[]> = new Promise((resolve) => {
      const msg = this.depositToSubaccountMessage(subaccount, amount);
      resolve([msg]);
    });
    return this.validatorClient.post.send(subaccount.wallet, () => msgs, false, undefined, memo);
  }

  /**
   * @description Create message to deposit from wallet to subaccount
   *
   * @param subaccount The subaccount to deposit to
   * @param amount The amount to deposit
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The message
   */
  depositToSubaccountMessage(subaccount: SubaccountInfo, amount: string): EncodeObject {
    const validatorClient = this._validatorClient;
    if (validatorClient === undefined) {
      throw new Error('validatorClient not set');
    }
    const quantums = parseUnits(amount, validatorClient.config.denoms.USDC_DECIMALS);
    if (quantums > BigInt(Long.MAX_VALUE.toString())) {
      throw new Error('amount to large');
    }
    if (quantums < 0) {
      throw new Error('amount must be positive');
    }

    return this.validatorClient.post.composer.composeMsgDepositToSubaccount(
      subaccount.address,
      subaccount.subaccountNumber,
      0,
      Long.fromString(quantums.toString()),
    );
  }

  /**
   * @description Withdraw from subaccount to wallet
   *
   * @param subaccount The subaccount to withdraw from
   * @param amount The amount to withdraw
   * @param recipient The recipient address, default to subaccount address
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The transaction hash
   */
  async withdrawFromSubaccount(
    subaccount: SubaccountInfo,
    amount: string,
    recipient?: string,
    memo?: string,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msgs: Promise<EncodeObject[]> = new Promise((resolve) => {
      const msg = this.withdrawFromSubaccountMessage(subaccount, amount, recipient);
      resolve([msg]);
    });
    return this.send(subaccount.wallet, () => msgs, false, undefined, memo);
  }

  /**
   * @description Create message to withdraw from subaccount to wallet
   * with human readable input.
   *
   * @param subaccount The subaccount to withdraw from
   * @param amount The amount to withdraw
   * @param recipient The recipient address
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The message
   */
  withdrawFromSubaccountMessage(
    subaccount: SubaccountInfo,
    amount: string,
    recipient?: string,
  ): EncodeObject {
    const validatorClient = this._validatorClient;
    if (validatorClient === undefined) {
      throw new Error('validatorClient not set');
    }
    const quantums = parseUnits(amount, validatorClient.config.denoms.USDC_DECIMALS);
    if (quantums > BigInt(Long.MAX_VALUE.toString())) {
      throw new Error('amount to large');
    }
    if (quantums < 0) {
      throw new Error('amount must be positive');
    }

    return this.validatorClient.post.composer.composeMsgWithdrawFromSubaccount(
      subaccount.address,
      subaccount.subaccountNumber,
      0,
      Long.fromString(quantums.toString()),
      recipient,
    );
  }

  /**
   * @description Create message to send chain token from subaccount to wallet
   * with human readable input.
   *
   * @param subaccount The subaccount to withdraw from
   * @param amount The amount to withdraw
   * @param recipient The recipient address
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The message
   */
  sendTokenMessage(wallet: LocalWallet, amount: string, recipient: string): EncodeObject {
    const address = wallet.address;
    if (address === undefined) {
      throw new UserError('wallet address is not set. Call connectWallet() first');
    }
    const { CHAINTOKEN_DENOM: chainTokenDenom, CHAINTOKEN_DECIMALS: chainTokenDecimals } =
      this._validatorClient?.config.denoms || {};

    if (chainTokenDenom === undefined || chainTokenDecimals === undefined) {
      throw new Error('Chain token denom not set in validator config');
    }

    const quantums = parseUnits(amount, chainTokenDecimals);

    return this.validatorClient.post.composer.composeMsgSendToken(
      address,
      recipient,
      chainTokenDenom,
      quantums.toString(),
    );
  }

  async signPlaceOrder(
    subaccount: SubaccountInfo,
    marketId: string,
    type: OrderType,
    side: OrderSide,
    price: number,
    // trigger_price: number,   // not used for MARKET and LIMIT
    size: number,
    clientId: number,
    timeInForce: OrderTimeInForce,
    goodTilTimeInSeconds: number,
    execution: OrderExecution,
    postOnly: boolean,
    reduceOnly: boolean,
  ): Promise<string> {
    const msgs: Promise<EncodeObject[]> = new Promise((resolve) => {
      const msg = this.placeOrderMessage(
        subaccount,
        marketId,
        type,
        side,
        price,
        // trigger_price: number,   // not used for MARKET and LIMIT
        size,
        clientId,
        timeInForce,
        goodTilTimeInSeconds,
        execution,
        postOnly,
        reduceOnly,
      );
      msg
        .then((it) => resolve([it]))
        .catch((err) => {
          console.log(err);
        });
    });
    const signature = await this.sign(wallet, () => msgs, true);

    return Buffer.from(signature).toString('base64');
  }

  async signCancelOrder(
    subaccount: SubaccountInfo,
    clientId: number,
    orderFlags: OrderFlags,
    clobPairId: number,
    goodTilBlock: number,
    goodTilBlockTime: number,
  ): Promise<string> {
    const msgs: Promise<EncodeObject[]> = new Promise((resolve) => {
      const msg = this.validatorClient.post.composer.composeMsgCancelOrder(
        subaccount.address,
        subaccount.subaccountNumber,
        clientId,
        clobPairId,
        orderFlags,
        goodTilBlock,
        goodTilBlockTime,
      );
      resolve([msg]);
    });
    const signature = await this.sign(subaccount.wallet, () => msgs, true);

    return Buffer.from(signature).toString('base64');
  }

  async bulkCancelAndTransferAndPlaceStatefulOrders(
    subaccount: SubaccountInfo,
    // these are executed in this order, all in one block, and all succeed or all fail
    cancelOrderPayloads: CancelRawOrderPayload[],
    transferToSubaccountPayload: TransferToSubaccountPayload | undefined,
    placeOrderPayloads: PlaceOrderPayload[],
    memo?: string,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    if (cancelOrderPayloads.some((c) => c.orderFlags === OrderFlags.SHORT_TERM)) {
      throw new Error('SHORT_TERM cancels cannot be batched');
    }

    if (
      placeOrderPayloads.some(
        (placePayload) =>
          calculateOrderFlags(placePayload.type, placePayload.timeInForce) ===
          OrderFlags.SHORT_TERM,
      )
    ) {
      throw new Error('SHORT_TERM orders cannot be batched');
    }

    const account: Promise<Account> = this.validatorClient.post.account(
      subaccount.address,
      undefined,
    );

    const msgs: Promise<EncodeObject[]> = (async () => {
      const cancelMsgPromises = cancelOrderPayloads.map(async (cancelPayload) => {
        const cancelSubaccount = new SubaccountInfo(
          subaccount.wallet,
          cancelPayload.subaccountNumber,
        );
        return this.validatorClient.post.cancelOrderMsg(
          cancelSubaccount.address,
          cancelSubaccount.subaccountNumber,
          cancelPayload.clientId,
          cancelPayload.orderFlags,
          cancelPayload.clobPairId,
          cancelPayload.goodTilBlock,
          cancelPayload.goodTilBlockTime,
        );
      });

      const transferMsg = (() => {
        if (transferToSubaccountPayload == null) {
          return undefined;
        }
        const transferSubaccount = new SubaccountInfo(
          subaccount.wallet,
          transferToSubaccountPayload?.sourceSubaccountNumber,
        );
        return this.transferToSubaccountMessage(
          transferSubaccount,
          transferSubaccount.address,
          transferToSubaccountPayload.recipientSubaccountNumber,
          transferToSubaccountPayload.transferAmount,
        );
      })();

      const placeOrderMsgPromises = placeOrderPayloads.map((placePayload) => {
        const placeSubaccount = new SubaccountInfo(
          subaccount.wallet,
          placePayload.subaccountNumber,
        );
        return this.placeOrderMessage(
          placeSubaccount,
          placePayload.marketId,
          placePayload.type,
          placePayload.side,
          placePayload.price,
          placePayload.size,
          placePayload.clientId,
          placePayload.timeInForce,
          placePayload.goodTilTimeInSeconds,
          placePayload.execution,
          placePayload.postOnly,
          placePayload.reduceOnly,
          placePayload.triggerPrice,
          placePayload.marketInfo,
          placePayload.currentHeight,
          placePayload.goodTilBlock,
        );
      });

      return Promise.all([
        ...cancelMsgPromises,
        ...(transferMsg != null ? [transferMsg] : []),
        ...placeOrderMsgPromises,
      ]);
    })();

    return this.send(
      subaccount.wallet,
      () => msgs,
      true,
      undefined,
      memo,
      broadcastMode ?? Method.BroadcastTxCommit,
      () => account,
    );
  }

  // vaults

  async depositToMegavault(
    subaccount: SubaccountInfo,
    amountUsdc: number,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.validatorClient.post.depositToMegavault(
      subaccount,
      bigIntToBytes(calculateVaultQuantums(amountUsdc)),
      broadcastMode,
    );
  }

  depositToMegavaultMessage(subaccount: SubaccountInfo, amountUsdc: number): EncodeObject {
    return this.validatorClient.post.depositToMegavaultMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      bigIntToBytes(calculateVaultQuantums(amountUsdc)),
    );
  }

  async withdrawFromMegavault(
    subaccount: SubaccountInfo,
    shares: number,
    minAmount: number,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.validatorClient.post.withdrawFromMegavault(
      subaccount,
      bigIntToBytes(BigInt(Math.floor(shares))),
      bigIntToBytes(calculateVaultQuantums(minAmount)),
      broadcastMode,
    );
  }

  withdrawFromMegavaultMessage(
    subaccount: SubaccountInfo,
    shares: number,
    minAmount: number,
  ): EncodeObject {
    return this.validatorClient.post.withdrawFromMegavaultMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      bigIntToBytes(BigInt(Math.floor(shares))),
      bigIntToBytes(calculateVaultQuantums(minAmount)),
    );
  }

  /**
   * @description Submit a governance proposal to add a new market.
   *
   * @param params Parameters neeeded to create a new market.
   * @param title Title of the gov proposal.
   * @param summary Summary of the gov proposal.
   * @param initialDepositAmount Initial deposit amount of the gov proposal.
   * @param proposer proposer of the gov proposal.
   *
   * @returns the transaction hash.
   */
  async submitGovAddNewMarketProposal(
    wallet: LocalWallet,
    params: GovAddNewMarketParams,
    title: string,
    summary: string,
    initialDepositAmount: string,
    memo?: string,
    metadata?: string,
    expedited?: boolean,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg: Promise<EncodeObject[]> = new Promise((resolve) => {
      const composer = this.validatorClient.post.composer;
      const registry = generateRegistry();
      const msgs: EncodeObject[] = [];

      const isDydxUsd = params.ticker.toLowerCase() === 'dydx-usd';

      // x/prices.MsgCreateOracleMarket
      const createOracleMarket = composer.composeMsgCreateOracleMarket(
        params.id,
        params.ticker,
        params.priceExponent,
        params.minExchanges,
        params.minPriceChange,
        params.exchangeConfigJson,
      );

      // x/perpetuals.MsgCreatePerpetual
      const createPerpetual = composer.composeMsgCreatePerpetual(
        params.id,
        isDydxUsd ? 1000001 : params.id,
        params.ticker,
        params.atomicResolution,
        params.liquidityTier,
        params.marketType,
      );

      // x/clob.MsgCreateClobPair
      const createClobPair = composer.composeMsgCreateClobPair(
        params.id,
        params.id,
        params.quantumConversionExponent,
        params.stepBaseQuantums,
        params.subticksPerTick,
      );

      // x/clob.MsgUpdateClobPair
      const updateClobPair = composer.composeMsgUpdateClobPair(
        params.id,
        params.id,
        params.quantumConversionExponent,
        params.stepBaseQuantums,
        params.subticksPerTick,
      );

      // x/delaymsg.MsgDelayMessage
      const delayMessage = composer.composeMsgDelayMessage(
        // IMPORTANT: must wrap messages in Any type to fit into delaymsg.
        composer.wrapMessageAsAny(registry, updateClobPair),
        params.delayBlocks,
      );

      // The order matters.
      if (!isDydxUsd) {
        msgs.push(createOracleMarket);
      }
      msgs.push(createPerpetual);
      msgs.push(createClobPair);
      msgs.push(delayMessage);

      // x/gov.v1.MsgSubmitProposal
      const submitProposal = composer.composeMsgSubmitProposal(
        title,
        initialDepositAmount,
        this.validatorClient.config.denoms, // use the client denom.
        summary,
        // IMPORTANT: must wrap messages in Any type for gov's submit proposal.
        composer.wrapMessageArrAsAny(registry, msgs),
        wallet.address!, // proposer
        metadata,
        expedited,
      );

      resolve([submitProposal]);
    });

    return this.send(wallet, () => msg, false, undefined, memo);
  }

  async createMarketPermissionless(
    subaccount: SubaccountInfo,
    ticker: string,
    broadcastMode?: BroadcastMode,
    gasAdjustment?: number,
    memo?: string,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.validatorClient.post.createMarketPermissionless(
      ticker,
      subaccount,
      broadcastMode,
      gasAdjustment,
      memo,
    );
  }

  async addAuthenticator(
    subaccount: SubaccountInfo,
    authenticatorType: AuthenticatorType,
    data: Uint8Array,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    // Validate the provided authenticators before sending to the validator
    const authenticator: Authenticator = {
      type: authenticatorType,
      config: JSON.parse(new TextDecoder().decode(data)),
    };
    if (!this.validateAuthenticator(authenticator)) {
      throw new Error(
        'Invalid authenticator, please ensure the authenticator permissions are correct',
      );
    }

    return this.validatorClient.post.addAuthenticator(subaccount, authenticatorType, data);
  }

  async removeAuthenticator(
    subaccount: SubaccountInfo,
    id: Long,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.validatorClient.post.removeAuthenticator(subaccount, id);
  }

  async getAuthenticators(address: string): Promise<GetAuthenticatorsResponse> {
    return this.validatorClient.get.getAuthenticators(address);
  }

  validateAuthenticator(authenticator: Authenticator): boolean {
    function checkAuthenticator(auth: Authenticator): boolean {
      if (auth.type === AuthenticatorType.SIGNATURE_VERIFICATION) {
        return true; // A SignatureVerification authenticator is safe.
      }

      if (!Array.isArray(auth.config)) {
        return false; // Unsafe case: a non-array config for a composite authenticator
      }

      if (auth.type === AuthenticatorType.ANY_OF) {
        // ANY_OF is safe only if ALL sub-authenticators return true
        return auth.config.every((nestedAuth) => checkAuthenticator(nestedAuth));
      }

      if (auth.type === AuthenticatorType.ALL_OF) {
        // ALL_OF is safe if at least one sub-authenticator returns true
        return auth.config.some((nestedAuth) => checkAuthenticator(nestedAuth));
      }

      // If it's a base-case authenticator but not SignatureVerification, it's unsafe
      return false;
    }

    // The top-level authenticator must pass validation
    if (!checkAuthenticator(authenticator)) {
      return false;
    }

    return true;
  }
}
