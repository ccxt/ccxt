'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

module.exports = class walutomat extends Exchange {
  describe () {
    return this.deepExtend (super.describe (), {
        "id": "walutomat",
        "name": "Walutomat",
        "countries": [ "PL" ],
        "rateLimit": 1000,
        "version": "v1",
        "has": {
            "fetchMarkets": true,
            "fetchBalance": true,
            "fetchOrderBook": true,
            "fetchTrades": true,
            "createOrder": true,
            "cancelOrder": true,
            "fetchOrders": true,
            "fetchClosedOrders": true,
        },
        "urls": {
            "logo": "https://www.walutomat.pl/wp-content/themes/walutomat/images/logo_white.svg",
            "api": "https://api.walutomat.pl/api",
            "www": "https://www.walutomat.pl",
            "doc": [
                "https://www.walutomat.pl/api/"
            ]
        },
        "requiredCredentials": {
            "apiKey": true,
            "secret": true
        },
        "api": {
            "public": {
                "get": [
                    "public/market/orderbook/{symbol}"
                ]
            },
            "private": {
                "get": [
                    "account/id",
                    "account/balances",
                    "account/history",
                    "market/orders",
                    "market/orders/{orderId}",
                ],
                "post": [
                    "market/orders",
                    "market/orders/close/{orderId}"
                ]
            }
        },
        "exceptions": {
          "INVALID PARAMETER": ExchangeError
        }
    });
  }

async fetchMarkets () {
    const currencies = ["EUR", "GBP", "USD", "CHF", "PLN"];
    const markets = [];
    for (let base = 0; base < currencies.length - 1; base++ ) {
      for (let quote = base + 1; quote < currencies.length; quote++ ) {
        markets.push({
          'id': `${currencies[base]}_${currencies[quote]}`,
          'symbol': `${currencies[base]}${currencies[quote]}`,
          'base': currencies[base],
          'quote': currencies[quote],
          'active': true,
          'precision': {
            'amount': 2,
            'price': 4
          }
        })
      }
    }
    return markets;
}

async fetchBalance (params = {}) {
  let balances = await this.privateGetAccountBalances ();
  let result = {};
  for (let i = 0; i < balances.length; i++) {
      const balance = balances[i];
      result[balance.currency] = {
        free: balance.balanceAvailable,
        used: balance.balanceReserved,
        total: balance.balanceAll,
      };
  }
  return this.parseBalance (result);
}

async fetchOrderBook (symbol, limit = undefined, params = {}) {
    let request = {
        symbol: this.formatSymbol(symbol),
    };
    const result = await this.publicGetPublicMarketOrderbookSymbol(this.extend (request, params));
    const format = ({price, baseVolume, marketVolume}) => [+price, +baseVolume];
    return {
        bids: result.bids.map(format),
        asks: result.asks.map(format),
        timestamp: undefined,
        datetime: undefined,
        nonce: undefined
    }
}

async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
    let request = {
        operationType: 'MARKET_FX',
        currencies: symbol,
        continueFrom: since,
        volume: limit,
        sortOrder: params.sortOrder || 'DESC'
    };
    const result = await this.privateGetAccountHistory(this.extend (request, params));
    return result.map(trade => ({
        id: trade.id,
    }));
}

async createOrder (symbol, type, side, amount, price, {submitId}) {
    const pair = this.formatSymbol(symbol);
    const currencies = symbol.split('/');
    const body = { 
        submitId,
        pair,
        price,
        buySell: side.toUpperCase(),
        volumeCurrency: currencies[0],
        otherCurrency: currencies[1],
        volume: amount
    };
    return await this.privatePostMarketOrders(this.extend (body));
}

async cancelOrder (id, symbol = undefined, params = {}) {
    let request = {
        orderId: id,
    };
    return await this.privatePostMarketOrdersCloseOrderId(this.extend (request, params));
}

async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    const orders = await this.privateGetMarketOrders();
    return orders.map(order => ({
        info: order,
        id: order.orderId,
        symbol: this.parseSymbol(order.market),
        timestamp: order.submitTs,
        datetime: order.submitTs,
        lastTradeTimestamp: order.updateTs,
        type: 'limit',
        side: order.buySell.toLowerCase(),
        price: +order.price,
        cost: order.feeAmountMax,
        amount: +order.volume,
        remaining: undefined,
        filled: undefined,
        status: this.parseOrderStatus(order.status),
        fee: undefined,
        trades: undefined,
    }));
}

async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
    return await this.fetchOrders (symbol, since, limit, params);
}

formatSymbol (symbol) {
    return symbol.replace('/', '_');
}

parseSymbol (symbol) {
    return symbol.replace('_', '/');
}

parseOrderStatus (status) {
    let statuses = {
        'MARKET_REQUESTED': 'open',
        'MARKET_PUBLISHED': 'open',
        'CLOSED': 'closed',
        'CANCELLED': 'canceled',
    };
    if (status in statuses) {
        return statuses[status];
    }
    return status;
}

sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
    let url = this.urls['api'] + '/' + this.version + '/' + this.url (path, params);
    let uri = '/api/' + this.version + '/' + this.url (path, params);
    let query = this.omit (params, this.extractParams (path));
    if (api === 'private') {
        this.checkRequiredCredentials ();
        let timestamp = this.milliseconds ().toString ();
        let prehash = uri + timestamp;
        if (method === 'POST') {
            body = this.json (query);
            prehash += body;
        }
        let signature = this.hmac (this.encode (prehash), this.encode (this.secret), 'sha256', 'hex');
        headers = {
            'X-API-KEY': this.apiKey,
            'X-API-SIGNATURE': signature,
            'X-API-NONCE': timestamp,
            'Content-Type': 'application/json',
        };
    } else if (api === 'public') {
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
    }
    return { 'url': url, 'method': method, 'body': body, 'headers': headers };
}

handleErrors (httpCode, reason, url, method, headers, body) {
    if (typeof body !== 'string')
        return; // fallback to default error handler
    if (body.length < 2)
        return; // fallback to default error handler
    // code 401 and plain body 'Authentication failed' (with single quotes)
    // this error is sent if you do not submit a proper Content-Type
    if ((body[0] === '{') || (body[0] === '[')) {
        let response = JSON.parse (body);
        const message = this.safeString (response, 'message');
        if (typeof message !== 'undefined') {
            const feedback = this.id + ' ' + this.json (response);
            const exceptions = this.exceptions;
            if (message in exceptions) {
                throw new exceptions[message] (feedback);
            } else {
                throw new ExchangeError (feedback);
            }
        }
    }
}

async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
    let response = await this.fetch2 (path, api, method, params, headers, body);
    if (typeof response !== 'object') {
        throw new ExchangeError (this.id + ' returned a non-json response: ' + response.toString ());
    }
    if ((response[0] === '{' || response[0] === '[')) {
        return JSON.parse (response);
    }
    return response;
}
};
