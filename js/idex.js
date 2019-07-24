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
                        'returnCurrencies', // available currency codss
                    ],
                },
                'private': {
                    'get': [
                        'apiKey',
                        'returnContractAddress',
                    ],
                    'post': [
                        'apiKey',
                        'apiKey/disable',
                        'apiKey/enable',
                        'returnTicker', // ticker for particular symbol
                        'returnOrderBook', // return order book for a symbol
                        'order', // create new order
                        'returnBalances', // return total balance
                        'returnCompleteBalances', // return complete balance
                        'returnOrderTrades', // return trades for given orderHash
                        'returnTradeHistory',
                        'returnOpenOrders', // return open orders for a particular address and market
                        'cancel', // cancel the order by orderHash
                        'returnDepositsWithdrawals',
                    ],
                },
            },
            'options': {
                'contractAddress': undefined,
            },
            'exceptions': {},
            'requiredCredentials': {
                'walletAddress': true,
                'privateKey': true,
                'apiKey': false,
                'secret': false,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetReturnCurrencies ();
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const baseId = keys[i];
            const market = markets[baseId];
            if (baseId === 'ETH') {
                continue;
            }
            const quote = 'ETH';
            const quoteAddress = '0x0000000000000000000000000000000000000000';
            const baseAddress = this.safeString (market, 'address');
            const id = quote + '_' + baseId; // the base and quote are inverted
            const base = this.commonCurrencyCode (baseId);
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
                'baseId': baseAddress,
                'quoteId': quoteAddress,
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
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const baseVolume = this.safeFloat (ticker, 'baseVolume');
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume');
        const open = this.safeFloat (ticker, 'high');
        const last = this.safeFloat (ticker, 'last');
        let change = undefined;
        let percentage = this.safeFloat (ticker, 'percentChange');
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open > 0) {
                percentage = change / open * 100;
            }
        }
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
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
        const request = {
            'market': market['id'],
        };
        const ticker = await this.privatePostReturnTicker (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['quote'] + '_' + market['base'];
        const request = {
            'market': id,
            'count': 30,
        };
        const orderbook = await this.privatePostReturnOrderBook (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchBalance (params = {}) {
        const request = {
            'address': this.walletAddress,
        };
        const balances = await this.privatePostReturnCompleteBalances (this.extend (request, params));
        const result = {
            'info': balances,
        };
        const keys = Object.keys (balances);
        for (let p = 0; p < keys.length; p++) {
            const currency = keys[p];
            const balance = balances[currency];
            result[currency] = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'onOrders'),
            };
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        this.checkRequiredCredentials ();
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
        const esc = this.signZeroExFunction (orderToHash, this.privateKey, 'getIdexCreateOrderHash');
        const request = {
            'tokenBuy': tokenBuy,
            'amountBuy': amount_buy,
            'tokenSell': tokenSell,
            'amountSell': amount_sell,
            'address': this.walletAddress,
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
        this.checkRequiredCredentials ();
        const nonce = this.milliseconds () * 100000;
        const orderToHash = {
            'orderHash': orderId,
            'nonce': nonce,
        };
        const signedOrder = this.signZeroExFunction (orderToHash, this.privateKey, 'getIdexCancelOrderHash');
        const request = {
            'orderHash': orderId,
            'address': this.walletAddress,
            'nonce': nonce,
            'v': signedOrder['ecSignature']['v'],
            'r': signedOrder['ecSignature']['r'],
            's': signedOrder['ecSignature']['s'],
        };
        return this.privatePostCancel (this.extend (request));
    }

    async getContractAddress () {
        if (this.options['contractAddress'] !== undefined) {
            return this.options['contractAddress'];
        }
        this.options['contractAddress'] = this.safeString (await this.privateGetReturnContractAddress (), 'address');
        return this.options['contractAddress'];
    }

    async fetchTransactions (params = {}) {
        const request = {
            'address': this.walletAddress,
        };
        const response = await this.privatePostReturnDepositsWithdrawals (this.extend (request, params));
        const deposits = this.parseTransactions (response['deposits']);
        const withdrawals = this.parseTransactions (response['withdrawals']);
        return this.arrayConcat (deposits, withdrawals);
    }

    parseTransaction (item, currency = undefined) {
        const amount = this.safeFloat (item, 'amount');
        const timestamp = this.safeInteger (item, 'timestamp') * 1000;
        const txhash = this.safeString (item, 'transactionHash');
        let id = undefined;
        let type = undefined;
        let status = undefined;
        let addressFrom = undefined;
        let addressTo = undefined;
        if ('depositNumber' in item) {
            id = this.safeString (item, 'depositNumber');
            type = 'deposit';
            addressTo = this.walletAddress;
        } else if ('withdrawalNumber' in item) {
            id = this.safeString (item, 'withdrawalNumber');
            type = 'withdrawal';
            status = this.parseTransactionStatus (this.safeString (item, 'status'));
            addressFrom = this.walletAddress;
        }
        const code = this.commonCurrencyCode (this.safeString (item, 'currency'));
        return {
            'info': item,
            'id': id,
            'txid': txhash,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': amount,
            'status': status,
            'type': type,
            'updated': undefined,
            'comment': undefined,
            'addressFrom': addressFrom,
            'tagFrom': undefined,
            'addressTo': addressTo,
            'tagTo': undefined,
            'fee': {
                'currency': code,
                'cost': undefined,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'COMPLETE': 'ok',
        };
        return this.safeString (statuses, status);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'address': this.walletAddress,
            'market': market['id'],
        };
        const response = this.privatePostReturnOpenOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeInteger (order, 'timestamp') * 1000;
        const side = this.safeString (order, 'type');
        let symbol = undefined;
        const amount = this.safeString (order, 'amount');
        const price = this.safeFloat (order, 'price');
        if ('market' in order) {
            const marketId = order['market'];
            symbol = this.markets_by_id[marketId]['symbol'];
        } else if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'orderHash');
        return {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'side': side,
            'amount': amount,
            'price': price,
            'type': 'limit',
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = path;
        if (method === 'GET') {
            query += '?' + this.urlencode (params);
        } else if (method === 'POST') {
            body = this.json (params);
        }
        const url = this.urls['api'] + query;
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
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

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        if ('message' in response) {
            throw new ExchangeError (response['message']);
        }
    }
};
