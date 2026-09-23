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
                    Object orderBook = this.fetchRestOrderBookSafe(symbol, limit, params != null ? params : new java.util.HashMap<String, Object>()).join();
                    Object index = this.getCacheIndex(orderBook, cache);
                    if (Helpers.isGreaterThanOrEqual(index, 0)) {
                        Helpers.callDynamically(stored, "reset", new Object[]{orderBook});
                        int idx = ((Number) index).intValue();
                        this.handleDeltas(stored, cache.subList(idx, cache.size()));
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

public CompletableFuture<Order> closePosition(Object symbol, Object side, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " closePosition() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> closePosition(Object symbol, Object... optionalArgs)
    {
        return this.closePosition(symbol, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> closeAllPositions(Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " closeAllPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> closeAllPositions(Object... optionalArgs)
    {
        return this.closeAllPositions(Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> editOrders(Object orders, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " editOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> editOrders(Object orders, Object... optionalArgs)
    {
        return this.editOrders(orders, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> fetchCanceledAndClosedOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchCanceledAndClosedOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> fetchCanceledAndClosedOrders(Object... optionalArgs)
    {
        return this.fetchCanceledAndClosedOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchPositionsHistory"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchPositionsHistory"), false))
            {
                Object positions = (this.fetchPositionsHistory((Object)(new ArrayList<Object>(Arrays.asList(symbol))), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return positions;
            } else
            {
                throw new NotSupported((this.id + " fetchPositionHistory () is not supported yet")) ;
            }
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> fetchPositionHistory(String symbol, Object... optionalArgs)
    {
        return this.fetchPositionHistory(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> fetchPositionsHistory(Object symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionsHistory () is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> fetchPositionsHistory(Object... optionalArgs)
    {
        return this.fetchPositionsHistory(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> fetchPositionsRisk(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionsRisk() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> fetchPositionsRisk(Object... optionalArgs)
    {
        return this.fetchPositionsRisk(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> fetchPositionsForSymbol(Object symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionsForSymbol() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> fetchPositionsForSymbol(Object symbol, Object... optionalArgs)
    {
        return this.fetchPositionsForSymbol(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> fetchPositionsForSymbolWs(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionsForSymbol() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> fetchPositionsForSymbolWs(String symbol, Object... optionalArgs)
    {
        return this.fetchPositionsForSymbolWs(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Position> watchPosition(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchPosition() is not supported yet")) ;
        }).thenApply(Position::new);

    }
    public CompletableFuture<Position> watchPosition(Object... optionalArgs)
    {
        return this.watchPosition(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Trade>> watchMyTradesForSymbols(Object symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchMyTradesForSymbols() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Trade>> watchMyTradesForSymbols(Object symbols, Object... optionalArgs)
    {
        return this.watchMyTradesForSymbols(symbols, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Trade>> watchTradesForSymbols(Object symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTradesForSymbols() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Trade>> watchTradesForSymbols(Object symbols, Object... optionalArgs)
    {
        return this.watchTradesForSymbols(symbols, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Tickers> fetchBidsAsks(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchBidsAsks() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }
    public CompletableFuture<Tickers> fetchBidsAsks(Object... optionalArgs)
    {
        return this.fetchBidsAsks(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Ticker> fetchMarkPrice(String symbol2, Map<String, Object> parameters)
    {
        final Object symbol3 = symbol2;
        return BaseExchange.supplyAsync(() -> {
            Object symbol = symbol3;
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchMarkPrices"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchMarkPrices"), false))
            {
                (this.loadMarkets()).join();
                Map<String, Object> market = (Map<String, Object>) this.market(symbol);
                symbol = ((Map<String, Object>)market).get("symbol");
                Object tickers = (this.fetchMarkPrices((Object)(new ArrayList<Object>(Arrays.asList(symbol))), (Object)(parameters))).join();
                Map<String, Object> ticker = (Map<String, Object>) this.safeDict(tickers, symbol);
                if (java.util.Objects.equals(ticker, null))
                {
                    throw new NullResponse(((this.id + " fetchMarkPrices() could not find a ticker for ") + symbol)) ;
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
    public CompletableFuture<Ticker> fetchMarkPrice(String symbol, Object... optionalArgs)
    {
        return this.fetchMarkPrice(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Tickers> fetchMarkPrices(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchMarkPrices() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }
    public CompletableFuture<Tickers> fetchMarkPrices(Object... optionalArgs)
    {
        return this.fetchMarkPrices(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Tickers> watchBidsAsks(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchBidsAsks() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }
    public CompletableFuture<Tickers> watchBidsAsks(Object... optionalArgs)
    {
        return this.watchBidsAsks(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Ticker> watchMarkPrice(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchMarkPrice () is not supported yet")) ;
        }).thenApply(Ticker::new);

    }
    public CompletableFuture<Ticker> watchMarkPrice(String symbol, Object... optionalArgs)
    {
        return this.watchMarkPrice(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Tickers> watchMarkPrices(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchMarkPrices () is not supported yet")) ;
        }).thenApply(Tickers::new);

    }
    public CompletableFuture<Tickers> watchMarkPrices(Object... optionalArgs)
    {
        return this.watchMarkPrices(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<OrderBook> fetchL3OrderBook(Object symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new BadRequest((this.id + " fetchL3OrderBook() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }
    public CompletableFuture<OrderBook> fetchL3OrderBook(Object symbol, Object... optionalArgs)
    {
        return this.fetchL3OrderBook(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<OrderBook> watchOrderBookForSymbols(Object symbols, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrderBookForSymbols() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }
    public CompletableFuture<OrderBook> watchOrderBookForSymbols(Object symbols, Object... optionalArgs)
    {
        return this.watchOrderBookForSymbols(symbols, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> watchOrdersForSymbols(Object symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrdersForSymbols() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> watchOrdersForSymbols(Object symbols, Object... optionalArgs)
    {
        return this.watchOrdersForSymbols(symbols, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> cancelAllOrdersWs(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelAllOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> cancelAllOrdersWs(Object... optionalArgs)
    {
        return this.cancelAllOrdersWs(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> cancelOrderWs(String id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> cancelOrderWs(String id, Object... optionalArgs)
    {
        return this.cancelOrderWs(id, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> cancelOrdersWs(Object ids, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> cancelOrdersWs(Object ids, Object... optionalArgs)
    {
        return this.cancelOrdersWs(ids, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createLimitBuyOrderWs(String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, (Object)("limit"), (Object)("buy"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createLimitBuyOrderWs(String symbol, Object amount, Object price, Object... optionalArgs)
    {
        return this.createLimitBuyOrderWs(symbol, amount, price, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createLimitOrderWs(String symbol, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createLimitOrderWs(String symbol, Object side, Object amount, Object price, Object... optionalArgs)
    {
        return this.createLimitOrderWs(symbol, side, amount, price, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createLimitSellOrderWs(String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, (Object)("limit"), (Object)("sell"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createLimitSellOrderWs(String symbol, Object amount, Object price, Object... optionalArgs)
    {
        return this.createLimitSellOrderWs(symbol, amount, price, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createMarketBuyOrderWs(String symbol, Object amount, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, (Object)("market"), (Object)("buy"), (Object)(amount), (Object)(null), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketBuyOrderWs(String symbol, Object amount, Object... optionalArgs)
    {
        return this.createMarketBuyOrderWs(symbol, amount, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createMarketOrderWithCostWs(String symbol, Object side, Object cost, Map<String, Object> parameters)
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
            if ((!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketOrderWithCostWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketOrderWithCostWs"), false)) || ((!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketBuyOrderWithCostWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketBuyOrderWithCostWs"), false)) && (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketSellOrderWithCostWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketSellOrderWithCostWs"), false))))
            {
                return (this.createOrderWs(symbol, (Object)("market"), (Object)(side), (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createMarketOrderWithCostWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketOrderWithCostWs(String symbol, Object side, Object cost, Object... optionalArgs)
    {
        return this.createMarketOrderWithCostWs(symbol, side, cost, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createMarketOrderWs(String symbol, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, (Object)("market"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketOrderWs(String symbol, Object side, Object amount, Object... optionalArgs)
    {
        return this.createMarketOrderWs(symbol, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createMarketSellOrderWs(String symbol, Object amount, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrderWs(symbol, (Object)("market"), (Object)("sell"), (Object)(amount), (Object)(null), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketSellOrderWs(String symbol, Object amount, Object... optionalArgs)
    {
        return this.createMarketSellOrderWs(symbol, amount, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createOrderWithTakeProfitAndStopLossWs(String symbol, Object type, Object side, Object amount, Object price, Object takeProfit, Object stopLoss, Map<String, Object> parameters2)
    {
        final Map<String, Object> parameters3 = parameters2;
        return BaseExchange.supplyAsync(() -> {
            Object parameters = parameters3;
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
            parameters = this.setTakeProfitAndStopLossParams(symbol, type, side, amount, price, takeProfit, stopLoss, parameters);
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createOrderWithTakeProfitAndStopLossWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createOrderWithTakeProfitAndStopLossWs"), false))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createOrderWithTakeProfitAndStopLossWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createOrderWithTakeProfitAndStopLossWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createOrderWithTakeProfitAndStopLossWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, optionalArgs != null && optionalArgs.length > 2 ? optionalArgs[2] : null, Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createOrderWs(String symbol, Object type, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createOrderWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> createOrdersWs(Object orders, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrdersWs () is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> createOrdersWs(Object orders, Object... optionalArgs)
    {
        return this.createOrdersWs(orders, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createPostOnlyOrderWs(String symbol, Object type, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createPostOnlyOrderWs"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createPostOnlyOrderWs"), false))
            {
                throw new NotSupported((this.id + " createPostOnlyOrderWs() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "postOnly", true );
            }});
            return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createPostOnlyOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createPostOnlyOrderWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createReduceOnlyOrderWs(String symbol, Object type, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createReduceOnlyOrderWs"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createReduceOnlyOrderWs"), false))
            {
                throw new NotSupported((this.id + " createReduceOnlyOrderWs() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "reduceOnly", true );
            }});
            return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createReduceOnlyOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createReduceOnlyOrderWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createStopLimitOrderWs(String symbol, Object side, Object amount, Object price, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopLimitOrderWs"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopLimitOrderWs"), false))
            {
                throw new NotSupported((this.id + " createStopLimitOrderWs() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrderWs(symbol, (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createStopLimitOrderWs(String symbol, Object side, Object amount, Object price, Object triggerPrice, Object... optionalArgs)
    {
        return this.createStopLimitOrderWs(symbol, side, amount, price, triggerPrice, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createStopLossOrderWs(String symbol, Object type, Object side, Object amount, Object price, Object stopLossPrice2, Map<String, Object> parameters2)
    {
        final Object stopLossPrice3 = stopLossPrice2;
        final Map<String, Object> parameters3 = parameters2;
        return BaseExchange.supplyAsync(() -> {
            Object stopLossPrice = stopLossPrice3;
            Object parameters = parameters3;
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
            final Object finalStopLossPrice = stopLossPrice;
            parameters = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopLossPrice", finalStopLossPrice );
            }});
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopLossOrderWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopLossOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createStopLossOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createStopLossOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createStopLossOrderWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createStopMarketOrderWs(String symbol, Object side, Object amount, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopMarketOrderWs"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopMarketOrderWs"), false))
            {
                throw new NotSupported((this.id + " createStopMarketOrderWs() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrderWs(symbol, (Object)("market"), (Object)(side), (Object)(amount), (Object)(null), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createStopMarketOrderWs(String symbol, Object side, Object amount, Object triggerPrice, Object... optionalArgs)
    {
        return this.createStopMarketOrderWs(symbol, side, amount, triggerPrice, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createStopOrderWs(String symbol, Object type, Object side, Object amount, Object price, Object triggerPrice2, Map<String, Object> parameters)
    {
        final Object triggerPrice3 = triggerPrice2;
        return BaseExchange.supplyAsync(() -> {
            Object triggerPrice = triggerPrice3;
            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopOrderWs"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopOrderWs"), false))
            {
                throw new NotSupported((this.id + " createStopOrderWs() is not supported yet")) ;
            }
            if (java.util.Objects.equals(triggerPrice, null))
            {
                throw new ArgumentsRequired((this.id + " createStopOrderWs() requires a stopPrice argument")) ;
            }
            final Object finalTriggerPrice = triggerPrice;
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", finalTriggerPrice );
            }});
            return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createStopOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createStopOrderWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createTakeProfitOrderWs(String symbol, Object type, Object side, Object amount, Object price, Object takeProfitPrice2, Map<String, Object> parameters2)
    {
        final Object takeProfitPrice3 = takeProfitPrice2;
        final Map<String, Object> parameters3 = parameters2;
        return BaseExchange.supplyAsync(() -> {
            Object takeProfitPrice = takeProfitPrice3;
            Object parameters = parameters3;
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
            final Object finalTakeProfitPrice = takeProfitPrice;
            parameters = this.extend(parameters, new HashMap<String, Object>() {{
                put( "takeProfitPrice", finalTakeProfitPrice );
            }});
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createTakeProfitOrderWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createTakeProfitOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createTakeProfitOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createTakeProfitOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createTakeProfitOrderWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createTrailingAmountOrderWs(String symbol, Object type, Object side, Object amount, Object price, Object trailingAmount2, Object trailingTriggerPrice2, Map<String, Object> parameters)
    {
        final Object trailingAmount3 = trailingAmount2;
        final Object trailingTriggerPrice3 = trailingTriggerPrice2;
        return BaseExchange.supplyAsync(() -> {
            Object trailingAmount = trailingAmount3;
            Object trailingTriggerPrice = trailingTriggerPrice3;
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
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createTrailingAmountOrderWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createTrailingAmountOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createTrailingAmountOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createTrailingAmountOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createTrailingAmountOrderWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, optionalArgs != null && optionalArgs.length > 2 ? optionalArgs[2] : null, Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createTrailingPercentOrderWs(String symbol, Object type, Object side, Object amount, Object price, Object trailingPercent2, Object trailingTriggerPrice2, Map<String, Object> parameters)
    {
        final Object trailingPercent3 = trailingPercent2;
        final Object trailingTriggerPrice3 = trailingTriggerPrice2;
        return BaseExchange.supplyAsync(() -> {
            Object trailingPercent = trailingPercent3;
            Object trailingTriggerPrice = trailingTriggerPrice3;
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
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createTrailingPercentOrderWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createTrailingPercentOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createTrailingPercentOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createTrailingPercentOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createTrailingPercentOrderWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, optionalArgs != null && optionalArgs.length > 2 ? optionalArgs[2] : null, Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createTriggerOrderWs(String symbol, Object type, Object side, Object amount, Object price, Object triggerPrice2, Map<String, Object> parameters2)
    {
        final Object triggerPrice3 = triggerPrice2;
        final Map<String, Object> parameters3 = parameters2;
        return BaseExchange.supplyAsync(() -> {
            Object triggerPrice = triggerPrice3;
            Object parameters = parameters3;
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
            final Object finalTriggerPrice = triggerPrice;
            parameters = this.extend(parameters, new HashMap<String, Object>() {{
                put( "triggerPrice", finalTriggerPrice );
            }});
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createTriggerOrderWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createTriggerOrderWs"), false))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createTriggerOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createTriggerOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createTriggerOrderWs(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> editOrderWs(String id, String symbol, Object type, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            (this.cancelOrderWs(id, (Object)(symbol))).join();
            return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> editOrderWs(String id, String symbol, Object type, Object side, Object... optionalArgs)
    {
        return this.editOrderWs(id, symbol, type, side, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> fetchClosedOrdersWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOrdersWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOrdersWs"), false))
            {
                Object orders = (this.fetchOrdersWs((Object)(symbol), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return this.filterBy(orders, "status", "closed");
            }
            throw new NotSupported((this.id + " fetchClosedOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> fetchClosedOrdersWs(Object... optionalArgs)
    {
        return this.fetchClosedOrdersWs(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Trade>> fetchMyTradesWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchMyTradesWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Trade>> fetchMyTradesWs(Object... optionalArgs)
    {
        return this.fetchMyTradesWs(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> fetchOpenOrdersWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOrdersWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOrdersWs"), false))
            {
                Object orders = (this.fetchOrdersWs((Object)(symbol), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return this.filterBy(orders, "status", "open");
            }
            throw new NotSupported((this.id + " fetchOpenOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> fetchOpenOrdersWs(Object... optionalArgs)
    {
        return this.fetchOpenOrdersWs(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<OrderBook> fetchOrderBookWs(String symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderBookWs() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }
    public CompletableFuture<OrderBook> fetchOrderBookWs(String symbol, Object... optionalArgs)
    {
        return this.fetchOrderBookWs(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> fetchOrderWs(String id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderWs() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> fetchOrderWs(String id, Object... optionalArgs)
    {
        return this.fetchOrderWs(id, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> fetchOrdersWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrdersWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> fetchOrdersWs(Object... optionalArgs)
    {
        return this.fetchOrdersWs(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> fetchPositionWs(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositionWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> fetchPositionWs(String symbol, Object... optionalArgs)
    {
        return this.fetchPositionWs(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> fetchPositionsWs(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> fetchPositionsWs(Object... optionalArgs)
    {
        return this.fetchPositionsWs(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Ticker> fetchTickerWs(String symbol2, Map<String, Object> parameters)
    {
        final Object symbol3 = symbol2;
        return BaseExchange.supplyAsync(() -> {
            Object symbol = symbol3;
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchTickersWs"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchTickersWs"), false))
            {
                (this.loadMarkets()).join();
                Map<String, Object> market = (Map<String, Object>) this.market(symbol);
                symbol = ((Map<String, Object>)market).get("symbol");
                Object tickers = (this.fetchTickersWs((Object)(new ArrayList<Object>(Arrays.asList(symbol))), (Object)(parameters))).join();
                Map<String, Object> ticker = (Map<String, Object>) this.safeDict(tickers, symbol);
                if (java.util.Objects.equals(ticker, null))
                {
                    throw new NullResponse(((this.id + " fetchTickerWs() could not find a ticker for ") + symbol)) ;
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
    public CompletableFuture<Ticker> fetchTickerWs(String symbol, Object... optionalArgs)
    {
        return this.fetchTickerWs(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Tickers> fetchTickersWs(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTickersWs() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }
    public CompletableFuture<Tickers> fetchTickersWs(Object... optionalArgs)
    {
        return this.fetchTickersWs(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Trade>> fetchTradesWs(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTradesWs() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Trade>> fetchTradesWs(String symbol, Object... optionalArgs)
    {
        return this.fetchTradesWs(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }


    public CompletableFuture<List<Trade>> fetchTrades(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Trade>> fetchTrades(String symbol, Object... optionalArgs)
    {
        return this.fetchTrades(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Trade>> watchTrades(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Trade>> watchTrades(String symbol, Object... optionalArgs)
    {
        return this.watchTrades(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<OrderBook> fetchOrderBook(Object symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderBook() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }
    public CompletableFuture<OrderBook> fetchOrderBook(Object symbol, Object... optionalArgs)
    {
        return this.fetchOrderBook(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Object> fetchRestOrderBookSafe(Object symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            Object fetchSnapshotMaxRetries = this.handleOption("watchOrderBook", "maxRetries", 3);
            for (var i = 0; Helpers.isLessThan(i, fetchSnapshotMaxRetries); i++)
            {
                try
                {
                    Object orderBook = (this.fetchOrderBook((Object)(symbol), (Object)(limit), (Object)(parameters))).join();
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
    public CompletableFuture<Object> fetchRestOrderBookSafe(Object symbol, Object... optionalArgs)
    {
        return this.fetchRestOrderBookSafe(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<OrderBook> watchOrderBook(String symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrderBook() is not supported yet")) ;
        }).thenApply(OrderBook::new);

    }
    public CompletableFuture<OrderBook> watchOrderBook(String symbol, Object... optionalArgs)
    {
        return this.watchOrderBook(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<OpenInterest> fetchOpenInterest(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOpenInterests"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOpenInterests"), false))
            {
                Object openInterests = (this.fetchOpenInterests((Object)(new ArrayList<Object>(Arrays.asList(symbol))), (Object)(parameters))).join();
                return this.safeDict(openInterests, symbol);
            } else
            {
                throw new NotSupported((this.id + " fetchOpenInterest() is not supported yet")) ;
            }
        }).thenApply(OpenInterest::new);

    }
    public CompletableFuture<OpenInterest> fetchOpenInterest(String symbol, Object... optionalArgs)
    {
        return this.fetchOpenInterest(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<OrderBook> fetchL2OrderBook(String symbol, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            Object orderbook = (this.fetchOrderBook((Object)(symbol), (Object)(limit), (Object)(parameters))).join();
            return this.extend(orderbook, new HashMap<String, Object>() {{
                put( "asks", Exchange.this.sortBy(Exchange.this.aggregate(((Map<String, Object>)orderbook).get("asks")), 0) );
                put( "bids", Exchange.this.sortBy(Exchange.this.aggregate(((Map<String, Object>)orderbook).get("bids")), 0, true) );
            }});
        }).thenApply(OrderBook::new);

    }
    public CompletableFuture<OrderBook> fetchL2OrderBook(String symbol, Object... optionalArgs)
    {
        return this.fetchL2OrderBook(symbol, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> editLimitBuyOrder(String id, String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.editLimitOrder(id, symbol, (Object)("buy"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> editLimitBuyOrder(String id, String symbol, Object amount, Object... optionalArgs)
    {
        return this.editLimitBuyOrder(id, symbol, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> editLimitSellOrder(String id, String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.editLimitOrder(id, symbol, (Object)("sell"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> editLimitSellOrder(String id, String symbol, Object amount, Object... optionalArgs)
    {
        return this.editLimitSellOrder(id, symbol, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> editLimitOrder(String id, String symbol, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.editOrder(id, symbol, (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> editLimitOrder(String id, String symbol, Object side, Object amount, Object... optionalArgs)
    {
        return this.editLimitOrder(id, symbol, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> editOrder(String id, String symbol, Object type, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            (this.cancelOrder((Object)(id), (Object)(symbol))).join();
            return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> editOrder(String id, String symbol, Object type, Object side, Object... optionalArgs)
    {
        return this.editOrder(id, symbol, type, side, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> editOrderWithClientOrderId(Object clientOrderId, String symbol, Object type, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            Map<String, Object> extendedParams = this.extend(parameters, new HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }});
            return (this.editOrder("", symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(extendedParams))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> editOrderWithClientOrderId(Object clientOrderId, String symbol, Object type, Object side, Object... optionalArgs)
    {
        return this.editOrderWithClientOrderId(clientOrderId, symbol, type, side, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Position> fetchPosition(Object symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPosition() is not supported yet")) ;
        }).thenApply(Position::new);

    }
    public CompletableFuture<Position> fetchPosition(Object symbol, Object... optionalArgs)
    {
        return this.fetchPosition(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> watchPositions(Object symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> watchPositions(Object... optionalArgs)
    {
        return this.watchPositions(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> watchPositionForSymbols(Object symbols, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.watchPositions((Object)(symbols), (Object)(since), (Object)(limit), (Object)(parameters))).join();
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> watchPositionForSymbols(Object... optionalArgs)
    {
        return this.watchPositionForSymbols(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Position>> fetchPositions(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Position::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Position>> fetchPositions(Object... optionalArgs)
    {
        return this.fetchPositions(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Ticker> fetchTicker(String symbol2, Map<String, Object> parameters)
    {
        final Object symbol3 = symbol2;
        return BaseExchange.supplyAsync(() -> {
            Object symbol = symbol3;
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchTickers"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchTickers"), false))
            {
                (this.loadMarkets()).join();
                Map<String, Object> market = (Map<String, Object>) this.market(symbol);
                symbol = ((Map<String, Object>)market).get("symbol");
                Object tickers = (this.fetchTickers((Object)(new ArrayList<Object>(Arrays.asList(symbol))), (Object)(parameters))).join();
                Map<String, Object> ticker = (Map<String, Object>) this.safeDict(tickers, symbol);
                if (java.util.Objects.equals(ticker, null))
                {
                    throw new NullResponse(((this.id + " fetchTickers() could not find a ticker for ") + symbol)) ;
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
    public CompletableFuture<Ticker> fetchTicker(String symbol, Object... optionalArgs)
    {
        return this.fetchTicker(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Ticker> watchTicker(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTicker() is not supported yet")) ;
        }).thenApply(Ticker::new);

    }
    public CompletableFuture<Ticker> watchTicker(String symbol, Object... optionalArgs)
    {
        return this.watchTicker(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Tickers> fetchTickers(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTickers() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }
    public CompletableFuture<Tickers> fetchTickers(Object... optionalArgs)
    {
        return this.fetchTickers(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Tickers> watchTickers(Object symbols, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTickers() is not supported yet")) ;
        }).thenApply(Tickers::new);

    }
    public CompletableFuture<Tickers> watchTickers(Object... optionalArgs)
    {
        return this.watchTickers(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> fetchOrder(Object id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> fetchOrder(Object id, Object... optionalArgs)
    {
        return this.fetchOrder(id, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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
            return (this.fetchOrder((Object)(""), (Object)(symbol), (Object)(extendedParams))).join();
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
    public CompletableFuture<Order> fetchOrderWithClientOrderId(Object clientOrderId, Object... optionalArgs)
    {
        return this.fetchOrderWithClientOrderId(clientOrderId, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<String> fetchOrderStatus(String id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            // TODO: TypeScript: change method signature by replacing
            // Promise<string> with Promise<Order['status']>.
            Object order = (this.fetchOrder((Object)(id), (Object)(symbol), (Object)(parameters))).join();
            return ((Map<String, Object>)order).get("status");
        }).thenApply(res -> (String) res);

    }
    public CompletableFuture<String> fetchOrderStatus(String id, Object... optionalArgs)
    {
        return this.fetchOrderStatus(id, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> fetchUnifiedOrder(Object order, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.fetchOrder((Object)(this.safeString(order, "id")), (Object)(this.safeString(order, "symbol")), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> fetchUnifiedOrder(Object order, Object... optionalArgs)
    {
        return this.fetchUnifiedOrder(order, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createOrder(Object symbol, Object type, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createOrder(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createTrailingAmountOrder(String symbol, Object type, Object side, Object amount, Object price, Object trailingAmount2, Object trailingTriggerPrice2, Map<String, Object> parameters)
    {
        final Object trailingAmount3 = trailingAmount2;
        final Object trailingTriggerPrice3 = trailingTriggerPrice2;
        return BaseExchange.supplyAsync(() -> {
            Object trailingAmount = trailingAmount3;
            Object trailingTriggerPrice = trailingTriggerPrice3;
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
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createTrailingAmountOrder"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createTrailingAmountOrder"), false))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createTrailingAmountOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createTrailingAmountOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createTrailingAmountOrder(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, optionalArgs != null && optionalArgs.length > 2 ? optionalArgs[2] : null, Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createTrailingPercentOrder(String symbol, Object type, Object side, Object amount, Object price, Object trailingPercent2, Object trailingTriggerPrice2, Map<String, Object> parameters)
    {
        final Object trailingPercent3 = trailingPercent2;
        final Object trailingTriggerPrice3 = trailingTriggerPrice2;
        return BaseExchange.supplyAsync(() -> {
            Object trailingPercent = trailingPercent3;
            Object trailingTriggerPrice = trailingTriggerPrice3;
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
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createTrailingPercentOrder"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createTrailingPercentOrder"), false))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createTrailingPercentOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createTrailingPercentOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createTrailingPercentOrder(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, optionalArgs != null && optionalArgs.length > 2 ? optionalArgs[2] : null, Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createMarketOrderWithCost(String symbol, Object side, Object cost, Map<String, Object> parameters)
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
            if ((!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketOrderWithCost"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketOrderWithCost"), false)) || ((!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketBuyOrderWithCost"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketBuyOrderWithCost"), false)) && (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketSellOrderWithCost"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketSellOrderWithCost"), false))))
            {
                return (this.createOrder((Object)(symbol), (Object)("market"), (Object)(side), (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createMarketOrderWithCost() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketOrderWithCost(String symbol, Object side, Object cost, Object... optionalArgs)
    {
        return this.createMarketOrderWithCost(symbol, side, cost, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
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
            if ((java.util.Objects.equals(((Map<String, Object>)this.options).get("createMarketBuyOrderRequiresPrice"), true)) || (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketBuyOrderWithCost"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketBuyOrderWithCost"), false)))
            {
                return (this.createOrder((Object)(symbol), (Object)("market"), (Object)("buy"), (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createMarketBuyOrderWithCost() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketBuyOrderWithCost(String symbol, Object cost, Object... optionalArgs)
    {
        return this.createMarketBuyOrderWithCost(symbol, cost, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
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
            if ((java.util.Objects.equals(((Map<String, Object>)this.options).get("createMarketSellOrderRequiresPrice"), true)) || (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketSellOrderWithCost"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketSellOrderWithCost"), false)))
            {
                return (this.createOrder((Object)(symbol), (Object)("market"), (Object)("sell"), (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createMarketSellOrderWithCost() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketSellOrderWithCost(String symbol, Object cost, Object... optionalArgs)
    {
        return this.createMarketSellOrderWithCost(symbol, cost, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createTriggerOrder(String symbol, Object type, Object side, Object amount, Object price, Object triggerPrice2, Map<String, Object> parameters2)
    {
        final Object triggerPrice3 = triggerPrice2;
        final Map<String, Object> parameters3 = parameters2;
        return BaseExchange.supplyAsync(() -> {
            Object triggerPrice = triggerPrice3;
            Object parameters = parameters3;
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
            final Object finalTriggerPrice = triggerPrice;
            parameters = this.extend(parameters, new HashMap<String, Object>() {{
                put( "triggerPrice", finalTriggerPrice );
            }});
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createTriggerOrder"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createTriggerOrder"), false))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createTriggerOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createTriggerOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createTriggerOrder(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createStopLossOrder(String symbol, Object type, Object side, Object amount, Object price, Object stopLossPrice2, Map<String, Object> parameters2)
    {
        final Object stopLossPrice3 = stopLossPrice2;
        final Map<String, Object> parameters3 = parameters2;
        return BaseExchange.supplyAsync(() -> {
            Object stopLossPrice = stopLossPrice3;
            Object parameters = parameters3;
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
            final Object finalStopLossPrice = stopLossPrice;
            parameters = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopLossPrice", finalStopLossPrice );
            }});
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopLossOrder"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopLossOrder"), false))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createStopLossOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createStopLossOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createStopLossOrder(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createTakeProfitOrder(String symbol, Object type, Object side, Object amount, Object price, Object takeProfitPrice2, Map<String, Object> parameters2)
    {
        final Object takeProfitPrice3 = takeProfitPrice2;
        final Map<String, Object> parameters3 = parameters2;
        return BaseExchange.supplyAsync(() -> {
            Object takeProfitPrice = takeProfitPrice3;
            Object parameters = parameters3;
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
            final Object finalTakeProfitPrice = takeProfitPrice;
            parameters = this.extend(parameters, new HashMap<String, Object>() {{
                put( "takeProfitPrice", finalTakeProfitPrice );
            }});
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createTakeProfitOrder"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createTakeProfitOrder"), false))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createTakeProfitOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createTakeProfitOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createTakeProfitOrder(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createOrderWithTakeProfitAndStopLoss(String symbol, Object type, Object side, Object amount, Object price, Object takeProfit, Object stopLoss, Map<String, Object> parameters2)
    {
        final Map<String, Object> parameters3 = parameters2;
        return BaseExchange.supplyAsync(() -> {
            Object parameters = parameters3;
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
            parameters = this.setTakeProfitAndStopLossParams(symbol, type, side, amount, price, takeProfit, stopLoss, parameters);
            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createOrderWithTakeProfitAndStopLoss"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createOrderWithTakeProfitAndStopLoss"), false))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createOrderWithTakeProfitAndStopLoss() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createOrderWithTakeProfitAndStopLoss(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createOrderWithTakeProfitAndStopLoss(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, optionalArgs != null && optionalArgs.length > 2 ? optionalArgs[2] : null, Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> createOrders(Object orders, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> createOrders(Object orders, Object... optionalArgs)
    {
        return this.createOrders(orders, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> cancelOrder(Object id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrder() is not supported yet")) ;
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> cancelOrder(Object id, Object... optionalArgs)
    {
        return this.cancelOrder(id, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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
            return (this.cancelOrder((Object)(""), (Object)(symbol), (Object)(extendedParams))).join();
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
    public CompletableFuture<Order> cancelOrderWithClientOrderId(Object clientOrderId, Object... optionalArgs)
    {
        return this.cancelOrderWithClientOrderId(clientOrderId, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> cancelOrders(Object ids, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> cancelOrders(Object ids, Object... optionalArgs)
    {
        return this.cancelOrders(ids, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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
            return (this.cancelOrders((Object)(new ArrayList<Object>(Arrays.asList())), (Object)(symbol), (Object)(extendedParams))).join();
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
    public CompletableFuture<List<Order>> cancelOrdersWithClientOrderIds(Object clientOrderIds, Object... optionalArgs)
    {
        return this.cancelOrdersWithClientOrderIds(clientOrderIds, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> cancelAllOrders(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelAllOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> cancelAllOrders(Object... optionalArgs)
    {
        return this.cancelAllOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> cancelUnifiedOrder(Object order, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return this.cancelOrder(this.safeString(order, "id"), this.safeString(order, "symbol"), parameters);
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> cancelUnifiedOrder(Object order, Object... optionalArgs)
    {
        return this.cancelUnifiedOrder(order, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> fetchOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if ((!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOpenOrders"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOpenOrders"), false)) && (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchClosedOrders"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchClosedOrders"), false)))
            {
                throw new NotSupported((this.id + " fetchOrders() is not supported yet, consider using fetchOpenOrders() and fetchClosedOrders() instead")) ;
            }
            throw new NotSupported((this.id + " fetchOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> fetchOrders(Object... optionalArgs)
    {
        return this.fetchOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Trade>> fetchOrderTrades(String id, String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Trade>> fetchOrderTrades(String id, Object... optionalArgs)
    {
        return this.fetchOrderTrades(id, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> watchOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> watchOrders(Object... optionalArgs)
    {
        return this.watchOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> fetchOpenOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOrders"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOrders"), false))
            {
                Object orders = (this.fetchOrders((Object)(symbol), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return this.filterBy(orders, "status", "open");
            }
            throw new NotSupported((this.id + " fetchOpenOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> fetchOpenOrders(Object... optionalArgs)
    {
        return this.fetchOpenOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> fetchClosedOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (!java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOrders"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchOrders"), false))
            {
                Object orders = (this.fetchOrders((Object)(symbol), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return this.filterBy(orders, "status", "closed");
            }
            throw new NotSupported((this.id + " fetchClosedOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> fetchClosedOrders(Object... optionalArgs)
    {
        return this.fetchClosedOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Order>> fetchCanceledOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchCanceledOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Order::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Order>> fetchCanceledOrders(Object... optionalArgs)
    {
        return this.fetchCanceledOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Trade>> fetchMyTrades(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchMyTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Trade>> fetchMyTrades(Object... optionalArgs)
    {
        return this.fetchMyTrades(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<List<Trade>> watchMyTrades(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchMyTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(Trade::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<Trade>> watchMyTrades(Object... optionalArgs)
    {
        return this.watchMyTrades(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createLimitOrder(String symbol, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder((Object)(symbol), (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createLimitOrder(String symbol, Object side, Object amount, Object price, Object... optionalArgs)
    {
        return this.createLimitOrder(symbol, side, amount, price, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createMarketOrder(String symbol, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder((Object)(symbol), (Object)("market"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketOrder(String symbol, Object side, Object amount, Object... optionalArgs)
    {
        return this.createMarketOrder(symbol, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createLimitBuyOrder(String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder((Object)(symbol), (Object)("limit"), (Object)("buy"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createLimitBuyOrder(String symbol, Object amount, Object price, Object... optionalArgs)
    {
        return this.createLimitBuyOrder(symbol, amount, price, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createLimitSellOrder(String symbol, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder((Object)(symbol), (Object)("limit"), (Object)("sell"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createLimitSellOrder(String symbol, Object amount, Object price, Object... optionalArgs)
    {
        return this.createLimitSellOrder(symbol, amount, price, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createMarketBuyOrder(String symbol, Object amount, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder((Object)(symbol), (Object)("market"), (Object)("buy"), (Object)(amount), (Object)(null), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketBuyOrder(String symbol, Object amount, Object... optionalArgs)
    {
        return this.createMarketBuyOrder(symbol, amount, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createMarketSellOrder(String symbol, Object amount, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (this.createOrder((Object)(symbol), (Object)("market"), (Object)("sell"), (Object)(amount), (Object)(null), (Object)(parameters))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createMarketSellOrder(String symbol, Object amount, Object... optionalArgs)
    {
        return this.createMarketSellOrder(symbol, amount, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createPostOnlyOrder(String symbol, Object type, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createPostOnlyOrder"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createPostOnlyOrder"), false))
            {
                throw new NotSupported((this.id + " createPostOnlyOrder() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "postOnly", true );
            }});
            return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createPostOnlyOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createPostOnlyOrder(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createReduceOnlyOrder(String symbol, Object type, Object side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createReduceOnlyOrder"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createReduceOnlyOrder"), false))
            {
                throw new NotSupported((this.id + " createReduceOnlyOrder() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "reduceOnly", true );
            }});
            return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createReduceOnlyOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createReduceOnlyOrder(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createStopOrder(String symbol, Object type, Object side, Object amount, Object price, Object triggerPrice2, Map<String, Object> parameters)
    {
        final Object triggerPrice3 = triggerPrice2;
        return BaseExchange.supplyAsync(() -> {
            Object triggerPrice = triggerPrice3;
            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopOrder"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopOrder"), false))
            {
                throw new NotSupported((this.id + " createStopOrder() is not supported yet")) ;
            }
            if (java.util.Objects.equals(triggerPrice, null))
            {
                throw new ArgumentsRequired((this.id + " create_stop_order() requires a stopPrice argument")) ;
            }
            final Object finalTriggerPrice = triggerPrice;
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", finalTriggerPrice );
            }});
            return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createStopOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {
        return this.createStopOrder(symbol, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createStopLimitOrder(String symbol, Object side, Object amount, Object price, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopLimitOrder"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopLimitOrder"), false))
            {
                throw new NotSupported((this.id + " createStopLimitOrder() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrder((Object)(symbol), (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createStopLimitOrder(String symbol, Object side, Object amount, Object price, Object triggerPrice, Object... optionalArgs)
    {
        return this.createStopLimitOrder(symbol, side, amount, price, triggerPrice, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Order> createStopMarketOrder(String symbol, Object side, Object amount, Object triggerPrice, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopMarketOrder"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("createStopMarketOrder"), false))
            {
                throw new NotSupported((this.id + " createStopMarketOrder() is not supported yet")) ;
            }
            Map<String, Object> query = this.extend(parameters, new HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrder((Object)(symbol), (Object)("market"), (Object)(side), (Object)(amount), (Object)(null), (Object)(query))).join();
        }).thenApply(Order::new);

    }
    public CompletableFuture<Order> createStopMarketOrder(String symbol, Object side, Object amount, Object triggerPrice, Object... optionalArgs)
    {
        return this.createStopMarketOrder(symbol, side, amount, triggerPrice, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<TradingFeeInterface> fetchTradingFee(String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchTradingFees"), null) || java.util.Objects.equals(((Map<String, Object>)this.has).get("fetchTradingFees"), false))
            {
                throw new NotSupported((this.id + " fetchTradingFee() is not supported yet")) ;
            }
            Object fees = (this.fetchTradingFees((Object)(parameters))).join();
            return this.safeDict(fees, symbol);
        }).thenApply(TradingFeeInterface::new);

    }
    public CompletableFuture<TradingFeeInterface> fetchTradingFee(String symbol, Object... optionalArgs)
    {
        return this.fetchTradingFee(symbol, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }
}
