#include "PredictionFactory.h"

namespace ccxt {
namespace prediction {
namespace factory {

namespace {

std::map<std::string, Creator>& registry () {
    static std::map<std::string, Creator> reg;
    return reg;
}

} // namespace

void registerPredictionExchange (const std::string& id, Creator creator) {
    registry ()[id] = std::move (creator);
}

std::shared_ptr<ExchangeBase> createPredictionExchange (const std::string& id, ccxt::any config) {
    const auto& reg = registry ();
    const auto it = reg.find (id);
    if (it == reg.end ()) {
        throw NotSupported ("no C++ prediction factory for exchange " + id);
    }
    return it->second (config);
}

} // namespace factory
} // namespace prediction
} // namespace ccxt
