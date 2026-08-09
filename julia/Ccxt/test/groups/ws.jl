# Group: ws — Pro (WebSocket) base tests: caches, order book and futures.
#
# This mirrors what the Python WS base suite actually executes in
# `python/ccxt/pro/test/base/tests_init.py`:
#
#     test_ws_order_book()          -> testWsOrderBook()
#     test_ws_cache()               -> testWsCache()
#     # todo : run(test_ws_close()) -> excluded here too (see below)
#     await test_ws_future()        -> testWsFuture()
#     # run(test_abnormal_close())  -> excluded here too (see below)
#
# Two upstream tests are deliberately absent, matching the Python suite rather
# than diverging from it:
#
#   * `test.close` — a live-network test that opens a real WebSocket to binance
#     and ends with `process.exit(0)`. Python keeps its import commented out
#     (`# todo : from ...test_close import test_ws_close`), so it never runs
#     there either, and it has no place in an offline suite.
#   * `test_abnormal_close` — commented out upstream with the note that it
#     "stays in infinite loop in travis". It has no TS counterpart to transpile
#     from and would hang the run.
include("../pro/base/test.cache.jl")
include("../pro/base/test.orderBook.jl")
include("../pro/base/test.future.jl")

@testset "ws" begin
    testWsCache()
    testWsOrderBook()
    testWsFuture()
end
