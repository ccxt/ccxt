import Exchange from './base/Exchange.js';
import { ExchangeError, AuthenticationError, InsufficientFunds, InvalidOrder, OrderNotFound, BadRequest, RateLimitExceeded, NotSupported } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Currencies, Int, Market, OHLCV, Order, OrderSide, OrderType, Str, Ticker, Tickers, Trade, TradingFees, Dict, Num, Strings } from './base/types.js';

/**
 * @class swyftx
 * @augments Exchange
 */
export default class swyftx extends Exchange {
    accessToken: Str;

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'swyftx',
            'name': 'Swyftx',
            'countries': [ 'AU', 'NZ' ],
            'version': 'v1',
            'rateLimit': 1000,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                // Public
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': false, // Swyftx does not expose orderbooks via API, only via UI on Pro
                'fetchOHLCV': true,
                'fetchStatus': false, // No public status endpoint, rely on exchange status page
                'fetchTrades': false, // Swyftx does not expose public trades via API
                // Private
                'fetchBalance': true,
                'createOrder': true,
                'editOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': false, // we can try to emulate but the one-to-one order→trade mapping hides partial fills
                'deposit': false, // TODO
                'withdraw': false, // TODO
                // more
                'fetchDepositAddress': false, // TODO
                'fetchDeposits': false, // TODO
                'fetchWithdrawals': false, // TODO
                'fetchTransactions': false, // TODO
                'fetchLedger': false, // TODO
                'fetchAccounts': false, // User can only have one account at present
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '45m': '45m',
                '1h': '1h',
                '2h': '2h',
                '3h': '3h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.swyftx.com.au',
                    'private': 'https://api.swyftx.com.au',
                },
                'www': 'https://swyftx.com',
                'doc': 'https://docs.swyftx.com.au',
                'fees': 'https://swyftx.com/au/fees/',
                'referral': 'https://trade.swyftx.com.au/register/?ref=simonvictory',
            },
            'api': {
                'public': {
                    'get': [
                        'markets/info/basic/{assetCode}',
                        'markets/info/detail/{assetCode}',
                        'markets/assets',
                        'charts/v2/getBars/{baseAsset}/{secondaryAsset}/{side}',
                        'charts/listBars',
                        'charts/getBars',
                        'charts/resolveSymbol',
                        'assets',
                        'enabled-assets',
                        'live-rates/{assetId}',
                        'orders/{marketId}',
                        'orders/{primaryAsset}/{secondaryAsset}',
                        'trades/{marketId}',
                        'history/{assetId}',
                    ],
                    'post': [
                        'auth/refresh/',
                    ],
                },
                'private': {
                    'get': [
                        'user/balance',
                        'user/statistics/accountValue',
                        'orders',
                        'orders/byId/{orderUuid}',
                        'orders/detail/{orderId}',
                        'limits/withdrawal',
                        'trade/details/{tradeUuid}',
                        'history',
                    ],
                    'post': [
                        'orders',
                        'orders/market',
                        'withdraw',
                        'transfer',
                    ],
                    'delete': [
                        'orders/{orderId}',
                    ],
                    'put': [
                        'orders/{orderUuid}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.006'), // 0.6%
                    'maker': this.parseNumber ('0.006'), // 0.6%
                },
                'funding': {
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'assetsByCode': undefined,
                'assetsById': undefined,
            },
            'exceptions': {
                'exact': {
                    'Invalid API Key': AuthenticationError,
                    'Invalid signature': AuthenticationError,
                    'Invalid nonce': AuthenticationError,
                    'Invalid authentication credentials': AuthenticationError,
                    'Insufficient funds': InsufficientFunds,
                    'Insufficient balance': InsufficientFunds,
                    'Invalid order': InvalidOrder,
                    'Order not found': OrderNotFound,
                    'Market not found': BadRequest,
                    'Asset not found': BadRequest,
                    'Rate limit exceeded': RateLimitExceeded,
                    'Trading is disabled': NotSupported,
                },
                'broad': {
                    'API key': AuthenticationError,
                    'signature': AuthenticationError,
                    'authentication': AuthenticationError,
                    'Unauthorized': AuthenticationError,
                    'funds': InsufficientFunds,
                    'balance': InsufficientFunds,
                    'Invalid': InvalidOrder,
                    'Not found': OrderNotFound,
                    'Rate limit': RateLimitExceeded,
                    'disabled': NotSupported,
                },
            },
        });
    }

    /**
     * @method
     * @name swyftx#fetchMarkets
     * @description retrieves data on all markets for swyftx
     * @returns {[object]} an array of objects representing market data
     */
    async fetchMarkets (): Promise<Market[]> {
        const assetsUrl = this.urls['api']['public'] + '/markets/assets/';
        const assetsResponse = await this.fetch (assetsUrl, 'GET', undefined);
        //
        //     [
        //         {
        //             "id": "1",
        //             "name": "Australian Dollars",
        //             "code": "AUD",
        //             "minimum_order": "0.001",
        //             "price_scale": 6,
        //             "deposit_enabled": true,
        //             "withdraw_enabled": true,
        //             "min_confirmations": 3,
        //             "min_withdrawal": 5,
        //             "minimum_order_increment": 0.000001,
        //             "mining_fee": 5,
        //             "primary": true,
        //             "secondary": true
        //         },
        //         ...
        //     ]
        //
        const assetsById = this.indexBy (assetsResponse, 'id');
        const result = [];
        // AUD is typically the quote currency (id: 1)
        const audId = '1';
        const audAsset = this.safeValue (assetsById, audId);
        if (!audAsset) {
            throw new ExchangeError (this.id + ' fetchMarkets() could not find AUD asset');
        }
        // Fetch live rates for all assets paired with AUD
        const liveRatesUrl = this.urls['api']['public'] + '/live-rates/' + audId + '/';
        const liveRatesResponse = await this.fetch (liveRatesUrl, 'GET');
        //
        //     {
        //       "1": {
        //         "midPrice": "1.000000",
        //         "askPrice": "1",
        //         "bidPrice": "1",
        //         "buyLiquidityFlag": false,
        //         "sellLiquidityFlag": false,
        //         "dailyPriceChange": null
        //       },
        //       "36": {
        //         "midPrice": "166073.850209200878960915",
        //         "askPrice": "166949.809960979290910719",
        //         "bidPrice": "165200.560607307135510205",
        //         "buyLiquidityFlag": false,
        //         "sellLiquidityFlag": false,
        //         "dailyPriceChange": "-2.5"
        //       },
        //       ...
        //     }
        //
        const quoteCode = this.safeCurrencyCode (this.safeString (audAsset, 'code'));
        const priceScale = this.safeInteger (audAsset, 'price_scale', 6);
        const pricePrecision = Math.pow (10, -priceScale);
        const liveRatesKeys = Object.keys (liveRatesResponse);
        for (let i = 0; i < liveRatesKeys.length; i++) {
            const baseId = liveRatesKeys[i];
            if (baseId === audId) {
                continue; // Skip AUD/AUD pair
            }
            const baseAsset = this.safeValue (assetsById, baseId);
            if (!baseAsset) {
                continue; // Skip if asset not found
            }
            const rateInfo = liveRatesResponse[baseId];
            const base = this.safeCurrencyCode (this.safeString (baseAsset, 'code'));
            const symbol = base + '/' + quoteCode;
            const baseMinimum = this.safeNumber (baseAsset, 'minimum_order');
            const baseMinIncrement = this.safeNumber (baseAsset, 'minimum_order_increment');
            const basePriceScale = this.safeInteger (baseAsset, 'price_scale', 8);
            const amountPrecision = baseMinIncrement || Math.pow (10, -basePriceScale);
            // Check liquidity flags to determine if market is active
            const buyLiquidityFlag = this.safeBool (rateInfo, 'buyLiquidityFlag', false);
            const sellLiquidityFlag = this.safeBool (rateInfo, 'sellLiquidityFlag', false);
            const depositEnabled = this.safeBool (baseAsset, 'deposit_enabled', true);
            const withdrawEnabled = this.safeBool (baseAsset, 'withdraw_enabled', true);
            const active = !buyLiquidityFlag && !sellLiquidityFlag && depositEnabled && withdrawEnabled;
            result.push ({
                'id': baseId + '/' + audId,
                'symbol': symbol,
                'base': base,
                'quote': quoteCode,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': audId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': active,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountPrecision,
                    'price': pricePrecision,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': baseMinimum,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': {
                    'asset': baseAsset,
                    'rate': rateInfo,
                },
            });
        }
        return result;
    }

    /**
     * @method
     * @name swyftx#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (): Promise<Currencies> {
        const url = this.urls['api']['public'] + '/markets/assets/';
        const response = await this.fetch (url, 'GET');
        //
        //     [
        //         {
        //             "id": "1",
        //             "name": "Australian Dollars",
        //             "code": "AUD",
        //             "minimum_order": "0.001",
        //             "price_scale": 6,
        //             "deposit_enabled": true,
        //             "withdraw_enabled": true,
        //             "min_confirmations": 3,
        //             "min_withdrawal": 5,
        //             "minimum_order_increment": 0.000001,
        //             "mining_fee": 5,
        //             "primary": true,
        //             "secondary": true
        //         },
        //         ...
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (this.safeString (currency, 'code'));
            const name = this.safeString (currency, 'name');
            const depositEnabled = this.safeBool (currency, 'deposit_enabled', true);
            const withdrawEnabled = this.safeBool (currency, 'withdraw_enabled', true);
            const active = depositEnabled || withdrawEnabled;
            const miningFee = this.safeNumber (currency, 'mining_fee');
            const priceScale = this.safeInteger (currency, 'price_scale', 8);
            const precision = Math.pow (10, -priceScale);
            const minWithdrawal = this.safeNumber (currency, 'min_withdrawal');
            const minimumOrder = this.safeNumber (currency, 'minimum_order');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': miningFee,
                'precision': precision,
                'limits': {
                    'withdraw': {
                        'min': minWithdrawal,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minimumOrder,
                        'max': undefined,
                    },
                },
                'networks': {},
                'info': currency,
            };
        }
        return result;
    }

    async loadAssetMapping () {
        if (this.options['assetsByCode'] !== undefined) {
            return;
        }
        const url = this.urls['api']['public'] + '/markets/assets/';
        const assets = await this.fetch (url, 'GET');
        const assetsByCode: Dict = {};
        const assetsById: Dict = {};
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const code = this.safeString (asset, 'code');
            const id = this.safeString (asset, 'id');
            assetsByCode[code] = asset;
            assetsById[id] = asset;
        }
        this.options['assetsByCode'] = assetsByCode;
        this.options['assetsById'] = assetsById;
    }

    async fetchMarketInfo (assetCode: string, type: 'basic' | 'detail' = 'basic') {
        const endpoint = type === 'detail' ? 'markets/info/detail/' : 'markets/info/basic/';
        const url = this.urls['api']['public'] + endpoint + assetCode + '/';
        try {
            return await this.fetch (url, 'GET');
        } catch (e) {
            return {};
        }
    }

    /**
     * @method
     * @name swyftx#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (): Promise<TradingFees> {
        await this.loadMarkets ();
        // Swyftx has a flat fee structure unless the user is on Swyftx pro
        const maker = this.parseNumber ('0.006'); // 0.6%
        const taker = this.parseNumber ('0.006'); // 0.6%
        const result: Dict = {};
        const marketSymbols = Object.keys (this.markets);
        for (let i = 0; i < marketSymbols.length; i++) {
            const symbol = marketSymbols[i];
            result[symbol] = {
                'info': {
                    'maker': maker,
                    'taker': taker,
                },
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    /**
     * @method
     * @name swyftx#fetchFundingLimits
     * @description fetch withdrawal limits
     * @returns {object} a list of withdrawal limit structures
     */
    async fetchFundingLimits (): Promise<Dict> {
        await this.loadMarkets ();
        const path = 'limits/withdrawal/';
        const signed = this.sign (path, 'private', 'GET');
        const response = await this.fetch (signed['url'], signed['method'], signed['headers'], signed['body']);
        //
        //     {
        //         "used": 100,
        //         "remaining": 9900,
        //         "limit": 10000,
        //         "rollingCycleHrs": 24
        //     }
        //
        const limit = this.safeNumber (response, 'limit');
        const used = this.safeNumber (response, 'used');
        const remaining = this.safeNumber (response, 'remaining');
        const rollingCycleHrs = this.safeNumber (response, 'rollingCycleHrs', 24);
        return {
            'info': response,
            'withdraw': {
                'AUD': {
                    'limit': limit,
                    'used': used,
                    'remaining': remaining,
                    'cycleInHours': rollingCycleHrs,
                },
            },
        };
    }

    /**
     * @method
     * @name swyftx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // Fetch live rates for the quote currency (typically AUD)
        const url = this.urls['api']['public'] + '/live-rates/' + market['quoteId'] + '/';
        const response = await this.fetch (url, 'GET', undefined);
        // Extract the rate info for the base asset
        const rateInfo = this.safeValue (response, market['baseId']);
        if (!rateInfo) {
            throw new BadRequest (this.id + ' fetchTicker() symbol ' + symbol + ' not found');
        }
        // Optionally fetch detailed market info for additional data
        const detailUrl = this.urls['api']['public'] + '/markets/info/detail/' + market['base'] + '/';
        let detailInfo = {};
        try {
            detailInfo = await this.fetch (detailUrl, 'GET', undefined);
        } catch (e) {
            // Detail info is optional, continue without it
        }
        return this.parseTicker (this.extend (rateInfo, {
            'assetId': market['baseId'],
            'detail': detailInfo,
        }), market);
    }

    /**
     * @method
     * @name swyftx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information for each market over the last 24 hours
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        // Fetch live rates for AUD (quote currency id: 1)
        const audId = '1';
        const url = this.urls['api']['public'] + '/live-rates/' + audId + '/';
        const response = await this.fetch (url, 'GET', undefined, params);
        const result: Dict = {};
        const assetIds = Object.keys (response);
        for (let i = 0; i < assetIds.length; i++) {
            const assetId = assetIds[i];
            if (assetId === audId) {
                continue; // Skip AUD/AUD
            }
            const market = this.markets_by_id[assetId + '/' + audId];
            if (!market) {
                continue;
            }
            const ticker = this.parseTicker (this.extend (response[assetId], {
                'assetId': assetId,
            }), market);
            result[ticker['symbol']] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     live rates response:
        //     {
        //         "midPrice": "166073.850209200878960915",
        //         "askPrice": "166949.809960979290910719",
        //         "bidPrice": "165200.560607307135510205",
        //         "buyLiquidityFlag": false,
        //         "sellLiquidityFlag": false,
        //         "dailyPriceChange": "-2.5"
        //     }
        //
        //     with optional detail info:
        //     {
        //         "name": "Bitcoin",
        //         "id": 3,
        //         "spread": "0.21",
        //         "volume": {
        //             "24H": 31406997550.1617,
        //             "1W": 186491755055.099,
        //             "1M": 721438916725.15,
        //             "marketCap": 158488801708.80835
        //         }
        //     }
        //
        const assetId = this.safeString (ticker, 'assetId');
        if (assetId !== undefined) {
            market = this.safeMarket (assetId + '/' + '1', market); // AUD is quote currency with id 1
        }
        const symbol = market['symbol'];
        const midPrice = this.safeString (ticker, 'midPrice');
        const ask = this.safeString (ticker, 'askPrice');
        const bid = this.safeString (ticker, 'bidPrice');
        const percentage = this.safeString (ticker, 'dailyPriceChange');
        // Check for detailed info
        const detail = this.safeValue (ticker, 'detail', {});
        const volumeInfo = this.safeValue (detail, 'volume', {});
        const volume24h = this.safeString (volumeInfo, '24H');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': midPrice,
            'last': midPrice,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume24h,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name swyftx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
     * @param {int|undefined} limit the maximum amount of candles to fetch
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] 'ask' or 'bid' (default: 'ask')
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.safeString (this.timeframes, timeframe);
        if (resolution === undefined) {
            throw new BadRequest (this.id + ' fetchOHLCV() invalid timeframe ' + timeframe);
        }
        const side = this.safeString (params, 'side', 'ask');
        params = this.omit (params, 'side');
        // Calculate time range
        const now = this.milliseconds ();
        const timeEnd = now;
        let timeStart = since;
        if (since === undefined) {
            // If no start time, get last 24 hours by default
            timeStart = now - 24 * 60 * 60 * 1000;
        }
        if (limit !== undefined && limit > 10000) {
            throw new BadRequest (this.id + ' fetchOHLCV() limit cannot exceed 10000');
        }
        const path = 'charts/v2/getBars/' + market['base'] + '/' + market['quote'] + '/' + side + '/';
        const query: Dict = {
            'resolution': resolution,
            'timeStart': timeStart,
            'timeEnd': timeEnd,
        };
        if (limit !== undefined) {
            query['limit'] = limit;
        }
        const url = this.urls['api']['public'] + '/' + path + '?' + this.urlencode (query);
        const response = await this.fetch (url, 'GET', undefined, params);
        //
        //     [
        //         {
        //             "time": 1517458855347,
        //             "open": 64000,
        //             "high": 64200,
        //             "low": 63900,
        //             "close": 64100,
        //             "volume": 1.5
        //         },
        //         ...
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCVs (ohlcvs: any[], market: Market = undefined, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined): OHLCV[] {
        const result = [];
        for (let i = 0; i < ohlcvs.length; i++) {
            const candle = ohlcvs[i];
            result.push (this.parseOHLCV (candle, market));
        }
        return result;
    }

    parseOHLCV (ohlcv: Dict, market: Market = undefined): OHLCV {
        //
        //     {
        //         "time": 1517458855347,
        //         "open": 64000,
        //         "high": 64200,
        //         "low": 63900,
        //         "close": 64100,
        //         "volume": 1.5
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "id": "12345",
        //         "price": "64000.0",
        //         "amount": "0.1",
        //         "side": "buy",
        //         "timestamp": 1611234567890
        //     }
        //
        const id = this.safeString (trade, 'id');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const side = this.safeString (trade, 'side');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const symbol = market ? market['symbol'] : undefined;
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name swyftx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} params extra parameters specific to the swyftx api endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        await this.loadAssetMapping ();
        const path = 'user/balance/';
        const signed = this.sign (path, 'private', 'GET', params);
        const response = await this.fetch (signed['url'], signed['method'], signed['headers'], signed['body']);
        //
        //     [
        //         {
        //             "assetId": "1",
        //             "availableBalance": "100.2464"
        //         },
        //         {
        //             "assetId": "36",
        //             "availableBalance": "0.0234"
        //         },
        //         ...
        //     ]
        //
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        // Ensure we have the asset mapping loaded
        const assetsById = this.safeValue (this.options, 'assetsById', {});
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const assetId = this.safeString (balance, 'assetId');
            const availableBalance = this.safeString (balance, 'availableBalance');
            // Get currency code from asset ID
            let code = assetId;
            const asset = this.safeValue (assetsById, assetId);
            if (asset !== undefined) {
                code = this.safeCurrencyCode (this.safeString (asset, 'code'));
            } else {
                // Try to look up in markets_by_id
                const marketId = assetId + '/1'; // Try with AUD
                const market = this.safeValue (this.markets_by_id, marketId);
                if (market !== undefined) {
                    code = market['base'];
                }
            }
            const account = this.account ();
            account['free'] = availableBalance;
            account['used'] = undefined; // Not provided by API
            account['total'] = availableBalance; // Only available balance is provided
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name swyftx#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency1 to buy or sell
     * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} params extra parameters specific to the swyftx api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // Determine order type code
        let orderType = undefined;
        if (type === 'market') {
            orderType = (side === 'buy') ? '3' : '4'; // MARKET_BUY = 3, MARKET_SELL = 4
        } else if (type === 'limit') {
            orderType = (side === 'buy') ? '1' : '2'; // LIMIT_BUY = 1, LIMIT_SELL = 2
        } else {
            throw new InvalidOrder (this.id + ' createOrder() does not support order type ' + type);
        }
        // Determine which asset is primary and which is secondary
        // For Swyftx, AUD is typically the quote (secondary) currency
        let primary = market['base'];
        let secondary = market['quote'];
        let quantity = this.amountToPrecision (symbol, amount);
        let assetQuantity = market['base'];
        let trigger = undefined;
        if (type === 'limit' && price !== undefined) {
            if (side === 'buy') {
                // For limit buy orders, price is primary per secondary (e.g., 52000 USD/BTC)
                trigger = this.priceToPrecision (symbol, price);
                // When buying, we specify the amount in quote currency
                primary = market['quote'];
                secondary = market['base'];
                quantity = this.costToPrecision (symbol, amount * price);
                assetQuantity = market['quote'];
            } else {
                // For limit sell orders, price is secondary per primary (e.g., 1 BTC / 52000 USD)
                trigger = this.numberToString (1 / price);
                // When selling, we specify the amount in base currency
                quantity = this.amountToPrecision (symbol, amount);
                assetQuantity = market['base'];
            }
        }
        const request: Dict = {
            'primary': primary,
            'secondary': secondary,
            'quantity': quantity,
            'assetQuantity': assetQuantity,
            'orderType': orderType,
        };
        if (trigger !== undefined) {
            request['trigger'] = trigger;
        }
        const path = 'orders';
        const signed = this.sign (path, 'private', 'POST', this.extend (request, params));
        const response = await this.fetch (signed['url'], signed['method'], signed['headers'], signed['body']);
        //
        //     {
        //         "orderUuid": "ord_4TgCaoJc7pY...",
        //         "order": {
        //             "order_type": 1,
        //             "primary_asset": 2,
        //             "secondary_asset": 293,
        //             "quantity_asset": 293,
        //             "quantity": 4923000,
        //             "trigger": 0.00000923948724,
        //             "status": 1,
        //             "created_time": 1623296438209,
        //             "updated_time": 1623296438200,
        //             "amount": 0.002053467437821649,
        //             "total": 4923000,
        //             "rate": 0.00000923948724,
        //             "aud_value": 99.17152556194523,
        //             "swyftxValue": 99.17132556194523,
        //             "userCountryValue": 76.75975250020123
        //         },
        //         "processed": true
        //     }
        //
        const order = this.safeValue (response, 'order', {});
        return this.parseOrder (this.extend (order, {
            'orderUuid': this.safeString (response, 'orderUuid'),
        }), market);
    }

    /**
     * @method
     * @name swyftx#cancelOrder
     * @description cancels an open order
     * @param {string} id order id (orderUuid)
     * @param {string|undefined} symbol unified symbol of the market the order was made in
     * @param {object} params extra parameters specific to the swyftx api endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderUuid': id,
        };
        // Use manual request construction for DELETE endpoint
        const path = 'orders/' + id + '/';
        const signed = this.sign (path, 'private', 'DELETE', request);
        const response = await this.fetch (signed['url'], signed['method'], signed['headers'], signed['body']);
        //
        // Response 200 (application/json)
        // Successfully cancelled order
        //
        // The API returns an empty response on success
        // We'll return a minimal order object to indicate cancellation
        return {
            'id': id,
            'clientOrderId': undefined,
            'info': response,
            'status': 'canceled',
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fee': undefined,
            'trades': undefined,
        };
    }

    /**
     * @method
     * @name swyftx#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @param {string|undefined} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} since the earliest time in ms to fetch orders for
     * @param {int|undefined} limit the maximum number of order structures to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {number} [params.page] page number for pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let path = 'orders/';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            path += market['base'] + '/';
        }
        const query: Dict = {};
        if (limit !== undefined) {
            query['limit'] = limit;
        }
        const page = this.safeInteger (params, 'page');
        if (page !== undefined) {
            query['page'] = page;
        }
        params = this.omit (params, 'page');
        const signed = this.sign (path, 'private', 'GET', this.extend (query, params));
        const response = await this.fetch (signed['url'], signed['method'], signed['headers'], signed['body']);
        //
        //     [
        //         {
        //             "orderUuid": "ord_123abc...",
        //             "order_type": 3,
        //             "primary_asset": 1,
        //             "secondary_asset": 3,
        //             "quantity_asset": 1,
        //             "quantity": 100,
        //             "trigger": 8500,
        //             "status": 1,
        //             "created_time": 1596684928098,
        //             "updated_time": 1596684928098,
        //             "amount": 100,
        //             "total": 0.01,
        //             "rate": 0.01,
        //             "audValue": 8501.025,
        //             "userCountryValue": 8501.025,
        //             "feeAmount": 12.25,
        //             "feeAsset": 36,
        //             "feeAudValue": 40.25,
        //             "feeUserCountryValue": 40.25
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name swyftx#fetchOrder
     * @description fetches information on an order made by the user
     * @param {string} id the order id (orderUuid)
     * @param {string|undefined} symbol unified symbol of the market the order was made in
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined): Promise<Order> {
        await this.loadMarkets ();
        await this.loadAssetMapping ();
        const path = 'orders/byId/' + id;
        const signed = this.sign (path, 'private', 'GET');
        const response = await this.fetch (signed['url'], signed['method'], signed['headers'], signed['body']);
        //
        //     {
        //         "orderUuid": "ord_123abc...",
        //         "order_type": 3,
        //         "primary_asset": 1,
        //         "secondary_asset": 3,
        //         "quantity_asset": 1,
        //         "quantity": 100,
        //         "trigger": 8500,
        //         "order_source": 3,
        //         "order_source_uuid": "ord_123abc...",
        //         "status": 1,
        //         "created_time": 1596684928098,
        //         "updated_time": 1596684928098,
        //         "amount": 100,
        //         "total": 0.01,
        //         "rate": 0.01,
        //         "audValue": 8501.025,
        //         "userCountryValue": 8501.025,
        //         "feeAmount": 12.25,
        //         "feeAsset": 36,
        //         "feeAudValue": 40.25,
        //         "feeUserCountryValue": 40.25
        //     }
        //
        return this.parseOrder (response);
    }

    parseTradeFromOrder (order: any, market: any = undefined) {
        const ord = this.parseOrder (order, market);
        const timestamp = this.safeInteger (order, 'updated_time');
        const side = ord.side;
        const price = ord.price;
        const amount = ord.amount;     // filled = amount for closed orders
        const cost = ord.cost;
        const fee = ord.fee;
        return {
            'info': order,
            'id': this.safeString (order, 'orderUuid'),
            'order': this.safeString (order, 'orderUuid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': ord.symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': undefined,
            'fee': fee,
            'type': ord.type, // limit / market
        };
    }

    async authenticate () {
        const path = 'auth/refresh/';
        const request = {
            'apiKey': this.apiKey,
        };
        const response = await this.fetch (this.urls['api']['public'] + '/' + path, 'POST', { 'Content-Type': 'application/json' }, this.json (request));
        //
        //     {
        //       "accessToken": "eyJhbGciOiJSUzI1N...",
        //       "scope": "app.account.read ..."
        //     }
        //
        this.accessToken = this.safeString (response, 'accessToken');
        return response;
    }

    /**
     * @method
     * @name swyftx#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @param {string|undefined} symbol unified market symbol
     * @param {int|undefined} since the earliest time in ms to fetch open orders for
     * @param {int|undefined} limit the maximum number of open order structures to retrieve
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit);
        return this.filterByArray (orders, 'status', [ 'open' ], false);
    }

    /**
     * @method
     * @name swyftx#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @param {string|undefined} symbol unified market symbol of the orders fetched
     * @param {int|undefined} since the earliest time in ms to fetch orders for
     * @param {int|undefined} limit the maximum number of order structures to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        // Filter for orders that are 'closed', 'canceled', or 'failed'.
        return this.filterByArray (orders, 'status', [ 'closed', 'canceled', 'failed' ], false);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "orderUuid": "ord_4TgCaoJc7pY...",
        //         "order_type": 1,
        //         "primary_asset": 2,
        //         "secondary_asset": 293,
        //         "quantity_asset": 293,
        //         "quantity": 4923000,
        //         "trigger": 0.00000923948724,
        //         "status": 1,
        //         "created_time": 1623296438209,
        //         "updated_time": 1623296438200,
        //         "amount": 0.002053467437821649,
        //         "total": 4923000,
        //         "rate": 0.00000923948724,
        //         "aud_value": 99.17152556194523,
        //         "swyftxValue": 99.17132556194523,
        //         "userCountryValue": 76.75975250020123
        //     }
        //
        const id = this.safeString (order, 'orderUuid');
        const orderType = this.safeString (order, 'order_type');
        const primaryAssetId = this.safeString (order, 'primary_asset');
        const secondaryAssetId = this.safeString (order, 'secondary_asset');
        // Determine market from asset IDs
        if (market === undefined && primaryAssetId !== undefined && secondaryAssetId !== undefined) {
            const marketId = primaryAssetId + '/' + secondaryAssetId;
            market = this.safeMarket (marketId, market);
        }
        // Parse order type and side
        let type = undefined;
        let side = undefined;
        if (orderType === '1') {
            type = 'limit';
            side = 'buy';
        } else if (orderType === '2') {
            type = 'limit';
            side = 'sell';
        } else if (orderType === '3') {
            type = 'market';
            side = 'buy';
        } else if (orderType === '4') {
            type = 'market';
            side = 'sell';
        }
        // Parse status
        const statusCode = this.safeString (order, 'status');
        let status = undefined;
        if (statusCode === '1') { // Open
            status = 'open';
        } else if (statusCode === '2') { // Insufficient Balance Cancelled
            status = 'canceled';
        } else if (statusCode === '3') { // Partially filled is still open
            status = 'open';
        } else if (statusCode === '4') { // Filled
            status = 'closed';
        } else if (statusCode === '5') { // Pending can be considered open
            status = 'open';
        } else if (statusCode === '6') { // User Cancelled
            status = 'canceled';
        } else if (statusCode === '7') { // Order failed for unknown reason
            status = 'failed';
        } else if (statusCode === '8') { // System Cancelled
            status = 'canceled';
        } else if (statusCode === '9') { // Failed due to being below the minimum trade amount
            status = 'failed';
        } else if (statusCode === '10') { // Refunded
            status = 'canceled';
        }
        const timestamp = this.safeInteger (order, 'created_time');
        const lastTradeTimestamp = this.safeInteger (order, 'updated_time');
        const amount = this.safeString (order, 'amount');
        const total = this.safeString (order, 'total');
        const rate = this.safeString (order, 'rate');
        const trigger = this.safeString (order, 'trigger');
        // For Swyftx, the price depends on the order side
        let price = undefined;
        if (side === 'buy') {
            price = trigger || rate;
        } else if (side === 'sell') {
            // For sell orders, we need to convert back from secondary/primary to primary/secondary
            const triggerFloat = this.parseNumber (trigger || rate);
            if (triggerFloat !== undefined && triggerFloat > 0) {
                price = this.numberToString (1 / triggerFloat);
            }
        }
        // Parse fee information
        let fee = undefined;
        const feeAmount = this.safeString (order, 'feeAmount');
        const feeAssetId = this.safeString (order, 'feeAsset');
        if (feeAmount !== undefined && feeAssetId !== undefined) {
            // Try to get currency code from asset ID
            let feeCurrency = feeAssetId;
            const assetsById = this.safeValue (this.options, 'assetsById', {});
            const feeAsset = this.safeValue (assetsById, feeAssetId);
            if (feeAsset !== undefined) {
                feeCurrency = this.safeString (feeAsset, 'code');
            }
            fee = {
                'currency': feeCurrency,
                'cost': feeAmount,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': market ? market['symbol'] : undefined,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': trigger,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': total,
            'average': rate,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name swyftx#editOrder
     * @description edit a trade order
     * @see https://docs.swyftx.com.au/#tag/Orders/operation/OrdersController_updateExistingOrder // Hypothetical link, actual API doc was provided in prompt
     * @param {string} id order id (orderUuid)
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency1 to buy or sell
     * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency
     * @param {object} params extra parameters specific to the swyftx api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type !== 'limit') {
            throw new NotSupported (this.id + ' editOrder() only supports limit orders');
        }
        if (price === undefined && amount === undefined) {
            throw new InvalidOrder (this.id + ' editOrder() requires `price` and/or `amount` to be specified');
        }
        const requestParams: Dict = {
            'orderUuid': id,
        };
        if (price !== undefined) {
            requestParams['trigger'] = this.priceToPrecision (symbol, price);
        }
        if (amount !== undefined) {
            requestParams['quantity'] = this.amountToPrecision (symbol, amount);
            requestParams['assetQuantity'] = market['base']; // e.g., "BTC"
        }
        const pathTemplate = 'orders/{orderUuid}';
        const signedRequest = this.sign (pathTemplate, 'private', 'PUT', this.extend (requestParams, params));
        const response = await this.fetch (signedRequest['url'], signedRequest['method'], signedRequest['headers'], signedRequest['body']);
        // Expected response: { "orderUuid": "..." }
        const updatedOrderUuid = this.safeString (response, 'orderUuid');
        if (!updatedOrderUuid) {
            throw new ExchangeError (this.id + ' editOrder() failed to update the order. Response: ' + this.json (response));
        }
        // Fetch the updated order to get full details
        return await this.fetchOrder (updatedOrderUuid, symbol);
    }

    async sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (!this.accessToken) {
                await this.authenticate ();
            }
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken,
                'User-Agent': 'ccxt/' + this.version,
            };
            if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST' || method === 'PUT') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                }
            }
        } else if (api === 'auth') {
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'ccxt/' + this.version,
            };
            if (method === 'POST') {
                body = this.json (params);
            }
        } else {
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'ccxt/' + this.version,
            };
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetch (url, method = 'GET', headers = undefined, body = undefined) {
        if (this.needsAuthentication (url, method)) {
            if (!this.accessToken) {
                await this.authenticate ();
            }
        }
        return super.fetch (url, method, headers, body);
    }

    needsAuthentication (url: string, method: string): boolean {
        const isAuthRefresh = url.includes ('auth/refresh/');
        if (isAuthRefresh) {
            return false;
        }
        const baseUrl = this.urls['api']['private'];
        if (!url.startsWith (baseUrl)) {
            return false; // Not an API call for this exchange
        }
        let path = url.substring (baseUrl.length);
        const queryIndex = path.indexOf ('?');
        if (queryIndex !== -1) {
            path = path.substring (0, queryIndex);
        }
        if (path.startsWith ('/')) {
            path = path.substring (1);
        }
        if (path.endsWith ('/')) {
            path.slice (0, -1);
        }
        const privateApis = this.safeValue (this.api, 'private');
        if (!privateApis) {
            return false;
        }
        const httpMethod = method.toLowerCase ();
        const methodEndpoints = this.safeValue (privateApis, httpMethod, []) as string[];
        for (let i = 0; i < methodEndpoints.length; i++) {
            const endpointTemplateInput = methodEndpoints[i];
            let endpointTemplate = endpointTemplateInput;
            if (endpointTemplate.startsWith ('/')) {
                endpointTemplate = endpointTemplate.substring (1);
            }
            if (endpointTemplate.endsWith ('/')) {
                endpointTemplate.slice (0, -1);
            }
            const regexPattern = '^' + endpointTemplate.replace (/{[^}]+}/g, '[^/]+') + '$';
            const regex = new RegExp (regexPattern);
            if (regex.test (path)) {
                return true;
            }
        }
        return false;
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        const error = this.safeString (response, 'error');
        const message = this.safeString (response, 'message', error);
        const errorCode = this.safeString (response, 'code');
        if (error !== undefined || message !== undefined || errorCode !== undefined) {
            const feedback = this.id + ' ' + responseBody;
            if (statusCode === 401 || statusCode === 403) {
                throw new AuthenticationError (feedback);
            } else if (statusCode === 429) {
                throw new RateLimitExceeded (feedback);
            } else if (statusCode === 400) {
                throw new BadRequest (feedback);
            }
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
