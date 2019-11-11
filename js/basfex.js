"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require("./base/Exchange");
// const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError } = require("./base/errors");

//  ---------------------------------------------------------------------------

module.exports = class basefex extends Exchange {
  describe() {
    return this.deepExtend(super.describe(), {
      id: "basefex",
      name: "BaseFEX",
      countries: ["SC"], // TODO
      enableRateLimit: true,
      rateLimit: 2000, // milliseconds TODO
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
        logo:
          "https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg", // todo
        api: "https://next-api.basefex.com", // todo
        www: "https://www.basefex.com",
        doc: [
          "https://github.com/BaseFEX/basefex-api-docs",
          "https://github.com/BaseFEX/basefex-api-docs/blob/master/api-doc_en.md"
        ],
        fees: "https://www.basefex.com/docs/fees",
        referral: "https://www.basefex.com/register/76VqmL"
      },
      api: {
        public: {
          get: [
            "symbols",
            "spec/kvs",
            "candlesticks/{type}@{symbol}/history",
            "depth@{symbol}/snapshot",
            "v1/trades/{symbol}"
          ]
        },
        private: {
          get: [
            "accounts",
            "orders/{id}",
            "orders",
            "trades",
            "accounts/deposits/{currency}/address",
            "accounts/transactions"
          ],
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
      }, // redefine if the exchange has.fetchOHLCV
      exceptions: {}, // TODO
      httpExceptions: {
        "498": AuthenticationError
      },
      // 'precisionMode': DECIMAL_PLACES, // TODO
      options: {
        "api-expires": 10, // in seconds
        "kvs-key": [
          "maker-fee-rate",
          "taker-fee-rate",
          "long-funding-rate",
          "short-funding-rate",
          "funding-interval"
        ],
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

  async fetchMarkets() {
    const symbols = await this.publicGetSymbols();
    return this.fnMap(this, symbols, this.castMarket);
  }

  sign(path, api = "public", method = "GET", params = {}, headers = {}, body) {
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
      headers["api-key"] = this.apiKey;
      headers["api-expires"] = expires;
      headers["api-signature"] = this.hmac(
        this.encode(auth),
        this.encode(this.secret)
      );
    }
    return { url: url, method: method, body: body, headers: headers };
  }

  handleErrors(
    statusCode,
    statusText,
    url,
    method,
    responseHeaders,
    responseBody,
    response,
    requestHeaders,
    requestBody
  ) {
    // override me
  }

  request(path, type = "public", method = "GET", params = {}) {
    //params={path,query,headers,body}
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
    const headers = this.extend(
      { "Content-Type": "application/json" },
      headersObj
    );
    const body = this.safeValue(params, "body");

    return super.request(path, type, method, params, headers, body);
  }

  castMarket(itself = this, symbol) {
    const _base = itself.safeString(symbol, "baseCurrency");
    const _quote = itself.safeString(symbol, "quoteCurrency");
    return {
      id: itself.safeString(symbol, "symbol"), // string literal for referencing within an exchange
      symbol: itself.translateSymbol(itself, _base, _quote), // uppercase string literal of a pair of currencies
      base: itself.capitalize(_base), // uppercase string, unified base currency code, 3 or more letters
      quote: itself.capitalize(_quote), // uppercase string, unified quote currency code, 3 or more letters
      baseId: _base, // any string, exchange-specific base currency id
      quoteId: _quote, // any string, exchange-specific quote currency id
      active: itself.safeValue(symbol, "enable"), // boolean, market status
      precision: {
        // number of decimal digits "after the dot"
        price: itself.safeInteger(symbol, "priceStep") // integer or float for TICK_SIZE roundingMode, might be missing if not supplied by the exchange
        // amount: 8, // integer, might be missing if not supplied by the exchange
        // cost: 8 // integer, very few exchanges actually have it
      },
      limits: {
        // value limits when placing orders on this market
        // amount: {
        //   min: 0.01, // order amount should be > min
        //   max: 1000 // order amount should be < max
        // },
        // price: {}, // same min/max limits for the price of the order
        // cost: {} // same limits for order cost = price * amount
      },
      info: symbol // the original unparsed market info from the exchange
    };
  }

  translateSymbol(itself = this, base, quote) {
    return itself.capitalize(base) + "/" + itself.capitalize(quote);
  }

  fnMap(itself = this, _array, callback, params) {
    const result = [];
    for (let i = 0; i < _array.length; i++) {
      result.push(callback(itself, _array[i], params));
    }
    return result;
  }

  fnFilter(itself = this, _array, predicate, params) {
    const result = [];
    for (let i = 0; i < _array.length; i++) {
      if (predicate(itself, _array[i], params)) {
        result.push(_array[i]);
      }
    }
    return result;
  }

  fnReverse(itself = this, _array) {
    const result = [];
    for (let i = _array.length - 1; i >= 0; i--) {
      result.push(_array[i]);
    }
    return result;
  }
};
