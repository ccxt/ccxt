#pragma one

#include <map>
#include <string>
#include <nlohmann/json.hpp>

namespace ccxt
{

    std::map<std::string, nlohmann::json> indexBy(const nlohmann::json &json, const std::string &key);

}