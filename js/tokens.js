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
                'fetchMarkets': true,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
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
                        'public/currency/all/',
                        'public/order-book/{pair}/',
                        'public/trades/hour/{pair}/',
                    ],
                },
                'private': {
                    'get': [
                        // 'private/balance/{code}/',
                        // 'private/orders/get/all/',
                        // 'private/orders/get/{id}/',
                        // 'private/orders/get/{pair}/',
                        // 'private/orders/get/all/',
                    ],
                    'post': [
                        // 'private/orders/add/limit/',
                        // 'private/orders/cancel/{id}/',
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
            const market = markets[keys[i]];
            const id = keys[i];
            const baseId = this.safeStringUpper (market, 'baseCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quoteId = this.safeStringUpper (market, 'counterCurrency');
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': market['priceDecimals'],
                'amount': market['amountDecimals'],
                'cost': market['amountDecimals'],
            };
            const cost = this.safeFloat (market, 'minAmount');
            result.push ({
                'id': id,
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
        await this.loadMarkets ();
        const tickers = await this.publicGetPublicTickerAll ();
        // {
        //     "status": "ok",
        //     "timestamp": 1572945773,
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
        const result = [];
        const keys = Object.keys (tickers);
        for (let i = 0; i < keys.length; i += 1) {
            const symbolId = keys[i];
            const ticker = tickers[symbolId];
            if (symbolId !== 'status' && symbolId !== 'timestamp') {
                const symbol = this.findSymbol (symbolId);
                const market = this.markets[symbol];
                result.push (this.parseTicker (ticker, market));
            }
        }
        return this.indexBy (result, 'symbol');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.markets[symbol];
        const ticker = await this.publicGetPublicTickerPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
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
        return this.parseTicker (ticker, market);
    }

    async fetchCurrencies (params = {}) {
        const currenciesResponse = await this.publicGetPublicCurrencyAll ();
        // {
        //     "status": "ok",
        //     "timestamp": 1572945773,
        //     "currencies": {
        //         "BTC": {
        //             "canWithdraw": true,
        //             "ethValue": "50.00000000",
        //             "namePlural": "Bitcoins",
        //             "minimalOrder": "0.0001",
        //             "withdrawalFee": "0.0003",
        //             "btcValue": "1.00000000",
        //             "decimals": 8,
        //             "name": "Bitcoin",
        //             "usdtValue": "9302.93000000"
        //         },
        //         ...
        //     },
        // },
        const currencies = currenciesResponse['currencies'];
        // Currencies are returned as a dict (historical reasons)
        const keys = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < keys.length; i += 1) {
            const currencySymbol = keys[i];
            const currency = currencies[currencySymbol];
            result[currencySymbol] = {
                'id': currencySymbol,
                'name': this.safeString (currency, 'name'),
                'code': currencySymbol,
                'precision': this.safeInteger (currency, 'decimals'),
                'info': currency,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderbook = await this.publicGetPublicOrderBookPair (this.extend ({
            'pair': market['id'],
        }, params));
        // {
        //     "timestamp":1573031500,
        //     "status":"ok",
        //     "asks":[
        //         [
        //             "0.02126453",
        //             "192.94"
        //         ],
        //         [
        //             "0.02322024",
        //             "192.95"
        //         ],
        //         ...
        //     ],
        //     "bids":[
        //         [
        //             "0.00486816",
        //             "192.75"
        //         ],
        //         [
        //             "0.02811401",
        //             "192.56"
        //         ],
        //         ...
        //     ]
        // }
        const timestamp = this.safeTimestamp (orderbook, 'timestamp');
        const parsedOrderbook = this.parseOrderBook (orderbook, timestamp);
        parsedOrderbook['nonce'] = this.nonce ();
        return parsedOrderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetPublicTradesHourPair (this.extend ({
            'pair': market['id'],
        }, params));
        // {
        //     "timestamp":1573031391,
        //     "trades":[
        //         {
        //             "datetime":1573028240,
        //             "price":"192.93",
        //             "id":3655654,
        //             "amount":"1.51166933",
        //             "type":"buy"
        //         },
        //         ...
        //     ],
        //     "status":"ok"
        // }
        console.log (response['trades']);
        return this.parseTrades (response['trades'], market, since, limit);
    }

    /* Parse functions */

    parseTicker (ticker, market = undefined) {
        const symbol = this.findSymbol (this.safeString (market, 'symbol'));
        const lastPrice = this.safeFloat (ticker, 'last');
        const openPrice = this.safeFloat (ticker, 'open');
        const change = lastPrice - openPrice;
        let percentage = 0;
        if (openPrice !== 0) {
            percentage = (change / openPrice) * 100;
        }
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
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
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': openPrice,
            'close': lastPrice,
            'last': lastPrice,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'datetime');
        const id = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = this.safeString (market, 'symbol');
        }
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'info': trade,
            'order': undefined,
            'takerOrMaker': undefined,
            'type': undefined,
            'fee': undefined,
        };
    }
};
