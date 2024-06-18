import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetOapiV1MarketTickers(params?: {}): Promise<implicitReturnType>;
    publicGetOapiV1OtcTickers(params?: {}): Promise<implicitReturnType>;
    publicGetSnoOapiMarketCandle(params?: {}): Promise<implicitReturnType>;
    publicGetOapiV1MarketOrderbook(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
