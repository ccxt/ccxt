'use strict';

const Exchange = require ('./base/Exchange');
// const { ExchangeError } = require ('./base/errors');

module.exports = class ddex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ddex',
            'name': 'DDEX',
            'version': 'v2',
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://cdn.ddex.io/static/media/logo.941784ff.png',
                'api': 'https://api.ddex.io',
                'www': 'https://ddex.io/',
                'doc': [
                    'https://docs.ddex.io',
                ],
            },
            'has': {
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOHLCV': false,
                'fetchTicker': false,
                'fetchTrades': false,
                'privateAPI': false,
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                    ],
                    // 'post': [
                    //     'cancelpending',
                    //     'shift',
                    // ],
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

    // async startInstantTransaction (symbol, side, withdrawalAddress, affiliateAPIKey, params = {}) {
    //     const [base, quote] = symbol.split ('/');
    //     const pair = side === 'buy' ?
    //         `${quote.toLowerCase ()}_${base.toLowerCase ()}` :
    //         `${base.toLowerCase ()}_${quote.toLowerCase ()}`;
    //     const request = {
    //         'withdrawal': withdrawalAddress,
    //         'pair': pair,
    //         'returnAddress': withdrawalAddress,
    //         'apiKey': affiliateAPIKey,
    //     };
    //     const response = await this.publicPostShift (this.extend (request, params));
    //     if (response.error) throw new ExchangeError (response.error);
    //     return {
    //         'transactionId': response.deposit,
    //         'depositAddress': response.deposit,
    //         'info': response,
    //     };
    // }

    // async cancelInstantTransaction (transactionId, params = {}) {
    //     const request = {
    //         'address': transactionId,
    //     };
    //     const response = await this.publicPostCancelpending (this.extend (request, params));
    //     if (response.error) throw new ExchangeError (response.error);
    //     return {
    //         'success': true,
    //         'info': response,
    //     };
    // }

    // async fetchOrderBook (symbol, limit = undefined, params = {}) {
    //     const [base, quote] = symbol.split ('/');
    //     const bidSymbol = `${base.toLowerCase ()}_${quote.toLowerCase ()}`;
    //     const askSymbol = `${quote.toLowerCase ()}_${base.toLowerCase ()}`;
    //     const [bidResponse, askResponse] = await Promise.all ([
    //         this.publicGetMarketinfoPair ({ 'pair': bidSymbol }),
    //         this.publicGetMarketinfoPair ({ 'pair': askSymbol }),
    //     ]);
    //     const now = new Date ();
    //     return {
    //         'timestamp': now.getTime (),
    //         'datetime': now.toISOString (),
    //         'nonce': undefined,
    //         'bids': [
    //             [bidResponse.rate, bidResponse.limit],
    //         ],
    //         'asks': [
    //             [(1.0 / askResponse.rate), (askResponse.rate * askResponse.limit)],
    //         ],
    //     };
    // }

    // async calculateFee (symbol, type = undefined, side, amount = undefined, price = undefined, takerOrMaker = 'taker', params = {}) {
    //     await this.loadMarkets ();
    //     const [base, quote] = symbol.split ('/');
    //     let fee = undefined;
    //     if (side === 'sell') {
    //         const { info } = this.markets[symbol];
    //         fee = info.minerFee;
    //     } else {
    //         const { info } = this.markets[`${quote}/${base}`];
    //         fee = info.minerFee / info.rate;
    //     }
    //     return {
    //         'type': undefined,
    //         'currency': quote,
    //         'rate': undefined,
    //         'cost': fee,
    //     };
    // }

    // TODO: figure out how to get the other side of the market in here
    // TODO: think we can overload the params to include a conversion rate that'll be ignored by other exchanges
    // async fetchTicker (symbol, params = {}) {
    //     await this.loadMarkets ();
    //     const baseToQuoteInfo = this.market (symbol).info;
    //     const now = new Date ();
    //     return {
    //         'symbol': symbol,
    //         'info': baseToQuoteInfo,
    //         'timestamp': now.getTime (),
    //         'datetime': now.toISOString (),
    //         'high': undefined,
    //         'low': undefined,
    //         'bid': undefined, // baseToQuoteInfo.rate - baseToQuoteInfo.minerFee
    //         'bidVolume': undefined,
    //         'ask': '', // TODO: ???
    //         'askVolume': undefined,
    //         'vwap': undefined,
    //         'open': undefined,
    //         'close': undefined,
    //         'last': undefined,
    //         'previousClose': undefined,
    //         'change': undefined,
    //         'percentage': undefined,
    //         'average': undefined,
    //         'baseVolume': undefined,
    //         'quoteVolume': undefined,
    //     };
    // }

    // async fetchCurrencies (params = {}) {
    //     const coinsResponse = await this.publicGetGetcoins ();
    //     const coins = Object.keys (coinsResponse);
    //     const result = {};
    //     for (let i = 0; i < coins.length; i++) {
    //         const coinKey = coins[i];
    //         const coinObj = coinsResponse[coinKey];
    //         const symbol = coinObj.symbol;
    //         result[symbol] = {
    //             'id': symbol,
    //             'code': symbol,
    //             'info': coinObj,
    //             'name': coinObj.name,
    //             'active': coinObj.status === 'available',
    //             'status': 'ok',
    //             'fee': undefined,
    //             'precision': undefined,
    //             'limits': {
    //                 'amount': {
    //                     'min': undefined,
    //                     'max': undefined,
    //                 },
    //                 'price': {
    //                     'min': undefined,
    //                     'max': undefined,
    //                 },
    //                 'cost': {
    //                     'min': undefined,
    //                     'max': undefined,
    //                 },
    //                 'withdraw': {
    //                     'min': undefined,
    //                     'max': undefined,
    //                 },
    //             },
    //         };
    //     }
    //     return result;
    // }

    // {
    //     'id':     'btcusd',   // string literal for referencing within an exchange
    //     'symbol': 'BTC/USD',  // uppercase string literal of a pair of currencies
    //     'base':   'BTC',      // uppercase string, base currency, 3 or more letters
    //     'quote':  'USD',      // uppercase string, quote currency, 3 or more letters
    //     'active': true,       // boolean, market status
    //     'precision': {        // number of decimal digits "after the dot"
    //         'price': 8,       // integer
    //         'amount': 8,      // integer
    //         'cost': 8,        // integer
    //     },
    //     'limits': {           // value limits when placing orders on this market
    //         'amount': {
    //             'min': 0.01,  // order amount should be > min
    //             'max': 1000,  // order amount should be < max
    //         },
    //         'price': { ... }, // same min/max limits for the price of the order
    //         'cost':  { ... }, // same limits for order cost = price * amount
    //     },
    //     'info':      { ... }, // the original unparsed market info from the exchange
    // }

    // {
    //     "status": 0,
    //     "desc": "success",
    //     "data": {
    //         "markets": [
    //             {
    //                 "id": "ABT-ETH",
    //                 "quoteToken": "ABT",
    //                 "quoteTokenDecimals": 18,
    //                 "quoteTokenAddress": "0xb98d4c97425d9908e66e53a6fdf673acca0be986",
    //                 "baseToken": "ETH",
    //                 "baseTokenDecimals": 18,
    //                 "baseTokenAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    //                 "minOrderSize": "100.000000000000000000",
    //                 "maxOrderSize": "4931.539990904282435005",
    //                 "pricePrecision": 5,
    //                 "priceDecimals": 8,
    //                 "amountDecimals": 8
    //             },
    //         ...
    //         ]
    //     }
    // }

    async fetchMarkets () {
        const response = await this.publicGetMarkets ();
        const { markets } = response.data;
        const numMarkets = markets.length;
        const result = new Array (numMarkets);
        for (let i = 0; i < numMarkets; i++) {
            const market = markets[i];
            const { baseToken, quoteToken } = market;
            result[i] = {
                'id': market.id,
                'symbol': `${baseToken}/${quoteToken}`,
                'base': baseToken,
                'quote': quoteToken,
                'active': true,
                'precision': { 'amount': 8 },
                'limits': {
                    'amount': {
                        'min': market.minOrderSize,
                        'max': market.maxOrderSize,
                    },
                },
                'info': market,
            };
        }
        return result;
    }
};
