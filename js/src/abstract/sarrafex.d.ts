import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetApiGatewayExchangerQueryMarket(params?: {}): Promise<implicitReturnType>;
    publicGetExchangerTradingviewHistory(params?: {}): Promise<implicitReturnType>;
    publicGetApiGatewayExchangerOrderbook(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
