# CCXT C++ examples — the C++ counterparts of examples/rust (same ideas,
# same output shape, C++ typed API). Each .cpp is one runnable example.
#
#   cmake -S examples/cpp -B examples/cpp/build -G Ninja -DCMAKE_BUILD_TYPE=Debug
#   cmake --build examples/cpp/build --parallel 8
#   ./examples/cpp/build/binance_basics
#
# The examples build the in-tree packages as a subproject, so the first build
# compiles the engine + the exchange TUs (~10-40 min cold, much faster warm
# with ccache). Library-only + scoped consumers should use cpp/package.sh or
# -DCCXT_EXCHANGES=... directly instead.
cmake_minimum_required (VERSION 3.20)
project (ccxt-examples CXX)

# examples don't need the test binaries or the live-test CLI
set (CCXT_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set (CCXT_BUILD_CLI OFF CACHE BOOL "" FORCE)

add_subdirectory (${CMAKE_CURRENT_SOURCE_DIR}/../../cpp ccxt-cpp)

set (EXAMPLES
    binance_basics
    binance_active_swap_prices
    binance_with_proxy
    binance_order_error_handling
    multi_exchange_ohlcv_chart
    exchanges_smoke
    iexchange_demo
    watch_trades
    prediction_typed_demo)

foreach (ex IN LISTS EXAMPLES)
    add_executable (${ex} ${ex}.cpp)
    # examples are throwaway binaries: fast compile, no debug info
    target_compile_options (${ex} PRIVATE -g0 -O0)
    target_link_libraries (${ex} PRIVATE ccxt ccxt_pro ccxt_prediction)
endforeach ()
