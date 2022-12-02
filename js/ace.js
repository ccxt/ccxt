'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const FormData = require('form-data');

//  ---------------------------------------------------------------------------

module.exports = class ace extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ace',
            'name': 'ACE',
            'countries': [ 'TW' ], // Taiwan
            'version': 'v2',
            'rateLimit': 100,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'createOrder': false,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '10m': '10m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://ace.io/polarisex/oapi',
                    'private': 'https://ace.io/polarisex/open',
                },
                'www': 'https://ace.io/',
                'doc': [
                    'https://github.com/ace-exchange/ace-offical-api-docs',
                ],
                'fees': 'https://helpcenter.ace.io/hc/zh-tw/articles/360018609132-%E8%B2%BB%E7%8E%87%E8%AA%AA%E6%98%8E',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'phone': true,
            },
            'api': {
                'public': {
                    'get': [
                        'list/tradePrice',
                        'list/marketPair',
                        'list/orderBooks/{base}/{quote}',
                    ],
                },
                'private': {
                    'post': [
                        'v1/coin/customerAccount',
                        'v1/kline/getKlineMin',
                        'v1/order/order',
                        'v1/order/cancel',
                        'v1/order/getOrderList',
                        'v1/order/showOrderStatus',
                        'v1/order/showOrderHistory',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'maker': this.parseNumber ('0.0005'),
                    'taker': this.parseNumber ('0.001'),
                },
            },
            'options': {
                'networks': {
                    'ERC20': 'ERC20',
                    'ETH': 'ERC20',
                    'TRX': 'TRX',
                    'TRC20': 'TRX',
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name ace#fetchMarkets
         * @description retrieves data on all markets for ace
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        let response = await this.publicGetListMarketPair ();
        // temporary workaround to finx json string
        if (response.indexOf ('\'') >= 0) {
            // this line didn't work in php
            response = response.replace (/'/g, '"');
            response = this.parseJson (response);
        }
        //
        //     ['ADA/TWD']
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const id = response[i];
            const splitMarket = id.split ('/');
            const baseId = this.safeString (splitMarket, 0);
            const quoteId = this.safeString (splitMarket, 1);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const limits = {
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
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'uppercaseId': undefined,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'derivative': false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'limits': limits,
                'precision': {
                    'price': undefined,
                    'amount': undefined,
                },
                'active': undefined,
                'info': id,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "base_volume":229196.34035399999,
        //         "last_price":11881.06,
        //         "quote_volume":19.2909
        //     }
        //
        const marketId = this.safeString (ticker, 'id');
        market = this.safeMarket (marketId);
        const symbol = this.safeString (market, 'symbol');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last_price'),
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name ace#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetListTradePrice (params);
        const marketId = market['id'];
        const ticker = this.safeValue (response, marketId, {});
        //
        //     {
        //         "BTC/USDT":{
        //             "base_volume":229196.34035399999,
        //             "last_price":11881.06,
        //             "quote_volume":19.2909
        //         }
        //     }
        //
        ticker['id'] = marketId;
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetListTradePrice ();
        //
        //     {
        //         "BTC/USDT":{
        //             "base_volume":229196.34035399999,
        //             "last_price":11881.06,
        //             "quote_volume":19.2909
        //         }
        //     }
        //
        const tickers = [];
        const pairs = Object.keys (response);
        for (let i = 0; i < pairs.length; i++) {
            const marketId = pairs[i];
            const ticker = this.safeValue (response, marketId);
            ticker['id'] = marketId;
            tickers.push (ticker);
        }
        return this.parseTickers (tickers, symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name ace#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'base': market['base'],
            'quote': market['quote'],
        };
        const response = await this.publicGetListOrderBooksBaseQuote (this.extend (request, params));
        //
        //     {
        //         "market_pair":"BTC/TWD",
        //         "orderbook": {
        //             "asks": [
        //                 [
        //                     "0.449612",
        //                     "1800000"
        //                 ],
        //                 [
        //                     "0.001",
        //                     "1980000"
        //                 ]
        //             ],
        //             "bids": [
        //                 [
        //                     "0.017087",
        //                     "1165121.4"
        //                 ],
        //                 [
        //                     "0.01",
        //                     "1165121.2"
        //                 ]
        //             ]
        //         }
        //     }
        //
        const orderBook = this.safeValue (response, 'orderbook');
        return this.parseOrderBook (orderBook, market['symbol'], undefined, 'bids', 'asks');
    }

    parseBalance (response) {
        //
        //     [
        //         {
        //             "currencyId": 4,
        //             "amount": 6.896,
        //             "cashAmount": 6.3855,
        //             "uid": 123,
        //             "currencyNameEn": "BTC"
        //         }
        //     ]
        //
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currencyNameEn');
            const code = this.safeCurrencyCode (currencyId);
            const amount = this.safeString (balance, 'amount');
            const available = this.safeString (balance, 'cashAmount');
            const account = {
                'free': available,
                'total': amount,
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name ace#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the ace api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostV1CoinCustomerAccount (params);
        const balances = this.safeValue (response, 'attachment', []);
        //
        //     {
        //         "attachment":[
        //             {
        //                 "currencyId": 4,
        //                 "amount": 6.896,
        //                 "cashAmount": 6.3855,
        //                 "uid": 123,
        //                 "currencyNameEn": "BTC"
        //             }
        //         ],
        //         message: null,
        //         parameters: null,
        //         status: '200'
        //     }
        //
        return this.parseBalance (balances);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (headers === undefined) {
            headers = {};
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.milliseconds ();
            body = new FormData();
            const auth = 'ACE_SIGN' + nonce.toString () + this.phone;
            const signature = this.hash (auth, 'md5', 'hex');
            const splitKey = this.apiKey.split ('#');
            const uid = (this.uid) ? this.uid : splitKey[0];
            body.append("uid", uid);
            body.append("timeStamp", nonce);
            body.append("signKey", signature);
            body.append("apiKey", this.apiKey);
            body.append("securityKey", this.secret);
        } else if (api === 'public' && method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to the default error handler
        }
        if (code >= 200 && code < 300) {
            return;
        }
        const feedback = this.id + ' ' + body;
        const error = this.safeString (response, 'error');
        this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        throw new ExchangeError (feedback); // unknown message
    }
};
