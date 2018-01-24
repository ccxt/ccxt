"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const {ExchangeError} = require ('./base/errors');

//  ----initial draft -by jjhesk

module.exports = class coinone extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinone',
            'name': 'CoinOne',
            'countries': 'KR', // Korea
            'rateLimit': 670,
            'version': 'v2',
            'has': {
                'CORS': true,
                'publicAPI': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchTickers': true,
                'fetchOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/629338/35319687-5ca529cc-00fa-11e8-863a-89f169a511e1.png',
                'api': 'https://api.coinone.co.kr/',
                'www': 'https://coinone.co.kr',
                'doc': [
                    'http://doc.coinone.co.kr/'
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook/',
                        'trades/',
                        'ticker/'
                    ],
                },
                'private': {
                    'post': [
                        'account/btc_deposit_address/',
                        'account/balance/',
                        'account/daily_balance/',
                        'account/user_info/',
                        'account/virtual_account/',
                        'order/cancel_all/',
                        'order/cancel/',
                        'order/limit_buy/',
                        'order/limit_sell/',
                        'order/complete_orders/',
                        'order/limit_orders/',
                        'order/order_info/',
                        'transaction/auth_number/',
                        'transaction/history/',
                        'transaction/krw/history/',
                        'transaction/btc/',
                        'transaction/coin/',
                    ],
                },
            },
            'markets': {
                'BTC/KRW': {
                    'id': 'btc_krw',
                    'symbol': 'BTC/KRW',
                    'base': 'BTC',
                    'quote': 'KRW',
                },
                'BTG/KRW': {
                    'id': 'btg_krw',
                    'symbol': 'BTG/KRW',
                    'base': 'BTG',
                    'quote': 'KRW',
                },
                'IOT/KRW': {
                    'id': 'iota_krw',
                    'symbol': 'IOT/KRW',
                    'base': 'IOT',
                    'quote': 'KRW',
                },
                'LTC/KRW': {
                    'id': 'ltc_krw',
                    'symbol': 'LTC/KRW',
                    'base': 'LTC',
                    'quote': 'KRW',
                },
                'QTUM/KRW': {
                    'id': 'qtum_krw',
                    'symbol': 'QTUM/KRW',
                    'base': 'QTUM',
                    'quote': 'KRW',
                },
                'XRP/KRW': {
                    'id': 'xrp_krw',
                    'symbol': 'XRP/KRW',
                    'base': 'XRP',
                    'quote': 'KRW',
                },
                'ETH/KRW': {
                    'id': 'eth_krw',
                    'symbol': 'ETH/KRW',
                    'base': 'ETH',
                    'quote': 'KRW',
                },
                'ETC/KRW': {
                    'id': 'etc_krw',
                    'symbol': 'ETC/KRW',
                    'base': 'ETC',
                    'quote': 'KRW',
                },
                'BCH/KRW': {
                    'id': 'bch_krw',
                    'symbol': 'BCH/KRW',
                    'base': 'BCH',
                    'quote': 'KRW',
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.1 / 100,
                    'maker': 0.1 / 100,
                    'tiers': {
                        'taker': [
                            [ 100000000, 0.1 / 100 ],
                            [ 10000000000, 0.09 / 100 ],
                            [ 50000000000, 0.08 / 100 ],
                            [ 100000000000, 0.07 / 100 ],
                            [ 200000000000, 0.06 / 100 ],
                            [ 300000000000, 0.05 / 100 ],
                            [ 400000000000, 0.04 / 100 ],
                            [ 500000000000, 0.03 / 100 ],
                            [ 999900000000000, 0.02 / 100 ],
                        ],
                        'maker': [
                            [ 100000000, 0.1 / 100 ],
                            [ 10000000000, 0.08 / 100 ],
                            [ 50000000000, 0.06 / 100 ],
                            [ 100000000000, 0.04 / 100 ],
                            [ 200000000000, 0.02 / 100 ],
                            [ 300000000000, 0.01 / 100 ],
                            [ 400000000000, 0 ],
                            [ 500000000000, 0 ],
                            [ 999900000000000, 0 ],
                        ],
                    },
                },
            }
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privateGetUserExchangeBankSummary ();
        let balance = response[ 'message' ];
        let coin = {
            'free': balance[ 'availableCoinBalance' ],
            'used': balance[ 'pendingCoinBalance' ],
            'total': balance[ 'totalCoinBalance' ],
        };
        let fiat = {
            'free': balance[ 'availableFiatBalance' ],
            'used': balance[ 'pendingFiatBalance' ],
            'total': balance[ 'totalFiatBalance' ],
        };
        let result = {
            'info': balance,
            'BTC': coin,
            'INR': fiat,
        };
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        let bids = await this.publicGetExchangeBidOrders (params);
        let asks = await this.publicGetExchangeAskOrders (params);
        let orderbook = {
            'bids': bids[ 'message' ],
            'asks': asks[ 'message' ],
        };
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'rate', 'vol');
    }

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetExchangeTicker (params);
        let ticker = response[ 'message' ];
        let timestamp = ticker[ 'timestamp' ];
        let baseVolume = parseFloat (ticker[ 'coinvolume' ]);
        if (symbol === 'BTC/INR') {
            let satoshi = 0.00000001;
            baseVolume = baseVolume * satoshi;
        }
        let quoteVolume = parseFloat (ticker[ 'fiatvolume' ]) / 100;
        let vwap = quoteVolume / baseVolume;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker[ 'high' ]) / 100,
            'low': parseFloat (ticker[ 'low' ]) / 100,
            'bid': parseFloat (ticker[ 'bid' ]) / 100,
            'ask': parseFloat (ticker[ 'ask' ]) / 100,
            'vwap': vwap,
            'open': parseFloat (ticker[ 'open' ]) / 100,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker[ 'lastPrice' ]) / 100,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, symbol = undefined) {
        let timestamp = trade[ 'time' ];
        let side = (trade[ 'ordType' ] == 'bid') ? 'buy' : 'sell';
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'rate') / 100,
            'amount': this.safeFloat (trade, 'vol') / 100000000,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchMarkets () {
        let markets = await this.publicGetTickerAll ();
        let currencies = Object.keys (markets['data']);
        let result = [];
        for (let i = 0; i < currencies.length; i++) {
            let id = currencies[i];
            if (id !== 'date') {
                let market = markets['data'][id];
                let base = id;
                let quote = 'KRW';
                let symbol = id + '/' + quote;
                result.push (this.extend (this.fees['trading'], {
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'info': market,
                    'lot': undefined,
                    'active': true,
                    'precision': {
                        'amount': undefined,
                        'price': undefined,
                    },
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
                    },
                }));
            }
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let result = await this.publicGetExchangeTrades (params);
        if ('message' in result) {
            let trades = result[ 'message' ];
            return this.parseTrades (trades, symbol);
        }
    }

    async createOrder (market, type, side, amount, price = undefined, params = {}) {
        let method = 'privatePutUserExchange';
        let order = {};
        if (type === 'market') {
            method += 'Instant' + this.capitalize (side);
            if (side === 'buy')
                order[ 'maxFiat' ] = amount;
            else
                order[ 'maxVol' ] = amount;
        } else {
            let direction = (side === 'buy') ? 'Bid' : 'Ask';
            method += direction + 'New';
            order[ 'rate' ] = price;
            order[ 'vol' ] = amount;
        }
        let response = await this[ method ] (this.extend (order, params));
        return {
            'info': response,
            'id': response[ 'message' ][ 'orderID' ],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        throw new ExchangeError (this.id + ' cancelOrder () is not fully implemented yet');
        let method = 'privateDeleteUserExchangeAskCancelOrderId'; // TODO fixme, have to specify order side here
        return await this[ method ] ({'orderID': id});
    }

    /**
     * coin one sign request path
     * @param path string enable
     * @param api the api is now up
     * @param method
     * @param params
     * @param headers
     * @param body
     * @returns {{url: string, method: string, body: undefined, headers: {}}}
     */
    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls[ 'api' ] + '/' + request;
        let headers = {};
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.json (query);
            let auth = '/api' + '/' + request + nonce + body;
            let payload = {
                'access_token': this.apiKey,
                // 'currency': currency,
                'nonce': Date.now ()
            };
            let signature = this.hmac (this.encode (payload), this.encode (this.secret.toUpperCase ()), 'sha512', 'hex');
            headers = {
                'content-type': 'application/json',
                'X-COINONE-PAYLOAD': payload,
                'X-COINONE-SIGNATURE': signature
            };
        }
        return {'url': url, 'method': method, 'body': body, 'headers': headers};
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code === 200) {
            if ((body[ 0 ] === '{') || (body[ 0 ] === '[')) {
                let response = JSON.parse (body);
                if ('success' in response) {
                    let success = response[ 'success' ];
                    if (! success) {
                        throw new ExchangeError (this.id + ' error returned: ' + body);
                    }
                    if (! ('message' in response)) {
                        throw new ExchangeError (this.id + ' malformed response: no "message" in response: ' + body);
                    }
                } else {
                    throw new ExchangeError (this.id + ' malformed response: no "success" in response: ' + body);
                }
            } else {
                // if not a JSON response
                throw new ExchangeError (this.id + ' returned a non-JSON reply: ' + body);
            }
        }
    }
}
