import lunoRest from '../luno.js';
import type { Int, Trade, OrderBook, IndexType, Dict, Market, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';
import type { WsOrderBook } from '../base/ws/OrderBook.js';
export default class luno extends lunoRest {
    describe(): any;
    /**
     * @method
     * @name luno#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.luno.com/en/developers/api#tag/Streaming-API
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of    trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleTrades(client: Client, message: Dict, subscription: Dict): void;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name luno#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.luno.com/en/developers/api#tag/Streaming-API
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {objectConstructor} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] accepts l2 or l3 for level 2 or level 3 order book
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBook(client: Client, message: Dict, subscription: Dict): void;
    customParseOrderBook(orderbook: Dict, symbol: Str, timestamp?: Int, bidsKey?: Str, asksKey?: IndexType, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): {
        symbol: Str;
        bids: any[];
        asks: any[];
        timestamp: Int;
        datetime: string | undefined;
        nonce: undefined;
    };
    parseOrderBookBidsAsks(bidasks: any, priceKey?: IndexType, amountKey?: IndexType, thirdKey?: IndexType): any[];
    customParseBidAsk(bidask: any, priceKey?: IndexType, amountKey?: IndexType, thirdKey?: IndexType): import("../base/types.js").Num[];
    handleBookDelta(orderbook: WsOrderBook, message: any): void;
    /**
     * @ignore
     * @method
     * @name luno#reduceOrderVolume
     * @description reduces the outstanding volume of the order with the given id inside one side of a level-3 orderbook after a trade, deleting the order when it is fully filled
     * @param {object} orderSide the bids or asks side of an indexed orderbook
     * @param {string} orderId the exchange-specific id of the maker order that traded
     * @param {string} tradedAmount the traded amount in base currency, as a string
     * @returns {boolean} true if the order was found in this side, false otherwise
     */
    reduceOrderVolume(orderSide: any, orderId: string, tradedAmount: string): boolean;
    /**
     * @ignore
     * @method
     * @name luno#isOrderBookDeltaInSequence
     * @description checks the sequence number of an orderbook delta frame against the stored book, and on a gap tears the connection down so that the next watch call resubscribes and receives a fresh snapshot
     * @param {object} client the websocket client the frame arrived on
     * @param {object} message the delta frame
     * @param {string} symbol unified market symbol of the book
     * @returns {boolean} true if the delta can be applied to the stored book, false if it must be discarded
     */
    isOrderBookDeltaInSequence(client: Client, message: Dict, symbol: string): boolean;
    handleMessage(client: Client, message: any): void;
}
