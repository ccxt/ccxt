'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class coinspot extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinspot',
            'name': 'CoinSpot',
            'countries': [ 'AU' ], // Australia
            'rateLimit': 1000,
            'has': {
                'cancelOrder': false,
                'CORS': false,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg',
                'api': {
                    'public': 'https://www.coinspot.com.au/pubapi',
                    'private': 'https://www.coinspot.com.au/api',
                },
                'www': 'https://www.coinspot.com.au',
                'doc': 'https://www.coinspot.com.au/api',
                'referral': 'https://www.coinspot.com.au/register?code=PJURCU',
            },
            'api': {
                'public': {
                    'get': [
                        'latest',
                    ],
                },
                'private': {
                    'post': [
                        'orders',
                        'orders/history',
                        'my/coin/deposit',
                        'my/coin/send',
                        'quote/buy',
                        'quote/sell',
                        'my/balances',
                        'my/orders',
                        'my/buy',
                        'my/sell',
                        'my/buy/cancel',
                        'my/sell/cancel',
                        'ro/my/balances',
                        'ro/my/balances/{cointype}',
                        'ro/my/deposits',
                        'ro/my/withdrawals',
                        'ro/my/transactions',
                        'ro/my/transactions/{cointype}',
                        'ro/my/transactions/open',
                        'ro/my/transactions/{cointype}/open',
                        'ro/my/sendreceive',
                        'ro/my/affiliatepayments',
                        'ro/my/referralpayments',
                    ],
                },
            },
            'markets': {
                'BTC/AUD': { 'id': 'btc', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', 'baseId': 'btc', 'quoteId': 'aud' },
                'ETH/AUD': { 'id': 'eth', 'symbol': 'ETH/AUD', 'base': 'ETH', 'quote': 'AUD', 'baseId': 'eth', 'quoteId': 'aud' },
                'XRP/AUD': { 'id': 'xrp', 'symbol': 'XRP/AUD', 'base': 'XRP', 'quote': 'AUD', 'baseId': 'xrp', 'quoteId': 'aud' },
                'LTC/AUD': { 'id': 'ltc', 'symbol': 'LTC/AUD', 'base': 'LTC', 'quote': 'AUD', 'baseId': 'ltc', 'quoteId': 'aud' },
                'DOGE/AUD': { 'id': 'doge', 'symbol': 'DOGE/AUD', 'base': 'DOGE', 'quote': 'AUD', 'baseId': 'doge', 'quoteId': 'aud' },
                'RFOX/AUD': { 'id': 'rfox', 'symbol': 'RFOX/AUD', 'base': 'RFOX', 'quote': 'AUD', 'baseId': 'rfox', 'quoteId': 'aud' },
                'POWR/AUD': { 'id': 'powr', 'symbol': 'POWR/AUD', 'base': 'POWR', 'quote': 'AUD', 'baseId': 'powr', 'quoteId': 'aud' },
                'NEO/AUD': { 'id': 'neo', 'symbol': 'NEO/AUD', 'base': 'NEO', 'quote': 'AUD', 'baseId': 'neo', 'quoteId': 'aud' },
                'TRX/AUD': { 'id': 'trx', 'symbol': 'TRX/AUD', 'base': 'TRX', 'quote': 'AUD', 'baseId': 'trx', 'quoteId': 'aud' },
                'EOS/AUD': { 'id': 'eos', 'symbol': 'EOS/AUD', 'base': 'EOS', 'quote': 'AUD', 'baseId': 'eos', 'quoteId': 'aud' },
                'XLM/AUD': { 'id': 'xlm', 'symbol': 'XLM/AUD', 'base': 'XLM', 'quote': 'AUD', 'baseId': 'xlm', 'quoteId': 'aud' },
                'RHOC/AUD': { 'id': 'rhoc', 'symbol': 'RHOC/AUD', 'base': 'RHOC', 'quote': 'AUD', 'baseId': 'rhoc', 'quoteId': 'aud' },
                'GAS/AUD': { 'id': 'gas', 'symbol': 'GAS/AUD', 'base': 'GAS', 'quote': 'AUD', 'baseId': 'gas', 'quoteId': 'aud' },
            },
            'commonCurrencies': {
                'DRK': 'DASH',
            },
            'options': {
                'fetchBalance': 'private_post_my_balances',
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const method = this.safeString (this.options, 'fetchBalance', 'private_post_my_balances');
        const response = await this[method] (params);
        //
        // read-write api keys
        //
        //     ...
        //
        // read-only api keys
        //
        //     {
        //         "status":"ok",
        //         "balances":[
        //             {
        //                 "LTC":{"balance":0.1,"audbalance":16.59,"rate":165.95}
        //             }
        //         ]
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue2 (response, 'balance', 'balances');
        if (Array.isArray (balances)) {
            for (let i = 0; i < balances.length; i++) {
                const currencies = balances[i];
                const currencyIds = Object.keys (currencies);
                for (let j = 0; j < currencyIds.length; j++) {
                    const currencyId = currencyIds[j];
                    const balance = currencies[currencyId];
                    const code = this.safeCurrencyCode (currencyId);
                    const account = this.account ();
                    account['total'] = this.safeString (balance, 'balance');
                    result[code] = account;
                }
            }
        } else {
            const currencyIds = Object.keys (balances);
            for (let i = 0; i < currencyIds.length; i++) {
                const currencyId = currencyIds[i];
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['total'] = this.safeString (balances, currencyId);
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cointype': market['id'],
        };
        const orderbook = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrderBook (orderbook, symbol, undefined, 'buyorders', 'sellorders', 'rate', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetLatest (params);
        let id = this.marketId (symbol);
        id = id.toLowerCase ();
        const ticker = response['prices'][id];
        const timestamp = this.milliseconds ();
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cointype': market['id'],
        };
        const response = await this.privatePostOrdersHistory (this.extend (request, params));
        //
        //     {
        //         "status":"ok",
        //         "orders":[
        //             {"amount":0.00102091,"rate":21549.09999991,"total":21.99969168,"coin":"BTC","solddate":1604890646143,"market":"BTC/AUD"},
        //         ],
        //     }
        //
        const trades = this.safeValue (response, 'orders', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "amount":0.00102091,
        //         "rate":21549.09999991,
        //         "total":21.99969168,
        //         "coin":"BTC",
        //         "solddate":1604890646143,
        //         "market":"BTC/AUD"
        //     }
        //
        const priceString = this.safeString (trade, 'rate');
        const amountString = this.safeString (trade, 'amount');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        let cost = this.safeNumber (trade, 'total');
        if (cost === undefined) {
            cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        }
        const timestamp = this.safeInteger (trade, 'solddate');
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market, '/');
        return {
            'info': trade,
            'id': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const method = 'privatePostMy' + this.capitalize (side);
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const request = {
            'cointype': this.marketId (symbol),
            'amount': amount,
            'rate': price,
        };
        return await this[method] (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const side = this.safeString (params, 'side');
        if (side !== 'buy' && side !== 'sell') {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a side parameter, "buy" or "sell"');
        }
        params = this.omit (params, 'side');
        const method = 'privatePostMy' + this.capitalize (side) + 'Cancel';
        const request = {
            'id': id,
        };
        return await this[method] (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.apiKey) {
            throw new AuthenticationError (this.id + ' requires apiKey for all requests');
        }
        const url = this.urls['api'][api] + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.json (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/json',
                'key': this.apiKey,
                'sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
