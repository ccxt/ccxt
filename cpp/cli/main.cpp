// ccxt-cli: live exchange calls through the C++ runtime.
//
// usage: ccxt-cli <exchangeId> <method> [arg...] [--verbose] [--timeout N] [--prediction]
//   positional args after <method> are passed to the method as strings
//   (symbols, since/limit etc.); numeric args are converted via parseNumber
//   so fetchTicker BTC/USDT and fetchOHLCV BTC/USDT 1h 100 work.
//   watch*/unWatch* methods run through the pro (WebSocket) tier.
//   --prediction routes through the prediction tier (ccxt::prediction::factory).
//   --timeout N bounds a watch call to N seconds (default: wait forever).
//
// The result is printed as JSON on stdout; errors go to stderr with a
// non-zero exit code. This is the live-test entry point for the port.

#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/pro/ProExchangeFactory.h"
#include "../ccxt/prediction/PredictionFactory.h"
#include "../ccxt/base/ExchangeBase.h"

#include <chrono>
#include <filesystem>
#include <fstream>
#include <future>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

namespace {

ccxt::any numericOrString (const std::string& arg) {
    // ccxt positional args arrive as strings; numbers pass through as numbers
    // so runtime helpers (toLong etc.) see them directly. Strings with a slash
    // or letters stay strings (symbols, "1h" timeframe).
    try {
        if (arg.find_first_of ("/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") == std::string::npos) {
            return ccxt::any (std::stod (arg));
        }
    } catch (...) {
        // fall through to string
    }
    return ccxt::any (arg);
}

} // namespace

