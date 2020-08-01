'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported, BadRequest, PermissionDenied, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class remitano extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'remitano',
            'name': 'Remitano',
            'countries': [ 'VN', 'NG', 'MY', 'CN', 'KH' ],
            'rateLimit': 500, // milliseconds
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': false,
                'fetchOrderBook': true,
                'fetchTicker': false,
                'fetchTrades': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/59945063/89111386-54fca500-d47f-11ea-9304-397e37c3ad72.png',
                'api': 'https://api.remitano.com/api/v1',
                'www': 'https://remitano.com/',
                'referral': 'https://remitano.com/btc/?utm_source=github&utm_medium=ccxt&utm_campaign=github-featured-exchange',
                'doc': 'https://developers.remitano.com/',
            },
            'api': {
                'public': {
                    'get': [
                        'altcoins',
                        'rates/ads',
                        'rates/exchange',
                        'markets/{symbol}/order_book',
                    ],
                },
                'private': {
                    'get': [
                        'users/coin_accounts',
                        'coin_accounts/me',
                    ],
                    'post': [
                        'offers',
                        'coin_withdrawals',
                    ],
                    'put': [
                        'my_offers/{id}/disable',
                    ],
                },
            },
            // guide to get key: https://developers.remitano.com/docs/guides/generate-new-key
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                '400': BadRequest,
                '401': PermissionDenied,
                '404': OrderNotFound,
            },
        });
    }

    defaultCoins () {
        return ['btc', 'eth', 'usdt', 'bch', 'ltc', 'xrp'];
    }

    defaultCoinCurrencies () {
        const result = {};
        const defaultCoins = this.defaultCoins ();
        const defaultCoinsLength = defaultCoins.length;
        for (let i = 0; i < defaultCoinsLength; i++) {
            const coin = defaultCoins[i];
            const code = this.safeCurrencyCode (coin);
            result[code] = {
                'id': coin,
                'code': code,
                'name': coin,
                'active': true,
                'fee': undefined,
                'precision': undefined,
                'type': 'crypto',
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
                    'info': coin,
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = 50;
        }
        const response = await this.publicGetMarketsSymbolOrderBook (this.extend (request, params));
        // {
        //     "bids": [...],
        //     "asks": [...]
        // }
        return this.parseOrderBook (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type !== 'limit') {
            throw new NotSupported (this.id + ' not supported type ' + type + 'for create order, please use type: limit');
        }
        const coinCurrency = this.currency (market.base);
        const fiatCurrency = this.currency (market.quote);
        const request = {
            'payment_method': 'fiat_wallet',
            'coin_currency': coinCurrency.code.toLowerCase (),
            'currency': fiatCurrency.code,
            'offer_type': side,
            'price': price,
            'total_amount': amount,
        };
        const response = await this.privatePostOffers (this.extend (request, params));
        return {
            'id': this.safeString (response, 'id'),
            'clientOrderId': undefined,
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'status': this.safeString (response, 'status'),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': undefined,
            'average': undefined,
            'remaining': undefined,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': parseInt (id),
        };
        const response = await this.privatePutMyOffersIdDisable (this.extend (request, params));
        return {
            'id': id,
            'info': response,
            'status': 'canceled',
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUsersCoinAccounts (params);
        // [{
        //     user_id: 1860848,
        //     coin_address_channel: 'coin_address_channel_1860848',
        //     formatted_address: '3KDvouReT7nmKNuvhNoj9WfLWsPvXCxsN7',
        //     balance: 0,
        //     frozen_balance: 0,
        //     available_balance: 0,
        //     available_withdrawable_balance: 0,
        //     type: 'coin',
        //     coin_currency: 'btc',
        //     currency: 'btc',
        //     equivalent_btc_balance: 0,
        //     address_with_type_arr: [ { type: 'btc', address: '3KDvouReT7nmKNuvhNoj9WfLWsPvXCxsN7' } ]
        // },...]
        const accountsLength = response.length;
        const result = { 'info': response };
        for (let i = 0; i < accountsLength; i++) {
            const data = response[i];
            const account = this.account ();
            const currencyId = this.safeString (data, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            account['free'] = this.safeFloat (data, 'available_withdrawable_balance');
            account['used'] = this.safeFloat (data, 'frozen_balance');
            account['total'] = this.safeFloat (data, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchCurrencies (params = {}) {
        // default coins
        const result = this.defaultCoinCurrencies ();
        // alt coins
        const altcoins = await this.publicGetAltcoins (params);
        // [
        //     {
        //         "currency": "bnb",
        //         "name": "Binance Coin",
        //         "symbol": null,
        //         "default_exchange": "binance_BNBUSD",
        //         "close_prices_7_days": [],
        //         "one_day_volume": 1378092503.05929
        //     }
        // ]
        const altcoinsLength = altcoins.length;
        for (let i = 0; i < altcoinsLength; i++) {
            const currency = altcoins[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'name': this.safeString (currency, 'name'),
                'active': true,
                'fee': undefined,
                'precision': undefined,
                'type': 'crypto',
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
                    'info': currency,
                },
            };
        }
        // fiats
        const fiats = await this.publicGetRatesAds (params);
        // [{
        //     "ae": {
        //         "currency": "AED",
        //         "btc_bid": null,
        //         "btc_ask": null,
        //         "eth_bid": 1416.732669,
        //         "eth_ask": null,
        //         "usdt_bid": 3.6333,
        //         "usdt_ask": null,
        //         "bch_bid": null,
        //         "bch_ask": null,
        //         "ltc_bid": null,
        //         "ltc_ask": null,
        //         "xrp_bid": null,
        //         "xrp_ask": null
        //     }
        // },...]
        const countryCodes = Object.keys (fiats);
        const countryCodesLength = countryCodes.length;
        for (let i = 0; i < countryCodesLength; i++) {
            const currency = fiats[countryCodes[i]];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'name': id,
                'active': true,
                'fee': undefined,
                'precision': undefined,
                'type': 'fiat',
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
                    'info': currency,
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const result = [];
        const defaults = this.defaultCoins ();
        const countries = await this.publicGetRatesAds (params);
        // {
        //     "ae": {
        //         "currency": "AED",
        //         "btc_bid": null,
        //         "btc_ask": null,
        //         "eth_bid": 1416.732669,
        //         "eth_ask": null,
        //         "usdt_bid": 3.6333,
        //         "usdt_ask": null,
        //         "bch_bid": null,
        //         "bch_ask": null,
        //         "ltc_bid": null,
        //         "ltc_ask": null,
        //         "xrp_bid": null,
        //         "xrp_ask": null
        //     }
        // }
        const countryKeys = Object.keys (countries);
        for (let i = 0; i < countryKeys.length; i++) {
            const country = countries[countryKeys[i]];
            for (let i = 0; i < defaults.length; i++) {
                // create order only have COIN/FIAT
                const baseId = defaults[i];
                const quoteId = this.safeString (country, 'currency');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const id = base + quote;
                const symbol = base + '/' + quote;
                const active = true;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': active,
                    'info': country,
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
                    },
                });
            }
        }
        return result;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin_withdrawal[coin_address]': address,
            'coin_withdrawal[coin_amount]': parseFloat (amount),
            'coin_withdrawal[coin_currency]': currency.code.toLowerCase (),
        };
        if (tag !== undefined) {
            request['coin_withdrawal[destination_tag]'] = tag;
        }
        const response = await this.privatePostCoinWithdrawals (this.extend (request, params));
        return {
            'id': this.safeString (response, 'id'),
            'info': { 'withdraw': response, 'confirm': 'You need to click confirm on your trusted devices' },
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            request += '?' + this.urlencode (query);
        }
        const url = this.urls['api'] + '/' + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const date = this.rfc2616 (this.milliseconds ());
            let hashedBody = '';
            if (body) {
                hashedBody = this.hash (this.json (body), 'md5', 'base64');
            }
            const raw = method.toUpperCase () + ',application/json,' + hashedBody + ',/api/v1/' + request + ',' + date;
            const signature = this.hmac (raw, this.secret, 'sha1', 'base64');
            headers = {
                'Content-Type': 'application/json',
                'Content-MD5': hashedBody,
                'DATE': date,
                'Authorization': 'APIAuth ' + this.apiKey + ':' + signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
