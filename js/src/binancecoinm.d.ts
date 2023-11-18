import binance from './binance.js';
export default class binancecoinm extends binance {
    describe(): undefined;
    transferIn(code: string, amount: any, params?: {}): Promise<{
        info: any;
        id: import("./base/types.js").Str;
        timestamp: import("./base/types.js").Int;
        datetime: string | undefined;
        currency: string;
        amount: import("./base/types.js").Num;
        fromAccount: undefined;
        toAccount: undefined;
        status: import("./base/types.js").Str;
    }>;
    transferOut(code: string, amount: any, params?: {}): Promise<{
        info: any;
        id: import("./base/types.js").Str;
        timestamp: import("./base/types.js").Int;
        datetime: string | undefined;
        currency: string;
        amount: import("./base/types.js").Num;
        fromAccount: undefined;
        toAccount: undefined;
        status: import("./base/types.js").Str;
    }>;
}