int main (int argc, char** argv) {
    if (argc < 3) {
        std::cerr << "usage: ccxt-cli <exchangeId> <method> [arg...] [--verbose] [--timeout N] [--prediction] [--no-markets] [--refresh-markets]" << std::endl;
        return 2;
    }
    const std::string exchangeId = argv[1];
    const std::string method = argv[2];
    std::vector<ccxt::any> args;
    bool verbose = false;
    bool prediction = false;
    bool noMarkets = false;
    bool refreshMarkets = false;
    int timeoutSeconds = 0;
    for (int i = 3; i < argc; i++) {
        const std::string arg = argv[i];
        if (arg == "--verbose") {
            verbose = true;
        } else if (arg == "--prediction") {
            prediction = true;
        } else if (arg == "--no-markets") {
            noMarkets = true;
        } else if (arg == "--refresh-markets") {
            refreshMarkets = true;
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
            const ccxt::any keys = parser.parseJson (buffer.str ());
            if (ccxt::isDict (keys)) {
                const ccxt::any mine = ccxt::any_cast<ccxt::dict> (keys).get (exchangeId);
                if (ccxt::isDict (mine)) {
                    for (const auto& kv : ccxt::any_cast<ccxt::dict> (mine).entries ()) {
                        config.set (kv.first, kv.second);
                    }
                }
            }
        }
        const bool isWsMethod = method.rfind ("watch", 0) == 0 || method.rfind ("unWatch", 0) == 0;
        std::shared_ptr<ccxt::ExchangeBase> exchange = prediction
            ? ccxt::prediction::factory::createPredictionExchange (exchangeId, config)
            : isWsMethod
                ? ccxt::pro::factory::createProExchange (exchangeId, config)
                : ccxt::factory::createExchange (exchangeId, config);
        if (verbose) {
            exchange->verbose = ccxt::any (true);
        }
        // markets: a live fetchMarkets per invocation makes every CLI call pay
        // several API round-trips (binance's market list is heavy). Cache the
        // loaded markets per tier+exchange (30 min TTL, ~/.cache/ccxt-cpp),
        // mirroring the mini-app server's markets cache; --no-markets skips the
        // load entirely (fetchTime-style calls), --refresh-markets forces a
        // live reload + cache rewrite.
        if (!noMarkets) {
            const bool phaseTrace = std::getenv ("CCXT_CLI_PHASES") != nullptr;
            const auto phase = [&] (const char* name) {
                static std::chrono::steady_clock::time_point last = std::chrono::steady_clock::now ();
                if (!phaseTrace) return;
                const auto now = std::chrono::steady_clock::now ();
                std::cerr << "[phase] " << name << ": "
                          << std::chrono::duration_cast<std::chrono::milliseconds> (now - last).count ()
                          << "ms since previous" << std::endl;
                last = now;
            };
            phase ("enter-markets");
            const std::string tier = prediction ? "pred" : (isWsMethod ? "pro" : "rest");
            const char* home = std::getenv ("HOME");
            const std::string cacheDir = (home && *home)
                ? std::string (home) + "/.cache/ccxt-cpp"
                : std::string ("/tmp/ccxt-cpp-cache");
            std::filesystem::create_directories (cacheDir);
            const std::string cachePath = cacheDir + "/" + tier + "-" + exchangeId + "-markets.json";
            bool loadedFromCache = false;
            if (!refreshMarkets) {
                std::ifstream cacheFile (cachePath);
                phase ("cache-open");
                if (cacheFile.good ()) {
                    const auto age = std::filesystem::file_time_type::clock::now ()
                        - std::filesystem::last_write_time (cachePath);
                    if (age < std::chrono::minutes (30)) {
                        std::stringstream cacheBuffer;
                        cacheBuffer << cacheFile.rdbuf ();
                        phase ("cache-read");
                        const ccxt::any cached = parser.parseJson (cacheBuffer.str ());
                        phase ("parseJson");
                        if (ccxt::isDict (cached)) {
                            exchange->setMarkets (cached, ccxt::any {});
                            phase ("setMarkets");
                            loadedFromCache = true;
                        }
                    }
                }
            }
            if (!loadedFromCache) {
                exchange->loadMarkets ().get ();
                phase ("loadMarkets");
                std::ofstream cacheFile (cachePath);
                cacheFile << str (exchange->json (exchange->markets)) << std::endl;
                phase ("cache-write");
            }
            // CCXT_BENCH=1: reproduce the setmarkets-probe flow IN THIS BINARY —
            // fresh file read + parse + repeated setMarkets with per-call timing.
            // Discriminates flow-level vs binary/process-level slowdown.
            if (std::getenv ("CCXT_BENCH") != nullptr) {
                std::ifstream benchFile (cachePath);
                std::stringstream benchBuf;
                benchBuf << benchFile.rdbuf ();
                ccxt::ExchangeBase benchParser;
                auto b0 = std::chrono::steady_clock::now ();
                const ccxt::any benchParsed = benchParser.parseJson (benchBuf.str ());
                auto b1 = std::chrono::steady_clock::now ();
                exchange->setMarkets (benchParsed, ccxt::any {});
                auto b2 = std::chrono::steady_clock::now ();
                std::cerr << "[bench] parseJson: " << std::chrono::duration_cast<std::chrono::milliseconds> (b1 - b0).count ()
                          << "ms, first setMarkets: " << std::chrono::duration_cast<std::chrono::milliseconds> (b2 - b1).count ()
                          << "ms" << std::endl;
                for (int rep = 0; rep < 3; rep++) {
                    auto s0 = std::chrono::steady_clock::now ();
                    exchange->setMarkets (benchParsed, ccxt::any {});
                    auto s1 = std::chrono::steady_clock::now ();
                    std::cerr << "[bench] setMarkets #" << rep + 2 << ": "
                              << std::chrono::duration_cast<std::chrono::milliseconds> (s1 - s0).count () << "ms" << std::endl;
                }
                return 0;
            }
            phase ("markets-done");
        }
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
        const ccxt::any result = ccxt::awaitValue (exchange->callDynamically (method, callArgs));
        std::cout << str (exchange->json (result)) << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "[CLI_ERROR] " << e.what () << std::endl;
        return 1;
    }
}
