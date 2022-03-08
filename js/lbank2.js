'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DDoSProtection, AuthenticationError, InvalidOrder, ArgumentsRequired } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class lbank extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lbank',
            'name': 'LBank',
            'countries': [ 'CN' ],
            'version': 'v2',
            'has': {
                'CORS': false,
                'spot': false,
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
                'fetchMarkets': false,
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
                    'get': [
                        'currencyPairs',
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                        'accuracy',
                    ],
                },
                'private': {
                    'post': [
                        'user_info',
                        'create_order',
                        'cancel_order',
                        'orders_info',
                        'orders_info_history',
                        'withdraw',
                        'withdrawCancel',
                        'withdraws',
                        'withdrawConfigs',
                    ],
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
