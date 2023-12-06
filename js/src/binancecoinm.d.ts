import binance from './binance.js';
export default class binancecoinm extends binance {
    describe(): any;
    transferIn(code: string, amount: any, params?: {}): Promise<{
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: number;
        fromAccount: any;
        toAccount: any;
        status: string;
    }>;
    transferOut(code: string, amount: any, params?: {}): Promise<{
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: number;
        fromAccount: any;
        toAccount: any;
        status: string;
    }>;
}
