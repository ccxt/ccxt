'use strict';

// ---------------------------------------------------------------------------

const okcoinusd = require ('./okcoinusd.js');
const { ExchangeError } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class okex extends okcoinusd {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex',
            'name': 'OKEX',
            'countries': [ 'CN', 'US' ],
            'has': {
                'CORS': false,
                'futures': true,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg',
                'api': {
                    'web': 'https://www.okex.com/v2',
                    'public': 'https://www.okex.com/api',
                    'private': 'https://www.okex.com/api',
                },
                'www': 'https://www.okex.com',
                'doc': [
                    'https://github.com/okcoin-okex/API-docs-OKEx.com',
                    'https://www.okex.com/docs/en/',
                ],
                'fees': 'https://www.okex.com/pages/products/fees.html',
                'referral': 'https://www.okex.com',
            },
            'fees': {
                'trading': {
                    'taker': 0.0015,
                    'maker': 0.0010,
                },
                'spot': {
                    'taker': 0.0015,
                    'maker': 0.0010,
                },
                'future': {
                    'taker': 0.0030,
                    'maker': 0.0020,
                },
                'swap': {
                    'taker': 0.0070,
                    'maker': 0.0020,
                },
            },
            'commonCurrencies': {
                // OKEX refers to ERC20 version of Aeternity (AEToken)
                'AE': 'AET', // https://github.com/ccxt/ccxt/issues/4981
                'FAIR': 'FairGame',
                'HOT': 'Hydro Protocol',
                'HSR': 'HC',
                'MAG': 'Maggie',
                'YOYO': 'YOYOW',
            },
        });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['future'] ? 'privatePostFutureTrade' : 'privatePostTrade';
        const orderSide = (type === 'market') ? (side + '_market') : side;
        const isMarketBuy = ((market['spot']) && (type === 'market') && (side === 'buy') && (!this.options['marketBuyPrice']));
        const orderPrice = isMarketBuy ? this.safeFloat (params, 'cost') : price;
        const request = this.createRequest (market, {
            'type': orderSide,
        });
        if (market['future']) {
            request['match_price'] = type === 'market' ? 1 : 0; // match best counter party price? 0 or 1, ignores price if 1
            request['lever_rate'] = 10; // leverage rate value: 10 or 20 (10 by default)
            request['type'] = side === 'buy' ? '1' : '2';
        } else if (type === 'market') {
            if (side === 'buy') {
                if (!orderPrice) {
                    if (this.options['marketBuyPrice']) {
                        // eslint-disable-next-line quotes
                        throw new ExchangeError (this.id + " market buy orders require a price argument (the amount you want to spend or the cost of the order) when this.options['marketBuyPrice'] is true.");
                    } else {
                        // eslint-disable-next-line quotes
                        throw new ExchangeError (this.id + " market buy orders require an additional cost parameter, cost = price * amount. If you want to pass the cost of the market order (the amount you want to spend) in the price argument (the default " + this.id + " behaviour), set this.options['marketBuyPrice'] = true. It will effectively suppress this warning exception as well.");
                    }
                } else {
                    request['price'] = orderPrice;
                }
            } else {
                request['amount'] = amount;
            }
        }
        if (type !== 'market') {
            request['price'] = orderPrice;
            request['amount'] = amount;
        }
        params = this.omit (params, 'cost');
        const response = await this[method] (this.extend (request, params));
        const timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': this.safeString (response, 'order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }
};
