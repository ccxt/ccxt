import mudrexRest from '../mudrex.js';
import type { Int, OHLCV, Strings, Ticker, Tickers, Dict } from '../base/types.js';
import type Client from '../base/ws/Client.js';
export default class mudrex extends mudrexRest {
    describe(): any;
    ping(client: Client): {
        id: number;
        method: string;
    };
    requestId(): number;
    /**
     * @ignore
     * @method
     * @description injects the broker Partner-Id into the websocket connection headers
     */
    setBrokerHeaders(): void;
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    handleMessage(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: Dict): void;
    handleOHLCV(client: Client, message: Dict): void;
    handleTicker(client: Client, message: Dict): void;
}
