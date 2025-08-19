/* eslint-disable @typescript-eslint/no-explicit-any */
/*
    Native app can call JS functions with primitives.
*/

import { Secp256k1, sha256 } from '@cosmjs/crypto';
import { EncodeObject, coin as createCoin } from '@cosmjs/proto-signing';
import { MsgTransferEncodeObject, accountFromAny } from '@cosmjs/stargate';
import { Method } from '@cosmjs/tendermint-rpc';
import {
  Order_Side,
  Order_TimeInForce,
} from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/order';
import * as AuthModule from 'cosmjs-types/cosmos/auth/v1beta1/query';
import Long from 'long';

import { BECH32_PREFIX, GAS_MULTIPLIER, NOBLE_BECH32_PREFIX } from '../lib/constants';
import { UserError } from '../lib/errors';
import { ByteArrayEncoding, encodeJson } from '../lib/helpers';
import { deriveHDKeyFromEthereumSignature, deriveHDKeyFromMnemonic } from '../lib/onboarding';
import { NetworkOptimizer } from '../network_optimizer';
import { CompositeClient, MarketInfo } from './composite-client';
import {
  Network,
  OrderType,
  OrderSide,
  OrderTimeInForce,
  OrderExecution,
  IndexerConfig,
  ValidatorConfig,
  SelectedGasDenom,
} from './constants';
import { FaucetClient } from './faucet-client';
import { parseToPrimitives } from './helpers/request-helpers';
import { Response } from './lib/axios';
import LocalWallet from './modules/local-wallet';
import { NobleClient } from './noble-client';
import { SubaccountInfo } from './subaccount';
import { OrderFlags, SquidIBCPayload } from './types';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var client: CompositeClient;
  // eslint-disable-next-line vars-on-top, no-var
  var faucetClient: FaucetClient | null;
  // eslint-disable-next-line vars-on-top, no-var
  var wallet: LocalWallet;
  // eslint-disable-next-line vars-on-top, no-var
  var hdKey: {
    privateKey: Uint8Array | null;
    publicKey: Uint8Array | null;
  };

  // eslint-disable-next-line vars-on-top, no-var
  var nobleClient: NobleClient | undefined;
  // eslint-disable-next-line vars-on-top, no-var
  var nobleWallet: LocalWallet | undefined;
}

