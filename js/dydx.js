'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeNotAvailable, AuthenticationError, BadSymbol, ExchangeError, InvalidOrder, InsufficientFunds } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
// const Precise = require ('./base/Precise');
// function c(o){console.log(o);} function x(o){c(o);process.exit();}
// ----------------------------------------------------------------------------

module.exports = class dydx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dydx',
            'name': 'dYdX',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'version': 'v3',
            'has': {
                'CORS': true,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': false,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1MIN',
                '5m': '5MINS',
                '15m': '15MINS',
                '30m': '30MINS',
                '1h': '1HOUR',
                '4h': '4HOURS',
                '1d': '1DAY',
            },
            'urls': {
                'logo': '',
                'test': {
                    'public': 'https://api.stage.dydx.exchange',
                    'private': 'https://api.stage.dydx.exchange',
                },
                'api': {
                    'public': 'https://api.dydx.exchange',
                    'private': 'https://api.dydx.exchange',
                },
                'www': 'https://trade.dydx.exchange/',
                'www-test': 'https://trade.stage.dydx.exchange/',
                'doc': [
                    'https://docs.dydx.exchange/',
                ],
                'referral': '',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'orderbook/{market}',
                        'trades/{market}',
                        'fast-withdrawals',
                        'stats',
                        'historical-funding',
                        'candles/{market}',
                        'users/exists',
                        'usernames',
                        'time',
                        'config', // Get default maker and taker fees.
                    ],
                },
                'private': {
                    'get': [
                        'registration',
                        'api-keys',
                        'users',
                        'accounts',
                        'positions',
                        'transfers',
                        'orders',
                        'orders/client',
                        'fills',
                        'funding',
                        'historical-pnl',
                    ],
                    'post': [
                        'api-keys',
                        'accounts',
                        'withdrawals',
                        'fast-withdrawals',
                        'orders',
                    ],
                    'delete': [
                        'api-keys',
                        'orders',
                    ],
                    'put': [
                        'users',
                    ],
                },
            },
            'commonCurrencies': {
                //
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false, // complicated tier system per coin
                    'percentage': true,
                    'maker': 0.05 / 100,
                    'taker': 0.1 / 100,
                },
            },
            'exceptions': {
                'exact': {
                    '404': ExchangeNotAvailable,
                    '403': AuthenticationError,
                    '400': ExchangeError,
                },
                'broad': {
                    'See /corsdemo for more info': AuthenticationError,
                    'Invalid signature for onboarding request': AuthenticationError,
                    'Invalid signature for ApiKey request': AuthenticationError,
                    'Not Found': ExchangeNotAvailable,
                    'market must be a valid market (BTC-USD, etc)': BadSymbol,
                    'Invalid value': ExchangeError,
                    'AccountNotFoundError': AuthenticationError,
                    'market must be a valid market': BadSymbol,
                    'Invalid market': BadSymbol,
                    'Order is below minimum size of 20000000000000000000': InvalidOrder,
                    'Order would put account under the collateralization threshold': InsufficientFunds,
                    'insufficient funds for gas * price + value': InsufficientFunds,
                },
            },
            'requiredCredentials': {
                'ethereumAddress': true,
                'privateKey': true, // Ethereum Key Authentication
                'apiKey': true, // API Key Authentication
                'secret': true, // API Key Authentication
                'passPhrase': true, // API Key Authentication
                // 'starkKeyYCoordinate': true, // STARK Key Authentication
                // 'starkKey': true, // STARK Key Authentication
            },
        });
    }

    async fetchMarkets (params = {}) {
        // const configResponse = await this.publicGetConfig ();
        //
        // {
        //     collateralAssetId: '0x02893294412a4c8f915f75892b395ebbf6859ec246ec365c3b1f56f47c3a0a5d',
        //     collateralTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        //     defaultMakerFee: '0.0005',
        //     defaultTakerFee: '0.001',
        //     exchangeAddress: '0xD54f502e184B6B739d7D27a6410a67dc462D69c8',
        //     maxExpectedBatchLengthMinutes: '720',
        //     maxFastWithdrawalAmount: '200000',
        //     cancelOrderRateLimiting: {
        //       maxPointsMulti: '3',
        //       maxPointsSingle: '8500',
        //       windowSecMulti: '10',
        //       windowSecSingle: '10'
        //     },
        //     placeOrderRateLimiting: {
        //       maxPoints: '1000',
        //       windowSec: '10',
        //       targetNotional: '40000',
        //       minLimitConsumption: '4',
        //       minMarketConsumption: '20',
        //       minTriggerableConsumption: '100',
        //       maxOrderConsumption: '100'
        //     }
        // }
        //
        const marketsResponse = await this.publicGetMarkets (params);
        //
        // {
        //     markets: {
        //       'BTC-USD': {
        //         market: 'BTC-USD',
        //         status: 'ONLINE',
        //         baseAsset: 'BTC',
        //         quoteAsset: 'USD',
        //         stepSize: '0.0001',
        //         tickSize: '1',
        //         indexPrice: '36404.9150',
        //         oraclePrice: '36373.8400',
        //         priceChange24H: '2984.245000',
        //         nextFundingRate: '-0.0000519113',
        //         nextFundingAt: '2022-01-25T14:00:00.000Z',
        //         minOrderSize: '0.001',
        //         type: 'PERPETUAL',
        //         initialMarginFraction: '0.05',
        //         maintenanceMarginFraction: '0.03',
        //         volume24H: '865742935.580100',
        //         trades24H: '142258',
        //         openInterest: '5290.9970',
        //         incrementalInitialMarginFraction: '0.01',
        //         incrementalPositionSize: '1.5',
        //         maxPositionSize: '170',
        //         baselinePositionSize: '9',
        //         assetResolution: '10000000000',
        //         syntheticAssetId: '0x4254432d3130000000000000000000'
        //       },
        //       ...
        //    }
        // }
        //
        const result = [];
        const markets = this.safeValue (marketsResponse, 'markets');
        const keys = Object.keys (markets);
        const settleId = 'USDC'; // https://docs.dydx.exchange/#margin
        for (let i = 0; i < keys.length; i++) {
            const marketKey = keys[i];
            const market = markets[marketKey];
            const id = this.safeString (market, 'market', marketKey);
            const active = this.safeString (market, 'status') === 'ONLINE';
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const symbol = this.symbolDefine (base, quote, settle);
            const stepSize = this.safeNumber (market, 'stepSize');
            const tickSize = this.safeNumber (market, 'tickSize');
            const minOrderSize = this.safeNumber (market, 'minOrderSize');
            const type = this.safeString (market, 'type');
            const spot = false;
            const future = false;
            const swap = (type === 'PERPETUAL');
            const option = false;
            const contract = future || swap;
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': spot,
                'margin': false,
                'future': future,
                'swap': swap,
                'option': option,
                'active': active,
                'contract': contract,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'price': tickSize,
                    'amount': stepSize,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minOrderSize,
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
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    symbolDefine (baseCode, quoteCode, settleCode = undefined, deliveryDate = undefined) { // TODO: can be unified method? users will use to avoid any mistakes
        let symbol = baseCode + '/' + quoteCode;
        if (settleCode !== undefined) {
            symbol += ':' + settleCode;
        }
        if (deliveryDate !== undefined) {
            symbol += '-' + deliveryDate;
        }
        return symbol;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetOrderbookMarket (this.extend (request, params));
        //
        // {
        //     asks: [
        //       { size: '39.991', price: '12.1' },
        //       { size: '106.19', price: '12.3' },
        //       ...
        //     },
        //     bids: [
        //       { size: '14.909', price: '11.9' },
        //       { size: '24', price: '11.8' },
        //       ...
        //     }
        // }
        //
        return this.parseOrderBook (response, symbol, undefined, 'bids', 'asks', 'price', 'size');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        // we skip `since` param, because exchange's `startingBeforeOrAt` is an opposite concept of `since`
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const response = await this.publicGetTradesMarket (this.extend (request, params));
        //
        // {
        //   "trades": [
        //     {
        //       "side": "BUY",
        //       "size": "0.001",
        //       "price": "29000",
        //       "createdAt": "2021-01-05T16:33:43.163Z" // most recent item in top of response
        //     },
        //     ...
        //   ]
        // }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    parseTrade (trade, market) {
        let id = undefined;
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'size');
        const dateString = this.safeString (trade, 'createdAt');
        const timestamp = this.parseDate (dateString);
        const symbol = this.safeSymbol (undefined, market, '-');
        const sideString = this.safeString (trade, 'side');
        const side = (sideString === 'BUY') ? 'buy' : 'sell';
        const takerOrMaker = true;
        if (id === undefined) { // reconstruct artificially, if it doesn't exist
            id = this.syntheticTradeId (market, timestamp, side, amount, price);
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': 'limit',
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'info': trade,
        });
    }

    syntheticTradeId (market, timestamp, side, amount, price) { // TODO: can be unified method? this approach is being used by multiple exchanges (mexc, woo-coinsbit, dydx, ...)
        let id = '';
        if (timestamp !== undefined) {
            const marketIdStr = this.safeString (market, 'id', '');
            const amountStr = (amount === undefined) ? '' : amount;
            const sideStr = (side === undefined) ? '' : side;
            const priceStr = (price === undefined) ? '' : price;
            id = this.numberToString (timestamp) + '-' + marketIdStr + '-' + sideStr + '-' + amountStr + '-' + priceStr;
        }
        return id;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['fromISO'] = this.iso8601 (since);
        }
        const response = await this.publicGetCandlesMarket (this.extend (request, params));
        //
        // {
        //   "candles": [
        //     {
        //       startedAt: '2022-01-26T07:34:00.000Z',
        //       updatedAt: '2022-01-26T07:34:51.810Z',
        //       "market": "BTC-USD",
        //       "resolution": "1MIN",
        //       "low": "40000",
        //       "high": "45000",
        //       "open": "45000",
        //       "close": "40000",
        //       "baseTokenVolume": "1.002",
        //       "trades": "3",
        //       "usdVolume": "45085",
        //       "startingOpenInterest": "28"
        //     },
        //     ...
        //   ]
        // }
        //
        const data = this.safeValue (response, 'candles', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        const startedAt = this.safeString (ohlcv, 'startedAt');
        const timestamp = this.parseDate (startedAt);
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        // const volume = this.safeNumber (ohlcv, 'usdVolume');
        const baseTokenVolume = this.safeNumber (ohlcv, 'baseTokenVolume');
        return [ timestamp, open, high, low, close, baseTokenVolume ];
    }

    sign (path, api = 'private', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeString (this.options, 'version', 'v3');
        let url = this.urls['api']['private'] + '/' + version + '/' + this.implodeParams (path, params);
        let payload = undefined;
        headers = {
            'Content-Type': 'application/json',
        };
        let query = undefined;
        if (method === 'GET') {
            query = this.urlencode (params);
            url = url + '?' + query;
        } else {
            body = this.json (params);
        }
        const timestamp = this.milliseconds ();
        if (api === 'private') {
            if (method === 'GET') {
                payload = query;
            } else {
                payload = body;
            }
            if (path === 'onboarding') {
                if (method === 'POST') {
                    // onboarding endpoint: POST /v3/onboarding
                    headers['DYDX-ETHEREUM-ADDRESS'] = this.ethereumAddress;
                    payload['action'] = 'DYDX-ONBOARDING';
                    payload['onlySignOn'] = 'https://trade.dydx.exchange';
                    const signature = this.hmac (this.encode (payload), this.encode (this.secret));
                    headers['DYDX-SIGNATURE'] = signature; // EIP-712-compliant Ethereum signature
                }
            } else if (method === 'DELETE') {
                if (path === 'api-keys') {
                    // Ethereum Key Private Endpoints: POST, DELETE /v3/api-keys
                    headers['DYDX-TIMESTAMP'] = timestamp;
                    headers['DYDX-ETHEREUM-ADDRESS'] = this.ethereumAddress;
                    payload['method'] = 'GET|POST';
                    payload['requestPath'] = '/v3/api-keys';
                    payload['body'] = ''; // empty for GET and DELETE
                    payload['timestamp'] = timestamp;
                    const signature = this.hmac (this.encode (payload), this.encode (this.secret));
                    headers['DYDX-SIGNATURE'] = signature; // EIP-712-compliant Ethereum signature
                }
            } else {
                // All other API Key Private Endpoints
                headers['DYDX-TIMESTAMP'] = timestamp;
                headers['DYDX-ETHEREUM-ADDRESS'] = this.ethereumAddress;
                headers['DYDX-PASSPHRASE'] = this.passPhrase;
                const signature = this.hmac (this.encode (payload), this.encode (this.secret));
                headers['DYDX-SIGNATURE'] = signature; // SHA-256 HMAC produced as described below, and encoded as a Base64 string
            }
        }
        return { 'url': url, 'method': method, 'body': payload, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            if (typeof body === 'string') {
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, this.id + ' ' + body);
            }
            return; // fallback to default error handler
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'error', '');
        this.throwExactlyMatchedException (this.exceptions['exact'], message, this.id + ' ' + message);
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, this.id + ' ' + message);
        this.throwBroadlyMatchedException (this.exceptions['broad'], body, this.id + ' ' + body);
    }
};
