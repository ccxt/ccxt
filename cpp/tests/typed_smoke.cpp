// Typed-layer gate: the user-facing typed API (Types.h structs + Exchange.TypedApi.inc
// PascalCase methods) over the dynamic ccxt::any core.
//
// Offline by default: struct conversion from canned unified structures and typed calls
// through an offline binance (parseTicker path). `--live` adds real public HTTP calls
// (FetchTicker/FetchOHLCV/FetchOrderBook on binance) and is meant for manual/CI live
// verification.

#include "../ccxt/exchanges/binance.h"
#include "../ccxt/pro/bitvavo.h"
#include "../ccxt/base/ws/Client.h"
#include "TestUtils.h"

#include <atomic>
#include <chrono>
#include <iostream>
#include <string>
#include <thread>

namespace {

int failures = 0;

void check (bool condition, const std::string& what) {
    if (condition) {
        std::cout << "[PASS] " << what << std::endl;
    } else {
        std::cout << "[TEST_FAILURE] " << what << std::endl;
        failures++;
    }
}

std::string d2s (double v) {
    return std::to_string (v);
}

} // namespace

int main (int argc, char** argv) {
    const bool live = (argc > 1) && (std::string (argv[1]) == "--live");
    try {
        // -- struct conversion from canned unified structures --------------------------
        const ccxt::any rawTicker = ccxt::dict {
            { std::string ("symbol"),     std::string ("BTC/USDT") },
            { std::string ("timestamp"),  1700003600000LL },
            { std::string ("datetime"),   std::string ("2023-11-14T22:33:20.000Z") },
            { std::string ("high"),       20500.0 },
            { std::string ("low"),        19800.0 },
            { std::string ("bid"),        19999.0 },
            { std::string ("ask"),        20001.0 },
            { std::string ("last"),       20000.0 },
            { std::string ("baseVolume"), 1000.0 },
            { std::string ("info"),       ccxt::dict { { std::string ("raw"), std::string ("yes") } } },
        };
        const ccxt::Ticker ticker (rawTicker);
        check (ticker.symbol.has_value () && *ticker.symbol == "BTC/USDT", "Ticker.symbol");
        check (ticker.timestamp.has_value () && *ticker.timestamp == 1700003600000LL, "Ticker.timestamp is int64");
        check (ticker.high.has_value () && *ticker.high == 20500.0, "Ticker.high");
        check (ticker.bid.has_value () && *ticker.bid == 19999.0, "Ticker.bid");
        check (!ticker.vwap.has_value (), "Ticker.vwap absent -> nullopt");
        check (ccxt::isDict (ticker.info), "Ticker.info preserved");

        // string-typed numerics coerce like the C# SafeFloat path
        const ccxt::any rawTrade = ccxt::dict {
            { std::string ("id"),        std::string ("12345") },
            { std::string ("price"),     std::string ("20000.5") },
            { std::string ("amount"),    0.25 },
            { std::string ("side"),      std::string ("buy") },
            { std::string ("fee"),       ccxt::dict {
                { std::string ("cost"),     0.01 },
                { std::string ("currency"), std::string ("USDT") },
            } },
        };
        const ccxt::Trade trade (rawTrade);
        check (trade.id.has_value () && *trade.id == "12345", "Trade.id");
        check (trade.price.has_value () && *trade.price == 20000.5, "Trade.price from string");
        check (trade.amount.has_value () && *trade.amount == 0.25, "Trade.amount");
        check (trade.fee.has_value () && trade.fee->cost.has_value () && *trade.fee->cost == 0.01, "Trade.fee.cost");
        check (trade.fee->currency.has_value () && *trade.fee->currency == "USDT", "Trade.fee.currency");

        // OHLCV rides as a list, not a dict
        const ccxt::any rawCandle = ccxt::list {
            1700000000000LL, 100.0, 110.0, 90.0, 105.0, 42.0,
        };
        const ccxt::OHLCV candle (rawCandle);
        check (candle.timestamp.has_value () && *candle.timestamp == 1700000000000LL, "OHLCV.timestamp");
        check (candle.open.has_value () && *candle.open == 100.0, "OHLCV.open");
        check (candle.volume.has_value () && *candle.volume == 42.0, "OHLCV.volume");

        // order book: [price, amount] rows to vector<vector<double>>
        const ccxt::any rawBook = ccxt::dict {
            { std::string ("symbol"), std::string ("BTC/USDT") },
            { std::string ("bids"), ccxt::list {
                ccxt::list { 19999.0, 1.5 },
                ccxt::list { 19998.0, 2.0 },
            } },
            { std::string ("asks"), ccxt::list {
                ccxt::list { 20001.0, 1.0 },
            } },
            { std::string ("nonce"), 7LL },
        };
        const ccxt::OrderBook book (rawBook);
        check (book.bids.size () == 2 && book.bids[0].size () == 2 && book.bids[0][0] == 19999.0, "OrderBook.bids[0][0]");
        check (book.asks.size () == 1 && book.asks[0][1] == 1.0, "OrderBook.asks[0][1]");
        check (book.nonce.has_value () && *book.nonce == 7, "OrderBook.nonce");

        // balances: per-code map + free/used/total
        const ccxt::any rawBalances = ccxt::dict {
            { std::string ("info"), ccxt::dict {} },
            { std::string ("timestamp"), 1700000000000LL },
            { std::string ("BTC"), ccxt::dict {
                { std::string ("free"), 1.0 },
                { std::string ("used"), 0.5 },
                { std::string ("total"), 1.5 },
            } },
            { std::string ("free"),  ccxt::dict { { std::string ("BTC"), 1.0 } } },
            { std::string ("used"),  ccxt::dict { { std::string ("BTC"), 0.5 } } },
            { std::string ("total"), ccxt::dict { { std::string ("BTC"), 1.5 } } },
        };
        const ccxt::Balances balances (rawBalances);
        check (balances.balances.count ("BTC") == 1, "Balances has BTC account");
        check (balances.balances.at ("BTC").free.has_value () && *balances.balances.at ("BTC").free == 1.0, "Balances.BTC.free");
        check (balances.free.count ("BTC") == 1 && balances.free.at ("BTC") == 1.0, "Balances.free map");
        check (balances.timestamp.has_value (), "Balances.timestamp");

        // tickers dictionary wrapper
        const ccxt::any rawTickers = ccxt::dict {
            { std::string ("BTC/USDT"), rawTicker },
            { std::string ("info"), ccxt::dict {} },
        };
        const ccxt::Tickers tickers (rawTickers);
        check (tickers.tickers.size () == 1, "Tickers skips info key");
        check (tickers["BTC/USDT"].last.has_value () && *tickers["BTC/USDT"].last == 20000.0, "Tickers indexer");

        // -- typed methods through an offline exchange ---------------------------------
        auto exchangePtr = ccxt::newExchange<ccxt::binance> ();
        ccxt::binance& exchange = *exchangePtr;

        const ccxt::any rawExchangeTicker = ccxt::dict {
            { std::string ("symbol"),    std::string ("BTCUSDT") },
            { std::string ("lastPrice"), std::string ("20000.0") },
            { std::string ("highPrice"), std::string ("20500.0") },
            { std::string ("lowPrice"),  std::string ("19800.0") },
            { std::string ("closeTime"), 1700003600000LL },
        };
        const ccxt::Ticker parsed (exchange.parseTicker (rawExchangeTicker, ccxt::any {}));
        check (parsed.last.has_value () && *parsed.last == 20000.0, "parseTicker -> Ticker.last");
        check (parsed.high.has_value () && *parsed.high == 20500.0, "parseTicker -> Ticker.high");
        check (parsed.timestamp.has_value () && *parsed.timestamp == 1700003600000LL, "parseTicker -> Ticker.timestamp");

        // -- typed ws facade through the static ws mock transport -----------------------
        // the typed watch surface dispatches virtually: ccxt::Exchange's base stubs
        // throw NotSupported on a REST instance, a pro instance resolves to its real
        // override. Drive the bitvavo watchTicker fixture through the TYPED facade
        // with the same mock-transport protocol the static ws harness uses.
        {
            using namespace std::chrono_literals;
            auto proPtr = ccxt::newExchange<ccxt::pro::bitvavo> ();
            auto& pro = *proPtr;
            // offline markets: bitvavo's watch chain loads markets before subscribing
            const ccxt::any markets = pro.parseJson (ccxt::testutils::readFile (
                ccxt::testutils::rootDir () + "ts/src/test/static/markets/bitvavo.json"));
            pro.setMarkets (markets);
            const std::string url = "wss://ws.bitvavo.com/v2";
            ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (pro.client (url));
            client.mockConnect ();
            // fixture frames + the expected first resolution
            const ccxt::any fixture = pro.parseJson (ccxt::testutils::readFile (
                ccxt::testutils::rootDir () + "ts/src/test/static/ws/bitvavo.json"));
            const ccxt::any entry = ::getValue (
                ::getValue (::getValue (fixture, std::string ("methods")), std::string ("watchTicker")), 0);
            const ccxt::list frames = ccxt::any_cast<ccxt::list> (::getValue (entry, std::string ("messages")));
            const ccxt::any expected = ccxt::any_cast<ccxt::list> (::getValue (entry, std::string ("parsedResponses"))).get (0);
            const double expLast = std::stod (::str (::getValue (expected, std::string ("last"))));
            const std::string expSymbol = ::str (::getValue (expected, std::string ("symbol")));

            std::atomic<bool> watchDone { false };
            std::string injectorError;
            std::string injectorLog;
            std::thread injector ([&] () {
                try {
                    for (long i = 0; i < frames.size () && !watchDone.load (); i++) {
                        // injector protocol (tests.ts): wait for the watch side to
                        // register its future, inject one json-parsed frame, then
                        // wait for the resolution to settle
                        int waited = 0;
                        while (!client.hasPendingFutures () && !watchDone.load () && waited < 5000) {
                            std::this_thread::sleep_for (50ms);
                            waited += 50;
                        }
                        if (watchDone.load ()) {
                            break;
                        }
                        const bool pendingBefore = client.hasPendingFutures ();
                        // fixture messages arrive ALREADY json-parsed (dicts) --
                        // re-parsing them yields garbage and the router sees no event
                        const ccxt::any frame = ::getValue (frames, i);
                        const std::string ev = ::str (::getValue (frame, std::string ("event")));
                        pro.handleMessage (ccxt::any (client), frame);
                        int settled = 0;
                        while (client.hasPendingFutures () && settled < 500) {
                            std::this_thread::sleep_for (20ms);
                            settled += 20;
                        }
                        injectorLog += "frame " + std::to_string (i)
                            + " ev=" + ev
                            + " pendingBefore=" + (pendingBefore ? "1" : "0")
                            + " pendingAfter=" + (client.hasPendingFutures () ? "1" : "0")
                            + " waited=" + std::to_string (waited) + "ms keys=[";
                        {
                            const ccxt::any fut = ::getValue (ccxt::any (client), std::string ("futures"));
                            if (ccxt::isDict (fut)) {
                                for (const auto& kv : ccxt::any_cast<ccxt::dict> (fut).entries ()) {
                                    injectorLog += kv.first + " ";
                                }
                            }
                        }
                        injectorLog += "] ; ";
                    }
                    // rejection backstop: a stuck watch must fail the gate, not hang it
                    for (int w = 0; w < 600 && !watchDone.load (); w++) {
                        client.reject (ccxt::any (std::string ("ExchangeError")), "");
                        std::this_thread::sleep_for (50ms);
                    }
                } catch (const std::exception& e) {
                    injectorError = e.what ();
                }
            });
            // the injector thread must be stopped and joined on EVERY exit path,
            // including exceptions thrown out of the typed watch call (a joinable
            // thread destroyed during unwind terminates the process)
            struct WsJoin {
                std::atomic<bool>& done;
                std::thread& thread;
                ~WsJoin () {
                    done.store (true);
                    if (thread.joinable ()) {
                        thread.join ();
                    }
                }
            } joinGuard { watchDone, injector };
            try {
                // run the typed watch on a worker so MAIN can bound it: if the
                // future never registers (a registration bug is exactly what the
                // rejection backstop cannot catch), main would otherwise block
                // forever with nothing left to unblock it
                // NOTE: the lambda returns ccxt::any on purpose -- a
                // std::future<ccxt::Ticker> fails to compile because the
                // namespace-scope ccxt::operator!(const ccxt::any&) poisons
                // ADL for std::future's is_array/is_function static_asserts
                auto watchTask = std::async (std::launch::async, [&] () -> ccxt::any {
                    return pro.WatchTicker ("BTC/EUR");
                });
                if (watchTask.wait_for (45s) != std::future_status::ready) {
                    check (false, "typed WatchTicker timed out (watch future never registered)");
                    // hard exit: the async worker is still blocked and its future's
                    // destructor would join it, hanging the gate on the way out
                    std::_Exit (1);
                }
                const ccxt::any rawTicker = watchTask.get ();
                const ccxt::Ticker wsTicker = ccxt::any_cast<ccxt::Ticker> (rawTicker);
                watchDone.store (true);
                injector.join ();
                check (injectorError.empty (), "ws injector ran clean (" + injectorError + ")");
                check (wsTicker.symbol.has_value () && *wsTicker.symbol == expSymbol,
                       "typed WatchTicker symbol == " + expSymbol
                           + " | raw: " + ::str (pro.json (rawTicker))
                           + " | " + injectorLog);
                check (wsTicker.last.has_value () && *wsTicker.last == expLast,
                       "typed WatchTicker last == " + d2s (expLast));
            } catch (const std::exception& e) {
                check (false, std::string ("typed WatchTicker threw: ") + e.what ()
                       + " | injector error: " + injectorError + " | " + injectorLog);
            } catch (...) {
                check (false, "typed WatchTicker threw a non-standard exception");
            }
        }

        if (live) {
            std::cout << "-- live: binance public typed calls --" << std::endl;
            const ccxt::Ticker liveTicker = exchange.FetchTicker ("BTC/USDT");
            check (liveTicker.symbol.has_value () && *liveTicker.symbol == "BTC/USDT", "live FetchTicker symbol");
            check (liveTicker.last.has_value () && *liveTicker.last > 0.0, "live FetchTicker last > 0, got " + d2s (liveTicker.last.value_or (0.0)));
            const std::vector<ccxt::OHLCV> candles = exchange.FetchOHLCV ("BTC/USDT", "1h", std::nullopt, 3);
            check (candles.size () == 3, "live FetchOHLCV returns 3 candles");
            check (!candles.empty () && candles[0].close.has_value () && *candles[0].close > 0.0, "live OHLCV close > 0");
            const ccxt::OrderBook liveBook = exchange.FetchOrderBook ("BTC/USDT", 5);
            check (liveBook.bids.size () > 0 && liveBook.bids[0].size () >= 2, "live FetchOrderBook bids");
            check (liveBook.asks.size () > 0 && liveBook.asks[0][0] > liveBook.bids[0][0], "live ask > bid");
            const std::vector<ccxt::Market> markets = exchange.FetchMarkets ();
            check (markets.size () > 1000, "live FetchMarkets > 1000 markets");
            check (markets[0].symbol.has_value (), "live Market.symbol set");
        }
    } catch (const std::exception& e) {
        std::cout << "[TEST_FAILURE] typed smoke threw: " << e.what () << std::endl;
        failures++;
    }
    std::cout << (failures ? "typed smoke FAILED" : "typed smoke passed") << std::endl;
    return failures ? 1 : 0;
}
