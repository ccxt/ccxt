'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class waves extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'waves',
            'name': 'Waves Exchange',
            'countries': ['CH'], // Switzerland
            'rateLimit': 500,
            'certified': true,
            'pro': false,
            'has': {
                'fetchOrderBook': true,
            },
            'timeframes': {},
            'urls': {
                'api': {
                    'public': 'http://matcher.waves.exchange',
                    'private': 'https://api.waves.exchange/v1',
                }
            },
            'api': {
                'public': {
                    'get': [
                        'matcher/orderbook',
                        'matcher/orderbook/{amountAsset}/{priceAsset}',
                    ],
                },
                'private': {
                    'get': [
                        'deposit/addresses/{code}',
                    ],
                    'post': [
                        'oauth2/token',
                    ]
                },
            },
            'commonCurrencies': {
                'WBTC': 'BTC',
                'WETH': 'ETH',
            }
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMatcherOrderbook (params);
        const markets = this.safeValue (response, 'markets');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const entry = markets[i];
            const baseId = this.safeString (entry, 'amountAssetName');
            const quoteId = this.safeString (entry, 'priceAssetName');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const baseAsset = this.safeString (entry, 'amountAsset');
            const quoteAsset = this.safeString (entry, 'priceAsset');
            const id = baseAsset + '/' + quoteAsset;
            const symbol = base + '/' + quote;
            const amountPrecision = this.safeValue (entry, 'amountAssetInfo');
            const pricePricision = this.safeValue (entry, 'priceAssetInfo');
            const precision = {
                'amount': this.safeInteger (amountPrecision, 'decimals'),
                'price': this.safeInteger (pricePricision, 'decimals'),
            };
            result.push ({
               'symbol': symbol,
               'id': id,
               'base': base,
               'quote': quote,
               'baseId': baseAsset,
               'quoteId': quoteAsset,
               'info': entry,
               'precision': precision,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({
            'amountAsset': market['baseId'],
            'priceAsset': market['quoteId'],
        }, params);
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetMatcherOrderbookAmountAssetPriceAsset (request);
        const timestamp = this.safeInteger (response, 'timestamp');
        const bids = this.parseOrderBookSide (this.safeValue (response, 'bids'), market);
        const asks = this.parseOrderBookSide (this.safeValue (response, 'asks'), market);
        return {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        }
    }

    parseOrderBookSide (bookSide, market = undefined) {
        const precision = market['precision'];
        const amountPrecision = Math.pow (10, precision['amount']);
        const pricePrecision = Math.pow (10, precision['price']);
        const result = [];
        for (let i = 0; i < bookSide.length; i++) {
            const entry = bookSide[i];
            const price = this.safeInteger (entry, 'price', 0) / pricePrecision;
            const amount = this.safeInteger (entry, 'amount', 0) / amountPrecision;
            result.push ([price, amount]);
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        const url = this.urls['api'][api] + '/' + path;
        headers = {
            'Content-type': 'application/x-www-form-urlencoded',
        };
        if (api === 'private') {
            const accessToken = this.safeString (this.options, 'accessToken');
            if (accessToken) {
                headers['Authorization'] = 'Bearer ' + accessToken;
            } else {
                body = this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async getAccessToken () {
        if (!this.safeString (this.options, 'accessToken')) {
            const prefix = 'ffffff01';
            const expiresDelta =  60 * 60 * 24 * 7;
            const seconds = this.seconds () + expiresDelta;
            const clientId = 'waves.exchange';
            const message = 'W:' + clientId + ':' + seconds;
            const messageHex = this.binaryToBase16 (this.stringToBinary (message));
            const payload = prefix + messageHex;
            const hexKey = this.binaryToBase16 (this.base58ToBinary (this.secret));
            const signature = this.eddsa (payload, hexKey, 'ed25519');
            const request = {
                'grant_type': 'password',
                'scope': 'general',
                'username': this.apiKey,
                'password': seconds + ':' + signature,
                'client_id': clientId,
            }
            const response = await this.privatePostOauth2Token (request);
            // { access_token: 'eyJhbGciOXJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWciOiJiaTZiMVhMQlo0M1Q4QmRTSlVSejJBZGlQdVlpaFZQYVhhVjc4ZGVIOEpTM3M3NUdSeEU1VkZVOE5LRUI0UXViNkFHaUhpVFpuZ3pzcnhXdExUclRvZTgiLCJhIjoiM1A4VnpMU2EyM0VXNUNWY2tIYlY3ZDVCb043NWZGMWhoRkgiLCJuYiI6IlciLCJ1c2VyX25hbWUiOiJBSFhuOG5CQTRTZkxRRjdoTFFpU24xNmt4eWVoaml6QkdXMVRkcm1TWjFnRiIsInNjb3BlIjpbImdlbmVyYWwiXSwibHQiOjYwNDc5OSwicGsiOiJBSFhuOG5CQTRTZkxRRjdoTFFpU24xNmt4eWVoaml6QkdXMVRkcm1TWjFnRiIsImV4cCI6MTU5MTk3NTA1NywiZXhwMCI6MTU5MTk3NTA1NywianRpIjoiN2JhOTUxMTMtOGI2MS00NjEzLTlkZmYtNTEwYTc0NjlkOWI5IiwiY2lkIjoid2F2ZXMuZXhjaGFuZ2UifQ.B-XwexBnUAzbWknVN68RKT0ZP5w6Qk1SKJ8usL3OIwDEzCUUX9PjW-5TQHmiCRcA4oft8lqXEiCwEoNfsblCo_jTpRo518a1vZkIbHQk0-13Dm1K5ewGxfxAwBk0g49odcbKdjl64TN1yM_PO1VtLVuiTeZP-XF-S42Uj-7fcO-r7AulyQLuTE0uo-Qdep8HDCk47rduZwtJOmhFbCCnSgnLYvKWy3CVTeldsR77qxUY-vy8q9McqeP7Id-_MWnsob8vWXpkeJxaEsw1Fke1dxApJaJam09VU8EB3ZJWpkT7V8PdafIrQGeexx3jhKKxo7rRb4hDV8kfpVoCgkvFan',
            //   token_type: 'bearer',
            //   refresh_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWciOiJiaTZiMVhMQlo0M1Q4QmRTSlVSejJBZGlQdVlpaFZQYVhhVjc4ZGVIOEpTM3M3NUdSeEU1VkZVOE5LRUI0UXViNkFHaUhpVFpuZ3pzcnhXdExUclRvZTgiLCJhIjoiM1A4VnpMU2EyM0VXNUNWY2tIYlY3ZDVCb043NWZGMWhoRkgiLCJuYiI6IlciLCJ1c2VyX25hbWUiOiJBSFhuOG5CQTRTZkxRRjdoTFFpU24xNmt4eWVoaml6QkdXMVRkcm1TWjFnRiIsInNjb3BlIjpbImdlbmVyYWwiXSwiYXRpIjoiN2JhOTUxMTMtOGI2MS00NjEzLTlkZmYtNTEwYTc0NjlkXWI5IiwibHQiOjYwNDc5OSwicGsiOiJBSFhuOG5CQTRTZkxRRjdoTFFpU24xNmt4eWVoaml6QkdXMVRkcm1TWjFnRiIsImV4cCI6MTU5Mzk2MjI1OCwiZXhwMCI6MTU5MTk3NTA1NywianRpIjoiM2MzZWRlMTktNjI5My00MTNlLWJmMWUtZTRlZDZlYzUzZTgzIiwiY2lkIjoid2F2ZXMuZXhjaGFuZ2UifQ.gD1Qj0jfqayfZpBvNY0t3ccMyK5hdbT7dY-_5L6LxwV0Knan4ndEtvygxlTOczmJUKtnA4T1r5GBFgNMZTvtViKZIbqZNysEg2OY8UxwDaF4VPeGJLg_QXEnn8wBeBQdyMafh9UQdwD2ci7x-saM4tOAGmncAygfTDxy80201gwDhfAkAGerb9kL00oWzSJScldxu--pNLDBUEHZt52MSEel10HGrzvZkkvvSh67vcQo5TOGb5KG6nh65UdJCwr41AVz4fbQPP-N2Nkxqy0TE_bqVzZxExXgvcS8TS0Z82T3ijJa_ct7B9wblpylBnvmyj3VycUzufD6uy8MUGq32D',
            //   expires_in: 604798,
            //   scope: 'general' }
            this.options['accessToken'] = this.safeString (response, 'access_token');
        }
    }
    async fetchDepositAddress (code, params = {}) {
        await this.getAccessToken ();
        const request = this.extend ({
            'code': code,
        }, params);
        const response = await this.privateGetDepositAddressesCode (request);
        return response;
    }
};
