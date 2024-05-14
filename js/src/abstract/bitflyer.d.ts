import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetGetmarketsUsa(params?: {}): Promise<implicitReturnType>;
    publicGetGetmarketsEu(params?: {}): Promise<implicitReturnType>;
    publicGetGetmarkets(params?: {}): Promise<implicitReturnType>;
    publicGetGetboard(params?: {}): Promise<implicitReturnType>;
    publicGetGetticker(params?: {}): Promise<implicitReturnType>;
    publicGetGetexecutions(params?: {}): Promise<implicitReturnType>;
    publicGetGethealth(params?: {}): Promise<implicitReturnType>;
    publicGetGetboardstate(params?: {}): Promise<implicitReturnType>;
    publicGetGetchats(params?: {}): Promise<implicitReturnType>;
    privateGetGetpermissions(params?: {}): Promise<implicitReturnType>;
    privateGetGetbalance(params?: {}): Promise<implicitReturnType>;
    privateGetGetbalancehistory(params?: {}): Promise<implicitReturnType>;
    privateGetGetcollateral(params?: {}): Promise<implicitReturnType>;
    privateGetGetcollateralhistory(params?: {}): Promise<implicitReturnType>;
    privateGetGetcollateralaccounts(params?: {}): Promise<implicitReturnType>;
    privateGetGetaddresses(params?: {}): Promise<implicitReturnType>;
    privateGetGetcoinins(params?: {}): Promise<implicitReturnType>;
    privateGetGetcoinouts(params?: {}): Promise<implicitReturnType>;
    privateGetGetbankaccounts(params?: {}): Promise<implicitReturnType>;
    privateGetGetdeposits(params?: {}): Promise<implicitReturnType>;
    privateGetGetwithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetGetchildorders(params?: {}): Promise<implicitReturnType>;
    privateGetGetparentorders(params?: {}): Promise<implicitReturnType>;
    privateGetGetparentorder(params?: {}): Promise<implicitReturnType>;
    privateGetGetexecutions(params?: {}): Promise<implicitReturnType>;
    privateGetGetpositions(params?: {}): Promise<implicitReturnType>;
    privateGetGettradingcommission(params?: {}): Promise<implicitReturnType>;
    privatePostSendcoin(params?: {}): Promise<implicitReturnType>;
    privatePostWithdraw(params?: {}): Promise<implicitReturnType>;
    privatePostSendchildorder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelchildorder(params?: {}): Promise<implicitReturnType>;
    privatePostSendparentorder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelparentorder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelallchildorders(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
