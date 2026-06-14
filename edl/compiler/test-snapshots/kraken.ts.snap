import { Exchange } from './base/Exchange.js';
import type { Dict, Int, Num, Str, Ticker, Trade, Order, Balances, Market } from './base/types.js';

export default class Kraken extends Exchange {

    /**
     * Returns the exchange description object
     *
     * @returns {object} Exchange configuration
     */
    describe (): object {
        return this.deepExtend (super.describe (), {
            'id': 'kraken',
            'name': 'Kraken',
            'countries': ['US'],
            'rateLimit': 1000,
            'version': '0',
            'certified': false,
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg',
                'api': { 'public': 'https://api.kraken.com/0/public', 'private': 'https://api.kraken.com/0/private' },
                'test': { 'public': 'https://api.kraken.com/0/public', 'private': 'https://api.kraken.com/0/private' },
                'www': 'https://www.kraken.com',
                'doc': ['https://docs.kraken.com/rest/'],
                'fees': 'https://www.kraken.com/features/fee-schedule',
            },
            'api': {
                'public': { 'get': ['Time', 'SystemStatus', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC'] },
                'private': {
                    'post': [
                        'Balance',
                        'TradeBalance',
                        'OpenOrders',
                        'ClosedOrders',
                        'QueryOrders',
                        'TradesHistory',
                        'QueryTrades',
                        'OpenPositions',
                        'Ledgers',
                        'QueryLedgers',
                        'TradeVolume',
                        'AddOrder',
                        'CancelOrder',
                        'CancelAll',
                        'CancelAllOrdersAfter',
                        'EditOrder',
                        'DepositMethods',
                        'DepositAddresses',
                        'DepositStatus',
                        'WithdrawInfo',
                        'Withdraw',
                        'WithdrawStatus',
                        'WithdrawCancel',
                    ],
                },
            },
            'has': {
                'CORS': null,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'fetchTicker': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchDepositAddress': true,
                'fetchTime': true,
                'fetchOrderBook': true,
                'deposit': true,
                'withdraw': true,
                'publicAPI': true,
                'privateAPI': true,
                'sandbox': false,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchStatus': false,
                'fetchLastPrices': false,
                'fetchBidsAsks': false,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createStopLimitOrder': true,
                'cancelAllOrders': true,
                'editOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchPositions': true,
                'fetchLedger': true,
                'fetchBorrowRates': false,
                'borrowMargin': false,
                'setLeverage': true,
            },
            'timeframes': { '1m': '1', '5m': '5', '15m': '15', '30m': '30', '1h': '60', '4h': '240', '1d': '1440', '1w': '10080', '2w': '21600' },
            'requiredCredentials': { 'apiKey': true, 'secret': true, 'uid': false, 'login': false, 'password': false, 'twofa': false, 'privateKey': false },
            'commonCurrencies': {
                'LUNA': 'LUNC',
                'LUNA2': 'LUNA',
                'REPV2': 'REP',
                'REP': 'REPV1',
                'UST': 'USTC',
                'XBT': 'BTC',
                'XDG': 'DOGE',
                'FEE': 'KFEE',
                'XETC': 'ETC',
                'XETH': 'ETH',
                'XLTC': 'LTC',
                'XMLN': 'MLN',
                'XREP': 'REP',
                'XXBT': 'BTC',
                'XXDG': 'DOGE',
                'XXLM': 'XLM',
                'XXMR': 'XMR',
                'XXRP': 'XRP',
                'XZEC': 'ZEC',
                'ZAUD': 'AUD',
                'ZCAD': 'CAD',
                'ZEUR': 'EUR',
                'ZGBP': 'GBP',
                'ZJPY': 'JPY',
                'ZUSD': 'USD',
            },
        });
    }

    /**
     * Parse ticker response
     *
     * @param {object} response API response
     * @returns {object} Parsed ticker
     */
    parseTicker (response: any, market?: any) {
        const rawData = response;
        const symbol = market ? market.symbol : undefined;
        const timestamp = this.milliseconds ();
        const marketId = market ? market.id : undefined;
        const data = (this.safeValue(this.safeValue(response, 'result'), marketId, {}) !== undefined ? this.safeValue(this.safeValue(response, 'result'), marketId, {}) : {});
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'high': (this.parseNumber(this.safeValue(data, 'h')?.[1]) !== undefined ? this.parseNumber(this.safeValue(data, 'h')?.[1]) : null),
            'low': (this.parseNumber(this.safeValue(data, 'l')?.[1]) !== undefined ? this.parseNumber(this.safeValue(data, 'l')?.[1]) : null),
            'bid': (this.parseNumber(this.safeValue(data, 'b')?.[0]) !== undefined ? this.parseNumber(this.safeValue(data, 'b')?.[0]) : null),
            'bidVolume': (this.parseNumber(this.safeValue(data, 'b')?.[2]) !== undefined ? this.parseNumber(this.safeValue(data, 'b')?.[2]) : null),
            'ask': (this.parseNumber(this.safeValue(data, 'a')?.[0]) !== undefined ? this.parseNumber(this.safeValue(data, 'a')?.[0]) : null),
            'askVolume': (this.parseNumber(this.safeValue(data, 'a')?.[2]) !== undefined ? this.parseNumber(this.safeValue(data, 'a')?.[2]) : null),
            'vwap': (this.parseNumber(this.safeValue(data, 'p')?.[1]) !== undefined ? this.parseNumber(this.safeValue(data, 'p')?.[1]) : null),
            'open': this.safeNumber (data, 'o'),
            'close': (this.parseNumber(this.safeValue(data, 'c')?.[0]) !== undefined ? this.parseNumber(this.safeValue(data, 'c')?.[0]) : null),
            'last': (this.parseNumber(this.safeValue(data, 'c')?.[0]) !== undefined ? this.parseNumber(this.safeValue(data, 'c')?.[0]) : null),
            'previousClose': undefined,
            'average': undefined,
            'baseVolume': (this.parseNumber(this.safeValue(data, 'v')?.[1]) !== undefined ? this.parseNumber(this.safeValue(data, 'v')?.[1]) : null),
            'quoteVolume': undefined,
            'info': response,
        };
        result.datetime = this.iso8601(result.timestamp);
        result.change = result.last - result.open;
        result.percentage = (result.change / result.open) * 100;
        return result;
    }