export async function connectClient(network: Network): Promise<string> {
  try {
    globalThis.client = await CompositeClient.connect(network);
    return encodeJson(network);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function connectNetwork(paramsJSON: string): Promise<string> {
  try {
    const params = JSON.parse(paramsJSON);
    const {
      indexerUrl,
      websocketUrl,
      validatorUrl,
      chainId,
      faucetUrl,
      nobleValidatorUrl,
      USDC_DENOM,
      USDC_DECIMALS,
      USDC_GAS_DENOM,
      CHAINTOKEN_DENOM,
      CHAINTOKEN_DECIMALS,
      CHAINTOKEN_GAS_DENOM,
      txnMemo,
    } = params;

    if (
      indexerUrl === undefined ||
      websocketUrl === undefined ||
      validatorUrl === undefined ||
      chainId === undefined
    ) {
      throw new UserError('Missing required network params');
    }
    if (
      USDC_DENOM === undefined ||
      USDC_DECIMALS === undefined ||
      CHAINTOKEN_DENOM === undefined ||
      CHAINTOKEN_DECIMALS === undefined
    ) {
      throw new UserError('Missing required token params');
    }
    if (txnMemo === undefined) {
      throw new UserError('Missing required transaction memo (`txnMemo`)');
    }

    const denomConfig = {
      USDC_DENOM,
      USDC_DECIMALS,
      USDC_GAS_DENOM,
      CHAINTOKEN_DENOM,
      CHAINTOKEN_DECIMALS,
      CHAINTOKEN_GAS_DENOM,
    };
    const indexerConfig = new IndexerConfig(indexerUrl, websocketUrl);
    const validatorConfig = new ValidatorConfig(
      validatorUrl,
      chainId,
      denomConfig,
      undefined,
      txnMemo,
    );
    const config = new Network('native', indexerConfig, validatorConfig);
    globalThis.client = await CompositeClient.connect(config);
    if (faucetUrl !== undefined) {
      globalThis.faucetClient = new FaucetClient(faucetUrl);
    } else {
      globalThis.faucetClient = null;
    }

    try {
      globalThis.nobleClient = new NobleClient(nobleValidatorUrl, txnMemo);
      if (globalThis.nobleWallet) {
        await globalThis.nobleClient.connect(globalThis.nobleWallet);
      }
    } catch (e) {
      console.error('Failed to connect to noble validator');
    }

    return encodeJson(config);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function connectWallet(mnemonic: string): Promise<string> {
  try {
    globalThis.wallet = await LocalWallet.fromMnemonic(mnemonic, BECH32_PREFIX);
    globalThis.nobleWallet = await LocalWallet.fromMnemonic(mnemonic, NOBLE_BECH32_PREFIX);

    const { privateKey, publicKey } = deriveHDKeyFromMnemonic(mnemonic);
    globalThis.hdKey = {
      privateKey,
      publicKey,
    };

    try {
      await globalThis.nobleClient?.connect(globalThis.nobleWallet);
    } catch (e) {
      console.error('Failed to connect to noble validator');
    }

    const address = globalThis.wallet.address!;
    return encodeJson({ address });
  } catch (e) {
    return wrappedError(e);
  }
}

export async function connect(network: Network, mnemonic: string): Promise<string> {
  try {
    await connectClient(network);
    return connectWallet(mnemonic);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function deriveMnemomicFromEthereumSignature(signature: string): Promise<string> {
  try {
    const { mnemonic, privateKey, publicKey } = deriveHDKeyFromEthereumSignature(signature);
    const wallet = await LocalWallet.fromMnemonic(mnemonic, BECH32_PREFIX);
    globalThis.hdKey = {
      privateKey,
      publicKey,
    };
    const result = { mnemonic, address: wallet.address! };
    return new Promise((resolve) => {
      resolve(encodeJson(result));
    });
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getHeight(): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const block = await globalThis.client?.validatorClient.get.latestBlock();
    return encodeJson(block);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getFeeTiers(): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const feeTiers = await globalThis.client?.validatorClient.get.getFeeTiers();
    return encodeJson(feeTiers);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getUserFeeTier(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const json = JSON.parse(payload);
    const address = json.address;
    if (address === undefined) {
      throw new UserError('address is not set');
    }
    const feeTiers = await globalThis.client?.validatorClient.get.getUserFeeTier(address);
    return encodeJson(feeTiers);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getEquityTiers(): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const equityTiers =
      await globalThis.client?.validatorClient.get.getEquityTierLimitConfiguration();
    return encodeJson(equityTiers, ByteArrayEncoding.BIGINT);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getPerpetualMarkets(): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const markets = await globalThis.client?.indexerClient.markets.getPerpetualMarkets();
    return encodeJson(markets);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function isWalletConnected(): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    return await encodeJson( { "result": true } );
  } catch (e) {
    return wrappedError(e);
  }
}

export async function placeOrder(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const json = JSON.parse(payload);

    const subaccountNumber = json.subaccountNumber;
    if (subaccountNumber === undefined) {
      throw new UserError('subaccountNumber is not set');
    }
    const marketId = json.marketId;
    if (marketId === undefined) {
      throw new UserError('marketId is not set');
    }
    const type = json.type;
    if (type === undefined) {
      throw new UserError('type is not set');
    }
    const side = json.side;
    if (side === undefined) {
      throw new UserError('side is not set');
    }
    const price = json.price;
    if (price === undefined) {
      throw new UserError('price is not set');
    }
    // trigger_price: number,   // not used for MARKET and LIMIT
    const size = json.size;
    if (size === undefined) {
      throw new UserError('size is not set');
    }
    const clientId = json.clientId;
    if (clientId === undefined) {
      throw new UserError('clientId is not set');
    }
    const timeInForce = json.timeInForce;
    const goodTilTimeInSeconds = json.goodTilTimeInSeconds ?? 0;
    const goodTilBlock = json.goodTilBlock ?? undefined;
    const execution = json.execution;
    const postOnly = json.postOnly ?? false;
    const reduceOnly = json.reduceOnly ?? false;
    const triggerPrice = json.triggerPrice ?? undefined;

    const marketInfo = (json.marketInfo as MarketInfo) ?? undefined;
    const currentHeight = (json.currentHeight as number) ?? undefined;

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const tx = await client.placeOrder(
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
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export function wrappedError(error: Error): string {
  const text = JSON.stringify(error, Object.getOwnPropertyNames(error));
  return `{"error": ${text}}`;
}

export async function cancelOrder(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectNetwork() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const json = JSON.parse(payload);

    const subaccountNumber = json.subaccountNumber;
    if (subaccountNumber === undefined) {
      throw new UserError('subaccountNumber is not set');
    }
    const clientId = json.clientId;
    if (clientId === undefined) {
      throw new UserError('clientId is not set');
    }
    const orderFlags = json.orderFlags;
    if (orderFlags === undefined) {
      throw new UserError('orderFlags is not set');
    }
    const clobPairId = json.clobPairId;
    if (clobPairId === undefined) {
      throw new UserError('clobPairId is not set');
    }
    const goodTilBlock = json.goodTilBlock;
    const goodTilBlockTime = json.goodTilBlockTime;

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const tx = await client.cancelRawOrder(
      subaccount,
      clientId,
      orderFlags,
      clobPairId,
      goodTilBlock !== 0 ? goodTilBlock : undefined,
      goodTilBlockTime !== 0 ? goodTilBlockTime : undefined,
    );
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function deposit(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectNetwork() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }

    const json = JSON.parse(payload);
    const subaccountNumber = json.subaccountNumber;
    if (subaccountNumber === undefined) {
      throw new UserError('subaccountNumber is not set');
    }
    const amount = json.amount;
    if (amount === undefined) {
      throw new UserError('amount is not set');
    }

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const tx = await client.depositToSubaccount(subaccount, amount);
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function withdraw(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectNetwork() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }

    const json = JSON.parse(payload);
    const subaccountNumber = json.subaccountNumber;
    if (subaccountNumber === undefined) {
      throw new UserError('subaccountNumber is not set');
    }
    const amount = json.amount;
    if (amount === undefined) {
      throw new UserError('amount is not set');
    }

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const tx = await client.withdrawFromSubaccount(subaccount, amount, json.recipient, json.memo);
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function faucet(payload: string): Promise<string> {
  try {
    const faucetClient = globalThis.faucetClient;
    if (!faucetClient) {
      throw new UserError('faucetClient is not connected. Call connectNetwork() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }

    const json = JSON.parse(payload);
    const subaccountNumber = json.subaccountNumber;
    if (subaccountNumber === undefined) {
      throw new UserError('subaccountNumber is not set');
    }
    const amount = json.amount;
    if (amount === undefined) {
      throw new UserError('amount is not set');
    }

    const response = await faucetClient.fill(wallet.address!, subaccountNumber, amount);
    const sanitized: Response = {
      data: response.data,
      status: response.status,
      headers: response.headers,
    };

    return encodeJson(sanitized);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function withdrawToIBC(
  subaccountNumber: number,
  amount: string,
  payload: string,
): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }

    const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary');
    const decoded = decode(payload);

    const json: SquidIBCPayload = JSON.parse(decoded);

    const ibcMsg: MsgTransferEncodeObject = {
      typeUrl: json.msgTypeUrl, // '/ibc.applications.transfer.v1.MsgTransfer',
      value: {
        ...json.msg,
        // Squid returns timeoutTimestamp as Long, but the signer expects BigInt
        timeoutTimestamp: json.msg.timeoutTimestamp
          ? BigInt(Long.fromValue(json.msg.timeoutTimestamp).toString())
          : undefined,
      },
    };

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const subaccountMsg = client.withdrawFromSubaccountMessage(subaccount, amount);

    const msgs = [subaccountMsg, ibcMsg];
    const encodeObjects: Promise<EncodeObject[]> = new Promise((resolve) => resolve(msgs));

    const tx = await client.send(
      wallet,
      () => {
        return encodeObjects;
      },
      false,
      undefined,
      undefined,
    );
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function transferNativeToken(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }

    const json = JSON.parse(payload);
    const amount = json.amount;
    if (amount === undefined) {
      throw new UserError('amount is not set');
    }

    const msg: EncodeObject = client.sendTokenMessage(wallet, amount, json.recipient);
    const msgs = [msg];
    const encodeObjects: Promise<EncodeObject[]> = new Promise((resolve) => resolve(msgs));

    const tx = await client.send(
      wallet,
      () => {
        return encodeObjects;
      },
      false,
      client.validatorClient.post.defaultDydxGasPrice,
      json.memo,
    );
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function getAccountBalance(): Promise<String> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const address = globalThis.wallet.address!;

    const tx = await client.validatorClient.get.getAccountBalance(
      address,
      client.validatorClient.config.denoms.USDC_DENOM,
    );
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function getAccountBalances(): Promise<String> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const address = globalThis.wallet.address!;

    const tx = await client.validatorClient.get.getAccountBalances(address);
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function getUserStats(payload: string): Promise<String> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const json = JSON.parse(payload);
    const address = json.address;
    if (address === undefined) {
      throw new UserError('address is not set');
    }

    const tx = await client.validatorClient.get.getUserStats(address);
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function simulateDeposit(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const json = JSON.parse(payload);
    const subaccountNumber = json.subaccountNumber;
    if (subaccountNumber === undefined) {
      throw new UserError('subaccountNumber is not set');
    }
    const amount = json.amount;
    if (amount === undefined) {
      throw new UserError('amount is not set');
    }

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const msg: EncodeObject = client.depositToSubaccountMessage(subaccount, amount);
    const msgs: EncodeObject[] = [msg];
    const encodeObjects: Promise<EncodeObject[]> = new Promise((resolve) => resolve(msgs));

    const stdFee = await client.simulate(globalThis.wallet, () => {
      return encodeObjects;
    });
    return JSON.stringify(stdFee);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function simulateWithdraw(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const json = JSON.parse(payload);
    const subaccountNumber = json.subaccountNumber;
    if (subaccountNumber === undefined) {
      throw new UserError('subaccountNumber is not set');
    }
    const amount = json.amount;
    if (amount === undefined) {
      throw new UserError('amount is not set');
    }

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const msg: EncodeObject = client.withdrawFromSubaccountMessage(
      subaccount,
      amount,
      json.recipient,
    );
    const msgs: EncodeObject[] = [msg];
    const encodeObjects: Promise<EncodeObject[]> = new Promise((resolve) => resolve(msgs));

    const stdFee = await client.simulate(globalThis.wallet, () => {
      return encodeObjects;
    });
    return encodeJson(stdFee);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function simulateTransferNativeToken(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const json = JSON.parse(payload);
    const recipient = json.recipient;
    if (recipient === undefined) {
      throw new UserError('recipient is not set');
    }
    const amount = json.amount;
    if (amount === undefined) {
      throw new UserError('amount is not set');
    }

    const msg: EncodeObject = client.sendTokenMessage(wallet, amount, json.recipient);
    const msgs: EncodeObject[] = [msg];
    const encodeObjects: Promise<EncodeObject[]> = new Promise((resolve) => resolve(msgs));

    const stdFee = await client.simulate(
      globalThis.wallet,
      () => {
        return encodeObjects;
      },
      client.validatorClient.post.defaultDydxGasPrice,
    );
    return encodeJson(stdFee);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function signRawPlaceOrder(
  subaccountNumber: number,
  clientId: number,
  clobPairId: number,
  side: Order_Side,
  quantums: Long,
  subticks: Long,
  timeInForce: Order_TimeInForce,
  orderFlags: number,
  reduceOnly: boolean,
  goodTilBlock: number,
  goodTilBlockTime: number,
  clientMetadata: number,
): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }

    const msgs: Promise<EncodeObject[]> = new Promise((resolve) => {
      const msg = client.validatorClient.post.composer.composeMsgPlaceOrder(
        wallet.address!,
        subaccountNumber,
        clientId,
        clobPairId,
        orderFlags,
        goodTilBlock,
        goodTilBlockTime,
        side,
        quantums,
        subticks,
        timeInForce,
        reduceOnly,
        clientMetadata ?? 0,
      );
      resolve([msg]);
    });
    const signed = await client.sign(wallet, () => msgs, true);
    return Buffer.from(signed).toString('base64');
  } catch (error) {
    return wrappedError(error);
  }
}

export async function signPlaceOrder(
  subaccountNumber: number,
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
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const signed = await client.signPlaceOrder(
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
    );
    return signed;
  } catch (error) {
    return wrappedError(error);
  }
}

export async function signCancelOrder(
  subaccountNumber: number,
  clientId: number,
  orderFlags: OrderFlags,
  clobPairId: number,
  goodTilBlock: number,
  goodTilBlockTime: number,
): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const signed = await client.signCancelOrder(
      subaccount,
      clientId,
      orderFlags,
      clobPairId,
      goodTilBlock,
      goodTilBlockTime,
    );
    return signed;
  } catch (error) {
    return wrappedError(error);
  }
}

export async function encodeAccountRequestData(address: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const requestData: Uint8Array = Uint8Array.from(
        AuthModule.QueryAccountRequest.encode({ address }).finish(),
      );
      resolve(Buffer.from(requestData).toString('hex'));
    } catch (error) {
      reject(error);
    }
  });
}

export async function decodeAccountResponseValue(value: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const rawData = Buffer.from(value, 'base64');
      const rawAccount = AuthModule.QueryAccountResponse.decode(rawData).account;
      // The promise should have been rejected if the rawAccount was undefined.
      if (rawAccount === undefined) {
        throw Error('rawAccount is undefined');
      }
      const account = accountFromAny(rawAccount);
      resolve(encodeJson(account));
    } catch (error) {
      reject(error);
    }
  });
}

export async function getOptimalNode(endpointUrlsAsJson: string): Promise<string> {
  /*
    param:
      endpointUrlsAsJson:
      {
        "endpointUrls": [
          "https://rpc.testnet.near.org"
        ],
        "chainId": "testnet"
      }
  */
  try {
    const param = JSON.parse(endpointUrlsAsJson);
    const endpointUrls = param.endpointUrls;
    const chainId = param.chainId;
    const networkOptimizer = new NetworkOptimizer();
    const optimalUrl = await networkOptimizer.findOptimalNode(endpointUrls, chainId);
    const url = {
      url: optimalUrl,
    };
    return encodeJson(url);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function getOptimalIndexer(endpointUrlsAsJson: string): Promise<string> {
  /*
    param:
      endpointUrlsAsJson:
      {
        "endpointUrls": [
          "https://api.example.org"
        ]
      }
  */
  try {
    const param = JSON.parse(endpointUrlsAsJson);
    const endpointUrls = param.endpointUrls;
    const networkOptimizer = new NetworkOptimizer();
    const optimalUrl = await networkOptimizer.findOptimalIndexer(endpointUrls);
    const url = {
      url: optimalUrl,
    };
    return encodeJson(url);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function getRewardsParams(): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const rewardsParams = await globalThis.client?.validatorClient.get.getRewardsParams();
    return encodeJson(rewardsParams);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getDelegatorDelegations(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const json = JSON.parse(payload);
    const address = json.address;
    if (address === undefined) {
      throw new UserError('address is not set');
    }
    const delegations =
      await globalThis.client?.validatorClient.get.getDelegatorDelegations(address);
    return encodeJson(delegations);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getStakingRewards(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const json = JSON.parse(payload);
    const address = json.address;
    if (address === undefined) {
      throw new UserError('address is not set');
    }
    const delegations =
      await globalThis.client?.validatorClient.get.getDelegationTotalRewards(address);
    return encodeJson(delegations);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getCurrentUnstaking(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const json = JSON.parse(payload);
    const address = json.address;
    if (address === undefined) {
      throw new UserError('address is not set');
    }
    const delegations =
      await globalThis.client?.validatorClient.get.getDelegatorUnbondingDelegations(address);
    return encodeJson(delegations);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getMarketPrice(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const json = JSON.parse(payload);
    const marketId = json.marketId;
    if (marketId === undefined) {
      throw new UserError('marketId is not set');
    }
    const marketPrice = await client.validatorClient.get.getPrice(marketId);
    return encodeJson(marketPrice);
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getNobleBalance(): Promise<String> {
  try {
    const client = globalThis.nobleClient;
    if (client === undefined || !client.isConnected) {
      throw new UserError('client is not connected.');
    }
    const coin = await client.getAccountBalance('uusdc');
    return encodeJson(coin);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function sendNobleIBC(squidPayload: string): Promise<String> {
  try {
    const client = globalThis.nobleClient;
    if (client === undefined || !client.isConnected) {
      throw new UserError('client is not connected.');
    }

    const json: SquidIBCPayload = JSON.parse(squidPayload);

    const ibcMsg: MsgTransferEncodeObject = {
      typeUrl: json.msgTypeUrl,
      value: {
        ...json.msg,
        // Squid returns timeoutTimestamp as Long, but the signer expects BigInt
        timeoutTimestamp: json.msg.timeoutTimestamp
          ? BigInt(Long.fromValue(json.msg.timeoutTimestamp).toString())
          : undefined,
      },
    };
    const fee = await client.simulateTransaction([ibcMsg]);

    if (!ibcMsg.value.token) {
      throw new UserError('Payload missing token field');
    }

    // take out fee from amount before sweeping
    const amount =
      parseInt(ibcMsg.value.token.amount, 10) -
      Math.floor(parseInt(fee.amount[0].amount, 10) * GAS_MULTIPLIER);

    if (amount <= 0) {
      throw new UserError('noble balance does not cover fees');
    }

    ibcMsg.value.token = createCoin(amount.toString(), ibcMsg.value.token.denom);
    const tx = await client.IBCTransfer(ibcMsg);
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function withdrawToNobleIBC(payload: string): Promise<String> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const json = JSON.parse(payload);

    const { subaccountNumber, amount, ibcPayload } = json ?? {};

    const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary');
    const decoded = decode(ibcPayload);

    const parsedIbcPayload: SquidIBCPayload = JSON.parse(decoded);

    const msg = client.withdrawFromSubaccountMessage(
      new SubaccountInfo(wallet, subaccountNumber),
      parseFloat(amount).toFixed(client.validatorClient.config.denoms.USDC_DECIMALS),
    );
    const ibcMsg: MsgTransferEncodeObject = {
      typeUrl: parsedIbcPayload.msgTypeUrl,
      value: {
        ...parsedIbcPayload.msg,
        // Squid returns timeoutTimestamp as Long, but the signer expects BigInt
        timeoutTimestamp: parsedIbcPayload.msg.timeoutTimestamp
          ? BigInt(Long.fromValue(parsedIbcPayload.msg.timeoutTimestamp).toString())
          : undefined,
      },
    };

    const tx = await client.send(wallet, () => Promise.resolve([msg, ibcMsg]), false);

    return encodeJson({
      txHash: `0x${Buffer.from(tx?.hash).toString('hex')}`,
    });
  } catch (error) {
    return wrappedError(error);
  }
}

export async function cctpWithdraw(squidPayload: string): Promise<String> {
  try {
    const client = globalThis.nobleClient;
    if (client === undefined || !client.isConnected) {
      throw new UserError('client is not connected.');
    }

    const json = JSON.parse(squidPayload);

    const ibcMsg = {
      typeUrl: json.typeUrl, // '/circle.cctp.v1.MsgDepositForBurn',
      value: json.value,
    };
    const fee = await client.simulateTransaction([ibcMsg]);

    // take out fee from amount before sweeping
    const amount =
      parseInt(ibcMsg.value.amount, 10) -
      Math.floor(parseInt(fee.amount[0].amount, 10) * GAS_MULTIPLIER);

    if (amount <= 0) {
      throw new Error('noble balance does not cover fees');
    }

    ibcMsg.value.amount = amount.toString();

    const tx = await client.send([ibcMsg]);

    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}


export async function cctpMultiMsgWithdraw(cosmosPayload: string): Promise<string> {
  try {
    const client = globalThis.nobleClient;
    const messages: { typeUrl:string, value: { amount: string } }[] = JSON.parse(cosmosPayload)
    if (client === undefined || !client.isConnected) {
      throw new UserError('client is not connected.');
    }
    const ibcMsgs = messages.map(({ typeUrl, value }) => ({
      typeUrl, // '/circle.cctp.v1.MsgDepositForBurnWithCaller', '/cosmos.bank.v1beta1.MsgSend'
      value,
    }));

    const fee = await client.simulateTransaction(ibcMsgs);

    // take out fee from amount before sweeping
    const amount =
      parseInt(ibcMsgs[0].value.amount, 10) -
      Math.floor(parseInt(fee.amount[0].amount, 10) * GAS_MULTIPLIER);

    if (amount <= 0) {
      throw new Error('noble balance does not cover fees');
    }

    ibcMsgs[0].value.amount = amount.toString();

    const tx = await client.send(ibcMsgs);

    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error)
  }
}

export async function getWithdrawalCapacityByDenom(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const json = JSON.parse(payload);
    const denom = json.denom;
    if (denom === undefined) {
      throw new UserError('denom is not set');
    }

    const response = await client.validatorClient.get.getWithdrawalCapacityByDenom(denom);
    return encodeJson(response, ByteArrayEncoding.BIGINT);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function getWithdrawalAndTransferGatingStatus(perpetualId: number): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }

    const response = await client.validatorClient.get.getWithdrawalAndTransferGatingStatus(perpetualId);
    return encodeJson(response);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function subaccountTransfer(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectNetwork() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }

    const json = JSON.parse(payload);
    const subaccountNumber = json.subaccountNumber;
    if (subaccountNumber === undefined) {
      throw new UserError('subaccountNumber is not set');
    }
    const amount = json.amount;
    if (amount === undefined) {
      throw new UserError('amount is not set');
    }

    let destinationAddress = json.destinationAddress;
    if (destinationAddress === undefined) {
      destinationAddress = wallet.address!;
    }

    const destinationSubaccountNumber = json.destinationSubaccountNumber;
    if (destinationSubaccountNumber === undefined) {
      throw new UserError('destinationSubaccountNumber is not set');
    }

    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const tx = await client.transferToSubaccount(
      subaccount,
      destinationAddress,
      destinationSubaccountNumber,
      parseFloat(amount).toFixed(6),
      Method.BroadcastTxCommit,
    );
    return encodeJson(tx);
  } catch (error) {
    return wrappedError(error);
  }
}

export async function signCompliancePayload(payload: string): Promise<string> {
  try {
    const json = JSON.parse(payload);
    const message = json.message;
    if (message === undefined) {
      throw new UserError('message is not set');
    }
    const action = json.action;
    if (action === undefined) {
      throw new UserError('action is not set');
    }
    const currentStatus = json.status;
    if (currentStatus === undefined) {
      throw new UserError('status is not set');
    }
    if (!globalThis.hdKey?.privateKey || !globalThis.hdKey?.publicKey) {
      throw new Error('Missing hdKey');
    }

    const timestampInSeconds = Math.floor(Date.now() / 1000);
    const messageToSign: string = `${message}:${action}"${currentStatus ?? ''}:${timestampInSeconds}`;
    const messageHash = sha256(Buffer.from(messageToSign));

    const signed = await Secp256k1.createSignature(messageHash, globalThis.hdKey.privateKey);
    const signedMessage = signed.toFixedLength();

    return encodeJson({
      signedMessage: Buffer.from(signedMessage).toString('base64'),
      publicKey: Buffer.from(globalThis.hdKey.publicKey).toString('base64'),
      timestamp: timestampInSeconds,
    });
  } catch (error) {
    return wrappedError(error);
  }
}

export async function signPushNotificationTokenRegistrationPayload(payload: string): Promise<string> {
  try {
    const json = JSON.parse(payload);
    const message = json.message;
    if (message === undefined) {
      throw new UserError('message is not set');
    }
    if (!globalThis.hdKey?.privateKey || !globalThis.hdKey?.publicKey) {
      throw new Error('Missing hdKey');
    }

    const timestampInSeconds = Math.floor(Date.now() / 1000);
    const messageToSign: string = `${message}:REGISTER_TOKEN"${''}:${timestampInSeconds}`;
    const messageHash = sha256(Buffer.from(messageToSign));

    const signed = await Secp256k1.createSignature(messageHash, globalThis.hdKey.privateKey);
    const signedMessage = signed.toFixedLength();

    return encodeJson({
      signedMessage: Buffer.from(signedMessage).toString('base64'),
      publicKey: Buffer.from(globalThis.hdKey.publicKey).toString('base64'),
      timestamp: timestampInSeconds,
    });
  } catch (error) {
    return wrappedError(error);
  }
}

export async function setSelectedGasDenom(gasDenom: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    await client.setSelectedGasDenom(gasDenom as SelectedGasDenom);
    return encodeJson('success');
  } catch (error) {
    return wrappedError(error);
  }
}

export async function getMegavaultOwnerShares(payload: string): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const json = JSON.parse(payload);
    const address = json.address;
    if (address === undefined) {
      throw new UserError('address is not set');
    }
    const response =
      await globalThis.client?.validatorClient.get.getMegavaultOwnerShares(address);
    return encodeJson(parseToPrimitives(response));
  } catch (e) {
    return wrappedError(e);
  }
}

export async function getMegavaultWithdrawalInfo(
  sharesToWithdraw: bigint
): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectClient() first');
    }
    const response =
      await globalThis.client?.validatorClient.get.getMegavaultWithdrawalInfo(sharesToWithdraw);
      return encodeJson(parseToPrimitives(response));
  } catch (e) {
    return wrappedError(e);
  }
}

export async function depositToMegavault(
  subaccountNumber: number,
  amountUsdc: number
): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectNetwork() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const tx = await client.depositToMegavault(
      subaccount,
      amountUsdc,
      Method.BroadcastTxCommit,
    );
    return encodeJson(parseToPrimitives(tx));
  } catch (error) {
    return wrappedError(error);
  }
}

export async function withdrawFromMegavault(
  subaccountNumber: number,
  shares: number,
  minAmount: number,
): Promise<string> {
  try {
    const client = globalThis.client;
    if (client === undefined) {
      throw new UserError('client is not connected. Call connectNetwork() first');
    }
    const wallet = globalThis.wallet;
    if (wallet === undefined) {
      throw new UserError('wallet is not set. Call connectWallet() first');
    }
    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    const tx = await client.withdrawFromMegavault(
      subaccount,
      shares,
      minAmount,
      Method.BroadcastTxCommit,
    );
    return encodeJson(parseToPrimitives(tx));
  } catch (error) {
    return wrappedError(error);
  }
}