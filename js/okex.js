'use strict';

// ---------------------------------------------------------------------------

let okcoinusd = require ('./okcoinusd.js');

// ---------------------------------------------------------------------------

module.exports = class okex extends okcoinusd {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex',
            'name': 'OKEX',
            'countries': ['CN', 'US'],
            'has': {
                'CORS': false,
                'futures': true,
                'fetchTickers': true,
            },
            'api': {
                'web': {
                    'get': [
                        'spot/markets/products',
                    ],
                    'post': [
                        'futures/pc/market/futuresCoin',
                    ],
                },
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg',
                'api': {
                    'web': 'https://www.okex.com/v2',
                    'public': 'https://www.okex.com/api',
                    'private': 'https://www.okex.com/api',
                },
                'www': 'https://www.okex.com',
                'doc': 'https://github.com/okcoin-okex/API-docs-OKEx.com',
                'fees': 'https://www.okex.com/pages/products/fees.html',
            },
            'commonCurrencies': {
                'FAIR': 'FairGame',
                'HOT': 'Hydro Protocol',
                'HSR': 'HC',
                'MAG': 'Maggie',
                'YOYO': 'YOYOW',
            },
            'options': {
                'fetchTickersMethod': 'fetch_tickers_from_api',
            },
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    async fetchMarkets (params = {}) {
        // TODO: they have a new fee schedule as of Feb 7
        // the new fees are progressive and depend on 30-day traded volume
        // the following is the worst case

        let futuresResponse = await this.webPostFuturesPcMarketFuturesCoin ();
        let spotResponse = await this.webGetSpotMarketsProducts ();
        let markets = spotResponse.data.concat (futuresResponse.data);
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let isFutureMarket = typeof markets[i]['contracts'] !== 'undefined';
            let id = markets[i]['symbol'];
            let precision = {
                'amount': markets[i]['maxSizeDigit'],
                'price': markets[i]['maxPriceDigit'],
            };
            let minAmount = markets[i]['minTradeSize'];
            let minPrice = Math.pow (10, -precision['price']);
            if (isFutureMarket) {
                id = id.replace (/^f_/, '');
                let baseId = markets[i].symbolDesc;
                let quoteId = markets[i].quote.toUpperCase ();
                let base = this.commonCurrencyCode (baseId);
                let quote = this.commonCurrencyCode (quoteId);
                let symbol = base + '/' + quote;
                result.push (this.extend (this.fees['trading'], {
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': markets[i],
                    'type': 'future',
                    'spot': false,
                    'future': true,
                    'active': true,
                    'precision': precision,
                    'limits': {
                        'amount': {
                            'min': minAmount,
                            'max': undefined,
                        },
                        'price': {
                            'min': minPrice,
                            'max': undefined,
                        },
                        'cost': {
                            'min': minAmount * minPrice,
                            'max': undefined,
                        },
                    },
                    'maker': 0.0003,
                    'taker': 0.0005,
                }));
            } else {
                let [baseId, quoteId] = id.split ('_');
                let baseIdUppercase = baseId.toUpperCase ();
                let quoteIdUppercase = quoteId.toUpperCase ();
                let base = this.commonCurrencyCode (baseIdUppercase);
                let quote = this.commonCurrencyCode (quoteIdUppercase);
                let symbol = base + '/' + quote;
                result.push (this.extend (this.fees['trading'], {
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'baseNumericId': markets[i]['baseCurrency'],
                    'quoteNumericId': markets[i]['quoteCurrency'],
                    'info': markets[i],
                    'type': 'spot',
                    'spot': true,
                    'future': false,
                    'active': markets[i]['online'] !== 0,
                    'precision': precision,
                    'limits': {
                        'amount': {
                            'min': minAmount,
                            'max': undefined,
                        },
                        'price': {
                            'min': minPrice,
                            'max': undefined,
                        },
                        'cost': {
                            'min': minAmount * minPrice,
                            'max': undefined,
                        },
                    },
                    'maker': 0.0015,
                    'taker': 0.0020,
                }));
            }
        }
        return result;
    }

    async fetchTickersFromApi (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let response = await this.publicGetTickers (this.extend (request, params));
        let tickers = response['tickers'];
        let timestamp = parseInt (response['date']) * 1000;
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            ticker = this.parseTicker (this.extend (tickers[i], { 'timestamp': timestamp }));
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTickersFromWeb (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let response = await this.webGetSpotMarketsTickers (this.extend (request, params));
        let tickers = response['data'];
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = this.parseTicker (tickers[i]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let method = this.options['fetchTickersMethod'];
        let response = await this[method] (symbols, params);
        return response;
    }
};
