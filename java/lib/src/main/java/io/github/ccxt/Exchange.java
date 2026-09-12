package io.github.ccxt;

import io.github.ccxt.errors.*;
import io.github.ccxt.base.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

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

public java.util.concurrent.CompletableFuture<Object> closePosition(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object side = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " closePosition() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> closeAllPositions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " closeAllPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editOrders(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " editOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchCanceledAndClosedOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchCanceledAndClosedOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionHistory(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchPositionsHistory"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchPositionsHistory"), false))))
            {
                Object positions = (this.fetchPositionsHistory((Object)(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol))), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return positions;
            } else
            {
                throw new NotSupported(Helpers.add(this.id, " fetchPositionHistory () is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsHistory(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchPositionsHistory () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsRisk(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchPositionsRisk() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsForSymbol(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchPositionsForSymbol() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsForSymbolWs(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchPositionsForSymbol() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchPosition(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchPosition() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMyTradesForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchMyTradesForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTradesForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchTradesForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchBidsAsks(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchBidsAsks() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarkPrice(String symbol2, Object... optionalArgs)
    {
        final Object symbol3 = symbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = symbol3;
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchMarkPrices"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchMarkPrices"), false))))
            {
                (this.loadMarkets()).join();
                java.util.Map<String, Object> market = (java.util.Map<String, Object>) this.market(symbol);
                symbol = Helpers.GetValue(market, "symbol");
                Object tickers = (this.fetchMarkPrices((Object)(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol))), (Object)(parameters))).join();
                Object ticker = this.safeDict(tickers, symbol);
                if (Helpers.isTrue(Helpers.isEqual(ticker, null)))
                {
                    throw new NullResponse(Helpers.add(Helpers.add(this.id, " fetchMarkPrices() could not find a ticker for "), symbol)) ;
                } else
                {
                    return ticker;
                }
            } else
            {
                throw new NotSupported(Helpers.add(this.id, " fetchMarkPrices() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMarkPrices(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchMarkPrices() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchBidsAsks(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchBidsAsks() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMarkPrice(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchMarkPrice () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMarkPrices(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchMarkPrices () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchL3OrderBook(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new BadRequest(Helpers.add(this.id, " fetchL3OrderBook() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrderBookForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchOrderBookForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrdersForSymbols(Object symbols, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchOrdersForSymbols() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelAllOrdersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " cancelAllOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrderWs(String id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " cancelOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrdersWs(Object ids, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " cancelOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitBuyOrderWs(String symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, (Object)("limit"), (Object)("buy"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitOrderWs(String symbol, Object side, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitSellOrderWs(String symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, (Object)("limit"), (Object)("sell"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketBuyOrderWs(String symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, (Object)("market"), (Object)("buy"), (Object)(amount), (Object)(null), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketOrderWithCostWs(String symbol, Object side, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketOrderWithCostWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketOrderWithCostWs"), false)))) || Helpers.isTrue((Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketBuyOrderWithCostWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketBuyOrderWithCostWs"), false)))) && Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketSellOrderWithCostWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketSellOrderWithCostWs"), false))))))))
            {
                return (this.createOrderWs(symbol, (Object)("market"), (Object)(side), (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createMarketOrderWithCostWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketOrderWs(String symbol, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, (Object)("market"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketSellOrderWs(String symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrderWs(symbol, (Object)("market"), (Object)("sell"), (Object)(amount), (Object)(null), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrderWithTakeProfitAndStopLossWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object takeProfit = Helpers.getArg(optionalArgs, 1, null);
            Object stopLoss = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            parameters = this.setTakeProfitAndStopLossParams(symbol, type, side, amount, price, takeProfit, stopLoss, parameters);
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createOrderWithTakeProfitAndStopLossWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createOrderWithTakeProfitAndStopLossWs"), false))))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createOrderWithTakeProfitAndStopLossWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " createOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrdersWs(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " createOrdersWs () is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createPostOnlyOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createPostOnlyOrderWs"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createPostOnlyOrderWs"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createPostOnlyOrderWs() is not supported yet")) ;
            }
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "postOnly", true );
            }});
            return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createReduceOnlyOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createReduceOnlyOrderWs"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createReduceOnlyOrderWs"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createReduceOnlyOrderWs() is not supported yet")) ;
            }
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "reduceOnly", true );
            }});
            return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopLimitOrderWs(String symbol, Object side, Object amount, Object price, Object triggerPrice, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopLimitOrderWs"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopLimitOrderWs"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createStopLimitOrderWs() is not supported yet")) ;
            }
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrderWs(symbol, (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopLossOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object stopLossPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(stopLossPrice, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createStopLossOrderWs() requires a stopLossPrice argument")) ;
            }
            final Object finalStopLossPrice = stopLossPrice;
            parameters = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopLossPrice", finalStopLossPrice );
            }});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createStopLossOrderWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createStopLossOrderWs"), false))))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createStopLossOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopMarketOrderWs(String symbol, Object side, Object amount, Object triggerPrice, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopMarketOrderWs"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopMarketOrderWs"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createStopMarketOrderWs() is not supported yet")) ;
            }
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrderWs(symbol, (Object)("market"), (Object)(side), (Object)(amount), (Object)(null), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object triggerPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopOrderWs"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopOrderWs"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createStopOrderWs() is not supported yet")) ;
            }
            if (Helpers.isTrue(Helpers.isEqual(triggerPrice, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createStopOrderWs() requires a stopPrice argument")) ;
            }
            final Object finalTriggerPrice = triggerPrice;
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", finalTriggerPrice );
            }});
            return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTakeProfitOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object takeProfitPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(takeProfitPrice, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createTakeProfitOrderWs() requires a takeProfitPrice argument")) ;
            }
            final Object finalTakeProfitPrice = takeProfitPrice;
            parameters = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "takeProfitPrice", finalTakeProfitPrice );
            }});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTakeProfitOrderWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTakeProfitOrderWs"), false))))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createTakeProfitOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTrailingAmountOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object trailingAmount = Helpers.getArg(optionalArgs, 1, null);
            Object trailingTriggerPrice = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(trailingAmount, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createTrailingAmountOrderWs() requires a trailingAmount argument")) ;
            }
            Helpers.addElementToObject(parameters, "trailingAmount", trailingAmount);
            if (Helpers.isTrue(!Helpers.isEqual(trailingTriggerPrice, null)))
            {
                Helpers.addElementToObject(parameters, "trailingTriggerPrice", trailingTriggerPrice);
            }
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTrailingAmountOrderWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTrailingAmountOrderWs"), false))))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createTrailingAmountOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTrailingPercentOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object trailingPercent = Helpers.getArg(optionalArgs, 1, null);
            Object trailingTriggerPrice = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(trailingPercent, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createTrailingPercentOrderWs() requires a trailingPercent argument")) ;
            }
            Helpers.addElementToObject(parameters, "trailingPercent", trailingPercent);
            if (Helpers.isTrue(!Helpers.isEqual(trailingTriggerPrice, null)))
            {
                Helpers.addElementToObject(parameters, "trailingTriggerPrice", trailingTriggerPrice);
            }
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTrailingPercentOrderWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTrailingPercentOrderWs"), false))))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createTrailingPercentOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTriggerOrderWs(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object triggerPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(triggerPrice, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createTriggerOrderWs() requires a triggerPrice argument")) ;
            }
            final Object finalTriggerPrice = triggerPrice;
            parameters = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "triggerPrice", finalTriggerPrice );
            }});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTriggerOrderWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTriggerOrderWs"), false))))
            {
                return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createTriggerOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editOrderWs(String id, String symbol, Object type, Object side, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object amount = Helpers.getArg(optionalArgs, 0, null);
            Object price = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            (this.cancelOrderWs(id, (Object)(symbol))).join();
            return (this.createOrderWs(symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchClosedOrdersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOrdersWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOrdersWs"), false))))
            {
                Object orders = (this.fetchOrdersWs((Object)(symbol), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return this.filterBy(orders, "status", "closed");
            }
            throw new NotSupported(Helpers.add(this.id, " fetchClosedOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMyTradesWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchMyTradesWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenOrdersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOrdersWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOrdersWs"), false))))
            {
                Object orders = (this.fetchOrdersWs((Object)(symbol), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return this.filterBy(orders, "status", "open");
            }
            throw new NotSupported(Helpers.add(this.id, " fetchOpenOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderBookWs(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOrderBookWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderWs(String id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOrderWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrdersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOrdersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionWs(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchPositionWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositionsWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTickerWs(String symbol2, Object... optionalArgs)
    {
        final Object symbol3 = symbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = symbol3;
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchTickersWs"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchTickersWs"), false))))
            {
                (this.loadMarkets()).join();
                java.util.Map<String, Object> market = (java.util.Map<String, Object>) this.market(symbol);
                symbol = Helpers.GetValue(market, "symbol");
                Object tickers = (this.fetchTickersWs((Object)(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol))), (Object)(parameters))).join();
                Object ticker = this.safeDict(tickers, symbol);
                if (Helpers.isTrue(Helpers.isEqual(ticker, null)))
                {
                    throw new NullResponse(Helpers.add(Helpers.add(this.id, " fetchTickerWs() could not find a ticker for "), symbol)) ;
                } else
                {
                    return ticker;
                }
            } else
            {
                throw new NotSupported(Helpers.add(this.id, " fetchTickerWs() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTickersWs(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchTickersWs() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTradesWs(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchTradesWs() is not supported yet")) ;
        });

    }


    public java.util.concurrent.CompletableFuture<Object> fetchTrades(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTrades(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderBook(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOrderBook() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchRestOrderBookSafe(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            Object fetchSnapshotMaxRetries = this.handleOption("watchOrderBook", "maxRetries", 3);
            for (var i = 0; Helpers.isLessThan(i, fetchSnapshotMaxRetries); i++)
            {
                try
                {
                    Object orderBook = (this.fetchOrderBook((Object)(symbol), (Object)(limit), (Object)(parameters))).join();
                    return orderBook;
                } catch(Exception e)
                {
                    if (Helpers.isTrue(Helpers.isEqual((Helpers.add(i, 1)), fetchSnapshotMaxRetries)))
                    {
                        throw (e instanceof RuntimeException ? (RuntimeException)e : new RuntimeException(e));
                    }
                }
            }
            return null;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrderBook(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchOrderBook() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenInterest(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOpenInterests"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOpenInterests"), false))))
            {
                Object openInterests = (this.fetchOpenInterests((Object)(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol))), (Object)(parameters))).join();
                return this.safeDict(openInterests, symbol);
            } else
            {
                throw new NotSupported(Helpers.add(this.id, " fetchOpenInterest() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchL2OrderBook(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            Object orderbook = (this.fetchOrderBook((Object)(symbol), (Object)(limit), (Object)(parameters))).join();
            return this.extend(orderbook, new java.util.HashMap<String, Object>() {{
                put( "asks", Exchange.this.sortBy(Exchange.this.aggregate(Helpers.GetValue(orderbook, "asks")), 0) );
                put( "bids", Exchange.this.sortBy(Exchange.this.aggregate(Helpers.GetValue(orderbook, "bids")), 0, true) );
            }});
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editLimitBuyOrder(String id, String symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.editLimitOrder(id, symbol, (Object)("buy"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editLimitSellOrder(String id, String symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.editLimitOrder(id, symbol, (Object)("sell"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editLimitOrder(String id, String symbol, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.editOrder(id, symbol, (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editOrder(String id, String symbol, Object type, Object side, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object amount = Helpers.getArg(optionalArgs, 0, null);
            Object price = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            (this.cancelOrder((Object)(id), (Object)(symbol))).join();
            return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> editOrderWithClientOrderId(Object clientOrderId, String symbol, Object type, Object side, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object amount = Helpers.getArg(optionalArgs, 0, null);
            Object price = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            java.util.Map<String, Object> extendedParams = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }});
            return (this.editOrder("", symbol, (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(extendedParams))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPosition(Object symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchPosition() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchPositions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchPositionForSymbols(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            return (this.watchPositions((Object)(symbols), (Object)(since), (Object)(limit), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchPositions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchPositions() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTicker(String symbol2, Object... optionalArgs)
    {
        final Object symbol3 = symbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object symbol = symbol3;
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchTickers"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchTickers"), false))))
            {
                (this.loadMarkets()).join();
                java.util.Map<String, Object> market = (java.util.Map<String, Object>) this.market(symbol);
                symbol = Helpers.GetValue(market, "symbol");
                Object tickers = (this.fetchTickers((Object)(new java.util.ArrayList<Object>(java.util.Arrays.asList(symbol))), (Object)(parameters))).join();
                Object ticker = this.safeDict(tickers, symbol);
                if (Helpers.isTrue(Helpers.isEqual(ticker, null)))
                {
                    throw new NullResponse(Helpers.add(Helpers.add(this.id, " fetchTickers() could not find a ticker for "), symbol)) ;
                } else
                {
                    return ticker;
                }
            } else
            {
                throw new NotSupported(Helpers.add(this.id, " fetchTicker() is not supported yet")) ;
            }
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTicker(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchTicker() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchTickers() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchTickers() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrder(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOrder() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> fetchOrderWithClientOrderId(Object clientOrderId, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            java.util.Map<String, Object> extendedParams = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }});
            return (this.fetchOrder((Object)(""), (Object)(symbol), (Object)(extendedParams))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderStatus(String id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            // TODO: TypeScript: change method signature by replacing
            // Promise<string> with Promise<Order['status']>.
            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            Object order = (this.fetchOrder((Object)(id), (Object)(symbol), (Object)(parameters))).join();
            return Helpers.GetValue(order, "status");
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchUnifiedOrder(Object order, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.fetchOrder((Object)(this.safeString(order, "id")), (Object)(this.safeString(order, "symbol")), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrder(Object symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " createOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTrailingAmountOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object trailingAmount = Helpers.getArg(optionalArgs, 1, null);
            Object trailingTriggerPrice = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(trailingAmount, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createTrailingAmountOrder() requires a trailingAmount argument")) ;
            }
            Helpers.addElementToObject(parameters, "trailingAmount", trailingAmount);
            if (Helpers.isTrue(!Helpers.isEqual(trailingTriggerPrice, null)))
            {
                Helpers.addElementToObject(parameters, "trailingTriggerPrice", trailingTriggerPrice);
            }
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTrailingAmountOrder"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTrailingAmountOrder"), false))))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createTrailingAmountOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTrailingPercentOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object trailingPercent = Helpers.getArg(optionalArgs, 1, null);
            Object trailingTriggerPrice = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(trailingPercent, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createTrailingPercentOrder() requires a trailingPercent argument")) ;
            }
            Helpers.addElementToObject(parameters, "trailingPercent", trailingPercent);
            if (Helpers.isTrue(!Helpers.isEqual(trailingTriggerPrice, null)))
            {
                Helpers.addElementToObject(parameters, "trailingTriggerPrice", trailingTriggerPrice);
            }
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTrailingPercentOrder"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTrailingPercentOrder"), false))))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createTrailingPercentOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketOrderWithCost(String symbol, Object side, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketOrderWithCost"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketOrderWithCost"), false)))) || Helpers.isTrue((Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketBuyOrderWithCost"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketBuyOrderWithCost"), false)))) && Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketSellOrderWithCost"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketSellOrderWithCost"), false))))))))
            {
                return (this.createOrder((Object)(symbol), (Object)("market"), (Object)(side), (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createMarketOrderWithCost() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketBuyOrderWithCost(String symbol, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createMarketBuyOrderWithCost
            * @description create a market buy order by providing the symbol and cost
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {float} cost how much you want to trade in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(Helpers.GetValue(this.options, "createMarketBuyOrderRequiresPrice"), true))) || Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketBuyOrderWithCost"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketBuyOrderWithCost"), false))))))
            {
                return (this.createOrder((Object)(symbol), (Object)("market"), (Object)("buy"), (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createMarketBuyOrderWithCost() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketSellOrderWithCost(String symbol, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            /**
            * @method
            * @name createMarketSellOrderWithCost
            * @description create a market sell order by providing the symbol and cost
            * @param {string} symbol unified symbol of the market to create an order in
            * @param {float} cost how much you want to trade in units of the quote currency
            * @param {object} [params] extra parameters specific to the exchange API endpoint
            * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
            */
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(Helpers.GetValue(this.options, "createMarketSellOrderRequiresPrice"), true))) || Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketSellOrderWithCost"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createMarketSellOrderWithCost"), false))))))
            {
                return (this.createOrder((Object)(symbol), (Object)("market"), (Object)("sell"), (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createMarketSellOrderWithCost() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTriggerOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object triggerPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(triggerPrice, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createTriggerOrder() requires a triggerPrice argument")) ;
            }
            final Object finalTriggerPrice = triggerPrice;
            parameters = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "triggerPrice", finalTriggerPrice );
            }});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTriggerOrder"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTriggerOrder"), false))))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createTriggerOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopLossOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object stopLossPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(stopLossPrice, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createStopLossOrder() requires a stopLossPrice argument")) ;
            }
            final Object finalStopLossPrice = stopLossPrice;
            parameters = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopLossPrice", finalStopLossPrice );
            }});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createStopLossOrder"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createStopLossOrder"), false))))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createStopLossOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createTakeProfitOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object takeProfitPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isEqual(takeProfitPrice, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " createTakeProfitOrder() requires a takeProfitPrice argument")) ;
            }
            final Object finalTakeProfitPrice = takeProfitPrice;
            parameters = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "takeProfitPrice", finalTakeProfitPrice );
            }});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTakeProfitOrder"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createTakeProfitOrder"), false))))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createTakeProfitOrder() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrderWithTakeProfitAndStopLoss(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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
            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object takeProfit = Helpers.getArg(optionalArgs, 1, null);
            Object stopLoss = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            parameters = this.setTakeProfitAndStopLossParams(symbol, type, side, amount, price, takeProfit, stopLoss, parameters);
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createOrderWithTakeProfitAndStopLoss"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "createOrderWithTakeProfitAndStopLoss"), false))))
            {
                return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
            }
            throw new NotSupported(Helpers.add(this.id, " createOrderWithTakeProfitAndStopLoss() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrders(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " createOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrder(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " cancelOrder() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> cancelOrderWithClientOrderId(Object clientOrderId, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            java.util.Map<String, Object> extendedParams = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "clientOrderId", clientOrderId );
            }});
            return (this.cancelOrder((Object)(""), (Object)(symbol), (Object)(extendedParams))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrders(Object ids, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " cancelOrders() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> cancelOrdersWithClientOrderIds(Object clientOrderIds, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            java.util.Map<String, Object> extendedParams = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "clientOrderIds", clientOrderIds );
            }});
            return (this.cancelOrders((Object)(new java.util.ArrayList<Object>(java.util.Arrays.asList())), (Object)(symbol), (Object)(extendedParams))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelAllOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " cancelAllOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelUnifiedOrder(Object order, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return this.cancelOrder(this.safeString(order, "id"), this.safeString(order, "symbol"), parameters);
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOpenOrders"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOpenOrders"), false)))) && Helpers.isTrue((Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchClosedOrders"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchClosedOrders"), false))))))
            {
                throw new NotSupported(Helpers.add(this.id, " fetchOrders() is not supported yet, consider using fetchOpenOrders() and fetchClosedOrders() instead")) ;
            }
            throw new NotSupported(Helpers.add(this.id, " fetchOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderTrades(String id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchOrderTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOpenOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOrders"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOrders"), false))))
            {
                Object orders = (this.fetchOrders((Object)(symbol), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return this.filterBy(orders, "status", "open");
            }
            throw new NotSupported(Helpers.add(this.id, " fetchOpenOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchClosedOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOrders"), null)) && Helpers.isTrue(!Helpers.isEqual(Helpers.GetValue(this.has, "fetchOrders"), false))))
            {
                Object orders = (this.fetchOrders((Object)(symbol), (Object)(since), (Object)(limit), (Object)(parameters))).join();
                return this.filterBy(orders, "status", "closed");
            }
            throw new NotSupported(Helpers.add(this.id, " fetchClosedOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchCanceledOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchCanceledOrders() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchMyTrades(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " fetchMyTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchMyTrades(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported(Helpers.add(this.id, " watchMyTrades() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitOrder(String symbol, Object side, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder((Object)(symbol), (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketOrder(String symbol, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder((Object)(symbol), (Object)("market"), (Object)(side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitBuyOrder(String symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder((Object)(symbol), (Object)("limit"), (Object)("buy"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createLimitSellOrder(String symbol, Object amount, Object price, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder((Object)(symbol), (Object)("limit"), (Object)("sell"), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketBuyOrder(String symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder((Object)(symbol), (Object)("market"), (Object)("buy"), (Object)(amount), (Object)(null), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createMarketSellOrder(String symbol, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (this.createOrder((Object)(symbol), (Object)("market"), (Object)("sell"), (Object)(amount), (Object)(null), (Object)(parameters))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createPostOnlyOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createPostOnlyOrder"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createPostOnlyOrder"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createPostOnlyOrder() is not supported yet")) ;
            }
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "postOnly", true );
            }});
            return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createReduceOnlyOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createReduceOnlyOrder"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createReduceOnlyOrder"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createReduceOnlyOrder() is not supported yet")) ;
            }
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "reduceOnly", true );
            }});
            return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopOrder(String symbol, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object triggerPrice = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopOrder"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopOrder"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createStopOrder() is not supported yet")) ;
            }
            if (Helpers.isTrue(Helpers.isEqual(triggerPrice, null)))
            {
                throw new ArgumentsRequired(Helpers.add(this.id, " create_stop_order() requires a stopPrice argument")) ;
            }
            final Object finalTriggerPrice = triggerPrice;
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", finalTriggerPrice );
            }});
            return (this.createOrder((Object)(symbol), (Object)(type), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopLimitOrder(String symbol, Object side, Object amount, Object price, Object triggerPrice, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopLimitOrder"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopLimitOrder"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createStopLimitOrder() is not supported yet")) ;
            }
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrder((Object)(symbol), (Object)("limit"), (Object)(side), (Object)(amount), (Object)(price), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createStopMarketOrder(String symbol, Object side, Object amount, Object triggerPrice, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopMarketOrder"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "createStopMarketOrder"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " createStopMarketOrder() is not supported yet")) ;
            }
            java.util.Map<String, Object> query = this.extend(parameters, new java.util.HashMap<String, Object>() {{
                put( "stopPrice", triggerPrice );
            }});
            return (this.createOrder((Object)(symbol), (Object)("market"), (Object)(side), (Object)(amount), (Object)(null), (Object)(query))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchTradingFee(String symbol, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "fetchTradingFees"), null)) || Helpers.isTrue(Helpers.isEqual(Helpers.GetValue(this.has, "fetchTradingFees"), false))))
            {
                throw new NotSupported(Helpers.add(this.id, " fetchTradingFee() is not supported yet")) ;
            }
            Object fees = (this.fetchTradingFees((Object)(parameters))).join();
            return this.safeDict(fees, symbol);
        });

    }
}
