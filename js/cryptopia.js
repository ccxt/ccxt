"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds, OrderNotFound, OrderNotCached } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class cryptopia extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptopia',
            'name': 'Cryptopia',
            'rateLimit': 1500,
            'countries': 'NZ', // New Zealand
            'hasCORS': false,
            // obsolete metainfo interface
            'hasFetchTickers': true,
            'hasFetchOrder': true,
            'hasFetchOrders': true,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            'hasFetchMyTrades': true,
            'hasDeposit': true,
            'hasWithdraw': true,
            // new metainfo interface
            'has': {
                'fetchTickers': true,
                'fetchOrder': 'emulated',
                'fetchOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchMyTrades': true,
                'deposit': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29484394-7b4ea6e2-84c6-11e7-83e5-1fccf4b2dc81.jpg',
                'api': 'https://www.cryptopia.co.nz/api',
                'www': 'https://www.cryptopia.co.nz',
                'doc': [
                    'https://www.cryptopia.co.nz/Forum/Category/45',
                    'https://www.cryptopia.co.nz/Forum/Thread/255',
                    'https://www.cryptopia.co.nz/Forum/Thread/256',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'GetCurrencies',
                        'GetTradePairs',
                        'GetMarkets',
                        'GetMarkets/{id}',
                        'GetMarkets/{hours}',
                        'GetMarkets/{id}/{hours}',
                        'GetMarket/{id}',
                        'GetMarket/{id}/{hours}',
                        'GetMarketHistory/{id}',
                        'GetMarketHistory/{id}/{hours}',
                        'GetMarketOrders/{id}',
                        'GetMarketOrders/{id}/{count}',
                        'GetMarketOrderGroups/{ids}/{count}',
                    ],
                },
                'private': {
                    'post': [
                        'CancelTrade',
                        'GetBalance',
                        'GetDepositAddress',
                        'GetOpenOrders',
                        'GetTradeHistory',
                        'GetTransactions',
                        'SubmitTip',
                        'SubmitTrade',
                        'SubmitTransfer',
                        'SubmitWithdraw',
                    ],
                },
            },
        });
    }

    commonCurrencyCode (currency) {
        if (currency == 'CC')
            return 'CCX';
        if (currency == 'FCN')
            return 'Facilecoin';
        if (currency == 'NET')
            return 'NetCoin';
        if (currency == 'BTG')
            return 'Bitgem';
        return currency;
    }

    async fetchMarkets () {
        let response = await this.publicGetTradePairs ();
        let result = [];
        let markets = response['Data'];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['Id'];
            let symbol = market['Label'];
            let [ base, quote ] = symbol.split ('/');
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let amountLimits = {
                'min': market['MinimumTrade'],
                'max': market['MaximumTrade']
            };
            let priceLimits = {
                'min': market['MinimumPrice'],
                'max': market['MaximumPrice'],
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
            };
            let active = market['Status'] == 'OK';
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'maker': market['TradeFee'] / 100,
                'taker': market['TradeFee'] / 100,
                'lot': amountLimits['min'],
                'active': active,
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketOrdersId (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let orderbook = response['Data'];
        return this.parseOrderBook (orderbook, undefined, 'Buy', 'Sell', 'Price', 'Volume');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['High']),
            'low': parseFloat (ticker['Low']),
            'bid': parseFloat (ticker['BidPrice']),
            'ask': parseFloat (ticker['AskPrice']),
            'vwap': undefined,
            'open': parseFloat (ticker['Open']),
            'close': parseFloat (ticker['Close']),
            'first': undefined,
            'last': parseFloat (ticker['LastPrice']),
            'change': parseFloat (ticker['Change']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['Volume']),
            'quoteVolume': parseFloat (ticker['BaseVolume']),
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketId (this.extend ({
            'id': market['id'],
        }, params));
        let ticker = response['Data'];
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarkets (params);
        let result = {};
        let tickers = response['Data'];
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker['TradePairId'];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        if ('Timestamp' in trade) {
            timestamp = trade['Timestamp'] * 1000;
        } else if ('TimeStamp' in trade) {
            timestamp = this.parse8601 (trade['TimeStamp']);
        }
        let price = this.safeFloat (trade, 'Price');
        if (!price)
            price = this.safeFloat (trade, 'Rate');
        let cost = this.safeFloat (trade, 'Total');
        let id = this.safeString (trade, 'TradeId');
        if (!market) {
            if ('TradePairId' in trade)
                if (trade['TradePairId'] in this.markets_by_id)
                    market = this.markets_by_id[trade['TradePairId']];
        }
        let symbol = undefined;
        let fee = undefined;
        if (market) {
            symbol = market['symbol'];
            if ('Fee' in trade) {
                fee = {
                    'currency': market['quote'],
                    'cost': trade['Fee'],
                };
            }
        }
        return {
            'id': id,
            'info': trade,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': trade['Type'].toLowerCase (),
            'price': price,
            'cost': cost,
            'amount': trade['Amount'],
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketHistoryIdHours (this.extend ({
            'id': market['id'],
            'hours': 24, // default
        }, params));
        let trades = response['Data'];
        return this.parseTrades (trades, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostGetTradeHistory (this.extend ({
            // 'Market': market['id'],
            'TradePairId': market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count': 10, // max = 100
        }, params));
        return this.parseTrades (response['Data'], market);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetBalance ();
        let balances = response['Data'];
        let result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let code = balance['Symbol'];
            let currency = this.commonCurrencyCode (code);
            let account = {
                'free': balance['Available'],
                'used': 0.0,
                'total': balance['Total'],
            };
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        price = parseFloat (price);
        amount = parseFloat (amount);
        let request = {
            'TradePairId': market['id'],
            'Type': this.capitalize (side),
            'Rate': this.priceToPrecision (symbol, price),
            'Amount': this.amountToPrecision (symbol, amount),
        };
        let response = await this.privatePostSubmitTrade (this.extend (request, params));
        if (!response)
            throw new ExchangeError (this.id + ' createOrder returned unknown error: ' + this.json (response));
        if ('Data' in response) {
            if ('OrderId' in response['Data']) {
                if (!response['Data']['OrderId'])
                    throw new ExchangeError (this.id + ' createOrder returned bad OrderId: ' + this.json (response));
            } else {
                throw new ExchangeError (this.id + ' createOrder returned no OrderId in Data: ' + this.json (response));
            }
        } else {
            throw new ExchangeError (this.id + ' createOrder returned no Data in response: ' + this.json (response));
        }
        let id = response['Data']['OrderId'].toString ();
        let timestamp = this.milliseconds ();
        let order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': 'open',
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelTrade (this.extend ({
                'Type': 'Trade',
                'OrderId': id,
            }, params));
            if (id in this.orders)
                this.orders[id]['status'] = 'canceled';
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'Error');
                if (message) {
                    if (message.indexOf ('does not exist') >= 0)
                        throw new OrderNotFound (this.id + ' cancelOrder() error: ' + this.last_http_response);
                }
            }
            throw e;
        }
        return response;
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else if ('Market' in order) {
            let id = order['Market'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
        }
        let timestamp = this.parse8601 (order['TimeStamp']);
        let amount = this.safeFloat (order, 'Amount');
        let remaining = this.safeFloat (order, 'Remaining');
        let filled = amount - remaining;
        return {
            'id': order['OrderId'].toString (),
            'info': this.omit (order, 'status'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': order['status'],
            'symbol': symbol,
            'type': 'limit',
            'side': order['Type'].toLowerCase (),
            'price': this.safeFloat (order, 'Rate'),
            'cost': this.safeFloat (order, 'Total'),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostGetOpenOrders ({
            // 'Market': market['id'],
            'TradePairId': market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count': 100, // default = 100
        }, params);
        let orders = [];
        for (let i = 0; i < response['Data'].length; i++) {
            orders.push (this.extend (response['Data'][i], { 'status': 'open' }));
        }
        let openOrders = this.parseOrders (orders, market);
        for (let j = 0; j < openOrders.length; j++) {
            this.orders[openOrders[j]['id']] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        let result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            let id = cachedOrderIds[k];
            if (id in openOrdersIndexedById) {
                this.orders[id] = this.extend (this.orders[id], openOrdersIndexedById[id]);
            } else {
                let order = this.orders[id];
                if (order['status'] == 'open') {
                    this.orders[id] = this.extend (order, {
                        'status': 'closed',
                        'cost': order['amount'] * order['price'],
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                }
            }
            let order = this.orders[id];
            if (order['symbol'] == symbol)
                result.push (order);
        }
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        id = id.toString ();
        let orders = await this.fetchOrders (symbol, params);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['id'] == id)
                return orders[i];
        }
        throw new OrderNotCached (this.id + ' order ' + id + ' not found in cached .orders, fetchOrder requires .orders (de)serialization implemented for this method to work properly');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'open')
                result.push (orders[i]);
        }
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] == 'closed')
                result.push (orders[i]);
        }
        return result;
    }

    async deposit (currency, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetDepositAddress (this.extend ({
            'Currency': currency
        }, params));
        let address = this.safeString (response['Data'], 'BaseAddress');
        if (!address)
            address = this.safeString (response['Data'], 'Address');
        return {
            'info': response,
            'address': address,
        };
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostSubmitWithdraw (this.extend ({
            'Currency': currency,
            'Amount': amount,
            'Address': address, // Address must exist in you AddressBook in security settings
        }, params));
        return {
            'info': response,
            'id': response['Data'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.json (query);
            let hash = this.hash (this.encode (body), 'md5', 'base64');
            let secret = this.base64ToBinary (this.secret);
            let uri = this.encodeURIComponent (url);
            let lowercase = uri.toLowerCase ();
            let payload = this.apiKey + method + lowercase + nonce + this.binaryToString (hash);
            let signature = this.hmac (this.encode (payload), secret, 'sha256', 'base64');
            let auth = 'amx ' + this.apiKey + ':' + this.binaryToString (signature) + ':' + nonce;
            headers = {
                'Content-Type': 'application/json',
                'Authorization': auth,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (response) {
            if ('Success' in response)
                if (response['Success']) {
                    return response;
                } else if ('Error' in response) {
                    if (response['Error'] == 'Insufficient Funds.')
                        throw new InsufficientFunds (this.id + ' ' + this.json (response));
                }
        }
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
}
