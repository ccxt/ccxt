// Registry implementation for the pro (WebSocket) tier.

#include "ProExchangeFactory.h"

#include "../base/Errors.h"

#include <memory>

namespace ccxt {
namespace pro {
namespace factory {

namespace {
std::map<std::string, Creator>& proRegistry () {
    static std::map<std::string, Creator> registry;
    return registry;
}
} // namespace

void registerProExchange (const std::string& id, Creator creator) {
    proRegistry ()[id] = std::move (creator);
}

std::shared_ptr<ExchangeBase> createProExchange (const std::string& id, std::any config) {
    const auto it = proRegistry ().find (id);
    if (it == proRegistry ().end ()) {
        throw ccxt::NotSupported ("pro exchange " + id + " not found");
    }
    return it->second (config);
}

} // namespace factory
} // namespace pro
} // namespace ccxt
