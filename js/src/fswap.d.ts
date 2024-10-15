/// <reference types="node" />
import Exchange from './abstract/fswap.js';
import { Balances, Currencies, Dict, Int, Market, Num, Order, OrderSide, OrderType, Str, Trade } from './base/types.js';
export default class fswap extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseSpecialSymbol(tokenId: string, tokenSymbol: string): string;
    mapAssetIdToSymbol(assetId: string): string;
    mapSymbolToAssetId(symbol: string): string;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrencies(assets: Dict): Currencies;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(outputs: Dict): Balances;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict): Order;
    parseOrderStatus(status: string): string;
    findSymbol(payAssetId: string, fillAssetId: string): string;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market: any): Trade;
    buildSafeTransactionRecipient(members: string[], threshold: number, amount: string): {
        members: string[];
        threshold: number;
        amount: string;
        mixAddress: string;
    };
    getPublicFromMainnetAddress(address: string): Uint8Array;
    buildMixAddress(ma: Dict): string;
    getUnspentOutputsForRecipients(outputs: Dict[], rs: Dict[]): {
        utxos: any[];
        change: string;
    };
    buildSafeTransaction(utxos: Dict[], rs: Dict[], gs: Dict[], extra: string): Dict;
    convertTxToHex(tx: Dict): string;
    convertHexToTx(hex: string): Dict;
    getSafeTx(asset_id: string, amount: string, memo: string): Promise<string>;
    getSafeTxRaw(hexTx: string, signaturesMap?: Dict[]): Promise<string>;
    verifySafeTx(hexTx: string): Promise<{
        verifiedTx: any;
        request_id: string;
    }>;
    signSafeTx(tx: Dict, views: string[], privateKey: string): Promise<string>;
    sendSafeTx(signedRaw: string, request_id: string): Promise<any>;
    ed(): {
        scalar: Readonly<import("./static_dependencies/noble-curves/abstract/modular.js").Field<bigint> & Required<Pick<import("./static_dependencies/noble-curves/abstract/modular.js").Field<bigint>, "isOdd">>>;
        setBytesWithClamping: (x: Buffer) => bigint;
        setCanonicalBytes: (x: Buffer) => bigint;
        'scalar.add': (lhs: bigint, rhs: bigint) => bigint;
        'scalar.toBytes': (num: bigint) => Uint8Array;
        setUniformBytes: (x: Buffer) => bigint;
        scalarBaseMult: (x: bigint) => Buffer;
        publicFromPrivate: (priv: Buffer) => Buffer;
        sign: (msg: Buffer, key: Buffer) => Buffer;
    };
    safeTransfer(asset_id: string, amount: string, memo: string): Promise<any>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    base64RawURLEncode(raw: Buffer | Uint8Array | string): string;
    signToken(payload: Object, private_key: string): string;
    signAuthenticationToken(methodRaw: string, uri: string, params?: {}, requestID?: string): string;
}
