"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require("./base/Exchange");
const { TICK_SIZE } = require("./base/functions/number");
const {
  AuthenticationError,
  BadRequest,
  DDoSProtection,
  ExchangeError,
  ExchangeNotAvailable,
  InsufficientFunds,
  InvalidOrder,
  OrderNotFound,
  PermissionDenied
} = require("./base/errors");

//  ---------------------------------------------------------------------------
module.exports = class basefex extends Exchange {
  describe() {
    return {
      id: basefex,
      name: BaseFEX,
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
        //TODO
      },
      timeframes: {
        "1m": "1m",
        "5m": "5m",
        "1h": "1h",
        "1d": "1d"
      }, // redefine if the exchange has.fetchOHLCV . TODO
      exceptions: undefined, //TODO
      precisionMode: DECIMAL_PLACES //TODO
    };
  }
};
