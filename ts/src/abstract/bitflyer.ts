import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetGetmarketsUsa (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetmarketsEu (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetmarkets (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetboard (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetticker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetexecutions (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGethealth (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetboardstate (params?: {}): Promise<implicitReturnType>;
    abstract publicGetGetchats (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetpermissions (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetbalance (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetbalancehistory (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetcollateral (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetcollateralhistory (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetcollateralaccounts (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetaddresses (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetcoinins (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetcoinouts (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetbankaccounts (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetdeposits (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetwithdrawals (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetchildorders (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetparentorders (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetparentorder (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetexecutions (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGetpositions (params?: {}): Promise<implicitReturnType>;
    abstract privateGetGettradingcommission (params?: {}): Promise<implicitReturnType>;
    abstract privatePostSendcoin (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdraw (params?: {}): Promise<implicitReturnType>;
    abstract privatePostSendchildorder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelchildorder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostSendparentorder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelparentorder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelallchildorders (params?: {}): Promise<implicitReturnType>;
}