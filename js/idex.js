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
                'createOrder': true,
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
                'logo': 'https://oracconstimes.com/wp-content/uploads/2018/05/IDEX.market.png',
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
                        'returnContractAddress', // return address of walconst
                    ],
                    'post': [
                        'apiKey',
                        'apiKey/disable',
                        'apiKey/enable',
                        'returnTicker', // Ticker for particular symbol
                        'returnOrderBook', // Return order book for a symbol
                        'order', // Create new order
                        'returnCompconsteBalances', // return Compconste Balance
                        'returnOrderTrades', // return order for giver orderHash
                        'returnOpenOrders', // return open orders for a particular address & market
                        'cancel', // cancel the order by orderHash
                    ],
                },
            },
            'options': {},
            'exceptions': {},
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetReturnCurrencies ();
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = markets[key];
            if (key === 'ETH') {
                continue;
            }
            const base = 'ETH';
            const baseId = '0x0000000000000000000000000000000000000000';
            const quote = key;
            const quoteId = this.safeString (market, 'address');
            const id = base + '_' + quote;
            const symbol = base + '/' + quote;
            const precision = {
                'price': 18,
                'amount': this.safeString (market, 'decimals'),
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': 0.0,
                        'max': undefined,
                    },
                    'price': {
                        'min': 0.0,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0.0,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = '';
        const symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const baseVolume = this.safeFloat (ticker, 'baseVolume');
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume');
        const open = this.safeFloat (ticker, 'high');
        const last = this.safeFloat (ticker, 'last');
        const change = undefined;
        const percentage = this.safeFloat (ticker, 'percentChange');
        const average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open > 0)
                percentage = change / open * 100;
        }
        const vwap = undefined;
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
        const market = this.market (symbol);
        const marketId = market['base'] + '_' + market['quote'];
        const request = {
            'market': marketId,
        };
        const ticker = await this.privatePostReturnTicker (this.extend (request, params));
        if ('message' in ticker) {
            throw new ExchangeError (this.id + ' ' + ticker['message']);
        }
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.privatePostReturnTicker (params);
        const result = {};
        const keys = Object.keys (tickers);
        for (const p = 0; p < keys.length; p++) {
            const symbol = keys[p].replace ('_', '/');
            const val = tickers[keys[p]];
            const market = {};
            market['symbol'] = symbol;
            result[symbol] = this.parseTicker (val, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['base'] + '_' + market['quote'];
        const orderbook = await this.privatePostReturnOrderBook (this.extend ({
            'market': marketId,
            'count': 30,
        }));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = { 'address': this.apiKey };
        const balances = await this.privatePostReturnCompconsteBalances (this.extend (request));
        const result = { 'info': balances };
        const keys = Object.keys (balances);
        for (const p = 0; p < keys.length; p++) {
            const currency = keys[p];
            const balance = balances[currency];
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'onOrders'),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const contractAddress = await this.getContractAddress ();
        const base = market['base'];
        let tokenBuy = undefined;
        let tokenSell = undefined;
        let baseDecimals = undefined;
        let quotesDecimals = undefined;
        if (side === 'buy') {
            tokenBuy = market['quote'];
            tokenSell = market['base'];
            baseDecimals = market['precision']['amount']
        } else {
            tokenBuy = market['base'];
            tokenSell = market['quote'];
        }
        const sell_quantity = parseFloat (price) * parseFloat (amount);
        const quantity = this.amountToPrecision (symbol, amount);
        const amount_buy = this.toWei (quantity, 'ether', basedecimal);
        const amount_sell = this.toWei (sell_quantity, 'ether', quotedecimal);
        const nonce = this.milliseconds () * 100000;
        const orderToHash = {
            'contractAddress': contractAddress,
            'tokenBuy': tokenBuy,
            'amount_buy': amount_buy,
            'tokenSell': tokenSell,
            'amount_sell': amount_sell,
            'expires': 100000,
            'nonce': nonce,
            'address': this.apiKey,
        };
        const esc = this.signZeroExFunction (orderToHash, this.secret, 'getIdexCreateOrderHash');
        const request = {
            'tokenBuy': tokenBuy,
            'amountBuy': amount_buy,
            'tokenSell': tokenSell,
            'amountSell': amount_sell,
            'address': this.apiKey,
            'nonce': nonce,
            'expires': 100000,
            'r': esc['ecSignature']['r'],
            's': esc['ecSignature']['s'],
            'v': esc['ecSignature']['v'],
        };
        return await this.privatePostOrder (this.extend (request, params));
    }

    async editOrder (orderId, symbol, type, side, quantity, price, params = {}) {
        const cancel_order = await this.cancelOrder (orderId);
        if (cancel_order['success'] === 1) {
            let idexPrice = 0;
            let quant = 0;
            let priceVal = 0;
            if (side === 'sell') {
                const idexQty = parseFloat (price) * parseFloat (quantity);
                idexPrice = parseFloat (quantity) / parseFloat (idexQty);
                priceVal = idexPrice;
                quant = idexQty;
            }
            const order = this.createOrder (symbol, type, side, quant, priceVal);
            return order;
        } else {
            return cancel_order;
        }
    }

    async cancelOrder (orderId, symbol = undefined, params = {}) {
        const nonce = this.milliseconds () * 100000;
        const orderToHash = {
            'orderHash': orderId,
            'nonce': nonce,
        };
        const signedOrder = this.signZeroExFunction (orderToHash, this.secret, 'getIdexCancelOrderHash');
        const request = {
            'orderHash': orderId,
            'address': this.apiKey,
            'nonce': nonce,
            'v': signedOrder['ecSignature']['v'],
            'r': signedOrder['ecSignature']['r'],
            's': signedOrder['ecSignature']['s'],
        };
        return this.privatePostCancel (this.extend (request));
    }

    async getContractAddress () {
        if (this.walletAddress === undefined) {
            return this.safeString (await this.privateGetReturnContractAddress (), 'address');
        } else {
            return this.walletAddress;
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = path;
        if (method === 'GET') {
            query += '?' + this.urlencode (params);
        }
        const url = this.urls['api'] + query;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
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

    getIdexCreateOrderHash (order) {
        return this.soliditySha3 ([
            order['contractAddress'], // address
            order['tokenBuy'], // address
            order['amount_buy'], // uint256
            order['tokenSell'], // address
            order['amount_sell'], // uint256
            order['expires'], // uint256
            order['nonce'], // uint256
            order['address'], // address
        ]);
    }

    getIdexCancelOrderHash (order) {
        return this.soliditySha3 ([
            order['orderHash'], // address
            order['nonce'], // uint256
        ]);
    }
};
