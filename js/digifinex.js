'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountSuspended, BadRequest, BadResponse, NetworkError, DDoSProtection, AuthenticationError, PermissionDenied, ExchangeError, InsufficientFunds, InvalidOrder, InvalidNonce, OrderNotFound, InvalidAddress, RateLimitExceeded, BadSymbol } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class digifinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'digifinex',
            'name': 'DigiFinex',
            'countries': [ 'SG' ],
            'version': 'v3',
            'rateLimit': 900, // 300 for posts
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': undefined, // has but unimplemented
                'future': false,
                'option': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRate': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositionMode': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'setMarginMode': false,
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
                    'rest': 'https://openapi.digifinex.com',
                },
                'www': 'https://www.digifinex.com',
                'doc': [
                    'https://docs.digifinex.com',
                ],
                'fees': 'https://digifinex.zendesk.com/hc/en-us/articles/360000328422-Fee-Structure-on-DigiFinex',
                'referral': 'https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp',
            },
            'api': {
                'public': {
                    'get': [
                        '{market}/symbols',
                        'kline',
                        'margin/currencies',
                        'margin/symbols',
                        'markets',
                        'order_book',
                        'ping',
                        'spot/symbols',
                        'time',
                        'trades',
                        'trades/symbols',
                        'ticker',
                        'currencies',
                    ],
                },
                'private': {
                    'get': [
                        '{market}/financelog',
                        '{market}/mytrades',
                        '{market}/order',
                        '{market}/order/detail',
                        '{market}/order/current',
                        '{market}/order/history',
                        'margin/assets',
                        'margin/financelog',
                        'margin/mytrades',
                        'margin/order',
                        'margin/order/current',
                        'margin/order/history',
                        'margin/positions',
                        'otc/financelog',
                        'spot/assets',
                        'spot/financelog',
                        'spot/mytrades',
                        'spot/order',
                        'spot/order/current',
                        'spot/order/history',
                        'deposit/address',
                        'deposit/history',
                        'withdraw/history',
                    ],
                    'post': [
                        '{market}/order/cancel',
                        '{market}/order/new',
                        '{market}/order/batch_new',
                        'margin/order/cancel',
                        'margin/order/new',
                        'margin/position/close',
                        'spot/order/cancel',
                        'spot/order/new',
                        'transfer',
                        'withdraw/new',
                        'withdraw/cancel',
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
            'precisionMode': TICK_SIZE,
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
                },
                'broad': {
                },
            },
            'options': {
                'defaultType': 'spot',
                'types': [ 'spot', 'margin', 'otc' ],
                'accountsByType': {
                    'spot': '1',
                    'margin': '2',
                    'OTC': '3',
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

    safeNetwork (networkId) {
        if (networkId === undefined) {
            return undefined;
        } else {
            return networkId.toUpperCase ();
        }
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name digifinex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
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
            const fee = this.safeNumber (currency, 'min_withdraw_fee'); // withdraw_fee_rate was zero for all currencies, so this was the worst case scenario
            const minWithdraw = this.safeNumber (currency, 'min_withdraw_amount');
            const minDeposit = this.safeNumber (currency, 'min_deposit_amount');
            const networkId = this.safeString (currency, 'chain');
            const network = {
                'id': networkId,
                'network': this.safeNetwork (networkId),
                'name': undefined,
                'active': active,
                'fee': fee,
                'precision': this.parseNumber ('0.00000001'), // todo fix hardcoded value
                'deposit': deposit,
                'withdraw': withdraw,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': minWithdraw,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': minDeposit,
                        'max': undefined,
                    },
                },
                'info': currency,
            };
            if (code in result) {
                if (Array.isArray (result[code]['info'])) {
                    result[code]['info'].push (currency);
                } else {
                    result[code]['info'] = [ result[code]['info'], currency ];
                }
                if (withdraw) {
                    result[code]['withdraw'] = true;
                    result[code]['limits']['withdraw']['min'] = Math.min (result[code]['limits']['withdraw']['min'], minWithdraw);
                }
                if (deposit) {
                    result[code]['deposit'] = true;
                    result[code]['limits']['deposit']['min'] = Math.min (result[code]['limits']['deposit']['min'], minDeposit);
                }
                if (active) {
                    result[code]['active'] = true;
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
                    'precision': this.parseNumber ('0.00000001'), // todo fix hardcoded value
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': minWithdraw,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': minDeposit,
                            'max': undefined,
                        },
                    },
                    'networks': {},
                };
            }
            result[code]['networks'][networkId] = network;
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name digifinex#fetchMarkets
         * @description retrieves data on all markets for digifinex
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const options = this.safeValue (this.options, 'fetchMarkets', {});
        const method = this.safeString (options, 'method', 'fetch_markets_v2');
        return await this[method] (params);
    }

    async fetchMarketsV2 (params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType');
        const method = (defaultType === 'margin') ? 'publicGetMarginSymbols' : 'publicGetTradesSymbols';
        const response = await this[method] (params);
        //
        // Spot
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
        // Margin
        //
        //     {
        //         "symbol_list":[
        //             {
        //                     "order_types":["LIMIT"],
        //                     "quote_asset":"USDT",
        //                     "minimum_value":0,
        //                     "amount_precision":2,
        //                     "status":"TRADING",
        //                     "minimum_amount":22,
        //                     "liquidation_rate":0.3,
        //                     "symbol":"TRX_USDT",
        //                     "zone":"MAIN",
        //                     "base_asset":"TRX",
        //                     "price_precision":6
        //             },
        //         ],
        //         "code":0
        //     }
        //
        const markets = this.safeValue (response, 'symbol_list', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base_asset');
            const quoteId = this.safeString (market, 'quote_asset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
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
            const type = (defaultType === 'margin') ? 'margin' : 'spot';
            const spot = (defaultType === 'spot') ? true : undefined;
            const margin = (defaultType === 'margin') ? true : undefined;
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': type,
                'spot': spot,
                'margin': margin,
                'swap': false,
                'future': false,
                'option': false,
                'active': isAllowed ? true : undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'amount_precision'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minimum_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minimum_value'),
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
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_precision'))),
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'volume_precision'))),
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

    parseBalance (response) {
        const balances = this.safeValue (response, 'list', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeString (balance, 'frozen');
            account['free'] = this.safeString (balance, 'free');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name digifinex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const method = 'privateGet' + this.capitalize (type) + 'Assets';
        const response = await this[method] (params);
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
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 150
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        //
        //     {
        //         "bids": [
        //             [9605.77,0.0016],
        //             [9605.46,0.0003],
        //             [9602.04,0.0127],
        //         ],
        //         "asks": [
        //             [9627.22,0.025803],
        //             [9627.12,0.168543],
        //             [9626.52,0.0011529],
        //         ],
        //         "date":1564509499,
        //         "code":0
        //     }
        //
        const timestamp = this.safeTimestamp (response, 'date');
        return this.parseOrderBook (response, market['symbol'], timestamp);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetTicker (params);
        //
        //    {
        //        "ticker": [{
        //            "vol": 40717.4461,
        //            "change": -1.91,
        //            "base_vol": 392447999.65374,
        //            "sell": 9592.23,
        //            "last": 9592.22,
        //            "symbol": "btc_usdt",
        //            "low": 9476.24,
        //            "buy": 9592.03,
        //            "high": 9793.87
        //        }],
        //        "date": 1589874294,
        //        "code": 0
        //    }
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
        /**
         * @method
         * @name digifinex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //    {
        //        "ticker": [{
        //            "vol": 40717.4461,
        //            "change": -1.91,
        //            "base_vol": 392447999.65374,
        //            "sell": 9592.23,
        //            "last": 9592.22,
        //            "symbol": "btc_usdt",
        //            "low": 9476.24,
        //            "buy": 9592.03,
        //            "high": 9793.87
        //        }],
        //        "date": 1589874294,
        //        "code": 0
        //    }
        //
        const date = this.safeInteger (response, 'date');
        const tickers = this.safeValue (response, 'ticker', []);
        const firstTicker = this.safeValue (tickers, 0, {});
        const result = this.extend ({ 'date': date }, firstTicker);
        return this.parseTicker (result, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "last":0.021957,
        //         "symbol": "btc_usdt",
        //         "base_vol":2249.3521732227,
        //         "change":-0.6,
        //         "vol":102443.5111,
        //         "sell":0.021978,
        //         "low":0.021791,
        //         "buy":0.021946,
        //         "high":0.022266,
        //         "date"1564518452, // injected from fetchTicker/fetchTickers
        //     }
        //
        const marketId = this.safeStringUpper (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeTimestamp (ticker, 'date');
        const last = this.safeString (ticker, 'last');
        const percentage = this.safeString (ticker, 'change');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': this.safeString (ticker, 'base_vol'),
            'info': ticker,
        }, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "date":1564520003,
        //         "id":1596149203,
        //         "amount":0.7073,
        //         "type":"buy",
        //         "price":0.02193,
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "order_id": "6707cbdcda0edfaa7f4ab509e4cbf966",
        //         "id": 28457,
        //         "price": 0.1,
        //         "amount": 0,
        //         "fee": 0.096,
        //         "fee_currency": "USDT",
        //         "timestamp": 1499865549,
        //         "side": "buy", // or "side": "sell_market"
        //         "is_maker": true
        //     }
        //
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        const timestamp = this.safeTimestamp2 (trade, 'date', 'timestamp');
        let side = this.safeString2 (trade, 'type', 'side');
        const parts = side.split ('_');
        side = this.safeString (parts, 0);
        const type = this.safeString (parts, 1);
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const takerOrMaker = this.safeValue (trade, 'is_maker');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
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
            'type': type,
            'order': orderId,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        }, market);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name digifinex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
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
        /**
         * @method
         * @name digifinex#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}
         */
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
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
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
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
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
        /**
         * @method
         * @name digifinex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
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
        /**
         * @method
         * @name digifinex#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const request = {
            'market': orderType,
            'symbol': market['id'],
            'amount': this.amountToPrecision (market['symbol'], amount),
            // 'post_only': 0, // 0 by default, if set to 1 the order will be canceled if it can be executed immediately, making sure there will be no market taking
        };
        let suffix = '';
        if (type === 'market') {
            suffix = '_market';
        } else {
            request['price'] = this.priceToPrecision (market['symbol'], price);
        }
        request['type'] = side + suffix;
        const response = await this.privatePostMarketOrderNew (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "order_id": "198361cecdc65f9c8c9bb2fa68faec40"
        //     }
        //
        const result = this.parseOrder (response, market);
        return this.extend (result, {
            'symbol': market['symbol'],
            'side': side,
            'type': type,
            'amount': amount,
            'price': price,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by digifinex cancelOrder ()
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const request = {
            'market': orderType,
            'order_id': id,
        };
        const response = await this.privatePostMarketOrderCancel (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "success": [
        //             "198361cecdc65f9c8c9bb2fa68faec40",
        //             "3fb0d98e51c18954f10d439a9cf57de0"
        //         ],
        //         "error": [
        //             "78a7104e3c65cc0c5a212a53e76d0205"
        //         ]
        //     }
        //
        const canceledOrders = this.safeValue (response, 'success', []);
        const numCanceledOrders = canceledOrders.length;
        if (numCanceledOrders !== 1) {
            throw new OrderNotFound (this.id + ' cancelOrder() ' + id + ' not found');
        }
        return response;
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#cancelOrders
         * @description cancel multiple orders
         * @param {[string]} ids order ids
         * @param {string|undefined} symbol not used by digifinex cancelOrders ()
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const request = {
            'market': orderType,
            'order_id': ids.join (','),
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "success": [
        //             "198361cecdc65f9c8c9bb2fa68faec40",
        //             "3fb0d98e51c18954f10d439a9cf57de0"
        //         ],
        //         "error": [
        //             "78a7104e3c65cc0c5a212a53e76d0205"
        //         ]
        //     }
        //
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
        //     {
        //         "symbol": "BTC_USDT",
        //         "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //         "created_date": 1562303547,
        //         "finished_date": 0,
        //         "price": 0.1,
        //         "amount": 1,
        //         "cash_amount": 1,
        //         "executed_amount": 0,
        //         "avg_price": 0,
        //         "status": 1,
        //         "type": "buy",
        //         "kind": "margin"
        //     }
        //
        const id = this.safeString (order, 'order_id');
        const timestamp = this.safeTimestamp (order, 'created_date');
        const lastTradeTimestamp = this.safeTimestamp (order, 'finished_date');
        let side = this.safeString (order, 'type');
        let type = undefined;
        if (side !== undefined) {
            const parts = side.split ('_');
            const numParts = parts.length;
            if (numParts > 1) {
                side = parts[0];
                type = parts[1];
            } else {
                type = 'limit';
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const amountString = this.safeString (order, 'amount');
        const filledString = this.safeString (order, 'executed_amount');
        const priceString = this.safeString (order, 'price');
        const averageString = this.safeString (order, 'avg_price');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
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

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'market': orderType,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetMarketOrderCurrent (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'market': orderType,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000); // default 3 days from now, max 30 days
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        const response = await this.privateGetMarketOrderHistory (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'market': orderType,
            'order_id': id,
        };
        const response = await this.privateGetMarketOrder (this.extend (request, params));
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
        const data = this.safeValue (response, 'data', []);
        const order = this.safeValue (data, 0);
        if (order === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() order ' + id + ' not found');
        }
        return this.parseOrder (order, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'market': orderType,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000); // default 3 days from now, max 30 days
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        const response = await this.privateGetMarketMytrades (this.extend (request, params));
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
        return this.parseTrades (data, market, since, limit);
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
        /**
         * @method
         * @name digifinex#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
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

    parseDepositAddress (depositAddress, currency = undefined) {
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
        /**
         * @method
         * @name digifinex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
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
        /**
         * @method
         * @name digifinex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        return await this.fetchTransactionsByType ('deposit', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name digifinex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
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
        const tag = this.safeString (transaction, 'memo');
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
        const network = this.safeString (transaction, 'chain');
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
        /**
         * @method
         * @name digifinex#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
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
        /**
         * @method
         * @name digifinex#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
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

    async fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetMarginPositions (this.extend (request, params));
        //
        //     {
        //         "margin": "45.71246418952618",
        //         "code": 0,
        //         "margin_rate": "7.141978570340037",
        //         "positions": [
        //             {
        //                 "amount": 0.0006103,
        //                 "side": "go_long",
        //                 "entry_price": 31428.72,
        //                 "liquidation_rate": 0.3,
        //                 "liquidation_price": 10225.335481159,
        //                 "unrealized_roe": -0.0076885829266987,
        //                 "symbol": "BTC_USDT",
        //                 "unrealized_pnl": -0.049158102631999,
        //                 "leverage_ratio": 3
        //             }
        //         ],
        //         "unrealized_pnl": "-0.049158102631998504"
        //     }
        //
        const rows = this.safeValue (response, 'positions');
        const interest = this.parseBorrowInterests (rows, market);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info, market) {
        //
        //     {
        //         "amount": 0.0006103,
        //         "side": "go_long",
        //         "entry_price": 31428.72,
        //         "liquidation_rate": 0.3,
        //         "liquidation_price": 10225.335481159,
        //         "unrealized_roe": -0.0076885829266987,
        //         "symbol": "BTC_USDT",
        //         "unrealized_pnl": -0.049158102631999,
        //         "leverage_ratio": 3
        //     }
        //
        const symbol = this.safeString (info, 'symbol');
        const amountString = this.safeString (info, 'amount');
        const leverageString = this.safeString (info, 'leverage_ratio');
        const amountInvested = Precise.stringDiv (amountString, leverageString);
        const amountBorrowed = Precise.stringSub (amountString, amountInvested);
        const currency = (market === undefined) ? undefined : market['base'];
        return {
            'account': this.safeSymbol (symbol, market),
            'currency': currency,
            'interest': undefined,
            'interestRate': 0.001, // all interest rates on digifinex are 0.1%
            'amountBorrowed': this.parseNumber (amountBorrowed),
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    async fetchBorrowRate (code, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetMarginAssets (this.extend (request, params));
        //
        //     {
        //         "list": [
        //             {
        //                 "valuation_rate": 1,
        //                 "total": 1.92012186174,
        //                 "free": 1.92012186174,
        //                 "currency": "USDT"
        //             },
        //         ],
        //         "total": 45.133305540922,
        //         "code": 0,
        //         "unrealized_pnl": 0,
        //         "free": 45.133305540922,
        //         "equity": 45.133305540922
        //     }
        //
        const data = this.safeValue (response, 'list', []);
        let result = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            if (this.safeString (entry, 'currency') === code) {
                result = entry;
            }
        }
        const currency = this.safeString (result, 'currency');
        return this.parseBorrowRate (result, currency);
    }

    async fetchBorrowRates (params = {}) {
        /**
         * @method
         * @name digifinex#fetchBorrowRates
         * @description fetch the borrow interest rates of all currencies
         * @param {object} params extra parameters specific to the digifinex api endpoint
         * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/en/latest/manual.html#borrow-rate-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetMarginAssets (params);
        //
        //     {
        //         "list": [
        //             {
        //                 "valuation_rate": 1,
        //                 "total": 1.92012186174,
        //                 "free": 1.92012186174,
        //                 "currency": "USDT"
        //             },
        //         ],
        //         "total": 45.133305540922,
        //         "code": 0,
        //         "unrealized_pnl": 0,
        //         "free": 45.133305540922,
        //         "equity": 45.133305540922
        //     }
        //
        const result = this.safeValue (response, 'list');
        return this.parseBorrowRates (result, 'currency');
    }

    parseBorrowRate (info, currency = undefined) {
        //
        //     {
        //         "valuation_rate": 1,
        //         "total": 1.92012186174,
        //         "free": 1.92012186174,
        //         "currency": "USDT"
        //     }
        //
        const timestamp = this.milliseconds ();
        const currencyId = this.safeString (info, 'currency');
        return {
            'currency': this.safeCurrencyCode (currencyId, currency),
            'rate': 0.001, // all interest rates on digifinex are 0.1%
            'period': 86400000,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    parseBorrowRates (info, codeKey) {
        //
        //     {
        //         "valuation_rate": 1,
        //         "total": 1.92012186174,
        //         "free": 1.92012186174,
        //         "currency": "USDT"
        //     },
        //
        const result = {};
        for (let i = 0; i < info.length; i++) {
            const item = info[i];
            const currency = this.safeString (item, codeKey);
            const code = this.safeCurrencyCode (currency);
            const borrowRate = this.parseBorrowRate (item, currency);
            result[code] = borrowRate;
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.version;
        let url = this.urls['api']['rest'] + '/' + version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const urlencoded = this.urlencode (this.keysort (query));
        if (api === 'private') {
            const nonce = this.nonce ().toString ();
            const auth = urlencoded;
            // the signature is not time-limited :\
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            if (method === 'GET') {
                if (urlencoded) {
                    url += '?' + urlencoded;
                }
            } else if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                if (urlencoded) {
                    body = urlencoded;
                }
            }
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': nonce,
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
        const code = this.safeString (response, 'code');
        if ((code === '0') || (code === '200')) {
            return; // no error
        }
        const feedback = this.id + ' ' + responseBody;
        if (code === undefined) {
            throw new BadResponse (feedback);
        }
        const unknownError = [ ExchangeError, feedback ];
        const [ ExceptionClass, message ] = this.safeValue (this.exceptions['exact'], code, unknownError);
        throw new ExceptionClass (message);
    }
};
