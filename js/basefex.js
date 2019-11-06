"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require("./base/Exchange");
// const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError } = require("./base/errors");
//  ---------------------------------------------------------------------------
const localTool = {
  makePath(path, pathObj) {
    return String(path).replace(/{.+?}/g, match => {
      const key = match.substring(1, match.length - 1);
      return pathObj[key];
    });
  }
};

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
        fetchTrades: false,
        fetchOHLCV: false,
        fetchBalance: false,
        createOrder: false,
        cancelOrder: false,
        editOrder: false,
        fetchOrder: false,
        fetchOpenOrders: false,
        fetchMyTrades: false,
        fetchDepositAddress: false,
        fetchDeposits: false,
        fetchWithdrawals: false,
        fetchTransactions: false,
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
            "depth@{symbol}/snapshot"
          ]
        },
        private: {
          get: [],
          post: [],
          put: [],
          delete: []
        }
      },
      timeframes: {
        "1m": "1m",
        "5m": "5m",
        "1h": "1h",
        "1d": "1d"
      }, // redefine if the exchange has.fetchOHLCV . TODO
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
        ]
      }
    });
  }

  async fetchMarkets() {
    /*
    fetchMarkets (): Fetches a list of all available markets from an exchange and returns an array of markets (objects with properties such as symbol, base, quote etc.). Some exchanges do not have means for obtaining a list of markets via their online API. For those, the list of markets is hardcoded.
    */
    const symbols = await this.publicGetSymbols();
    return symbols.map(this.convertMarket.bind(this));
  }

  async fetchTradingFees(params = {}) {
    throw new NotSupported(this.id + " fetchTradingFees not supported yet");
  }

  async fetchTicker(symbol) {
    /*
    fetchTicker (symbol): Fetch latest ticker data by trading symbol.
    */
    const candlesticks = await this.publicGetCandlesticksTypeSymbolHistory({
      path: {
        type: "12H",
        symbol: this.translateBaseFEXSymbol(symbol)
      },
      query: {
        limit: 1
      }
    });
    return this.convertTicker(symbol, candlesticks[0]);
  }

  async fetchOrderBook(symbol) {
    /*
    fetchOrderBook (symbol[, limit = undefined[, params = {}]]): Fetch L2/L3 order book for a particular market trading symbol.
    */
    const orderbookSource = await this.publicGetDepthSymbolSnapshot({
      path: {
        symbol: this.translateBaseFEXSymbol(symbol)
      }
    });

    return this.convertOrderBook(orderbookSource);
  }

  sign(
    path,
    api = "public",
    method = "GET",
    params = {},
    headers = {},
    body = undefined
  ) {
    const url = this.urls["api"] + path;
    if (api === "private" && this.apiKey && this.secret) {
      let auth = method + path;
      let expires = this.options["api-expires"];
      expires = this.sum(this.seconds(), expires).toString();
      auth += expires;
      if (method === "POST" || method === "PUT" || method === "DELETE") {
        if (body && Object.keys(body).length) {
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

  request(
    path,
    type = "public",
    method = "GET",
    params = {},
    headers = { "Content-Type": "application/json" },
    body = undefined
  ) {
    path = "/" + path;

    const { path: pathObj, query: queryObj } = params;
    if (pathObj) {
      path = localTool.makePath(path, pathObj);
    }
    if (queryObj) {
      path += `?${this.urlencode(queryObj)}`;
    }
    return super.request(path, type, method, params, headers, body);
  }

  convertMarket(symbol) {
    return {
      id: symbol.symbol, // string literal for referencing within an exchange
      symbol: this.translateSymbol(symbol.baseCurrency, symbol.quoteCurrency), // uppercase string literal of a pair of currencies
      base: this.safeStringUpper(symbol, "baseCurrency"), // uppercase string, unified base currency code, 3 or more letters
      quote: this.safeStringUpper(symbol, "quoteCurrency"), // uppercase string, unified quote currency code, 3 or more letters
      baseId: symbol.baseCurrency, // any string, exchange-specific base currency id
      quoteId: symbol.quoteCurrency, // any string, exchange-specific quote currency id
      active: symbol.enable, // boolean, market status
      precision: {
        // number of decimal digits "after the dot"
        price: symbol.priceStep // integer or float for TICK_SIZE roundingMode, might be missing if not supplied by the exchange
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

  convertFee(kvs) {
    return {
      // type: takerOrMaker,
      // currency: "BTC", // the unified fee currency code
      // rate: percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
      // cost: feePaid // the fee cost (amount * fee rate)
    };
  }

  convertTicker(symbol, candlestick) {
    const open = candlestick.open;
    const close = candlestick.close;
    const last = close;
    const change = last - open;
    const percentage = (change / open) * 100;
    const average = (last + open) / 2;
    return {
      symbol: symbol, //string symbol of the market ('BTC/USD', 'ETH/BTC', ...)
      info: candlestick, // the original non-modified unparsed reply from exchange API
      timestamp: candlestick.time, // int (64-bit Unix Timestamp in milliseconds since Epoch 1 Jan 1970)
      datetime: this.iso8601(candlestick.time), //ISO8601 datetime string with milliseconds
      high: candlestick.high, // highest price
      low: candlestick.low, // lowest price
      bid: undefined, // current best bid (buy) price
      bidVolume: undefined, // current best bid (buy) amount (may be missing or undefined)
      ask: undefined, // current best ask (sell) price
      askVolume: undefined, // current best ask (sell) amount (may be missing or undefined)
      vwap: candlestick.volume, // volume weighed average price
      open: open, // opening price
      close: close, // price of last trade (closing price for current period)
      last: last, // same as `close`, duplicated for convenience
      previousClose: undefined, // closing price for the previous period
      change: change, // absolute change, `last - open`
      percentage: percentage, // relative change, `(change/open) * 100`
      average: average, // average price, `(last + open) / 2`
      baseVolume: undefined, // volume of base currency traded for last 24 hours
      quoteVolume: undefined // volume of quote currency traded for last 24 hours
    };
  }

  convertOrderBook(source) {
    const sortBook = function(book, desc) {
      const sortedKeyPairs = Object.keys(book).map(key => [
        key,
        Number.parseFloat(key)
      ]);
      sortedKeyPairs.sort(([, a], [, b]) => a - b);
      if (desc) {
        sortedKeyPairs.reverse();
      }
      return sortedKeyPairs.map(([key, price]) => [price, book[key]]);
    };

    return {
      // [ price, amount ]
      // [ float, float ]
      bids: sortBook(source.bids, true),
      asks: sortBook(source.bids, false),
      timestamp: undefined, // Unix Timestamp in milliseconds (seconds * 1000)
      datetime: undefined // ISO8601 datetime string with milliseconds
    };
  }

  translateSymbol(base, quote) {
    return `${String(base).toUpperCase()}/${String(quote).toUpperCase()}`;
  }

  translateBaseFEXSymbol(symbol) {
    return String(symbol)
      .replace("/", "")
      .toUpperCase();
  }
};
