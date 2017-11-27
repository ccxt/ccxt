"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')

//  ---------------------------------------------------------------------------

module.exports = class southxchange extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'southxchange',
            'name': 'SouthXchange',
            'countries': 'AR', // Argentina
            'rateLimit': 1000,
            'hasFetchTickers': true,
            'hasCORS': false,
            'hasWithdraw': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg',
                'api': 'https://www.southxchange.com/api',
                'www': 'https://www.southxchange.com',
                'doc': 'https://www.southxchange.com/Home/Api',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'price/{symbol}',
                        'prices',
                        'book/{symbol}',
                        'trades/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'cancelMarketOrders',
                        'cancelOrder',
                        'generatenewaddress',
                        'listOrders',
                        'listBalances',
                        'placeOrder',
                        'withdraw',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let base = market[0];
            let quote = market[1];
            let symbol = base + '/' + quote;
            let id = symbol;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostListBalances ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['Currency'];
            let uppercase = currency.toUpperCase ();
            let free = parseFloat (balance['Available']);
            let used = parseFloat (balance['Unconfirmed']);
            let total = this.sum (free, used);
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[uppercase] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBookSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'BuyOrders', 'SellOrders', 'Price', 'Amount');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'Bid'),
            'ask': this.safeFloat (ticker, 'Ask'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'Last'),
            'change': this.safeFloat (ticker, 'Variation24Hr'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'Volume24Hr'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetPrices (params);
        let tickers = this.indexBy (response, 'Market');
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetPriceSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let timestamp = trade['At'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': trade['Type'],
            'price': trade['Price'],
            'amount': trade['Amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'listingCurrency': market['base'],
            'referenceCurrency': market['quote'],
            'type': side,
            'amount': amount,
        };
        if (type == 'limit')
            order['limitPrice'] = price;
        let response = await this.privatePostPlaceOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response.toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder (this.extend ({
            'orderCode': id,
        }, params));
    }

    async withdraw (currency, amount, address, params = {}) {
        let response = await this.privatePostWithdraw (this.extend ({
            'currency': currency,
            'address': address,
            'amount': amount,
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
            }, query);
            body = this.json (query);
            headers = {
                'Content-Type': 'application/json',
                'Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
}
