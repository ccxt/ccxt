// CCXT C++ — binance-active-swap-prices.
//
// C++ counterpart of examples/rust/src/binance_active_swap_prices.rs: load the
// market table once, filter to active swap (linear/inverse) markets on the
// typed Market struct, then price exactly those symbols with one batched
// FetchTickers() call (merged with FetchBidsAsks() for the top of book).
#include "ccxt/exchanges/binance.h"

#include <algorithm>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

static std::string f (const std::optional<double>& v) {
    return v.has_value () ? std::to_string (*v) : std::string ("—");
}

static const char* contractKind (const ccxt::Market& m) {
    if (m.linear.has_value () && *m.linear) { return "linear"; }
    if (m.inverse.has_value () && *m.inverse) { return "inverse"; }
    return "?";
}

int main (int argc, char** argv) {
    const size_t take = (argc > 1 ? std::stoul (argv[1]) : 10);

    // Spot + contracts: binance lists swap markets only when asked for
    // types=linear,inverse via the fetchMarkets options.
    auto binance = ccxt::newExchange<ccxt::binance> ();
    if (!isDict (binance->options)) { binance->options = ccxt::dict {}; }
    ccxt::dict opts = ccxt::any_cast<ccxt::dict> (binance->options);
    ccxt::dict fetchOpts;
    fetchOpts.set ("types", ccxt::list {std::string ("linear"), std::string ("inverse")});
    opts.set ("fetchMarkets", fetchOpts);
    binance->options = opts;

    // 1-2. Load the table once, then filter swap + active.
    binance->LoadMarkets ();
    const std::vector<ccxt::Market> all = binance->FetchMarkets ();
    std::cout << "loaded " << all.size () << " markets" << std::endl;

    std::vector<ccxt::Market> swaps;
    for (const auto& m : all) {
        if (m.swap.has_value () && *m.swap) { swaps.push_back (m); }
    }
    std::cout << "  of which swap:   " << swaps.size () << std::endl;

    std::vector<ccxt::Market> active;
    for (const auto& m : swaps) {
        if (m.active.has_value () && *m.active) { active.push_back (m); }
    }
    std::cout << "  of which active: " << active.size ()
              << " (skipping " << (swaps.size () - active.size ()) << " inactive)" << std::endl;

    // 3. First N by symbol (reproducible; venue order is not stable).
    std::sort (active.begin (), active.end (), [] (const ccxt::Market& a, const ccxt::Market& b) {
        return a.symbol.value_or ("") < b.symbol.value_or ("");
    });
    if (active.size () > take) { active.resize (take); }
    if (active.empty ()) {
        std::cout << "\nno active swap markets found" << std::endl;
        return 0;
    }
    std::cout << "\ntaking the first " << active.size () << " by symbol:" << std::endl;

    std::vector<std::string> symbols;
    for (const auto& m : active) { symbols.push_back (m.symbol.value_or ("")); }

    // 4. One batched call for the prices + a batched top-of-book merge.
    ccxt::Tickers tickers;
    ccxt::Tickers books;
    try {
        tickers = binance->FetchTickers (symbols);
        books = binance->FetchBidsAsks (symbols);
    } catch (const std::exception& e) {
        std::cout << "fetch_tickers failed: " << e.what () << std::endl;
        return 1;
    }

    std::cout << std::left << std::setw (24) << "symbol" << std::right << std::setw (8) << "kind"
              << std::setw (14) << "bid" << std::setw (14) << "ask"
              << std::setw (14) << "last" << std::setw (16) << "24h base vol" << std::endl;
    std::cout << std::string (94, '-') << std::endl;
    for (const auto& m : active) {
        const std::string sym = m.symbol.value_or ("");
        if (!tickers.has (sym)) {
            std::cout << std::left << std::setw (24) << sym << std::right << std::setw (8)
                      << contractKind (m) << std::setw (14) << "no ticker" << std::endl;
            continue;
        }
        const ccxt::Ticker& t = tickers[sym];
        std::optional<double> bid = t.bid, ask = t.ask;
        if (books.has (sym)) {
            const ccxt::Ticker& b = books[sym];
            if (!bid) { bid = b.bid; }
            if (!ask) { ask = b.ask; }
        }
        std::cout << std::left << std::setw (24) << sym << std::right << std::setw (8)
                  << contractKind (m) << std::setw (14) << f (bid) << std::setw (14) << f (ask)
                  << std::setw (14) << f (t.last) << std::setw (16) << f (t.baseVolume) << std::endl;
    }

    // 5. Trading rules off the typed market — free, already loaded.
    if (!active.empty ()) {
        const ccxt::Market& m = active.front ();
        std::cout << "\n" << m.symbol.value_or ("") << " — settle " << m.settle.value_or ("—")
                  << " · linear=" << (m.linear.value_or (false) ? "yes" : "no") << std::endl;
    }
    return 0;
}
