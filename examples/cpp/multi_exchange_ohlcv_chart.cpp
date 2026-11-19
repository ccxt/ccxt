// CCXT C++ — multi-exchange OHLCV chart.
//
// C++ counterpart of examples/rust/src/multi_exchange_ohlcv_chart.rs: fetch
// 1h closes for the same base asset from several exchanges through the same
// typed interface and render an ASCII chart with one marker per exchange.
//
//   ./build/multi_exchange_ohlcv_chart            # 72 candles, 18 rows
//   ./build/multi_exchange_ohlcv_chart 24 12      # width, height
#include "ccxt/base/Exchange.h"
#include "ccxt/exchanges/ExchangeFactory.h"

#include <algorithm>
#include <memory>
#include <chrono>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

static const char* TIMEFRAME = "1h";
static const char* MARKERS = "*o+x";

struct Series {
    std::string id;
    std::string symbol;
    char marker;
    std::vector<double> closes;
};

static const double* fetchSeries (std::vector<Series>& out, const std::string& id,
                                  const std::string& symbol, char marker, int64_t limit) {
    std::shared_ptr<ccxt::Exchange> ex;
    try {
        ex = std::dynamic_pointer_cast<ccxt::Exchange> (
            ccxt::factory::createExchange (id, ccxt::any{}));
    } catch (const std::exception& e) {
        std::cout << std::left << std::setw (18) << id << " unknown exchange id" << std::endl;
        return nullptr;
    }
    const auto started = std::chrono::steady_clock::now ();
    std::vector<ccxt::OHLCV> candles;
    try {
        candles = ex->FetchOHLCV (symbol, TIMEFRAME, std::nullopt, limit);
    } catch (const std::exception& e) {
        std::cout << std::left << std::setw (18) << id << " [" << e.what () << "]" << std::endl;
        return nullptr;
    }
    if (candles.empty ()) {
        std::cout << std::left << std::setw (18) << id << " no candles returned" << std::endl;
        return nullptr;
    }
    Series s;
    s.id = id;
    s.symbol = symbol;
    s.marker = marker;
    for (const auto& c : candles) { s.closes.push_back (c.close.value_or (0.0)); }
    const auto ms = std::chrono::duration_cast<std::chrono::milliseconds> (
                        std::chrono::steady_clock::now () - started).count ();
    std::cout << std::left << std::setw (18) << id << std::setw (10) << symbol
              << s.closes.size () << " candles in " << ms << " ms" << std::endl;
    out.push_back (std::move (s));
    return &out.back ().closes[0];
}

static void plot (const std::vector<Series>& series, size_t width, size_t height) {
    double low = 1e308, high = -1e308;
    for (const auto& s : series) {
        const size_t from = s.closes.size () > width ? s.closes.size () - width : 0;
        for (size_t i = from; i < s.closes.size (); i++) {
            low = std::min (low, s.closes[i]);
            high = std::max (high, s.closes[i]);
        }
    }
    if (!(high > low)) {
        std::cout << "flat range, nothing to plot" << std::endl;
        return;
    }
    std::vector<std::vector<char>> grid (height, std::vector<char> (width, ' '));
    for (const auto& s : series) {
        const size_t skip = s.closes.size () > width ? s.closes.size () - width : 0;
        for (size_t x = 0; x < width && x + skip < s.closes.size (); x++) {
            const double c = s.closes[x + skip];
            const double normalized = (c - low) / (high - low);
            size_t y = static_cast<size_t> ((1.0 - normalized) * static_cast<double> (height - 1) + 0.5);
            y = std::min (y, height - 1);
            char& cell = grid[y][x];
            if (cell == ' ') { cell = s.marker; }
            else if (cell != s.marker) { cell = '#'; }
        }
    }
    for (size_t row = 0; row < height; row++) {
        const double price = high - (high - low) * static_cast<double> (row) / static_cast<double> (height - 1);
        std::cout << std::right << std::setw (12) << std::fixed << std::setprecision (2)
                  << price << " | " << std::string (grid[row].begin (), grid[row].end ()) << std::endl;
    }
    std::cout << std::setw (12) << " " << " +" << std::string (width, '-') << std::endl;
    std::cout << std::setw (12) << " " << "   oldest " << width << " x " << TIMEFRAME << " newest" << std::endl;
}

static void legend (const std::vector<Series>& series, size_t width) {
    std::cout << std::endl;
    std::cout << std::left << std::setw (3) << "" << std::setw (18) << "exchange"
              << std::setw (10) << "symbol" << std::right << std::setw (12) << "first"
              << std::setw (12) << "last" << std::setw (9) << "change" << std::endl;
    for (const auto& s : series) {
        const size_t from = s.closes.size () > width ? s.closes.size () - width : 0;
        const double first = s.closes[from];
        const double last = s.closes.back ();
        const double change = first > 0.0 ? (last - first) / first * 100.0 : 0.0;
        std::cout << std::left << std::setw (3) << s.marker << std::setw (18) << s.id
                  << std::setw (10) << s.symbol << std::right << std::fixed << std::setprecision (2)
                  << std::setw (12) << first << std::setw (12) << last
                  << std::setw (8) << change << "%" << std::endl;
    }
    std::cout << "#  two or more exchanges on the same point" << std::endl;
}

int main (int argc, char** argv) {
    const size_t width = argc > 1 ? std::stoul (argv[1]) : 72;
    const size_t height = argc > 2 ? std::stoul (argv[2]) : 18;

    const struct { const char* id; const char* symbol; } targets[] = {
        {"binance", "BTC/USDT"}, {"okx", "BTC/USDT"}, {"kraken", "BTC/USD"}, {"bitstamp", "BTC/USD"},
    };

    std::vector<Series> series;
    for (size_t i = 0; i < sizeof (targets) / sizeof (targets[0]); i++) {
        fetchSeries (series, targets[i].id, targets[i].symbol, MARKERS[i], static_cast<int64_t> (width));
    }
    if (series.empty ()) {
        std::cout << "no series fetched" << std::endl;
        return 1;
    }
    plot (series, width, height);
    legend (series, width);
    return 0;
}
