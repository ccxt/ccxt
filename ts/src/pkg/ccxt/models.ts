export interface ExchangeConfig {
  apiKey: string;
  secret: string;
  timeout: number;
  enableRateLimit: boolean;
  test: boolean;
}

// ExchangeInfo for the exchange
export interface ExchangeInfo {
  id: string;
  name: string;
  countries: string[];
  version: string;
  enableRateLimit: boolean;
  rateLimit: number;
  has: HasDescription; //HasDescription
  urls: URLs; // URLs
  api: APIs;
  timeframes: Object;
  fees: Fees; // Fees
  userAgents: Object;
  header: Object; // http.Header
  proxy: string;
  origin: string;
  verbose: boolean;
  limits: Limits; // Limits
  precision: Precision; // Precision
  exceptions: Exceptions; // Exceptions
  dontGetUsedBalanceFromStaleCache: boolean;
}

// APIs public and private methods
export interface APIs {
  Public: APIMethods;
  Private: APIMethods;
}

// APIMethods get/post/put/delete urls
export interface APIMethods {
  Get: Object;
  Post: Object;
  Put: Object;
  Delete: Object;
}

// URLs for exchange
export interface URLs {
  www: string;
  test: string;
  api: string;
  logo: string;
  doc: string;
  fees: string;
}

// Exceptions takes exact/broad errors and classifies
// them to general errors
export interface Exceptions {
  exact: Object;
  broad: Object;
}

// HasDescription for exchange functionality
export interface HasDescription {
  cancelAllOrders: boolean;
  cancelOrder: boolean;
  cancelOrders: boolean;
  CORS: boolean;
  createDepositAddress: boolean;
  createLimitOrder: boolean;
  createMarketOrder: boolean;
  createOrder: boolean;
  deposit: boolean;
  editOrder: boolean;
  fetchBalance: boolean;
  fetchBidsAsks: boolean;
  fetchClosedOrders: boolean;
  fetchCurrencies: boolean;
  fetchDepositAddress: boolean;
  fetchDeposits: boolean;
  fetchFundingFees: boolean;
  fetchL2OrderBook: boolean;
  fetchLedger: boolean;
  fetchMarkets: boolean;
  fetchMyTrades: boolean;
  fetchOHLCV: boolean;
  fetchOpenOrders: boolean;
  fetchOrder: boolean;
  fetchOrderBook: boolean;
  fetchOrderBooks: boolean;
  fetchOrders: boolean;
  fetchTicker: boolean;
  fetchTickers: boolean;
  fetchTrades: boolean;
  fetchTradingFee: boolean;
  fetchTradingFees: boolean;
  fetchTradingLimits: boolean;
  fetchTransactions: boolean;
  fetchWithdrawals: boolean;
  privateAPI: boolean;
  publicAPI: boolean;
  withdraw: boolean;
}

// APIURLs for different types of urls
export interface APIURLs {
  public: string;
  private: string;
}

// Fees for using the exchange
export interface Fees {
  trading: TradingFees;
  funding: FundingFees;
}

// TradingFees on the exchange
export interface TradingFees {
  tierBased: boolean;
  percentage: boolean;
  maker: number;
  taker: number;
  tiers: TradingFeesTiers;
}

// TradingFeesTiers on the exchange
export interface TradingFeesTiers {
  taker: number[];
  maker: number[];
}

// FundingFees for using the exchange
export interface FundingFees {
  tierBased: boolean;
  percentage: boolean;
  deposit: { [k: string]: number };
  withdraw: { [k: string]: number };
}

// Account details
export interface Account {
  free: { [k: string]: number };
  used: { [k: string]: number };
  total: { [k: string]: number };
}

// Balance details
export interface Balance {
  free: number;
  used: number;
  total: number;
}

// Balances details
export interface Balances {
  currencies: { [k: string]: Balance };
  free: { [k: string]: number };
  used: { [k: string]: number };
  total: { [k: string]: number };
  info: Object;
}

// Order structure
export interface Order {
  id: string;
  timestamp: Date;
  datetime: string;
  symbol: string;
  status: string;
  type: string;
  side: string;
  price: number;
  cost: number;
  amount: number;
  filled: number;
  remaining: number;
  fee: number;
  info: Object;
}

// OrderBook struct
export interface OrderBook {
  asks: BookEntry[];
  bids: BookEntry[];
  timestamp: Date;
  datetime: string;
  nonce: number;
}

// BookEntry struct
export interface BookEntry {
  price: number;
  amount: number;
}

// Trade struct
export interface Trade {
  id: string;
  symbol: string;
  amount: number;
  price: number;
  timestamp: Date;
  datetime: string;
  order: string;
  type: string;
  side: string;
  info: Object;
}

// ;
export interface Ticker {
  symbol: string;
  ask: number;
  bid: number;
  high: number;
  low: number;
  average: number;
  baseVolume: number;
  quoteVolume: number;
  change: number;
  open: number;
  close: number;
  first: number;
  last: number;
  percentage: number;
  vwap: number;
  timestamp: Date;
  datetime: string;
  info: Object;
}

// Currency struct
export interface Currency {
  id: string;
  code: string;
  NumericId: string;
  precision: number;
}

// DepositAddress struct
export interface DepositAddress {
  currency: string;
  address: string;
  status: string;
  info: Object;
}

// OHLCV open, high, low, close, volume
export interface OHLCV {
  timestamp: Date;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

// Market struct
export interface Market {
  id: string;
  symbol: string;
  base: string;
  baseNumericId: string;
  quote: string;
  quoteNumericId: string;
  baseId: string;
  quoteId: string;
  active: boolean;
  taker: number;
  maker: number;
  type: string;
  spot: boolean;
  swap: boolean;
  future: boolean;
  prediction: boolean;
  precision: Precision;
  limits: Limits;
  lot: number;
  info: Object;
}

// Precision struct
export interface Precision {
  amount: number;
  base: number;
  price: number;
  cost: number;
}

// Limits struct
export interface Limits {
  amount: MinMax;
  price: MinMax;
  cost: MinMax;
}

// MinMax struct
export interface MinMax {
  min: number;
  max: number;
}
