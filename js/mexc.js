'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidAddress, ExchangeError, BadRequest, AuthenticationError, RateLimitExceeded, BadSymbol, InvalidOrder, InsufficientFunds, ArgumentsRequired, OrderNotFound } = require ('./base/errors');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class mexc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'apiKey': 'mx0Eqv4eQDrQc9f5j1',
            'secret': '4041ab43e2bb44b09033549b12502384',
            'id': 'mexc',
            'name': 'MEXC Global',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 1500,
            'version': 'v2',
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddressByNetwork': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWIthdrawals': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '1d': '1d',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'spot': {
                        'public': 'https://www.mxc.com/open/api/v2',
                        'private': 'https://www.mexc.com/open/api/v2',
                    },
                    'contract': {
                        'public': 'https://contract.mexc.com/api/v1/contract',
                        'private': 'https://contract.mexc.com/api/v1/private',
                    },
                },
                'www': 'https://www.mexc.com/',
                'doc': [
                    'https://mxcdevelop.github.io/APIDoc/',
                ],
                'fees': [
                    'https://www.mexc.com/fee',
                ],
            },
            'api': {
                'contract': {
                    'public': {
                        'get': [
                            'ping',
                            'detail',
                            'support_currencies',
                            'depth/{symbol}',
                            'depth_commits/{symbol}/{limit}',
                            'index_price/{symbol}',
                            'fair_price/{symbol}',
                            'funding_rate/{symbol}',
                            'kline/{symbol}',
                            'kline/index_price/{symbol}',
                            'kline/fair_price/{symbol}',
                            'deals/{symbol}',
                            'ticker',
                            'risk_reverse',
                            'risk_reverse/history',
                            'funding_rate/history',
                        ],
                    },
                    'private': {
                        'get': [
                            'account/assets',
                            'account/asset/{currency}',
                            'account/transfer_record',
                            'position/list/history_positions',
                            'position/open_positions',
                            'position/funding_records',
                            'order/list/open_orders/{symbol}',
                            'order/list/history_orders',
                            'order/external/{symbol}/{external_oid}',
                            'order/get/{order_id}',
                            'order/batch_query',
                            'order/deal_details/{order_id}',
                            'order/list/order_deals',
                            'planorder/list/orders',
                            'stoporder/list/orders',
                            'stoporder/order_details/{stop_order_id}',
                            'account/risk_limit',
                            'account/tiered_fee_rate',
                        ],
                        'post': [
                            'position/change_margin',
                            'position/change_leverage',
                            'order/submit',
                            'order/submit_batch',
                            'order/cancel',
                            'order/cancel_with_external',
                            'order/cancel_all',
                            'account/change_risk_level',
                            'planorder/place',
                            'planorder/cancel',
                            'planorder/cancel_all',
                            'stoporder/cancel',
                            'stoporder/cancel_all',
                            'stoporder/change_price',
                            'stoporder/change_plan_price',
                        ],
                    },
                },
                'spot': {
                    'public': {
                        'get': [
                            'market/symbols', // this fetchMarkets
                            'market/coin/list', // fetchCurrencies
                            'common/timestamp', // fetchTime
                            'common/ping', // fetchStatus
                            'market/ticker', // fetchTicker BTC/USDT
                            'market/depth', // fetchOrderBook ETH/USDT
                            'market/deals', // fetchTrades ETH/BTC
                            'market/kline', // fetchOHLCV
                        ],
                    },
                    'private': {
                        'get': [
                            'account/info', // fetchBalance
                            'order/open_orders', // fetchOpenOrders
                            'order/list', // fetchClosedOrders
                            'order/query', // fetchOrder
                            'order/deals',
                            'order/deal_detail',
                            'asset/deposit/address/list', // fetchDepositAddress
                            'asset/deposit/list', // fetchDeposits
                            'asset/address/list',
                            'asset/withdraw/list', // fetchWithdrawals
                        ],
                        'post': [
                            'order/place', // createOrder
                            'order/place_batch',
                        ],
                        'delete': [
                            'order/cancel', // cancelOrder
                            'order/cancel_by_symbol', // cancelAllOrders
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100, // maker / taker
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'defaultType': 'spot',
                'networks': {
                },
            },
            'commonCurrencies': {
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Invalid parameter
                    '401': AuthenticationError, // Invalid signature, fail to pass the validation
                    '429': RateLimitExceeded, // too many requests, rate limit rule is violated
                    '10072': AuthenticationError, // Invalid access key
                    '10073': AuthenticationError, // Invalid request time
                    '10216': InvalidAddress, // {"code":10216,"msg":"No available deposit address"}
                    '10232': BadSymbol, // {"code":10232,"msg":"The currency not exist"}
                    '30000': BadSymbol, // Trading is suspended for the requested symbol
                    '30001': InvalidOrder, // Current trading type (bid or ask) is not allowed
                    '30002': InvalidOrder, // Invalid trading amount, smaller than the symbol minimum trading amount
                    '30003': InvalidOrder, // Invalid trading amount, greater than the symbol maximum trading amount
                    '30004': InsufficientFunds, // Insufficient balance
                    '30005': InvalidOrder, // Oversell error
                    '30010': InvalidOrder, // Price out of allowed range
                    '30016': BadSymbol, // Market is closed
                    '30019': InvalidOrder, // Orders count over limit for batch processing
                    '30020': BadSymbol, // Restricted symbol, API access is not allowed for the time being
                    '30021': BadSymbol, // Invalid symbol
                    '33333': BadSymbol, // {"code":33333,"msg":"currency can not be null"}
                },
                'broad': {
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.spotPublicGetCommonTimestamp (params);
        //
        // spot
        //
        //     {
        //         "code":200,
        //         "data":1633375641837
        //     }
        //
        // contract
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":1634095541710
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchStatus (params = {}) {
        const response = await this.spotPublicGetCommonPing (params);
        //
        // { "code":200 }
        //
        const code = this.safeInteger (response, 'code');
        if (code !== undefined) {
            const status = (code === 200) ? 'ok' : 'maintenance';
            this.status = this.extend (this.status, {
                'status': status,
                'updated': this.milliseconds (),
            });
        }
        return this.status;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.spotPublicGetMarketCoinList (params);
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "currency":"AGLD",
        //                 "coins":[
        //                     {
        //                         "chain":"ERC20",
        //                         "precision":18,
        //                         "fee":8.09,
        //                         "is_withdraw_enabled":true,
        //                         "is_deposit_enabled":true,
        //                         "deposit_min_confirm":16,
        //                         "withdraw_limit_max":500000.0,
        //                         "withdraw_limit_min":14.0
        //                     }
        //                 ],
        //                 "full_name":"Adventure Gold"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'full_name');
            const coins = this.safeValue (currency, 'coins', []);
            let active = undefined;
            let precision = undefined;
            let fee = undefined;
            let withdrawMin = undefined;
            let withdrawMax = undefined;
            const coinsLength = coins.length;
            if (coinsLength > 1) {
                const lastCoin = this.safeValue (coins, coinsLength - 1);
                fee = this.safeFloat (lastCoin, 'fee');
                const isDepositEnabled = this.safeValue (lastCoin, 'is_deposit_enabled', false);
                const isWithdrawEnabled = this.safeValue (lastCoin, 'is_withdraw_enabled', false);
                active = (isDepositEnabled && isWithdrawEnabled);
                precision = this.safeInteger (lastCoin, 'precision');
                withdrawMin = this.safeNumber (lastCoin, 'withdraw_limit_min');
                withdrawMax = this.safeNumber (lastCoin, 'withdraw_limit_max');
            }
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': withdrawMin,
                        'max': withdrawMax,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.spotPublicGetMarketSymbols (params);
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "symbol":"DFD_USDT",
        //                 "state":"ENABLED",
        //                 "countDownMark":1,
        //                 "vcoinName":"DFD",
        //                 "vcoinStatus":1,
        //                 "price_scale":4,
        //                 "quantity_scale":2,
        //                 "min_amount":"5", // not an amount = cost
        //                 "max_amount":"5000000",
        //                 "maker_fee_rate":"0.002",
        //                 "taker_fee_rate":"0.002",
        //                 "limited":true,
        //                 "etf_mark":0,
        //                 "symbol_partition":"ASSESS"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'price_scale'),
                'amount': this.safeInteger (market, 'quantity_scale'),
            };
            const taker = this.safeNumber (market, 'taker_fee_rate');
            const maker = this.safeNumber (market, 'maker_fee_rate');
            const state = this.safeString (market, 'state');
            const active = (state === 'ENABLED');
            result.push (this.extend (this.fees['trading'], {
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'taker': taker,
                'maker': maker,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': this.safeNumber (market, 'max_amount'),
                    },
                },
            }));
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.spotPublicGetMarketTicker (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "symbol":"BTC_USDT",
        //                 "volume":"880.821523",
        //                 "high":"49496.95", // highest price over the past 24 hours
        //                 "low":"46918.4", // lowest
        //                 "bid":"49297.64", // current buying price == the best price you can sell for
        //                 "ask":"49297.75", // current selling price == the best price you can buy for
        //                 "open":"48764.9", // open price 24h ago
        //                 "last":"49297.73", // last = close
        //                 "time":1633378200000, // timestamp
        //                 "change_rate":"0.0109265" // (last / open) - 1
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const ticker = this.safeValue (data, 0);
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"BTC_USDT",
        //         "volume":"880.821523",
        //         "high":"49496.95",
        //         "low":"46918.4",
        //         "bid":"49297.64",
        //         "ask":"49297.75",
        //         "open":"48764.9",
        //         "last":"49297.73",
        //         "time":1633378200000,
        //         "change_rate":"0.0109265"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'time');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const baseVolume = this.safeNumber (ticker, 'volume');
        const open = this.safeNumber (ticker, 'open');
        const last = this.safeNumber (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit === undefined) {
            limit = 100;
        }
        request['depth'] = limit; // default 100, max 2000
        const response = await this.spotPublicGetMarketDepth (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "asks":[
        //                 {"price":"49060.56","quantity":"0.099842"},
        //                 {"price":"49060.58","quantity":"0.016003"},
        //                 {"price":"49060.6","quantity":"0.023677"}
        //             ],
        //             "bids":[
        //                 {"price":"49060.45","quantity":"1.693009"},
        //                 {"price":"49060.44","quantity":"0.000843"},
        //                 {"price":"49059.98","quantity":"0.735"},
        //             ],
        //             "version":"202454074",
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orderbook = this.parseOrderBook (data, symbol, undefined, 'bids', 'asks', 'price', 'quantity');
        orderbook['nonce'] = this.safeInteger (data, 'version');
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.spotPublicGetMarketDeals (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {"trade_time":1633381766725,"trade_price":"0.068981","trade_quantity":"0.005","trade_type":"BID"},
        //             {"trade_time":1633381732705,"trade_price":"0.068979","trade_quantity":"0.006","trade_type":"BID"},
        //             {"trade_time":1633381694604,"trade_price":"0.068975","trade_quantity":"0.011","trade_type":"ASK"},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit); // plural
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "trade_time":1633381766725,
        //         "trade_price":"0.068981",
        //         "trade_quantity":"0.005",
        //         "trade_type":"BID"
        //     }
        //
        // private fetchMyTrades
        //
        //     ...
        //
        const timestamp = this.safeInteger (trade, 'trade_time');
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        const priceString = this.safeString (trade, 'trade_price');
        const amountString = this.safeString (trade, 'trade_quantity');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        let side = this.safeString (trade, 'trade_type');
        if (side === 'BID') {
            side = 'buy';
        } else {
            side = 'sell';
        }
        const id = this.safeString (trade, 'trade_time');
        return {
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.spotPublicGetMarketKline (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":[
        //             [1633377000,"49227.47","49186.21","49227.47","49169.48","0.5984809999999999","29434.259665989997"],
        //             [1633377060,"49186.21","49187.03","49206.64","49169.18","0.3658478","17990.651234393"],
        //             [1633377120,"49187.03","49227.2","49227.2","49174.4","0.0687651","3382.353190352"],
        //         ],
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1633377000, // 0 timestamp (unix seconds)
        //         "49227.47", // 1 open price
        //         "49186.21", // 2 closing price
        //         "49227.47", // 3 high
        //         "49169.48", // 4 low
        //         "0.5984809999999999", // 5 base volume
        //         "29434.259665989997", // 6 quote volume
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.spotPrivateGetAccountInfo (params);
        //
        //     {
        //         code: "200",
        //         data: {
        //             USDC: { frozen: "0", available: "150" }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencyIds = Object.keys (data);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (data, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'frozen');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    safeNetwork (networkId) {
        const networksById = {
            'ERC-20': 'ERC20',
            'TRX': 'TRC20',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {"chain":"ERC-20","address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6"},
        //     {"chain":"MATIC","address":"0x05aa3236f1970eae0f8feb17ec19435b39574d74"},
        //     {"chain":"TRC20","address":"TGaPfhW41EXD3sAfs1grLF6DKfugfqANNw"},
        //     {"chain":"SOL","address":"5FSpUKuh2gjw4mF89T2e7sEjzUA1SkRKjBChFqP43KhV"},
        //     {"chain":"ALGO","address":"B3XTZND2JJTSYR7R2TQVCUDT4QSSYVAIZYDPWVBX34DGAYATBU3AUV43VU"}
        //
        //
        const address = this.safeString (depositAddress, 'address');
        const code = this.safeCurrencyCode (undefined, currency);
        const networkId = this.safeString (depositAddress, 'chain');
        const network = this.safeNetwork (networkId);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': network,
            'info': depositAddress,
        };
    }

    async fetchDepositAddressesByNetwork (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.spotPrivateGetAssetDepositAddressList (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "currency":"USDC",
        //             "chains":[
        //                 {"chain":"ERC-20","address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6"},
        //                 {"chain":"MATIC","address":"0x05aa3236f1970eae0f8feb17ec19435b39574d74"},
        //                 {"chain":"TRC20","address":"TGaPfhW41EXD3sAfs1grLF6DKfugfqANNw"},
        //                 {"chain":"SOL","address":"5FSpUKuh2gjw4mF89T2e7sEjzUA1SkRKjBChFqP43KhV"},
        //                 {"chain":"ALGO","address":"B3XTZND2JJTSYR7R2TQVCUDT4QSSYVAIZYDPWVBX34DGAYATBU3AUV43VU"}
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const chains = this.safeValue (data, 'chains', []);
        const depositAddresses = [];
        for (let i = 0; i < chains.length; i++) {
            const depositAddress = this.parseDepositAddress (chains[i], currency);
            depositAddresses.push (depositAddress);
        }
        return this.indexBy (depositAddresses, 'network');
    }

    async fetchDepositAddress (code, params = {}) {
        const response = await this.fetchDepositAddressesByNetwork (code, params);
        const rawNetwork = this.safeString (params, 'network');
        const networks = this.safeValue (this.options, 'networks', {});
        const network = this.safeString (networks, rawNetwork, rawNetwork);
        let result = undefined;
        if (network === undefined) {
            result = this.safeValue (response, code);
            if (result === undefined) {
                const alias = this.safeString (networks, code, code);
                result = this.safeValue (response, alias);
                if (result === undefined) {
                    const defaultNetwork = this.safeString (this.options, 'defaultNetwork', 'ERC20');
                    result = this.safeValue (response, defaultNetwork);
                    if (result === undefined) {
                        const values = Object.values (response);
                        result = this.safeValue (values, 0);
                        if (result === undefined) {
                            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find deposit address for ' + code);
                        }
                    }
                }
            }
            return result;
        }
        result = this.safeValue (response, network);
        if (result === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress() cannot find ' + network + ' deposit address for ' + code);
        }
        return result;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'state': 'state',
            // 'start_time': since, // default 1 day
            // 'end_time': this.milliseconds (),
            // 'page_num': 1,
            // 'page_size': limit, // default 20, maximum 50
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.spotPrivateGetAssetDepositList (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "page_size":20,
        //             "total_page":1,
        //             "total_size":1,
        //             "page_num":1,
        //             "result_list":[
        //                 {
        //                     "currency":"USDC",
        //                     "amount":150.0,
        //                     "fee":0.0,
        //                     "confirmations":19,
        //                     "address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6",
        //                     "state":"SUCCESS",
        //                     "tx_id":"0xc65a9b09e1b71def81bf8bb3ec724c0c1b2b4c82200c8c142e4ea4c1469fd789:0",
        //                     "require_confirmations":12,
        //                     "create_time":"2021-10-11T18:58:25.000+00:00",
        //                     "update_time":"2021-10-11T19:01:06.000+00:00"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'result_list', []);
        return this.parseTransactions (resultList, code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'withdrawal_id': '4b450616042a48c99dd45cacb4b092a7', // string
            // 'currency': currency['id'],
            // 'state': 'state',
            // 'start_time': since, // default 1 day
            // 'end_time': this.milliseconds (),
            // 'page_num': 1,
            // 'page_size': limit, // default 20, maximum 50
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.spotPrivateGetAssetWithdrawList (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":{
        //             "page_size":20,
        //             "total_page":1,
        //             "total_size":1,
        //             "page_num":1,
        //             "result_list":[
        //                 {
        //                     "id":"4b450616042a48c99dd45cacb4b092a7",
        //                     "currency":"USDT-TRX",
        //                     "address":"TRHKnx74Gb8UVcpDCMwzZVe4NqXfkdtPak",
        //                     "amount":30.0,
        //                     "fee":1.0,
        //                     "remark":"this is my first withdrawal remark",
        //                     "state":"WAIT",
        //                     "create_time":"2021-10-11T20:45:08.000+00:00"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const resultList = this.safeValue (data, 'result_list', []);
        return this.parseTransactions (resultList, code, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "currency":"USDC",
        //         "amount":150.0,
        //         "fee":0.0,
        //         "confirmations":19,
        //         "address":"0x55cbd73db24eafcca97369e3f2db74b2490586e6",
        //         "state":"SUCCESS",
        //         "tx_id":"0xc65a9b09e1b71def81bf8bb3ec724c0c1b2b4c82200c8c142e4ea4c1469fd789:0",
        //         "require_confirmations":12,
        //         "create_time":"2021-10-11T18:58:25.000+00:00",
        //         "update_time":"2021-10-11T19:01:06.000+00:00"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id":"4b450616042a48c99dd45cacb4b092a7",
        //         "currency":"USDT-TRX",
        //         "address":"TRHKnx74Gb8UVcpDCMwzZVe4NqXfkdtPak",
        //         "amount":30.0,
        //         "fee":1.0,
        //         "remark":"this is my first withdrawal remark",
        //         "state":"WAIT",
        //         "create_time":"2021-10-11T20:45:08.000+00:00"
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const type = (id === undefined) ? 'deposit' : 'withdrawal';
        const timestamp = this.parse8601 (this.safeString (transaction, 'create_time'));
        const updated = this.parse8601 (this.safeString (transaction, 'update_time'));
        let currencyId = this.safeString (transaction, 'currency');
        let network = undefined;
        if (currencyId.indexOf ('-') >= 0) {
            const parts = currencyId.split ('-');
            currencyId = this.safeString (parts, 0);
            const networkId = this.safeString (parts, 1);
            network = this.safeNetwork (networkId);
        }
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const amount = this.safeNumber (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const txid = this.safeString (transaction, 'tx_id');
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'network': network,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'WAIT': 'pending',
            'SUCCESS': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let orderSide = undefined;
        if (side === 'buy') {
            orderSide = 'BID';
        } else if (side === 'sell') {
            orderSide = 'ASK';
        }
        let orderType = undefined;
        const uppercaseOrderType = type.toUpperCase ();
        if (uppercaseOrderType === 'LIMIT') {
            orderType = 'LIMIT_ORDER';
        }
        const request = {
            'symbol': market['id'],
            'price': this.priceToPrecision (symbol, price),
            'quantity': this.amountToPrecision (symbol, amount),
            'trade_type': orderSide,
            'order_type': orderType, // LIMIT_ORDER，POST_ONLY，IMMEDIATE_OR_CANCEL
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            params = this.omit (params, [ 'clientOrderId', 'client_order_id' ]);
            request['client_order_id'] = clientOrderId;
        }
        const response = await this.spotPrivatePostOrderPlace (this.extend (request, params));
        //
        //     {"code":200,"data":"2ff3163e8617443cb9c6fc19d42b1ca4"}
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_ids');
        if (clientOrderId !== undefined) {
            params = this.omit (params, [ 'clientOrderId', 'client_order_ids' ]);
            request['client_order_ids'] = clientOrderId;
        } else {
            request['order_ids'] = id;
        }
        const response = await this.spotPrivateDeleteOrderCancel (this.extend (request, params));
        //
        //    {"code":200,"data":{"965245851c444078a11a7d771323613b":"success"}}
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'FILLED': 'closed',
            'PARTIALLY_FILLED': 'open',
            'CANCELED': 'canceled',
            'PARTIALLY_CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {"code":200,"data":"2ff3163e8617443cb9c6fc19d42b1ca4"}
        //
        // fetchOrder
        //
        //     {
        //         "id":"2ff3163e8617443cb9c6fc19d42b1ca4",
        //         "symbol":"ETH_USDT",
        //         "price":"3420",
        //         "quantity":"0.01",
        //         "state":"CANCELED",
        //         "type":"BID",
        //         "deal_quantity":"0",
        //         "deal_amount":"0",
        //         "create_time":1633988662000,
        //         "order_type":"LIMIT_ORDER"
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "id":"965245851c444078a11a7d771323613b",
        //         "symbol":"ETH_USDT",
        //         "price":"3430",
        //         "quantity":"0.01",
        //         "state":"NEW",
        //         "type":"BID",
        //         "remain_quantity":"0.01",
        //         "remain_amount":"34.3",
        //         "create_time":1633989029039,
        //         "client_order_id":"",
        //         "order_type":"LIMIT_ORDER"
        //     }
        //
        // cancelOrder
        //
        //     {"965245851c444078a11a7d771323613b":"success"}
        //
        let id = this.safeString2 (order, 'data', 'id');
        let status = undefined;
        if (id === undefined) {
            const keys = Object.keys (order);
            id = this.safeString (keys, 0);
            const state = this.safeString (order, id);
            if (state === 'success') {
                status = 'canceled';
            }
        }
        const state = this.safeString (order, 'state');
        const timestamp = this.safeInteger (order, 'create_time');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'quantity');
        const remaining = this.safeString (order, 'remain_quantity');
        const filled = this.safeString (order, 'deal_quantity');
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let side = undefined;
        const bidOrAsk = this.safeString (order, 'type');
        if (bidOrAsk === 'BID') {
            side = 'buy';
        } else if (bidOrAsk === 'ASK') {
            side = 'ask';
        }
        status = this.parseOrderStatus (state);
        let clientOrderId = this.safeString (order, 'client_order_id');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        let orderType = this.safeStringLower (order, 'order_type');
        if (orderType === 'limit_order') {
            orderType = 'limit';
        }
        return this.safeOrder2 ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        });
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'start_time': since,
            // 'limit': limit, // default 50, max 1000
            // 'trade_type': 'BID', // BID / ASK
        };
        const response = await this.spotPrivateGetOrderOpenOrders (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "id":"965245851c444078a11a7d771323613b",
        //                 "symbol":"ETH_USDT",
        //                 "price":"3430",
        //                 "quantity":"0.01",
        //                 "state":"NEW",
        //                 "type":"BID",
        //                 "remain_quantity":"0.01",
        //                 "remain_amount":"34.3",
        //                 "create_time":1633989029039,
        //                 "client_order_id":"",
        //                 "order_type":"LIMIT_ORDER"
        //             },
        //             {
        //                 "id":"2ff3163e8617443cb9c6fc19d42b1ca4",
        //                 "symbol":"ETH_USDT",
        //                 "price":"3420",
        //                 "quantity":"0.01",
        //                 "state":"NEW",
        //                 "type":"BID",
        //                 "remain_quantity":"0.01",
        //                 "remain_amount":"34.2",
        //                 "create_time":1633988662382,
        //                 "client_order_id":"",
        //                 "order_type":"LIMIT_ORDER"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_ids': id,
        };
        const response = await this.spotPrivateGetOrderQuery (this.extend (request, params));
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "id":"2ff3163e8617443cb9c6fc19d42b1ca4",
        //                 "symbol":"ETH_USDT",
        //                 "price":"3420",
        //                 "quantity":"0.01",
        //                 "state":"CANCELED",
        //                 "type":"BID",
        //                 "deal_quantity":"0",
        //                 "deal_amount":"0",
        //                 "create_time":1633988662000,
        //                 "order_type":"LIMIT_ORDER"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const firstOrder = this.safeValue (data, 0);
        if (firstOrder === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find the order id ' + id);
        }
        return this.parseOrder (firstOrder);
    }

    async fetchOrdersByState (state, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersByState requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'start_time': since, // default 7 days, max 30 days
            // 'limit': limit, // default 50, max 1000
            // 'trade_type': 'BID', // BID / ASK
            'states': state, // NEW, FILLED, PARTIALLY_FILLED, CANCELED, PARTIALLY_CANCELED
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        const response = await this.spotPrivateGetOrderList (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('CANCELED', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('FILLED', symbol, since, limit, params);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.spotPrivateDeleteOrderCancelBySymbol (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "data": [
        //             {
        //                 "msg": "success",
        //                 "order_id": "75ecf99feef04538b78e4622beaba6eb",
        //                 "client_order_id": "a9329e86f2094b0d8b58e92c25029554"
        //             },
        //             {
        //                 "msg": "success",
        //                 "order_id": "139413c48f8b4c018f452ce796586bcf"
        //             },
        //             {
        //                 "msg": "success",
        //                 "order_id": "b58ef34c570e4917981f276d44091484"
        //             }
        //         ]
        //     }
        //
        return response;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        let url = this.urls['api'][section][access] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = '';
            headers = {
                'ApiKey': this.apiKey,
                'Request-Time': timestamp,
            };
            if (method === 'POST') {
                auth = this.json (params);
                body = auth;
                headers['Content-Type'] = 'application/json';
            } else {
                params = this.keysort (params);
                if (Object.keys (params).length) {
                    auth += this.urlencode (params);
                    url += '?' + auth;
                }
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
            auth = this.apiKey + timestamp + auth;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers['Signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //     {"code":10232,"msg":"The currency not exist"}
        //     {"code":10216,"msg":"No available deposit address"}
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":1634095541710
        //     }
        //
        const success = this.safeValue (response, 'success', false);
        if (success === true) {
            return;
        }
        const responseCode = this.safeString (response, 'code');
        if ((responseCode !== '200') && (responseCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
