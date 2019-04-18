import * as ccxt from '../../../pkg/ccxt/models';
import ExchangeAPI from './api';

export default class Exchange extends ExchangeAPI {
  constructor(config: ccxt.ExchangeConfig) {
    super(config);
  }
}
