import * as ccxt from '../../../pkg/ccxt/models';
import ExchangeAPI from './api';

export default class Exchange extends ExchangeAPI {
  markets: Object; // map[string]ccxt.Market
  marketsById: Object; // map[string]ccxt.Market
  ids: string[];
  symbols: string[];
  currencies: Object; // map[string]ccxt.Currency
  currenciesById: Object; // map[string]ccxt.Currency
  constructor(config: ccxt.ExchangeConfig) {
    super(config);
    this.markets = {};
    this.marketsById = {};
    this.ids = [];
    this.symbols = [];
    this.currencies = {};
    this.currenciesById = {};
  }
}
