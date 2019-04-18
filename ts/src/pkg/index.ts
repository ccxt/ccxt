import { ExchangeConfig } from "./ccxt/models";
export {
  ExchangeInfo,
  ExchangeConfig,
  APIs,
  APIMethods,
  URLs,
  Exceptions,
  HasDescription,
  APIURLs,
  Fees,
  TradingFees,
  TradingFeesTiers,
  FundingFees,
  Account,
  Balance,
  Balances,
  Order,
  OrderBook,
  BookEntry,
  Trade,
  Ticker,
  Currency,
  DepositAddress,
  OHLCV,
  Market,
  Precision,
  Limits,
  MinMax
} from "./ccxt/models";
import bitmexInit from "../internal/app/bitmex/exchange";

export const bitmex = (config: ExchangeConfig) => new bitmexInit(config);