    /**
     * Parse order response
     *
     * @param {object} response API response
     * @returns {object} Parsed order
     */
    parseOrder (response: any, market?: any) {
        const rawData = response;
        const marketId = market ? market.id : undefined;
        const data = response;
        const result = {
            'id': this.safeString (data, 'id'),
            'clientOrderId': this.safeString (data, 'userref'),
            'timestamp': this.safeTimestamp (data, 'opentm'),
            'lastTradeTimestamp': this.safeTimestamp (data, 'closetm'),
            'type': ((this.safeValue(data, 'descr')?.['ordertype'])?.toLowerCase() !== undefined ? (this.safeValue(data, 'descr')?.['ordertype'])?.toLowerCase() : null),
            'timeInForce': undefined,
            'side': ((this.safeValue(data, 'descr')?.['type'])?.toLowerCase() !== undefined ? (this.safeValue(data, 'descr')?.['type'])?.toLowerCase() : null),
            'price': (this.parseNumber(this.safeValue(data, 'descr')?.['price']) !== undefined ? this.parseNumber(this.safeValue(data, 'descr')?.['price']) : null),
            'stopPrice': this.safeNumber (data, 'stopprice'),
            'amount': this.safeNumber (data, 'vol'),
            'cost': this.safeNumber (data, 'cost'),
            'average': this.safeNumber (data, 'price'),
            'filled': this.safeNumber (data, 'vol_exec'),
            'status': this.safeString ({ ''pending'': 'open', ''open'': 'open', ''closed'': 'closed', ''canceled'': 'canceled', ''expired'': 'expired' }, (this.safeValue (data, 'status') !== undefined ? this.safeValue (data, 'status') : null)),
            'fee': this.safeNumber (data, 'fee'),
            'trades': (this.safeValue (data, 'trades') !== undefined ? this.safeValue (data, 'trades') : null),
            'info': response,
        };
        result.datetime = this.iso8601(result.timestamp);
        result.symbol = this.safeSymbol(marketId, market);
        result.postOnly = this.safeString(response, 'oflags', '').includes('post');
        result.remaining = result.amount - result.filled;
        return result;
    }

