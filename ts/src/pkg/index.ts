import * as models from './ccxt/models';
import * as bitmexModel from '../internal/app/bitmex';

const ccxt = {
  bitmex: bitmexModel.Init,
};

export { ccxt, models };
