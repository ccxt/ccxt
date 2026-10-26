// ---------------------------------------------------------------------------

import { Exchange } from './base/Exchange.js';
import { Precise } from './base/Precise.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, ExchangeError, InsufficientFunds, InvalidOrder, NotSupported, OrderNotFound } from './base/errors.js';
import { TICK_SIZE, TRUNCATE } from './base/functions/number.js';
import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Balances, Dict, Int, Market, Num, Order, OrderSide, OrderType, Position, Str, Strings, Ticker } from './base/types.js';

/**
 * @class flyingtulip
 * @augments Exchange
 * Financed ERC-20 exposure in a cross-margin account, without a perpetual
 * futures funding contract. One adapter instance is scoped to one chain.
 */
export default class flyingtulip extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'flyingtulip',
            'name': 'Flying Tulip',
            'countries': [],
            'rateLimit': 200,
            'dex': true,
            'version': 'v2',
            'has': {
                'CORS': true,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchBalance': true,
                'fetchPositions': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'createOrder': true,
                'createMarketBuyOrderWithCost': true,
                'cancelOrder': true,
                'closePosition': true,
                'fetchOrderBook': false,
                'fetchFundingRate': false,
                'setLeverage': false,
                'setMarginMode': false,
                'withdraw': false,
                'transfer': false,
            },
            'urls': {
                'api': { 'public': 'https://api.flyingtulip.com' },
                'www': 'https://flyingtulip.com',
                'doc': 'https://api.flyingtulip.com',
            },
            'api': {
                'public': {
                    'get': {
                        'mm/spot/markets-v2': 1,
                        'spot/leverage/assets': 1,
                        'mm/lend': 1,
                        'mm/spot/account/positions': 1,
                        'mm/leverage/config': 1,
                        'mm/leverage/fee-estimate': 1,
                        'mm/leverage/orders': 1,
                        'mm/leverage/orders/{id}': 1,
                    },
                    'post': { 'mm/leverage/quote': 1, 'mm/leverage/orders': 1 },
                    'delete': { 'mm/leverage/orders/{id}': 1 },
                },
            },
            'requiredCredentials': { 'apiKey': false, 'secret': false },
            'precisionMode': TICK_SIZE,
            'options': {
                'chainId': 146,
                'slippageBps': 100,
                'validitySeconds': 3600,
                'feeBps': 5,
                'positionManagers': {
                    '146': '0xbe4050a73a7Fb384c65E885a15C33461A4B20055',
                    '1': '0xbe4050a73a7Fb384c65E885a15C33461A4B20055',
                    '56': '0xB36d39C72d66153B7f32E1320BEe3280657353Bd',
                },
            },
        });
    }

    chainId (params: Dict = {}): number {
        const configured = this.safeInteger (this.options, 'chainId', 146);
        const requested = this.safeInteger (params, 'chainId', configured);
        if (requested !== configured) {
            throw new BadRequest (this.id + ' use a separate instance for a different chainId');
        }
        return configured;
    }

    accountAddress (params: Dict = {}): string {
        const address = this.safeString (params, 'address', this.walletAddress);
        if ((address === undefined) || !this.isAddress (address)) {
            throw new ArgumentsRequired (this.id + ' requires walletAddress or params.address');
        }
        return address;
    }

    isAddress (value: string): boolean {
        return /^0x[0-9a-fA-F]{40}$/.test (value);
    }

    async apiCall (path: string, method = 'GET', params: Dict = {}): Promise<any> {
        return await this.request (path, [ 'public' ], method, params);
    }

    unwrap (response: any): any {
        if (response === null) {
            return [];
        }
        if (this.safeValue (response, 'success') === false) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return this.safeValue (response, 'data', response);
    }

    async configuration (): Promise<Dict> {
        const config = await this.apiCall ('mm/leverage/config', 'GET', { 'chainId': this.chainId () });
        if ((this.safeInteger (config, 'chainId') !== this.chainId ()) || (this.safeInteger (config, 'signingChainId') !== this.chainId ())) {
            throw new ExchangeError (this.id + ' configuration chain mismatch');
        }
        const version = this.safeInteger (config, 'engineVersion', 1);
        if ((version !== 1) && (version !== 2)) {
            throw new NotSupported (this.id + ' unsupported engineVersion');
        }
        return config;
    }

    async registry (address: Str = undefined): Promise<any[]> {
        const request: Dict = { 'chainId': this.chainId () };
        if (address !== undefined) {
            request['address'] = address;
        }
        const response = await this.apiCall ('spot/leverage/assets', 'GET', request);
        return this.unwrap (response);
    }

    async lendAccount (address: string): Promise<Dict> {
        const response = await this.apiCall ('mm/lend', 'GET', { 'chainId': this.chainId (), 'address': address });
        const data = this.unwrap (response);
        if (this.safeBool (data, 'stale', false)) {
            throw new ExchangeError (this.id + ' lending snapshot is stale; refresh before trading');
        }
        const chains = this.safeList (data, 'chains', []);
        for (let i = 0; i < chains.length; i++) {
            if (this.safeInteger (chains[i], 'chainId') === this.chainId ()) {
                return chains[i];
            }
        }
        throw new ExchangeError (this.id + ' lending snapshot does not include the configured chain');
    }

    findAsset (assets: any[], id: string): Dict {
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const address = this.safeString2 (asset, 'address', 'contractAddress', '');
            const symbol = this.safeString (asset, 'symbol', '');
            if ((address.toLowerCase () === id.toLowerCase ()) || (symbol.toLowerCase () === id.toLowerCase ())) {
                return asset;
            }
        }
        throw new BadRequest (this.id + ' unknown asset ' + id + ' on chain ' + this.chainId ().toString ());
    }

    assetAddress (asset: Dict): string {
        return this.safeString2 (asset, 'address', 'contractAddress', '');
    }

    assetDecimals (asset: Dict): number {
        const token = this.safeDict (asset, 'tokenData', {});
        const decimals = this.safeInteger (asset, 'decimals', this.safeInteger (token, 'decimals'));
        if ((decimals === undefined) || (decimals < 0) || (decimals > 36)) {
            throw new ExchangeError (this.id + ' invalid token decimals');
        }
        return decimals;
    }

    rawAmount (amount: string, decimals: number): string {
        if (!/^[0-9]+(\.[0-9]+)?$/.test (amount) || !Precise.stringGt (amount, '0')) {
            throw new InvalidOrder (this.id + ' amount must be a positive decimal string');
        }
        const scale = '1' + '0'.repeat (decimals);
        const raw = Precise.stringMul (amount, scale);
        const integer = this.decimalToPrecision (raw, TRUNCATE, 0);
        if (!Precise.stringEq (raw, integer)) {
            throw new InvalidOrder (this.id + ' amount exceeds token precision');
        }
        if (Precise.stringGt (integer, '115792089237316195423570985008687907853269984665640564039457584007913129639935')) {
            throw new InvalidOrder (this.id + ' amount exceeds uint256');
        }
        return integer;
    }

    ceilRaw (raw: string): string {
        const floor = this.decimalToPrecision (raw, TRUNCATE, 0);
        return Precise.stringEq (raw, floor) ? floor : Precise.stringAdd (floor, '1') as string;
    }

    humanAmount (raw: string, decimals: number): string {
        return Precise.stringDiv (raw, '1' + '0'.repeat (decimals), 36) as string;
    }

    async marketRows (params: Dict = {}): Promise<any[]> {
        const response = await this.apiCall ('mm/spot/markets-v2', 'GET', this.extend (this.omit (params, 'chainId'), { 'chainId': this.chainId (params) }));
        return this.unwrap (response);
    }

    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        this.chainId (params);
        const assets = await this.registry ();
        const rows = await this.marketRows (params);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if ((this.safeString (row, 'marketType') !== 'perps') || (this.safeInteger (row, 'chainId') !== this.chainId ())) {
                continue;
            }
            const baseAsset = this.findAsset (assets, this.safeString (row, 'baseTokenAddress', ''));
            const quoteAsset = this.findAsset (assets, this.safeString (row, 'quoteTokenAddress', ''));
            const base = this.safeCurrencyCode (this.safeString (row, 'baseToken'));
            const quote = this.safeCurrencyCode (this.safeString (row, 'quoteToken'));
            result.push (this.safeMarketStructure ({
                'id': this.safeString (row, 'symbol'),
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': this.assetAddress (baseAsset),
                'quoteId': this.assetAddress (quoteAsset),
                'type': 'spot',
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'contract': false,
                'active': this.safeBool (row, 'canOpenLong', false) || this.safeBool (row, 'canOpenShort', false),
                'precision': { 'amount': this.parseNumber ('1e-' + this.assetDecimals (baseAsset).toString ()), 'price': 1e-18 },
                'limits': { 'leverage': { 'min': 1, 'max': this.safeNumber (row, 'maxLeverage') } },
                'info': this.extend (row, { 'baseDecimals': this.assetDecimals (baseAsset), 'quoteDecimals': this.assetDecimals (quoteAsset) }),
            }));
        }
        return result;
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        return this.safeTicker ({
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': undefined,
            'datetime': undefined,
            'last': this.safeNumber (ticker, 'lastPrice'),
            'high': this.safeNumber (ticker, 'high24h'),
            'low': this.safeNumber (ticker, 'low24h'),
            'change': this.safeNumber (ticker, 'priceChange24h'),
            'percentage': this.safeNumber (ticker, 'priceChangePct24h'),
            'quoteVolume': this.safeNumber (ticker, 'volume24h'),
            'info': ticker,
        }, market);
    }

    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Dict> {
        await this.loadMarkets ();
        const rows = await this.marketRows (params);
        const result: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (this.safeString (row, 'marketType') === 'perps') {
                const market = this.safeMarket (this.safeString (row, 'symbol'));
                result[market['symbol']] = this.parseTicker (row, market);
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        this.chainId (params);
        const address = this.accountAddress (params);
        const type = this.safeString (params, 'type', 'margin');
        const result: Dict = { 'info': undefined };
        if (type === 'spot') {
            const rows = await this.registry (address);
            result['info'] = rows;
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const code = this.safeCurrencyCode (this.safeString (row, 'symbol')) as string;
                if (this.safeBool (row, 'userBalanceUnavailable', false)) {
                    result[code] = this.account ();
                } else {
                    result[code] = { 'free': this.humanAmount (this.safeString (row, 'userBalanceRaw', '0'), this.assetDecimals (row)), 'used': '0' };
                }
            }
        } else if (type === 'margin') {
            const chain = await this.lendAccount (address);
            result['info'] = chain;
            const assets = this.safeList (chain, 'assets', []);
            for (let i = 0; i < assets.length; i++) {
                const asset = assets[i];
                const metrics = this.safeDict (asset, 'userMetrics', {});
                const code = this.safeCurrencyCode (this.safeString (asset, 'symbol')) as string;
                const decimals = this.assetDecimals (asset);
                const totalRaw = this.safeString (metrics, 'totalCollateralRaw');
                const availableRaw = this.safeString (metrics, 'totalWithdrawableRaw');
                const account = this.account ();
                if ((totalRaw !== undefined) && (totalRaw !== '') && (availableRaw !== undefined) && (availableRaw !== '')) {
                    account['total'] = this.humanAmount (totalRaw, decimals);
                    account['free'] = this.humanAmount (availableRaw, decimals);
                    account['used'] = Precise.stringSub (account['total'], account['free']);
                }
                result[code] = account;
            }
        } else {
            throw new NotSupported (this.id + ' fetchBalance type must be spot or margin');
        }
        return this.safeBalance (result);
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        market = this.safeMarket (this.safeString (position, 'symbol'), market);
        return this.safePosition ({
            'id': this.safeString (position, 'positionId'),
            'symbol': market['symbol'],
            'side': this.safeString (position, 'side'),
            'contracts': this.safeNumber (position, 'size'),
            'contractSize': 1,
            'entryPrice': this.safeNumber (position, 'entryPrice'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'unrealizedPnl': this.safeNumber (position, 'pnlAmount'),
            'leverage': this.safeNumber (position, 'blendedLeverage'),
            'marginMode': 'cross',
            'info': position,
        });
    }

    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const response = await this.apiCall ('mm/spot/account/positions', 'GET', { 'chainId': this.chainId (params), 'address': this.accountAddress (params) });
        const rows = this.unwrap (response);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            if (!this.safeBool (rows[i], 'isPending', false)) {
                result.push (this.parsePosition (rows[i]));
            }
        }
        return this.filterByArrayPositions (result, 'symbol', symbols);
    }

    orderStatus (status: Str): Str {
        return this.safeString ({
            'pending': 'open', 'processing': 'open', 'claimed': 'open',
            'broadcasting': 'open', 'pending_trigger': 'open',
            'pending_liquidity': 'open', 'blocked': 'open',
            'filled': 'closed', 'failed': 'rejected',
            'cancelled': 'canceled', 'canceled': 'canceled', 'expired': 'expired',
        }, status, status);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        const rawMarket = this.safeString2 (order, 'marketSymbol', 'symbol');
        if (rawMarket !== undefined) {
            market = this.safeMarket (rawMarket, market);
        }
        const timestamp = this.safeTimestamp (order, 'createdAt');
        // Display size and limitPrice are client metadata, never executed fills.
        // The executor does not publish a realized base quantity or fill price.
        return this.safeOrder ({
            'id': this.safeString2 (order, 'id', 'orderId'),
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': this.orderStatus (this.safeString (order, 'status')),
            'type': this.safeString2 (order, 'clientOrderType', 'orderType'),
            'side': this.safeString (order, 'direction'),
            'amount': this.safeNumber2 (order, 'size', 'amount'),
            'price': this.safeNumber2 (order, 'limitPrice', 'price'),
            'info': order,
        }, market);
    }

    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const response = await this.apiCall ('mm/leverage/orders/{id}', 'GET', { 'id': id, 'chainId': this.chainId (params) });
        const row = response;
        if (this.safeString2 (row, 'id', 'orderId') === undefined) {
            throw new OrderNotFound (this.id + ' order not found ' + id);
        }
        return this.parseOrder (row, (symbol === undefined) ? undefined : this.market (symbol));
    }

    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request = { 'chainId': this.chainId (params), 'user': this.accountAddress (params), 'limit': (limit === undefined) ? 100 : Math.min (limit, 500), 'offset': this.safeInteger (params, 'offset', 0), 'status': this.safeString (params, 'status') };
        const response = await this.apiCall ('mm/leverage/orders', 'GET', request);
        const rows = this.safeList (response, 'orders', []);
        return this.parseOrders (rows, (symbol === undefined) ? undefined : this.market (symbol), since, limit);
    }

    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        return this.filterBySinceLimit (this.filterBy (orders, 'status', 'open'), since, limit);
    }

    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        return this.filterBySinceLimit (this.filterBy (orders, 'status', 'closed'), since, limit);
    }

    fee (sellAmount: string, bps = 5): string {
        const calculated = this.decimalToPrecision (Precise.stringDiv (Precise.stringMul (sellAmount, bps.toString ()), '10000'), TRUNCATE, 0);
        return Precise.stringMax (calculated, '1') as string;
    }

    async orderFee (sellAmount: string, token: string, action: string, session = false): Promise<string> {
        let fee = this.fee (sellAmount, this.safeInteger (this.options, 'feeBps', 5));
        if (!session) {
            const estimate = await this.apiCall ('mm/leverage/fee-estimate', 'GET', { 'chainId': this.chainId (), 'sellToken': token, 'action': action });
            const gas = this.safeString (estimate, 'feeAmount');
            if (!this.safeBool (estimate, 'success', false) || (gas === undefined) || !/^[0-9]+$/.test (gas)) {
                throw new ExchangeError (this.id + ' execution fee unavailable');
            }
            fee = Precise.stringMax (fee, gas) as string;
        }
        return fee;
    }

    async quote (sellToken: string, buyToken: string, sellAmount: string, feeAmount: string, action: string, slippageBps: number): Promise<Dict> {
        if ((slippageBps < 0) || (slippageBps >= 10000) || (Math.floor (slippageBps) !== slippageBps)) {
            throw new InvalidOrder (this.id + ' slippageBps must be an integer in [0, 10000)');
        }
        const response = await this.apiCall ('mm/leverage/quote', 'POST', {
            'chainId': this.chainId (), 'sellToken': sellToken, 'buyToken': buyToken,
            'sellAmount': sellAmount, 'feeAmount': feeAmount, 'action': action, 'slippageBps': slippageBps,
        });
        const minimum = this.safeString (response, 'buyAmount');
        if (!this.safeBool (response, 'success', false) || (minimum === undefined) || !/^[0-9]+$/.test (minimum) || !Precise.stringGt (minimum, '0')) {
            throw new ExchangeError (this.id + ' no aggregate quote available');
        }
        return response;
    }

    orderTypedData (config: Dict, order: Dict): Dict {
        const fields = [
            { 'name': 'action', 'type': 'uint8' }, { 'name': 'user', 'type': 'address' },
            { 'name': 'sellToken', 'type': 'address' }, { 'name': 'buyToken', 'type': 'address' },
            { 'name': 'sellAmount', 'type': 'uint256' }, { 'name': 'buyAmount', 'type': 'uint256' },
            { 'name': 'validTo', 'type': 'uint32' }, { 'name': 'feeAmount', 'type': 'uint256' },
        ];
        if (this.safeInteger (config, 'engineVersion', 1) === 2) {
            fields.push ({ 'name': 'partiallyFillable', 'type': 'bool' });
        }
        return {
            'domain': { 'name': 'LeverageRfqEngine', 'version': '1', 'chainId': this.safeInteger (config, 'signingChainId'), 'verifyingContract': this.safeString (config, 'leverageRfqEngine') },
            'types': { 'LeveragedOrder': fields }, 'primaryType': 'LeveragedOrder', 'message': order,
        };
    }

    signTypedData (typed: Dict): string {
        if (this.privateKey === undefined) {
            throw new AuthenticationError (this.id + ' requires privateKey or a signature over the prepared order');
        }
        const encoded = this.ethEncodeStructuredData (typed['domain'], typed['types'], typed['message']);
        const digest = this.hash (encoded, keccak, 'hex');
        const signature = ecdsa (digest, this.privateKey.slice (-64), secp256k1, null);
        return '0x' + signature['r'] + signature['s'] + this.intToBase16 (this.sum (signature['v'], 27));
    }

    checkOrderOptions (type: string, side: string, params: Dict): void {
        if ((type !== 'market') && (type !== 'limit')) {
            throw new NotSupported (this.id + ' supports market and limit orders');
        }
        if ((side !== 'buy') && (side !== 'sell')) {
            throw new InvalidOrder (this.id + ' side must be buy or sell');
        }
        const unsupported = [ 'postOnly', 'stopLossPrice', 'takeProfitPrice', 'triggerPrice', 'trailingPercent', 'hedged', 'clientOrderId', 'timeInForce', 'partiallyFillable' ];
        for (let i = 0; i < unsupported.length; i++) {
            if (params[unsupported[i]] !== undefined) {
                throw new NotSupported (this.id + ' unsupported order option ' + unsupported[i]);
            }
        }
        if (this.safeBool (params, 'reduceOnly', false)) {
            throw new NotSupported (this.id + ' use closePosition for a debt-aware close');
        }
    }

    /** Prepare immutable signed terms without signing or submitting. */
    async prepareLeverageOrder (symbol: string, type: OrderType, side: OrderSide, amount: Num, price: Num = undefined, params: Dict = {}): Promise<Dict> {
        this.checkOrderOptions (type, side, params);
        this.chainId (params);
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!this.safeBool (market['info'], (side === 'buy') ? 'canOpenLong' : 'canOpenShort', false)) {
            throw new InvalidOrder (this.id + ' market does not permit opening this side');
        }
        const config = await this.configuration ();
        const address = this.accountAddress (params);
        const chain = await this.lendAccount (address);
        const assets = this.safeList (chain, 'assets', []);
        const collateralId = this.safeString (params, 'collateral');
        if (collateralId === undefined) {
            throw new ArgumentsRequired (this.id + ' requires params.collateral (symbol or token address)');
        }
        const collateral = this.findAsset (assets, collateralId);
        if (!this.safeBool (collateral, 'isCollateral', false)) {
            throw new InvalidOrder (this.id + ' selected asset is not valid collateral');
        }
        const metrics = this.safeDict (collateral, 'userMetrics', {});
        const marginRaw = this.safeString (metrics, 'totalCollateralRaw', '0');
        if (!Precise.stringGt (marginRaw, '0')) {
            throw new InsufficientFunds (this.id + ' deposit collateral before opening exposure');
        }
        const debtId = this.safeString (params, 'debtToken', (side === 'buy') ? market['quoteId'] : market['baseId']) as string;
        let debt = this.findAsset (assets, debtId);
        if ((side === 'buy') && (params['debtToken'] === undefined) && (!this.safeBool (debt, 'isBorrowable', false) || ((this.safeString (debt, 'symbol', '').toLowerCase () === 'ftusd') && (this.safeInteger (config, 'engineVersion', 1) !== 2)))) {
            debt = this.findAsset (assets, 'USDC');
        }
        if (!this.safeBool (debt, 'isBorrowable', false) || (this.safeValue (debt, 'priceAvailable') === false)) {
            throw new InvalidOrder (this.id + ' debt token is not borrowable');
        }
        if ((side === 'sell') && (this.assetAddress (debt).toLowerCase () !== (market['baseId'] as string).toLowerCase ())) {
            throw new InvalidOrder (this.id + ' a short borrows the base asset');
        }
        const fundingId = this.safeString (params, 'fundingToken', market['quoteId']) as string;
        const bought = this.findAsset (assets, ((side === 'buy') ? market['baseId'] : fundingId) as string);
        const debtPrice = this.safeString2 (debt, 'oracleTokenPrice', 'tokenprice');
        const quoteAsset = this.findAsset (assets, market['quoteId'] as string);
        const quotePrice = this.safeString2 (quoteAsset, 'oracleTokenPrice', 'tokenprice');
        const boughtPrice = this.safeString2 (bought, 'oracleTokenPrice', 'tokenprice');
        if (!Precise.stringGt (debtPrice, '0') || !Precise.stringGt (quotePrice, '0') || !Precise.stringGt (boughtPrice, '0')) {
            throw new ExchangeError (this.id + ' oracle prices unavailable');
        }
        if ((type === 'limit') && ((price === undefined) || !Precise.stringGt (this.numberToString (price), '0'))) {
            throw new ArgumentsRequired (this.id + ' limit order requires a positive price');
        }
        const amountString = (amount === undefined) ? undefined : this.numberToString (amount);
        let sellHuman: string;
        if (side === 'sell') {
            if (amountString === undefined) {
                throw new ArgumentsRequired (this.id + ' short requires a base amount');
            }
            sellHuman = amountString;
        } else {
            const cost = this.safeString (params, 'cost');
            if ((cost === undefined) && (type === 'market')) {
                throw new ArgumentsRequired (this.id + ' market buy requires params.cost in market quote units');
            }
            if ((cost === undefined) && (amountString === undefined)) {
                throw new ArgumentsRequired (this.id + ' limit buy requires amount');
            }
            const quoteCost = (cost === undefined) ? Precise.stringMul (amountString, this.numberToString (price)) : cost;
            const debtCost = Precise.stringDiv (Precise.stringMul (quoteCost, quotePrice), debtPrice, this.assetDecimals (debt));
            sellHuman = debtCost as string;
        }
        const sellRaw = this.rawAmount (sellHuman, this.assetDecimals (debt));
        const sellToken = this.assetAddress (debt);
        const buyToken = this.assetAddress (bought);
        if (sellToken.toLowerCase () === buyToken.toLowerCase ()) {
            throw new InvalidOrder (this.id + ' debt and exposure tokens must differ');
        }
        const feeAmount = await this.orderFee (sellRaw, sellToken, 'open');
        const liquidity = this.safeDict (debt, 'globalMetrics', {});
        const available = this.safeString (liquidity, 'availableToBorrow');
        const grossHuman = this.humanAmount (Precise.stringAdd (sellRaw, feeAmount) as string, this.assetDecimals (debt));
        if ((available === undefined) || Precise.stringGt (grossHuman, Precise.stringMul (available, '0.95'))) {
            throw new InsufficientFunds (this.id + ' insufficient borrow liquidity for debt and fees');
        }
        const slippageBps = this.safeInteger (params, 'slippageBps', this.safeInteger (this.options, 'slippageBps', 100));
        const quote = await this.quote (sellToken, buyToken, sellRaw, feeAmount, 'open', slippageBps);
        let buyAmount = this.safeString (quote, 'buyAmount');
        if (type === 'limit') {
            if (side === 'buy') {
                buyAmount = this.rawAmount (amountString as string, this.assetDecimals (bought));
            } else {
                const quoteMinimum = Precise.stringMul (sellHuman, this.numberToString (price));
                const boughtMinimum = Precise.stringDiv (Precise.stringMul (quoteMinimum, quotePrice), boughtPrice, 80);
                // Round the minimum UP: truncating a price floor weakens signed terms.
                const rawMinimum = Precise.stringMul (boughtMinimum, '1' + '0'.repeat (this.assetDecimals (bought)));
                buyAmount = this.ceilRaw (rawMinimum as string);
            }
        } else if ((amountString !== undefined) && (side === 'buy')) {
            buyAmount = Precise.stringMax (buyAmount, this.rawAmount (amountString as string, this.assetDecimals (bought)));
        }
        this.checkAccountRisk (chain, assets, debt, bought, sellRaw, buyAmount as string, feeAmount, config);
        const leverage = this.safeString (params, 'leverage', '1');
        const maximum = this.safeString (market['info'], 'maxLeverage');
        if (!Precise.stringGt (leverage, '0') || Precise.stringLt (leverage, '1') || ((maximum !== undefined) && Precise.stringGt (leverage, maximum))) {
            throw new InvalidOrder (this.id + ' leverage exceeds market bounds');
        }
        const validTo = this.safeInteger (params, 'validTo', this.seconds () + this.safeInteger (this.options, 'validitySeconds', 3600));
        if ((validTo <= this.seconds ()) || (validTo > 4294967295)) {
            throw new InvalidOrder (this.id + ' validTo must be a future uint32 timestamp');
        }
        const order: Dict = { 'action': 0, 'user': address, 'sellToken': sellToken, 'buyToken': buyToken, 'sellAmount': sellRaw, 'buyAmount': buyAmount, 'validTo': validTo, 'feeAmount': feeAmount };
        if (this.safeInteger (config, 'engineVersion', 1) === 2) {
            order['partiallyFillable'] = false;
        }
        const request: Dict = {
            'order': order, 'user': address, 'isOpen': true, 'orderType': 'open',
            'marketSymbol': market['id'], 'direction': side,
            'size': (amountString === undefined) ? this.humanAmount (buyAmount as string, this.assetDecimals (bought)) : amountString, 'clientOrderType': type,
            'limitPrice': (type === 'limit') ? this.numberToString (price) : undefined,
            'collateral': this.safeString (collateral, 'symbol'), 'source': 'trs',
        };
        if (type === 'limit') {
            // Oracle triggers are an optimization only; buyAmount remains the
            // exact signed limit even when a route gets better execution.
            request['triggerPrice'] = Precise.stringMul (this.numberToString (price), quotePrice);
            request['triggerSide'] = (side === 'buy') ? 'below' : 'above';
            request['triggerAsset'] = market['baseId'];
        }
        return { 'request': request, 'typedData': this.orderTypedData (config, order), 'quote': quote, 'leverage': leverage, 'approvals': this.engineApprovals (order, config) };
    }

    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: Num, price: Num = undefined, params: Dict = {}): Promise<Order> {
        const prepared = await this.prepareLeverageOrder (symbol, type, side, amount, price, params);
        const request = this.safeDict (prepared, 'request', {});
        const owner = this.accountAddress (params);
        const supplied = this.safeString (params, 'ownerSignature');
        if (supplied === undefined) {
            if ((this.privateKey === undefined) || (this.ethGetAddressFromPrivateKey (this.privateKey).toLowerCase () !== owner.toLowerCase ())) {
                throw new AuthenticationError (this.id + ' privateKey must belong to the order owner');
            }
            request['ownerSignature'] = this.signTypedData (this.safeDict (prepared, 'typedData', {}));
            request['sigType'] = 'eip712';
        } else {
            throw new NotSupported (this.id + ' use submitLeverageOrder with a previously prepared payload for external signing');
        }
        const response = await this.apiCall ('mm/leverage/orders', 'POST', this.extend (request, { 'chainId': this.chainId () }));
        return this.parseOrder (this.extend (request, response), this.market (symbol));
    }

    /** Submit the exact payload returned by prepareLeverageOrder, after external signing. */
    async submitLeverageOrder (prepared: Dict, ownerSignature: string, sigType = 'erc1271'): Promise<Order> {
        if ((sigType !== 'eip712') && (sigType !== 'erc1271')) {
            throw new NotSupported (this.id + ' external signing supports eip712 or erc1271');
        }
        const request = this.safeDict (prepared, 'request', {});
        const order = this.safeDict (request, 'order', {});
        if (this.safeInteger (order, 'validTo', 0) <= this.seconds ()) {
            throw new InvalidOrder (this.id + ' prepared order has expired');
        }
        const config = await this.configuration ();
        const expected = this.orderTypedData (config, order);
        if (this.json (expected) !== this.json (this.safeDict (prepared, 'typedData', {}))) {
            throw new InvalidOrder (this.id + ' prepared payload or signing configuration changed');
        }
        const response = await this.apiCall ('mm/leverage/orders', 'POST', this.extend (request, { 'ownerSignature': ownerSignature, 'sigType': sigType, 'chainId': this.chainId () }));
        return this.parseOrder (this.extend (request, response));
    }

    override async createMarketBuyOrderWithCost (symbol: string, cost: number, params: Dict = {}): Promise<Order> {
        return await this.createOrder (symbol, 'market', 'buy', undefined, undefined, this.extend (params, { 'cost': this.numberToString (cost) }));
    }

    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        this.chainId (params);
        const config = await this.configuration ();
        const deadline = this.seconds () + 300;
        const typed = {
            'domain': { 'name': this.safeString (config, 'sessionManagerDomainName'), 'version': '1', 'chainId': this.safeInteger (config, 'signingChainId'), 'verifyingContract': this.safeString (config, 'sessionManager') },
            'types': { 'CancelOrder': [ { 'name': 'orderId', 'type': 'string' }, { 'name': 'deadline', 'type': 'uint256' } ] },
            'message': { 'orderId': id, 'deadline': deadline },
        };
        const signature = this.signTypedData (typed);
        const response = await this.apiCall ('mm/leverage/orders/{id}', 'DELETE', { 'id': id, 'chainId': this.chainId (), 'cancelSignature': signature, 'deadline': deadline, 'sessionId': this.safeString (params, 'sessionId') });
        return this.parseOrder (this.extend (response, { 'id': id, 'status': 'cancelled' }), (symbol === undefined) ? undefined : this.market (symbol));
    }

    checkAccountRisk (chain: Dict, assets: any[], debt: Dict, bought: Dict, sellRaw: string, buyRaw: string, feeRaw: string, config: Dict): void {
        const user = this.safeDict (chain, 'userMetrics', {});
        const equity = this.safeString (user, 'equityUsd');
        const minEquity = this.safeString (chain, 'minEquityRequirementUsd');
        const safeHf = this.safeString (config, 'marginHfSafeBps');
        if ((equity === undefined) || (minEquity === undefined) || (safeHf === undefined) || !Precise.stringGt (equity, '0') || !Precise.stringGt (safeHf, '0')) {
            throw new ExchangeError (this.id + ' account risk inputs unavailable');
        }
        let maintenance = '0';
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const metrics = this.safeDict (asset, 'userMetrics', {});
            const collateralRaw = this.safeString (metrics, 'totalCollateralRaw');
            const debtRaw = this.safeString (metrics, 'totalDebtRaw');
            if ((collateralRaw === undefined) || (debtRaw === undefined) || (collateralRaw === '') || (debtRaw === '')) {
                throw new ExchangeError (this.id + ' incomplete account risk snapshot');
            }
            if (!Precise.stringGt (collateralRaw, '0') && !Precise.stringGt (debtRaw, '0')) {
                continue;
            }
            const price = this.safeString2 (asset, 'oracleTokenPrice', 'tokenprice');
            const mm = this.safeString (asset, 'mmBps');
            if ((price === undefined) || (mm === undefined) || !Precise.stringGt (price, '0') || !Precise.stringGt (mm, '0')) {
                throw new ExchangeError (this.id + ' maintenance or oracle unavailable for account asset');
            }
            const gross = this.humanAmount (Precise.stringAdd (collateralRaw, debtRaw) as string, this.assetDecimals (asset));
            maintenance = Precise.stringAdd (maintenance, Precise.stringDiv (Precise.stringMul (Precise.stringMul (gross, price), mm), '10000', 36)) as string;
        }
        const sellValue = Precise.stringMul (this.humanAmount (sellRaw, this.assetDecimals (debt)), this.safeString2 (debt, 'oracleTokenPrice', 'tokenprice'));
        const feeValue = Precise.stringMul (this.humanAmount (feeRaw, this.assetDecimals (debt)), this.safeString2 (debt, 'oracleTokenPrice', 'tokenprice'));
        const buyValue = Precise.stringMul (this.humanAmount (buyRaw, this.assetDecimals (bought)), this.safeString2 (bought, 'oracleTokenPrice', 'tokenprice'));
        const debtMm = this.safeString (debt, 'mmBps');
        const buyMm = this.safeString (bought, 'mmBps');
        if ((debtMm === undefined) || (buyMm === undefined) || !Precise.stringGt (debtMm, '0') || !Precise.stringGt (buyMm, '0')) {
            throw new ExchangeError (this.id + ' maintenance rates unavailable');
        }
        const afterEquity = Precise.stringSub (Precise.stringAdd (equity, buyValue), Precise.stringAdd (sellValue, feeValue));
        const addedMaintenance = Precise.stringDiv (Precise.stringAdd (Precise.stringMul (Precise.stringAdd (sellValue, feeValue), debtMm), Precise.stringMul (buyValue, buyMm)), '10000', 36);
        const required = Precise.stringDiv (Precise.stringMul (Precise.stringAdd (maintenance, addedMaintenance), safeHf), '10000', 36);
        if (Precise.stringLt (afterEquity, minEquity) || Precise.stringLt (afterEquity, required)) {
            throw new InsufficientFunds (this.id + ' signed minimum output and fees exceed account health-factor headroom');
        }
    }

    callData (signature: string, types: string[], values: any[]): string {
        return '0x' + this.hash (this.encode (signature), keccak, 'hex').slice (0, 8) + this.binaryToBase16 (this.ethAbiEncode (types, values));
    }

    positionManager (): string {
        const managers = this.safeDict (this.options, 'positionManagers', {});
        const address = this.safeString (managers, this.chainId ().toString (), '');
        if (!this.isAddress (address)) {
            throw new NotSupported (this.id + ' position manager not configured for this chain');
        }
        return address;
    }

    engineApprovals (order: Dict, config: Dict): Dict[] {
        const action = this.safeInteger (order, 'action');
        const functionName = (action === 0) ? 'approveBorrow' : 'approveEngine';
        const amount = Precise.stringAdd (this.safeString (order, 'sellAmount'), this.safeString (order, 'feeAmount'));
        return [ {
            'chainId': this.chainId (), 'from': this.safeString (order, 'user'), 'to': this.positionManager (), 'value': '0',
            'data': this.callData (functionName + '(address,address,uint256)', [ 'address', 'address', 'uint256' ], [ this.safeString (config, 'leverageRfqEngine'), this.safeString (order, 'sellToken'), amount ]),
        } ];
    }

    /** Unsigned, exact-amount ERC-20 approval and collateral deposit. */
    async prepareCollateralDeposit (code: string, amount: Num, params: Dict = {}): Promise<Dict> {
        this.chainId (params);
        const owner = this.accountAddress (params);
        const chain = await this.lendAccount (owner);
        const asset = this.findAsset (this.safeList (chain, 'assets', []), code);
        if (!this.safeBool (asset, 'isCollateral', false) || !this.safeBool (asset, 'isSuppliable', false)) {
            throw new InvalidOrder (this.id + ' asset is not valid deposit collateral');
        }
        const raw = this.rawAmount (this.numberToString (amount) as string, this.assetDecimals (asset));
        const metrics = this.safeDict (asset, 'userMetrics', {});
        const wallet = this.safeString (metrics, 'walletBalanceRaw');
        if ((wallet === undefined) || (wallet === '') || Precise.stringGt (raw, wallet)) {
            throw new InsufficientFunds (this.id + ' collateral wallet balance unavailable or insufficient');
        }
        const manager = this.positionManager ();
        const token = this.assetAddress (asset);
        return {
            'chainId': this.chainId (), 'collateral': token, 'amount': raw,
            'transactions': [
                { 'from': owner, 'to': token, 'value': '0', 'data': this.callData ('approve(address,uint256)', [ 'address', 'uint256' ], [ manager, '0' ]) },
                { 'from': owner, 'to': token, 'value': '0', 'data': this.callData ('approve(address,uint256)', [ 'address', 'uint256' ], [ manager, raw ]) },
                { 'from': owner, 'to': manager, 'value': '0', 'data': this.callData ('deposit(address,uint256)', [ 'address', 'uint256' ], [ token, raw ]) },
            ],
        };
    }

    /** Prepare a close against live position debt/funding candidates. */
    async prepareClosePosition (symbol: string, side: Str = undefined, params: Dict = {}): Promise<Dict> {
        this.chainId (params);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positions = await this.fetchPositions ([ symbol ], params);
        const positionId = this.safeString (params, 'positionId');
        let selected: Dict = {};
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            if ((positionId === undefined) || (position['id'] === positionId)) {
                if (Object.keys (selected).length) {
                    throw new ArgumentsRequired (this.id + ' multiple positions; specify positionId');
                }
                selected = position['info'];
            }
        }
        if (!Object.keys (selected).length) {
            throw new InvalidOrder (this.id + ' position not found');
        }
        if (this.safeBool (selected, 'syncing', false) || this.safeBool (selected, 'debtReadUnknown', false)) {
            throw new ExchangeError (this.id + ' position debt is not verified yet');
        }
        const isLong = this.safeString (selected, 'side') === 'long';
        const closeSide = isLong ? 'sell' : 'buy';
        if ((side !== undefined) && (side !== closeSide)) {
            throw new InvalidOrder (this.id + ' close side must oppose position side');
        }
        const chain = await this.lendAccount (this.accountAddress (params));
        const assets = this.safeList (chain, 'assets', []);
        const config = await this.configuration ();
        const debtCandidates = this.safeList (selected, 'debtCandidates', []);
        const explicitDebt = this.safeString (params, 'debtToken');
        const owed = [];
        for (let i = 0; i < debtCandidates.length; i++) {
            const candidate = debtCandidates[i];
            if (Precise.stringGt (this.safeString (candidate, 'grossDebtRaw', '0'), '0')) {
                if ((explicitDebt === undefined) || (this.safeString (candidate, 'token', '').toLowerCase () === this.assetAddress (this.findAsset (assets, explicitDebt)).toLowerCase ())) {
                    owed.push (candidate);
                }
            }
        }
        if (owed.length !== 1) {
            throw new ArgumentsRequired (this.id + ' close debt is unavailable or ambiguous; specify debtToken');
        }
        const debt = owed[0];
        const buyAsset = this.findAsset (assets, this.safeString (debt, 'token', ''));
        let sellAsset: Dict;
        let available = '0';
        if (isLong) {
            sellAsset = this.findAsset (assets, market['baseId'] as string);
            available = this.safeString (selected, 'maxCloseAmount', '0');
        } else {
            const funding = this.safeList (selected, 'fundingCandidates', []);
            const requestedFunding = this.safeString (params, 'fundingToken');
            let candidate: Dict = {};
            for (let i = 0; i < funding.length; i++) {
                const row = funding[i];
                if (Precise.stringGt (this.safeString (row, 'accountAvailRaw', '0'), '0') && ((requestedFunding === undefined) || (this.safeString (row, 'token', '').toLowerCase () === this.assetAddress (this.findAsset (assets, requestedFunding)).toLowerCase ()))) {
                    candidate = row;
                    break;
                }
            }
            sellAsset = this.findAsset (assets, this.safeString (candidate, 'token', ''));
            // The caller chooses quote-side spend explicitly. The API's
            // maxCloseAmount is BASE units and must never be sold as quote wei.
            const cost = this.safeString (params, 'cost');
            if (cost === undefined) {
                throw new ArgumentsRequired (this.id + ' short close requires params.cost in funding-token units');
            }
            available = this.rawAmount (cost, this.assetDecimals (sellAsset));
            if (Precise.stringGt (available, this.safeString (candidate, 'accountAvailRaw', '0'))) {
                throw new InsufficientFunds (this.id + ' short close exceeds available funding collateral');
            }
        }
        const amount = this.safeString (params, 'amount');
        const sellRaw = (isLong && (amount !== undefined)) ? this.rawAmount (amount, this.assetDecimals (sellAsset)) : available;
        if (!Precise.stringGt (sellRaw, '0') || Precise.stringGt (sellRaw, available)) {
            throw new InvalidOrder (this.id + ' close exceeds maxCloseAmount or requires direct repayment');
        }
        const sellToken = this.assetAddress (sellAsset);
        const buyToken = this.assetAddress (buyAsset);
        const feeAmount = await this.orderFee (sellRaw, sellToken, 'close');
        const slippage = this.safeInteger (params, 'slippageBps', this.safeInteger (this.options, 'slippageBps', 100));
        const quote = await this.quote (sellToken, buyToken, sellRaw, feeAmount, 'close', slippage);
        let minimum = this.safeString (quote, 'buyAmount', '0');
        // Whole-account debt is a conservative full-close floor. Partial
        // closes require an explicit minBuyAmount in buy-token raw units.
        const floor = this.safeString (params, 'minBuyAmount', this.safeString (debt, 'grossDebtRaw', '0'));
        minimum = Precise.stringMax (minimum, floor) as string;
        const validTo = this.safeInteger (params, 'validTo', this.seconds () + 3600);
        const order: Dict = { 'action': 1, 'user': this.accountAddress (params), 'sellToken': sellToken, 'buyToken': buyToken, 'sellAmount': sellRaw, 'buyAmount': minimum, 'validTo': validTo, 'feeAmount': feeAmount };
        if (this.safeInteger (config, 'engineVersion', 1) === 2) {
            order['partiallyFillable'] = false;
        }
        const request = { 'order': order, 'user': order['user'], 'isOpen': false, 'orderType': 'close', 'marketSymbol': market['id'], 'direction': closeSide, 'clientOrderType': 'market', 'positionId': this.safeString (selected, 'positionId'), 'source': 'trs' };
        return { 'request': request, 'typedData': this.orderTypedData (config, order), 'quote': quote, 'approvals': this.engineApprovals (order, config) };
    }

    override async closePosition (symbol: string, side: Str = undefined, params: Dict = {}): Promise<Order> {
        const prepared = await this.prepareClosePosition (symbol, side, params);
        const owner = this.accountAddress (params);
        if ((this.privateKey === undefined) || (this.ethGetAddressFromPrivateKey (this.privateKey).toLowerCase () !== owner.toLowerCase ())) {
            throw new AuthenticationError (this.id + ' privateKey must belong to the position owner');
        }
        const signature = this.signTypedData (this.safeDict (prepared, 'typedData', {}));
        return await this.submitLeverageOrder (prepared, signature, 'eip712');
    }

    override sign (path: string, api: string[] = [ 'public' ], method = 'GET', params: Dict = {}, headers: any = undefined, body: any = undefined): any {
        let url = this.urls['api'][api[0]] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            headers = { 'Content-Type': 'application/json' };
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (code: number, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        if (this.safeValue (response, 'success') === false) {
            const message = this.safeString2 (response, 'error', 'message', body);
            const feedback = this.id + ' ' + message;
            if (code === 404) {
                throw new OrderNotFound (feedback);
            }
            if ((code === 401) || (code === 403)) {
                throw new AuthenticationError (feedback);
            }
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
