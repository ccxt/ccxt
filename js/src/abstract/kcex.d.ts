import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarket2SpotMarketV2WebSymbols(params?: {}): Promise<implicitReturnType>;
    publicGetMarket2SpotMarketV2WebTickers(params?: {}): Promise<implicitReturnType>;
    publicGetMarket2SpotMarketV2WebSymbolTicker(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
