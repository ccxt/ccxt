package io.github.ccxt;

import io.github.ccxt.errors.*;
import io.github.ccxt.base.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.Arrays;
import io.github.ccxt.types.OpenInterest;
import io.github.ccxt.types.Order;
import io.github.ccxt.types.OrderBook;
import io.github.ccxt.types.Position;
import io.github.ccxt.types.Ticker;
import io.github.ccxt.types.Tickers;
import io.github.ccxt.types.Trade;
import io.github.ccxt.types.TradingFeeInterface;
import java.util.stream.Collectors;
import io.github.ccxt.types.OpenInterests;
import io.github.ccxt.types.TradingFees;

// ----------------------------------------------------------------------------
// Exchange is the thin concrete tier over BaseExchange (which holds all shared
// infrastructure). Regular crypto exchanges extend Exchange; the prediction tier
// (PredictionExchange) extends BaseExchange as an independent sibling — so a
// prediction instance is NOT `instanceof Exchange`, while still reusing every base
// helper via BaseExchange. Mirrors ts/src/base/Exchange.ts
// (`export default class Exchange extends BaseExchange { ...62 trading methods... }`).
//
// The 62 symbol-based trading methods (createOrder/fetchTicker/fetchOrders/editOrder/
// createLimitOrder/... + watch*) are TRANSPILED from that TS class and injected below
// the marker by build/javaTranspiler.ts (transpileBaseMethods). Everything above the
// marker is hand-written: the delegating constructors (Java subclasses do not inherit
// constructors) and the WS-snapshot loadOrderBook.
// ----------------------------------------------------------------------------

public class Exchange extends BaseExchange implements TypedSurface {

    public Exchange() {
        super();
    }

    public Exchange(Object userConfig) {
        super(userConfig);
    }

    /**
     * Load order book snapshot from REST and merge with cached deltas.
     * Matches TS Exchange.loadOrderBook(). Hand-written (void, WS-snapshot friendly)
     * instead of using the transpiled CompletableFuture version.
     */
    @SuppressWarnings("unchecked")
    public void loadOrderBook(Client client, Object messageHash, Object symbol, Object limit, Object params) {
        try {
            if (!Helpers.inOp(this.orderbooks, symbol)) {
                client.reject(new ExchangeError(this.id + " loadOrderBook() orderbook is not initiated"), messageHash);
                return;
            }
            int maxRetries = ((Number) this.handleOption("watchOrderBook", "snapshotMaxRetries", 3)).intValue();
            int tries = 0;
            Exception error = null;
            try {
                Object stored = Helpers.GetValue(this.orderbooks, symbol);
                while (tries < maxRetries) {
                    java.util.List<Object> cache = (java.util.List<Object>) Helpers.GetValue(stored, "cache");
                    Object orderBook = this.fetchRestOrderBookSafe(symbol, Helpers.toLongOrNull(limit), params != null ? Helpers.toMapArg(params) : new java.util.HashMap<String, Object>()).join();
                    Object index = this.getCacheIndex(orderBook, cache);
                    if (Helpers.isGreaterThanOrEqual(index, 0)) {
                        Helpers.callDynamically(stored, "reset", new Object[]{orderBook});
                        int idx = ((Number) index).intValue();
                        this.handleBookDeltas(stored, cache.subList(idx, cache.size()));
                        ((java.util.List<Object>) Helpers.GetValue(stored, "cache")).clear();
                        client.resolve(stored, messageHash);
                        return;
                    }
                    tries++;
                }
                error = new ExchangeError(this.id + " nonce is behind the cache after " + maxRetries + " tries.");
            } catch (Exception e) {
                error = e;
            }
            // a failed synchronization must not recurse into another attempt with the
            // same broken state - previously the catch invoked loadOrderBook again,
            // recursing endlessly when the snapshot request kept failing, see
            // https://github.com/ccxt/ccxt/pull/24224 and https://github.com/ccxt/ccxt/issues/14567
            // instead, reject the watcher and drop the connection and the cached
            // orderbook, so the next watchOrderBook() call resubscribes cleanly
            client.reject(error, messageHash);
            ((java.util.concurrent.ConcurrentHashMap<String, Client>) this.clients).remove(client.url);
            Helpers.addElementToObject(this.orderbooks, symbol, this.orderBook());
        } catch (Exception e) {
            client.reject(e, messageHash);
        }
    }

    /** Overload for 3-arg calls (without limit and params). */
    public void loadOrderBook(Client client, Object messageHash, Object symbol) {
        loadOrderBook(client, messageHash, symbol, null, null);
    }

