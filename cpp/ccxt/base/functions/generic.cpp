#include <ccxt/base/functions/generic.h>
#include <stdexcept>

namespace ccxt {

    std::map<std::string, nlohmann::json> indexBy(const nlohmann::json& json, const std::string& key)
    {
        std::map<std::string, nlohmann::json> result;
        for (auto& element : json) {
            if (element.find(key) == element.end()) {
                continue;
            }
            result[element[key].get<std::string>()] = element;
        }
        return result;
    }

} // namespace ccxt