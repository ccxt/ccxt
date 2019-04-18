import axios, { AxiosInstance } from "axios";

const reDatestring = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

export default class Exchange {
  client: AxiosInstance; //*http.Client
  markets: Object; // map[string]ccxt.Market
  marketsById: Object; // map[string]ccxt.Market
  ids: string[];
  symbols: string[];
  currencies: Object; // map[string]ccxt.Currency
  currenciesById: Object; // map[string]ccxt.Currency
  constructor() {
    this.client = axios.create({
      transformResponse: function(json) {
        return JSON.parse(json, (_, v) => {
          if (typeof v === "string" && reDatestring.test(v)) {
            return new Date(v);
          }
          return v;
        });
      }
    });
    this.markets = {};
    this.marketsById = {};
    this.ids = [];
    this.symbols = [];
    this.currencies = {};
    this.currenciesById = {};
  }
}
