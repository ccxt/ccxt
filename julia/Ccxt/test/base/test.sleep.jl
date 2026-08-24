using Test
using Ccxt
function testSleep()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    start = milliseconds(exchange);
    sleepAmount = 100;
    Base.fetch(sleep(exchange, sleepAmount));
    end_var = milliseconds(exchange);
    elapsed = end_var - start;
    marginOfError = 20;
    minElapsed = sleepAmount - marginOfError;
    maxElapsed = sleepAmount + marginOfError;
    elapsedBiggerThanSleep = functions.ccxt_ge(elapsed, minElapsed);
    elapsedLessThanMax = functions.ccxt_le(elapsed, maxElapsed);
    @test functions.ccxtruthy(elapsedBiggerThanSleep)
    @test functions.ccxtruthy(elapsedLessThanMax)
    return true
end
