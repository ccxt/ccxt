using Test
using Ccxt
function watchTickerLoop(exchange)

    method = "watchTicker";
    while functions.ccxtruthy(true)
        println("creating future");
        ticker = Base.fetch(watchTicker(exchange, "BTC/USDT"));
        println("ticker recieved, future resolved");
    end
end


function watchOrderBookForSymbolsLoop(exchange)

    method = "watchTicker";
    while functions.ccxtruthy(true)
        trades = Base.fetch(watchTradesForSymbols(exchange, ["BTC/USDT", "ETH/USDT", "LTC/USDT"]));
    end
end


function closeAfter(exchange, ms)

    Base.fetch(sleep(ms));
    Base.fetch(close(exchange));
end


function testWsClose()

    exchange = get(get(ccxt, Symbol("pro"), nothing), Symbol("binance"), nothing)();
    println("Testing exchange.close(): No future awaiting, should close with no errors");
    Base.fetch(watchTicker(exchange, "BTC/USDT"));
    println("ticker received");
    Base.fetch(close(exchange));
    println("PASSED - exchange closed with no errors");
    println("Testing exchange.close(): call watch_multiple, resolve, should close with no errors");
    Base.fetch(watchTradesForSymbols(exchange, ["BTC/USDT", "ETH/USDT"]));
    println("ticker received");
    Base.fetch(close(exchange));
    println("PASSED - exchange closed with no errors");
    println("Testing exchange.close(): Awaiting future should throw ClosedByUser");
    try
        closeAfter(exchange, 5000);
        Base.fetch(watchTickerLoop(exchange));
    catch e
        if functions.ccxtruthy(isa(e, ExchangeClosedByUser))
            println("PASSED - future rejected with ClosedByUser");
        else
            throw(e);
        end

    end
    println("Test exchange.close(): Call watch_multiple unhandled futures are canceled");
    try
        closeAfter(exchange, 5000);
        Base.fetch(watchOrderBookForSymbolsLoop(exchange));
    catch e
        if functions.ccxtruthy(isa(e, ExchangeClosedByUser))
            println("PASSED - future rejected with ClosedByUser");
        else
            throw(e);
        end

    end
    exit(0);
end
