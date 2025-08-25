import { Coin, Secp256k1Pubkey } from '@cosmjs/amino';
import { Uint53 } from '@cosmjs/math';
import { EncodeObject, Registry } from '@cosmjs/proto-signing';
import { Account, calculateFee, GasPrice, IndexedTx, StdFee } from '@cosmjs/stargate';
import { Method } from '@cosmjs/tendermint-rpc';
import {
  BroadcastTxAsyncResponse,
  BroadcastTxSyncResponse,
} from '@cosmjs/tendermint-rpc/build/tendermint37';
import Long from 'long';
import protobuf from 'protobufjs';

import { AuthenticatorType, GAS_MULTIPLIER, SelectedGasDenom } from '../constants';
import { UnexpectedClientError } from '../lib/errors';
import { generateRegistry } from '../lib/registry';
import { SubaccountInfo } from '../subaccount';
import {
  OrderFlags,
  BroadcastMode,
  TransactionOptions,
  IPlaceOrder,
  ICancelOrder,
  DenomConfig,
} from '../types';
import { Composer } from './composer';
import { Get } from './get';
import LocalWallet from './local-wallet';
import {
  Order_Side,
  Order_TimeInForce,
  Any,
  MsgPlaceOrder,
  MsgCancelOrder,
  Order_ConditionType,
  OrderBatch,
} from './proto-includes';

// Required for encoding and decoding queries that are of type Long.
// Must be done once but since the individal modules should be usable
// - must be set in each module that encounters encoding/decoding Longs.
// Reference: https://github.com/protobufjs/protobuf.js/issues/921
protobuf.util.Long = Long;
protobuf.configure();

export class Post {
  public readonly composer: Composer;
  private readonly registry: Registry;
  private readonly chainId: string;
  public readonly get: Get;
  public readonly denoms: DenomConfig;
  public readonly defaultClientMemo?: string;

  public selectedGasDenom: SelectedGasDenom = SelectedGasDenom.USDC;
  public readonly defaultGasPrice: GasPrice;
  public readonly defaultDydxGasPrice: GasPrice;

  public useTimestampNonce: boolean = false;
  public timestampNonceOffsetMs: number = 0;
  private accountNumberCache: Map<string, Account> = new Map();

  constructor(
    get: Get,
    chainId: string,
    denoms: DenomConfig,
    defaultClientMemo?: string,
    useTimestampNonce?: boolean,
    timestampNonceOffsetMs?: number,
  ) {
    this.get = get;
    this.chainId = chainId;
    this.registry = generateRegistry();
    this.composer = new Composer();
    this.denoms = denoms;
    this.defaultClientMemo = defaultClientMemo;
    this.defaultGasPrice = GasPrice.fromString(
      `0.025${denoms.USDC_GAS_DENOM !== undefined ? denoms.USDC_GAS_DENOM : denoms.USDC_DENOM}`,
    );
    this.defaultDydxGasPrice = GasPrice.fromString(
      `25000000000${
        denoms.CHAINTOKEN_GAS_DENOM !== undefined
          ? denoms.CHAINTOKEN_GAS_DENOM
          : denoms.CHAINTOKEN_DENOM
      }`,
    );
    if (useTimestampNonce === true) {
      this.useTimestampNonce = useTimestampNonce;
      this.timestampNonceOffsetMs = timestampNonceOffsetMs ?? this.timestampNonceOffsetMs;
    }
  }

  /**
   * @description Retrieves the account number for the given wallet address and populates the accountNumberCache.
   * The account number is required for txOptions when signing a transaction.
   * Pre-populating the cache avoids a round-trip request during the first transaction creation in the session, preventing it from being a performance blocker.
   */
  public async populateAccountNumberCache(address: string): Promise<void> {
    if (this.accountNumberCache.has(address)) return;

    const account = await this.get.getAccount(address);
    this.accountNumberCache.set(address, account);
  }

  setSelectedGasDenom(selectedGasDenom: SelectedGasDenom): void {
    this.selectedGasDenom = selectedGasDenom;
  }

  getGasPrice(): GasPrice {
    return this.selectedGasDenom === SelectedGasDenom.USDC
      ? this.defaultGasPrice
      : this.defaultDydxGasPrice;
  }

