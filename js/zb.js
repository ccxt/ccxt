'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, ExchangeError, ArgumentsRequired, AuthenticationError, InsufficientFunds, OrderNotFound, ExchangeNotAvailable, RateLimitExceeded, PermissionDenied, InvalidOrder, InvalidAddress, OnMaintenance, RequestTimeout, AccountSuspended } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class zb extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zb',
            'name': 'ZB',
            'countries': [ 'CN' ],
            'rateLimit': 100,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'exceptions': {
                'ws': {
                    //  '1000': ExchangeError, // The call is successful.
                    '1001': ExchangeError, // General error prompt
                    '1002': ExchangeError, // Internal Error
                    '1003': AuthenticationError, // Fail to verify
                    '1004': AuthenticationError, // The transaction password is locked
                    '1005': AuthenticationError, // Wrong transaction password, please check it and re-enter。
                    '1006': PermissionDenied, // Real-name authentication is pending approval or unapproved
                    '1007': ExchangeError, // Channel does not exist
                    '1009': OnMaintenance, // This interface is under maintenance
                    '1010': ExchangeNotAvailable, // Not available now
                    '1012': PermissionDenied, // Insufficient permissions
                    '1013': ExchangeError, // Cannot trade, please contact email: support@zb.cn for support.
                    '1014': ExchangeError, // Cannot sell during the pre-sale period
                    '2001': InsufficientFunds, // Insufficient CNY account balance
                    '2002': InsufficientFunds, // Insufficient BTC account balance
                    '2003': InsufficientFunds, // Insufficient LTC account balance
                    '2005': InsufficientFunds, // Insufficient ETH account balance
                    '2006': InsufficientFunds, // ETCInsufficient account balance
                    '2007': InsufficientFunds, // BTSInsufficient account balance
                    '2008': InsufficientFunds, // EOSInsufficient account balance
                    '2009': InsufficientFunds, // BCCInsufficient account balance
                    '3001': OrderNotFound, // Order not found or is completed
                    '3002': InvalidOrder, // Invalid amount
                    '3003': InvalidOrder, // Invalid quantity
                    '3004': AuthenticationError, // User does not exist
                    '3005': BadRequest, // Invalid parameter
                    '3006': PermissionDenied, // Invalid IP or not consistent with the bound IP
                    '3007': RequestTimeout, // The request time has expired
                    '3008': ExchangeError, // Transaction not found
                    '3009': InvalidOrder, // The price exceeds the limit
                    '3010': PermissionDenied, // It fails to place an order, due to you have set up to prohibit trading of this market.
                    '3011': InvalidOrder, // The entrusted price is abnormal, please modify it and place order again
                    '3012': InvalidOrder, // Duplicate custom customerOrderId
                    '4001': AccountSuspended, // APIThe interface is locked for one hour
                    '4002': RateLimitExceeded, // Request too frequently
                },
                'exact': {
                    // '1000': 'Successful operation',
                    '1001': ExchangeError, // 'General error message',
                    '1002': ExchangeError, // 'Internal error',
                    '1003': AuthenticationError, // 'Verification does not pass',
                    '1004': AuthenticationError, // 'Funding security password lock',
                    '1005': AuthenticationError, // 'Funds security password is incorrect, please confirm and re-enter.',
                    '1006': AuthenticationError, // 'Real-name certification pending approval or audit does not pass',
                    '1009': ExchangeNotAvailable, // 'This interface is under maintenance',
                    '1010': ExchangeNotAvailable, // Not available now
                    '1012': PermissionDenied, // Insufficient permissions
                    '1013': ExchangeError, // Cannot trade, please contact email: support@zb.cn for support.
                    '1014': ExchangeError, // Cannot sell during the pre-sale period
                    '2001': InsufficientFunds, // 'Insufficient CNY Balance',
                    '2002': InsufficientFunds, // 'Insufficient BTC Balance',
                    '2003': InsufficientFunds, // 'Insufficient LTC Balance',
                    '2005': InsufficientFunds, // 'Insufficient ETH Balance',
                    '2006': InsufficientFunds, // 'Insufficient ETC Balance',
                    '2007': InsufficientFunds, // 'Insufficient BTS Balance',
                    '2008': InsufficientFunds, // EOSInsufficient account balance
                    '2009': InsufficientFunds, // 'Account balance is not enough',
                    '3001': OrderNotFound, // 'Pending orders not found',
                    '3002': InvalidOrder, // 'Invalid price',
                    '3003': InvalidOrder, // 'Invalid amount',
                    '3004': AuthenticationError, // 'User does not exist',
                    '3005': BadRequest, // 'Invalid parameter',
                    '3006': AuthenticationError, // 'Invalid IP or inconsistent with the bound IP',
                    '3007': AuthenticationError, // 'The request time has expired',
                    '3008': OrderNotFound, // 'Transaction records not found',
                    '3009': InvalidOrder, // 'The price exceeds the limit',
                    '3010': PermissionDenied, // It fails to place an order, due to you have set up to prohibit trading of this market.
                    '3011': InvalidOrder, // 'The entrusted price is abnormal, please modify it and place order again',
                    '3012': InvalidOrder, // Duplicate custom customerOrderId
                    '4001': ExchangeNotAvailable, // 'API interface is locked or not enabled',
                    '4002': RateLimitExceeded, // 'Request too often',
                },
                'broad': {
                    '提币地址有误，请先添加提币地址。': InvalidAddress, // {"code":1001,"message":"提币地址有误，请先添加提币地址。"}
                },
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg',
                'api': {
                    'public': 'https://api.zb.today/data',
                    'private': 'https://trade.zb.today/api',
                    'trade': 'https://trade.zb.today/api',
                },
                'www': 'https://www.zb.com',
                'doc': 'https://www.zb.com/i/developer',
                'fees': 'https://www.zb.com/i/rate',
                'referral': {
                    'url': 'https://www.zbex.club/en/register?ref=4301lera',
                    'discount': 0.16,
                },
            },
            'api': {
                'trade': {
                    'get': [
                        'getFeeInfo',
                    ],
                },
                'public': {
                    'get': [
                        'markets',
                        'ticker',
                        'allTicker',
                        'depth',
                        'trades',
                        'kline',
                        'getGroupMarkets',
                    ],
                },
                'private': {
                    'get': [
                        // spot API
                        'order',
                        'orderMoreV2',
                        'cancelOrder',
                        'getOrder',
                        'getOrders',
                        'getOrdersNew',
                        'getOrdersIgnoreTradeType',
                        'getUnfinishedOrdersIgnoreTradeType',
                        'getFinishedAndPartialOrders',
                        'getAccountInfo',
                        'getUserAddress',
                        'getPayinAddress',
                        'getWithdrawAddress',
                        'getWithdrawRecord',
                        'getChargeRecord',
                        'getCnyWithdrawRecord',
                        'getCnyChargeRecord',
                        'withdraw',
                        // sub accounts
                        'addSubUser',
                        'getSubUserList',
                        'doTransferFunds',
                        'createSubUserKey', // removed on 2021-03-16 according to the update log in the API doc
                        // leverage API
                        'getLeverAssetsInfo',
                        'getLeverBills',
                        'transferInLever',
                        'transferOutLever',
                        'loan',
                        'cancelLoan',
                        'getLoans',
                        'getLoanRecords',
                        'borrow',
                        'autoBorrow',
                        'repay',
                        'doAllRepay',
                        'getRepayments',
                        'getFinanceRecords',
                        'changeInvestMark',
                        'changeLoop',
                        // cross API
                        'getCrossAssets',
                        'getCrossBills',
                        'transferInCross',
                        'transferOutCross',
                        'doCrossLoan',
                        'doCrossRepay',
                        'getCrossRepayRecords',
                    ],
                },
            },
            'fees': {
                'funding': {
                    'withdraw': {},
                },
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'commonCurrencies': {
                'ANG': 'Anagram',
                'ENT': 'ENTCash',
                'BCHABC': 'BCHABC', // conflict with BCH / BCHA
                'BCHSV': 'BCHSV', // conflict with BCH / BSV
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetMarkets (params);
        //
        //     {
        //         "zb_qc":{
        //             "amountScale":2,
        //             "minAmount":0.01,
        //             "minSize":5,
        //             "priceScale":4,
        //         },
        //     }
        //
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const amountPrecisionString = this.safeString (market, 'amountScale');
            const pricePrecisionString = this.safeString (market, 'priceScale');
            const amountLimit = this.parsePrecision (amountPrecisionString);
            const priceLimit = this.parsePrecision (pricePrecisionString);
            const precision = {
                'amount': parseInt (amountPrecisionString),
                'price': parseInt (pricePrecisionString),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (amountLimit),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.parseNumber (priceLimit),
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.tradeGetGetFeeInfo (params);
        //
        //     {
        //         "code":1000,
        //         "message":"success",
        //         "result":{
        //             "USDT":[
        //                 {
        //                     "chainName":"TRC20",
        //                     "canWithdraw":true,
        //                     "fee":1.0,
        //                     "mainChainName":"TRX",
        //                     "canDeposit":true
        //                 },
        //                 {
        //                     "chainName":"OMNI",
        //                     "canWithdraw":true,
        //                     "fee":5.0,
        //                     "mainChainName":"BTC",
        //                     "canDeposit":true
        //                 },
        //                 {
        //                     "chainName":"ERC20",
        //                     "canWithdraw":true,
        //                     "fee":15.0,
        //                     "mainChainName":"ETH",
        //                     "canDeposit":true
        //                 }
        //             ],
        //         }
        //     }
        //
        const currencies = this.safeValue (response, 'result', {});
        const ids = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            const code = this.safeCurrencyCode (id);
            const precision = undefined;
            let isWithdrawEnabled = true;
            let isDepositEnabled = true;
            const fees = {};
            for (let j = 0; j < currency.length; j++) {
                const networkItem = currency[j];
                const network = this.safeString (networkItem, 'chainName');
                // const name = this.safeString (networkItem, 'name');
                const withdrawFee = this.safeNumber (networkItem, 'fee');
                const depositEnable = this.safeValue (networkItem, 'canDeposit');
                const withdrawEnable = this.safeValue (networkItem, 'canWithdraw');
                isDepositEnabled = isDepositEnabled || depositEnable;
                isWithdrawEnabled = isWithdrawEnabled || withdrawEnable;
                fees[network] = withdrawFee;
            }
            const active = (isWithdrawEnabled && isDepositEnabled);
            result[code] = {
                'id': id,
                'name': undefined,
                'code': code,
                'precision': precision,
                'info': currency,
                'active': active,
                'fee': undefined,
                'fees': fees,
                'limits': this.limits,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetGetAccountInfo (params);
        // todo: use this somehow
        // let permissions = response['result']['base'];
        const balances = this.safeValue (response['result'], 'coins');
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            //     {        enName: "BTC",
            //               freez: "0.00000000",
            //         unitDecimal:  8, // always 8
            //              cnName: "BTC",
            //       isCanRecharge:  true, // TODO: should use this
            //             unitTag: "฿",
            //       isCanWithdraw:  true,  // TODO: should use this
            //           available: "0.00000000",
            //                 key: "btc"         }
            const account = this.account ();
            const currencyId = this.safeString (balance, 'key');
            const code = this.safeCurrencyCode (currencyId);
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'freez');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        // fetchDepositAddress
        //
        //     {
        //         "key": "0x0af7f36b8f09410f3df62c81e5846da673d4d9a9"
        //     }
        //
        // fetchDepositAddresses
        //
        //     {
        //         "blockChain": "btc",
        //         "isUseMemo": false,
        //         "address": "1LL5ati6pXHZnTGzHSA3rWdqi4mGGXudwM",
        //         "canWithdraw": true,
        //         "canDeposit": true
        //     }
        //     {
        //         "blockChain": "bts",
        //         "isUseMemo": true,
        //         "account": "btstest",
        //         "memo": "123",
        //         "canWithdraw": true,
        //         "canDeposit": true
        //     }
        //
        let address = this.safeString2 (depositAddress, 'key', 'address');
        let tag = undefined;
        const memo = this.safeString (depositAddress, 'memo');
        if (memo !== undefined) {
            tag = memo;
        } else if (address.indexOf ('_') >= 0) {
            const parts = address.split ('_');
            address = parts[0];  // WARNING: MAY BE tag_address INSTEAD OF address_tag FOR SOME CURRENCIES!!
            tag = parts[1];
        }
        const currencyId = this.safeString (depositAddress, 'blockChain');
        const code = this.safeCurrencyCode (currencyId, currency);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetGetPayinAddress (params);
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": [
        //                 {
        //                     "blockChain": "btc",
        //                     "isUseMemo": false,
        //                     "address": "1LL5ati6pXHZnTGzHSA3rWdqi4mGGXudwM",
        //                     "canWithdraw": true,
        //                     "canDeposit": true
        //                 },
        //                 {
        //                     "blockChain": "bts",
        //                     "isUseMemo": true,
        //                     "account": "btstest",
        //                     "memo": "123",
        //                     "canWithdraw": true,
        //                     "canDeposit": true
        //                 },
        //             ]
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', []);
        return this.parseDepositAddresses (datas, codes);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetGetUserAddress (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "key": "0x0af7f36b8f09410f3df62c81e5846da673d4d9a9"
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        return this.parseDepositAddress (datas, currency);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        //
        //     {
        //         "asks":[
        //             [35000.0,0.2741],
        //             [34949.0,0.0173],
        //             [34900.0,0.5004],
        //         ],
        //         "bids":[
        //             [34119.32,0.0030],
        //             [34107.83,0.1500],
        //             [34104.42,0.1500],
        //         ],
        //         "timestamp":1624536510
        //     }
        //
        return this.parseOrderBook (response, symbol);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetAllTicker (params);
        const result = {};
        const marketsByIdWithoutUnderscore = {};
        const marketIds = Object.keys (this.markets_by_id);
        for (let i = 0; i < marketIds.length; i++) {
            const tickerId = marketIds[i].replace ('_', '');
            marketsByIdWithoutUnderscore[tickerId] = this.markets_by_id[marketIds[i]];
        }
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const market = marketsByIdWithoutUnderscore[ids[i]];
            result[market['symbol']] = this.parseTicker (response[ids[i]], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "date":"1624399623587",
        //         "ticker":{
        //             "high":"33298.38",
        //             "vol":"56152.9012",
        //             "last":"32578.55",
        //             "low":"28808.19",
        //             "buy":"32572.68",
        //             "sell":"32615.37",
        //             "turnover":"1764201303.6100",
        //             "open":"31664.85",
        //             "riseRate":"2.89"
        //         }
        //     }
        //
        const ticker = this.safeValue (response, 'ticker', {});
        ticker['date'] = this.safeValue (response, 'date');
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "date":"1624399623587", // injected from outside
        //         "high":"33298.38",
        //         "vol":"56152.9012",
        //         "last":"32578.55",
        //         "low":"28808.19",
        //         "buy":"32572.68",
        //         "sell":"32615.37",
        //         "turnover":"1764201303.6100",
        //         "open":"31664.85",
        //         "riseRate":"2.89"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'date', this.milliseconds ());
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 1000;
        }
        const request = {
            'market': market['id'],
            'type': this.timeframes[timeframe],
            'limit': limit,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetKline (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         "date":1624537391,
        //         "amount":"0.0142",
        //         "price":"33936.42",
        //         "trade_type":"ask",
        //         "type":"sell",
        //         "tid":1718869018
        //     }
        //
        const timestamp = this.safeTimestamp (trade, 'date');
        let side = this.safeString (trade, 'trade_type');
        side = (side === 'bid') ? 'buy' : 'sell';
        const id = this.safeString (trade, 'tid');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const costString = Precise.stringMul (priceString, amountString);
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (costString);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     [
        //         {"date":1624537391,"amount":"0.0142","price":"33936.42","trade_type":"ask","type":"sell","tid":1718869018},
        //         {"date":1624537391,"amount":"0.0010","price":"33936.42","trade_type":"ask","type":"sell","tid":1718869020},
        //         {"date":1624537391,"amount":"0.0133","price":"33936.42","trade_type":"ask","type":"sell","tid":1718869021},
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const request = {
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
            'tradeType': (side === 'buy') ? '1' : '0',
            'currency': this.marketId (symbol),
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        return await this.privateGetCancelOrder (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        const response = await this.privateGetGetOrder (this.extend (request, params));
        //
        //     {
        //         'total_amount': 0.01,
        //         'id': '20180910244276459',
        //         'price': 180.0,
        //         'trade_date': 1536576744960,
        //         'status': 2,
        //         'trade_money': '1.96742',
        //         'trade_amount': 0.01,
        //         'type': 0,
        //         'currency': 'eth_usdt'
        //     }
        //
        return this.parseOrder (response, undefined);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'pageIndex': 1, // default pageIndex is 1
            'pageSize': limit, // default pageSize is 50
        };
        let method = 'privateGetGetOrdersIgnoreTradeType';
        // tradeType 交易类型1/0[buy/sell]
        if ('tradeType' in params) {
            method = 'privateGetGetOrdersNew';
        }
        let response = undefined;
        try {
            response = await this[method] (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'pageIndex': 1, // default pageIndex is 1
            'pageSize': 10, // default pageSize is 10, doesn't work with other values now
        };
        const response = await this.privateGetGetFinishedAndPartialOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + 'fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'pageIndex': 1, // default pageIndex is 1
            'pageSize': limit, // default pageSize is 10
        };
        let method = 'privateGetGetUnfinishedOrdersIgnoreTradeType';
        // tradeType 交易类型1/0[buy/sell]
        if ('tradeType' in params) {
            method = 'privateGetGetOrdersNew';
        }
        let response = undefined;
        try {
            response = await this[method] (this.extend (request, params));
        } catch (e) {
            if (e instanceof OrderNotFound) {
                return [];
            }
            throw e;
        }
        return this.parseOrders (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         acctType: 0,
        //         currency: 'btc_usdt',
        //         fees: 3.6e-7,
        //         id: '202102282829772463',
        //         price: 45177.5,
        //         status: 2,
        //         total_amount: 0.0002,
        //         trade_amount: 0.0002,
        //         trade_date: 1614515104998,
        //         trade_money: 8.983712,
        //         type: 1,
        //         useZbFee: false
        //     },
        //
        let side = this.safeInteger (order, 'type');
        side = (side === 1) ? 'buy' : 'sell';
        const type = 'limit'; // market order is not availalbe in ZB
        const timestamp = this.safeInteger (order, 'trade_date');
        const marketId = this.safeString (order, 'currency');
        const symbol = this.safeSymbol (marketId, market, '_');
        const price = this.safeNumber (order, 'price');
        const filled = this.safeNumber (order, 'trade_amount');
        const amount = this.safeNumber (order, 'total_amount');
        const cost = this.safeNumber (order, 'trade_money');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'id');
        const feeCost = this.safeNumber (order, 'fees');
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            const zbFees = this.safeValue (order, 'useZbFee');
            if (zbFees === true) {
                feeCurrency = 'ZB';
            } else if (market !== undefined) {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'canceled',
            '2': 'closed',
            '3': 'open', // partial
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionStatus (status) {
        const statuses = {
            '0': 'pending', // submitted, pending confirmation
            '1': 'failed',
            '2': 'ok',
            '3': 'canceled',
            '5': 'ok', // confirmed
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "id": "withdrawalId"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "amount": 0.01,
        //         "fees": 0.001,
        //         "id": 2016042556231,
        //         "manageTime": 1461579340000,
        //         "status": 3,
        //         "submitTime": 1461579288000,
        //         "toAddress": "14fxEPirL9fyfw1i9EF439Pq6gQ5xijUmp",
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "address": "1FKN1DZqCm8HaTujDioRL2Aezdh7Qj7xxx",
        //         "amount": "1.00000000",
        //         "confirmTimes": 1,
        //         "currency": "BTC",
        //         "description": "Successfully Confirm",
        //         "hash": "7ce842de187c379abafadd64a5fe66c5c61c8a21fb04edff9532234a1dae6xxx",
        //         "id": 558,
        //         "itransfer": 1,
        //         "status": 2,
        //         "submit_time": "2016-12-07 18:51:57",
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'hash');
        const amount = this.safeNumber (transaction, 'amount');
        let timestamp = this.parse8601 (this.safeString (transaction, 'submit_time'));
        timestamp = this.safeInteger (transaction, 'submitTime', timestamp);
        let address = this.safeString2 (transaction, 'toAddress', 'address');
        let tag = undefined;
        if (address !== undefined) {
            const parts = address.split ('_');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        const confirmTimes = this.safeInteger (transaction, 'confirmTimes');
        const updated = this.safeInteger (transaction, 'manageTime');
        let type = undefined;
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        if (address !== undefined) {
            type = (confirmTimes === undefined) ? 'withdrawal' : 'deposit';
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fees');
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
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        const password = this.safeString (params, 'safePwd', this.password);
        if (password === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires exchange.password or a safePwd parameter');
        }
        const fees = this.safeNumber (params, 'fees');
        if (fees === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a fees parameter');
        }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag !== undefined) {
            address += '_' + tag;
        }
        const request = {
            'amount': this.currencyToPrecision (code, amount),
            'currency': currency['id'],
            'fees': this.currencyToPrecision (code, fees),
            // 'itransfer': 0, // agree for an internal transfer, 0 disagree, 1 agree, the default is to disagree
            'method': 'withdraw',
            'receiveAddr': address,
            'safePwd': password,
        };
        const response = await this.privateGetWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "id": "withdrawalId"
        //     }
        //
        const transaction = this.parseTransaction (response, currency);
        return this.extend (transaction, {
            'type': 'withdrawal',
            'address': address,
            'addressTo': address,
            'amount': amount,
        });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'pageIndex': 1,
            // 'pageSize': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetGetWithdrawRecord (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "list": [
        //                     {
        //                         "amount": 0.01,
        //                         "fees": 0.001,
        //                         "id": 2016042556231,
        //                         "manageTime": 1461579340000,
        //                         "status": 3,
        //                         "submitTime": 1461579288000,
        //                         "toAddress": "14fxEPirL9fyfw1i9EF439Pq6gQ5xijUmp",
        //                     },
        //                 ],
        //                 "pageIndex": 1,
        //                 "pageSize": 10,
        //                 "totalCount": 4,
        //                 "totalPage": 1
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        const withdrawals = this.safeValue (datas, 'list', []);
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': currency['id'],
            // 'pageIndex': 1,
            // 'pageSize': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetGetChargeRecord (this.extend (request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": {
        //             "des": "success",
        //             "isSuc": true,
        //             "datas": {
        //                 "list": [
        //                     {
        //                         "address": "1FKN1DZqCm8HaTujDioRL2Aezdh7Qj7xxx",
        //                         "amount": "1.00000000",
        //                         "confirmTimes": 1,
        //                         "currency": "BTC",
        //                         "description": "Successfully Confirm",
        //                         "hash": "7ce842de187c379abafadd64a5fe66c5c61c8a21fb04edff9532234a1dae6xxx",
        //                         "id": 558,
        //                         "itransfer": 1,
        //                         "status": 2,
        //                         "submit_time": "2016-12-07 18:51:57",
        //                     },
        //                 ],
        //                 "pageIndex": 1,
        //                 "pageSize": 10,
        //                 "total": 8
        //             }
        //         }
        //     }
        //
        const message = this.safeValue (response, 'message', {});
        const datas = this.safeValue (message, 'datas', {});
        const deposits = this.safeValue (datas, 'list', []);
        return this.parseTransactions (deposits, currency, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + this.version + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'trade') {
            url += '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            let query = this.keysort (this.extend ({
                'method': path,
                'accesskey': this.apiKey,
            }, params));
            const nonce = this.nonce ();
            query = this.keysort (query);
            const auth = this.rawencode (query);
            const secret = this.hash (this.encode (this.secret), 'sha1');
            const signature = this.hmac (this.encode (auth), this.encode (secret), 'md5');
            const suffix = 'sign=' + signature + '&reqTime=' + nonce.toString ();
            url += '/' + path + '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (body[0] === '{') {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            if ('code' in response) {
                const code = this.safeString (response, 'code');
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                if (code !== '1000') {
                    throw new ExchangeError (feedback);
                }
            }
            // special case for {"result":false,"message":"服务端忙碌"} (a "Busy Server" reply)
            const result = this.safeValue (response, 'result');
            if (result !== undefined) {
                if (!result) {
                    const message = this.safeString (response, 'message');
                    if (message === '服务端忙碌') {
                        throw new ExchangeNotAvailable (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }
};
