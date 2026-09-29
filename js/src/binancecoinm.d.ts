import binance from './binance.js';
import type { Dict, TransferEntry } from './base/types.js';
export default class binancecoinm extends binance {
    describe(): any;
    transferIn(code: string, amount: number, params?: Dict): Promise<TransferEntry>;
    transferOut(code: string, amount: number, params?: Dict): Promise<TransferEntry>;
}
