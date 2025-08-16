import Exchange from './abstract/aftermath.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Account, Balances, Currencies, Currency, Market, Dict, Int, OHLCV, Order, OrderBook, OrderRequest, Str, Ticker, Trade, TradingFeeInterface } from './base/types.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';
import { NotSupported } from './base/errors.js';

export default class aftermath extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'aftermath',
            'name': 'AftermathFinance',
            'countries': [ ],
            'version': 'v1',
            'rateLimit': 50, // 1200 requests per minute, 20 request per second
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'editOrder': 'emulated',
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': 'emulated',
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'api': 'http://localhost:8085/perpetuals/ccxt',
            },
            'api': {
                'public': {
                    'post': [
                        'fetchMarkets',
                        'fetchCurrencies',
                        'fetchTicker',
                        'fetchOrderBook',
                        'fetchTrades',
                        'fetchOHLCV',
                    ],
                },
                'private': {
                    'post': [
                        'fetchAccounts',
                        'fetchBalance',
                        'fetchPendingOrders',
                        'createOrdersRequest',
                        'createOrdersExecute',
                        'cancelOrdersRequest',
                        'cancelOrdersExecute',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'swap',
                'sandboxMode': false,
            },
        });
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicPostFetchCurrencies (params);
        const currencies = this.parseCurrencies (response);
        return currencies;
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const parsed = this.safeCurrencyStructure (rawCurrency);
        parsed['precision'] = this.safeNumber (rawCurrency, 'precision');
        parsed['info'] = {};
        return parsed;
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicPostFetchMarkets (params);
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        // const parsed = this.safeMarket (market);
        // NOTE: for some reason JSON numbers come in as strings, so we have to manually parse them.
        const parsed = this.safeMarketStructure (market);
        parsed['taker'] = this.safeNumber (market, 'taker');
        parsed['maker'] = this.safeNumber (market, 'taker');
        parsed['contractSize'] = this.safeNumber (market, 'contractSize');
        parsed['precision']['amount'] = this.safeNumber (market['precision'], 'amount');
        parsed['precision']['price'] = this.safeNumber (market['precision'], 'price');
        parsed['limits']['cost']['min'] = this.safeNumber (market['limits']['cost'], 'min');
        parsed['limits']['leverage']['max'] = this.safeNumber (market['limits']['leverage'], 'max');
        parsed['info'] = market;
        return parsed;
    }

    /**
     * @method
     * @name aftermath#fetchTradingFee
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        return this.parseTradingFee (market);
    }

    parseTradingFee (market: Market = undefined): TradingFeeInterface {
        const symbol = this.safeSymbol (undefined, market);
        return {
            'info': {},
            'symbol': symbol,
            'maker': this.safeNumber (market, 'maker'),
            'taker': this.safeNumber (market, 'taker'),
            'percentage': true,
            'tierBased': undefined,
        };
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chId = this.safeString (market, 'id');
        const request = { 'chId': chId, 'symbol': symbol };
        const response = await this.publicPostFetchTicker (this.extend (request, params));
        return this.parseTicker (response);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const parsed = this.safeTicker (ticker);
        parsed['info'] = {};
        parsed['timestamp'] = this.safeInteger (ticker, 'timestamp');
        parsed['datetime'] = this.safeString (ticker, 'datetime');
        return parsed;
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chId = this.safeString (market, 'id');
        const request = { 'chId': chId, 'symbol': symbol };
        const response = await this.publicPostFetchOrderBook (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chId = this.safeString (market, 'id');
        const request = { 'chId': chId, 'symbol': symbol };
        const response = await this.publicPostFetchTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        return this.safeTrade (trade);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chId = this.safeString (market, 'id');
        const request = { 'chId': chId, 'timeframe': timeframe, 'since': since, 'limit': limit };
        const response = await this.publicPostFetchOHLCV (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name aftermath#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] account object ID, required
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        const account = this.safeString (params, 'account');
        const request = { 'account': account };
        const response = await this.privatePostFetchBalance (this.extend (request, params));
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const parsed = this.safeBalance (response);
        parsed['timestamp'] = this.safeInteger (response, 'timestamp');
        return parsed;
    }

    /**
     * @method
     * @name aftermath#fetchAccounts
     * @description query for accounts owned by the walletAddress. An Account is needed for all trading methods.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Array} a list of [account structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#accounts}
     */
    async fetchAccounts (params = {}): Promise<Account[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const response = await this.privatePostFetchAccounts ({ 'address': this.walletAddress });
        return this.parseAccounts (response);
    }

    parseAccount (account: Dict): Account {
        return {
            'id': this.safeString (account, 'id'),
            'type': this.safeString (account, 'type', undefined),
            'code': this.safeString (account, 'code', undefined),
            'info': this.safeValue (account, 'info'),
        };
    }

    /**
     * @method
     * @name aftermath#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-docs-v3.idex.io/#get-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account to query orders for, required
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const account = this.safeValue (params, 'account');
        const accountInfo = this.safeValue (account, 'info');
        const accountId = this.safeString (accountInfo, 'accountId');
        const request = {
            'chId': this.safeString (market, 'id'),
            'accountId': accountId,
        };
        if (since !== undefined) {
            throw new NotSupported (this.id + ' fetchOpenOrders(since) is not supported yet');
        }
        if (limit !== undefined) {
            throw new NotSupported (this.id + ' fetchOpenOrders(limit) is not supported yet');
        }
        const response = await this.privatePostFetchPendingOrders (request);
        return this.parseOrders (response);
    }

    /**
     * @method
     * @name aftermath#createOrders
     * @description create a list of trade orders
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account to use, required
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        // Create transaction request
        const ordersTransformed = [];
        for (let i = 0; i < orders.length; i++) {
            const order = this.clone (orders[i]);
            const symbol = this.safeString (order, 'symbol');
            const market = this.market (symbol);
            const chId = this.safeString (market, 'id');
            delete order['symbol'];
            order['chId'] = chId;
            ordersTransformed.push (order);
        }
        const account = this.safeValue (params, 'account');
        const txRequest = {
            'sender': this.walletAddress,
            'subaccount': account['id'],
            'orders': ordersTransformed,
        };
        // Receive transaction data, sign it, and submit for execution
        const tx = await this.privatePostCreateOrdersRequest (this.extend (txRequest, params));
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostCreateOrdersExecute (request);
        return this.parseOrders (response);
    }

    /**
     * @method
     * @name aftermath#cancelOrders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account to cancel orders for, required
     * @returns {Order[]} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        // Create transaction request
        const account = this.safeValue (params, 'account');
        const market = this.market (symbol);
        const chId = this.safeString (market, 'id');
        const txRequest = {
            'sender': this.walletAddress,
            'subaccount': account['id'],
            'chId': chId,
            'orderIds': ids,
        };
        // Receive transaction data, sign it, and submit for execution
        const tx = await this.privatePostCancelOrdersRequest (txRequest);
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostCancelOrdersExecute (request);
        return this.parseOrders (response);
    }

    /**
     * @method
     * @name aftermath#signTxEd25519
     * @description Helper to sign some transaction bytes and return a generic transaction execution request.
     * @param {object} [tx] transaction bytes and the signing digest for them
     * @returns {object} the input transaction bytes and the signed digest
     */
    signTxEd25519 (tx: Dict): Dict {
        const signingDigest = this.safeString (tx, 'signingDigest');
        const hexDigest = this.binaryToBase16 (this.base64ToBinary (signingDigest));
        const privateKey = this.base16ToBinary (this.privateKey);
        const signature = ed25519.sign (hexDigest, privateKey);
        const publicKey = ed25519.getPublicKey (privateKey);
        const suiSignature = this.binaryConcat (this.base16ToBinary ('00'), this.binaryConcat (signature, publicKey));
        const base64Sig = this.binaryToBase64 (suiSignature);
        const transactionBytes = this.safeString (tx, 'transactionBytes');
        return { 'transactionBytes': transactionBytes, 'signature': base64Sig };
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        return this.safeOrder (order, market);
    }

    sign (path, api = 'public', method = 'POST', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api'] + '/' + path;
        if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
