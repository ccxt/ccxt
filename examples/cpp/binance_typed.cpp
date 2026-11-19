#include "ccxt/exchanges/ExchangeFactory.h"
#include "ccxt/base/Exchange.h"

#include <iostream>

int main () {
    const auto binance = std::static_pointer_cast<ccxt::Exchange> (
        ccxt::factory::createExchange ("binance", ccxt::dict {}));
    const auto markets = binance->LoadMarkets ();
    std::cout << "markets: " << markets.size () << std::endl;

    const ccxt::Ticker ticker = binance->FetchTicker ("BTC/USDT");
    std::cout << "ticker " << ticker.symbol.value_or ("") << ": last "
              << ticker.last.value_or (0.0) << ", bid " << ticker.bid.value_or (0.0)
              << ", ask " << ticker.ask.value_or (0.0) << std::endl;

    const auto trades = binance->FetchTrades ("BTC/USDT", std::nullopt, 5);
    std::cout << "trades: " << trades.size () << std::endl;
    for (const auto& t : trades) {
        std::cout << "  " << t.id.value_or ("") << " " << t.side.value_or ("")
                  << " price=" << t.price.value_or (0.0)
                  << " amount=" << t.amount.value_or (0.0) << std::endl;
    }

    const ccxt::OrderBook book = binance->FetchOrderBook ("BTC/USDT", 5);
    std::cout << "orderbook " << book.symbol.value_or ("") << ": "
              << book.bids.size () << " bids, " << book.asks.size () << " asks" << std::endl;
    if (!book.bids.empty () && !book.asks.empty ()) {
        std::cout << "  top bid: " << book.bids[0][0] << " / " << book.bids[0][1] << std::endl;
        std::cout << "  top ask: " << book.asks[0][0] << " / " << book.asks[0][1] << std::endl;
    }
    return 0;
}
