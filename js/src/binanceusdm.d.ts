import binance from './binance.js';
export default class binanceusdm extends binance {
    describe(): any;
    transferIn(code: string, amount: any, params?: {}): Promise<import("./base/types.js").TransferEntry>;
    transferOut(code: string, amount: any, params?: {}): Promise<import("./base/types.js").TransferEntry>;
}
