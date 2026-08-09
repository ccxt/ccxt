using Test
using Ccxt
function equals(a, b)

    if functions.ccxtruthy(length(a) != length(b))
            return false
    end
    for prop in functions.ccxt_forin(a)
        if functions.ccxtruthy(prop == "cache")
            continue;
        end
        if functions.ccxtruthy(functions.ccxt_isArray(get(a, Symbol(prop), nothing)))
            if functions.ccxtruthy(!functions.ccxtruthy(equals(get(a, Symbol(prop), nothing), get(b, Symbol(prop), nothing))))
                    return false
            end
        elseif functions.ccxtruthy(get(a, Symbol(prop), nothing) != get(b, Symbol(prop), nothing))
            return false
        end
    end
    return true
end


function testWsOrderBook()

    orderBookInput = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10], [9.1, 11], [8.2, 12], [7.3, 13], [6.4, 14], [4.5, 13], [4.5, 0]],
        Symbol("asks") => [[16.6, 10], [15.5, 11], [14.4, 12], [13.3, 13], [12.2, 14], [11.1, 13]],
        Symbol("timestamp") => 1574827239000,
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    orderBookTarget = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10], [9.1, 11], [8.2, 12], [7.3, 13], [6.4, 14]],
        Symbol("asks") => [[11.1, 13], [12.2, 14], [13.3, 13], [14.4, 12], [15.5, 11], [16.6, 10]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    storeBid = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10], [9.1, 11], [8.2, 12], [7.3, 13], [6.4, 14], [3, 4]],
        Symbol("asks") => [[11.1, 13], [12.2, 14], [13.3, 13], [14.4, 12], [15.5, 11], [16.6, 10]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    limitedOrderBookTarget = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10], [9.1, 11], [8.2, 12], [7.3, 13], [6.4, 14]],
        Symbol("asks") => [[11.1, 13], [12.2, 14], [13.3, 13], [14.4, 12], [15.5, 11]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    limitedDeletedOrderBookTarget = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10], [9.1, 11], [8.2, 12], [7.3, 13], [6.4, 14]],
        Symbol("asks") => [[11.1, 13], [12.2, 14], [13.3, 13], [14.4, 12]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    indexedOrderBookInput = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10, "1234"], [9.1, 11, "1235"], [8.2, 12, "1236"], [7.3, 13, "1237"], [6.4, 14, "1238"], [4.5, 13, "1239"]],
        Symbol("asks") => [[16.6, 10, "1240"], [15.5, 11, "1241"], [14.4, 12, "1242"], [13.3, 13, "1243"], [12.2, 14, "1244"], [11.1, 13, "1244"]],
        Symbol("timestamp") => 1574827239000,
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    indexedOrderBookTarget = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10, "1234"], [9.1, 11, "1235"], [8.2, 12, "1236"], [7.3, 13, "1237"], [6.4, 14, "1238"], [4.5, 13, "1239"]],
        Symbol("asks") => [[11.1, 13, "1244"], [13.3, 13, "1243"], [14.4, 12, "1242"], [15.5, 11, "1241"], [16.6, 10, "1240"]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    limitedIndexedOrderBookTarget = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10, "1234"], [9.1, 11, "1235"], [8.2, 12, "1236"], [7.3, 13, "1237"], [6.4, 14, "1238"]],
        Symbol("asks") => [[11.1, 13, "1244"], [13.3, 13, "1243"], [14.4, 12, "1242"], [15.5, 11, "1241"], [16.6, 10, "1240"]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    overwrite1234 = Dict{Symbol, Any}(
        Symbol("bids") => [[9.1, 11, "1235"], [9, 3, "1231"], [9, 1, "1232"], [8.2, 12, "1236"], [7.3, 13, "1237"], [6.4, 14, "1238"], [4.5, 13, "1239"], [4, 2, "12399"]],
        Symbol("asks") => [[11.1, 13, "1244"], [13.3, 13, "1243"], [14.4, 12, "1242"], [15.5, 11, "1241"], [16.6, 10, "1240"]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    overwrite1244 = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10, "1234"], [9.1, 11, "1235"], [8.2, 12, "1236"], [7.3, 13, "1237"], [6.4, 14, "1238"], [4.5, 13, "1239"]],
        Symbol("asks") => [[13.3, 13, "1243"], [13.5, 13, "1244"], [14.4, 12, "1242"], [15.5, 11, "1241"], [16.6, 10, "1240"]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    countedOrderBookInput = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10, 1], [9.1, 11, 1], [8.2, 12, 1], [7.3, 13, 1], [7.3, 0, 1], [6.4, 14, 5], [4.5, 13, 5], [4.5, 13, 1], [4.5, 13, 0]],
        Symbol("asks") => [[16.6, 10, 1], [15.5, 11, 1], [14.4, 12, 1], [13.3, 13, 3], [12.2, 14, 3], [11.1, 13, 3], [11.1, 13, 12]],
        Symbol("timestamp") => 1574827239000,
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    countedOrderBookTarget = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10, 1], [9.1, 11, 1], [8.2, 12, 1], [6.4, 14, 5]],
        Symbol("asks") => [[11.1, 13, 12], [12.2, 14, 3], [13.3, 13, 3], [14.4, 12, 1], [15.5, 11, 1], [16.6, 10, 1]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    storedCountedOrderbookTarget = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10, 1], [9.1, 11, 1], [8.2, 12, 1], [6.4, 14, 5], [1, 1, 6]],
        Symbol("asks") => [[11.1, 13, 12], [12.2, 14, 3], [13.3, 13, 3], [14.4, 12, 1], [15.5, 11, 1], [16.6, 10, 1]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    limitedCountedOrderBookTarget = Dict{Symbol, Any}(
        Symbol("bids") => [[10, 10, 1], [9.1, 11, 1], [8.2, 12, 1], [6.4, 14, 5]],
        Symbol("asks") => [[11.1, 13, 12], [12.2, 14, 3], [13.3, 13, 3], [14.4, 12, 1], [15.5, 11, 1]],
        Symbol("timestamp") => 1574827239000,
        Symbol("datetime") => "2019-11-27T04:00:39.000Z",
        Symbol("nonce") => 69,
        Symbol("symbol") => nothing
    );
    orderBook = OrderBook(orderBookInput);
    limited = OrderBook(orderBookInput, 5);
    limit(orderBook);
    @test functions.ccxtruthy(equals(orderBook, orderBookTarget));
    limit(limited);
    @test functions.ccxtruthy(equals(limited, limitedOrderBookTarget));
    limit(orderBook);
    @test functions.ccxtruthy(equals(orderBook, orderBookTarget));
    bids = get(orderBook, Symbol("bids"), nothing);
    store(bids, 1000, 0);
    limit(orderBook);
    @test functions.ccxtruthy(equals(orderBook, orderBookTarget));
    store(bids, 3, 4);
    limit(orderBook);
    @test functions.ccxtruthy(equals(orderBook, storeBid));
    store(bids, 3, 0);
    limit(orderBook);
    @test functions.ccxtruthy(equals(orderBook, orderBookTarget));
    asks = get(limited, Symbol("asks"), nothing);
    store(asks, 15.5, 0);
    limit(limited);
    @test functions.ccxtruthy(equals(limited, limitedDeletedOrderBookTarget));
    indexedOrderBook = IndexedOrderBook(indexedOrderBookInput);
    limitedIndexedOrderBook = IndexedOrderBook(indexedOrderBookInput, 5);
    limit(indexedOrderBook);
    @test functions.ccxtruthy(equals(indexedOrderBook, indexedOrderBookTarget));
    limit(limitedIndexedOrderBook);
    @test functions.ccxtruthy(equals(limitedIndexedOrderBook, limitedIndexedOrderBookTarget));
    limit(indexedOrderBook);
    @test functions.ccxtruthy(equals(indexedOrderBook, indexedOrderBookTarget));
    indexedBids = get(indexedOrderBook, Symbol("bids"), nothing);
    storeArray(indexedBids, [1000, 0, "12345"]);
    @test functions.ccxtruthy(equals(indexedOrderBook, indexedOrderBookTarget));
    storeArray(indexedBids, [10, 0, "1234"]);
    storeArray(indexedBids, [10, 2, "1231"]);
    storeArray(indexedBids, [10, 1, "1232"]);
    storeArray(indexedBids, [4, 2, "12399"]);
    storeArray(indexedBids, [9, 2, "1231"]);
    storeArray(indexedBids, [9, 3, "1231"]);
    storeArray(indexedBids, [9, 1, "1232"]);
    limit(indexedOrderBook);
    @test functions.ccxtruthy(equals(indexedOrderBook, overwrite1234));
    indexedOrderBook = IndexedOrderBook(indexedOrderBookInput);
    indexedAsks = get(indexedOrderBook, Symbol("asks"), nothing);
    storeArray(indexedAsks, [13.5, 13, "1244"]);
    limit(indexedOrderBook);
    @test functions.ccxtruthy(equals(indexedOrderBook, overwrite1244));
    countedOrderBook = CountedOrderBook(countedOrderBookInput);
    limitedCountedOrderBook = CountedOrderBook(countedOrderBookInput, 5);
    limit(countedOrderBook);
    @test functions.ccxtruthy(equals(countedOrderBook, countedOrderBookTarget));
    limit(limitedCountedOrderBook);
    @test functions.ccxtruthy(equals(limitedCountedOrderBook, limitedCountedOrderBookTarget));
    limit(countedOrderBook);
    @test functions.ccxtruthy(equals(countedOrderBook, countedOrderBookTarget));
    countedBids = get(countedOrderBook, Symbol("bids"), nothing);
    storeArray(countedBids, [5, 0, 6]);
    limit(countedOrderBook);
    @test functions.ccxtruthy(equals(countedOrderBook, countedOrderBookTarget));
    storeArray(countedBids, [1, 1, 6]);
    limit(countedOrderBook);
    @test functions.ccxtruthy(equals(countedOrderBook, storedCountedOrderbookTarget));
    resetBook = OrderBook(storeBid);
    limit(resetBook);
    reset(resetBook, orderBookInput);
    limit(resetBook);
    @test functions.ccxtruthy(equals(resetBook, orderBookTarget));
end
