'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class osl extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'osl',
            'name': 'OSL',
            'countries': [ 'SG', 'AM', 'HK' ], // Singapore, Americas, Hong Kong
            'rateLimit': 5, // OSL v4 allows 200 requests per second
            'certified': false,
            'version': '', // mix of '3' and 'v4' will be used; public endpoints are on '3'
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': undefined,                   // has, but not yet implemented
                'cancelOrder': undefined,                       // has, but not yet implemented
                'createOrder': undefined,                       // has, but not yet implemented
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,                     // not sure what this is
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': undefined,                 // has, but not yet implemented, see /order with open=false, filter out open
                'fetchCurrencies': false,
                'fetchDepositAddress': undefined,               // has, but not yet implemented, see v3 api /receive
                'fetchDeposits': undefined,                     // api v3 might have this
                'fetchMarginMode': false,
                'fetchMarkets': true,                           // api v4/instruments, requires auth
                'fetchMyTrades': undefined,                     // has, but not yet implemented, see /executions
                'fetchOHLCV': false,
                'fetchOpenOrders': undefined,                   // has, but not yet implemented, see /order
                'fetchOrder': undefined,                        // has, but not yet implemented
                'fetchOrderBook': true,                         // v4/orderBook/L2, requires symbol, supports depth with default 25
                'fetchOrders': false,                           // has, but not yet implemented, see /order with open=false
                'fetchPositionMode': false,
                'fetchStatus': undefined,                       // not implemented
                'fetchTicker': undefined,                       // not implemented, available via fetchMarkets endpoint response
                'fetchTickers': undefined,                      // see above
                'fetchTime': undefined,                         // not implemented
                'fetchTrades': undefined,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTransactionFees': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawals': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'timeframes': {
                // did not check these for OSL
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '1d': '1D',
                '1w': '1W',
            },
            'urls': {
                'api': {
                    // other api endpoints are trade-am and trade-hk, not implemented
                    '2': 'https://trade-sg.osl.com/api/2',   // used for ticker data
                    '3': 'https://trade-sg.osl.com/api/3',   // used for currency list and markets
                    'v4': 'https://trade-sg.osl.com/api/v4', // used for balances
                },
                'www': 'https://osl.com',
                'referral': '',
                'doc': [
                    'https://docs.osl.com/',
                ],
                'fees': 'https://support.osl.com/s/article/Are-there-trading-fees-on-the-Exchange',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'v2': {
                    // Ticker get would go here
                },
                'v3': {
                    'public': {
                        'get': {
                            'currencyStatic': 1,
                        },
                    },
                },
                'v4': {
                    'private': {
                        'get': {
                            'instrument': 1,
                            'user/wallet': 1,
                            'orderBook/L2': 1,
                        },
                    },
                },
            },
            'options': {
            },
            'precisionMode': DECIMAL_PLACES,
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['quote'], this.precisionMode, this.paddingMode);
    }

    currencyToPrecision (code, fee, networkCode = undefined) {
        // info is available in currencies only if the user has configured his api keys
        if (this.safeValue (this.currencies[code], 'precision') !== undefined) {
            return this.decimalToPrecision (fee, TRUNCATE, this.currencies[code]['precision'], this.precisionMode, this.paddingMode);
        } else {
            return this.numberToString (fee);
        }
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name osl#fetchMarkets
         * @description retrieves data on all markets for osl
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const markets = await this.v4PrivateGetInstrument (params);
        // [
        //     ...
        //     {
        //         symbol: 'SNXUSD',
        //         currency: 'SNX',
        //         settlCurrency: 'USD',
        //         highPrice: '2.99430',
        //         lowPrice: '2.99430',
        //         bidPrice: '3.00730',
        //         askPrice: '3.02590',
        //         lastPrice: '2.99430',
        //         minPrice: '2.14900',
        //         maxPrice: '3.99100',
        //         minOrderQty: '1.00000000',
        //         maxOrderQty: '125282.00000000',
        //         minValue: '10.00000',
        //         maxValue: '500000.00000',
        //         prevClosePrice: null,
        //         volume: null,
        //         tickSize: '0.00010',
        //         stepSize: '1.00000000',
        //         priceDecimals: '5',
        //         quantityDecimals: '8',
        //         updateTime: null
        //     },
        //     ...
        // ]
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const lowercaseId = this.safeStringLower (market, 'symbol');
            const baseId = this.safeString (market, 'currency');
            const quoteId = this.safeString (market, 'settlCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const pricePrecision = this.safeString (market, 'priceDecimals');
            const amountPrecision = this.safeString (market, 'quantityDecimals');
            const entry = {
                'id': id,
                'lowercaseId': lowercaseId,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (amountPrecision)),
                    'price': this.parseNumber (this.parsePrecision (pricePrecision)),
                    'base': 5, // this.parseNumber (this.parsePrecision (this.safeString (market, ''))),
                    'quote': 5, // this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': 0,
                        'max': 10,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    parseBalance (response) {
        const timestamp = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const balances = this.isArray (response) ? response : [];
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'exchangeAvailableBalance');
            account['total'] = this.safeString (balance, 'exchangeTotalBalance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name osl#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the osl api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.v4PrivateGetUserWallet (params);
        // [
        //     {
        //       exchangeAvailableBalance: '500.00000',
        //       exchangeTotalBalance: '500.00000',
        //       currency: 'USD'
        //     },
        //     ...
        // ]
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name osl#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the osl api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit; // default 25, see https://docs.osl.com/#get-l2-order-book
        }
        const response = await this.v4PrivateGetOrderBookL2 (this.extend (request, params));
        // {
        //     symbol: 'BTCUSDT',
        //     asks: [
        //         [ '20202', '3' ],
        //         [ '20208', '5' ],
        //     ],
        //     bids: [
        //         [ '20185', '1' ],
        //         [ '20184', '2' ],
        //     ],
        //     updateTime: '2022-08-29T15:45:18.015Z'
        // }
        const orderbook = this.parseOrderBook (response, symbol);
        return orderbook;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // ['v4', 'private']
        let [ version ] = api;
        const type = api[1];
        // v2 and v3 apis don't use 'v' prefix
        if (version === 'v2') {
            version = '2';
        } else if (version === 'v3') {
            version = '3';
        }
        // let path = '/api/v4/';
        let url = this.urls['api'][version] + '/' + this.implodeParams (path, params);
        // implodeParams and extractParams currently no-op for implemented paths
        // const pathForHmac = version + '/' + this.implodeParams (path, params);
        // params = this.omit (params, this.extractParams (path));
        const tonce = this.seconds () + 10;
        // type is always 'private' for (currently implemented) v4 endpoints
        if (type === 'private') {
            this.checkRequiredCredentials ();
            const query = this.urlencode (params);
            headers = {
                'api-key': this['apiKey'],
                'api-expires': tonce,
            };
            if ((method === 'GET') || (method === 'DELETE')) {
                if (query) {
                    url += '?' + query;
                    path += '?' + query;
                }
                const data = method + this.encode ('/api' + '/' + version + '/' + path) + this.encode (tonce);
                const signature = this.hmac (this.encode (data), this.base64ToBinary (this.secret), 'sha512', 'base64');
                headers['api-signature'] = signature;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                const data = method + this.encode (path) + this.encode (tonce) + this.encode (JSON.stringify (body));
                const signature = this.hmac (this.encode (data), this.base64ToBinary (this['secret']), 'sha512', 'base64');
                headers['api-signature'] = signature;
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
