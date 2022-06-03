'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountSuspended, BadRequest, BadResponse, NetworkError, DDoSProtection, AuthenticationError, PermissionDenied, ExchangeError, InsufficientFunds, InvalidOrder, InvalidNonce, OrderNotFound, InvalidAddress, RateLimitExceeded, BadSymbol, InvalidTimestamp } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class scallop extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'scallop',
            'name': 'Scallop',
            'countries': [ 'SG' ],
            'version': 'v1',
            'rateLimit': 900, // 300 for posts
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': undefined, // has but unimplemented
                'future': undefined, // has but unimplemented
                'option': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchMarginOrder': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '12h': '720',
                '1d': '1D',
                '1w': '1W',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87443315-01283a00-c5fe-11ea-8628-c2a0feaf07ac.jpg',
                'api': {
                    'public': 'https://openapi.scallop.exchange/sapi',
                    'private': 'https://openapi.scallop.exchange/sapi',
                    'futuresPublic': 'https://futuresopenapi.scallop.exchange/fapi',
                    'futuresPrivate': 'https://futuresopenapi.scallop.exchange/fapi',
                },
                'www': 'https://www.scallop.exchange',
                'doc': [
                    'https://www.scallop.exchange/en_US/cms/apidoc',
                ],
                'fees': 'https://digifinex.zendesk.com/hc/en-us/articles/360000328422-Fee-Structure-on-DigiFinex',
                'referral': 'https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp',
            },
            'api': {
                'public': {
                    'get': [
                        // '{market}/symbols',
                        // 'kline',
                        // 'margin/currencies',
                        // 'margin/symbols',
                        // 'markets',
                        'depth',
                        'ping',
                        // 'spot/symbols',
                        'time',
                        'trades',
                        'symbols',
                        'ticker',
                        // 'currencies',
                    ],
                },
                'private': {
                    'get': [
                        // '{market}/financelog',
                        // '{market}/mytrades',
                        // '{market}/order',
                        // '{market}/order/detail',
                        // '{market}/order/current',
                        // '{market}/order/history',
                        // 'margin/assets',
                        // 'margin/financelog',
                        'margin/mytrades',
                        'margin/order',
                        'margin/order/openOrders',
                        // 'margin/order/history',
                        // 'margin/positions',
                        // 'otc/financelog',
                        'spot/assets',
                        'spot/financelog',
                        'myTrades',
                        'order',
                        'openOrders',
                        'account',
                        // 'spot/order/history',
                        // 'deposit/address',
                        // 'deposit/history',
                        // 'withdraw/history',
                    ],
                    'post': [
                        // '{market}/order/cancel',
                        // '{market}/order/new',
                        // '{market}/order/batch_new',
                        'margin/cancel',
                        'margin/order',
                        // 'margin/position/close',
                        'cancel',
                        'batchCancel',
                        'order',
                        // 'transfer',
                        // 'withdraw/new',
                        // 'withdraw/cancel',
                    ],
                },
                'futuresPublic': {
                    'get': [
                        'contracts',
                    ],
                },
                'futuresPrivate': {
                    'get': [
                        'openOrders',
                        'order',
                        'myTrades',
                        'account',
                    ],
                    'post': [
                        'order',
                        'cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'exceptions': {
                'exact': {
                    '10001': [ BadRequest, "Wrong request method, please check it's a GET ot POST request" ],
                    '10002': [ AuthenticationError, 'Invalid ApiKey' ],
                    '10003': [ AuthenticationError, "Sign doesn't match" ],
                    '10004': [ BadRequest, 'Illegal request parameters' ],
                    '10005': [ DDoSProtection, 'Request frequency exceeds the limit' ],
                    '10006': [ PermissionDenied, 'Unauthorized to execute this request' ],
                    '10007': [ PermissionDenied, 'IP address Unauthorized' ],
                    '10008': [ InvalidNonce, 'Timestamp for this request is invalid, timestamp must within 1 minute' ],
                    '10009': [ NetworkError, 'Unexist endpoint, please check endpoint URL' ],
                    '10011': [ AccountSuspended, 'ApiKey expired. Please go to client side to re-create an ApiKey' ],
                    '20001': [ PermissionDenied, 'Trade is not open for this trading pair' ],
                    '20002': [ PermissionDenied, 'Trade of this trading pair is suspended' ],
                    '20003': [ InvalidOrder, 'Invalid price or amount' ],
                    '20007': [ InvalidOrder, 'Price precision error' ],
                    '20008': [ InvalidOrder, 'Amount precision error' ],
                    '20009': [ InvalidOrder, 'Amount is less than the minimum requirement' ],
                    '20010': [ InvalidOrder, 'Cash Amount is less than the minimum requirement' ],
                    '20011': [ InsufficientFunds, 'Insufficient balance' ],
                    '20012': [ BadRequest, 'Invalid trade type, valid value: buy/sell)' ],
                    '20013': [ InvalidOrder, 'No order info found' ],
                    '20014': [ BadRequest, 'Invalid date, Valid format: 2018-07-25)' ],
                    '20015': [ BadRequest, 'Date exceeds the limit' ],
                    '20018': [ PermissionDenied, 'Your trading rights have been banned by the system' ],
                    '20019': [ BadSymbol, 'Wrong trading pair symbol. Correct format:"usdt_btc". Quote asset is in the front' ],
                    '20020': [ DDoSProtection, "You have violated the API operation trading rules and temporarily forbid trading. At present, we have certain restrictions on the user's transaction rate and withdrawal rate." ],
                    '50000': [ ExchangeError, 'Exception error' ],
                    '20021': [ BadRequest, 'Invalid currency' ],
                    '20022': [ BadRequest, 'The ending timestamp must be larger than the starting timestamp' ],
                    '20023': [ BadRequest, 'Invalid transfer type' ],
                    '20024': [ BadRequest, 'Invalid amount' ],
                    '20025': [ BadRequest, 'This currency is not transferable at the moment' ],
                    '20026': [ InsufficientFunds, 'Transfer amount exceed your balance' ],
                    '20027': [ PermissionDenied, 'Abnormal account status' ],
                    '20028': [ PermissionDenied, 'Blacklist for transfer' ],
                    '20029': [ PermissionDenied, 'Transfer amount exceed your daily limit' ],
                    '20030': [ BadRequest, 'You have no position on this trading pair' ],
                    '20032': [ PermissionDenied, 'Withdrawal limited' ],
                    '20033': [ BadRequest, 'Wrong Withdrawal ID' ],
                    '20034': [ PermissionDenied, 'Withdrawal service of this crypto has been closed' ],
                    '20035': [ PermissionDenied, 'Withdrawal limit' ],
                    '20036': [ ExchangeError, 'Withdrawal cancellation failed' ],
                    '20037': [ InvalidAddress, 'The withdrawal address, Tag or chain type is not included in the withdrawal management list' ],
                    '20038': [ InvalidAddress, 'The withdrawal address is not on the white list' ],
                    '20039': [ ExchangeError, "Can't be canceled in current status" ],
                    '20040': [ RateLimitExceeded, 'Withdraw too frequently; limitation: 3 times a minute, 100 times a day' ],
                    '20041': [ PermissionDenied, 'Beyond the daily withdrawal limit' ],
                    '20042': [ BadSymbol, 'Current trading pair does not support API trading' ],
                    '-1021': [ InvalidTimestamp, 'time offset too large' ],
                    '-2015': [ AuthenticationError, 'time offset too large' ],
                },
                'broad': {
                },
            },
            'options': {
                'defaultType': 'spot',
                'types': [ 'spot', 'margin', 'otc', 'future' ],
                'accountsByType': {
                    'spot': '1',
                    'margin': '2',
                    'OTC': '3',
                    'future': '4',
                },
            },
            'commonCurrencies': {
                'BHT': 'Black House Test',
                'EPS': 'Epanus',
                'FREE': 'FreeRossDAO',
                'MBN': 'Mobilian Coin',
                'TEL': 'TEL666',
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     {
        //         "data":[
        //             {
        //                 "deposit_status":1,
        //                 "min_deposit_amount":10,
        //                 "withdraw_fee_rate":0,
        //                 "min_withdraw_amount":10,
        //                 "min_withdraw_fee":5,
        //                 "currency":"USDT",
        //                 "withdraw_status":0,
        //                 "chain":"OMNI"
        //             },
        //             {
        //                 "deposit_status":1,
        //                 "min_deposit_amount":10,
        //                 "withdraw_fee_rate":0,
        //                 "min_withdraw_amount":10,
        //                 "min_withdraw_fee":3,
        //                 "currency":"USDT",
        //                 "withdraw_status":1,
        //                 "chain":"ERC20"
        //             },
        //             {
        //                 "deposit_status":0,
        //                 "min_deposit_amount":0,
        //                 "withdraw_fee_rate":0,
        //                 "min_withdraw_amount":0,
        //                 "min_withdraw_fee":0,
        //                 "currency":"DGF13",
        //                 "withdraw_status":0,
        //                 "chain":""
        //             },
        //         ],
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const depositStatus = this.safeInteger (currency, 'deposit_status', 1);
            const withdrawStatus = this.safeInteger (currency, 'withdraw_status', 1);
            const deposit = depositStatus > 0;
            const withdraw = withdrawStatus > 0;
            const active = deposit && withdraw;
            const fee = this.safeNumber (currency, 'withdraw_fee_rate');
            if (code in result) {
                if (Array.isArray (result[code]['info'])) {
                    result[code]['info'].push (currency);
                } else {
                    result[code]['info'] = [ result[code]['info'], currency ];
                }
            } else {
                result[code] = {
                    'id': id,
                    'code': code,
                    'info': currency,
                    'type': undefined,
                    'name': undefined,
                    'active': active,
                    'deposit': deposit,
                    'withdraw': withdraw,
                    'fee': fee,
                    'precision': 8, // todo fix hardcoded value
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.safeNumber (currency, 'min_withdraw_amount'),
                            'max': undefined,
                        },
                    },
                };
            }
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const options = this.safeValue (this.options, 'fetchMarkets', {});
        const method = this.safeString (options, 'method', 'fetch_markets_v2');
        return await this[method] (params);
    }

    async fetchMarketsV2 (params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        if ((type !== 'spot') && (type !== 'future') && (type !== 'margin')) {
            throw new ExchangeError (this.id + " does not support '" + type + "' type, set exchange.options['defaultType'] to 'spot', 'margin' or 'future'"); // eslint-disable-line quotes
        }
        let method = 'publicGetSymbols';
        if (type === 'future') {
            method = 'futuresPublicGetContracts';
        }
        const response = await this[method] (params);
        //
        //     {
        //         "symbol_list":[
        //             {
        //                 "order_types":["LIMIT","MARKET"],
        //                 "quote_asset":"USDT",
        //                 "minimum_value":2,
        //                 "amount_precision":4,
        //                 "status":"TRADING",
        //                 "minimum_amount":0.0001,
        //                 "symbol":"BTC_USDT",
        //                 "is_allow":1,
        //                 "zone":"MAIN",
        //                 "base_asset":"BTC",
        //                 "price_precision":2
        //             }
        //         ],
        //         "code":0
        //     }
        //
        let markets = [];
        if (type === 'future') {
            markets = response;
        } else {
            markets = this.safeValue (response, 'symbols', []);
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            if (baseId === undefined || quote === undefined) {
                symbol = id;
            }
            //
            // The status is documented in the exchange API docs as follows:
            // TRADING, HALT (delisted), BREAK (trading paused)
            // https://docs.digifinex.vip/en-ww/v3/#/public/spot/symbols
            // However, all spot markets actually have status === 'HALT'
            // despite that they appear to be active on the exchange website.
            // Apparently, we can't trust this status.
            // const status = this.safeString (market, 'status');
            // const active = (status === 'TRADING');
            //
            const isAllowed = this.safeInteger (market, 'is_allow', 1);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': isAllowed ? true : false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'quantityPrecision'),
                    'price': this.safeInteger (market, 'pricePrecision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
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
            });
        }
        return result;
    }

    async fetchMarketsV1 (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         "data": [
        //             {
        //                 "volume_precision":4,
        //                 "price_precision":2,
        //                 "market":"btc_usdt",
        //                 "min_amount":2,
        //                 "min_volume":0.0001
        //             },
        //         ],
        //         "date":1564507456,
        //         "code":0
        //     }
        //
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'market');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'price': this.safeInteger (market, 'price_precision'),
                    'amount': this.safeInteger (market, 'volume_precision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_volume'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseBalance (response, type = undefined) {
        const result = {};
        if (type === 'future') {
            const balances = this.safeValue (response, 'account', []);
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString (balance, 'marginCoin');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['used'] = Number (this.safeString (balance, 'accountLock'));
                account['free'] = Number (this.safeString (balance, 'accountNormal'));
                account['total'] = Number (account['used']) + Number (account['free']);
                result[code] = account;
            }
        } else {
            const balances = this.safeValue (response, 'balances', []);
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString (balance, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['used'] = this.safeString (balance, 'locked');
                account['free'] = this.safeString (balance, 'free');
                account['total'] = this.safeString (balance, 'total');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        let method = 'privateGetAccount';
        if (type === 'future') {
            method = 'futuresPrivateGetAccount';
        }
        //
        //     {
        //         "code": 0,
        //         "list": [
        //             {
        //                 "currency": "BTC",
        //                 "free": 4723846.89208129,
        //                 "total": 0
        //             }
        //         ]
        //     }
        const response = await this[method] ();
        return this.parseBalance (response, type);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 150
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        //
        //   {
        //     asks: [
        //       [ 30254, 0.2 ],
        //       [ 30255.2, 0.28135 ],
        //       [ 30257.02, 1 ],
        //       [ 30259.06, 1 ],
        //       [ 30261.25, 0.264605 ]
        //     ],
        //     bids: [
        //       [ 30248, 0.587945 ],
        //       [ 30246.8, 0.565675 ],
        //       [ 30244.98, 0.491045 ],
        //       [ 30242.94, 1.47951 ],
        //       [ 30240.75, 1.444575 ]
        //     ],
        //     time: null
        //   }
        //
        const timestamp = this.safeTimestamp (response, 'time');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        //
        // {
        //     "high": "0.121032",
        //     "vol": "747275.3289",
        //     "last": "0.120181",
        //     "low": "0.111899",
        //     "buy": 0.1196,
        //     "sell": 0.12064,
        //     "rose": "0.05228089",
        //     "time": 1652790345000,
        //     "open": "0.11421"
        // }
        //
        const result = {};
        const tickers = this.safeValue (response, 'ticker', []);
        const date = this.safeInteger (response, 'date');
        for (let i = 0; i < tickers.length; i++) {
            const rawTicker = this.extend ({
                'date': date,
            }, tickers[i]);
            const ticker = this.parseTicker (rawTicker);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        // {
        //     "high": "0.121032",
        //     "vol": "747275.3289",
        //     "last": "0.120181",
        //     "low": "0.111899",
        //     "buy": 0.1196,
        //     "sell": 0.12064,
        //     "rose": "0.05228089",
        //     "time": 1652790345000,
        //     "open": "0.11421"
        // }
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //     "high": "0.121032",
        //     "vol": "747275.3289",
        //     "last": "0.120181",
        //     "low": "0.111899",
        //     "buy": 0.1196,
        //     "sell": 0.12064,
        //     "rose": "0.05228089",
        //     "time": 1652790345000,
        //     "open": "0.11421"
        //     }
        //
        const marketId = this.safeStringUpper (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeTimestamp (ticker, 'time');
        const last = this.safeString (ticker, 'last');
        // const percentage = this.safeString (ticker, 'change');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': new Date (timestamp).toUTCString (),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': this.safeString (ticker, 'base_vol'),
            'info': ticker,
        }, market, false);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //     "price": "3.00000100",
        //     "qty": "11.00000000",
        //     "time": 1499865549590,
        //     "side": "BUY"
        //   }
        //
        // fetchMyTrades (private)
        //
        //     {
        //     "symbol": "ETHBTC",
        //     "id": 100211,
        //     "bidId": 150695552109032492,
        //     "askId": 150695552109032493,
        //     "price": "4.00000100",
        //     "qty": "12.00000000",
        //     "time": 1499865549590,
        //     "isBuyer": true,
        //     "isMaker": false,
        //     "feeCoin": "ETH",
        //     "fee":"0.001"
        //   }
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeTimestamp2 (trade, 'time', 'timestamp');
        const side = this.safeString2 (trade, 'side');
        // const parts = side.split('_');
        // side = this.safeString(parts, 0);
        // const type = this.safeString(parts, 1);
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'qty');
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const takerOrMaker = this.safeValue (trade, 'isMaker');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCoin');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': undefined,
            'side': side.toUpperCase (),
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        }, market);
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "server_time": 1589873762,
        //         "code": 0
        //     }
        //
        return this.safeTimestamp (response, 'server_time');
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetPing (params);
        //
        //     {
        //         "msg": "pong",
        //         "code": 0
        //     }
        //
        const code = this.safeInteger (response, 'code');
        const status = (code === 0) ? 'ok' : 'maintenance';
        return {
            'status': status,
            'updated': this.milliseconds (),
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        market['symbol'] = market['id'].toUpperCase ();
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 500
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "date":1564520003,
        //                 "id":1596149203,
        //                 "amount":0.7073,
        //                 "type":"buy",
        //                 "price":0.02193,
        //             },
        //             {
        //                 "date":1564520002,
        //                 "id":1596149165,
        //                 "amount":0.3232,
        //                 "type":"sell",
        //                 "price":0.021927,
        //             },
        //         ],
        //         "code": 0,
        //         "date": 1564520003,
        //     }
        //
        const data = this.safeValue (response, 'list', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv) {
        //
        //     [
        //         1556712900,
        //         2205.899,
        //         0.029967,
        //         0.02997,
        //         0.029871,
        //         0.029927
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 5), // open
            this.safeNumber (ohlcv, 3), // high
            this.safeNumber (ohlcv, 4), // low
            this.safeNumber (ohlcv, 2), // close
            this.safeNumber (ohlcv, 1), // volume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
            // 'start_time': 1564520003, // starting timestamp, 200 candles before end_time by default
            // 'end_time': 1564520003, // ending timestamp, current timestamp by default
        };
        if (since !== undefined) {
            const startTime = parseInt (since / 1000);
            request['start_time'] = startTime;
            if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe);
                request['end_time'] = this.sum (startTime, limit * duration);
            }
        } else if (limit !== undefined) {
            const endTime = this.seconds ();
            const duration = this.parseTimeframe (timeframe);
            request['startTime'] = this.sum (endTime, -limit * duration);
        }
        const response = await this.publicGetKline (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             [1556712900,2205.899,0.029967,0.02997,0.029871,0.029927],
        //             [1556713800,1912.9174,0.029992,0.030014,0.029955,0.02996],
        //             [1556714700,1556.4795,0.029974,0.030019,0.029969,0.02999],
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const defaultType = this.safeString2 (this.options, 'createOrder', 'defaultType', 'spot');
        const marketType = this.safeString (params, 'type', defaultType);
        this.options['defaultType'] = marketType;
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {};
        let method = 'privatePostOrder';
        if (marketType === 'future') {
            const open = this.safeString (params, 'open');
            const timeInForces = this.safeString (params, 'timeInForces');
            const positionType = this.safeNumber (params, 'positionType');
            request = {
                'contractName': market['id'],
                'volume': Number (this.amountToPrecision (symbol, amount)),
                'side': side.toUpperCase (),
                'open': open,
                'timeInForce': timeInForces,
            };
            if (type === 'MARKET') {
                request['type'] = type.toUpperCase ();
            } else {
                request['type'] = type.toUpperCase ();
                request['price'] = Number (this.priceToPrecision (symbol, price));
            }
            request['clientOrderId'] = String (Date.now ());
            request['positionType'] = positionType;
            method = 'futuresPrivatePostOrder';
        } else {
            const newClientOrderId = this.safeString (params, 'newClientOrderId', String (Date.now ()));
            const recvWindow = this.safeString (params, 'recvWindow', undefined);
            request = {
                'symbol': market['id'],
                'volume': Number (this.amountToPrecision (symbol, amount)),
                'side': side.toUpperCase (),
            };
            if (type === 'MARKET') {
                request['type'] = type.toUpperCase ();
            } else {
                request['type'] = type.toUpperCase ();
                request['price'] = Number (this.priceToPrecision (symbol, price));
            }
            request['newClientOrderId'] = newClientOrderId;
            request['recvWindow'] = recvWindow;
        }
        const response = await this[method] (this.extend (request));
        if (response.code === '-1147' || response.code === '-2017') {
            throw new InsufficientFunds ('Insufficient balance');
        }
        const result = this.parseOrder (response, market);
        return this.extend (result, {
            'symbol': symbol,
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            'amount': amount,
            'price': price,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const defaultType = this.safeString2 (this.options, 'createOrder', 'defaultType', 'spot');
        const marketType = this.safeString (params, 'type', defaultType);
        this.options['defaultType'] = marketType;
        await this.loadMarkets ();
        const market = this.market (symbol);
        params = this.omit (params, 'type');
        let request = {};
        let method = 'privatePostCancel';
        if (marketType === 'future') {
            request = {
                'contractName': market['id'],
                'orderId': id,
            };
            method = 'futuresPrivatePostCancel';
        } else {
            const newClientOrderId = this.safeString (params, 'newClientOrderId', undefined);
            request = {
                'symbol': market['id'].toUpperCase (),
                'orderId': id,
                'newClientOrderId': newClientOrderId,
            };
        }
        const query = this.omit (params, [ 'type', 'origClientOrderId', 'clientOrderId' ]);
        const response = await this[method] (this.extend (request, query));
        if (response.orderId === undefined) {
            throw new OrderNotFound (this.id + ' cancelOrder() ' + id + ' not found');
        }
        return response;
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        params = this.omit (params, 'type');
        const request = {
            'symbol': market['id'].toUpperCase (),
            'orderIds': ids,
        };
        const response = await this.privatePostBatchCancel (this.extend (request, params));        // {
        //     'success': [1117619175576997500],
        //     'failed': []
        // }
        const canceledOrders = this.safeValue (response, 'success', []);
        const numCanceledOrders = canceledOrders.length;
        if (numCanceledOrders < 1) {
            throw new OrderNotFound (this.id + ' cancelOrders() error');
        }
        return response;
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open', // partially filled
            '2': 'closed',
            '3': 'canceled',
            '4': 'canceled', // partially filled and canceled
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "code": 0,
        //         "order_id": "198361cecdc65f9c8c9bb2fa68faec40"
        //     }
        //
        // fetchOrder, fetchOpenOrders, fetchOrders
        //
        // {
        //     'orderId': '499902955766523648',
        //     'symbol': 'BHTUSDT',
        //     'price': '0.01',
        //     'origQty': '50',
        //     'executedQty': '0',
        //     'avgPrice': '0',
        //     'status': 'NEW',
        //     'type': 'LIMIT',
        //     'side': 'BUY',
        //     'time': '1574329076202'
        // }

        const id = this.safeString (order, 'orderId');
        const timestamp = this.safeTimestamp (order, 'time');
        const side = this.safeString (order, 'side', undefined);
        const type = this.safeString (order, 'type', undefined);
        // if (side !== undefined) {
        //     const parts = side;
        //     const numParts = parts.length;
        //     if (numParts > 1) {
        //         side = parts[0];
        //         type = parts[1];
        //     } else {
        //         type = 'limit';
        //     }
        // }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const amountString = this.safeString (order, 'origQty');
        const filledString = this.safeString (order, 'executedQty');
        const priceString = this.safeString (order, 'price');
        const averageString = this.safeString (order, 'avgPrice');
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
            'price': priceString,
            'stopPrice': undefined,
            'amount': amountString,
            'filled': filledString,
            'remaining': undefined,
            'cost': undefined,
            'average': averageString,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const marketType = this.safeString (params, 'type', defaultType);
        const since = this.safeNumber (params, 'since', undefined);
        const limit = this.safeInteger (params, 'limit', undefined);
        this.options['defaultType'] = marketType;
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        let method = 'privateGetOpenOrders';
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        if (marketType === 'future') {
            request['contractName'] = market['id'];
            method = 'futuresPrivateGetOpenOrders';
        } else {
            request['symbol'] = market['id'];
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //   list: [
        //     {
        //       side: 'SELL',
        //       executedQty: '0',
        //       orderId: '1117848578370211983',
        //       price: '2',
        //       origQty: '10',
        //       avg_price: '0',
        //       time: '1653302191000',
        //       type: 'LIMIT',
        //       status: 'NEW'
        //     }
        //   ]
        // }
        //
        let data = [];
        if (response.code === 0) {
            return this.parseOrders (data, market, since, limit);
        } else {
            if (marketType === 'future') {
                data = response;
            } else {
                data = this.safeValue (response, 'list', []);
            }
            return this.parseOrders (data, market, since, limit);
        }
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        // const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = this.market (symbol);
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //                 "created_date": 1562303547,
        //                 "finished_date": 0,
        //                 "price": 0.1,
        //                 "amount": 1,
        //                 "cash_amount": 1,
        //                 "executed_amount": 0,
        //                 "avg_price": 0,
        //                 "status": 1,
        //                 "type": "buy",
        //                 "kind": "margin"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'list', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, newClientOrderId = undefined, params = {}) {
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'symbol': market['id'].toUpperCase (),
            'newClientOrderId': newClientOrderId,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        // {
        //     symbol: 'SCLPUSDT',
        //     side: 'SELL',
        //     executedQty: '0.0',
        //     orderId: '1117802587860464223',
        //     price: '2.0',
        //     origQty: '10.0',
        //     avgPrice: '0.0',
        //     clientOrderId: null,
        //     transactTime: '1653246972000',
        //     type: 'LIMIT',
        //     status: 'NEW'
        //   }
        if (response.orderId === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() order ' + id + ' not found');
        }
        return this.parseOrder (response, market);
    }

    async fetchMarginOrder (id, symbol = undefined, newClientOrderId = undefined, params = {}) {
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'symbol': market['id'].toUpperCase (),
            'newClientOrderId': newClientOrderId,
        };
        const response = await this.privateGetMarginOrder (this.extend (request, params));
        // {
        //     symbol: 'SCLPUSDT',
        //     side: 'SELL',
        //     executedQty: '0.0',
        //     orderId: '1117802587860464223',
        //     price: '2.0',
        //     origQty: '10.0',
        //     avgPrice: '0.0',
        //     clientOrderId: null,
        //     transactTime: '1653246972000',
        //     type: 'LIMIT',
        //     status: 'NEW'
        //   }
        if (response.orderId === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder () order ' + id + ' not found');
        }
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, fromId = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const marketType = this.safeString (params, 'type', defaultType);
        this.options['defaultType'] = marketType;
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let method = 'privateGetMyTrades';
        if (marketType === 'future') {
            request['symbol'] = market['id'];
            method = 'futuresPrivateGetMyTrades';
        } else {
            request['contractName'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        request['fromId'] = fromId;
        const response = await this[method] (this.extend (request, params));
        //
        //      {
        //          "list":[
        //              {
        //                  "timestamp":1639506068,
        //                  "is_maker":false,
        //                  "id":"8975951332",
        //                  "amount":31.83,
        //                  "side":"sell_market",
        //                  "symbol":"DOGE_USDT",
        //                  "fee_currency":"USDT",
        //                  "fee":0.01163774826
        //                  ,"order_id":"32b169792f4a7a19e5907dc29fc123d4",
        //                  "price":0.182811
        //                }
        //             ],
        //           "code": 0
        //      }
        //
        const data = this.safeValue (response, 'list', []);
        return this.parseTrades (data, market, since, limit, {});
    }

    parseLedgerEntryType (type) {
        const types = {};
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "currency_mark": "BTC",
        //         "type": 100234,
        //         "num": 28457,
        //         "balance": 0.1,
        //         "time": 1546272000
        //     }
        //
        const id = this.safeString (item, 'num');
        const account = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (this.safeString (item, 'currency_mark'), currency);
        const timestamp = this.safeTimestamp (item, 'time');
        const before = undefined;
        const after = this.safeNumber (item, 'balance');
        const status = 'ok';
        return {
            'info': item,
            'id': id,
            'direction': undefined,
            'account': account,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': undefined,
            'before': before,
            'after': after,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        const request = {
            'market': orderType,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency_mark'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        const response = await this.privateGetMarketFinancelog (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "total": 521,
        //             "finance": [
        //                 {
        //                     "currency_mark": "BTC",
        //                     "type": 100234,
        //                     "num": 28457,
        //                     "balance": 0.1,
        //                     "time": 1546272000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const items = this.safeValue (data, 'finance', []);
        return this.parseLedger (items, currency, since, limit);
    }

    parseDepositAddress (depositAddress) {
        //
        //     {
        //         "addressTag":"",
        //         "address":"0xf1104d9f8624f89775a3e9d480fc0e75a8ef4373",
        //         "currency":"USDT",
        //         "chain":"ERC20"
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'addressTag');
        const currencyId = this.safeStringUpper (depositAddress, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        return {
            'info': depositAddress,
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "addressTag":"",
        //                 "address":"0xf1104d9f8624f89775a3e9d480fc0e75a8ef4373",
        //                 "currency":"USDT",
        //                 "chain":"ERC20"
        //             }
        //         ],
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const addresses = this.parseDepositAddresses (data);
        const address = this.safeValue (addresses, code);
        if (address === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress() did not return an address for ' + code + ' - create the deposit address in the user settings on the exchange website first.');
        }
        return address;
    }

    async fetchTransactionsByType (type, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            // 'currency': currency['id'],
            // 'from': 'fromId', // When direct is' prev ', from is 1, returning from old to new ascending, when direct is' next ', from is the ID of the most recent record, returned from the old descending order
            // 'size': 100, // default 100, max 500
            // 'direct': 'prev', // "prev" ascending, "next" descending
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['size'] = Math.min (500, limit);
        }
        const method = (type === 'deposit') ? 'privateGetDepositHistory' : 'privateGetWithdrawHistory';
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "data": [
        //             {
        //                 "id": 1171,
        //                 "currency": "xrp",
        //                 "hash": "ed03094b84eafbe4bc16e7ef766ee959885ee5bcb265872baaa9c64e1cf86c2b",
        //                 "chain": "",
        //                 "amount": 7.457467,
        //                 "address": "rae93V8d2mdoUQHwBDBdM4NHCMehRJAsbm",
        //                 "memo": "100040",
        //                 "fee": 0,
        //                 "state": "safe",
        //                 "created_date": "2020-04-20 11:23:00",
        //                 "finished_date": "2020-04-20 13:23:00"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, { 'type': type });
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('deposit', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('withdrawal', code, since, limit, params);
    }

    parseTransactionStatus (status) {
        // deposit state includes: 1 (in deposit), 2 (to be confirmed), 3 (successfully deposited), 4 (stopped)
        // withdrawal state includes: 1 (application in progress), 2 (to be confirmed), 3 (completed), 4 (rejected)
        const statuses = {
            '1': 'pending', // in Progress
            '2': 'pending', // to be confirmed
            '3': 'ok', // Completed
            '4': 'failed', // Rejected
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "code": 200,
        //         "withdraw_id": 700
        //     }
        //
        // fetchDeposits, fetchWithdrawals
        //
        //     {
        //         "id": 1171,
        //         "currency": "xrp",
        //         "hash": "ed03094b84eafbe4bc16e7ef766ee959885ee5bcb265872baaa9c64e1cf86c2b",
        //         "chain": "",
        //         "amount": 7.457467,
        //         "address": "rae93V8d2mdoUQHwBDBdM4NHCMehRJAsbm",
        //         "memo": "100040",
        //         "fee": 0,
        //         "state": "safe",
        //         "created_date": "2020-04-20 11:23:00",
        //         "finished_date": "2020-04-20 13:23:00"
        //     }
        //
        const id = this.safeString2 (transaction, 'id', 'withdraw_id');
        const address = this.safeString (transaction, 'address');
        let tag = this.safeString (transaction, 'memo'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        const txid = this.safeString (transaction, 'hash');
        const currencyId = this.safeStringUpper (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_date'));
        const updated = this.parse8601 (this.safeString (transaction, 'finished_date'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const amount = this.safeNumber (transaction, 'amount');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        let network = this.safeString (transaction, 'chain');
        if (network === '') {
            network = undefined;
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            '0': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //     {
        //         "code": 0
        //     }
        //
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeCurrencyCode (undefined, currency),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': this.safeString (transfer, 'fromAccount'),
            'toAccount': this.safeString (transfer, 'toAccount'),
            'status': this.parseTransferStatus (this.safeString (transfer, 'code')),
        };
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const request = {
            'currency_mark': currency['id'],
            'num': parseFloat (this.currencyToPrecision (code, amount)),
            'from': fromId, // 1 = SPOT, 2 = MARGIN, 3 = OTC
            'to': toId, // 1 = SPOT, 2 = MARGIN, 3 = OTC
        };
        const response = await this.privatePostTransfer (this.extend (request, params));
        //
        //     {
        //         "code": 0
        //     }
        //
        const transfer = this.parseTransfer (response, currency);
        return this.extend (transfer, {
            'amount': amount,
            'currency': code,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        });
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            // 'chain': 'ERC20', 'OMNI', 'TRC20', // required for USDT
            'address': address,
            'amount': parseFloat (amount),
            'currency': currency['id'],
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostWithdrawNew (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "withdraw_id": 700
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.version;
        let url = this.urls['api'][api] + '/' + version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const urlencoded = this.urlencode (params);
        if (api === 'private' || api === 'futuresPrivate') {
            const timestamp = Date.now ();
            // the signature is not time-limited :\
            let signatureBody = '';
            let midPath = '';
            if (api === 'futuresPrivate') midPath = '/fapi';
            else midPath = '/sapi';
            if (method === 'GET') {
                if (urlencoded) {
                    url += '?' + urlencoded;
                    signatureBody = timestamp + method + `${midPath}/v1/${path}?${urlencoded}`;
                } else {
                    signatureBody = timestamp + method + `${midPath}/v1/${path}`;
                }
            } else if (method === 'POST') {
                if (urlencoded) {
                    body = this.json (query);
                }
                signatureBody = timestamp + method + `${midPath}/v1/${path}` + body;
            }
            const signature = this.hmac (signatureBody, this.secret, 'SHA256');
            headers = {
                'X-CH-APIKEY': this.apiKey,
                'X-CH-SIGN': signature,
                'X-CH-TS': timestamp,
                'Content-Type': 'application/json',
            };
        } else {
            if (urlencoded) {
                url += '?' + urlencoded;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fall back to default error handler
        }
        if (statusCode === 200 && response.code === undefined) {
            return;
        }
        const feedback = this.id + ' ' + responseBody;
        if (statusCode !== 200 || response.code !== undefined) {
            throw new BadResponse (feedback);
        }
        const unknownError = [ ExchangeError, feedback ];
        const [ ExceptionClass, message ] = this.safeValue (this.exceptions['exact'], statusCode, unknownError);
        throw new ExceptionClass (message);
    }
};
