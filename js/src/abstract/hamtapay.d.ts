import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetFinancialApiMarket(params?: {}): Promise<implicitReturnType>;
    publicGetFinancialApiVitrinPrices(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
