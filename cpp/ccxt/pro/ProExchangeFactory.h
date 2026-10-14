#pragma once

// Factory registry for the pro (WebSocket) tier. Mirrors ccxt::factory in
// cpp/ccxt/exchanges/ExchangeFactory.h: the transpiled pro exchanges are one
// header per venue under cpp/ccxt/pro/, each with a tiny generated tu_<id>.cpp
// that registers a creator here. The static ws test harness looks pro
// exchanges up by id through createProExchange.

#include "../exchanges/ExchangeFactory.h"

#include <any>
#include <functional>
#include <map>
#include <memory>
#include <string>

namespace ccxt {
namespace pro {
namespace factory {

using Creator = std::function<std::shared_ptr<ExchangeBase> (ccxt::any)>;

void registerProExchange (const std::string& id, Creator creator);
std::shared_ptr<ExchangeBase> createProExchange (const std::string& id, ccxt::any config);

} // namespace factory
} // namespace pro
} // namespace ccxt
