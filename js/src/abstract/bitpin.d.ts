import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetV1MktMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetV2MthActives(params?: {}): Promise<implicitReturnType>;
    publicGetV1MktTvGetBars(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
