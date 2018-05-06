'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound, OrderNotCached } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class cryptopia extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptopia',
            'name': 'Cryptopia',
            'rateLimit': 1500,
            'countries': 'NZ', // New Zealand
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchMyTrades': true,
                'fetchOrder': 'emulated',
                'fetchOrderBooks': true,
                'fetchOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchTickers': true,
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
                        'GetMarketOrderGroups/{ids}',
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
            'commonCurrencies': {
                'ACC': 'AdCoin',
                'BAT': 'BatCoin',
                'BLZ': 'BlazeCoin',
                'BTG': 'Bitgem',
                'CC': 'CCX',
                'CMT': 'Comet',
                'FCN': 'Facilecoin',
                'FUEL': 'FC2', // FuelCoin != FUEL
                'HAV': 'Havecoin',
                'LDC': 'LADACoin',
                'MARKS': 'Bitmark',
                'NET': 'NetCoin',
                'QBT': 'Cubits',
                'WRC': 'WarCoin',
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetGetTradePairs ();
        let result = [];
        let markets = response['Data'];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['Id'];
            let symbol = market['Label'];
            let baseId = market['Symbol'];
            let quoteId = market['BaseSymbol'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let lot = market['MinimumTrade'];
            let priceLimits = {
                'min': market['MinimumPrice'],
                'max': market['MaximumPrice'],
            };
            let amountLimits = {
                'min': lot,
                'max': market['MaximumTrade'],
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': {
                    'min': market['MinimumBaseTrade'],
                    'max': undefined,
                },
            };
            let active = market['Status'] === 'OK';
            result.push ({
                'id': id,
                'symbol': symbol,
                'label': market['Label'],
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'maker': market['TradeFee'] / 100,
                'taker': market['TradeFee'] / 100,
                'lot': limits['amount']['min'],
                'active': active,
                'precision': precision,
                'limits': limits,
            });
        }
        this.options['marketsByLabel'] = this.indexBy (result, 'label');
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetGetMarketOrdersId (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let orderbook = response['Data'];
        return this.parseOrderBook (orderbook, undefined, 'Buy', 'Sell', 'Price', 'Volume');
    }

    joinMarketIds (ids, glue = '-') {
        let result = ids[0].toString ();
        for (let i = 1; i < ids.length; i++) {
            result += glue + ids[i].toString ();
        }
        return result;
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (!symbols) {
            let numIds = this.ids.length;
            // max URL length is 2083 characters, including http schema, hostname, tld, etc...
            if (numIds > 2048)
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            ids = this.joinMarketIds (this.ids);
        } else {
            ids = this.joinMarketIds (this.marketIds (symbols));
        }
        let response = await this.publicGetGetMarketOrderGroupsIds (this.extend ({
            'ids': ids,
        }, params));
        let orderbooks = response['Data'];
        let result = {};
        for (let i = 0; i < orderbooks.length; i++) {
            let orderbook = orderbooks[i];
            let id = this.safeInteger (orderbook, 'TradePairId');
            let symbol = id;
            if (id in this.markets_by_id) {
                let market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseOrderBook (orderbook, undefined, 'Buy', 'Sell', 'Price', 'Volume');
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let open = this.safeFloat (ticker, 'Open');
        let last = this.safeFloat (ticker, 'LastPrice');
        let change = last - open;
        let baseVolume = this.safeFloat (ticker, 'Volume');
        let quoteVolume = this.safeFloat (ticker, 'BaseVolume');
        let vwap = undefined;
        if (typeof quoteVolume !== 'undefined')
            if (typeof baseVolume !== 'undefined')
                if (baseVolume > 0)
                    vwap = quoteVolume / baseVolume;
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'High'),
            'low': this.safeFloat (ticker, 'Low'),
            'bid': this.safeFloat (ticker, 'BidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'AskPrice'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': this.safeFloat (ticker, 'Change'),
            'average': this.sum (last, open) / 2,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetMarketId (this.extend ({
            'id': market['id'],
        }, params));
        let ticker = response['Data'];
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetGetMarkets (params);
        let result = {};
        let tickers = response['Data'];
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker['TradePairId'];
            let recognized = (id in this.markets_by_id);
            if (!recognized)
                throw new ExchangeError (this.id + ' fetchTickers() returned unrecognized pair id ' + id.toString ());
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
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
        let hours = 24; // the default
        if (typeof since !== 'undefined') {
            let elapsed = this.milliseconds () - since;
            let hour = 1000 * 60 * 60;
            hours = parseInt (Math.ceil (elapsed / hour));
        }
        let request = {
            'id': market['id'],
            'hours': hours,
        };
        let response = await this.publicGetGetMarketHistoryIdHours (this.extend (request, params));
        let trades = response['Data'];
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['TradePairId'] = market['id'];
        }
        if (typeof limit !== 'undefined') {
            request['Count'] = limit; // default 100
        }
        let response = await this.privatePostGetTradeHistory (this.extend (request, params));
        return this.parseTrades (response['Data'], market, since, limit);
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetGetCurrencies (params);
        let currencies = response['Data'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['Symbol'];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let precision = 8; // default precision, todo: fix "magic constants"
            let code = this.commonCurrencyCode (id);
            let active = (currency['ListingStatus'] === 'Active');
            let status = currency['Status'].toLowerCase ();
            if (status !== 'ok')
                active = false;
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['Name'],
                'active': active,
                'status': status,
                'fee': currency['WithdrawFee'],
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': currency['MinBaseTrade'],
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['MinWithdraw'],
                        'max': currency['MaxWithdraw'],
                    },
                },
            };
        }
        return result;
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
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        // price = parseFloat (price);
        // amount = parseFloat (amount);
        let request = {
            'TradePairId': market['id'],
            'Type': this.capitalize (side),
            // 'Rate': this.priceToPrecision (symbol, price),
            // 'Amount': this.amountToPrecision (symbol, amount),
            'Rate': price,
            'Amount': amount,
        };
        let response = await this.privatePostSubmitTrade (this.extend (request, params));
        if (!response)
            throw new ExchangeError (this.id + ' createOrder returned unknown error: ' + this.json (response));
        let id = undefined;
        let filled = 0.0;
        if ('Data' in response) {
            if ('OrderId' in response['Data']) {
                if (response['Data']['OrderId']) {
                    id = response['Data']['OrderId'].toString ();
                }
            }
            if ('FilledOrders' in response['Data']) {
                let filledOrders = response['Data']['FilledOrders'];
                let filledOrdersLength = filledOrders.length;
                if (filledOrdersLength) {
                    filled = undefined;
                }
            }
        }
        let timestamp = this.milliseconds ();
        let order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': filled,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
        if (id)
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
            } else {
                if (id in this.options['marketsByLabel']) {
                    market = this.options['marketsByLabel'][id];
                    symbol = market['symbol'];
                }
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
            'lastTradeTimestamp': undefined,
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
        await this.loadMarkets ();
        let market = undefined;
        let request = {
            // 'Market': market['id'],
            // 'TradePairId': market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count': 100, // default = 100
        };
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['TradePairId'] = market['id'];
        }
        let response = await this.privatePostGetOpenOrders (this.extend (request, params));
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
                if (order['status'] === 'open') {
                    this.orders[id] = this.extend (order, {
                        'status': 'closed',
                        'cost': order['amount'] * order['price'],
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                }
            }
            let order = this.orders[id];
            if ((typeof symbol === 'undefined') || (order['symbol'] === symbol))
                result.push (order);
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        id = id.toString ();
        let orders = await this.fetchOrders (symbol, undefined, undefined, params);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['id'] === id)
                return orders[i];
        }
        throw new OrderNotCached (this.id + ' order ' + id + ' not found in cached .orders, fetchOrder requires .orders (de)serialization implemented for this method to work properly');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === 'open')
                result.push (orders[i]);
        }
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === 'closed')
                result.push (orders[i]);
        }
        return result;
    }

    async fetchDepositAddress (code, params = {}) {
        let currency = this.currency (code);
        let response = await this.privatePostGetDepositAddress (this.extend ({
            'Currency': currency['id'],
        }, params));
        let address = this.safeString (response['Data'], 'BaseAddress');
        if (!address)
            address = this.safeString (response['Data'], 'Address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        let currency = this.currency (code);
        this.checkAddress (address);
        let request = {
            'Currency': currency['id'],
            'Amount': amount,
            'Address': address, // Address must exist in you AddressBook in security settings
        };
        if (tag)
            request['PaymentId'] = tag;
        let response = await this.privatePostSubmitWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': response['Data'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.json (query, { 'convertArraysToObjects': true });
            let hash = this.hash (this.encode (body), 'md5', 'base64');
            let secret = this.base64ToBinary (this.secret);
            let uri = this.encodeURIComponent (url);
            let lowercase = uri.toLowerCase ();
            hash = this.binaryToString (hash);
            let payload = this.apiKey + method + lowercase + nonce + hash;
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
                    if (response['Error'] === 'Insufficient Funds.')
                        throw new InsufficientFunds (this.id + ' ' + this.json (response));
                }
        }
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
