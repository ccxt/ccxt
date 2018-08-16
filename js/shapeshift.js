'use strict';

const Exchange = require('./base/Exchange');
const { ExchangeError } = require('./base/errors');

module.exports = class shapeshift extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'shapeshift',
            'name': 'ShapeShift',
            'countries': 'CHE',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://shapeshift.io/logo.png',
                'api': 'https://shapeshift.io',
                'www': 'https://shapeshift.io',
                'doc': [
                    'https://info.shapeshift.io/api',
                ],
            },
            'has': {
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': false,
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
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': false,
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
            },
        });
    }

    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.implodeParams(path, params);
        const url = this.urls['api'] + request;
        if (method === 'POST') {
            headers = { 'Content-Type': 'application/json' };
            params.apiKey = this.apiKey;
            body = JSON.stringify(params);
        }
        return {
            'url': url,
            'method': method,
            'body': body,
            'headers': headers,
        };
    }

    async instantTransactionStatus(transactionId, params = {}) {
        return this.publicGetTxStatAddress({ 'address': transactionId });
    }

    async startInstantTransaction(input, output, amount = undefined, address, params = {}) {
        await this.loadMarkets();
        const marketFrom = `${input.toUpperCase()}/${output.toUpperCase()}`;
        const marketTo = `${output.toUpperCase()}/${input.toUpperCase()}`;
        if (!this.markets[marketFrom] && !this.markets[marketTo])
            throw new ExchangeError(`Market ${input} to ${output} does not exist.`);
        const pair = `${input.toLowerCase()}_${output.toLowerCase()}`;
        const request = {
            'withdrawal': address,
            'pair': pair,
            'returnAddress': address,
        };
        const response = await this.publicPostShift(this.extend(request, params));
        if (response.error) throw new ExchangeError(response.error);
        return {
            'transactionId': response.deposit,
            'depositAddress': response.deposit,
            'info': response,
        };
    }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        const [base, quote] = symbol.split('/');
        const bidSymbol = `${base.toLowerCase()}_${quote.toLowerCase()}`;
        const askSymbol = `${quote.toLowerCase()}_${base.toLowerCase()}`;
        const [bidResponse, askResponse] = await Promise.all([
            this.publicGetMarketinfoPair({ 'pair': bidSymbol }),
            this.publicGetMarketinfoPair({ 'pair': askSymbol }),
        ]);
        const now = new Date();
        return {
            'timestamp': now.getTime(),
            'datetime': now.toISOString(),
            'nonce': undefined,
            'bids': [
                [bidResponse.rate, bidResponse.limit],
            ],
            'asks': [
                [(1.0 / askResponse.rate), (askResponse.rate * askResponse.limit)],
            ],
        };
    }

    calculateFee(symbol, type = undefined, side, amount = undefined, price = undefined, takerOrMaker = 'taker', params = {}) {
        const [base, quote] = symbol.split('/');
        let fee = undefined;
        if (side === 'sell') {
            const { info } = this.markets[symbol];
            fee = info.minerFee;
        } else {
            const { info } = this.markets[`${quote}/${base}`];
            fee = info.minerFee;
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
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const baseToQuoteInfo = this.market(symbol).info;
        const now = new Date();
        return {
            'symbol': symbol,
            'info': baseToQuoteInfo,
            'timestamp': now.getTime(),
            'datetime': now.toISOString(),
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

    async fetchCurrencies(params = {}) {
        const coinsResponse = await this.publicGetGetcoins();
        const coins = Object.keys(coinsResponse);
        const result = {};
        for (let i = 0, len = coins.length; i < len; i++) {
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

    async fetchMarkets() {
        const marketsResponse = await this.publicGetMarketinfoPair({ 'pair': '' });
        const numMarkets = marketsResponse.length;
        const result = new Array(numMarkets);
        for (let i = 0; i < numMarkets; i++) {
            const market = marketsResponse[i];
            const [base, quote] = market.pair.split('_');
            result[i] = {
                'id': market.pair,
                'symbol': `${base}/${quote}`,
                base,
                quote,
                'active': true,
                'precision': { 'amount': 8 },
                'limits': {
                    'amount': {
                        'min': market.min,
                        'max': market.limit,
                    },
                },
                'info': market,
            };
        }
        return result;
    }
};
