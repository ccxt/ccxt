// ccxt-cli: live exchange calls through the C++ runtime.
//
// usage: ccxt-cli <exchangeId> <method> [arg...] [--verbose] [--timeout N]
//   positional args after <method> are passed to the method as strings
//   (symbols, since/limit etc.); numeric args are converted via parseNumber
//   so fetchTicker BTC/USDT and fetchOHLCV BTC/USDT 1h 100 work.
//   watch*/unWatch* methods run through the pro (WebSocket) tier.
//   --timeout N bounds a watch call to N seconds (default: wait forever).
//
// The result is printed as JSON on stdout; errors go to stderr with a
// non-zero exit code. This is the live-test entry point for the port.

#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/pro/ProExchangeFactory.h"
#include "../ccxt/base/ExchangeBase.h"

#include <chrono>
#include <fstream>
#include <future>
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
        std::cerr << "usage: ccxt-cli <exchangeId> <method> [arg...] [--verbose] [--timeout N]" << std::endl;
        return 2;
    }
    const std::string exchangeId = argv[1];
    const std::string method = argv[2];
    std::vector<std::any> args;
    bool verbose = false;
    int timeoutSeconds = 0;
    for (int i = 3; i < argc; i++) {
        const std::string arg = argv[i];
        if (arg == "--verbose") {
            verbose = true;
        } else if (arg == "--timeout") {
            if (i + 1 < argc) {
                timeoutSeconds = std::atoi (argv[++i]);
            }
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
        const bool isWsMethod = method.rfind ("watch", 0) == 0 || method.rfind ("unWatch", 0) == 0;
        std::shared_ptr<ccxt::ExchangeBase> exchange = isWsMethod
            ? ccxt::pro::factory::createProExchange (exchangeId, config)
            : ccxt::factory::createExchange (exchangeId, config);
        if (verbose) {
            exchange->verbose = std::any (true);
        }
        exchange->loadMarkets ().get ();
        ccxt::list callArgs;
        for (const auto& a : args) {
            callArgs.push (a);
        }
        if (timeoutSeconds > 0) {
            // a watch call blocks until the first message; bound it so a dead
            // subscription fails the CLI instead of hanging it
            auto work = std::async (std::launch::async, [&] () {
                return ccxt::awaitValue (exchange->callDynamically (method, callArgs));
            });
            if (work.wait_for (std::chrono::seconds (timeoutSeconds)) != std::future_status::ready) {
                std::cerr << "[CLI_ERROR] " << method << " timed out after " << timeoutSeconds << "s" << std::endl;
                // hard exit: a std::async future's destructor JOINS its still-running
                // task (a dial or a watch wait), which would hang the CLI on exit
                std::_Exit (1);
            }
            std::cout << str (exchange->json (work.get ())) << std::endl;
            return 0;
        }
        const std::any result = ccxt::awaitValue (exchange->callDynamically (method, callArgs));
        std::cout << str (exchange->json (result)) << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "[CLI_ERROR] " << e.what () << std::endl;
        return 1;
    }
}
