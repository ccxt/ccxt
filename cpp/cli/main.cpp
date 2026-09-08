// ccxt-cli: live exchange calls through the C++ runtime.
//
// usage: ccxt-cli <exchangeId> <method> [arg...] [--verbose]
//   positional args after <method> are passed to the method as strings
//   (symbols, since/limit etc.); numeric args are converted via parseNumber
//   so fetchTicker BTC/USDT and fetchOHLCV BTC/USDT 1h 100 work.
//
// The result is printed as JSON on stdout; errors go to stderr with a
// non-zero exit code. This is the live-test entry point for the port.

#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/base/ExchangeBase.h"

#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

namespace {

std::any numericOrString (const std::string& arg) {
    // ccxt positional args arrive as strings; numbers pass through as numbers
    // so runtime helpers (toLong etc.) see them directly. Strings with a slash
    // or letters stay strings (symbols, "1h" timeframe).
    try {
        if (arg.find_first_of ("/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") == std::string::npos) {
            return std::any (std::stod (arg));
        }
    } catch (...) {
        // fall through to string
    }
    return std::any (arg);
}

} // namespace

int main (int argc, char** argv) {
    if (argc < 3) {
        std::cerr << "usage: ccxt-cli <exchangeId> <method> [arg...] [--verbose]" << std::endl;
        return 2;
    }
    const std::string exchangeId = argv[1];
    const std::string method = argv[2];
    std::vector<std::any> args;
    bool verbose = false;
    for (int i = 3; i < argc; i++) {
        const std::string arg = argv[i];
        if (arg == "--verbose") {
            verbose = true;
        } else {
            args.push_back (numericOrString (arg));
        }
    }
    try {
        ccxt::dict config;
        ccxt::ExchangeBase parser;
        // keys.json can be ./keys.json (repo root) or ../keys.json (cpp/build)
        const char* keyCandidates[] = { "keys.json", "../keys.json", "keys.local.json", "../keys.local.json" };
        for (const char* path : keyCandidates) {
            std::ifstream keysFile (path);
            if (!keysFile.good ()) {
                continue;
            }
            std::stringstream buffer;
            buffer << keysFile.rdbuf ();
            const std::any keys = parser.parseJson (buffer.str ());
            if (ccxt::isDict (keys)) {
                const std::any mine = std::any_cast<ccxt::dict> (keys).get (exchangeId);
                if (ccxt::isDict (mine)) {
                    for (const auto& kv : std::any_cast<ccxt::dict> (mine).entries ()) {
                        config.set (kv.first, kv.second);
                    }
                }
            }
        }
        auto exchange = ccxt::factory::createExchange (exchangeId, config);
        if (verbose) {
            exchange->verbose = std::any (true);
        }
        exchange->loadMarkets ().get ();
        ccxt::list callArgs;
        for (const auto& a : args) {
            callArgs.push (a);
        }
        const std::any result = ccxt::awaitValue (exchange->callDynamically (method, callArgs));
        std::cout << str (exchange->json (result)) << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "[CLI_ERROR] " << e.what () << std::endl;
        return 1;
    }
}
