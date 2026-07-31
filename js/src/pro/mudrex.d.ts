import mudrexRest from '../mudrex.js';
import type { Int, OHLCV, Strings, Ticker, Tickers } from '../base/types.js';
export default class mudrex extends mudrexRest {
    describe(): any;
    ping(client: any): {
        id: any;
        method: string;
    };
    requestId(): any;
    /**
     * @ignore
     * @method
     * @description injects the broker Partner-Id into the websocket connection headers
     */
    setBrokerHeaders(): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleMessage(client: any, message: any): void;
    handleErrorMessage(client: any, message: any): void;
    handleOHLCV(client: any, message: any): void;
    handleTicker(client: any, message: any): void;
}
