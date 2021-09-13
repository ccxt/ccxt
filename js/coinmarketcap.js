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
            'countries': [ 'US' ],
            'has': {
                'cancelOrder': false,
                'CORS': true,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'editOrder': false,
                'privateAPI': false,
                'fetchBalance': false,
                'fetchCurrencies': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOHLCV': false,
                'fetchOrderBook': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87182086-1cd4cd00-c2ec-11ea-9ec4-d0cf2a2abf62.jpg',
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
            'BigONE Token': 'BigONE Token', // conflict with Harmony (ONE)
            'Bitgem': 'Bitgem',
            'BlazeCoin': 'BlazeCoin',
            'BlockCAT': 'BlockCAT',
            'Blocktrade Token': 'Blocktrade Token',
            'BOX Token': 'BOX Token', // conflict with BOX (ContentBox)
            'Catcoin': 'Catcoin',
            'CanYaCoin': 'CanYaCoin', // conflict with CAN (Content and AD Network)
            'CryptoBossCoin': 'CryptoBossCoin', // conflict with CBC (CashBet Coin)
            'Comet': 'Comet', // conflict with CMT (CyberMiles)
            'CPChain': 'CPChain',
            'CrowdCoin': 'CrowdCoin', // conflict with CRC CryCash
            'Cryptaur': 'Cryptaur', // conflict with CPT = Contents Protocol https://github.com/ccxt/ccxt/issues/4920 and https://github.com/ccxt/ccxt/issues/6081
            'Cubits': 'Cubits', // conflict with QBT (Qbao)
            'DAO.Casino': 'DAO.Casino', // conflict with BET (BetaCoin)
            'DefiBox': 'DefiBox', // conflict with BOX (ContentBox)
            'E-Dinar Coin': 'E-Dinar Coin', // conflict with EDR Endor Protocol and EDRCoin
            'EDRcoin': 'EDRcoin', // conflict with EDR Endor Protocol and E-Dinar Coin
            'ENTCash': 'ENTCash', // conflict with ENT (Eternity)
            'FairCoin': 'FairCoin', // conflict with FAIR (FairGame) https://github.com/ccxt/ccxt/pull/5865
            'Fabric Token': 'Fabric Token',
            // 'GET Protocol': 'GET Protocol',
            'GHOSTPRISM': 'GHOSTPRISM', // conflict with GHOST
            'Global Tour Coin': 'Global Tour Coin', // conflict with GTC (Game.com)
            'GuccioneCoin': 'GuccioneCoin', // conflict with GCC (Global Cryptocurrency)
            'HarmonyCoin': 'HarmonyCoin', // conflict with HMC (Hi Mutual Society)
            'Harvest Masternode Coin': 'Harvest Masternode Coin', // conflict with HC (HyperCash)
            'HOT Token': 'HOT Token',
            'Hydro Protocol': 'Hydro Protocol', // conflict with HOT (Holo)
            'Huncoin': 'Huncoin', // conflict with HNC (Helleniccoin)
            'iCoin': 'iCoin',
            'Infinity Economics': 'Infinity Economics', // conflict with XIN (Mixin)
            'IQ.cash': 'IQ.cash', // conflict with IQ (Everipedia)
            'KingN Coin': 'KingN Coin', // conflict with KNC (Kyber Network)
            'LiteBitcoin': 'LiteBitcoin', // conflict with LBTC (LightningBitcoin)
            'Maggie': 'Maggie',
            'Menlo One': 'Menlo One', // conflict with Harmony (ONE)
            'Mobilian Coin': 'Mobilian Coin', // conflict with Membrana (MBN)
            'Monarch': 'Monarch', // conflict with MyToken (MT)
            'MTC Mesh Network': 'MTC Mesh Network', // conflict with MTC Docademic doc.com Token https://github.com/ccxt/ccxt/issues/6081 https://github.com/ccxt/ccxt/issues/3025
            'IOTA': 'IOTA', // a special case, most exchanges list it as IOTA, therefore we change just the Coinmarketcap instead of changing them all
            'NetCoin': 'NetCoin',
            'PCHAIN': 'PCHAIN', // conflict with PAI (Project Pai)
            'Penta': 'Penta', // conflict with PNT (pNetwork)
            'Plair': 'Plair', // conflict with PLA (PLANET)
            'PlayChip': 'PlayChip', // conflict with PLA (PLANET)
            'Polcoin': 'Polcoin',
            'PutinCoin': 'PutinCoin', // conflict with PUT (Profile Utility Token)
            'Rcoin': 'Rcoin', // conflict with RCN (Ripio Credit Network)
            // https://github.com/ccxt/ccxt/issues/6081
            // https://github.com/ccxt/ccxt/issues/3365
            // https://github.com/ccxt/ccxt/issues/2873
            'SBTCT': 'SiamBitcoin', // conflict with sBTC
            'Super Bitcoin': 'Super Bitcoin', // conflict with sBTC
            'TerraCredit': 'TerraCredit', // conflict with CREDIT (PROXI)
            'Themis': 'Themis', // conflict with GET (Guaranteed Entrance Token, GET Protocol)
            'UNI COIN': 'UNI COIN', // conflict with UNI (Uniswap)
            'UNICORN Token': 'UNICORN Token', // conflict with UNI (Uniswap)
            'Universe': 'Universe', // conflict with UNI (Uniswap)
        };
        return this.safeValue (currencies, name, base);
    }

    async fetchMarkets (params = {}) {
        const request = {
            'limit': 0,
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const currencies = this.currencyCodes;
            for (let j = 0; j < currencies.length; j++) {
                const quote = currencies[j];
                const quoteId = quote.toLowerCase ();
                const baseId = market['id'];
                const base = this.currencyCode (market['symbol'], market['name']);
                const symbol = base + '/' + quote;
                const id = baseId + '/' + quoteId;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': market,
                    'active': undefined,
                    'precision': this.precision,
                    'limits': this.limits,
                });
            }
        }
        return result;
    }

    async fetchGlobal (currency = 'USD') {
        await this.loadMarkets ();
        const request = {};
        if (currency) {
            request['convert'] = currency;
        }
        return await this.publicGetGlobal (request);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeTimestamp (ticker, 'last_updated');
        if (timestamp === undefined) {
            timestamp = this.milliseconds ();
        }
        const change = this.safeNumber (ticker, 'percent_change_24h');
        let last = undefined;
        let symbol = undefined;
        let volume = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            const priceKey = 'price_' + market['quoteId'];
            last = this.safeNumber (ticker, priceKey);
            const volumeKey = '24h_volume_' + market['quoteId'];
            volume = this.safeNumber (ticker, volumeKey);
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
            'change': undefined,
            'percentage': change,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume,
            'info': ticker,
        };
    }

    async fetchTickers (currency = 'USD', params = {}) {
        await this.loadMarkets ();
        const request = {
            'limit': 10000,
        };
        if (currency) {
            request['convert'] = currency;
        }
        const response = await this.publicGetTicker (this.extend (request, params));
        const result = {};
        for (let t = 0; t < response.length; t++) {
            const ticker = response[t];
            const currencyId = currency.toLowerCase ();
            const id = ticker['id'] + '/' + currencyId;
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'convert': market['quote'],
            'id': market['baseId'],
        };
        const response = await this.publicGetTickerId (this.extend (request, params));
        const ticker = response[0];
        return this.parseTicker (ticker, market);
    }

    async fetchCurrencies (params = {}) {
        const request = {
            'limit': 0,
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const name = this.safeString (currency, 'name');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.currencyCode (id, name);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': true,
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const error = this.safeValue (response, 'error', false);
        if (error) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
    }
};
