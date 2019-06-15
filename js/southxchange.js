'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
let { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class southxchange extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'southxchange',
            'name': 'SouthXchange',
            'countries': [ 'AR' ], // Argentina
            'rateLimit': 1000,
            'has': {
                'CORS': true,
                'createDepositAddress': true,
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'withdraw': true,
            },
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
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'commonCurrencies': {
                'SMT': 'SmartNode',
                'MTC': 'Marinecoin',
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let baseId = market[0];
            let quoteId = market[1];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let id = symbol;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': undefined,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostListBalances (params);
        if (!response) {
            throw new ExchangeError (this.id + ' fetchBalance got an unrecognized response');
        }
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = balance['Currency'];
            const uppercaseId = currencyId.toUpperCase ();
            const code = this.commonCurrencyCode (uppercaseId);
            const free = this.safeFloat (balance, 'Available');
            const deposited = this.safeFloat (balance, 'Deposited');
            const unconfirmed = this.safeFloat (balance, 'Unconfirmed');
            const total = this.sum (deposited, unconfirmed);
            const used = total - free;
            const account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetBookSymbol (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'BuyOrders', 'SellOrders', 'Price', 'Amount');
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'Last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'Bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'Ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'Variation24Hr'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'Volume24Hr'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetPrices (params);
        const tickers = this.indexBy (response, 'Market');
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPriceSymbol (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market) {
        let timestamp = this.safeInteger (trade, 'At');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
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
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let status = 'open';
        let symbol = order['ListingCurrency'] + '/' + order['ReferenceCurrency'];
        let timestamp = undefined;
        let price = this.safeFloat (order, 'LimitPrice');
        let amount = this.safeFloat (order, 'OriginalAmount');
        let remaining = this.safeFloat (order, 'Amount');
        let filled = undefined;
        let cost = undefined;
        if (amount !== undefined) {
            cost = price * amount;
            if (remaining !== undefined) {
                filled = amount - remaining;
            }
        }
        let orderType = order['Type'].toLowerCase ();
        let result = {
            'info': order,
            'id': order['Code'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': orderType,
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privatePostListOrders (params);
        return this.parseOrders (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'listingCurrency': market['base'],
            'referenceCurrency': market['quote'],
            'type': side,
            'amount': amount,
        };
        if (type === 'limit') {
            request['limitPrice'] = price;
        }
        const response = await this.privatePostPlaceOrder (this.extend (request, params));
        return {
            'info': response,
            'id': response.toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderCode': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostGeneratenewaddress (this.extend (request, params));
        const parts = response.split ('|');
        const numParts = parts.length;
        const address = parts[0];
        this.checkAddress (address);
        let tag = undefined;
        if (numParts > 1) {
            tag = parts[1];
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': amount,
        };
        if (tag !== undefined) {
            request['address'] = address + '|' + tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
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
};
