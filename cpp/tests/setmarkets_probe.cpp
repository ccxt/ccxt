// setMarkets probe: factory-built binance, markets JSON from the CLI cache,
// setMarkets repeated N times with per-phase timing. Build via CMake target
// (WHOLE_ARCHIVE) per the ccxt-cpp-port skill's probe pattern.
#include "ccxt/exchanges/ExchangeFactory.h"
#include "ccxt/base/ExchangeBase.h"

#include <chrono>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>

int main (int argc, char** argv) {
    const char* path = argc > 1 ? argv[1] : nullptr;
    if (!path) {
        const char* home = std::getenv ("HOME");
        static std::string def = std::string (home ? home : "/tmp")
            + "/.cache/ccxt-cpp/rest-binance-markets.json";
        path = def.c_str ();
    }
    std::ifstream f (path);
    if (!f.good ()) { std::cerr << "no cache file at " << path << std::endl; return 2; }
    std::stringstream buf;
    buf << f.rdbuf ();

    const auto exchange = ccxt::factory::createExchange ("binance", ccxt::dict {});
    ccxt::ExchangeBase parser;
    auto t0 = std::chrono::steady_clock::now ();
    const std::any parsed = parser.parseJson (buf.str ());
    auto t1 = std::chrono::steady_clock::now ();
    exchange->setMarkets (parsed, std::any {});
    auto t2 = std::chrono::steady_clock::now ();
    // warm-up done; now the timed repetitions
    for (int i = 0; i < 3; i++) {
        auto s0 = std::chrono::steady_clock::now ();
        exchange->setMarkets (parsed, std::any {});
        auto s1 = std::chrono::steady_clock::now ();
        std::cerr << "setMarkets #" << i + 1 << ": "
                  << std::chrono::duration_cast<std::chrono::milliseconds> (s1 - s0).count () << "ms" << std::endl;
    }
    std::cerr << "parseJson: " << std::chrono::duration_cast<std::chrono::milliseconds> (t1 - t0).count ()
              << "ms, first setMarkets: " << std::chrono::duration_cast<std::chrono::milliseconds> (t2 - t1).count ()
              << "ms" << std::endl;
    return 0;
}
