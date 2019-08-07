'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

// ---------------------------------------------------------------------------

module.exports = class bl3p extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bl3p',
            'name': 'BL3P',
            'countries': [ 'NL', 'EU' ], // Netherlands, EU
            'rateLimit': 1000,
            'version': '1',
            'comment': 'An exchange market by BitonicNL',
            'has': {
                'CORS': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg',
                'api': 'https://api.bl3p.eu',
                'www': [
                    'https://bl3p.eu',
                    'https://bitonic.nl',
                ],
                'doc': [
                    'https://github.com/BitonicNL/bl3p-api/tree/master/docs',
                    'https://bl3p.eu/api',
                    'https://bitonic.nl/en/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{market}/ticker',
                        '{market}/orderbook',
                        '{market}/trades',
                    ],
                },
                'private': {
                    'post': [
                        '{market}/money/depth/full',
                        '{market}/money/order/add',
                        '{market}/money/order/cancel',
                        '{market}/money/order/result',
                        '{market}/money/orders',
                        '{market}/money/orders/history',
                        '{market}/money/trades/fetch',
                        'GENMKT/money/info',
                        'GENMKT/money/deposit_address',
                        'GENMKT/money/new_deposit_address',
                        'GENMKT/money/wallet/history',
                        'GENMKT/money/withdraw',
                    ],
                },
            },
            'markets': {
                'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'BTC', 'quoteId': 'EUR', 'maker': 0.0025, 'taker': 0.0025 },
                'LTC/EUR': { 'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR', 'baseId': 'LTC', 'quoteId': 'EUR', 'maker': 0.0025, 'taker': 0.0025 },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGENMKTMoneyInfo (params);
        const data = this.safeValue (response, 'data', {});
        const wallets = this.safeValue (data, 'wallets');
        const result = { 'info': data };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const wallet = this.safeValue (wallets, currencyId, {});
            const available = this.safeValue (wallet, 'available', {});
            const balance = this.safeValue (wallet, 'balance', {});
            const account = this.account ();
            account['free'] = this.safeFloat (available, 'value');
            account['total'] = this.safeFloat (balance, 'value');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 0) {
        return [
            bidask[priceKey] / 100000.0,
            bidask[amountKey] / 100000000.0,
        ];
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketOrderbook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data');
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price_int', 'amount_int');
    }

    async fetchTicker (symbol, params = {}) {
        const request = {
            'market': this.marketId (symbol),
        };
        const ticker = await this.publicGetMarketTicker (this.extend (request, params));
        let timestamp = this.safeInteger (ticker, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker['volume'], '24h'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        const id = this.safeString (trade, 'trade_id');
        const timestamp = this.safeInteger (trade, 'date');
        let price = this.safeFloat (trade, 'price_int');
        if (price !== undefined) {
            price /= 100000.0;
        }
        let amount = this.safeFloat (trade, 'amount_int');
        if (amount !== undefined) {
            amount /= 100000000.0;
        }
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const market = this.market (symbol);
        const response = await this.publicGetMarketTrades (this.extend ({
            'market': market['id'],
        }, params));
        const result = this.parseTrades (response['data']['trades'], market, since, limit);
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market (symbol);
        const order = {
            'market': market['id'],
            'amount_int': parseInt (amount * 100000000),
            'fee_currency': market['quote'],
            'type': (side === 'buy') ? 'bid' : 'ask',
        };
        if (type === 'limit') {
            order['price_int'] = parseInt (price * 100000.0);
        }
        const response = await this.privatePostMarketMoneyOrderAdd (this.extend (order, params));
        const orderId = this.safeString (response['data'], 'order_id');
        return {
            'info': response,
            'id': orderId,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'order_id': id,
        };
        return await this.privatePostMarketMoneyOrderCancel (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.implodeParams (path, params);
        let url = this.urls['api'] + '/' + this.version + '/' + request;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            const secret = this.base64ToBinary (this.secret);
            // eslint-disable-next-line quotes
            const auth = request + "\0" + body;
            const signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': this.apiKey,
                'Rest-Sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
