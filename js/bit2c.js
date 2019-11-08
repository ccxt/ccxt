'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bit2c extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bit2c',
            'name': 'Bit2C',
            'countries': [ 'IL' ], // Israel
            'rateLimit': 3000,
            'has': {
                'CORS': false,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
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
                    'maker': 0.5 / 100,
                    'taker': 0.5 / 100,
                },
            },
            'options': {
                'fetchTradesMethod': 'public_get_exchanges_pair_lasttrades',
            },
            'exceptions': {
                // { "error" : "Please provide valid APIkey" }
                // { "error" : "Please provide valid nonce in Request UInt64.TryParse failed for nonce :" }
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
        const result = { 'info': balance };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const account = this.account ();
            const currencyId = this.currencyId (code);
            const uppercase = currencyId.toUpperCase ();
            if (uppercase in balance) {
                account['free'] = this.safeFloat (balance, 'AVAILABLE_' + uppercase);
                account['total'] = this.safeFloat (balance, uppercase);
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
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const ticker = await this.publicGetExchangesPairTicker (this.extend (request, params));
        const timestamp = this.milliseconds ();
        const averagePrice = this.safeFloat (ticker, 'av');
        const baseVolume = this.safeFloat (ticker, 'a');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && averagePrice !== undefined) {
            quoteVolume = baseVolume * averagePrice;
        }
        const last = this.safeFloat (ticker, 'll');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'h'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'l'),
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
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
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
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': cost,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
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
        let price = undefined;
        let amount = undefined;
        let orderId = undefined;
        let feeCost = undefined;
        let side = undefined;
        const reference = this.safeString (trade, 'reference');
        if (reference !== undefined) {
            timestamp = this.safeTimestamp (trade, 'ticks');
            price = this.safeFloat (trade, 'price');
            amount = this.safeFloat (trade, 'firstAmount');
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
            feeCost = this.safeFloat (trade, 'feeAmount');
        } else {
            timestamp = this.safeTimestamp (trade, 'date');
            id = this.safeString (trade, 'tid');
            price = this.safeFloat (trade, 'price');
            amount = this.safeFloat (trade, 'amount');
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
            'cost': price * amount,
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
                'sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};