  /**
   * @description Simulate a transaction
   * the calling function is responsible for creating the messages.
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The Fee for broadcasting a transaction.
   */
  async simulate(
    wallet: LocalWallet,
    messaging: () => Promise<EncodeObject[]>,
    gasPrice: GasPrice = this.getGasPrice(),
    memo?: string,
    account?: () => Promise<Account>,
  ): Promise<StdFee> {
    let msgs: EncodeObject[];
    // protocol expects timestamp nonce in UTC milliseconds, which is the unit returned by Date.now()
    let sequence = Date.now() + this.timestampNonceOffsetMs;

    if (this.useTimestampNonce) {
      msgs = await messaging();
    } else {
      const msgsPromise = messaging();
      const accountPromise = account ? await account() : this.account(wallet.address!);
      const msgsAndAccount = await Promise.all([msgsPromise, accountPromise]);
      msgs = msgsAndAccount[0];
      sequence = msgsAndAccount[1].sequence;
    }

    return this.simulateTransaction(wallet.pubKey!, sequence, msgs, gasPrice, memo);
  }

  /**
   * @description Sign a transaction
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
    gasPrice: GasPrice = this.getGasPrice(),
    memo?: string,
    account?: () => Promise<Account>,
  ): Promise<Uint8Array> {
    const msgsPromise = await messaging();
    const accountPromise = account ? await account() : this.account(wallet.address!);
    const msgsAndAccount = await Promise.all([msgsPromise, accountPromise]);
    const msgs = msgsAndAccount[0];
    return this.signTransaction(wallet, msgs, msgsAndAccount[1], zeroFee, gasPrice, memo);
  }

  /**
   * @description Send a transaction
   * the calling function is responsible for creating the messages.
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The Tx Hash.
   */
  async send(
    wallet: LocalWallet,
    messaging: () => Promise<EncodeObject[]>,
    zeroFee: boolean,
    gasPrice: GasPrice = this.getGasPrice(),
    memo?: string,
    broadcastMode?: BroadcastMode,
    account?: () => Promise<Account>,
    gasAdjustment: number = GAS_MULTIPLIER,
    authenticators?: Long[],
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msgsPromise = messaging();
    const accountPromise = account ? await account() : this.account(wallet.address!);
    const msgsAndAccount = await Promise.all([msgsPromise, accountPromise]);
    const msgs = msgsAndAccount[0];

    return this.signAndSendTransaction(
      wallet,
      msgsAndAccount[1],
      msgs,
      zeroFee,
      gasPrice,
      memo ?? this.defaultClientMemo,
      broadcastMode ?? this.defaultBroadcastMode(msgs),
      gasAdjustment,
      authenticators,
    );
  }

  /**
   * @description Calculate the default broadcast mode.
   */
  private defaultBroadcastMode(msgs: EncodeObject[]): BroadcastMode {
    if (
      msgs.length === 1 &&
      (msgs[0].typeUrl === '/dydxprotocol.clob.MsgPlaceOrder' ||
        msgs[0].typeUrl === '/dydxprotocol.clob.MsgCancelOrder')
    ) {
      const orderFlags =
        msgs[0].typeUrl === '/dydxprotocol.clob.MsgPlaceOrder'
          ? (msgs[0].value as MsgPlaceOrder).order?.orderId?.orderFlags
          : (msgs[0].value as MsgCancelOrder).orderId?.orderFlags;

      switch (orderFlags) {
        case OrderFlags.SHORT_TERM:
          return Method.BroadcastTxSync;

        case OrderFlags.LONG_TERM:
        case OrderFlags.CONDITIONAL:
          return Method.BroadcastTxCommit;

        default:
          break;
      }
    }
    return Method.BroadcastTxSync;
  }

  /**
   * @description Sign and send a message
   *
   * @returns The Tx Response.
   */
  private async signTransaction(
    wallet: LocalWallet,
    messages: EncodeObject[],
    account: Account,
    zeroFee: boolean,
    gasPrice: GasPrice = this.getGasPrice(),
    memo?: string,
    gasAdjustment: number = GAS_MULTIPLIER,
    authenticators?: Long[],
  ): Promise<Uint8Array> {
    // protocol expects timestamp nonce in UTC milliseconds, which is the unit returned by Date.now()
    const sequence = this.useTimestampNonce
      ? Date.now() + this.timestampNonceOffsetMs
      : account.sequence;
    // Simulate transaction if no fee is specified.
    const fee: StdFee = zeroFee
      ? {
          amount: [],
          gas: '1000000',
        }
      : await this.simulateTransaction(
          wallet.pubKey!,
          sequence,
          messages,
          gasPrice,
          memo,
          gasAdjustment,
        );

    const txOptions: TransactionOptions = {
      sequence,
      accountNumber: account.accountNumber,
      chainId: this.chainId,
      authenticators,
    };
    console.log('txOptions:', JSON.stringify(txOptions))
    // Generate signed transaction.
    return wallet.signTransaction(messages, txOptions, fee, memo);
  }