    /**
     * Parse trade response
     *
     * @param {object} response API response
     * @returns {object} Parsed trade
     */
    parseTrade (response: any, market?: any) {
        const rawData = response;
        const marketId = market ? market.id : undefined;
        const data = response;
        const result = { 'id': null, 'order': null, 'takerOrMaker': null, 'fee': null, 'info': response };
        result.timestamp = this.safeTimestamp(response, 2);
        result.datetime = this.iso8601(result.timestamp);
        result.symbol = this.safeSymbol(marketId, market);
        result.type = this.safeString(response, 4) === 'l' ? 'limit' : this.safeString(response, 4) === 'm' ? 'market' : null;
        result.side = this.safeString(response, 3) === 'b' ? 'buy' : this.safeString(response, 3) === 's' ? 'sell' : null;
        result.price = this.safeNumber(response, 0);
        result.amount = this.safeNumber(response, 1);
        result.cost = this.parseNumber(response[0]) * this.parseNumber(response[1]);
        result.fees = [];
        return result;
    }

    /**
     * Parse balance response
     *
     * @param {object} response API response
     * @returns {object} Parsed balance
     */
    parseBalance (response: any, market?: any) {
        const rawData = response;
        const data = this.safeValue (response, 'result', {});
        const balances = Object.entries (data).map (([currencyId, _value]) => {
            const entry = {
                'currency': this.safeCurrencyCode (currencyId),
                'total': this.safeNumber (_value, 'balance'),
                'used': this.safeNumber (_value, 'hold_trade'),
            };
            entry.free = this.parseNumber(this.numberToString(entry.total - entry.used));
            return entry;
        });
        const result = { 'info': rawData, 'timestamp': null, 'datetime': null };
        for (const balance of balances) {
            const currency = balance.currency;
            result[currency] = { 'free': balance.free, 'used': balance.used, 'total': balance.total };
        }
        return this.safeBalance (result);
    }

    /**
     * Parse market response
     *
     * @param {object} response API response
     * @returns {object} Parsed market
     */
    parseMarket (response: any, market?: any) {
        const rawData = response;
        const data = this.safeValue (response, 'result', {});
        const results = Object.entries (data).map (([key, _value]) => {
            const entry = {
                'id': key,
                'base': (this.safeCurrencyCode (this.safeValue (_value, 'base')) !== undefined ? this.safeCurrencyCode (this.safeValue (_value, 'base')) : null),
                'quote': (this.safeCurrencyCode (this.safeValue (_value, 'quote')) !== undefined ? this.safeCurrencyCode (this.safeValue (_value, 'quote')) : null),
                'baseId': (this.safeValue (_value, 'base') !== undefined ? this.safeValue (_value, 'base') : null),
                'quoteId': (this.safeValue (_value, 'quote') !== undefined ? this.safeValue (_value, 'quote') : null),
                'active': this.safeString ({ ''online'': true }, (this.safeValue (_value, 'status') !== undefined ? this.safeValue (_value, 'status') : false)),
                'type': 'spot',
                'spot': true,
                'swap': false,
                'future': false,
                'option': false,
                'contract': false,
                'settle': null,
                'settleId': null,
                'contractSize': null,
                'linear': null,
                'inverse': null,
                'expiry': null,
                'expiryDatetime': null,
                'strike': null,
                'optionType': null,
                'precision': {},
                'limits': {
                    'amount': { 'min': this.safeNumber (_value, 'ordermin'), 'max': null },
                    'price': { 'min': this.safeNumber (_value, 'tick_size'), 'max': null },
                    'cost': { 'min': this.safeNumber (_value, 'costmin'), 'max': null },
                    'leverage': { 'min': null },
                },
                'info': _value,
            };
            entry.symbol = entry.base + '/' + entry.quote;
            entry.margin = this.safeValue(_value, 'leverage_buy')?.length > 0 || this.safeValue(_value, 'leverage_sell')?.length > 0;
            entry.taker = this.parseNumber(this.safeValue(this.safeValue(_value, 'fees'), 0)?.[1]) / 100;
            entry.maker = this.parseNumber(this.safeValue(this.safeValue(_value, 'fees_maker'), 0)?.[1]) / 100;
            entry.precision.amount = this.parseNumber(this.parsePrecision(this.safeString(_value, 'lot_decimals')));
            entry.precision.price = this.parseNumber(this.parsePrecision(this.safeString(_value, 'pair_decimals')));
            entry.limits.leverage.max = Math.max(...(this.safeValue(_value, 'leverage_buy') || []), ...(this.safeValue(_value, 'leverage_sell') || []), 0);
            return entry;
        });
        return results;
    }

