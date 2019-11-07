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
        fetchTrades: true,
        fetchOHLCV: true,
        fetchBalance: true,
        createOrder: true,
        cancelOrder: true,
        editOrder: "emulated",
        fetchOrder: true,
        fetchOpenOrders: true,
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
            "depth@{symbol}/snapshot",
            "v1/trades/{symbol}"
          ]
        },
        private: {
          get: ["accounts"],
          post: [],
          put: [],
          delete: []
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
        ]
      }
    });
  }

  async fetchMarkets() {
    /*
    fetchMarkets (): Fetches a list of all available markets from an exchange and returns an array of markets (objects with properties such as symbol, base, quote etc.). Some exchanges do not have means for obtaining a list of markets via their online API. For those, the list of markets is hardcoded.
    */
    const symbols = await this.publicGetSymbols();
    return symbols.map(this.castMarket.bind(this));
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
        type: "1DAY",
        symbol: this.translateBaseFEXSymbol(symbol)
      },
      query: {
        limit: 1
      }
    });
    return this.castTicker(symbol, candlesticks[0]);
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

    return this.castOrderBook(orderbookSource);
  }

  async fetchTrades(symbol) {
    /*
    fetchTrades (symbol[, since[, [limit, [params]]]]): Fetch recent trades for a particular trading symbol.
    */
    const trades = await this.publicGetV1TradesSymbol({
      path: { symbol: this.translateBaseFEXSymbol(symbol) }
    });

    return trades.map(this.castTrade.bind(this, symbol));
  }

  async fetchOHLCV(
    symbol,
    timeframe = "1m",
    since = undefined,
    limit = undefined
  ) {
    let from = undefined;
    let to = undefined;
    if (since > 0) {
      from = this.ymdhms(since);
      to = this.ymdhms(this.milliseconds());
    }
    const ohlcv = await this.publicGetCandlesticksTypeSymbolHistory({
      path: {
        type: this.timeframes[timeframe],
        symbol: this.translateBaseFEXSymbol(symbol)
      },
      query: {
        limit,
        from,
        to
      }
    });

    const result = ohlcv.map(this.castOHLCV.bind(this));
    result.reverse();
    return result;
  }

  async fetchBalance() {
    /*
    fetchBalance (): Fetch Balance.
    */
    const accounts = await this.privateGetAccounts();
    return this.castBalance(accounts);
  }

  async createOrder() {
    /*
    createOrder (symbol, type, side, amount[, price[, params]])
    */
  }

  async cancelOrder() {
    /*
    cancelOrder (id[, symbol[, params]])
    */
  }

  async fetchOrder() {
    /*
    fetchOrder (id[, symbol[, params]])
    */
  }

  async fetchOpenOrders() {
    /*
    fetchMyTrades ([symbol[, since[, limit[, params]]]])
    */
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
    headers = {},
    body = undefined
  ) {
    path = "/" + path;
    headers["Content-Type"] = "application/json";

    const { path: pathObj, query: queryObj } = params;
    if (pathObj) {
      path = localTool.makePath(path, pathObj);
    }
    if (queryObj) {
      path += `?${this.urlencode(queryObj)}`;
    }
    return super.request(path, type, method, params, headers, body);
  }

  castMarket(symbol) {
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

  castFee(kvs) {
    return {
      // type: takerOrMaker,
      // currency: "BTC", // the unified fee currency code
      // rate: percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
      // cost: feePaid // the fee cost (amount * fee rate)
    };
  }

  castTicker(symbol, candlestick) {
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

  castOrderBook(source) {
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

  castTrade(symbol, trade) {
    return {
      info: trade, // the original decoded JSON as is
      id: trade.id, // string trade id
      timestamp: trade.matchedAt, // Unix timestamp in milliseconds
      datetime: this.iso8601(trade.matchedAt), // ISO8601 datetime with milliseconds
      symbol: symbol, // symbol
      order: undefined, // string order id or undefined/None/null
      type: undefined, // order type, 'market', 'limit' or undefined/None/null
      side: trade.side.toLowerCase(), // direction of the trade, 'buy' or 'sell'
      price: trade.price, // float price in quote currency
      amount: trade.size // amount of base currency
    };
  }

  castOHLCV(candlestick) {
    return [
      candlestick.time, // UTC timestamp in milliseconds, integer
      candlestick.open, // (O)pen price, float
      candlestick.high, // (H)ighest price, float
      candlestick.low, // (L)owest price, float
      candlestick.close, // (C)losing price, float
      candlestick.volume // (V)olume (in terms of the base currency), float
    ];
  }

  castBalance(accounts) {
    accounts = accounts.map(item => item.cash);
    const balance = {
      info: accounts, // the original untouched non-parsed reply with details

      //-------------------------------------------------------------------------
      // indexed by availability of funds first, then by currency

      free: {
        // money, available for trading, by currency
        // BTC: 321.0, // floats...
        // USD: 123.0
      },

      used: {}, // money on hold, locked, frozen, or pending, by currency

      total: {} // total (free + used), by currency

      //-------------------------------------------------------------------------
      // indexed by currency first, then by availability of funds

      // BTC: {
      //   // string, three-letter currency code, uppercase
      //   free: 321.0, // float, money available for trading
      //   used: 234.0, // float, money on hold, locked, frozen or pending
      //   total: 555.0 // float, total balance (free + used)
      // },

      // USD: {
      //   // ...
      //   free: 123.0, // ...
      //   used: 456.0,
      //   total: 579.0
      // }
    };

    for (const cash of accounts) {
      const currency = cash.currency;
      const total = cash.marginBalances;
      const free = cash.available;
      const used = total - free;

      balance.free[currency] = free;
      balance.used[currency] = used;
      balance.total[currency] = total;

      balance[currency] = {
        free,
        used,
        total
      };
    }

    return balance;
  }

  castOrder() {
    return {
      id: "12345-67890:09876/54321", // string
      datetime: "2017-08-17 12:42:48.000", // ISO8601 datetime of 'timestamp' with milliseconds
      timestamp: 1502962946216, // order placing/opening Unix timestamp in milliseconds
      lastTradeTimestamp: 1502962956216, // Unix timestamp of the most recent trade on this order
      status: "open", // 'open', 'closed', 'canceled'
      symbol: "ETH/BTC", // symbol
      type: "limit", // 'market', 'limit'
      side: "buy", // 'buy', 'sell'
      price: 0.06917684, // float price in quote currency
      amount: 1.5, // ordered amount of base currency
      filled: 1.1, // filled amount of base currency
      remaining: 0.4, // remaining amount to fill
      cost: 0.076094524, // 'filled' * 'price' (filling price used where available)
      trades: [], // a list of order trades/executions
      fee: {
        // fee info, if available
        currency: "BTC", // which currency the fee is (usually quote)
        cost: 0.0009, // the fee amount in that currency
        rate: 0.002 // the fee rate (if available)
      },
      info: {} // the original unparsed order structure as is
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
