'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class anxpro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'anxpro',
            'name': 'ANXPro',
            'countries': [ 'JP', 'SG', 'HK', 'NZ' ],
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'fetchCurrencies': true,
                'fetchOHLCV': false,
                'fetchTrades': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
                'api': {
                    'public': 'https://anxpro.com/api/2',
                    'private': 'https://anxpro.com/api/2',
                    'v3public': 'https://anxpro.com/api/3',
                },
                'www': 'https://anxpro.com',
                'doc': [
                    'https://anxv2.docs.apiary.io',
                    'https://anxv3.docs.apiary.io',
                    'https://anxpro.com/pages/api',
                ],
            },
            'api': {
                'v3public': {
                    'get': [
                        'currencyStatic',
                    ],
                },
                'public': {
                    'get': [
                        '{currency_pair}/money/ticker',
                        '{currency_pair}/money/depth/full',
                        '{currency_pair}/money/trade/fetch', // disabled by ANXPro
                    ],
                },
                'private': {
                    'post': [
                        '{currency_pair}/money/order/add',
                        '{currency_pair}/money/order/cancel',
                        '{currency_pair}/money/order/quote',
                        '{currency_pair}/money/order/result',
                        '{currency_pair}/money/orders',
                        'money/{currency}/address',
                        'money/{currency}/send_simple',
                        'money/info',
                        'money/trade/list',
                        'money/wallet/history',
                    ],
                },
            },
            'httpExceptions': {
                '403': AuthenticationError,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.v3publicGetCurrencyStatic (params);
        const result = {};
        const currencies = response['currencyStatic']['currencies'];
        //       "currencies": {
        //         "HKD": {
        //           "decimals": 2,
        //           "minOrderSize": 1.00000000,
        //           "maxOrderSize": 10000000000.00000000,
        //           "displayDenominator": 1,
        //           "summaryDecimals": 0,
        //           "displayUnit": "HKD",
        //           "symbol": "$",
        //           "type": "FIAT",
        //           "engineSettings": {
        //             "depositsEnabled": false,
        //             "withdrawalsEnabled": true,
        //             "displayEnabled": true,
        //             "mobileAccessEnabled": true
        //           },
        //           "minOrderValue": 1.00000000,
        //           "maxOrderValue": 10000000000.00000000,
        //           "maxMarketOrderValue": 36000.00000000,
        //           "maxMarketOrderSize": 36000.00000000,
        //           "assetDivisibility": 0
        //         },
        //         "ETH": {
        //           "decimals": 8,
        //           "minOrderSize": 0.00010000,
        //           "maxOrderSize": 1000000000.00000000,
        //           "type": "CRYPTO",
        //           "confirmationThresholds": [
        //             { "confosRequired": 30, "threshold": 0.50000000 },
        //             { "confosRequired": 45, "threshold": 10.00000000 },
        //             { "confosRequired": 70 }
        //           ],
        //           "networkFee": 0.00500000,
        //           "engineSettings": {
        //             "depositsEnabled": true,
        //             "withdrawalsEnabled": true,
        //             "displayEnabled": true,
        //             "mobileAccessEnabled": true
        //           },
        //           "minOrderValue": 0.00010000,
        //           "maxOrderValue": 10000000000.00000000,
        //           "maxMarketOrderValue": 10000000000.00000000,
        //           "maxMarketOrderSize": 1000000000.00000000,
        //           "digitalCurrencyType": "ETHEREUM",
        //           "assetDivisibility": 0,
        //           "assetIcon": "/images/currencies/crypto/ETH.svg"
        //         },
        //       },
        const ids = Object.keys (currencies);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            const code = this.commonCurrencyCode (id);
            const engineSettings = this.safeValue (currency, 'engineSettings');
            const depositsEnabled = this.safeValue (engineSettings, 'depositsEnabled');
            const withdrawalsEnabled = this.safeValue (engineSettings, 'withdrawalsEnabled');
            const displayEnabled = this.safeValue (engineSettings, 'displayEnabled');
            const active = depositsEnabled && withdrawalsEnabled && displayEnabled;
            const precision = this.safeInteger (currency, 'decimals');
            const fee = this.safeFloat (currency, 'networkFee');
            let type = this.safeString (currency, 'type');
            if (type !== 'undefined') {
                type = type.toLowerCase ();
            }
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'type': type,
                'active': active,
                'precision': precision,
                'fee': fee,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minOrderSize'),
                        'max': this.safeFloat (currency, 'maxOrderSize'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (currency, 'minOrderValue'),
                        'max': this.safeFloat (currency, 'maxOrderValue'),
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

    async fetchMarkets (params = {}) {
        const response = await this.v3publicGetCurrencyStatic (params);
        //
        //   {
        //     "currencyStatic": {
        //       "currencies": {
        //         "HKD": {
        //           "decimals": 2,
        //           "minOrderSize": 1.00000000,
        //           "maxOrderSize": 10000000000.00000000,
        //           "displayDenominator": 1,
        //           "summaryDecimals": 0,
        //           "displayUnit": "HKD",
        //           "symbol": "$",
        //           "type": "FIAT",
        //           "engineSettings": {
        //             "depositsEnabled": false,
        //             "withdrawalsEnabled": true,
        //             "displayEnabled": true,
        //             "mobileAccessEnabled": true
        //           },
        //           "minOrderValue": 1.00000000,
        //           "maxOrderValue": 10000000000.00000000,
        //           "maxMarketOrderValue": 36000.00000000,
        //           "maxMarketOrderSize": 36000.00000000,
        //           "assetDivisibility": 0
        //         },
        //         "ETH": {
        //           "decimals": 8,
        //           "minOrderSize": 0.00010000,
        //           "maxOrderSize": 1000000000.00000000,
        //           "type": "CRYPTO",
        //           "confirmationThresholds": [
        //             { "confosRequired": 30, "threshold": 0.50000000 },
        //             { "confosRequired": 45, "threshold": 10.00000000 },
        //             { "confosRequired": 70 }
        //           ],
        //           "networkFee": 0.00500000,
        //           "engineSettings": {
        //             "depositsEnabled": true,
        //             "withdrawalsEnabled": true,
        //             "displayEnabled": true,
        //             "mobileAccessEnabled": true
        //           },
        //           "minOrderValue": 0.00010000,
        //           "maxOrderValue": 10000000000.00000000,
        //           "maxMarketOrderValue": 10000000000.00000000,
        //           "maxMarketOrderSize": 1000000000.00000000,
        //           "digitalCurrencyType": "ETHEREUM",
        //           "assetDivisibility": 0,
        //           "assetIcon": "/images/currencies/crypto/ETH.svg"
        //         },
        //       },
        //       "currencyPairs": {
        //         "ETHUSD": {
        //           "priceDecimals": 5,
        //           "engineSettings": {
        //             "tradingEnabled": true,
        //             "displayEnabled": true,
        //             "cancelOnly": true,
        //             "verifyRequired": false,
        //             "restrictedBuy": false,
        //             "restrictedSell": false
        //           },
        //           "minOrderRate": 10.00000000,
        //           "maxOrderRate": 10000.00000000,
        //           "displayPriceDecimals": 5,
        //           "tradedCcy": "ETH",
        //           "settlementCcy": "USD",
        //           "preferredMarket": "ANX",
        //           "chartEnabled": true,
        //           "simpleTradeEnabled": false
        //         },
        //       },
        //     },
        //     "timestamp": "1549840691039",
        //     "resultCode": "OK"
        //   }
        //
        const currencyStatic = this.safeValue (response, 'currencyStatic', {});
        const currencies = this.safeValue (currencyStatic, 'currencies', {});
        const currencyPairs = this.safeValue (currencyStatic, 'currencyPairs', {});
        const result = [];
        const ids = Object.keys (currencyPairs);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = currencyPairs[id];
            //
            //     "ETHUSD": {
            //       "priceDecimals": 5,
            //       "engineSettings": {
            //         "tradingEnabled": true,
            //         "displayEnabled": true,
            //         "cancelOnly": true,
            //         "verifyRequired": false,
            //         "restrictedBuy": false,
            //         "restrictedSell": false
            //       },
            //       "minOrderRate": 10.00000000,
            //       "maxOrderRate": 10000.00000000,
            //       "displayPriceDecimals": 5,
            //       "tradedCcy": "ETH",
            //       "settlementCcy": "USD",
            //       "preferredMarket": "ANX",
            //       "chartEnabled": true,
            //       "simpleTradeEnabled": false
            //     },
            //
            const baseId = this.safeString (market, 'tradedCcy');
            const quoteId = this.safeString (market, 'settlementCcy');
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const baseCurrency = this.safeValue (currencies, baseId, {});
            const quoteCurrency = this.safeValue (currencies, quoteId, {});
            const precision = {
                'price': this.safeInteger (market, 'priceDecimals'),
                'amount': this.safeInteger (baseCurrency, 'decimals'),
            };
            const engineSettings = this.safeValue (market, 'engineSettings');
            const displayEnabled = this.safeValue (engineSettings, 'displayEnabled');
            const tradingEnabled = this.safeValue (engineSettings, 'tradingEnabled');
            const active = displayEnabled && tradingEnabled;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'active': active,
                'limits': {
                    'price': {
                        'min': this.safeFloat (market, 'minOrderRate'),
                        'max': this.safeFloat (market, 'maxOrderRate'),
                    },
                    'amount': {
                        'min': this.safeFloat (baseCurrency, 'minOrderSize'),
                        'max': this.safeFloat (baseCurrency, 'maxOrderSize'),
                    },
                    'cost': {
                        'min': this.safeFloat (quoteCurrency, 'minOrderValue'),
                        'max': this.safeFloat (quoteCurrency, 'maxOrderValue'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostMoneyInfo ();
        let balance = response['data'];
        let currencies = Object.keys (balance['Wallets']);
        let result = { 'info': balance };
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let account = this.account ();
            if (currency in balance['Wallets']) {
                let wallet = balance['Wallets'][currency];
                account['free'] = parseFloat (wallet['Available_Balance']['value']);
                account['total'] = parseFloat (wallet['Balance']['value']);
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let response = await this.publicGetCurrencyPairMoneyDepthFull (this.extend ({
            'currency_pair': this.marketId (symbol),
        }, params));
        let orderbook = response['data'];
        let t = parseInt (orderbook['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetCurrencyPairMoneyTicker (this.extend ({
            'currency_pair': this.marketId (symbol),
        }, params));
        let ticker = response['data'];
        let t = parseInt (ticker['dataUpdateTime']);
        let timestamp = parseInt (t / 1000);
        let bid = this.safeFloat (ticker['buy'], 'value');
        let ask = this.safeFloat (ticker['sell'], 'value');
        let baseVolume = parseFloat (ticker['vol']['value']);
        let last = parseFloat (ticker['last']['value']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']['value']),
            'low': parseFloat (ticker['low']['value']),
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['avg']['value']),
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        throw new ExchangeError (this.id + ' switched off the trades endpoint, see their docs at https://docs.anxv2.apiary.io');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let order = {
            'currency_pair': market['id'],
            'amount_int': parseInt (amount * 100000000), // 10^8
        };
        if (type === 'limit') {
            order['price_int'] = parseInt (price * market['multiplier']); // 10^5 or 10^8
        }
        order['type'] = (side === 'buy') ? 'bid' : 'ask';
        let result = await this.privatePostCurrencyPairMoneyOrderAdd (this.extend (order, params));
        return {
            'info': result,
            'id': result['data'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCurrencyPairMoneyOrderCancel ({ 'oid': id });
    }

    getAmountMultiplier (code) {
        const multipliers = {
            'BTC': 100000000,
            'LTC': 100000000,
            'STR': 100000000,
            'XRP': 100000000,
            'DOGE': 100000000,
        };
        const defaultValue = 100;
        return this.safeInteger (multipliers, code, defaultValue);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let multiplier = this.getAmountMultiplier (code);
        let request = {
            'currency': currency,
            'amount_int': parseInt (amount * multiplier),
            'address': address,
        };
        if (tag !== undefined) {
            request['destinationTag'] = tag;
        }
        let response = await this.privatePostMoneyCurrencySendSimple (this.extend (request, params));
        return {
            'info': response,
            'id': response['data']['transactionId'],
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + request;
        if (api === 'public' || api === 'v3public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            let secret = this.base64ToBinary (this.secret);
            // eslint-disable-next-line quotes
            let auth = request + "\0" + body;
            let signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': this.apiKey,
                'Rest-Sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (response === undefined || response === '') {
            return;
        }
        const result = this.safeString (response, 'result');
        if ((result !== undefined) && (result !== 'success')) {
            throw new ExchangeError (this.id + ' ' + body);
        } else {
            const resultCode = this.safeString (response, 'resultCode');
            if ((resultCode !== undefined) && (resultCode !== 'OK')) {
                throw new ExchangeError (this.id + ' ' + body);
            }
        }
    }
};
