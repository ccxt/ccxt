import binance from './abstract/binanceusdm.js';
import type { Dict, TransferEntry } from './base/types.js';
export default class binanceusdm extends binance {
    describe(): Dict;
    transferIn(code: string, amount: number, params?: Dict): Promise<TransferEntry>;
    transferOut(code: string, amount: number, params?: Dict): Promise<TransferEntry>;
}
