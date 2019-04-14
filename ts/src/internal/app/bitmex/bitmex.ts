import * as ccxt from '../../../pkg/ccxt/models';

interface Exchange {
  Client: Object; //*http.Client
  Info: ccxt.ExchangeInfo;
  Config: ccxt.ExchangeConfig;
  Markets: Object; // map[string]ccxt.Market
  MarketsByID: Object; // map[string]ccxt.Market
  IDs: string[];
  Symbols: string[];
  Currencies: Object; // map[string]ccxt.Currency
  CurrenciesByID: Object; // map[string]ccxt.Currency
}

// Init Exchange
function Init(conf: ccxt.ExchangeConfig): Exchange {
  const configFile =
    '/Users/stefan/Github/ccxt/go/internal/app/bitmex/bitmex.json';
  const info = require(configFile);
  let timeout = 10 * 1000;
  if (conf.timeout > 0) {
    timeout = conf.timeout;
  }
  const client = require('axios');
  const exchange: Exchange = {
    Config: info,
    Client: client,
    Info: info,
    Markets: {},
    MarketsByID: {},
    IDs: [],
    Symbols: [],
    Currencies: {},
    CurrenciesByID: {},
  };
  return exchange;
}

export { Init };
