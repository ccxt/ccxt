'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection, AuthenticationError, InvalidOrder } = require ('./base/errors');
// const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class lbank2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lbank2',
            'name': 'LBank',
            'countries': [ 'CN' ],
            'version': 'v2',
            // 50 per second for making and cancelling orders 1000ms / 50 = 20
            // 20 per second for all other requests, cost = 50 / 20 = 2.5
            'rateLimit': 20,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': false,
                'createOrder': false,
                'createReduceOnlyOrder': false,
                'fetchBalance': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedPositions': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false, // status 0 API doesn't work
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTrades': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': 'minute1',
                '5m': 'minute5',
                '15m': 'minute15',
                '30m': 'minute30',
                '1h': 'hour1',
                '2h': 'hour2',
                '4h': 'hour4',
                '6h': 'hour6',
                '8h': 'hour8',
                '12h': 'hour12',
                '1d': 'day1',
                '1w': 'week1',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg',
                'api': 'https://api.lbank.info',
                'www': 'https://www.lbank.info',
                'doc': 'https://github.com/LBank-exchange/lbank-official-api-docs',
                'fees': 'https://lbankinfo.zendesk.com/hc/en-gb/articles/360012072873-Trading-Fees',
                'referral': 'https://www.lbex.io/invite?icode=7QCY',
            },
            'api': {
                'public': {
                    'get': {
                        'currencyPairs': 2.5, // returns available trading pairs (market ids)
                        'accuracy': 2.5, // basic information of trading pairs (price, quantity accuraccy etc)
                        'usdToCny': 2.5,
                        'withdrawConfigs': 2.5, // withdrawal details for some symbol
                        'timestamp': 2.5,
                        'ticker/24h': 2.5, // recommended
                        'ticker': 2.5,
                        'depth': 2.5,
                        'incrDepth': 2.5, // fetchOrderBook
                        'trades': 2.5, // fetchTrades
                        'kline': 2.5, // fetchOHLCV
                    },
                },
                'private': {
                    'post': {
                        // account
                        'user_info': 2.5, // fetchBalance
                        'subscribe/get_key': 2.5,
                        'subscribe/refresh_key': 2.5,
                        'subscribe/destroy_key': 2.5,
                        'get_deposit_address': 2.5, // fetchDepositAddress
                        'deposit_history': 2.5, // fetchDeposits
                        // order
                        'create_order': 1, // createOrder
                        'batch_create_order': 1,
                        'cancel_order': 1, // cancelOrder
                        'cancel_clientOrders': 1, // cancelOrder (By clOId)
                        'orders_info': 2.5, // fetchOrder ***
                        'orders_info_history': 2.5, // fetchOrders (only the last two days available) ***
                        'order_transaction_detail': 2.5, // fetchOrder but somewhat slightly different data ***
                        'transaction_history': 2.5, // fetchMyTrades ***
                        'orders_info_no_deal': 2.5,
                        // withdraw
                        'withdraw': 2.5, // withdraw
                        'withdrawCancel': 2.5,
                        'withdraws': 2.5, // fetchWithdrawals
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'VET_ERC20': 'VEN',
                'PNT': 'Penta',
            },
            'options': {
                'cacheSecretAsPem': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
        // needs to return a list of unified market structures
        const response = await this.publicGetAccuracy ();
        const data = this.safeValue (response, 'data');
        //      [
        //          {
        //              symbol: 'snx3s_usdt',
        //              quantityAccuracy: '2',
        //              minTranQua: '0.01',
        //              priceAccuracy: '6'
        //          }
        //     ]
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString (market, 'symbol');
            const parts = marketId.split ('_');
            const baseId = parts[0];
            const quoteId = parts[1];
            const base = baseId.toUpperCase ();
            const quote = quoteId.toUpperCase ();
            let symbol = base + '/' + quote;
            const productTypes = {
                '3l': true,
                '5l': true,
                '3s': true,
                '5s': true,
            };
            const ending = baseId.slice (-2);
            const isLeveragedProduct = this.safeValue (productTypes, ending, false);
            if (isLeveragedProduct) {
                symbol += ':' + quote;
            }
            result.push ({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': isLeveragedProduct,
                'future': false,
                'option': false,
                'active': true,
                'contract': isLeveragedProduct,
                'linear': isLeveragedProduct ? true : undefined, // all leveraged ETF products are in USDT
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'quantityAccuracy'),
                    'price': this.safeInteger (market, 'priceAccuracy'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeInteger (market, 'minTranQua'),
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

    async fetchOrderBook () {
        return false;
    }

    parseTicker (ticker, market = undefined) {
        //
        //      {
        //          "symbol":"btc_usdt",
        //          "ticker": {
        //              "high":40200.88,
        //              "vol":7508.3096,
        //              "low":38239.38,
        //              "change":0.75,
        //              "turnover":292962771.34,
        //              "latest":39577.95
        //               },
        //           "timestamp":1647005189792
        //      }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeString (ticker, 'timestamp');
        const tickerData = this.safeValue (ticker, 'ticker');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (tickerData, 'high'),
            'low': this.safeString (tickerData, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString (tickerData, 'latest'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (tickerData, 'change'),
            'average': undefined,
            'baseVolume': this.safeString (tickerData, 'vol'),
            'quoteVolume': this.safeString (tickerData, 'turnover'),
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        // preferred ticker/24h endpoint is down
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //      {
        //          "result":"true",
        //          "data": [
        //              {
        //                  "symbol":"btc_usdt",
        //                  "ticker":{
        //                          "high":40200.88,
        //                          "vol":7508.3096,
        //                          "low":38239.38,
        //                          "change":0.75,
        //                          "turnover":292962771.34,
        //                          "latest":39577.95
        //                      },
        //                  "timestamp":1647005189792
        //               }
        //                   ],
        //          "error_code":0,"ts":1647005190755
        //      }
        //
        const result = this.safeValue (response, 'data')[0];
        return this.parseTicker (result, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        // Every endpoint ends with ".do"
        url += '.do';
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const query = this.keysort (this.extend ({
                'api_key': this.apiKey,
            }, params));
            const queryString = this.rawencode (query);
            const message = this.hash (this.encode (queryString)).toUpperCase ();
            const cacheSecretAsPem = this.safeValue (this.options, 'cacheSecretAsPem', true);
            let pem = undefined;
            if (cacheSecretAsPem) {
                pem = this.safeValue (this.options, 'pem');
                if (pem === undefined) {
                    pem = this.convertSecretToPem (this.secret);
                    this.options['pem'] = pem;
                }
            } else {
                pem = this.convertSecretToPem (this.secret);
            }
            const sign = this.binaryToBase64 (this.rsa (message, this.encode (pem), 'RS256'));
            query['sign'] = sign;
            body = this.urlencode (query);
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const success = this.safeString (response, 'result');
        if (success === 'false') {
            const errorCode = this.safeString (response, 'error_code');
            const message = this.safeString ({
                '10000': 'Internal error',
                '10001': 'The required parameters can not be empty',
                '10002': 'verification failed',
                '10003': 'Illegal parameters',
                '10004': 'User requests are too frequent',
                '10005': 'Key does not exist',
                '10006': 'user does not exist',
                '10007': 'Invalid signature',
                '10008': 'This currency pair is not supported',
                '10009': 'Limit orders can not be missing orders and the number of orders',
                '10010': 'Order price or order quantity must be greater than 0',
                '10011': 'Market orders can not be missing the amount of the order',
                '10012': 'market sell orders can not be missing orders',
                '10013': 'is less than the minimum trading position 0.001',
                '10014': 'Account number is not enough',
                '10015': 'The order type is wrong',
                '10016': 'Account balance is not enough',
                '10017': 'Abnormal server',
                '10018': 'order inquiry can not be more than 50 less than one',
                '10019': 'withdrawal orders can not be more than 3 less than one',
                '10020': 'less than the minimum amount of the transaction limit of 0.001',
                '10022': 'Insufficient key authority',
            }, errorCode, this.json (response));
            const ErrorClass = this.safeValue ({
                '10002': AuthenticationError,
                '10004': DDoSProtection,
                '10005': AuthenticationError,
                '10006': AuthenticationError,
                '10007': AuthenticationError,
                '10009': InvalidOrder,
                '10010': InvalidOrder,
                '10011': InvalidOrder,
                '10012': InvalidOrder,
                '10013': InvalidOrder,
                '10014': InvalidOrder,
                '10015': InvalidOrder,
                '10016': InvalidOrder,
                '10022': AuthenticationError,
            }, errorCode, ExchangeError);
            throw new ErrorClass (message);
        }
    }
};
