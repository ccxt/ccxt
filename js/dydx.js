'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeNotAvailable, AuthenticationError, BadSymbol, ExchangeError, InvalidOrder, InsufficientFunds } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
// const Precise = require ('./base/Precise');

function c(o){console.log(o);} function x(o){c(o);process.exit();}
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
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': undefined,
                'createDepositAddress': undefined,
                'createOrder': true,
                'editOrder': undefined,
                'fetchBalance': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': false,
                'fetchDepositAddress': undefined,
                'fetchDeposits': undefined,
                'fetchMarkets': true,
                'fetchMyTrades': undefined,
                'fetchOHLCV': true,
                'fetchOrder': undefined,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFees': undefined,
                'fetchWithdrawals': undefined,
                'withdraw': undefined,
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
                'www-test': 'https://trade.stage.dydx.exchange/', // TODO: which key should be for test-websites?
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
                        'fast-withdrawals', // implicit
                        'stats/{market}',
                        'historical-funding/{market}',
                        'candles/{market}',
                        'config', // Get default maker and taker fees.
                        'users/exists',
                        'usernames',
                        'time',
                        'leaderboard-pnl',
                    ],
                    'put': [
                        'emails/verify-email',
                    ],
                },
                'private': {
                    'get': [
                        'rewards/public-retroactive-mining', // TODO: write to exchange API team, that this endpoint is listed under 'public' endpoints, but needs apikey
                        'rewards/retroactive-mining',
                        'active-orders',
                        'recovery',
                        'accounts/{id}',
                        'accounts/leaderboard-pnl/{period}',
                        'orders/{id}',
                        'orders/client/{id}',
                        'rewards/weight',
                        'rewards/liquidity',
                        'trades/BTC-USD',
                        'trades/BTC-USD',
                        'registration',
                        'api-keys',
                        'users',
                        'accounts',
                        'positions',
                        'transfers',
                        'orders',
                        // 'orders/client', ? this endpoint was here, but not listed in apidocs
                        'fills',
                        'funding',
                        'historical-pnl',
                    ],
                    'post': [
                        'testnet/tokens',
                        'onboarding',
                        'transfers',
                        'api-keys',
                        'accounts',
                        'withdrawals',
                        'fast-withdrawals',
                        'orders',
                    ],
                    'delete': [
                        'api-keys',
                        'orders',
                        'orders/{id}',
                        'active-orders',
                    ],
                    'put': [
                        'users',
                        'emails/send-verification-email',
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

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        // {
        //     iso: '2022-01-26T10:19:47.576Z',
        //     epoch: '1643192387.576'
        // }
        //
        return this.safeTimestamp (response, 'epoch');
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
        const takerOrMaker = 'taker';
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

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': '',
        };
        const response = await this.publicGetStatsMarket (this.extend (request, params));
        // {
        //     markets: {
        //       'ETH-USD': {
        //         market: 'ETH-USD',
        //         open: '2417.7',
        //         high: '2520',
        //         low: '2364.8',
        //         close: '2494.6',
        //         baseVolume: '225412.440',
        //         quoteVolume: '551363381.1817',
        //         type: 'PERPETUAL',
        //         fees: '131095.349933'
        //       },
        //       ...
        //     }
        // }
        //
        const data = this.safeValue (response, 'markets', []);
        return this.parseTickers (data, symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetStatsMarket (this.extend (request, params));
        //
        // {
        //     markets: {
        //       'ETH-USD': {
        //         market: 'ETH-USD',
        //         open: '2417.7',
        //         high: '2520',
        //         low: '2364.8',
        //         close: '2494.6',
        //         baseVolume: '225412.440',
        //         quoteVolume: '551363381.1817',
        //         type: 'PERPETUAL',
        //         fees: '131095.349933'
        //       }
        //     }
        // }
        //
        const markets = this.safeValue (response, 'markets', {});
        const ticker = this.safeValue (markets, market['id'], {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        const marketId = this.safeString (ticker, 'market');
        market = this.safeMarket (marketId, market, '-');
        const open = this.safeString (ticker, 'open');
        const high = this.safeString (ticker, 'high');
        const low = this.safeString (ticker, 'low');
        const close = this.safeString (ticker, 'close');
        const baseVolume = this.safeString (ticker, 'baseVolume');
        const quoteVolume = this.safeString (ticker, 'quoteVolume');
        return this.safeTicker ({
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': undefined,
            'datetime': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'high': high,
            'low': low,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market, false);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // https://docs.dydx.exchange/?json#create-a-new-order
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side.toUpperCase (),
            'type': type.toUpperCase (), // MARKET, LIMIT, STOP_LIMIT, TRAILING_STOP or TAKE_PROFIT.
            'size': this.amountToPrecision (market['symbol'], amount),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (market['symbol'], price);
        }
        const response = await this.privatePostOrders (request);
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // https://docs.dydx.exchange/?json#create-a-new-order
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetOrders (request);
        return response; // this.parseOrder (response, market);
    }

    async generateApiKey (generateOrCreate = false) { // https://docs.dydx.exchange/#recover-default-api-credentials
        const { DydxClient } = require ('@dydxprotocol/v3-client');
        const Web3 = require ('web3');
        const web3 = new Web3 ();
        web3.eth.accounts.wallet.add (this.privateKey);
        const client = new DydxClient ('https://api.dydx.exchange', { web3 });
        const apiCreds = generateOrCreate ? await client.onboarding.recoverDefaultApiCredentials (this.walletAddress) : await client.ethPrivate.createApiKey (this.walletAddress);
        return apiCreds;
    }

    async generateApiKey2 (params = undefined) { //  https://github.com/dydxprotocol/v3-client/blob/f5589b4a9c1501a7a318a5500d5195edfe7e28b2/src/modules/onboarding.ts#L162
        return {};
    }

    async registerApiKey (params = undefined) { // https://docs.dydx.exchange/#register-api-key
        const response = await this.privatePostApiKeys (params);
        return response;
    }

    async makeOnboard (params = undefined) { // https://docs.dydx.exchange/#recover-default-api-credentials
        const response = await this.privatePostOnboarding (params);
        return response;
    }

    sign (path, api = 'private', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeString (this.options, 'version', 'v3');
        let url = this.urls['api'][api] + '/' + version + '/' + this.implodeParams (path, params);
        const pathForAuth = '/' + version + '/' + this.implodeParams (path, params);
        let query = undefined;
        if (method === 'GET') {
            query = this.urlencode (params);
            url = url + '?' + query;
        }
        if (api === 'private') {
            let isApiKeyBased = false;
            let isPrivateKeyBased = false;
            if (headers === undefined) {
                headers = {};
            }
            const paramsEncoded = this.urlencode (params);
            const paramsJson = this.json (params);
            const isoTimestamp = this.iso8601 (this.milliseconds ());  // new Date ().toISOString ();
            headers['DYDX-TIMESTAMP'] = isoTimestamp;
            if (path === 'onboarding') { // it's only POST
                isPrivateKeyBased = true;
            } else {
                isApiKeyBased = true;
            }
            // now, decide the desired path
            if (isApiKeyBased) {
                headers['DYDX-API-KEY'] = this.apiKey;
                headers['DYDX-PASSPHRASE'] = this.passPhrase;
                const argumentsBody = {};
                argumentsBody['timestamp'] = isoTimestamp;
                argumentsBody['method'] = method;
                argumentsBody['requestPath'] = pathForAuth;
                if (method === 'POST') {
                    argumentsBody['body'] = params;
                    body = argumentsBody;
                }
                const argumentsBodyJson = this.json (argumentsBody);
                const authString = isoTimestamp + method + pathForAuth + paramsEncoded;
                const authStringJson = this.json (authString);
                const signature = this.hmac (this.encode (authStringJson), this.encode (this.secret), 'sha256', 'base64');
                headers['DYDX-SIGNATURE'] = signature;
            } else if (isPrivateKeyBased) {
                // ref: https://github.com/dydxprotocol/v3-client/blob/master/src/modules/eth-private.ts#L42
                headers['DYDX-ETHEREUM-ADDRESS'] = this.walletAddress;
                body['action'] = 'DYDX-ONBOARDING';
                body['onlySignOn'] = 'https://trade.dydx.exchange';
                // const obj = method + path + isoTimestamp + paramsEncoded;
                // const auth = this.walletAddress + 'sha256' + isoTimestamp + this.json (obj);
                const signature = this.createDydxSign ({
                    'requestPath': '/' + version + '/' + path,
                    'method': method,
                    'isoTimestamp': isoTimestamp,
                    // 'data':  { 'market': 'BTC-USD', 'side': 'BUY', 'type': 'LIMIT', 'size': 0.0001, 'price': 3000, },
                    'data': params,
                }, this.secret);
                headers['DYDX-SIGNATURE'] = signature;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    createDydxSign({
        requestPath,
        method,
        isoTimestamp,
        data,
      }, apiSecret) {
        const messageString = isoTimestamp + method + requestPath + JSON.stringify(data); 
        const crypto = require ('crypto');
        return crypto.createHmac (
          'sha256',
          Buffer.from (apiSecret, 'base64'),
        ).update (messageString).digest ('base64');
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
