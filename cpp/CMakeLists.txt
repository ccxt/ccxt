cmake_minimum_required (VERSION 3.16)
project (ccxt-cpp CXX)

# C++17, not 20: every transpiled async body is a `[=]` lambda, and an implicit `this`
# capture through `[=]` is deprecated in C++20 -- it would warn on every async method.
set (CMAKE_CXX_STANDARD 17)
set (CMAKE_CXX_STANDARD_REQUIRED ON)
set (CMAKE_CXX_EXTENSIONS OFF)

if (NOT CMAKE_BUILD_TYPE)
    set (CMAKE_BUILD_TYPE Debug)
endif ()

# The generated exchange headers are single translation units of several thousand lines
# of std::any expressions. -O0 keeps them compiling in seconds rather than minutes; the
# base-test binary is a correctness gate, not a benchmark.
set (CMAKE_CXX_FLAGS_DEBUG "-O0 -g")

find_package (Threads REQUIRED)

# libcurl is located and linked but not yet called: fetch() throws NotSupported this
# iteration. Resolving it here proves the dependency is satisfiable before the HTTP
# layer lands, rather than discovering it later.
find_package (CURL REQUIRED)
find_package (OpenSSL REQUIRED)

add_library (ccxt STATIC
    ccxt/base/helpers.cpp
    ccxt/base/ExchangeBase.cpp
    ccxt/base/Crypto.cpp
    ccxt/base/Number.cpp
)
target_include_directories (ccxt PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries (ccxt PUBLIC Threads::Threads CURL::libcurl OpenSSL::Crypto)

# The value model underpins everything else (ordered dicts, reference semantics), so it
# is its own binary and runs first.
add_executable (ccxt-value-tests tests/test_value_model.cpp)
target_link_libraries (ccxt-value-tests PRIVATE ccxt)

add_executable (ccxt-tests tests/main.cpp)
target_link_libraries (ccxt-tests PRIVATE ccxt)

# The generated binance is an 18k-line single translation unit on top of a 4k-line
# implicit-API header, so it gets its own target: it is by far the slowest thing to
# compile and keeping it separate means a base-test edit does not pay for it.
add_executable (ccxt-smoke-binance tests/smoke_binance.cpp)
target_link_libraries (ccxt-smoke-binance PRIVATE ccxt)

add_executable (ccxt-static-binance tests/static_binance.cpp)
target_link_libraries (ccxt-static-binance PRIVATE ccxt)

enable_testing ()
add_test (NAME value-model COMMAND ccxt-value-tests)
add_test (NAME base-tests COMMAND ccxt-tests --baseTests)
add_test (NAME smoke-binance COMMAND ccxt-smoke-binance)
add_test (NAME static-request-binance COMMAND ccxt-static-binance --requestTests)
