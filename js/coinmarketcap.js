'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinmarketcap extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinmarketcap',
            'name': 'CoinMarketCap',
            'rateLimit': 10000,
            'version': 'v1',
            'countries': 'US',
            'has': {
                'CORS': true,
                'privateAPI': false,
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'cancelOrder': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchOrderBook': false,
                'fetchOHLCV': false,
                'fetchTrades': false,
                'fetchTickers': true,
                'fetchCurrencies': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg',
                'api': {
                    'public': 'https://api.coinmarketcap.com',
                    'files': 'https://files.coinmarketcap.com',
                    'charts': 'https://graph.coinmarketcap.com',
                },
                'www': 'https://coinmarketcap.com',
                'doc': 'https://coinmarketcap.com/api',
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
            },
            'api': {
                'files': {
                    'get': [
                        'generated/stats/global.json',
                    ],
                },
                'graphs': {
                    'get': [
                        'currencies/{name}/',
                    ],
                },
                'public': {
                    'get': [
                        'ticker/',
                        'ticker/{id}/',
                        'global/',
                    ],
                },
            },
            'currencyCodes': [
                'AUD',
                'BRL',
                'CAD',
                'CHF',
                'CNY',
                'EUR',
                'GBP',
                'HKD',
                'IDR',
                'INR',
                'JPY',
                'KRW',
                'MXN',
                'RUB',
                'USD',
                'BTC',
                'ETH',
                'LTC',
            ],
        });
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        throw new ExchangeError ('Fetching order books is not supported by the API of ' + this.id);
    }

    currencyCode (base, name) {
        const currencies = {
            'ACChain': 'ACChain',
            'AdCoin': 'AdCoin',
            'BatCoin': 'BatCoin',
            'Bitgem': 'Bitgem',
            'BlazeCoin': 'BlazeCoin',
            'BlockCAT': 'BlockCAT',
            'Catcoin': 'Catcoin',
            'CanYaCoin': 'CanYaCoin', // conflict with CAN (Content and AD Network)
            'Comet': 'Comet', // conflict with CMT (CyberMiles)
            'CPChain': 'CPChain',
            'Cubits': 'Cubits', // conflict with QBT (Qbao)
            'DAO.Casino': 'DAO.Casino', // conflict with BET (BetaCoin)
            'ENTCash': 'ENTCash', // conflict with ENT (Eternity)
            'FairGame': 'FairGame',
            'GET Protocol': 'GET Protocol',
            'Global Tour Coin': 'Global Tour Coin', // conflict with GTC (Game.com)
            'GuccioneCoin': 'GuccioneCoin', // conflict with GCC (Global Cryptocurrency)
            'Hi Mutual Society': 'Hi Mutual Society', // conflict with HMC (HarmonyCoin)
            'Huncoin': 'Huncoin', // conflict with HNC (Helleniccoin)
            'iCoin': 'iCoin',
            'Infinity Economics': 'Infinity Economics', // conflict with XIN (Mixin)
            'KingN Coin': 'KingN Coin', // conflict with KNC (Kyber Network)
            'LiteBitcoin': 'LiteBitcoin', // conflict with LBTC (LightningBitcoin)
            'Maggie': 'Maggie',
            'MIOTA': 'IOTA', // a special case, most exchanges list it as IOTA, therefore we change just the Coinmarketcap instead of changing them all
            'NetCoin': 'NetCoin',
            'Polcoin': 'Polcoin',
            'PutinCoin': 'PutinCoin', // conflict with PUT (Profile Utility Token)
            'Rcoin': 'Rcoin', // conflict with RCN (Ripio Credit Network)
        };
        if (name in currencies)
            return currencies[name];
        return base;
    }

    async fetchMarkets () {
        let markets = await this.publicGetTicker ({
            'limit': 0,
        });
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let currencies = this.currencyCodes;
            for (let i = 0; i < currencies.length; i++) {
                let quote = currencies[i];
                let quoteId = quote.toLowerCase ();
                let baseId = market['id'];
                let base = this.currencyCode (market['symbol'], market['name']);
                let symbol = base + '/' + quote;
                let id = baseId + '/' + quoteId;
                if (market['symbol'].indexOf ('dao') >= 0) {
                    console.log (market);
                }
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': market,
                });
            }
        }
        return result;
    }

    async fetchGlobal (currency = 'USD') {
        await this.loadMarkets ();
        let request = {};
        if (currency)
            request['convert'] = currency;
        return await this.publicGetGlobal (request);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        if ('last_updated' in ticker)
            if (ticker['last_updated'])
                timestamp = parseInt (ticker['last_updated']) * 1000;
        let change = undefined;
        if ('percent_change_24h' in ticker)
            if (ticker['percent_change_24h'])
                change = this.safeFloat (ticker, 'percent_change_24h');
        let last = undefined;
        let symbol = undefined;
        let volume = undefined;
        if (market) {
            let priceKey = 'price_' + market['quoteId'];
            if (priceKey in ticker)
                if (ticker[priceKey])
                    last = this.safeFloat (ticker, priceKey);
            symbol = market['symbol'];
            let volumeKey = '24h_volume_' + market['quoteId'];
            if (volumeKey in ticker)
                if (ticker[volumeKey])
                    volume = this.safeFloat (ticker, volumeKey);
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume,
            'info': ticker,
        };
    }

    async fetchTickers (currency = 'USD', params = {}) {
        await this.loadMarkets ();
        let request = {
            'limit': 10000,
        };
        if (currency)
            request['convert'] = currency;
        let response = await this.publicGetTicker (this.extend (request, params));
        let tickers = {};
        for (let t = 0; t < response.length; t++) {
            let ticker = response[t];
            let currencyId = (currency in this.currencies) ? this.currencies[currency]['id'] : currency.toLowerCase ();
            let id = ticker['id'] + '/' + currencyId;
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            tickers[symbol] = this.parseTicker (ticker, market);
        }
        return tickers;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.extend ({
            'convert': market['quote'],
            'id': market['baseId'],
        }, params);
        let response = await this.publicGetTickerId (request);
        let ticker = response[0];
        return this.parseTicker (ticker, market);
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetTicker (this.extend ({
            'limit': 0,
        }, params));
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['symbol'];
            let name = currency['name'];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let precision = 8; // default precision, todo: fix "magic constants"
            let code = this.currencyCode (id, name);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': true,
                'status': 'ok',
                'fee': undefined, // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length)
            url += '?' + this.urlencode (query);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response) {
            if (response['error']) {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
};