    /**
     * Parse deposit response
     *
     * @param {object} response API response
     * @returns {object} Parsed deposit
     */
    parseDeposit (response: any, market?: any) {
        const rawData = response;
        const data = response;
        const result = {
            'id': (this.safeValue (data, 'refid') !== undefined ? this.safeValue (data, 'refid') : null),
            'txid': (this.safeValue (data, 'txid') !== undefined ? this.safeValue (data, 'txid') : null),
            'type': 'deposit',
            'currency': (this.safeCurrencyCode (this.safeValue (data, 'asset')) !== undefined ? this.safeCurrencyCode (this.safeValue (data, 'asset')) : null),
            'amount': this.safeNumber (data, 'amount'),
            'status': this.safeString ({ ''Success'': 'ok', ''Pending'': 'pending', ''Failure'': 'failed' }, (this.safeValue (data, 'status') !== undefined ? this.safeValue (data, 'status') : null)),
            'address': (this.safeValue (data, 'info') !== undefined ? this.safeValue (data, 'info') : null),
            'addressTo': (this.safeValue (data, 'info') !== undefined ? this.safeValue (data, 'info') : null),
            'addressFrom': null,
            'tag': null,
            'tagTo': null,
            'tagFrom': null,
            'timestamp': this.safeTimestamp (data, 'time'),
            'updated': null,
            'internal': null,
            'comment': null,
            'fee': {
                'currency': (this.safeCurrencyCode (this.safeValue (data, 'asset')) !== undefined ? this.safeCurrencyCode (this.safeValue (data, 'asset')) : null),
                'cost': this.safeNumber (data, 'fee'),
            },
            'info': response,
        };
        result.network = (this.safeString(data, 'network') !== undefined ? this.safeString(data, 'network') : this.safeString(data, 'method'));
        result.datetime = this.iso8601(result.timestamp);
        return result;
    }

    /**
     * Parse withdrawal response
     *
     * @param {object} response API response
     * @returns {object} Parsed withdrawal
     */
    parseWithdrawal (response: any, market?: any) {
        const rawData = response;
        const data = response;
        const result = {
            'id': (this.safeValue (data, 'refid') !== undefined ? this.safeValue (data, 'refid') : null),
            'txid': (this.safeValue (data, 'txid') !== undefined ? this.safeValue (data, 'txid') : null),
            'type': 'withdrawal',
            'currency': (this.safeCurrencyCode (this.safeValue (data, 'asset')) !== undefined ? this.safeCurrencyCode (this.safeValue (data, 'asset')) : null),
            'amount': this.safeNumber (data, 'amount'),
            'status': this.safeString ({ ''Success'': 'ok', ''Pending'': 'pending', ''Failure'': 'failed' }, (this.safeValue (data, 'status') !== undefined ? this.safeValue (data, 'status') : null)),
            'address': (this.safeValue (data, 'info') !== undefined ? this.safeValue (data, 'info') : null),
            'addressTo': (this.safeValue (data, 'info') !== undefined ? this.safeValue (data, 'info') : null),
            'addressFrom': null,
            'tag': null,
            'tagTo': null,
            'tagFrom': null,
            'timestamp': this.safeTimestamp (data, 'time'),
            'updated': null,
            'internal': null,
            'comment': null,
            'fee': {
                'currency': (this.safeCurrencyCode (this.safeValue (data, 'asset')) !== undefined ? this.safeCurrencyCode (this.safeValue (data, 'asset')) : null),
                'cost': this.safeNumber (data, 'fee'),
            },
            'info': response,
        };
        result.network = (this.safeString(data, 'network') !== undefined ? this.safeString(data, 'network') : this.safeString(data, 'method'));
        result.datetime = this.iso8601(result.timestamp);
        return result;
    }

    /**
     * Parse depositAddress response
     *
     * @param {object} response API response
     * @returns {object} Parsed depositAddress
     */
    parseDepositAddress (response: any, market?: any) {
        const rawData = response;
        const data = response;
        const result = {
            'currency': null,
            'network': null,
            'address': (this.safeValue (data, 'address') !== undefined ? this.safeValue (data, 'address') : null),
            'tag': (this.safeValue (data, 'tag') !== undefined ? this.safeValue (data, 'tag') : null),
            'info': response,
        };
        return result;
    }

