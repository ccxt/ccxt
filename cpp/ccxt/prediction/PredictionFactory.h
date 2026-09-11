#pragma once

// Prediction factory registry (mirrors ccxt::factory for the prediction tier).
// The transpiled prediction exchanges are one header per venue plus a tiny
// generated tu_<id>.cpp registering a creator here, so binaries link the ccxt
// library and look prediction venues up by id at runtime (the C++ counterpart
// of C#'s ccxt.prediction namespace / DynamicallyCreateInstance).

#include "../base/ExchangeBase.h"

#include <any>
#include <functional>
#include <map>
#include <memory>
#include <string>

namespace ccxt {
namespace prediction {
namespace factory {

using Creator = std::function<std::shared_ptr<ExchangeBase> (std::any)>;

void registerPredictionExchange (const std::string& id, Creator creator);
std::shared_ptr<ExchangeBase> createPredictionExchange (const std::string& id, std::any config);

} // namespace factory
} // namespace prediction
} // namespace ccxt
