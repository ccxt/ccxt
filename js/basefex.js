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
    return this.castTicker(this, candlesticks[0], symbol);
  }

  async fetchOrderBook(symbol) {
    const orderbookSource = await this.publicGetDepthSymbolSnapshot({
      path: {
        symbol: this.translateBaseFEXSymbol(this, symbol)
      }
    });
    return this.castOrderBook(this, orderbookSource);
  }

  async fetchTrades(symbol) {
    const trades = await this.publicGetV1TradesSymbol({
      path: { symbol: this.translateBaseFEXSymbol(this, symbol) }
    });
    return this.fnMap(this, trades, this.castTrade, symbol);
  }

  async fetchOHLCV(symbol, timeframe = "1m", since = undefined, limit = undefined, params = {}) {
    let _from = undefined;
    let _to = undefined;
    if (since > 0) {
      _from = this.ymdhms(since);
      _to = this.ymdhms(this.milliseconds());
    }
    const query = {
      limit: limit,
      from: _from,
      to: _to
    };
    const ohlcv = await this.publicGetCandlesticksTypeSymbolHistory({
      path: {
        type: this.timeframes[timeframe],
        symbol: this.translateBaseFEXSymbol(this, symbol)
      },
      query: this.extend(query, params.query)
    });
    let result = this.fnMap(this, ohlcv, this.castOHLCV);
    result = this.fnReverse(this, result);
    return result;
  }

  async fetchBalance(params = {}) {
    const accounts = await this.privateGetAccounts();
    return this.castBalance(this, accounts);
  }

  async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
    const body = {
      symbol: this.translateBaseFEXSymbol(this, symbol),
      type: this.translateBaseFEXOrderType(this, type),
      side: this.translateBaseFEXOrderSide(this, side),
      size: amount,
      price: price
    };
    const order = await this.privatePostOrders({
      body: this.extend(body, params.body)
    });
    return this.castOrder(this, order, symbol);
  }

  async cancelOrder(id, symbol = undefined, params = {}) {
    await this.privateDeleteOrdersId({
      path: {
        id
      }
    });
  }

  async fetchOrder(id, symbol = undefined, params = {}) {
    const order = await this.privateGetOrdersId({
      path: {
        id
      }
    });
    return this.castOrder(this, order, symbol);
  }

  async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
    const query = {
      symbol: this.translateBaseFEXSymbol(this, symbol),
      limit: limit
    };
    let orders = await this.privateGetOrders({
      query: this.extend(query, params.query)
    });
    orders = this.fnFilter(this, orders, this.loIsOpenOrder);
    return this.fnMap(this, orders, this.castOrder, symbol);
  }

  async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
    const query = {
      symbol: this.translateBaseFEXSymbol(this, symbol),
      limit: limit
    };
    const trades = await this.privateGetTrades({
      query: this.extend(query, params.query)
    });
    return this.fnMap(this, trades, this.castMyTrade, symbol);
  }

  async fetchDepositAddress(code, params = {}) {
    const depositAddress = await this.privateGetAccountsDepositsCurrencyAddress({
      path: {
        currency: code
      }
    });
    return this.castDepositAddress(this, depositAddress, code);
  }

  async fetchDeposits(symbol = undefined, since = undefined, limit = undefined, params = {}) {
    const query = {
      type: "DEPOSIT"
    };
    params = this.extend({ query }, params);
    return this.fetchTransactions(symbol, since, limit, params);
  }

  async fetchWithdrawals(symbol = undefined, since = undefined, limit = undefined, params = {}) {
    const query = {
      type: "WITHDRAW"
    };
    params = this.extend({ query }, params);
    return this.fetchTransactions(symbol, since, limit, params);
  }

  async fetchTransactions(symbol = undefined, since = undefined, limit = undefined, params = {}) {
    const query = {
      limit: limit
    };
    let transactions = await this.privateGetAccountsTransactions({
      query: this.extend(query, params.query)
    });
    if (symbol) {
      transactions = this.fnFilter(this, transactions, this.loCurrencyEqual, symbol);
    }
    return this.fnMap(this, transactions, this.castTransaction);
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

  castTicker(itself, candlestick, symbol) {
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

  castTrade(itself, trade, symbol) {
    const _timestamp = itself.safeInteger(trade, "matchedAt");
    return {
      info: trade,
      id: itself.safeString(trade, "id"),
      timestamp: _timestamp,
      datetime: itself.iso8601(_timestamp),
      symbol: symbol,
      order: undefined,
      type: undefined,
      side: itself.translateOrderSide(itself, itself.safeString(trade, "side")),
      price: itself.safeFloat(trade, "price"),
      amount: itself.safeFloat(trade, "size")
    };
  }

  castOHLCV(itself, candlestick) {
    return [itself.safeInteger(candlestick, "time"), itself.safeFloat(candlestick, "open"), itself.safeFloat(candlestick, "high"), itself.safeFloat(candlestick, "low"), itself.safeFloat(candlestick, "close"), itself.safeFloat(candlestick, "volume")];
  }

  castBalance(itself, accounts) {
    accounts = itself.fnMap(itself, accounts, itself.fnPick, "cash");
    const balance = {
      info: accounts,
      free: {},
      used: {},
      total: {}
    };
    for (let i = 0; i < accounts.length; i++) {
      const cash = accounts[0];
      const currency = itself.safeString(cash, "currency");
      const total = itself.safeFloat(cash, "marginBalances");
      const free = itself.safeFloat(cash, "available");
      const used = itself.sum(total, -free);
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

  castOrder(itself, order, symbol) {
    const _timestamp = itself.safeInteger(order, "ts");
    const price = itself.safeFloat(order, "price");
    const amount = itself.safeFloat(order, "size");
    const filled = itself.safeFloat(order, "filled");
    const remaining = itself.sum(amount, -filled);
    const cost = filled * price;
    return {
      id: order.id,
      datetime: itself.iso8601(_timestamp),
      timestamp: _timestamp,
      lastTradeTimestamp: undefined,
      status: itself.options["order-status"][order.status],
      symbol: symbol,
      type: itself.translateOrderType(itself, itself.safeString(order, "type")),
      side: itself.translateOrderSide(itself, itself.safeString(order, "side")),
      price: price,
      amount: amount,
      filled: filled,
      remaining: remaining,
      cost: cost,
      trades: undefined,
      fee: undefined,
      info: order
    };
  }

  castMyTrade(itself, trade, symbol) {
    const _timestamp = itself.safeInteger(trade, "ts");
    const _order = itself.safeValue(trade, "order");
    let _type = undefined;
    if (_order) {
      _type = itself.translateOrderType(itself, itself.safeString(_order, "type"));
    }
    return {
      info: trade,
      id: itself.safeString(trade, "id"),
      timestamp: _timestamp,
      datetime: itself.iso8601(_timestamp),
      symbol: symbol,
      order: itself.safeString(trade, "orderId"),
      type: _type,
      side: itself.translateOrderSide(itself, itself.safeString(_order, "side")),
      price: itself.safeFloat(trade, "price"),
      amount: itself.safeFloat(trade, "size")
    };
  }

  castDepositAddress(itself, address, currency) {
    return {
      currency: currency,
      address: itself.safeString(address, "address"),
      tag: undefined,
      info: address
    };
  }

  castTransaction(itself, transaction) {
    const _type = itself.translateTransactionType(itself, itself.safeString(transaction, "type"));
    const _timestamp = itself.safeInteger(transaction, "ts");
    return {
      info: transaction,
      id: itself.safeString(transaction, "id"),
      txid: itself.safeString(transaction, "foreignTxId"),
      timestamp: _timestamp,
      datetime: itself.iso8601(_timestamp),
      addressFrom: undefined,
      address: itself.safeString(transaction, "address"),
      addressTo: undefined,
      tagFrom: undefined,
      tag: undefined,
      tagTo: undefined,
      type: _type,
      amount: itself.safeFloat(transaction, "amount"),
      currency: itself.safeString(transaction, "currency"),
      status: itself.options[_type + "-status"][itself.safeString(transaction, "status")],
      updated: undefined,
      comment: itself.safeString(transaction, "node"),
      fee: {
        currency: itself.safeString(transaction, "currency"),
        cost: itself.safeFloat(transaction, "fee"),
        rate: undefined
      }
    };
  }

  translateSymbol(itself, base, quote) {
    return itself.capitalize(base) + "/" + itself.capitalize(quote);
  }

  translateBaseFEXSymbol(itself, symbol) {
    const semi = symbol.replace("/", "");
    return itself.capitalize(semi);
  }

  translateOrderSide(itself, side) {
    return itself.unCamelCase(side);
  }

  translateBaseFEXOrderSide(itself, side) {
    return itself.capitalize(side);
  }

  translateOrderType(itself, type) {
    return itself.unCamelCase(type);
  }

  translateBaseFEXOrderType(itself, type) {
    return itself.capitalize(type);
  }

  translateTransactionType(itself, type) {
    if (type === "WITHDRAW") {
      return "withdrawal";
    } else if (type === "DEPOSIT") {
      return "deposit";
    }
  }

  translateBaseFEXTransactionType(itself, type) {
    if (type === "withdrawal") {
      return "WITHDRAW";
    } else if (type === "deposit") {
      return "DEPOSIT";
    }
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

  fnPick(itself, _object, _key) {
    return _object[_key];
  }

  fnEqual(itself, a, b) {
    return a === b;
  }

  loIsOpenOrder(itself, order) {
    return itself.options["order-status"][itself.safeString(order, "status")] === "open";
  }

  loCurrencyEqual(itself, _object, currency) {
    return itself.safeString(_object, "currency") === currency;
  }
};
