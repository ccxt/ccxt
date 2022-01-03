'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, RateLimitExceeded, BadRequest, ExchangeError, InvalidOrder } = require ('./base/errors'); // Permission-Denied, Arguments-Required, OrderNot-Found

// ---------------------------------------------------------------------------

module.exports = class woo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'woo',
            'name': 'Woo',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 1000, // No defaults known
            'version': 'v1',
            'certified': false,
            'hostname': 'woo.org',
            'has': {
                'createOrder': undefined,
                'cancelOrder': undefined,
                'cancelAllOrders': undefined,
                'createMarketOrder': undefined,
                'fetchBalance': undefined,
                'fetchDepositAddress': undefined,
                'fetchDeposits': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchMarkets': true,
                'fetchMyTrades': undefined,
                'fetchOrderTrades': undefined,
                'fetchOHLCV': undefined,
                'fetchOrder': undefined,
                'fetchOrders': undefined,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': true,
                'fetchOrderBook': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchStatus': undefined,
                'fetchTicker': undefined,
                'fetchTickers': undefined,
                'fetchTime': undefined,
                'fetchTrades': true,
                'fetchWithdrawals': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'addMargin': undefined,
                'reduceMargin': undefined,
                'setLeverage': undefined,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mon',
                '1y': '1y',
            },
            'urls': {
                'logo': '  <<<TODO>>>    ',
                'api': {
                    'public': 'https://api.woo.org',
                    'private': 'https://api.woo.org',
                },
                'www': 'https://woo.org/',
                'doc': [
                    'https://docs.woo.org/',
                ],
                'fees': [
                    'https://support.woo.org/hc/en-001/articles/4404611795353--Trading-Fees',
                ],
                'referral': '  <<<TODO>>>   ',
            },
            'api': {
                'public': {
                    'get': {
                        'info': 1,
                        'info/:symbol': 1,
                        'market_trades': 1,
                        'token': 1,
                        'token_network': 1,
                    },
                },
                'private': {
                    'post': {
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.5 / 100,
                },
            },
            'options': {
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    '-1000': ExchangeError, // { "code": -1000,  "message": "An unknown error occurred while processing the request" }
                    '-1001': AuthenticationError, // { "code": -1001,  "message": "The api key or secret is in wrong format" }
                    '-1002': AuthenticationError, // { "code": -1002,  "message": "API key or secret is invalid, it may because key have insufficient permission or the key is expired/revoked." }
                    '-1003': RateLimitExceeded, // { "code": -1003,  "message": "Rate limit exceed." }
                    '-1004': BadRequest, // { "code": -1004,  "message": "An unknown parameter was sent." }
                    '-1005': BadRequest, // { "code": -1005,  "message": "Some parameters are in wrong format for api." }
                    '-1006': BadRequest, // { "code": -1006,  "message": "The data is not found in server." }
                    '-1007': BadRequest, // { "code": -1007,  "message": "The data is already exists or your request is duplicated." }
                    '-1008': InvalidOrder, // { "code": -1008,  "message": "The quantity of settlement is too high than you can request." }
                    '-1009': BadRequest, // { "code": -1009,  "message": "Can not request withdrawal settlement, you need to deposit other arrears first." }
                    '-1011': ExchangeError, // { "code": -1011,  "message": "Can not place/cancel orders, it may because internal network error. Please try again in a few seconds." }
                    '-1012': ExchangeError, // { "code": -1012,  "message": "The place/cancel order request is rejected by internal module, it may because the account is in liquidation or other internal errors. Please try again in a few seconds." }
                    '-1101': InvalidOrder, // { "code": -1101,  "message": "The risk exposure for client is too high, it may cause by sending too big order or the leverage is too low. please refer to client info to check the current exposure." }
                    '-1102': InvalidOrder, // { "code": -1102,  "message": "The order value (price * size) is too small." }
                    '-1103': InvalidOrder, // { "code": -1103,  "message": "The order price is not following the tick size rule for the symbol." }
                    '-1104': InvalidOrder, // { "code": -1104,  "message": "The order quantity is not following the step size rule for the symbol." }
                    '-1105': InvalidOrder, // { "code": -1105,  "message": "Price is X% too high or X% too low from the mid price." }
                },
                'broad': {
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchMarkets', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicGetInfo',
        });
        let data = undefined;
        if (marketType === 'spot') {
            const response = await this[method] (query);
            // {
            //     rows: [
            //         {
            //             symbol: "SPOT_AAVE_USDT",
            //             quote_min: 0,
            //             quote_max: 100000,
            //             quote_tick: 0.01,
            //             base_min: 0.01,
            //             base_max: 7284,
            //             base_tick: 0.0001,
            //             min_notional: 10,
            //             price_range: 0.1,
            //             created_time: "0",
            //             updated_time: "1639107647.988",
            //             is_stable: 0
            //         },
            //         ...
            //     success: true
            // }
            data = this.safeValue (response, 'rows', []);
        }
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString (market, 'symbol');
            const parts = marketId.split ('_');
            const baseId = parts[1];
            const quoteId = parts[2];
            const marketTypeVal = parts[0].toLowerCase ();
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const minQuoteAmount = this.safeNumber (market, 'quote_min');
            const maxQuoteAmount = this.safeNumber (market, 'quote_max');
            const minBaseAmount = this.safeNumber (market, 'base_min');
            const maxBaseAmount = this.safeNumber (market, 'base_max');
            const priceScale = this.safeInteger (market, 'quote_tick');
            const quantityScale = this.safeInteger (market, 'base_tick');
            const pricePrecision = priceScale;
            const quantityPrecision = quantityScale;
            result.push ({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': marketTypeVal,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                // Fee is in %, so divide by 100
                'taker': undefined,
                'maker': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': quantityPrecision,
                    'price': pricePrecision,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minBaseAmount,
                        'max': maxBaseAmount,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minQuoteAmount,
                        'max': maxQuoteAmount,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'publicGetMarketTrades',
        });
        const response = await this[method] (this.extend (request, query));
        // {
        //     success: true,
        //     rows: [
        //         {
        //             symbol: "SPOT_BTC_USDT",
        //             side: "SELL",
        //             executed_price: 46222.35,
        //             executed_quantity: 0.0012,
        //             executed_timestamp: "1641241162.329"
        //         },
        //         {
        //             symbol: "SPOT_BTC_USDT",
        //             side: "SELL",
        //             executed_price: 46222.35,
        //             executed_quantity: 0.0012,
        //             executed_timestamp: "1641241162.329"
        //         },
        //         {
        //             symbol: "SPOT_BTC_USDT",
        //             side: "BUY",
        //             executed_price: 46224.32,
        //             executed_quantity: 0.00039,
        //             executed_timestamp: "1641241162.287"
        //         },
        //         ...
        //      ]
        // }
        const resultResponse = this.safeValue (response, 'rows', {});
        return this.parseTrades (resultResponse, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // ### public/market_trades
        // {
        //     symbol: "SPOT_BTC_USDT",
        //     side: "SELL",
        //     executed_price: 46222.35,
        //     executed_quantity: 0.0012,
        //     executed_timestamp: "1641241162.329"
        // },
        const timestamp = this.safeTimestamp (trade, 'executed_timestamp');
        const marketId = this.safeString (trade, 'symbol');
        if (market === undefined) {
            market = this.safeMarket (marketId, market, '_');
        }
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'executed_price');
        const amount = this.safeString (trade, 'executed_quantity');
        let side = this.safeString (trade, 'side');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        let id = timestamp;
        if (id !== undefined) {
            id += '-' + market['id'] + '-' + amount;
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'order': undefined,
            'takerOrMaker': 'taker',
            'type': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchCurrencies (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchCurrencies', undefined, params);
        const method1 = this.getSupportedMapping (marketType, {
            'spot': 'publicGetToken',
        });
        const method2 = this.getSupportedMapping (marketType, {
            'spot': 'publicGetTokenNetwork',
        });
        const response1 = await this[method1] (query);
        // {
        //     rows: [
        //         {
        //             token: "ETH_USDT",
        //             fullname: "Tether",
        //             decimals: 6,
        //             balance_token: "USDT",
        //             created_time: "0",
        //             updated_time: "0"
        //         },
        //         {
        //             token: "BSC_USDT",
        //             fullname: "Tether",
        //             decimals: 18,
        //             balance_token: "USDT",
        //             created_time: "0",
        //             updated_time: "0"
        //         },
        //         {
        //             token: "ZEC",
        //             fullname: "ZCash",
        //             decimals: 8,
        //             balance_token: "ZEC",
        //             created_time: "0",
        //             updated_time: "0"
        //         },
        //         ...
        //     ],
        //     success: true
        // }
        const response2 = await this[method2] (query);
        // {
        //     rows: [
        //         {
        //             protocol: "ERC20",
        //             token: "USDT",
        //             name: "Ethereum",
        //             minimum_withdrawal: 30,
        //             withdrawal_fee: 25,
        //             allow_deposit: 1,
        //             allow_withdraw: 1
        //         },
        //         {
        //             protocol: "TRC20",
        //             token: "USDT",
        //             name: "Tron",
        //             minimum_withdrawal: 30,
        //             withdrawal_fee: 1,
        //             allow_deposit: 1,
        //             allow_withdraw: 1
        //         },
        //         ...
        //     ],
        //     success: true
        // }
        const result = {};
        const data = this.safeValue (response1, 'rows', []);
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'token');
            const name = this.safeString (currency, 'fullname');
            const code = this.safeCurrencyCode (id);
            const precision = this.safeNumber (currency, 'decimals');
            const parts = id.split ('_');
            const network = parts[0];
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': precision,
                'info': currency,
                'active': undefined,
                'fee': undefined,
                'network': network,
                'limits': {
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]);
        params = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += '/' + this.version + '/' + api + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const request = '/api/' + this.version + '/' + path;
            url += request;
            params['request'] = request;
            params['nonce'] = this.nonce ().toString ();
            const auth = this.json (params);
            const auth64 = this.stringToBase64 (auth);
            const signature = this.hmac (auth64, this.encode (this.secret), 'sha512');
            body = auth;
            headers = {
                'z': this.apiKey,
                'x': this.decode (auth64),
                'y': signature,
                'Content-type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            // fallback to default error handler
        }
    }
};
