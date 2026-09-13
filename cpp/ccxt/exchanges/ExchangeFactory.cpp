#include "ExchangeFactory.h"
#include "../base/Exchange.h"

namespace ccxt {
namespace factory {

namespace {

std::map<std::string, Creator>& registry () {
    static std::map<std::string, Creator> reg;
    return reg;
}

} // namespace

void registerExchange (const std::string& id, Creator creator) {
    registry ()[id] = std::move (creator);
}

std::shared_ptr<ExchangeBase> createExchange (const std::string& id, ccxt::any config) {
    // ts/src/test/tests.ts builds a plain base Exchange as a temporary calculator
    // (initExchange ('Exchange', {}) — "tmp to do the calculations"), which is a
    // real, constructible instance there; mirror it.
    if (id == "Exchange") {
        return newExchange<Exchange> (config);
    }
    const auto& reg = registry ();
    const auto it = reg.find (id);
    if (it == reg.end ()) {
        throw NotSupported ("no C++ factory for exchange " + id);
    }
    return it->second (config);
}

} // namespace factory
} // namespace ccxt
