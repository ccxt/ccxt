'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, AuthenticationError, InvalidOrder, InsufficientFunds, RequestTimeout } = require ('./base/errors');
const { ROUND, DECIMAL_PLACES, NO_PADDING } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class dx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dx',
            'name': 'DX.Exchange',
            'countries': [ 'GB', 'EU' ],
            'rateLimit': 1500,
            'version': 'v1',
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'deposit': false,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'api': 'https://acl.dx.exchange',
                'www': 'https://dx.exchange',
                'doc': 'https://apidocs.dx.exchange/',
                'fees': 'https://dx.exchange/fees',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.25 / 100],
                            [1000000, 0.2 / 100],
                            [5000000, 0.15 / 100],
                            [10000000, 0.1 / 100],
                        ],
                        'maker': [
                            [0, 0.25 / 100],
                            [1000000, 0.2 / 100],
                            [5000000, 0.15 / 100],
                            [10000000, 0.1 / 100],
                        ],
                    },
                },
                'funding': {
                },
            },
            'exceptions': {
                'exact': {
                    'EOF': BadRequest,
                },
                'broad': {
                    'json: cannot unmarshal object into Go value of type': BadRequest,
                    'not allowed to cancel this order': BadRequest,
                    'request timed out': RequestTimeout,
                    'balance_freezing.freezing validation.balance_freeze': InsufficientFunds,
                    'order_creation.validation.validation': InvalidOrder,
                },
            },
            'api': {
                'public': {
                    'get': [
                    ],
                    'post': [
                        'AssetManagement.GetInstruments',
                        'AssetManagement.GetTicker',
                        'AssetManagement.History',
                        'Authorization.LoginByToken',
                    ],
                },
                'private': {
                    'post': [
                        'Balance.Get',
                        'OrderManagement.Cancel',
                        'OrderManagement.Create',
                        'OrderManagement.OpenOrders',
                        'OrderManagement.OrderHistory',
                    ],
                },
            },
            'commonCurrencies': {
                'BCH': 'Bitcoin Cash',
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
                'orderTypes': {
                    'market': 1,
                    'limit': 2,
                },
                'orderSide': {
                    'buy': 1,
                    'sell': 2,
                },
            },
        });
    }

    numberToObject (number) {
        let string = this.decimalToPrecision (number, ROUND, 10, DECIMAL_PLACES, NO_PADDING);
        let decimals = this.precisionFromString (string);
        let valueStr = string.replace ('.', '');
        return {
            'value': this.safeInteger ({ 'a': valueStr }, 'a', undefined),
            'decimals': decimals,
        };
    }

    objectToNumber (obj) {
        let value = this.decimalToPrecision (obj['value'], ROUND, 0, DECIMAL_PLACES, NO_PADDING);
        let decimals = this.decimalToPrecision (-obj['decimals'], ROUND, 0, DECIMAL_PLACES, NO_PADDING);
        return this.safeFloat ({
            'a': value + 'e' + decimals,
        }, 'a', undefined);
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicPostAssetManagementGetInstruments (params);
        let instruments = markets['result']['instruments'];
        let result = [];
        for (let i = 0; i < instruments.length; i++) {
            let instrument = instruments[i];
            let id = instrument['id'];
            let symbol = instrument['asset']['fullName'];
            let [ base, quote ] = symbol.split ('/');
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': instrument['asset']['baseCurrencyId'],
                'quoteId': instrument['asset']['quotedCurrencyId'],
                'info': instrument,
                'precision': {
                    'amount': undefined,
                    'price': instrument['asset']['tailDigits'],
                },
                'limits': {
                    'amount': {
                        'min': instrument['minOrderQuantity'],
                        'max': instrument['maxOrderQuantity'],
                    },
                    'price': {
                        'min': 0,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let tickerKeys = Object.keys (ticker);
        // Python needs an integer to access this.markets_by_id
        // and a string to access the ticker object
        let tickerKey = tickerKeys[0];
        let instrumentId = this.safeInteger ({ 'a': tickerKey }, 'a');
        ticker = ticker[tickerKey];
        let symbol = this.markets_by_id[instrumentId]['symbol'];
        let last = this.safeFloat (ticker, 'last');
        let timestamp = this.safeInteger (ticker, 'time') / 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24'),
            'low': this.safeFloat (ticker, 'low24'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume24'),
            'quoteVolume': this.safeFloat (ticker, 'volume24converted'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'instrumentIds': [market['id']],
            'currencyId': market['quoteId'],
        };
        let response = await this.publicPostAssetManagementGetTicker (this.extend (request, params));
        return this.parseTicker (response['result']['tickers'], market);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeFloat (ohlcv, 'date') * 1000,
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'timestampFrom': since,
            'timestampTill': undefined,
            'instrumentId': market['id'],
            'type': this.timeframes[timeframe],
            'pagination': {
                'limit': limit,
                'offset': 0,
            },
        };
        let response = await this.publicPostAssetManagementHistory (this.extend (request, params));
        return this.parseOHLCVs (response['result']['assets'], market, timeframe, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'pagination': {
                'limit': limit,
                'offset': 0,
            },
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = market['id'];
        }
        let response = await this.privatePostOrderManagementOpenOrders (this.extend (request, params));
        return this.parseOrders (response['result']['orders'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'pagination': {
                'limit': limit,
                'offset': 0,
            },
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = market['id'];
        }
        let response = await this.privatePostOrderManagementOrderHistory (this.extend (request, params));
        return this.parseOrders (response['result']['ordersForHistory'], market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let openOrders = await this.fetchOpenOrders (symbol, since, limit, params);
        let orders = await this.fetchClosedOrders (symbol, since, limit, params);
        return this.arrayConcat (orders, openOrders);
    }

    parseOrder (order, market = undefined) {
        let orderStatusMap = {
            '1': 'open',
        };
        let innerOrder = this.safeValue2 (order, 'order', undefined);
        if (innerOrder !== undefined) {
            // fetchClosedOrders returns orders in an extra object
            order = innerOrder;
            orderStatusMap = {
                '1': 'closed',
                '2': 'canceled',
            };
        }
        let side = 'buy';
        if (order['direction'] === this.options['orderSide']['sell']) {
            side = 'sell';
        }
        let status = undefined;
        let orderStatus = this.safeString (order, 'status', undefined);
        if (orderStatus in orderStatusMap) {
            status = orderStatusMap[orderStatus];
        }
        let symbol = this.markets_by_id[order['instrumentId']]['symbol'];
        let orderType = 'limit';
        if (order['orderType'] === this.options['orderTypes']['market']) {
            orderType = 'market';
        }
        let timestamp = order['time'] * 1000;
        let quantity = this.objectToNumber (order['quantity']);
        let filledQuantity = this.objectToNumber (order['filledQuantity']);
        let result = {
            'info': order,
            'id': order['externalOrderId'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': this.objectToNumber (order['price']),
            'average': undefined,
            'amount': quantity,
            'remaining': quantity - filledQuantity,
            'filled': filledQuantity,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async signIn (params = {}) {
        this.checkRequiredCredentials ();
        let result = await this.publicPostAuthorizationLoginByToken (this.extend ({
            'token': this.apiKey,
            'secret': this.secret,
        }, params));
        const expiresIn = result['result']['expiry'];
        this.options['expires'] = this.sum (this.milliseconds (), expiresIn * 1000);
        this.options['accessToken'] = result['result']['token'];
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalanceGet (params);
        let result = { 'info': response };
        let balances = response['result']['balance'];
        let balancesKeys = Object.keys (balances);
        for (let i = 0; i < balancesKeys.length; i++) {
            let instrumentId = balancesKeys[i];
            let balance = balances[instrumentId];
            let symbol = instrumentId;
            if (instrumentId in this.currencies_by_id) {
                symbol = this.currencies_by_id[instrumentId]['code'];
            }
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['frozen']),
                'total': parseFloat (balance['total']),
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[symbol] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let direction = this.options['orderSide'][side];
        let order = {
            'order': {
                'direction': direction,
                'instrumentId': this.marketId (symbol),
                'orderType': 2,
                'quantity': this.numberToObject (amount),
            },
        };
        order['order']['orderType'] = this.options['orderTypes'][type];
        if (type === 'limit') {
            order['order']['price'] = this.numberToObject (price);
        }
        let result = await this.privatePostOrderManagementCreate (this.extend (order, params));
        return {
            'info': result,
            'id': result['result']['externalOrderId'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrderManagementCancel ({ 'externalOrderId': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (Array.isArray (params)) {
            let arrayLength = params.length;
            if (arrayLength === 0) {
                // In PHP params = array () causes this to fail, because
                // the API requests an object, not an array, even if it is empty
                params = { '__associative': true };
            }
        }
        let parameters = {
            'jsonrpc': '2.0',
            'id': this.milliseconds (),
            'method': path,
            'params': [params],
        };
        let url = this.urls['api'];
        headers = { 'Content-Type': 'application/json-rpc' };
        if (method === 'GET') {
            if (Object.keys (parameters).length)
                url += '?' + this.urlencode (parameters);
        } else {
            body = this.json (parameters);
        }
        if (api === 'private') {
            const token = this.safeString (this.options, 'accessToken');
            if (token === undefined) {
                throw new AuthenticationError (this.id + ' ' + path + ' endpoint requires a prior call to signIn() method');
            }
            const expires = this.safeInteger (this.options, 'expires');
            if (expires !== undefined) {
                if (this.milliseconds () >= expires) {
                    throw new AuthenticationError (this.id + ' accessToken expired, call signIn() method');
                }
            }
            headers['Authorization'] = token;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (!response) {
            return; // fallback to default error handler
        }
        const error = response['error'];
        if (error) {
            const feedback = this.id + ' ' + this.json (response);
            const exact = this.exceptions['exact'];
            if (error in exact) {
                throw new exact[error] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, error);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown error
        }
    }
};
