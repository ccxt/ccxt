#include "ccxt/prediction/PredictionFactory.h"
#include "ccxt/base/PredictionExchange.h"

#include <iostream>

int main () {
    const auto kalshi = std::static_pointer_cast<ccxt::PredictionExchange> (
        ccxt::prediction::factory::createPredictionExchange ("kalshi", ccxt::dict {}));
    const auto events = kalshi->FetchEvents ();
    std::cout << "events: " << events.size () << std::endl;
    for (std::size_t i = 0; i < events.size () && i < 5; i++) {
        std::cout << "  " << events[i].id.value_or ("") << " "
                  << events[i].title.value_or ("") << " (" << events[i].slug.value_or ("")
                  << ")" << std::endl;
    }

    const auto polymarket = std::static_pointer_cast<ccxt::PredictionExchange> (
        ccxt::prediction::factory::createPredictionExchange ("polymarket", ccxt::dict {}));
    const auto markets = polymarket->LoadMarkets ();
    std::cout << "polymarket markets: " << markets.size () << std::endl;
    return 0;
}
