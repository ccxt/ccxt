// CCXT C++ — prediction typed demo.
//
// C++ counterpart of examples/rust/src/prediction_typed_demo.rs: the
// prediction tier (ccxt_prediction) holds prediction-market venues that live
// outside the REST/pro registries. Polymarket is built through the
// prediction factory and its markets are fetched through the same typed
// FetchMarkets() the REST examples use.
#include "ccxt/base/Exchange.h"
#include "ccxt/prediction/PredictionFactory.h"

#include <iostream>
#include <string>

int main () {
    std::cout << "=== Polymarket — CCXT C++ prediction typed demo ===" << std::endl;

    std::shared_ptr<ccxt::Exchange> ex;
    try {
        ex = std::dynamic_pointer_cast<ccxt::Exchange> (
            ccxt::prediction::factory::createPredictionExchange ("polymarket", ccxt::any{}));
    } catch (const std::exception& e) {
        std::cout << "cannot build polymarket: " << e.what () << std::endl;
        return 1;
    }

    std::cout << "\n→ FetchMarkets() …" << std::endl;
    try {
        const std::vector<ccxt::Market> markets = ex->FetchMarkets ();
        std::cout << "   ✓ " << markets.size () << " markets" << std::endl;
        size_t shown = 0;
        for (const auto& m : markets) {
            if (shown++ >= 5) { break; }
            std::cout << "     " << m.symbol.value_or (m.id.value_or ("?")) << std::endl;
        }
        if (markets.size () > 5) {
            std::cout << "     … and " << (markets.size () - 5) << " more" << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "   ✗ " << e.what () << std::endl;
        return 1;
    }

    return 0;
}
