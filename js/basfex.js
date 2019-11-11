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
};
