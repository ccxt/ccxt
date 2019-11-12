"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require("./base/Exchange");
const { AuthenticationError, NotSupported } = require("./base/errors");

//  ---------------------------------------------------------------------------

module.exports = class basefex extends Exchange {
  describe() {
    return this.deepExtend(super.describe(), {
      id: "basefex",
      name: "BaseFEX",
      countries: ["SC"],
      enableRateLimit: true,
      rateLimit: 2000,
      has: {
        CORS: false,
        fetchMarkets: true,
        fetchTradingFees: false,
        fetchTicker: true,
        fetchOrderBook: true,
        fetchTrades: true,
        fetchOHLCV: true,
        fetchBalance: true,
        createOrder: true,
        cancelOrder: true,
        editOrder: "emulated",
        fetchOrder: true,
        fetchOpenOrders: true,
        fetchMyTrades: true,
        fetchDepositAddress: true,
        fetchDeposits: true,
        fetchWithdrawals: true,
        fetchTransactions: true,
        fetchLedger: false,
        withdraw: false
      },
      urls: {
        logo: "https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg",
        api: "https://next-api.basefex.com",
        www: "https://www.basefex.com",
        doc: ["https://github.com/BaseFEX/basefex-api-docs", "https://github.com/BaseFEX/basefex-api-docs/blob/master/api-doc_en.md"],
        fees: "https://www.basefex.com/docs/fees",
        referral: "https://www.basefex.com/register/76VqmL"
      },
      api: {
        public: {
          get: ["symbols", "spec/kvs", "candlesticks/{type}@{symbol}/history", "depth@{symbol}/snapshot", "v1/trades/{symbol}"]
        },
        private: {
          get: ["accounts", "orders/{id}", "orders", "trades", "accounts/deposits/{currency}/address", "accounts/transactions"],
          post: ["orders"],
          put: [],
          delete: ["orders/{id}"]
        }
      },
      timeframes: {
        "1m": "1MIN",
        "3m": "3MIN",
        "5m": "5MIN",
        "15m": "15MIN",
        "30m": "30MIN",
        "1h": "1H",
        "2h": "2H",
        "4h": "4H",
        "6h": "6H",
        "12h": "12H",
        "1d": "1DAY"
      },
      exceptions: {},
      httpExceptions: {
        "498": AuthenticationError
      },
      options: {
        "api-expires": 10,
        "kvs-key": ["maker-fee-rate", "taker-fee-rate", "long-funding-rate", "short-funding-rate", "funding-interval"],
        "order-status": {
          NEW: "open",
          INFORCE: "open",
          PARTIALLY_FILLED: "open",
          PARTIALLY_CANCELED: "canceled",
          FILLED: "closed",
          CANCELED: "canceled",
          PENDING_CANCEL: "open",
          REJECTED: "rejected",
          UNTRIGGERED: "open"
        },
        "deposit-status": {
          NEW: "pending",
          COMPLETED: "ok"
        },
        "withdrawal-status": {
          NEW: "pending",
          REJECTED: "failed",
          AUDITED: "pending",
          PROCESSED: "pending",
          COMPLETED: "ok",
          CANCELED: "canceled",
          PENDING: "pending"
        }
      }
    });
  }

  async fetchMarkets(params = {}) {
    const symbols = await this.publicGetSymbols();
    return this.fnMap(this, symbols, this.castMarket);
  }

  async fetchTradingFees(params = {}) {
    throw new NotSupported(this.id + " fetchTradingFees not supported yet");
  }

  async fetchTicker(symbol, params = {}) {
    const candlesticks = await this.publicGetCandlesticksTypeSymbolHistory({
      path: {
        type: "1DAY",
        symbol: this.translateBaseFEXSymbol(this, symbol)
      },
      query: {
        limit: 1
      }
    });
    return this.castTicker(this, symbol, candlesticks[0]);
  }

  async fetchOrderBook(symbol) {
    const orderbookSource = await this.publicGetDepthSymbolSnapshot({
      path: {
        symbol: this.translateBaseFEXSymbol(this, symbol)
      }
    });
    return this.castOrderBook(this, orderbookSource);
  }

  sign(path, api = "public", method = "GET", params = {}, headers = undefined, body = undefined) {
    const url = this.urls["api"] + path;
    if (api === "private" && this.apiKey && this.secret) {
      let auth = method + path;
      let expires = this.options["api-expires"];
      expires = this.sum(this.seconds(), expires).toString();
      auth += expires;
      if (method === "POST" || method === "PUT" || method === "DELETE") {
        if (body && this.keys(body).length > 0) {
          body = this.json(body);
          auth += body;
        }
      }
      if (headers === undefined) {
        headers = {};
      }
      headers["api-key"] = this.apiKey;
      headers["api-expires"] = expires;
      headers["api-signature"] = this.hmac(this.encode(auth), this.encode(this.secret));
    }
    return { url: url, method: method, body: body, headers: headers };
  }

  request(path, type = "public", method = "GET", params = {}, headers = undefined, body = undefined) {
    const pathObj = this.safeValue(params, "path");
    if (pathObj) {
      path = this.implodeParams(path, pathObj);
    }
    path = "/" + path;
    const queryObj = this.safeValue(params, "query");
    if (queryObj) {
      const query = this.urlencode(queryObj);
      if (query !== "") {
        path += "?" + query;
      }
    }
    const headersObj = this.safeValue(params, "headers");
    headers = this.extend({ "Content-Type": "application/json" }, headersObj);
    body = this.safeValue(params, "body");
    return super.request(path, type, method, params, headers, body);
  }

  castMarket(itself, symbol) {
    const _base = itself.safeString(symbol, "baseCurrency");
    const _quote = itself.safeString(symbol, "quoteCurrency");
    return {
      id: itself.safeString(symbol, "symbol"),
      symbol: itself.translateSymbol(itself, _base, _quote),
      base: itself.capitalize(_base),
      quote: itself.capitalize(_quote),
      baseId: _base,
      quoteId: _quote,
      active: itself.safeValue(symbol, "enable"),
      precision: {
        price: itself.safeInteger(symbol, "priceStep")
      },
      limits: {},
      info: symbol
    };
  }

  castTicker(itself, symbol, candlestick) {
    const timestamp = itself.safeInteger(candlestick, "time");
    const open = itself.safeFloat(candlestick, "open");
    const close = itself.safeFloat(candlestick, "close");
    const last = close;
    const change = itself.sum(last, -open);
    const percentage = (change / open) * 100;
    const average = itself.sum(last, open) / 2;
    return {
      symbol: symbol,
      info: candlestick,
      timestamp: timestamp,
      datetime: itself.iso8601(timestamp),
      high: itself.safeFloat(candlestick, "high"),
      low: itself.safeFloat(candlestick, "low"),
      bid: undefined,
      bidVolume: undefined,
      ask: undefined,
      askVolume: undefined,
      vwap: itself.safeFloat(candlestick, "volume"),
      open: open,
      close: close,
      last: last,
      previousClose: undefined,
      change: change,
      percentage: percentage,
      average: average,
      baseVolume: undefined,
      quoteVolume: undefined
    };
  }

  castOrderBook(itself, source) {
    source.bids = itself.fnEntites(itself, itself.safeValue(source, "bids"));
    source.asks = itself.fnEntites(itself, itself.safeValue(source, "asks"));
    return itself.parseOrderBook(source);
  }

  translateSymbol(itself, base, quote) {
    return itself.capitalize(base) + "/" + itself.capitalize(quote);
  }

  translateBaseFEXSymbol(itself, symbol) {
    const semi = symbol.replace("/", "");
    return itself.capitalizeP(semi);
  }

  fnMap(itself, _array, callback, params) {
    const result = [];
    for (let i = 0; i < _array.length; i++) {
      result.push(callback(itself, _array[i], params));
    }
    return result;
  }

  fnFilter(itself, _array, predicate, params) {
    const result = [];
    for (let i = 0; i < _array.length; i++) {
      if (predicate(itself, _array[i], params)) {
        result.push(_array[i]);
      }
    }
    return result;
  }

  fnReverse(itself, _array) {
    const _last = _array.length - 1;
    const result = [];
    for (let i = 0; i < _array.length; i++) {
      result.push(_array[_last - i]);
    }
    return result;
  }

  fnEntites(itself, _object) {
    const _keys = itself.keys(_object);
    return itself.fnMap(itself, _keys, itself.fnEntity, _object);
  }

  fnEntity(itself, _key, _object) {
    return [_key, _object[_key]];
  }
};
