import Exchange from './abstract/bitcointry.js';
import { ArgumentsRequired, InvalidOrder, OrderNotFound, AuthenticationError, InsufficientFunds } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { OrderSide, OrderType, Order, Balances, Market } from './base/types.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js'; // Add this import

export default class bitcointry extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bitcointry',
            'name': 'BitcoinTry',
            'countries': [ 'TR' ],
            'version': 'v1',
            'rateLimit': 100,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://bitcointry.com/assets/images/logo.png',
                'api': {
                    'public': 'https://api.bitcointry.com',
                    'private': 'https://api.bitcointry.com',
                },
                'www': 'https://bitcointry.com',
                'doc': 'https://bitcointry.com/en/api/v1',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'ticker/{symbol}',
                        'tickers',
                        'orderbook/{symbol}',
                        'trades/{symbol}',
                        'klines/{symbol}',
                    ],
                },
                'private': {
                    'get': [
                        'account/balances',
                        'orders',
                        'orders/{id}',
                        'trades',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    'Invalid API key': AuthenticationError,
                    'Invalid signature': AuthenticationError,
                    'Order not found': OrderNotFound,
                    'Insufficient balance': InsufficientFunds,
                    'Invalid order': InvalidOrder,
                },
                'broad': {},
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarkets (params);
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (market, 'amount_precision'),
                    'price': this.safeNumber (market, 'price_precision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': this.safeNumber (market, 'max_amount'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'min_price'),
                        'max': this.safeNumber (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_value'),
                        'max': this.safeNumber (market, 'max_value'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price?: number, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            'timestamp': this.milliseconds (),
        };
        if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
            request['quantity'] = this.amountToPrecision (symbol, amount);
        } else if (type === 'market') {
            if (side === 'buy') {
                request['quoteOrderQty'] = this.costToPrecision (symbol, amount * price);
            } else {
                request['quantity'] = this.amountToPrecision (symbol, amount);
            }
        } else if (type === 'stoplimit') {
            if (price === undefined || params['stopPrice'] === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires both price and stopPrice params for stoplimit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
            request['quantity'] = this.amountToPrecision (symbol, amount);
            request['stopPrice'] = this.priceToPrecision (symbol, params['stopPrice']);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}): Promise<Order> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
            'timestamp': this.milliseconds (),
        };
        const response = await this.privateDeleteOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetAccountBalances (params);
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'locked');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let totalParams = '';
            if (method === 'POST') {
                body = this.json (query);
                totalParams = body;
            } else {
                if (Object.keys (query).length) {
                    const queryString = this.urlencode (query);
                    url += '?' + queryString;
                    totalParams = queryString;
                }
            }
            const signature = this.hmac (this.encode (totalParams), this.encode (this.secret), sha512, 'hex'); // Fix hmac call
            headers = {
                'Content-Type': 'application/json',
                'X-API-KEY': this.apiKey,
                'X-API-TIMESTAMP': timestamp,
                'X-API-SIGN': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    parseOrder (order, market = undefined): Order {
        const id = this.safeString (order, 'id');
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        const symbol = this.safeSymbol (undefined, market);
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const price = this.safeNumber (order, 'price'); // Use safeNumber
        const amount = this.safeNumber (order, 'quantity'); // Use safeNumber
        const filled = this.safeNumber (order, 'executed'); // Use safeNumber
        const status = this.safeString (order, 'status');
        const cost = this.safeNumber (order, 'cost'); // Use safeNumber
        const remaining = this.safeNumber (order, 'remaining'); // Use safeNumber
        return {
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
            'reduceOnly': false,
        };
    }
}
