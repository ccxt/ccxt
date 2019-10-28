'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
// const { ArgumentsRequired, BadRequest, InvalidNonce, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class tokens extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tokensnet',
            'name': 'Tokens.net',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'certified': false,
            'has': {
                // 'CORS': false,
                // 'publicAPI': true,
                // 'privateAPI': true,
                'fetchMarkets': true,
                'fetchTicker': true,
            },
            'urls': {
                'api': 'https://api.tokens.net/',
                'doc': 'https://www.tokens.net/api/',
                'logo': 'https://user-images.githubusercontent.com/4224211/52278879-67fcea80-2958-11e9-9cec-94a7333a9d7e.png',
                'www': 'https://www.tokens.net',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'public/trading-pairs/get/all/',
                        'public/ticker/all/',
                        'public/ticker/{pair}/',
                        'public/ticker/{time}/{pair}/',
                        'public/trades/{time}/{pair}/',
                        'public/order-book/{pair}/',
                    ],
                },
                'private': {
                    'get': [
                        'private/balance/{code}/',
                        'private/orders/get/all/',
                        'private/orders/get/{id}/',
                        'private/orders/get/{pair}/',
                        'private/orders/get/all/',
                    ],
                    'post': [
                        'private/orders/add/limit/',
                        'private/orders/cancel/{id}/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.2 / 100,
                    'maker': 0,
                },
            },
            // 'fees': {
            //     'trading': {
            //         'tierBased': false,
            //         'percentage': true,
            //         'taker': 0.2 / 100,
            //         'maker': 0.0 / 100,
            //     },
            //     'funding': {
            //         'tierBased': false,
            //         'percentage': false,
            //         'withdraw': {
            //             'ADA': 15,
            //             'BAT': 2,
            //             'BCH': 0.0001,
            //             'BIT': 30,
            //             'BSV': 0.0001,
            //             'BTC': 0.0002,
            //             'DAI': 1,
            //             'DPP': 100,
            //             'DTR': 30,
            //             'ELI': 100,
            //             'ETH': 0.005,
            //             'EURS': 1.5,
            //             'GUSD': 1,
            //             'LANA': 5000,
            //             'LTC': 0.002,
            //             'MRP': 100,
            //             'PAX': 1,
            //             'TAJ': 300,
            //             'TUSD': 1,
            //             'USDC': 1,
            //             'USDT-ERC': 1,
            //             'USDT-OMNI': 3,
            //             'VTY': 300,
            //             'XAUR': 15,
            //             'XLM': 0.1,
            //             'XRM': 0.0001,
            //             'XRP': 0.05,
            //         },
            //     },
            // },
            // 'exceptions': {
            //     '100': ArgumentsRequired,
            //     '101': ArgumentsRequired,
            //     '102': ArgumentsRequired,
            //     '110': InvalidNonce,
            //     '111': InvalidNonce,
            //     '120': BadRequest,
            //     '121': BadRequest,
            //     '130': BadRequest,
            //     '140': BadRequest,
            //     '150': BadRequest,
            //     '160': BadRequest,
            //     '429': DDoSProtection,
            // },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        url += this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const auth = nonce + this.apiKey;
            const signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
            body = this.urlencode (query);
            headers = {
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetPublicTradingPairsGetAll ();
        // {
        //     "xtzeurs": {
        //         "counterCurrency": "eurs",
        //         "priceDecimals": 4,
        //         "baseCurrency": "xtz",
        //         "amountDecimals": 6,
        //         "minAmount": "1",
        //         "title": "XTZ/EURS"
        //     },
        //     ...
        // }
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i += 1) {
            const symbolId = keys[i];
            const market = markets[keys[i]];
            const symbol = market['title'];
            const baseId = market['baseCurrency'];
            const base = baseId.toUpperCase ();
            const quoteId = market['counterCurrency'];
            const quote = quoteId.toUpperCase ();
            const precision = {
                'price': market['priceDecimals'],
                'amount': market['amountDecimals'],
                'cost': market['amountDecimals'],
            };
            const cost = market['minAmount'];
            result.push ({
                'id': symbolId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': parseFloat (cost),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const tickers = await this.publicGetPublicTickerGetAll ();
        // {
        //     "btcusdt": {
        //         "last": "9381.24",
        //         "volume_usdt": "272264.02067160",
        //         "open": "9616.58",
        //         "volume": "28.54974563",
        //         "ask": "9381.25",
        //         "low": "9340.37",
        //         "bid": "9371.87",
        //         "vwap": "9536.47798478",
        //         "high": "9702.76"
        //     },
        //     ...
        // }
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = this.safeString (ticker, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "vwap": "9536.47798478",
        //     "volume_usdt": "272264.02067160",
        //     "open": "9616.58",
        //     "ask": "9381.25",
        //     "status": "ok",
        //     "high": "9702.76",
        //     "timestamp": 1572265101,
        //     "volume": "28.54974563",
        //     "bid": "9371.87",
        //     "last": "9381.24",
        //     "low": "9340.37"
        // }

        // let percentage = this.safeFloat (ticker, 'changeRate');
        // if (percentage !== undefined) {
        //     percentage = percentage * 100;
        // }
        // const last = this.safeFloat (ticker, 'last');
        // let symbol = undefined;
        // const marketId = this.safeString (ticker, 'symbol');
        //  if (marketId !== undefined) {
        //     if (marketId in this.markets_by_id) {
        //         market = this.markets_by_id[marketId];
        //         symbol = market['symbol'];
        //     } else {
        //         const [ baseId, quoteId ] = marketId.split ('-');
        //         const base = this.safeCurrencyCode (baseId);
        //         const quote = this.safeCurrencyCode (quoteId);
        //         symbol = base + '/' + quote;
        //     }
        // }
        // if (symbol === undefined) {
        //     if (market !== undefined) {
        //         symbol = market['symbol'];
        //     }
        // }

        return {
            'symbol': undefined,
            'timestamp': this.safeInteger (ticker, 'timestamp'),
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': this.safeFloat (ticker, 'open'),
            'close': this.safeFloat (ticker, 'last'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'changePrice'),
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'volValue'),
            'info': ticker,
        };
    }
};
