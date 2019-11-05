"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require("./base/Exchange");
// const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError } = require("./base/errors");

//  ---------------------------------------------------------------------------
module.exports = class basefex extends Exchange {
  describe() {
    return {
      id: "basefex",
      name: "BaseFEX",
      countries: ["SC"], // TODO
      enableRateLimit: true,
      rateLimit: 2000, // milliseconds TODO
      has: {
        CORS: false,
        fetchMarkets: false,
        fetchCurrencies: false,
        fetchTradingLimits: false,
        fetchTradingFees: false,
        fetchFundingLimits: false,
        fetchTicker: false,
        fetchOrderBook: false,
        fetchTrades: false,
        fetchOHLCV: false,
        fetchBalance: false,
        createOrder: false,
        cancelOrder: false,
        editOrder: false,
        fetchOrder: false,
        fetchOpenOrders: false,
        fetchAllOrders: false,
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
            "/v1/orderbook/{symbol}",
            "/v1/ticker",
            "/v1/trades/{symbol}",
            "/v1/summary",
            "/instruments/prices",
            "/instruments/difference",
            "/dateuuid",
            "/depth@{symbol}/snapshot",
            "/instruments"
          ]
        },
        private: {
          get: [
            "/orders",
            "/orders/{id}",
            "/orders/opening",
            "/orders/count",
            "/orders/opening/count",
            "/positions/{symbol}/adl-ranking",
            "/trades",
            "/trades/count",
            "/accounts",
            "/accounts/transactions/uncompleted",
            "/accounts/equity",
            "/accounts/transactions",
            "/accounts/transactions/count"
          ],
          post: [
            "/orders",
            "/orders/batch",
            "/positions/{symbol}/margin/estimation"
          ],
          put: ["/positions/{symbol}/margin", "/positions/{symbol}/risk-limit"],
          delete: [
            "/orders",
            "/orders/batch",
            "/orders/{id}",
            "/positions/{symbol}",
            "/accounts/withdraws/{id}"
          ]
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
        498: AuthenticationError
      },
      // 'precisionMode': DECIMAL_PLACES, // TODO
      options: {
        "api-expires": 10 // in seconds
      }
    };
  }

  //override
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
      let auth = method + path,
        expires = this.safeInteger(this.options, "api-expires");

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

  //override
  request(
    path,
    type = "public",
    method = "GET",
    params = {},
    headers = { "Content-Type": "application/json" },
    body = undefined
  ) {
    const { path: pathObj, query: queryObj } = params;
    if (pathObj) {
      path = localTool.makePath(path, pathObj);
    }
    if (queryObj) {
      path += `?${this.urlencode(queryObj)}`;
    }
    return super.request(path, type, method, params, headers, body);
  }
};

const localTool = {
  makePath(path, pathObj) {
    return String(path).replace(/{.+?}/g, match => {
      const key = match.substring(1, match.length - 1);
      return pathObj[key];
    });
  }
};
