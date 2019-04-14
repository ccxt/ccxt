import { ccxt, models } from './pkg';

const config: models.ExchangeConfig = {
  apiKey: '',
  secret: '',
  timeout: 0,
  enableRateLimit: true,
  test: true,
};
const ex = ccxt.bitmex(config);
console.log(ex);
