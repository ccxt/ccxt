'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, InvalidNonce, AuthenticationError, PermissionDenied } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bit2c extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bit2c',
            'name': 'Bit2C',
            'countries': [ 'IL' ], // Israel
            'rateLimit': 3000,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg',
                'api': 'https://bit2c.co.il',
                'www': 'https://www.bit2c.co.il',
                'referral': 'https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf',
                'doc': [
                    'https://www.bit2c.co.il/home/api',
                    'https://github.com/OferE/bit2c',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'Exchanges/{pair}/Ticker',
                        'Exchanges/{pair}/orderbook',
                        'Exchanges/{pair}/trades',
                        'Exchanges/{pair}/lasttrades',
                    ],
                },
                'private': {
                    'post': [
                        'Merchant/CreateCheckout',
                        'Order/AddCoinFundsRequest',
                        'Order/AddFund',
                        'Order/AddOrder',
                        'Order/AddOrderMarketPriceBuy',
                        'Order/AddOrderMarketPriceSell',
                        'Order/CancelOrder',
                        'Order/AddCoinFundsRequest',
                        'Order/AddStopOrder',
                        'Payment/GetMyId',
                        'Payment/Send',
                        'Payment/Pay',
                    ],
                    'get': [
                        'Account/Balance',
                        'Account/Balance/v2',
                        'Order/MyOrders',
                        'Order/GetById',
                        'Order/AccountHistory',
                        'Order/OrderHistory',
                    ],
                },
            },
            'markets': {
                'BTC/NIS': { 'id': 'BtcNis', 'symbol': 'BTC/NIS', 'base': 'BTC', 'quote': 'NIS', 'baseId': 'Btc', 'quoteId': 'Nis' },
                'ETH/NIS': { 'id': 'EthNis', 'symbol': 'ETH/NIS', 'base': 'ETH', 'quote': 'NIS', 'baseId': 'Eth', 'quoteId': 'Nis' },
                'BCH/NIS': { 'id': 'BchabcNis', 'symbol': 'BCH/NIS', 'base': 'BCH', 'quote': 'NIS', 'baseId': 'Bchabc', 'quoteId': 'Nis' },
                'LTC/NIS': { 'id': 'LtcNis', 'symbol': 'LTC/NIS', 'base': 'LTC', 'quote': 'NIS', 'baseId': 'Ltc', 'quoteId': 'Nis' },
                'ETC/NIS': { 'id': 'EtcNis', 'symbol': 'ETC/NIS', 'base': 'ETC', 'quote': 'NIS', 'baseId': 'Etc', 'quoteId': 'Nis' },
                'BTG/NIS': { 'id': 'BtgNis', 'symbol': 'BTG/NIS', 'base': 'BTG', 'quote': 'NIS', 'baseId': 'Btg', 'quoteId': 'Nis' },
                'BSV/NIS': { 'id': 'BchsvNis', 'symbol': 'BSV/NIS', 'base': 'BSV', 'quote': 'NIS', 'baseId': 'Bchsv', 'quoteId': 'Nis' },
                'GRIN/NIS': { 'id': 'GrinNis', 'symbol': 'GRIN/NIS', 'base': 'GRIN', 'quote': 'NIS', 'baseId': 'Grin', 'quoteId': 'Nis' },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.005'),
                    'taker': this.parseNumber ('0.005'),
                },
            },
            'options': {
                'fetchTradesMethod': 'public_get_exchanges_pair_trades',
            },
            'exceptions': {
                'exact': {
                    'Please provide valid APIkey': AuthenticationError, // { "error" : "Please provide valid APIkey" }
                },
                'broad': {
                    // { "error": "Please provide valid nonce in Request Nonce (1598218490) is not bigger than last nonce (1598218490)."}
                    // { "error": "Please provide valid nonce in Request UInt64.TryParse failed for nonce :" }
                    'Please provide valid nonce': InvalidNonce,
                    'please approve new terms of use on site': PermissionDenied, // { "error" : "please approve new terms of use on site." }
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balance = await this.privateGetAccountBalanceV2 (params);
        //
        //     {
        //         "AVAILABLE_NIS": 0.0,
        //         "NIS": 0.0,
        //         "LOCKED_NIS": 0.0,
        //         "AVAILABLE_BTC": 0.0,
        //         "BTC": 0.0,
        //         "LOCKED_BTC": 0.0,
        //         "AVAILABLE_ETH": 0.0,
        //         "ETH": 0.0,
        //         "LOCKED_ETH": 0.0,
        //         "AVAILABLE_BCHSV": 0.0,
        //         "BCHSV": 0.0,
        //         "LOCKED_BCHSV": 0.0,
        //         "AVAILABLE_BCHABC": 0.0,
        //         "BCHABC": 0.0,
        //         "LOCKED_BCHABC": 0.0,
        //         "AVAILABLE_LTC": 0.0,
        //         "LTC": 0.0,
        //         "LOCKED_LTC": 0.0,
        //         "AVAILABLE_ETC": 0.0,
        //         "ETC": 0.0,
        //         "LOCKED_ETC": 0.0,
        //         "AVAILABLE_BTG": 0.0,
        //         "BTG": 0.0,
        //         "LOCKED_BTG": 0.0,
        //         "AVAILABLE_GRIN": 0.0,
        //         "GRIN": 0.0,
        //         "LOCKED_GRIN": 0.0,
        //         "Fees": {
        //             "BtcNis": { "FeeMaker": 1.0, "FeeTaker": 1.0 },
        //             "EthNis": { "FeeMaker": 1.0, "FeeTaker": 1.0 },
        //             "BchabcNis": { "FeeMaker": 1.0, "FeeTaker": 1.0 },
        //             "LtcNis": { "FeeMaker": 1.0, "FeeTaker": 1.0 },
        //             "EtcNis": { "FeeMaker": 1.0, "FeeTaker": 1.0 },
        //             "BtgNis": { "FeeMaker": 1.0, "FeeTaker": 1.0 },
        //             "LtcBtc": { "FeeMaker": 1.0, "FeeTaker": 1.0 },
        //             "BchsvNis": { "FeeMaker": 1.0, "FeeTaker": 1.0 },
        //             "GrinNis": { "FeeMaker": 1.0, "FeeTaker": 1.0 }
        //         }
        //     }
        //
        const result = {
            'info': balance,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const account = this.account ();
            const currency = this.currency (code);
            const uppercase = currency['id'].toUpperCase ();
            if (uppercase in balance) {
                account['free'] = this.safeString (balance, 'AVAILABLE_' + uppercase);
                account['total'] = this.safeString (balance, uppercase);
            }
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const orderbook = await this.publicGetExchangesPairOrderbook (this.extend (request, params));
        return this.parseOrderBook (orderbook, symbol);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const ticker = await this.publicGetExchangesPairTicker (this.extend (request, params));
        const timestamp = this.milliseconds ();
        const averagePrice = this.safeNumber (ticker, 'av');
        const baseVolume = this.safeNumber (ticker, 'a');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && averagePrice !== undefined) {
            quoteVolume = baseVolume * averagePrice;
        }
        const last = this.safeNumber (ticker, 'll');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (ticker, 'h'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'l'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': averagePrice,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = this.options['fetchTradesMethod'];
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['date'] = parseInt (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 100000
        }
        const response = await this[method] (this.extend (request, params));
        if (typeof response === 'string') {
            throw new ExchangeError (response);
        }
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePostOrderAddOrder';
        const request = {
            'Amount': amount,
            'Pair': this.marketId (symbol),
        };
        if (type === 'market') {
            method += 'MarketPrice' + this.capitalize (side);
        } else {
            request['Price'] = price;
            request['Total'] = amount * price;
            request['IsBid'] = (side === 'buy');
        }
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response['NewOrder']['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        return await this.privatePostOrderCancelOrder (this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.privateGetOrderMyOrders (this.extend (request, params));
        const orders = this.safeValue (response, market['id'], {});
        const asks = this.safeValue (orders, 'ask', []);
        const bids = this.safeValue (orders, 'bid', []);
        return this.parseOrders (this.arrayConcat (asks, bids), market, since, limit);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeInteger (order, 'created');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'amount');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let side = this.safeValue (order, 'type');
        if (side === 0) {
            side = 'buy';
        } else if (side === 1) {
            side = 'sell';
        }
        const id = this.safeString (order, 'id');
        const status = this.safeString (order, 'status');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
        });
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (limit !== undefined) {
            request['take'] = limit;
        }
        request['take'] = limit;
        if (since !== undefined) {
            request['toTime'] = this.ymd (this.milliseconds (), '.');
            request['fromTime'] = this.ymd (since, '.');
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privateGetOrderOrderHistory (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        let id = undefined;
        let priceString = undefined;
        let amountString = undefined;
        let orderId = undefined;
        let feeCost = undefined;
        let side = undefined;
        const reference = this.safeString (trade, 'reference');
        if (reference !== undefined) {
            timestamp = this.safeTimestamp (trade, 'ticks');
            priceString = this.safeString (trade, 'price');
            amountString = this.safeString (trade, 'firstAmount');
            const reference_parts = reference.split ('|'); // reference contains 'pair|orderId|tradeId'
            if (market === undefined) {
                const marketId = this.safeString (trade, 'pair');
                if (marketId in this.markets_by_id[marketId]) {
                    market = this.markets_by_id[marketId];
                } else if (reference_parts[0] in this.markets_by_id) {
                    market = this.markets_by_id[reference_parts[0]];
                }
            }
            orderId = reference_parts[1];
            id = reference_parts[2];
            side = this.safeInteger (trade, 'action');
            if (side === 0) {
                side = 'buy';
            } else if (side === 1) {
                side = 'sell';
            }
            feeCost = this.safeNumber (trade, 'feeAmount');
        } else {
            timestamp = this.safeTimestamp (trade, 'date');
            id = this.safeString (trade, 'tid');
            priceString = this.safeString (trade, 'price');
            amountString = this.safeString (trade, 'amount');
            side = this.safeValue (trade, 'isBid');
            if (side !== undefined) {
                if (side) {
                    side = 'buy';
                } else {
                    side = 'sell';
                }
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': {
                'cost': feeCost,
                'currency': 'NIS',
                'rate': undefined,
            },
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            url += '.json';
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const query = this.extend ({
                'nonce': nonce,
            }, params);
            const auth = this.urlencode (query);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + auth;
                }
            } else {
                body = auth;
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'key': this.apiKey,
                'sign': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     { "error" : "please approve new terms of use on site." }
        //     { "error": "Please provide valid nonce in Request Nonce (1598218490) is not bigger than last nonce (1598218490)."}
        //
        const error = this.safeString (response, 'error');
        if (error !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};