    /**
     * Fetch ticker for a symbol
     *
     * @param {string} symbol Unified symbol
     * @param {object} params Extra parameters
     * @returns {Ticker} Ticker structure
     */
    async fetchTicker (symbol: string, params: object = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market.id };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    /**
     * Fetch recent trades for a symbol
     *
     * @param {string} symbol Unified symbol
     * @param {number} since Timestamp in ms
     * @param {number} limit Max number of trades
     * @param {object} params Extra parameters
     * @returns {Trade[]} Array of trades
     */
    async fetchTrades (symbol: string, since?: number, limit?: number, params: object = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market.id };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * Calls the public GET Time endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTime (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('Time', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the public GET SystemStatus endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetSystemStatus (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('SystemStatus', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the public GET Assets endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetAssets (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('Assets', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the public GET AssetPairs endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetAssetPairs (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('AssetPairs', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the public GET Ticker endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTicker (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetTicker', params.pair, 'pair');
        return await this.request ('Ticker', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the public GET Depth endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetDepth (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetDepth', params.pair, 'pair');
        return await this.request ('Depth', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the public GET Trades endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetTrades (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetTrades', params.pair, 'pair');
        return await this.request ('Trades', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the public GET Spread endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetSpread (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetSpread', params.pair, 'pair');
        return await this.request ('Spread', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the public GET OHLC endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async publicGetOHLC (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('publicGetOHLC', params.pair, 'pair');
        return await this.request ('OHLC', 'public', 'GET', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST Balance endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostBalance (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('Balance', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST TradeBalance endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostTradeBalance (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('TradeBalance', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST OpenOrders endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostOpenOrders (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('OpenOrders', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST ClosedOrders endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostClosedOrders (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('ClosedOrders', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST QueryOrders endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostQueryOrders (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostQueryOrders', params.txid, 'txid');
        return await this.request ('QueryOrders', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST TradesHistory endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostTradesHistory (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('TradesHistory', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST QueryTrades endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostQueryTrades (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostQueryTrades', params.txid, 'txid');
        return await this.request ('QueryTrades', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST OpenPositions endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostOpenPositions (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('OpenPositions', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST Ledgers endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostLedgers (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('Ledgers', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST QueryLedgers endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostQueryLedgers (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostQueryLedgers', params.id, 'id');
        return await this.request ('QueryLedgers', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST TradeVolume endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostTradeVolume (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('TradeVolume', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST AddOrder endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostAddOrder (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostAddOrder', params.pair, 'pair');
        this.checkRequiredArgument ('privatePostAddOrder', params.type, 'type');
        this.checkRequiredArgument ('privatePostAddOrder', params.ordertype, 'ordertype');
        if (["limit", "stop-loss-limit", "take-profit-limit"].includes(params.ordertype)) {
            this.checkRequiredArgument ('privatePostAddOrder', params.price, 'price');
        }
        this.checkRequiredArgument ('privatePostAddOrder', params.volume, 'volume');
        return await this.request ('AddOrder', 'private', 'POST', params, undefined, undefined, { 'cost': 0.5 }, context);
    }

    /**
     * Calls the private POST CancelOrder endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostCancelOrder (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostCancelOrder', params.txid, 'txid');
        return await this.request ('CancelOrder', 'private', 'POST', params, undefined, undefined, { 'cost': 0.5 }, context);
    }

    /**
     * Calls the private POST CancelAll endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostCancelAll (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('CancelAll', 'private', 'POST', params, undefined, undefined, { 'cost': 0.5 }, context);
    }

    /**
     * Calls the private POST CancelAllOrdersAfter endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostCancelAllOrdersAfter (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostCancelAllOrdersAfter', params.timeout, 'timeout');
        return await this.request ('CancelAllOrdersAfter', 'private', 'POST', params, undefined, undefined, { 'cost': 0.5 }, context);
    }

    /**
     * Calls the private POST EditOrder endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostEditOrder (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostEditOrder', params.txid, 'txid');
        this.checkRequiredArgument ('privatePostEditOrder', params.pair, 'pair');
        return await this.request ('EditOrder', 'private', 'POST', params, undefined, undefined, { 'cost': 0.5 }, context);
    }

    /**
     * Calls the private POST DepositMethods endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostDepositMethods (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostDepositMethods', params.asset, 'asset');
        return await this.request ('DepositMethods', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST DepositAddresses endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostDepositAddresses (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostDepositAddresses', params.asset, 'asset');
        this.checkRequiredArgument ('privatePostDepositAddresses', params.method, 'method');
        return await this.request ('DepositAddresses', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST DepositStatus endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostDepositStatus (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('DepositStatus', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST WithdrawInfo endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostWithdrawInfo (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostWithdrawInfo', params.asset, 'asset');
        this.checkRequiredArgument ('privatePostWithdrawInfo', params.key, 'key');
        this.checkRequiredArgument ('privatePostWithdrawInfo', params.amount, 'amount');
        return await this.request ('WithdrawInfo', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST Withdraw endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostWithdraw (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostWithdraw', params.asset, 'asset');
        this.checkRequiredArgument ('privatePostWithdraw', params.key, 'key');
        this.checkRequiredArgument ('privatePostWithdraw', params.amount, 'amount');
        return await this.request ('Withdraw', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST WithdrawStatus endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostWithdrawStatus (params: Dict = {}, context: Dict = {}): Promise<any> {
        return await this.request ('WithdrawStatus', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * Calls the private POST WithdrawCancel endpoint
     *
     * @param {Dict} params Request parameters
     * @param {Dict} context Request context overrides
     * @returns {Promise<any>} Raw API response
     */
    async privatePostWithdrawCancel (params: Dict = {}, context: Dict = {}): Promise<any> {
        this.checkRequiredArgument ('privatePostWithdrawCancel', params.asset, 'asset');
        this.checkRequiredArgument ('privatePostWithdrawCancel', params.refid, 'refid');
        return await this.request ('WithdrawCancel', 'private', 'POST', params, undefined, undefined, { 'cost': 1 }, context);
    }

    /**
     * @method
     * @name kraken#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getExtendedBalance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a balance structure
     */
    async fetchBalance ( params = {}): Promise<Balances> {
        await this.loadMarkets();
        const response = await this.privatePostBalanceEx(params);
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "ZUSD": {
        //                 "balance": 25435.21,
        //                 "hold_trade": 8249.76
        //             },
        //             "XXBT": {
        //                 "balance": 1.2435,
        //                 "hold_trade": 0.8423
        //             }
        //         }
        //     }
        //
        return this.parseBalance(response);
    }

    /**
     * @ignore
     * @method
     * @description Sign API request with Kraken's chained SHA256+SHA512 signature algorithm
     * @param {string} path - API endpoint path
     * @param {string} api - 'public' or 'private'
     * @param {string} method - HTTP method
     * @param {object} params - Request parameters
     * @param {object} headers - HTTP headers
     * @param {string} body - Request body
     * @returns {object} Object containing url, method, body, and headers
     */
    sign (
        path: string,
        api = 'public',
        method = 'GET',
        params = {},
        headers: any = undefined,
        body: any = undefined
    ) {
        let url = '/' + this.version + '/' + api + '/' + path;

        if (api === 'public') {
            if (Object.keys(params).length) {
                // urlencodeNested handles nested parameters
                url += '?' + this.urlencodeNested(params);
            }
        } else if (api === 'private') {
            const price = this.safeString(params, 'price');
            let isTriggerPercent = false;
            if (price !== undefined) {
                isTriggerPercent = (price.endsWith('%')) ? true : false;
            }
            const isCancelOrderBatch = (path === 'CancelOrderBatch');
            const isBatchOrder = (path === 'AddOrderBatch');

            this.checkRequiredCredentials();
            const nonce = this.nonce().toString();

            // Some endpoints require JSON body instead of URL-encoded
            if (isCancelOrderBatch || isTriggerPercent || isBatchOrder) {
                body = this.json(this.extend({ 'nonce': nonce }, params));
            } else {
                body = this.urlencodeNested(this.extend({ 'nonce': nonce }, params));
            }

            // Kraken uses a chained signature algorithm:
            // 1. Concatenate nonce + body
            const auth = this.encode(nonce + body);
            // 2. SHA256 hash of the auth string
            const hash = this.hash(auth, 'sha256', 'binary');
            // 3. Concatenate URL path (binary) with the hash
            const binary = this.encode(url);
            const binhash = this.binaryConcat(binary, hash);
            // 4. Decode the secret from base64
            const secret = this.base64ToBinary(this.secret);
            // 5. HMAC-SHA512 of the concatenated binary using the secret
            const signature = this.hmac(binhash, secret, 'sha512', 'base64');

            headers = {
                'API-Key': this.apiKey,
                'API-Sign': signature,
            };

            // Set appropriate content type
            if (isCancelOrderBatch || isTriggerPercent || isBatchOrder) {
                headers['Content-Type'] = 'application/json';
            } else {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            url = '/' + path;
        }

        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