  /**
   * @description Retrieve an account structure for transactions.
   * For short term orders, the sequence doesn't matter. Use cached if available.
   * For long term and conditional orders, a round trip to validator must be made.
   * when timestamp nonce is supported, no need to fetch account sequence number
   */
  public async account(address: string, orderFlags?: OrderFlags): Promise<Account> {
    if (orderFlags === OrderFlags.SHORT_TERM || this.useTimestampNonce) {
      if (this.accountNumberCache.has(address)) {
        // If order is SHORT_TERM or if timestamp nonce is enabled, the sequence doesn't matter
        return this.accountNumberCache.get(address)!;
      }
    }
    const account = await this.get.getAccount(address);
    console.log('Account: ', account)
    this.accountNumberCache.set(address, account);
    return account;
  }

  /**
   * @description Sign and send a message
   *
   * @returns The Tx Response.
   */
  private async signAndSendTransaction(
    wallet: LocalWallet,
    account: Account,
    messages: EncodeObject[],
    zeroFee: boolean,
    gasPrice: GasPrice = this.getGasPrice(),
    memo?: string,
    broadcastMode?: BroadcastMode,
    gasAdjustment: number = GAS_MULTIPLIER,
    authenticators?: Long[],
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const signedTransaction = await this.signTransaction(
      wallet,
      messages,
      account,
      zeroFee,
      gasPrice,
      memo,
      gasAdjustment,
      authenticators,
    );
    console.log('signed tx:', signedTransaction)
    return this.sendSignedTransaction(signedTransaction, broadcastMode);
  }

  /**
   * @description Send signed transaction.
   *
   * @returns The Tx Response.
   */
  async sendSignedTransaction(
    signedTransaction: Uint8Array,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.get.tendermintClient.broadcastTransaction(
      signedTransaction,
      broadcastMode !== undefined ? broadcastMode : Method.BroadcastTxSync,
    );
  }

  /**
   * @description Simulate broadcasting a transaction.
   *
   * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
   * at any point.
   * @returns The Fee for broadcasting a transaction.
   */
  private async simulateTransaction(
    pubKey: Secp256k1Pubkey,
    sequence: number,
    messages: readonly EncodeObject[],
    gasPrice: GasPrice = this.getGasPrice(),
    memo?: string,
    gasAdjustment: number = GAS_MULTIPLIER,
  ): Promise<StdFee> {
    // Get simulated response.
    const encodedMessages: Any[] = messages.map((message: EncodeObject) =>
      this.registry.encodeAsAny(message),
    );
    const simulationResponse = await this.get.stargateQueryClient.tx.simulate(
      encodedMessages,
      memo,
      pubKey,
      sequence,
    );

    // The promise should have been rejected if the gasInfo was undefined.
    if (simulationResponse.gasInfo === undefined) {
      throw new UnexpectedClientError();
    }

    // Calculate and return fee from gasEstimate.
    const gasEstimate: number = Uint53.fromString(
      simulationResponse.gasInfo.gasUsed.toString(),
    ).toNumber();
    const fee = calculateFee(Math.floor(gasEstimate * gasAdjustment), gasPrice);

    // TODO(TRCL-2550): Temporary workaround before IBC denom is supported in '@cosmjs/stargate'.
    // The '@cosmjs/stargate' does not support denom with '/', so currently GAS_PRICE is
    // represented in 'uusdc', and the output of `calculateFee` is in '', which is replaced
    // below by USDC_DENOM string.
    const amount: Coin[] = fee.amount.map((coin: Coin) => {
      if (coin.denom === 'uusdc') {
        return {
          amount: coin.amount,
          denom: this.denoms.USDC_DENOM,
        };
      }
      return coin;
    });

    return {
      ...fee,
      amount,
    };
  }

  // ------ State-Changing Requests ------ //

