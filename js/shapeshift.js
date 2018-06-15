'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

module.exports = class shapeshift extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'shapeshift',
            'name': 'ShapeShift',
            'countries': 'CHE',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 2000,
            'urls': {
                'logo': 'https://shapeshift.io/logo.png',
                'api': 'https://shapeshift.io',
                'www': 'https://shapeshift.io',
                'doc': [
                    'https://info.shapeshift.io/api',
                ],
            },
            'has': {
                'cancelInstantTransaction': true,
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'privateAPI': false,
                'startInstantTransaction': true,
            },
            'api': {
                'public': {
                    'get': [
                        'getcoins',
                        'limit/{pair}',
                        'marketinfo/{pair}',
                        'rate/{pair}',
                        'recenttx/{max}',
                        'txStat/{address}',
                    ],
                    'post': [
                        'cancelpending',
                        'shift',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.implodeParams (path, params);
        const url = this.urls['api'] + request;
        if (method === 'POST') {
            headers = { 'Content-Type': 'application/json' };
            body = JSON.stringify (params);
        }
        return {
            'url': url,
            'method': method,
            'body': body,
            'headers': headers,
        };
    }

    async startInstantTransaction (symbol, side, withdrawalAddress, affiliateAPIKey, params = {}) {
        const [base, quote] = symbol.split ('/');
        const pair = side === 'buy' ?
            `${quote.toLowerCase ()}_${base.toLowerCase ()}` :
            `${base.toLowerCase ()}_${quote.toLowerCase ()}`;
        const request = {
            'withdrawal': withdrawalAddress,
            'pair': pair,
            'returnAddress': withdrawalAddress,
            'apiKey': affiliateAPIKey,
        };
        const response = await this.publicPostShift (this.extend (request, params));
        if (response.error) throw new ExchangeError (response.error);
        return {
            'transactionId': response.deposit,
            'depositAddress': response.deposit,
            'info': response,
        };
    }

    async cancelInstantTransaction (transactionId, params = {}) {
        const request = {
            'address': transactionId,
        };
        const response = await this.publicPostCancelpending (this.extend (request, params));
        if (response.error) throw new ExchangeError (response.error);
        return {
            'success': true,
            'info': response,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const [base, quote] = symbol.split ('/');
        const bidSymbol = `${base.toLowerCase ()}_${quote.toLowerCase ()}`;
        const askSymbol = `${quote.toLowerCase ()}_${base.toLowerCase ()}`;
        const [bidResponse, askResponse] = await Promise.all ([
            this.publicGetMarketinfoPair ({ 'pair': bidSymbol }),
            this.publicGetMarketinfoPair ({ 'pair': askSymbol }),
        ]);
        return {
            'timestamp': new Date ().getTime (),
            'bids': [
                [bidResponse.rate, bidResponse.limit],
            ],
            'asks': [
                [(1.0 / askResponse.rate), (askResponse.rate * askResponse.limit)],
            ],
        };
    }

    async calculateFee (symbol, type = undefined, side, amount = undefined, price = undefined, takerOrMaker = 'taker', params = {}) {
        await this.loadMarkets ();
        const [base, quote] = symbol.split ('/');
        let fee = undefined;
        if (side === 'sell') {
            const { info } = this.markets[symbol];
            fee = info.minerFee;
        } else {
            const { info } = this.markets[`${quote}/${base}`];
            fee = info.minerFee / info.rate;
        }
        return {
            'type': undefined,
            'currency': quote,
            'rate': undefined,
            'cost': fee,
        };
    }

    // TODO: figure out how to get the other side of the market in here
    // TODO: think we can overload the params to include a conversion rate that'll be ignored by other exchanges
    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const baseToQuoteInfo = this.market (symbol).info;
        const now = new Date ();
        return {
            'symbol': symbol,
            'info': baseToQuoteInfo,
            'timestamp': now.getTime (),
            'datetime': now.toISOString (),
            'high': undefined,
            'low': undefined,
            'bid': undefined, // baseToQuoteInfo.rate - baseToQuoteInfo.minerFee
            'bidVolume': undefined,
            'ask': '', // TODO: ???
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
        };
    }

    async fetchCurrencies (params = {}) {
        const coinsResponse = await this.publicGetGetcoins ();
        const coins = Object.keys (coinsResponse);
        const result = {};
        for (let i = 0; i < coins.length; i++) {
            const coinKey = coins[i];
            const coinObj = coinsResponse[coinKey];
            const symbol = coinObj.symbol;
            result[symbol] = {
                'id': symbol,
                'code': symbol,
                'info': coinObj,
                'name': coinObj.name,
                'active': coinObj.status === 'available',
                'status': 'ok',
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
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

    async fetchMarkets () {
        const marketsResponse = await this.publicGetMarketinfoPair ({ 'pair': '' });
        const numMarkets = marketsResponse.length;
        const result = new Array (numMarkets);
        for (let i = 0; i < numMarkets; i++) {
            const market = marketsResponse[i];
            const [base, quote] = market.pair.split ('_');
            result[i] = {
                'id': market.pair,
                'symbol': `${base}/${quote}`,
                base,
                quote,
                'active': true,
                'precision': { 'amount': 8 },
                'limits': { 'amount': market.limit },
                'info': market,
            };
        }
        return result;
    }
};
