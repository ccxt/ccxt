'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class bitkub extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitkub',
            'name': 'bitkub',
            'countries': ['TH'],
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchCurrencies': false,
                'fetchOHLCV': true,
                'withdraw': false,
                'publicAPI': true,
                'privateAPI': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchDepositAddress': true,
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '1h': 3600,
                '4h': 14400,
                '1d': 86400,
            },
            'urls': {
                'logo': 'https://www.bitkub.com/static/images/logo-white.png',
                'api': 'https://api.bitkub.com',
                'www': 'https://www.bitkub.com',
                'doc': 'https://github.com/bitkub/bitkub-official-api-docs',
                'fees': 'https://www.bitkub.com/fee/cryptocurrency',
            },
            'api': {
                'public': {
                    'get': [
                        'api/status',
                        'api/servertime',
                        'api/market/symbols',
                        'api/market/ticker',
                        'api/market/trades',
                        'api/market/bids',
                        'api/market/asks',
                        'api/market/books',
                        'api/market/tradingview',
                        'api/market/depth',
                    ],
                },
                'private': {
                    'post': [
                        'api/market/wallet',
                        'api/market/balances',
                        'api/market/place-bid',
                        'api/market/place-ask',
                        'api/market/place-ask-by-fiat',
                        'api/market/cancel-order',
                        'api/market/my-open-orders',
                        'api/market/my-order-history',
                        'api/market/order-info',
                        'api/crypto/addresses',
                        'api/crypto/withdraw',
                        'api/crypto/deposit-history',
                        'api/crypto/withdraw-history',
                        'api/crypto/generate-address',
                        'api/fiat/accounts',
                        'api/fiat/withdraw',
                        'api/fiat/deposit-history',
                        'api/fiat/withdraw-history',
                        'api/market/wstoken',
                        'api/user/limits',
                        'api/user/trading-credits',
                    ],
                },
            },
            'timeout': 5000,
            'rateLimit': 1000,
            'precision': {
                'price': 2,
                'amount': 8,
                'cost': 2,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.0025,
                    'maker': 0.0025,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetApiMarketSymbols (params);
        const markets = response['result'];
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const currencySymbol = id.split ('_');
            const base = currencySymbol[1];
            const quote = currencySymbol[0];
            const baseId = base.toLowerCase ();
            const quoteId = quote.toLowerCase ();
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': true,
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
                        'min': 10,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostApiMarketBalances (params);
        const markets = response['result'];
        const keyMarkets = Object.keys (markets);
        const result = {};
        const free = {};
        result['info'] = markets;
        for (let i = 0; i < keyMarkets.length; i++) {
            const key = keyMarkets[i];
            const market = markets[key];
            const available = this.safeFloat (market, 'available');
            const reserved = this.safeFloat (market, 'reserved');
            free[key] = available;
            const account = {
                'free': available,
                'used': reserved,
                'total': available + reserved,
            };
            result[key] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 10;
        }
        const request = {
            'sym': this.market_id (symbol),
            'lmt': limit,
        };
        const response = await this.publicGetApiMarketBooks (this.extend (request, params));
        const orderbook = response['result'];
        const lastBidTime = orderbook['bids'][0][1];
        const lastAskTime = orderbook['asks'][0][1];
        const timestamp = (lastBidTime > lastAskTime) ? lastBidTime : lastAskTime;
        return this.parseOrderBook (orderbook, timestamp * 1000, 'bids', 'asks', 3, 4);
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'last');
        const change = this.safeFloat (ticker, 'change');
        let open = undefined;
        let average = undefined;
        if ((last !== undefined) && (change !== undefined)) {
            open = last - change;
            average = (last + open) / 2;
        }
        const baseVolume = this.safeFloat (ticker, 'baseVolume');
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume');
        let vwap = undefined;
        if (quoteVolume !== undefined) {
            if ((baseVolume !== undefined) && (baseVolume > 0)) {
                vwap = quoteVolume / baseVolume;
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (ticker, 'prevClose'),
            'change': change,
            'percentage': this.safeFloat (ticker, 'percentChange'),
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': market['id'],
        };
        const response = await this.publicGetApiMarketTicker (this.extend (request, params));
        return this.parseTicker (this.safeValue (response, market['id']), market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetApiMarketTicker (params);
        const keys = Object.keys (response);
        const tickers = [];
        let market = undefined;
        for (let i = 0; i < keys.length; i++) {
            market = this.safeValue (this.markets_by_id, keys[i]);
            if (market !== undefined) {
                tickers.push (this.parseTicker (response[keys[i]], market));
            }
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': market['id'],
            'int': this.timeframes[timeframe],
        };
        const duration = this.timeframes[timeframe];
        const timerange = duration * 1000;
        if (since === undefined) {
            request['to'] = parseInt (this.milliseconds () / 1000);
            request['frm'] = request['to'] - timerange;
        } else {
            request['frm'] = parseInt (since / 1000);
            request['to'] = this.sum (request['frm'], timerange);
        }
        const ohlcv = await this.publicGetApiMarketTradingview (this.extend (request, params));
        const objOHLCV = Object.values (ohlcv['c'] || []);
        const length = objOHLCV.length;
        const result = [];
        for (let i = 0; i < length; i++) {
            const ts = this.safeTimestamp (ohlcv['t'], i);
            const open = ohlcv['o'][i];
            const high = ohlcv['h'][i];
            const low = ohlcv['l'][i];
            const close = ohlcv['c'][i];
            const vol = ohlcv['v'][i];
            result.push ([]);
            const newOHLCV = [ts, open, high, low, close, vol];
            result[i].push (newOHLCV);
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': market['id'],
            'amt': this.amountToPrecision (symbol, amount),
            'rat': this.priceToPrecision (symbol, price),
            'typ': type,
        };
        const method = side === 'buy' ? 'privatePostApiMarketPlaceBid' : 'privatePostApiMarketPlaceAsk';
        const response = await this[method] (this.extend (request, params));
        const order = response['result'];
        const id = this.safeString (order, 'id');
        return {
            'id': id,
            'info': order,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request = {
                'sym': market['id'],
                'id': id,
                'sd': params['sd'],
            };
        } else {
            request = {
                'hash': id,
            };
        }
        return this.privatePostApiMarketCancelOrder (this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': market['id'],
        };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = parseInt (this.milliseconds () / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostApiMarketMyOrderHistory (this.extend (request, params));
        const trades = response['result'];
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            const id = this.safeString (trades[i], 'txn_id');
            const order = this.safeString (trades[i], 'order_id');
            const type = this.safeString (trades[i], 'type');
            const side = this.safeString (trades[i], 'side');
            const takerOrMaker = this.safeValue (trades[i], 'taken_by_me');
            const price = this.safeFloat (trades[i], 'rate');
            const amount = this.safeFloat (trades[i], 'amount');
            const cost = parseFloat (price * amount);
            const fee = this.safeFloat (trades[i], 'fee');
            const timestamp = this.safeTimestamp (trades[i], 'ts');
            result.push ({
                'info': trades[i],
                'id': id,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'symbol': symbol,
                'order': order,
                'type': type,
                'side': side,
                'takerOrMaker': takerOrMaker === true ? 'taker' : 'maker',
                'price': price,
                'amount': amount,
                'cost': cost,
                'fee': fee,
            });
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = trade[0] * 1000;
        let side = undefined;
        side = trade[3].toLowerCase ();
        const price = parseFloat (trade[1]);
        const amount = parseFloat (trade[2]);
        const cost = parseFloat (price * amount);
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'sym': market['id'],
        };
        if (limit === undefined) {
            limit = 1;
        }
        request['lmt'] = limit;
        const response = await this.publicGetApiMarketTrades (this.extend (request, params));
        const trades = response['result'];
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostApiCryptoAddresses (params);
        const accounts = response['result'];
        let currency = undefined;
        let address = undefined;
        let tag = undefined;
        for (let i = 0; i < accounts.length; i++) {
            currency = this.safeString (accounts[i], 'currency');
            if (code === currency) {
                address = this.safeString (accounts[i], 'address');
                tag = this.safeString (accounts[i], 'tag');
                break;
            }
        }
        return {
            'currency': currency,
            'address': address,
            'tag': tag,
            'info': accounts,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + path;
        if (api === 'public') {
            if (params) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const query = this.extend (params, {
                'ts': this.nonce (),
            });
            const request = this.json (query);
            const signature = this.hmac (this.encode (request), this.encode (this.secret));
            body = this.json (this.extend (JSON.parse (request), { 'sig': signature }));
            headers = {
                'X-BTK-APIKEY': this.apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };
        } else {
            url = '/' + path;
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