  async placeOrder(
    subaccount: SubaccountInfo,
    clientId: number,
    clobPairId: number,
    side: Order_Side,
    quantums: Long,
    subticks: Long,
    timeInForce: Order_TimeInForce,
    orderFlags: number,
    reduceOnly: boolean,
    goodTilBlock?: number,
    goodTilBlockTime?: number,
    clientMetadata: number = 0,
    conditionType: Order_ConditionType = Order_ConditionType.CONDITION_TYPE_UNSPECIFIED,
    conditionalOrderTriggerSubticks: Long = Long.fromInt(0),
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = await this.placeOrderMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      clientId,
      clobPairId,
      side,
      quantums,
      subticks,
      timeInForce,
      orderFlags,
      reduceOnly,
      goodTilBlock,
      goodTilBlockTime,
      clientMetadata,
      conditionType,
      conditionalOrderTriggerSubticks,
    );
    const account: Promise<Account> = this.account(subaccount.address, orderFlags);
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      true,
      undefined,
      undefined,
      broadcastMode,
      () => account,
    );
  }

  async placeOrderMsg(
    address: string,
    subaccountNumber: number,
    clientId: number,
    clobPairId: number,
    side: Order_Side,
    quantums: Long,
    subticks: Long,
    timeInForce: Order_TimeInForce,
    orderFlags: number,
    reduceOnly: boolean,
    goodTilBlock?: number,
    goodTilBlockTime?: number,
    clientMetadata: number = 0,
    conditionType: Order_ConditionType = Order_ConditionType.CONDITION_TYPE_UNSPECIFIED,
    conditionalOrderTriggerSubticks: Long = Long.fromInt(0),
  ): Promise<EncodeObject> {
    return new Promise((resolve) => {
      const msg = this.composer.composeMsgPlaceOrder(
        address,
        subaccountNumber,
        clientId,
        clobPairId,
        orderFlags,
        goodTilBlock ?? 0,
        goodTilBlockTime ?? 0,
        side,
        quantums,
        subticks,
        timeInForce,
        reduceOnly,
        clientMetadata,
        conditionType,
        conditionalOrderTriggerSubticks,
      );
      resolve(msg);
    });
  }

  async placeOrderObject(
    subaccount: SubaccountInfo,
    placeOrder: IPlaceOrder,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.placeOrder(
      subaccount,
      placeOrder.clientId,
      placeOrder.clobPairId,
      placeOrder.side,
      placeOrder.quantums,
      placeOrder.subticks,
      placeOrder.timeInForce,
      placeOrder.orderFlags,
      placeOrder.reduceOnly,
      placeOrder.goodTilBlock,
      placeOrder.goodTilBlockTime,
      placeOrder.clientMetadata,
      placeOrder.conditionType ?? Order_ConditionType.CONDITION_TYPE_UNSPECIFIED,
      placeOrder.conditionalOrderTriggerSubticks ?? Long.fromInt(0),
      broadcastMode,
    );
  }

  async cancelOrder(
    subaccount: SubaccountInfo,
    clientId: number,
    orderFlags: OrderFlags,
    clobPairId: number,
    goodTilBlock?: number,
    goodTilBlockTime?: number,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = await this.cancelOrderMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      clientId,
      orderFlags,
      clobPairId,
      goodTilBlock ?? 0,
      goodTilBlockTime ?? 0,
    );
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      true,
      undefined,
      undefined,
      broadcastMode,
    );
  }

  async cancelOrderMsg(
    address: string,
    subaccountNumber: number,
    clientId: number,
    orderFlags: OrderFlags,
    clobPairId: number,
    goodTilBlock?: number,
    goodTilBlockTime?: number,
  ): Promise<EncodeObject> {
    return new Promise((resolve) => {
      const msg = this.composer.composeMsgCancelOrder(
        address,
        subaccountNumber,
        clientId,
        clobPairId,
        orderFlags,
        goodTilBlock ?? 0,
        goodTilBlockTime ?? 0,
      );
      resolve(msg);
    });
  }

  async cancelOrderObject(
    subaccount: SubaccountInfo,
    cancelOrder: ICancelOrder,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    return this.cancelOrder(
      subaccount,
      cancelOrder.clientId,
      cancelOrder.orderFlags,
      cancelOrder.clobPairId,
      cancelOrder.goodTilBlock,
      cancelOrder.goodTilBlockTime,
      broadcastMode,
    );
  }

  async batchCancelShortTermOrders(
    subaccount: SubaccountInfo,
    shortTermOrders: OrderBatch[],
    goodTilBlock: number,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = await this.batchCancelShortTermOrdersMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      shortTermOrders,
      goodTilBlock,
    );
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      true,
      undefined,
      undefined,
      broadcastMode,
    );
  }

  async batchCancelShortTermOrdersMsg(
    address: string,
    subaccountNumber: number,
    shortTermOrders: OrderBatch[],
    goodTilBlock: number,
  ): Promise<EncodeObject> {
    return new Promise((resolve) => {
      const msg = this.composer.composeMsgBatchCancelShortTermOrders(
        address,
        subaccountNumber,
        shortTermOrders,
        goodTilBlock,
      );
      resolve(msg);
    });
  }

  async transfer(
    subaccount: SubaccountInfo,
    recipientAddress: string,
    recipientSubaccountNumber: number,
    assetId: number,
    amount: Long,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = await this.transferMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      recipientAddress,
      recipientSubaccountNumber,
      assetId,
      amount,
    );
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      undefined,
      undefined,
      broadcastMode,
    );
  }

  async transferMsg(
    address: string,
    subaccountNumber: number,
    recipientAddress: string,
    recipientSubaccountNumber: number,
    assetId: number,
    amount: Long,
  ): Promise<EncodeObject> {
    return new Promise((resolve) => {
      const msg = this.composer.composeMsgTransfer(
        address,
        subaccountNumber,
        recipientAddress,
        recipientSubaccountNumber,
        assetId,
        amount,
      );
      resolve(msg);
    });
  }

  async deposit(
    subaccount: SubaccountInfo,
    assetId: number,
    quantums: Long,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = await this.depositMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      assetId,
      quantums,
    );
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      undefined,
      undefined,
      broadcastMode,
    );
  }

  async depositMsg(
    address: string,
    subaccountNumber: number,
    assetId: number,
    quantums: Long,
  ): Promise<EncodeObject> {
    return new Promise((resolve) => {
      const msg = this.composer.composeMsgDepositToSubaccount(
        address,
        subaccountNumber,
        assetId,
        quantums,
      );
      resolve(msg);
    });
  }

  async withdraw(
    subaccount: SubaccountInfo,
    assetId: number,
    quantums: Long,
    recipient?: string,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = await this.withdrawMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      assetId,
      quantums,
      recipient,
    );
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      undefined,
      undefined,
      broadcastMode,
    );
  }

  async withdrawMsg(
    address: string,
    subaccountNumber: number,
    assetId: number,
    quantums: Long,
    recipient?: string,
  ): Promise<EncodeObject> {
    return new Promise((resolve) => {
      const msg = this.composer.composeMsgWithdrawFromSubaccount(
        address,
        subaccountNumber,
        assetId,
        quantums,
        recipient,
      );
      resolve(msg);
    });
  }

  async sendToken(
    subaccount: SubaccountInfo,
    recipient: string,
    coinDenom: string,
    quantums: string,
    zeroFee: boolean = true,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = await this.sendTokenMsg(subaccount.address, recipient, coinDenom, quantums);
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      zeroFee,
      coinDenom === this.denoms.CHAINTOKEN_DENOM ? this.defaultDydxGasPrice : this.defaultGasPrice,
      undefined,
      broadcastMode,
    );
  }

  async sendTokenMsg(
    address: string,
    recipient: string,
    coinDenom: string,
    quantums: string,
  ): Promise<EncodeObject> {
    if (coinDenom !== this.denoms.CHAINTOKEN_DENOM && coinDenom !== this.denoms.USDC_DENOM) {
      throw new Error('Unsupported coinDenom');
    }

    return new Promise((resolve) => {
      const msg = this.composer.composeMsgSendToken(address, recipient, coinDenom, quantums);
      resolve(msg);
    });
  }

  async delegate(
    subaccount: SubaccountInfo,
    delegator: string,
    validator: string,
    amount: string,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = this.composer.composeMsgDelegate(delegator, validator, {
      denom: this.denoms.CHAINTOKEN_DENOM,
      amount,
    });
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      this.defaultDydxGasPrice,
      undefined,
      broadcastMode,
    );
  }

  delegateMsg(delegator: string, validator: string, amount: string): EncodeObject {
    return this.composer.composeMsgDelegate(delegator, validator, {
      denom: this.denoms.CHAINTOKEN_DENOM,
      amount,
    });
  }

  async undelegate(
    subaccount: SubaccountInfo,
    delegator: string,
    validator: string,
    amount: string,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = this.composer.composeMsgUndelegate(delegator, validator, {
      denom: this.denoms.CHAINTOKEN_DENOM,
      amount,
    });
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      this.defaultDydxGasPrice,
      undefined,
      broadcastMode,
    );
  }

  undelegateMsg(delegator: string, validator: string, amount: string): EncodeObject {
    return this.composer.composeMsgUndelegate(delegator, validator, {
      denom: this.denoms.CHAINTOKEN_DENOM,
      amount,
    });
  }

  async withdrawDelegatorReward(
    subaccount: SubaccountInfo,
    delegator: string,
    validator: string,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = this.composer.composeMsgWithdrawDelegatorReward(delegator, validator);
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      this.defaultGasPrice,
      undefined,
      broadcastMode,
    );
  }

  withdrawDelegatorRewardMsg(delegator: string, validator: string): EncodeObject {
    return this.composer.composeMsgWithdrawDelegatorReward(delegator, validator);
  }

  // vaults
  async depositToMegavault(
    subaccount: SubaccountInfo,
    quoteQuantums: Uint8Array,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = await this.depositToMegavaultMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      quoteQuantums,
    );
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      undefined,
      undefined,
      broadcastMode,
    );
  }

  depositToMegavaultMsg(
    ...args: Parameters<Composer['composeMsgDepositToMegavault']>
  ): EncodeObject {
    return this.composer.composeMsgDepositToMegavault(...args);
  }

  async withdrawFromMegavault(
    subaccount: SubaccountInfo,
    shares: Uint8Array,
    minQuoteQuantums: Uint8Array,
    broadcastMode?: BroadcastMode,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = await this.withdrawFromMegavaultMsg(
      subaccount.address,
      subaccount.subaccountNumber,
      shares,
      minQuoteQuantums,
    );
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      undefined,
      undefined,
      broadcastMode,
    );
  }

  withdrawFromMegavaultMsg(
    ...args: Parameters<Composer['composeMsgWithdrawFromMegavault']>
  ): EncodeObject {
    return this.composer.composeMsgWithdrawFromMegavault(...args);
  }

  async registerAffiliate(
    subaccount: SubaccountInfo,
    affiliate: string,
    broadcastMode?: BroadcastMode,
    gasAdjustment: number = 2,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = this.registerAffiliateMsg(subaccount.address, affiliate);
    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      undefined,
      undefined,
      broadcastMode,
      undefined,
      gasAdjustment,
    );
  }

  registerAffiliateMsg(...args: Parameters<Composer['composeMsgRegisterAffiliate']>): EncodeObject {
    return this.composer.composeMsgRegisterAffiliate(...args);
  }

  launchMarketMsg(
    ...args: Parameters<Composer['composeMsgCreateMarketPermissionless']>
  ): EncodeObject {
    return this.composer.composeMsgCreateMarketPermissionless(...args);
  }

  async createMarketPermissionless(
    ticker: string,
    subaccount: SubaccountInfo,
    broadcastMode?: BroadcastMode,
    gasAdjustment?: number,
    memo?: string,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = this.launchMarketMsg(subaccount.address, ticker, subaccount.subaccountNumber);

    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      undefined,
      memo,
      broadcastMode,
      undefined,
      gasAdjustment,
    );
  }

  async addAuthenticator(
    subaccount: SubaccountInfo,
    authenticatorType: AuthenticatorType,
    data: Uint8Array,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = this.composer.composeMsgAddAuthenticator(
      subaccount.address,
      authenticatorType,
      data,
    );

    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      undefined,
      undefined,
      Method.BroadcastTxSync,
      undefined,
      undefined,
    );
  }

  async removeAuthenticator(
    subaccount: SubaccountInfo,
    id: Long,
  ): Promise<BroadcastTxAsyncResponse | BroadcastTxSyncResponse | IndexedTx> {
    const msg = this.composer.composeMsgRemoveAuthenticator(subaccount.address, id);

    return this.send(
      subaccount.wallet,
      () => Promise.resolve([msg]),
      false,
      undefined,
      undefined,
      Method.BroadcastTxSync,
      undefined,
      undefined,
    );
  }
}
