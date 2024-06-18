import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetHapiExchangeV1PublicAlltickers24hr(params?: {}): Promise<implicitReturnType>;
    publicGetHapiExchangeV1PublicTicker24hr(params?: {}): Promise<implicitReturnType>;
    publicGetHapiExchangeV1PublicKlines(params?: {}): Promise<implicitReturnType>;
    publicGetHapiExchangeV1PublicDepth(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
