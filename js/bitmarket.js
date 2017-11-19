"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class bitmarket extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmarket',
            'name': 'BitMarket',
            'countries': [ 'PL', 'EU' ],
            'rateLimit': 1500,
            'hasCORS': false,
            'hasFetchOHLCV': true,
            'hasWithdraw': true,
            'timeframes': {
                '90m': '90m',
                '6h': '6h',
                '1d': '1d',
                '1w': '7d',
                '1M': '1m',
                '3M': '3m',
                '6M': '6m',
                '1y': '1y',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg',
                'api': {
                    'public': 'https://www.bitmarket.net',
                    'private': 'https://www.bitmarket.pl/api2/', // last slash is critical
                },
                'www': [
                    'https://www.bitmarket.pl',
                    'https://www.bitmarket.net',
                ],
                'doc': [
                    'https://www.bitmarket.net/docs.php?file=api_public.html',
                    'https://www.bitmarket.net/docs.php?file=api_private.html',
                    'https://github.com/bitmarket-net/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'json/{market}/ticker',
                        'json/{market}/orderbook',
                        'json/{market}/trades',
                        'json/ctransfer',
                        'graphs/{market}/90m',
                        'graphs/{market}/6h',
                        'graphs/{market}/1d',
                        'graphs/{market}/7d',
                        'graphs/{market}/1m',
                        'graphs/{market}/3m',
                        'graphs/{market}/6m',
                        'graphs/{market}/1y',
                    ],
                },
                'private': {
                    'post': [
                        'info',
                        'trade',
                        'cancel',
                        'orders',
                        'trades',
                        'history',
                        'withdrawals',
                        'tradingdesk',
                        'tradingdeskStatus',
                        'tradingdeskConfirm',
                        'cryptotradingdesk',
                        'cryptotradingdeskStatus',
                        'cryptotradingdeskConfirm',
                        'withdraw',
                        'withdrawFiat',
                        'withdrawPLNPP',
                        'withdrawFiatFast',
                        'deposit',
                        'transfer',
                        'transfers',
                        'marginList',
                        'marginOpen',
                        'marginClose',
                        'marginCancel',
                        'marginModify',
                        'marginBalanceAdd',
                        'marginBalanceRemove',
                        'swapList',
                        'swapOpen',
                        'swapClose',
                    ],
                },
            },
            'markets': {
                'BTC/PLN': { 'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
                'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
                'LTC/PLN': { 'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN' },
                'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'LiteMineX/BTC': { 'id': 'LiteMineXBTC', 'symbol': 'LiteMineX/BTC', 'base': 'LiteMineX', 'quote': 'BTC' },
            },
            'fees': {
                'trading': {
                    'maker': 0.0015,
                    'taker': 0.0045,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostInfo ();
        let data = response['data'];
        let balance = data['balances'];
        let result = { 'info': data };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balance['available'])
                account['free'] = balance['available'][currency];
            if (currency in balance['blocked'])
                account['used'] = balance['blocked'][currency];
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetJsonMarketOrderbook (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        return {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetJsonMarketTicker (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        let vwap = parseFloat (ticker['vwap']);
        let baseVolume = parseFloat (ticker['volume']);
        let quoteVolume = baseVolume * vwap;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': vwap,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let side = (trade['type'] == 'bid') ? 'buy' : 'sell';
        let timestamp = trade['date'] * 1000;
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetJsonMarketTrades (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '90m', since = undefined, limit = undefined) {
        return [
            ohlcv['time'] * 1000,
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['vol']),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '90m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'publicGetGraphsMarket' + this.timeframes[timeframe];
        let market = this.market (symbol);
        let response = await this[method] (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let response = await this.privatePostTrade (this.extend ({
            'market': this.marketId (symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params));
        let result = {
            'info': response,
        };
        if ('id' in response['order'])
            result['id'] = response['id'];
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancel ({ 'id': id });
    }

    isFiat (currency) {
        if (currency == 'EUR')
            return true;
        if (currency == 'PLN')
            return true;
        return false;
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let method = undefined;
        let request = {
            'currency': currency,
            'quantity': amount,
        };
        if (this.isFiat (currency)) {
            method = 'privatePostWithdrawFiat';
            if ('account' in params) {
                request['account'] = params['account']; // bank account code for withdrawal
            } else {
                throw new ExchangeError (this.id + ' requires account parameter to withdraw fiat currency');
            }
            if ('account2' in params) {
                request['account2'] = params['account2']; // bank SWIFT code (EUR only)
            } else {
                if (currency == 'EUR')
                    throw new ExchangeError (this.id + ' requires account2 parameter to withdraw EUR');
            }
            if ('withdrawal_note' in params) {
                request['withdrawal_note'] = params['withdrawal_note']; // a 10-character user-specified withdrawal note (PLN only)
            } else {
                if (currency == 'PLN')
                    throw new ExchangeError (this.id + ' requires withdrawal_note parameter to withdraw PLN');
            }
        } else {
            method = 'privatePostWithdraw';
            request['address'] = address;
        }
        let response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api == 'public') {
            url += '/' + this.implodeParams (path + '.json', params);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let query = this.extend ({
                'tonce': nonce,
                'method': path,
            }, params);
            body = this.urlencode (query);
            headers = {
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
