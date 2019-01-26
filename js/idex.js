'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class idex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'idex',
            'name': 'IDEX',
            'countries': [ 'US' ],
            'rateLimit': 1500,
            'version': '0',
            'requiresWeb3': true,
            'has': {
                'CORS': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchMarkets': true,
                'fetchBalance': true,
                'fetchContractAddress': true,
                'createOrder': true,
                'getCurrency': true,
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30', // default
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'urls': {
                'test': 'https://api.idex.market/',
                'logo': 'https://oracletimes.com/wp-content/uploads/2018/05/IDEX.market.png',
                'api': 'https://api.idex.market/',
                'www': 'https://idex.market/',
                'doc': [
                    'https://github.com/AuroraDAO/idex-api-docs',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'returnCurrencies', // Available Currency Symbols
                    ],
                },
                'private': {
                    'get': [
                        'apiKey',
                        'returnContractAddress', // return address of wallet
                    ],
                    'post': [
                        'apiKey',
                        'apiKey/disable',
                        'apiKey/enable',
                        'returnTicker', // Ticker for particular symbol
                        'returnOrderBook', // Return order book for a symbol
                        'order', // Create new order
                        'returnCompleteBalances', // return Complete Balance
                        'returnOrderTrades', // return order for giver orderHash
                        'returnOpenOrders', // return open orders for a particular address & market
                        'cancel', // cancel the order by orderHash
                    ],
                    'put': [],
                    'delete': [],
                    'patch': [],
                },
            },
            'fees': {},
            'options': {},
            'exceptions': {},
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetReturnCurrencies ();
        let result = [];
        let keys = Object.keys (markets);
        for (let p = 0; p < keys.length; p++) {
            let key = keys[p];
            let value = markets[key];
            if (key !== 'ETH') {
                let base = 'ETH';
                let baseId = '0x0000000000000000000000000000000000000000';
                let quote = key;
                let quoteId = value['address'];
                let id = baseId + '/' + quoteId;
                let symbol = base + '/' + quote;
                let lot = 0;
                let step = 0;
                let precision = {
                    'price': value['decimals'],
                    'amount': value['decimals'],
                };
                let taker = 'None';
                let maker = 'None';
                result.push ({
                    'info': value,
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': 'True',
                    'lot': lot,
                    'step': step,
                    'taker': taker,
                    'maker': maker,
                    'precision': precision,
                    'limits': {
                        'amount': {
                            'min': lot,
                            'max': 'None',
                        },
                        'price': {
                            'min': step,
                            'max': 'None',
                        },
                        'cost': {
                            'min': lot * step,
                            'max': 'None',
                        },
                    },
                });
            }
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = '';
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let baseVolume = this.safeFloat (ticker, 'baseVolume');
        let quoteVolume = this.safeFloat (ticker, 'quoteVolume');
        let open = this.safeFloat (ticker, 'high');
        let last = this.safeFloat (ticker, 'last');
        let change = undefined;
        let percentage = this.safeFloat (ticker, 'percentChange');
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open > 0)
                percentage = change / open * 100;
        }
        let vwap = undefined;
        if (quoteVolume !== undefined)
            if (baseVolume !== undefined)
                if (baseVolume > 0)
                    vwap = quoteVolume / baseVolume;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = { 'market': '' };
        let sym = market['symbol'].replace ('/', '_');
        request['market'] = sym;
        let ticker = await this.privatePostReturnTicker (this.extend (request, params));
        if ('message' in ticker)
            throw new ExchangeError (this.id + ' ' + ticker['message']);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.privatePostReturnTicker (params);
        let result = {};
        let keys = Object.keys (tickers);
        for (let p = 0; p < keys.length; p++) {
            let symbol = keys[p].replace ('_', '/');
            let val = tickers[keys[p]];
            let market = {};
            market['symbol'] = symbol;
            result[symbol] = this.parseTicker (val, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let sym = symbol.replace ('/', '_');
        let orderbook = await this.privatePostReturnOrderBook (this.extend ({
            'market': sym,
            'count': 30,
        }));
        return this.parseOrderBook (orderbook, '', 'bids', 'asks', 'price', 'amount');
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let request = { 'address': this.apiKey };
        let balances = await this.privatePostReturnCompleteBalances (this.extend (request));
        let result = { 'info': balances };
        let keys = Object.keys (balances);
        for (let p = 0; p < keys.length; p++) {
            let currency = keys[p];
            let balance = balances[currency];
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['onOrders']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchContractAddress (params = {}) {
        let response = this.privateGetReturnContractAddress ();
        return response;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let addrRes = await this.fetchContractAddress ();
        let sym = market['id'].split ('/');
        let base = market['base'];
        let tokenBuy = '';
        let tokenSell = '';
        let basedecimal = 18;
        let quotedecimal = 18;
        if (side === 'buy') {
            tokenBuy = sym[1];
            tokenSell = sym[0];
        } else {
            tokenBuy = sym[0];
            tokenSell = sym[1];
        }
        if (base === 'ETH') {
            basedecimal = 18;
            quotedecimal = market['info']['decimals'];
        }
        let sell_quantity = parseFloat (price) * parseFloat (amount);
        let quantity = this.amountToPrecision (symbol, amount);
        let amount_buy = this.toWei (quantity, 'ether', basedecimal);
        let amount_sell = this.toWei (sell_quantity, 'ether', quotedecimal);
        let contractAddress = addrRes['address'];
        let nonceVal = this.milliseconds () * 100000;
        let hash_order = {
            'contractAddress': contractAddress,
            'tokenBuy': tokenBuy,
            'amount_buy': amount_buy,
            'tokenSell': tokenSell,
            'amount_sell': amount_sell,
            'expires': 100000,
            'nonce': nonceVal,
            'address': this.apiKey,
        };
        let esc = this.signZeroExOrderV3 (hash_order, this.secret);
        let request = {
            'tokenBuy': tokenBuy,
            'amountBuy': amount_buy,
            'tokenSell': tokenSell,
            'amountSell': amount_sell,
            'address': this.apiKey,
            'nonce': nonceVal,
            'expires': 100000,
            'r': esc['ecSignature']['r'],
            's': esc['ecSignature']['s'],
            'v': esc['ecSignature']['v'],
        };
        let response = await this.privatePostOrder (this.extend (request));
        return response;
    }

    async editOrder (orderId, symbol, type, side, quantity, price, params = {}) {
        let cancel_order = await this.cancel_order (orderId);
        if (cancel_order['success'] === 1) {
            let idexPrice = 0;
            let quant = 0;
            let priceVal = 0;
            if (side === 'sell') {
                let idexQty = parseFloat (price) * parseFloat (quantity);
                idexPrice = parseFloat (quantity) / parseFloat (idexQty);
                priceVal = idexPrice;
                quant = idexQty;
            }
            let order = this.createOrder (symbol, type, side, quant, priceVal);
            return order;
        } else {
            return cancel_order;
        }
    }

    async cancelOrder (orderHash, symbol = undefined, params = {}) {
        let nonceVal = this.milliseconds () * 100000;
        let hash_order = {
            'orderHash': orderHash,
            'nonce': nonceVal,
        };
        let esc = this.signZeroExOrderV4 (hash_order, this.secret);
        let request = {
            'orderHash': orderHash,
            'address': this.apiKey,
            'nonce': nonceVal,
            'v': esc['ecSignature']['v'],
            'r': esc['ecSignature']['r'],
            's': esc['ecSignature']['s'],
        };
        let response = this.privatePostCancel (this.extend (request));
        return response;
    }

    async getCurrency (currencyVal) {
        let markets = await this.publicGetReturnCurrencies ();
        let keys = Object.keys (markets);
        for (let p = 0; p < keys.length; p++) {
            let currency = keys[p];
            let val = markets[currency];
            if (currencyVal === val['address'])
                return val;
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = path;
        if (method !== 'PUT')
            if (Object.keys (params).length)
                query += '?' + this.urlencode (params);
        let url = this.urls['api'] + query;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let auth = method + query + nonce;
            if (method === 'POST' || method === 'PUT') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                    auth += body;
                }
            }
            headers = {
                'Content-Type': 'application/json',
                'api-nonce': nonce,
                'api-key': this.apiKey,
                'api-signature': this.hmac (this.encode (auth), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
