interface ExchangeConfig {
  apiKey: string;
  secret: string;
  timeout: number;
  enableRateLimit: boolean;
  test: boolean;
}

// ExchangeInfo for the exchange
interface ExchangeInfo {
  id: string;
  name: string;
  countries: string[];
  version: string;
  enableRateLimit: boolean;
  rateLimit: number;
  has: Object; //HasDescription
  urls: Object; // URLs
  api: Object; // APIs
  timeframes: Object;
  fees: Object; // Fees
  userAgents: Object;
  header: Object; // http.Header
  proxy: string;
  origin: string;
  verbose: boolean;
  limits: Object; // Limits
  precision: Object; // Precision
  exceptions: Object; // Exceptions
  dontGetUsedBalanceFromStaleCache: boolean;
}

export { ExchangeConfig, ExchangeInfo };
