'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, BadRequest, ExchangeNotAvailable, AuthenticationError, BadSymbol, ExchangeError, InvalidOrder, InsufficientFunds } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

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
                'CORS': false,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'cancelAllOrders': undefined, // TODO, needs stark sign
                'createDepositAddress': false,
                'createOrder': undefined, // TODO, needs stark sign
                'fetchBalance': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': false,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFees': undefined,
                'fetchTransactions': true,
                'fetchWithdrawals': false,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': undefined, // TODO, needs stark sign
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
                    'get': {
                        'markets': 60,
                        'orderbook/{market}': 60,
                        'trades/{market}': 60,
                        'fast-withdrawals': 60, // implicit
                        'stats/{market}': 60,
                        'historical-funding/{market}': 60,
                        'candles/{market}': 60,
                        'config': 60, // Get default maker and taker fees.
                        'users/exists': 60,
                        'usernames': 60,
                        'time': 60,
                        'leaderboard-pnl': 60,
                    },
                    'put': {
                        'emails/verify-email': 60,
                    },
                },
                'private': {
                    'get': {
                        'rewards/public-retroactive-mining': 60, // TODO: write to exchange API team, that this endpoint is listed under 'public' endpoints, but needs apikey
                        'rewards/retroactive-mining': 60,
                        'active-orders': 1, // variable
                        'recovery': 60,
                        'accounts': 60,
                        'accounts/{id}': 60,
                        'accounts/leaderboard-pnl/{period}': 60,
                        'orders/{id}': 1, // variable
                        'orders/client/{id}': 1, // variable
                        'rewards/weight': 60,
                        'rewards/liquidity': 60,
                        'registration': 60,
                        'api-keys': 60,
                        'users': 60, // can ge taker/maker fees https://docs.dydx.exchange/#get-user
                        'positions': 60,
                        'transfers': 60,
                        'orders': 1, // variable
                        'fills': 60,
                        'funding': 60,
                        'historical-pnl': 60,
                    },
                    'post': {
                        'testnet/tokens': 172800,
                        'onboarding': 60,
                        'transfers': 60,
                        'api-keys': 60,
                        'accounts': 60,
                        'withdrawals': 60,
                        'fast-withdrawals': 60,
                        'orders': 1, // variable
                    },
                    'delete': {
                        'api-keys': 60,
                        'orders': 1, // variable, 3 requests per 10 seconds PER SYMBOL
                        'orders/{id}': 1, // variable, 250 requests per 10 seconds PER SYMBOL
                        'active-orders': 1, // variable
                    },
                    'put': {
                        'users': 60,
                        'emails/send-verification-email': 3000,
                    },
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
                    'dydx-api-key': AuthenticationError,
                    'dydx-passphrase': AuthenticationError,
                    'dydx-timestamp': BadRequest,
                },
                'broad': {
                    'must be a valid string that is less than length:': BadRequest,
                    'Cannot read property ': BadRequest,
                    'signature must be a string': AuthenticationError,
                    'must be a boolean': BadRequest,
                    'Invalid number': BadRequest,
                    'expiration must be an ISO8601 string': BadRequest,
                    'Invalid signature for order': InvalidOrder,
                    'No order for market: ': InvalidOrder,
                    'status must be a valid array of subset': BadRequest,
                    'API key not found': AuthenticationError,
                    'api-key must be a valid UUID in headers': AuthenticationError,
                    'Unauthorized': AuthenticationError,
                    'passphrase must be a valid base64url string in headers that is 20 characters long': AuthenticationError,
                    'timestamp must be a valid ISO string in headers': BadRequest,
                    // old
                    'See /corsdemo for more info': AuthenticationError,
                    'Invalid signature for onboarding request': AuthenticationError,
                    'Invalid signature for ApiKey request': AuthenticationError,
                    'Not Found': ExchangeNotAvailable,
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
                // 'walletAddress': true,
                // 'privateKey': true, // Ethereum Key Authentication
                'apiKey': true,
                'secret': true,
                'password': true,
                // 'starkKeyYCoordinate': true, // STARK Key Authentication
                // 'starkKey': true, // STARK Key Authentication
            },
            'options': {
                'mainCurrency': 'USDC',
                'limitFee': 0.01, // 1% // TODO: this needs to be defined automatically, from either /users or /config endpoints, however we don't implement them
                'gtcDate': '2099-12-31T23:59:59.999Z',
                'fetchOpenOrdersMethod': 'privateGetOrders',  // 'privateGetActiveOrders' (higher rate-limits, less informational) or 'privateGetOrders' (lower rate-limit, more informational)
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
        const settleId = this.options['mainCurrency']; // https://docs.dydx.exchange/#margin
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
            const symbol = base + '/' + quote + ':' + settle;
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
        const marketId = this.safeString (trade, 'market');
        market = this.safeMarket (marketId, market);
        let id = this.safeString (trade, 'id');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'size');
        const type = this.parseOrderType (this.safeString (trade, 'type'));
        const timestamp = this.parseDate (this.safeString (trade, 'createdAt'));
        const side = this.parseOrderSide (this.safeString (trade, 'side'));
        const takerOrMaker = this.parseTakerMaker (this.safeString (trade, 'liquidity'));
        let fee = undefined;
        const cost = this.safeNumber (trade, 'fee');
        if (cost !== undefined) {
            fee = {
                'cost': cost,
                'currency': this.options['mainCurrency'],
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        if (id === undefined) {
            id = this.syntheticTradeId (market, timestamp, side, amount, price, type, takerOrMaker);
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'fee': fee,
            'info': trade,
        });
    }

    syntheticTradeId (market = undefined, timestamp = undefined, side = undefined, amount = undefined, price = undefined, orderType = undefined, takerOrMaker = undefined) {
        // TODO: can be unified method? this approach is being used by multiple exchanges (mexc, woo-coinsbit, dydx, ...)
        let id = '';
        if (timestamp !== undefined) {
            id = this.numberToString (timestamp) + '-' + this.safeString (market, 'id', '_');
            if (side !== undefined) {
                id += '-' + side;
            }
            if (orderType !== undefined) {
                id += '-' + orderType;
            }
            if (takerOrMaker !== undefined) {
                id += '-' + takerOrMaker;
            }
            if (amount !== undefined) {
                id += '-' + this.numberToString (amount);
            }
            if (price !== undefined) {
                id += '-' + this.numberToString (price);
            }
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

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccounts (params);
        // {
        //     accounts: [
        //       {
        //         starkKey: "02d484e0f494ae46b8342f25a11bcd94848d09c1b619e4a6ddcaef604535aee1",
        //         positionId: "164655",
        //         equity: "28.546065",
        //         freeCollateral: "28.546065",
        //         pendingDeposits: "0.000000",
        //         pendingWithdrawals: "0.000000",
        //         openPositions: {
        //         },
        //         accountNumber: "0",
        //         id: "f1d419ed-dc09-529e-81ae-fdced89a398c",
        //         quoteBalance: "28.546065",
        //         createdAt: "2022-01-25T13:03:17.370Z",
        //       },
        //     ],
        // }
        const accounts = this.safeValue (response, 'accounts');
        const firstAcc = this.safeValue (accounts, 0);
        const timestamp = this.parse8601 (this.safeString (firstAcc, 'createdAt'));
        const result = {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const code = this.options['mainCurrency'];
        for (let i = 0; i < accounts.length; i++) {
            const currentAcc = accounts[i];
            const account = this.account ();
            account['free'] = this.safeString (currentAcc, 'freeCollateral');
            account['used'] = this.safeString (currentAcc, 'unavailable');
            account['total'] = this.safeString (currentAcc, 'equity');
            result[code] = account;
        }
        result['info'] = response;
        return this.safeBalance (result);
    }

    async fetchPosition (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const market = this.market (symbol);
        request['market'] = market['id'];
        request['status'] = this.parsePositionStatus ('open', true);
        const response = await this.fetchPositions (undefined, this.extend (request, params));
        return this.safeValue (response, 0);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetPositions (params);
        // {
        //     positions: [
        //       {
        //         market: "ETH-USD",
        //         status: "OPEN",
        //         side: "SHORT",
        //         size: "-0.144",
        //         maxSize: "-0.144",
        //         entryPrice: "3243.100000",
        //         exitPrice: "0.000000",
        //         unrealizedPnl: "0.079920",
        //         realizedPnl: "0.000000",
        //         createdAt: "2022-02-10T12:25:51.956Z",
        //         closedAt: null,
        //         sumOpen: "0.144",
        //         sumClose: "0",
        //         netFunding: "0",
        //       },
        //     ],
        //   }
        const data = this.safeValue (response, 'positions');
        return this.parsePositions (data);
    }

    parsePositionStatus (status, reversed = false) {
        let statuses = {
            'OPEN': 'open',
            'CLOSED': 'closed',
        };
        if (reversed) {
            statuses = this.changeKeyValue (statuses);
        }
        return this.safeString (statuses, status, status);
    }

    parsePositionSide (status, reversed = false) {
        let statuses = {
            'LONG': 'long',
            'SHORT': 'short',
        };
        if (reversed) {
            statuses = this.changeKeyValue (statuses);
        }
        return this.safeString (statuses, status, status);
    }

    parsePositions (positions) {
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            result.push (this.parsePosition (positions[i]));
        }
        return result;
    }

    parsePosition (position, market = undefined) {
        const side = this.parsePositionSide (this.safeString (position, 'side'));
        const size = this.safeNumber (position, 'size');
        const marketId = this.safeString (position, 'market');
        market = this.safeMarket (marketId, market);
        const status = this.safeString (position, 'status') === 'OPEN' ? 'open' : 'closed';
        const timestamp = this.parse8601 (this.safeString (position, 'createdAt'));
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.safeNumber (position, 'entryPrice'),
            'exitPrice': this.safeNumber (position, 'exitPrice'),
            'status': status,
            'notional': undefined,
            'leverage': undefined,
            'unrealizedPnl': this.safeNumber (position, 'unrealizedPnl'),
            'contracts': size,
            'contractSize': undefined,
            'realisedPnl': this.safeNumber (position, 'realizedPnl'),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': undefined,
            'collateral': this.options['mainCurrency'],
            'marginType': undefined,
            'side': side,
            'percentage': undefined,
            'info': position,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // Math.min (limit, 100);
        }
        const response = await this.privateGetTransfers (this.extend (request, params));
        // {
        //    transfers : [
        //      {
        //       id: "2214697e-3d51-54d3-b89d-baa0029e0330",
        //       type: "DEPOSIT",
        //       debitAsset: "USDT",
        //       creditAsset: "USDC",
        //       debitAmount: "27.272748",
        //       creditAmount: "28.546065",
        //       transactionHash: "0xf9c11fa258b4eb4a9109444a367b23b1ba1882b5650c1f4bfa86d6b1048ae99d",
        //       status: "CONFIRMED",
        //       createdAt: "2022-02-10T07:39:09.892Z",
        //       confirmedAt: "2022-02-10T07:39:09.924Z",
        //       clientId: null,
        //       fromAddress: null,
        //       toAddress: null,
        //      },
        //   ]
        // }
        const data = this.safeValue (response, 'transfers');
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransactionStatus (status, reversed = false) {
        let statuses = {
            'PENDING': 'pending',
            'CONFIRMED': 'ok',
        };
        if (reversed) {
            statuses = this.changeKeyValue (statuses);
        }
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (status, reversed = false) {
        let statuses = {
            'DEPOSIT': 'deposit',
            'WITHDRAWAL': 'withdraw',
            'FAST_WITHDRAWAL': 'withdraw',
        };
        if (reversed) {
            statuses = this.changeKeyValue (statuses);
        }
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAt'));
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'transactionHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': this.safeString (transaction, 'fromAddress:'),
            'address': undefined,
            'addressTo': this.safeString (transaction, 'toAddress'),
            'amount': this.safeNumber (transaction, 'creditAmount'),
            'type': this.parseTransactionType (this.safeString (transaction, 'type')),
            'currency': this.safeCurrencyCode (this.safeString (transaction, 'creditAsset')),
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': this.parse8601 (this.safeString (transaction, 'confirmedAt')),
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
            'info': transaction,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': this.parseOrderSide (side, true),
            'type': this.parseOrderType (type, true),
            'size': this.amountToPrecision (market['symbol'], amount),
            // 'signature': 'edfwefweawds
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (market['symbol'], price);
        }
        // [Required] limitFee
        request['limitFee'] = this.safeString (params, 'limitFee', this.options['limitFee']);
        // [Required] timeInForce & expiration
        const timeInForce = this.safeString (params, 'timeInForce', 'GTC');
        if (timeInForce === 'GTC') {
            request['expiration'] = this.options['gtcDate']; // simulate GTC, because only GTT supported, so set it as unrealistic future
        }
        // [Required] postOnly
        const postOnly = this.safeString (params, 'postOnly');
        if (postOnly === undefined) {
            request['postOnly'] = false;  // default to false
        }
        // [Required] clientId
        const clientOrderId = this.safeString2 (params, 'clientId', 'clientOrderId');
        request['clientId'] = (clientOrderId !== undefined) ? clientOrderId : this.nonce ().toString ();
        params = this.omit (params, [ 'clientOrderId' ]);
        const response = await this.privatePostOrders (this.extend (request, params));
        // TODO
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        let request = undefined;
        let order = undefined;
        // if symbol is inputed, then use this endpoint because of higher Ratelimits (yeah, bad api design, but as is..): https://docs.dydx.exchange/#cancel-active-orders
        if (symbol !== undefined) {
            const side = this.safeString (params, 'side');
            if (side === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() does not require `symbol` argument, however, if you set that argument, then you also need to set exchange-specific parameter `side` to either: `BUY` or `SELL`.');
            }
            const market = this.market (symbol);
            request = {
                'id': id,
                'side': side,
                'market': market['id'],
            };
            response = await this.privateDeleteActiveOrders (this.extend (request, params));
            // {
            //     "cancelOrders": [
            //         {
            //             "accountId": "a6e392ed-ea82-419e-81ae-abdde89a638c",
            //             "market": "MATIC-USD",
            //             "side": "BUY",
            //             "id": "1ae4ed6910303442c616f8f332d3aff70d09e3e16bd429ea9c230ebed4021ea",
            //             "remainingSize": "11",
            //             "price": "1"
            //         }
            //     ]
            // }
            const orders = this.safeValue (response, 'cancelOrders');
            order = this.safeValue (orders, 0);
        } else {
            request = {
                'orderId': id,
                'id': id, // this is needed for path
            };
            response = await this.privateDeleteOrdersId (this.extend (request, params));
            // {
            //     cancelOrder: {
            //       id: "74d1338670a8644055a8432c22001205a96e611c9c4dbca423e932243319e44",
            //       clientId: "6963517527009325",
            //       accountId: "a6e392ed-ea82-419e-81ae-abdde89a638c",
            //       market: "ETH-USD",
            //       side: "BUY",
            //       price: "19",
            //       triggerPrice: null,
            //       trailingPercent: null,
            //       size: "0.1",
            //       remainingSize: "0.1",
            //       type: "LIMIT",
            //       createdAt: "2022-02-10T18:10:50.740Z",
            //       unfillableAt: null,
            //       expiresAt: "2022-03-10T18:10:52.275Z",
            //       status: "OPEN",
            //       timeInForce: "GTT",
            //       postOnly: false,
            //       cancelReason: null,
            //     },
            // }
            order = this.safeValue (response, 'cancelOrder');
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        } else {
            const marketId = this.safeString (order, 'market');
            market = this.safeMarket (marketId, market);
        }
        return this.parseOrder (order, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = { };
        let response = undefined;
        // both below endpoint supports 'market', but if market is inputed (due to higher RateLimits) we use : https://docs.dydx.exchange/#cancel-active-orders
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
            response = await this.privateDeleteActiveOrders (this.extend (request, params));
            // {
            //     "cancelOrders": [
            //         {
            //             "accountId": "a6e392ed-ea82-419e-81ae-abdde89a638c",
            //             "market": "MATIC-USD",
            //             "side": "BUY",
            //             "id": "1ae4ed6910303442c616f8f332d3aff70d09e3e16bd429ea9c230ebed4021ea",
            //             "remainingSize": "11",
            //             "price": "1"
            //         },
            //         ..
            //     ]
            // }
        } else {
            response = await this.privateDeleteOrders (this.extend (request, params));
            // TODO - like 'createOrder', this is Unauthorized for now without stark keys
        }
        const ordersArray = this.safeValue (response, 'cancelOrders', []);
        return this.parseOrders (ordersArray, market, undefined, undefined, params);
    }

    parseOrder (order, market = undefined) {
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parseDate (this.safeString (order, 'createdAt'));
        const expiresAt = this.safeString (order, 'expiresAt');
        let timeInForce = this.safeString (order, 'timeInForce');
        // simulate GTC like we did in order
        if (expiresAt === this.options['gtcDate'] && timeInForce === 'GTT') {
            timeInForce = 'GTC';
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'clientId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': this.parseOrderType (this.safeString (order, 'type')),
            'timeInForce': timeInForce,
            'postOnly': this.safeValue (order, 'postOnly'),
            'side': this.parseOrderSide (this.safeString (order, 'side')),
            'price': this.safeNumber (order, 'price'),
            'stopPrice': this.safeNumber (order, 'triggerPrice'),
            'amount': this.safeNumber (order, 'size'),
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': this.safeNumber (order, 'remainingSize'),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderStatus (status, reversed = false) {
        let statuses = {
            'PENDING': 'open',
            'OPEN': 'open',
            'UNTRIGGERED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
        };
        if (reversed) {
            statuses = this.changeKeyValue (statuses);
        }
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status, reversed = false) {
        let statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'STOP_LIMIT': 'stop-limit',
            'TRAILING_STOP': 'trailing-stop-loss',
            'TAKE_PROFIT': 'take-profit',
        };
        if (reversed) {
            statuses = this.changeKeyValue (statuses);
        }
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (status, reversed = false) {
        let statuses = {
            'GTT': 'gtt',
            'FOK': 'fok',
            'IOC': 'ioc',
        };
        if (reversed) {
            statuses = this.changeKeyValue (status);
        }
        return this.safeString (statuses, status, status);
    }

    parseOrderSide (status, reversed = false) {
        let statuses = {
            'BUY': 'buy',
            'SELL': 'sell',
        };
        if (reversed) {
            statuses = this.changeKeyValue (statuses);
        }
        return this.safeString (statuses, status, status);
    }

    parseTakerMaker (status, reversed = false) {
        let statuses = {
            'MAKER': 'maker',
            'TAKER': 'taker',
        };
        if (reversed) {
            statuses = this.changeKeyValue (statuses);
        }
        return this.safeString (statuses, status, status);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = undefined;
        let response = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clientId');
        if (clientOrderId !== undefined) {
            request = { 'id': clientOrderId };
            response = await this.privateGetOrdersClientId (this.extend (request, params));
        } else {
            request = { 'id': id };
            response = await this.privateGetOrdersId (this.extend (request, params));
        }
        const data = this.safeValue (response, 'order', {});
        return this.parseOrder (data, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // if symbol is inputed, then use this endpoint because of higher Ratelimits (yeah, bad api design, but as is..): https://docs.dydx.exchange/#get-active-orders
        let method = this.safeString (this.options, 'fetchOpenOrdersMethod');
        method = this.safeString (params, 'method', method);
        if (symbol !== undefined && method === 'privateGetActiveOrders') {
            const market = this.market (symbol);
            const request = {
                'market': market['id'],
            };
            const response = await this.privateGetActiveOrders (this.extend (request, params));
            const ords = this.safeValue (response, 'orders');
            return this.parseOrders (ords, market, since, limit, params);
        } else {
            return await this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'PENDING,OPEN,UNTRIGGERED' }, params));
        }
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'CANCELED' }, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        const arrayOrders = this.safeValue (response, 'orders', []);
        return this.parseOrders (arrayOrders, market, since, limit, params);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetFills (this.extend (request, params));
        // {
        //     fills: [
        //       {
        //         id: "a1ec2811-efd5-12b6-a933-92012de69ecf",
        //         side: "SELL",
        //         liquidity: "TAKER",
        //         type: "MARKET",
        //         market: "ETH-USD",
        //         price: "3072.1",
        //         size: "0.395",
        //         fee: "0.465188",
        //         createdAt: "2022-02-10T23:31:18.629Z",
        //         orderId: null,
        //       },
        //       ..
        //     ],
        // }
        const arrayFills = this.safeValue (response, 'fills');
        return this.parseTrades (arrayFills, market, since, limit);
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
        let request = '/' + this.version + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET' || method === 'DELETE') {
            if (Object.keys (params).length) {
                request += '?' + this.urlencode (params);
            }
        }
        const url = this.urls['api'][api] + request;
        if (api === 'private') {
            const timestamp = this.iso8601 (this.milliseconds ());
            let auth = timestamp + method + request;
            if (method !== 'GET') {
                body = this.json (params);
                auth += body;
            }
            const secret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (auth), secret, 'sha256', 'base64');
            headers = {
                'DYDX-TIMESTAMP': timestamp,
                'DYDX-API-KEY': this.apiKey,
                'DYDX-PASSPHRASE': this.password,
                'DYDX-SIGNATURE': signature,
            };
            if (method !== 'GET') {
                headers['Content-type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const feedback = this.id + ' ' + body;
        if (response === undefined) {
            if (typeof body === 'string') {
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            }
            return; // fallback to default error handler
        }
        const errors = this.safeString (response, 'errors', []);
        if (errors !== undefined) {
            // {
            //     "errors": [
            //         {
            //             "msg": "clientId must be a valid string that is less than length: 40",
            //             "param": "clientId",
            //             "location": "body"
            //         },
            //         ..
            //     ]
            // }
            for (let i = 0; i < errors.length; i++) {
                const message = this.safeString (response, 'msg');
                const paramHint = this.safeString (response, 'param');
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], message, paramHint);
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            }
        }
    }

    changeKeyValue (obj) { // TODO: this method might live in base. this is being used for reverse-parsing or associated key-values
        const result = {};
        const keys = Object.keys (obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = obj[key];
            result[value] = key;
        }
        return result;
    }
};
