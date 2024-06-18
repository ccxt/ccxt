import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetApiDashboardPairList(params?: {}): Promise<implicitReturnType>;
    publicGetApiChartHistory(params?: {}): Promise<implicitReturnType>;
    publicGetApiDashboard(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