    // ------------------------------------------------------------------------
    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

public CompletableFuture<Order> closePosition(String symbol, String side, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " closePosition() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<List<Position>> closeAllPositions(Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " closeAllPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Order>> editOrders(Object orders, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " editOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Order>> fetchCanceledAndClosedOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchCanceledAndClosedOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Position>> fetchPositionHistory(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name exchange#fetchPositionHistory
             * @description fetches the history of margin added or reduced from contract isolated positions
             * @param {string} [symbol] unified market symbol
             * @param {int} [since] timestamp in ms of the position
             * @param {int} [limit] the maximum amount of candles to fetch, default=1000
             * @param {object} params extra parameters specific to the exchange api endpoint
             * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
             */
            if (!java.util.Objects.equals(this.has.get("fetchPositionsHistory"), null) && !java.util.Objects.equals(this.has.get("fetchPositionsHistory"), false))
            {
                Object positions = (this.fetchPositionsHistory(Helpers.toStringListArg(new ArrayList<Object>(Arrays.asList(symbol))), since, limit, parameters)).join();
                return positions;
            } else
            {
                throw new NotSupported((this.id + " fetchPositionHistory () is not supported yet")) ;
            }
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Position>> fetchPositionsHistory(List<String> symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionsHistory () is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Position>> fetchPositionsRisk(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionsRisk() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Position>> fetchPositionsForSymbol(Object symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionsForSymbol() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Position>> fetchPositionsForSymbolWs(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionsForSymbol() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Position> watchPosition(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchPosition() is not supported yet")) ;
        }).thenApply(Position::new);

    }

    public CompletableFuture<List<Trade>> watchMyTradesForSymbols(Object symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchMyTradesForSymbols() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Trade>> watchTradesForSymbols(Object symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTradesForSymbols() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Tickers> fetchBidsAsks(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchBidsAsks() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }

    public CompletableFuture<Ticker> fetchMarkPrice(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(this.has.get("fetchMarkPrices"), null) && !java.util.Objects.equals(this.has.get("fetchMarkPrices"), false))
            {
                (this.loadMarkets(false, new HashMap<String, Object>() {{}})).join();
                Map<String, Object> market = this.market(symbol);
                String symbolResolved = (String) market.get("symbol");
                Tickers tickers = (this.fetchMarkPrices(Helpers.toStringListArg(new ArrayList<Object>(Arrays.asList(symbolResolved))), parameters)).join();
                Map<String, Object> ticker = (Map<String, Object>) this.safeDict(tickers, symbolResolved, (Object) null);
                if (java.util.Objects.equals(ticker, null))
                {
                    throw new NullResponse(((this.id + " fetchMarkPrices() could not find a ticker for ") + symbolResolved)) ;
                } else
                {
                    return ticker;
                }
            } else
            {
                throw new NotSupported((this.id + " fetchMarkPrices() is not supported yet")) ;
            }
        }).thenApply(Ticker::new);

    }

    public CompletableFuture<Tickers> fetchMarkPrices(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchMarkPrices() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }

    public CompletableFuture<Tickers> watchBidsAsks(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchBidsAsks() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }

    public CompletableFuture<Ticker> watchMarkPrice(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchMarkPrice () is not supported yet")) ;
        }).thenApply(Ticker::new);

    }

    public CompletableFuture<Tickers> watchMarkPrices(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchMarkPrices () is not supported yet")) ;
        }).thenApply(Tickers::new);

    }

    public CompletableFuture<OrderBook> fetchL3OrderBook(Object symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new BadRequest((this.id + " fetchL3OrderBook() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }

    public CompletableFuture<OrderBook> watchOrderBookForSymbols(Object symbols, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrderBookForSymbols() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }

    public CompletableFuture<List<Order>> watchOrdersForSymbols(Object symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrdersForSymbols() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Order>> cancelAllOrdersWs(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelAllOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Order> cancelOrderWs(String id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<List<Order>> cancelOrdersWs(Object ids, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Order> createLimitBuyOrderWs(String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, "limit", "buy", amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createLimitOrderWs(String symbol, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, "limit", (String) (side), amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createLimitSellOrderWs(String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, "limit", "sell", amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketBuyOrderWs(String symbol, Object amount, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, "market", "buy", amount, (Object) null, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketOrderWithCostWs(String symbol, String side, Object cost, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createMarketOrderWithCostWs
             * @description create a market order by providing the symbol, side and cost
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} side 'buy' or 'sell'
             * @param {float} cost how much you want to trade in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if ((!java.util.Objects.equals(this.has.get("createMarketOrderWithCostWs"), null) && !java.util.Objects.equals(this.has.get("createMarketOrderWithCostWs"), false)) || ((!java.util.Objects.equals(this.has.get("createMarketBuyOrderWithCostWs"), null) && !java.util.Objects.equals(this.has.get("createMarketBuyOrderWithCostWs"), false)) && (!java.util.Objects.equals(this.has.get("createMarketSellOrderWithCostWs"), null) && !java.util.Objects.equals(this.has.get("createMarketSellOrderWithCostWs"), false))))
            {
                return (this.createOrderWs(symbol, "market", (String) (side), cost, 1, parameters)).join();
            }
            throw new NotSupported((this.id + " createMarketOrderWithCostWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketOrderWs(String symbol, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, "market", (String) (side), amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketSellOrderWs(String symbol, Object amount, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, "market", "sell", amount, (Object) null, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createOrderWithTakeProfitAndStopLossWs(String symbol, String type, String side, Object amount, Object price, Object takeProfit, Object stopLoss, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createOrderWithTakeProfitAndStopLossWs
             * @description create an order with a stop loss or take profit attached (type 3)
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} [takeProfit] the take profit price, in units of the quote currency
             * @param {float} [stopLoss] the stop loss price, in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @param {string} [params.takeProfitType] *not available on all exchanges* 'limit' or 'market'
             * @param {string} [params.stopLossType] *not available on all exchanges* 'limit' or 'market'
             * @param {string} [params.takeProfitPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
             * @param {string} [params.stopLossPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
             * @param {float} [params.takeProfitLimitPrice] *not available on all exchanges* limit price for a limit take profit order
             * @param {float} [params.stopLossLimitPrice] *not available on all exchanges* stop loss for a limit stop loss order
             * @param {float} [params.takeProfitAmount] *not available on all exchanges* the amount for a take profit
             * @param {float} [params.stopLossAmount] *not available on all exchanges* the amount for a stop loss
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            Object paramsValue = this.setTakeProfitAndStopLossParams(symbol, (String) (type), (String) (side), amount, price, takeProfit, stopLoss, parameters);
            if (!java.util.Objects.equals(this.has.get("createOrderWithTakeProfitAndStopLossWs"), null) && !java.util.Objects.equals(this.has.get("createOrderWithTakeProfitAndStopLossWs"), false))
            {
                return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, Helpers.toMapArg(paramsValue))).join();
            }
            throw new NotSupported((this.id + " createOrderWithTakeProfitAndStopLossWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createOrderWs(String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<List<Order>> createOrdersWs(Object orders, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrdersWs () is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Order> createPostOnlyOrderWs(String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createPostOnlyOrderWs"), null) || java.util.Objects.equals(this.has.get("createPostOnlyOrderWs"), false))
            {
                throw new NotSupported((this.id + " createPostOnlyOrderWs() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "postOnly", true );
            }});
            return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createReduceOnlyOrderWs(String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createReduceOnlyOrderWs"), null) || java.util.Objects.equals(this.has.get("createReduceOnlyOrderWs"), false))
            {
                throw new NotSupported((this.id + " createReduceOnlyOrderWs() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "reduceOnly", true );
            }});
            return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createStopLimitOrderWs(String symbol, String side, Object amount, Object price, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createStopLimitOrderWs"), null) || java.util.Objects.equals(this.has.get("createStopLimitOrderWs"), false))
            {
                throw new NotSupported((this.id + " createStopLimitOrderWs() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrderWs(symbol, "limit", (String) (side), amount, price, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createStopLossOrderWs(String symbol, String type, String side, Object amount, Object price, Object stopLossPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createStopLossOrderWs
             * @description create a trigger stop loss order (type 2)
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} stopLossPrice the price to trigger the stop loss order, in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(stopLossPrice, null))
            {
                throw new ArgumentsRequired((this.id + " createStopLossOrderWs() requires a stopLossPrice argument")) ;
            }
            Map<String, Object> paramsExtended = this.extend(parameters, Helpers.newMap(
                "stopLossPrice", stopLossPrice
            ));
            if (!java.util.Objects.equals(this.has.get("createStopLossOrderWs"), null) && !java.util.Objects.equals(this.has.get("createStopLossOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, paramsExtended)).join();
            }
            throw new NotSupported((this.id + " createStopLossOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createStopMarketOrderWs(String symbol, String side, Object amount, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createStopMarketOrderWs"), null) || java.util.Objects.equals(this.has.get("createStopMarketOrderWs"), false))
            {
                throw new NotSupported((this.id + " createStopMarketOrderWs() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrderWs(symbol, "market", (String) (side), amount, (Object) null, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createStopOrderWs(String symbol, String type, String side, Object amount, Object price, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createStopOrderWs"), null) || java.util.Objects.equals(this.has.get("createStopOrderWs"), false))
            {
                throw new NotSupported((this.id + " createStopOrderWs() is not supported yet")) ;
            }
            if (java.util.Objects.equals(triggerPrice, null))
            {
                throw new ArgumentsRequired((this.id + " createStopOrderWs() requires a stopPrice argument")) ;
            }
            Map<String, Object> query = this.extend(parameters, Helpers.newMap(
                "stopPrice", triggerPrice
            ));
            return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createTakeProfitOrderWs(String symbol, String type, String side, Object amount, Object price, Object takeProfitPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createTakeProfitOrderWs
             * @description create a trigger take profit order (type 2)
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} takeProfitPrice the price to trigger the take profit order, in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(takeProfitPrice, null))
            {
                throw new ArgumentsRequired((this.id + " createTakeProfitOrderWs() requires a takeProfitPrice argument")) ;
            }
            Map<String, Object> paramsExtended = this.extend(parameters, Helpers.newMap(
                "takeProfitPrice", takeProfitPrice
            ));
            if (!java.util.Objects.equals(this.has.get("createTakeProfitOrderWs"), null) && !java.util.Objects.equals(this.has.get("createTakeProfitOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, paramsExtended)).join();
            }
            throw new NotSupported((this.id + " createTakeProfitOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createTrailingAmountOrderWs(String symbol, String type, String side, Object amount, Object price, Object trailingAmount, Object trailingTriggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createTrailingAmountOrderWs
             * @description create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
             * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
             * @param {float} trailingAmount the quote amount to trail away from the current market price
             * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(trailingAmount, null))
            {
                throw new ArgumentsRequired((this.id + " createTrailingAmountOrderWs() requires a trailingAmount argument")) ;
            }
            ((Map<String, Object>)parameters).put("trailingAmount", trailingAmount);
            if (!java.util.Objects.equals(trailingTriggerPrice, null))
            {
                ((Map<String, Object>)parameters).put("trailingTriggerPrice", trailingTriggerPrice);
            }
            if (!java.util.Objects.equals(this.has.get("createTrailingAmountOrderWs"), null) && !java.util.Objects.equals(this.has.get("createTrailingAmountOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, parameters)).join();
            }
            throw new NotSupported((this.id + " createTrailingAmountOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createTrailingPercentOrderWs(String symbol, String type, String side, Object amount, Object price, Object trailingPercent, Object trailingTriggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createTrailingPercentOrderWs
             * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
             * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
             * @param {float} trailingPercent the percent to trail away from the current market price
             * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(trailingPercent, null))
            {
                throw new ArgumentsRequired((this.id + " createTrailingPercentOrderWs() requires a trailingPercent argument")) ;
            }
            ((Map<String, Object>)parameters).put("trailingPercent", trailingPercent);
            if (!java.util.Objects.equals(trailingTriggerPrice, null))
            {
                ((Map<String, Object>)parameters).put("trailingTriggerPrice", trailingTriggerPrice);
            }
            if (!java.util.Objects.equals(this.has.get("createTrailingPercentOrderWs"), null) && !java.util.Objects.equals(this.has.get("createTrailingPercentOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, parameters)).join();
            }
            throw new NotSupported((this.id + " createTrailingPercentOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createTriggerOrderWs(String symbol, String type, String side, Object amount, Object price, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createTriggerOrderWs
             * @description create a trigger stop order (type 1)
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} triggerPrice the price to trigger the stop order, in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(triggerPrice, null))
            {
                throw new ArgumentsRequired((this.id + " createTriggerOrderWs() requires a triggerPrice argument")) ;
            }
            Map<String, Object> paramsExtended = this.extend(parameters, Helpers.newMap(
                "triggerPrice", triggerPrice
            ));
            if (!java.util.Objects.equals(this.has.get("createTriggerOrderWs"), null) && !java.util.Objects.equals(this.has.get("createTriggerOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, paramsExtended)).join();
            }
            throw new NotSupported((this.id + " createTriggerOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> editOrderWs(String id, String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            (this.cancelOrderWs(id, symbol, new HashMap<String, Object>() {{}})).join();
            return (this.createOrderWs(symbol, (String) (type), (String) (side), amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<List<Order>> fetchClosedOrdersWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(this.has.get("fetchOrdersWs"), null) && !java.util.Objects.equals(this.has.get("fetchOrdersWs"), false))
            {
                List<Order> orders = (this.fetchOrdersWs(symbol, since, limit, parameters)).join();
                return this.filterBy(orders, "status", "closed");
            }
            throw new NotSupported((this.id + " fetchClosedOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Trade>> fetchMyTradesWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchMyTradesWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Order>> fetchOpenOrdersWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(this.has.get("fetchOrdersWs"), null) && !java.util.Objects.equals(this.has.get("fetchOrdersWs"), false))
            {
                List<Order> orders = (this.fetchOrdersWs(symbol, since, limit, parameters)).join();
                return this.filterBy(orders, "status", "open");
            }
            throw new NotSupported((this.id + " fetchOpenOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<OrderBook> fetchOrderBookWs(String symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderBookWs() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }

    public CompletableFuture<Order> fetchOrderWs(String id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<List<Order>> fetchOrdersWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Position>> fetchPositionWs(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Position>> fetchPositionsWs(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Ticker> fetchTickerWs(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(this.has.get("fetchTickersWs"), null) && !java.util.Objects.equals(this.has.get("fetchTickersWs"), false))
            {
                (this.loadMarkets(false, new HashMap<String, Object>() {{}})).join();
                Map<String, Object> market = this.market(symbol);
                String symbolResolved = (String) market.get("symbol");
                Tickers tickers = (this.fetchTickersWs(Helpers.toStringListArg(new ArrayList<Object>(Arrays.asList(symbolResolved))), parameters)).join();
                Map<String, Object> ticker = (Map<String, Object>) this.safeDict(tickers, symbolResolved, (Object) null);
                if (java.util.Objects.equals(ticker, null))
                {
                    throw new NullResponse(((this.id + " fetchTickerWs() could not find a ticker for ") + symbolResolved)) ;
                } else
                {
                    return ticker;
                }
            } else
            {
                throw new NotSupported((this.id + " fetchTickerWs() is not supported yet")) ;
            }
        }).thenApply(Ticker::new);

    }

    public CompletableFuture<Tickers> fetchTickersWs(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTickersWs() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }

    public CompletableFuture<List<Trade>> fetchTradesWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTradesWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }


    public CompletableFuture<List<Trade>> fetchTrades(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Trade>> watchTrades(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }

    public CompletableFuture<OrderBook> fetchOrderBook(Object symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderBook() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }

    public CompletableFuture<Object> fetchRestOrderBookSafe(Object symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            Object fetchSnapshotMaxRetries = this.handleOption("watchOrderBook", "maxRetries", 3);
            for (var i = 0; Helpers.isLessThan(i, fetchSnapshotMaxRetries); i++)
            {
                try
                {
                    OrderBook orderBook = (this.fetchOrderBook(symbol, limit, parameters)).join();
                    return orderBook;
                } catch(Exception e)
                {
                    if (Helpers.isEqual(((((long) i) + 1L)), fetchSnapshotMaxRetries))
                    {
                        throw (e instanceof RuntimeException ? (RuntimeException)e : new RuntimeException(e));
                    }
                }
            }
            return null;
        });

    }

    public CompletableFuture<OrderBook> watchOrderBook(String symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrderBook() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }

    public CompletableFuture<OpenInterest> fetchOpenInterest(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(this.has.get("fetchOpenInterests"), null) && !java.util.Objects.equals(this.has.get("fetchOpenInterests"), false))
            {
                OpenInterests openInterests = (this.fetchOpenInterests(Helpers.toStringListArg(new ArrayList<Object>(Arrays.asList(symbol))), parameters)).join();
                return this.safeDict(openInterests, symbol, (Object) null);
            } else
            {
                throw new NotSupported((this.id + " fetchOpenInterest() is not supported yet")) ;
            }
        }).thenApply(OpenInterest::new);

    }

    public CompletableFuture<OrderBook> fetchL2OrderBook(String symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            OrderBook orderbook = (this.fetchOrderBook(symbol, limit, parameters)).join();
            return this.extend(orderbook, new HashMap<String, Object>() {{
                put( "asks", Exchange.this.sortBy(Exchange.this.aggregate(((Map<String, Object>)orderbook).get("asks")), 0) );
                put( "bids", Exchange.this.sortBy(Exchange.this.aggregate(((Map<String, Object>)orderbook).get("bids")), 0, true) );
            }});
        }).thenApply(OrderBook::new);

    }

    public CompletableFuture<Order> editLimitBuyOrder(String id, String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.editLimitOrder(id, symbol, "buy", amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> editLimitSellOrder(String id, String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.editLimitOrder(id, symbol, "sell", amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> editLimitOrder(String id, String symbol, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.editOrder(id, symbol, "limit", (String) (side), amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> editOrder(String id, String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            (this.cancelOrder(id, symbol, new HashMap<String, Object>() {{}})).join();
            return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> editOrderWithClientOrderId(Object clientOrderId, String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            Map<String, Object> extendedParams = this.extend(parameters, new HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }});
            return (this.editOrder("", symbol, (String) (type), (String) (side), amount, price, extendedParams)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Position> fetchPosition(Object symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPosition() is not supported yet")) ;
        }).thenApply(Position::new);

    }

    public CompletableFuture<List<Position>> watchPositions(List<String> symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Position>> watchPositionForSymbols(List<String> symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.watchPositions(symbols, since, limit, parameters)).join();
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Position>> fetchPositions(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Ticker> fetchTicker(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(this.has.get("fetchTickers"), null) && !java.util.Objects.equals(this.has.get("fetchTickers"), false))
            {
                (this.loadMarkets(false, new HashMap<String, Object>() {{}})).join();
                Map<String, Object> market = this.market(symbol);
                String symbolResolved = (String) market.get("symbol");
                Tickers tickers = (this.fetchTickers(Helpers.toStringListArg(new ArrayList<Object>(Arrays.asList(symbolResolved))), parameters)).join();
                Map<String, Object> ticker = (Map<String, Object>) this.safeDict(tickers, symbolResolved, (Object) null);
                if (java.util.Objects.equals(ticker, null))
                {
                    throw new NullResponse(((this.id + " fetchTickers() could not find a ticker for ") + symbolResolved)) ;
                } else
                {
                    return ticker;
                }
            } else
            {
                throw new NotSupported((this.id + " fetchTicker() is not supported yet")) ;
            }
        }).thenApply(Ticker::new);

    }

    public CompletableFuture<Ticker> watchTicker(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTicker() is not supported yet")) ;
        }).thenApply(Ticker::new);

    }

    public CompletableFuture<Tickers> fetchTickers(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTickers() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }

    public CompletableFuture<Tickers> watchTickers(List<String> symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTickers() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }

    public CompletableFuture<Order> fetchOrder(Object id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    /**
     * @method
     * @name fetchOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    public CompletableFuture<Order> fetchOrderWithClientOrderId(Object clientOrderId, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            Map<String, Object> extendedParams = this.extend(parameters, new HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }});
            return (this.fetchOrder("", symbol, extendedParams)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<String> fetchOrderStatus(String id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            // TODO: TypeScript: change method signature by replacing
            // Promise<string> with Promise<Order['status']>.
            Order order = (this.fetchOrder(id, symbol, parameters)).join();
            return ((Map<String, Object>)order).get("status");
        }).thenApply(res -> (String) res);

    }

    public CompletableFuture<Order> fetchUnifiedOrder(Object order, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.fetchOrder(this.safeString(order, "id"), this.safeString(order, "symbol"), parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createOrder(String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createTrailingAmountOrder(String symbol, String type, String side, Object amount, Object price, Object trailingAmount, Object trailingTriggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createTrailingAmountOrder
             * @description create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
             * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
             * @param {float} trailingAmount the quote amount to trail away from the current market price
             * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(trailingAmount, null))
            {
                throw new ArgumentsRequired((this.id + " createTrailingAmountOrder() requires a trailingAmount argument")) ;
            }
            ((Map<String, Object>)parameters).put("trailingAmount", trailingAmount);
            if (!java.util.Objects.equals(trailingTriggerPrice, null))
            {
                ((Map<String, Object>)parameters).put("trailingTriggerPrice", trailingTriggerPrice);
            }
            if (!java.util.Objects.equals(this.has.get("createTrailingAmountOrder"), null) && !java.util.Objects.equals(this.has.get("createTrailingAmountOrder"), false))
            {
                return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, parameters)).join();
            }
            throw new NotSupported((this.id + " createTrailingAmountOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createTrailingPercentOrder(String symbol, String type, String side, Object amount, Object price, Object trailingPercent, Object trailingTriggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createTrailingPercentOrder
             * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
             * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
             * @param {float} trailingPercent the percent to trail away from the current market price
             * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(trailingPercent, null))
            {
                throw new ArgumentsRequired((this.id + " createTrailingPercentOrder() requires a trailingPercent argument")) ;
            }
            ((Map<String, Object>)parameters).put("trailingPercent", trailingPercent);
            if (!java.util.Objects.equals(trailingTriggerPrice, null))
            {
                ((Map<String, Object>)parameters).put("trailingTriggerPrice", trailingTriggerPrice);
            }
            if (!java.util.Objects.equals(this.has.get("createTrailingPercentOrder"), null) && !java.util.Objects.equals(this.has.get("createTrailingPercentOrder"), false))
            {
                return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, parameters)).join();
            }
            throw new NotSupported((this.id + " createTrailingPercentOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketOrderWithCost(String symbol, String side, Object cost, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createMarketOrderWithCost
             * @description create a market order by providing the symbol, side and cost
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} side 'buy' or 'sell'
             * @param {float} cost how much you want to trade in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if ((!java.util.Objects.equals(this.has.get("createMarketOrderWithCost"), null) && !java.util.Objects.equals(this.has.get("createMarketOrderWithCost"), false)) || ((!java.util.Objects.equals(this.has.get("createMarketBuyOrderWithCost"), null) && !java.util.Objects.equals(this.has.get("createMarketBuyOrderWithCost"), false)) && (!java.util.Objects.equals(this.has.get("createMarketSellOrderWithCost"), null) && !java.util.Objects.equals(this.has.get("createMarketSellOrderWithCost"), false))))
            {
                return (this.createOrder(symbol, "market", (String) (side), cost, 1, parameters)).join();
            }
            throw new NotSupported((this.id + " createMarketOrderWithCost() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketBuyOrderWithCost(String symbol, Object cost, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createMarketBuyOrderWithCost
             * @description create a market buy order by providing the symbol and cost
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {float} cost how much you want to trade in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if ((java.util.Objects.equals(this.options.get("createMarketBuyOrderRequiresPrice"), true)) || (!java.util.Objects.equals(this.has.get("createMarketBuyOrderWithCost"), null) && !java.util.Objects.equals(this.has.get("createMarketBuyOrderWithCost"), false)))
            {
                return (this.createOrder(symbol, "market", "buy", cost, 1, parameters)).join();
            }
            throw new NotSupported((this.id + " createMarketBuyOrderWithCost() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketSellOrderWithCost(String symbol, Object cost, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createMarketSellOrderWithCost
             * @description create a market sell order by providing the symbol and cost
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {float} cost how much you want to trade in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if ((java.util.Objects.equals(this.options.get("createMarketSellOrderRequiresPrice"), true)) || (!java.util.Objects.equals(this.has.get("createMarketSellOrderWithCost"), null) && !java.util.Objects.equals(this.has.get("createMarketSellOrderWithCost"), false)))
            {
                return (this.createOrder(symbol, "market", "sell", cost, 1, parameters)).join();
            }
            throw new NotSupported((this.id + " createMarketSellOrderWithCost() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createTriggerOrder(String symbol, String type, String side, Object amount, Object price, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createTriggerOrder
             * @description create a trigger stop order (type 1)
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} triggerPrice the price to trigger the stop order, in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(triggerPrice, null))
            {
                throw new ArgumentsRequired((this.id + " createTriggerOrder() requires a triggerPrice argument")) ;
            }
            Map<String, Object> paramsExtended = this.extend(parameters, Helpers.newMap(
                "triggerPrice", triggerPrice
            ));
            if (!java.util.Objects.equals(this.has.get("createTriggerOrder"), null) && !java.util.Objects.equals(this.has.get("createTriggerOrder"), false))
            {
                return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, paramsExtended)).join();
            }
            throw new NotSupported((this.id + " createTriggerOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createStopLossOrder(String symbol, String type, String side, Object amount, Object price, Object stopLossPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createStopLossOrder
             * @description create a trigger stop loss order (type 2)
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} stopLossPrice the price to trigger the stop loss order, in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(stopLossPrice, null))
            {
                throw new ArgumentsRequired((this.id + " createStopLossOrder() requires a stopLossPrice argument")) ;
            }
            Map<String, Object> paramsExtended = this.extend(parameters, Helpers.newMap(
                "stopLossPrice", stopLossPrice
            ));
            if (!java.util.Objects.equals(this.has.get("createStopLossOrder"), null) && !java.util.Objects.equals(this.has.get("createStopLossOrder"), false))
            {
                return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, paramsExtended)).join();
            }
            throw new NotSupported((this.id + " createStopLossOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createTakeProfitOrder(String symbol, String type, String side, Object amount, Object price, Object takeProfitPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createTakeProfitOrder
             * @description create a trigger take profit order (type 2)
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} takeProfitPrice the price to trigger the take profit order, in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            if (java.util.Objects.equals(takeProfitPrice, null))
            {
                throw new ArgumentsRequired((this.id + " createTakeProfitOrder() requires a takeProfitPrice argument")) ;
            }
            Map<String, Object> paramsExtended = this.extend(parameters, Helpers.newMap(
                "takeProfitPrice", takeProfitPrice
            ));
            if (!java.util.Objects.equals(this.has.get("createTakeProfitOrder"), null) && !java.util.Objects.equals(this.has.get("createTakeProfitOrder"), false))
            {
                return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, paramsExtended)).join();
            }
            throw new NotSupported((this.id + " createTakeProfitOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createOrderWithTakeProfitAndStopLoss(String symbol, String type, String side, Object amount, Object price, Object takeProfit, Object stopLoss, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            /**
             * @method
             * @name createOrderWithTakeProfitAndStopLoss
             * @description create an order with a stop loss or take profit attached (type 3)
             * @param {string} symbol unified symbol of the market to create an order in
             * @param {string} type 'market' or 'limit'
             * @param {string} side 'buy' or 'sell'
             * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} [takeProfit] the take profit price, in units of the quote currency
             * @param {float} [stopLoss] the stop loss price, in units of the quote currency
             * @param {object} [params] extra parameters specific to the exchange API endpoint
             * @param {string} [params.takeProfitType] *not available on all exchanges* 'limit' or 'market'
             * @param {string} [params.stopLossType] *not available on all exchanges* 'limit' or 'market'
             * @param {string} [params.takeProfitPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
             * @param {string} [params.stopLossPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
             * @param {float} [params.takeProfitLimitPrice] *not available on all exchanges* limit price for a limit take profit order
             * @param {float} [params.stopLossLimitPrice] *not available on all exchanges* stop loss for a limit stop loss order
             * @param {float} [params.takeProfitAmount] *not available on all exchanges* the amount for a take profit
             * @param {float} [params.stopLossAmount] *not available on all exchanges* the amount for a stop loss
             * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
             */
            Object paramsValue = this.setTakeProfitAndStopLossParams(symbol, (String) (type), (String) (side), amount, price, takeProfit, stopLoss, parameters);
            if (!java.util.Objects.equals(this.has.get("createOrderWithTakeProfitAndStopLoss"), null) && !java.util.Objects.equals(this.has.get("createOrderWithTakeProfitAndStopLoss"), false))
            {
                return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, Helpers.toMapArg(paramsValue))).join();
            }
            throw new NotSupported((this.id + " createOrderWithTakeProfitAndStopLoss() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    public CompletableFuture<List<Order>> createOrders(Object orders, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Order> cancelOrder(String id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }

    /**
     * @method
     * @name cancelOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    public CompletableFuture<Order> cancelOrderWithClientOrderId(Object clientOrderId, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            Map<String, Object> extendedParams = this.extend(parameters, new HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }});
            return (this.cancelOrder("", symbol, extendedParams)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<List<Order>> cancelOrders(Object ids, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    /**
     * @method
     * @name cancelOrdersWithClientOrderIds
     * @description create a market order by providing the symbol, side and cost
     * @param {string[]} clientOrderIds client order Ids
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    public CompletableFuture<List<Order>> cancelOrdersWithClientOrderIds(Object clientOrderIds, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            Map<String, Object> extendedParams = this.extend(parameters, new HashMap<String, Object>() {{
                put( "clientOrderIds", clientOrderIds );
            }});
            return (this.cancelOrders(new ArrayList<Object>(Arrays.asList()), symbol, extendedParams)).join();
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Order>> cancelAllOrders(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelAllOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Order> cancelUnifiedOrder(Object order, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return this.cancelOrder(this.safeString(order, "id"), this.safeString(order, "symbol"), parameters);
        }).thenApply(Order::new);

    }

    public CompletableFuture<List<Order>> fetchOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if ((!java.util.Objects.equals(this.has.get("fetchOpenOrders"), null) && !java.util.Objects.equals(this.has.get("fetchOpenOrders"), false)) && (!java.util.Objects.equals(this.has.get("fetchClosedOrders"), null) && !java.util.Objects.equals(this.has.get("fetchClosedOrders"), false)))
            {
                throw new NotSupported((this.id + " fetchOrders() is not supported yet, consider using fetchOpenOrders() and fetchClosedOrders() instead")) ;
            }
            throw new NotSupported((this.id + " fetchOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Trade>> fetchOrderTrades(String id, String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Order>> watchOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Order>> fetchOpenOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(this.has.get("fetchOrders"), null) && !java.util.Objects.equals(this.has.get("fetchOrders"), false))
            {
                List<Order> orders = (this.fetchOrders(symbol, since, limit, parameters)).join();
                return this.filterBy(orders, "status", "open");
            }
            throw new NotSupported((this.id + " fetchOpenOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Order>> fetchClosedOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(this.has.get("fetchOrders"), null) && !java.util.Objects.equals(this.has.get("fetchOrders"), false))
            {
                List<Order> orders = (this.fetchOrders(symbol, since, limit, parameters)).join();
                return this.filterBy(orders, "status", "closed");
            }
            throw new NotSupported((this.id + " fetchClosedOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Order>> fetchCanceledOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchCanceledOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Trade>> fetchMyTrades(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchMyTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }

    public CompletableFuture<List<Trade>> watchMyTrades(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchMyTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }

    public CompletableFuture<Order> createLimitOrder(String symbol, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder(symbol, "limit", (String) (side), amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketOrder(String symbol, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder(symbol, "market", (String) (side), amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createLimitBuyOrder(String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder(symbol, "limit", "buy", amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createLimitSellOrder(String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder(symbol, "limit", "sell", amount, price, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketBuyOrder(String symbol, Object amount, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder(symbol, "market", "buy", amount, (Object) null, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createMarketSellOrder(String symbol, Object amount, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder(symbol, "market", "sell", amount, (Object) null, parameters)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createPostOnlyOrder(String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createPostOnlyOrder"), null) || java.util.Objects.equals(this.has.get("createPostOnlyOrder"), false))
            {
                throw new NotSupported((this.id + " createPostOnlyOrder() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "postOnly", true );
            }});
            return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createReduceOnlyOrder(String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createReduceOnlyOrder"), null) || java.util.Objects.equals(this.has.get("createReduceOnlyOrder"), false))
            {
                throw new NotSupported((this.id + " createReduceOnlyOrder() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "reduceOnly", true );
            }});
            return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createStopOrder(String symbol, String type, String side, Object amount, Object price, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createStopOrder"), null) || java.util.Objects.equals(this.has.get("createStopOrder"), false))
            {
                throw new NotSupported((this.id + " createStopOrder() is not supported yet")) ;
            }
            if (java.util.Objects.equals(triggerPrice, null))
            {
                throw new ArgumentsRequired((this.id + " create_stop_order() requires a stopPrice argument")) ;
            }
            Map<String, Object> query = this.extend(parameters, Helpers.newMap(
                "stopPrice", triggerPrice
            ));
            return (this.createOrder(symbol, (String) (type), (String) (side), amount, price, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createStopLimitOrder(String symbol, String side, Object amount, Object price, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createStopLimitOrder"), null) || java.util.Objects.equals(this.has.get("createStopLimitOrder"), false))
            {
                throw new NotSupported((this.id + " createStopLimitOrder() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrder(symbol, "limit", (String) (side), amount, price, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<Order> createStopMarketOrder(String symbol, String side, Object amount, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("createStopMarketOrder"), null) || java.util.Objects.equals(this.has.get("createStopMarketOrder"), false))
            {
                throw new NotSupported((this.id + " createStopMarketOrder() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrder(symbol, "market", (String) (side), amount, (Object) null, query)).join();
        }).thenApply(Order::new);

    }

    public CompletableFuture<TradingFeeInterface> fetchTradingFee(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(this.has.get("fetchTradingFees"), null) || java.util.Objects.equals(this.has.get("fetchTradingFees"), false))
            {
                throw new NotSupported((this.id + " fetchTradingFee() is not supported yet")) ;
            }
            TradingFees fees = (this.fetchTradingFees(parameters)).join();
            return this.safeDict(fees, symbol, (Object) null);
        }).thenApply(TradingFeeInterface::new);

    }
}
