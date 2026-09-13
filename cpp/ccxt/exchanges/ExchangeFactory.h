#pragma once

// Exchange factory registry. The transpiled exchanges are one header per venue
// (each a very large single translation unit), so compiling every exchange into
// the test binary's own TU would take forever and blow memory. Instead each
// exchange gets a tiny generated tu_<id>.cpp that includes just that header and
// registers a creator function here; the test binary links the ccxt library and
// looks exchanges up by id at runtime (the C++ counterpart of C#'s
// Exchange.DynamicallyCreateInstance).

#include "../base/ExchangeBase.h"

#include <any>
#include <functional>
#include <map>
#include <memory>
#include <string>

namespace ccxt {
namespace factory {

using Creator = std::function<std::shared_ptr<ExchangeBase> (ccxt::any)>;

void registerExchange (const std::string& id, Creator creator);
std::shared_ptr<ExchangeBase> createExchange (const std::string& id, ccxt::any config);

} // namespace factory
} // namespace ccxt
