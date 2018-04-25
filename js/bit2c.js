'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bit2c extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bit2c',
            'name': 'Bit2C',
            'countries': 'IL', // Israel
            'rateLimit': 3000,
            'has': {
                'CORS': false,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg',
                'api': 'https://bit2c.co.il',
                'www': 'https://www.bit2c.co.il',
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
                'BTC/NIS': { 'id': 'BtcNis', 'symbol': 'BTC/NIS', 'base': 'BTC', 'quote': 'NIS' },
                'BCH/NIS': { 'id': 'BchNis', 'symbol': 'BCH/NIS', 'base': 'BCH', 'quote': 'NIS' },
                'LTC/NIS': { 'id': 'LtcNis', 'symbol': 'LTC/NIS', 'base': 'LTC', 'quote': 'NIS' },
                'BTG/NIS': { 'id': 'BtgNis', 'symbol': 'BTG/NIS', 'base': 'BTG', 'quote': 'NIS' },
            },
            'fees': {
                'trading': {
                    'maker': 0.5 / 100,
                    'taker': 0.5 / 100,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        let balance = await this.privateGetAccountBalanceV2 ();
        let result = { 'info': balance };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let account = this.account ();
            if (currency in balance) {
                let available = 'AVAILABLE_' + currency;
                account['free'] = balance[available];
                account['total'] = balance[currency];
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let orderbook = await this.publicGetExchangesPairOrderbook (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetExchangesPairTicker (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        let averagePrice = parseFloat (ticker['av']);
        let baseVolume = parseFloat (ticker['a']);
        let quoteVolume = baseVolume * averagePrice;
        let last = parseFloat (ticker['ll']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['h']),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['l']),
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

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['date']) * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetExchangesPairTrades (this.extend ({
            'pair': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePostOrderAddOrder';
        let order = {
            'Amount': amount,
            'Pair': this.marketId (symbol),
        };
        if (type === 'market') {
            method += 'MarketPrice' + this.capitalize (side);
        } else {
            order['Price'] = price;
            order['Total'] = amount * price;
            order['IsBid'] = (side === 'buy');
        }
        let result = await this[method] (this.extend (order, params));
        return {
            'info': result,
            'id': result['NewOrder']['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrderCancelOrder ({ 'id': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            url += '.json';
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let query = this.extend ({ 'nonce': nonce }, params);
            body = this.urlencode (query);
            let signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'key': this.apiKey,
                'sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOpenOrders() requires a symbol argument');
        let market = this.market (symbol);
        let response = await this.privateGetOrderMyOrders (this.extend ({
            'pair': market['id'],
        }, params));
        let orders = this.safeValue (response, market['id'], {});
        let asks = this.safeValue (orders, 'ask');
        let bids = this.safeValue (orders, 'bid');
        return this.parseOrders (this.arrayConcat (asks, bids), market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let timestamp = order['created'];
        let price = order['price'];
        let amount = order['amount'];
        let cost = price * amount;
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let side = this.safeValue (order, 'type');
        if (side === 0) {
            side = 'buy';
        } else if (side === 1) {
            side = 'sell';
        }
        let id = this.safeString (order, 'id');
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.safeString (order, 'status'),
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
};
