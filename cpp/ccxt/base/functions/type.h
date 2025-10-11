#pragma once

#include <string>
#include <limits>
#include <nlohmann/json.hpp>

namespace ccxt
{

    /*  .............................................   */
    double asDouble(const std::string &x);
    int asInteger(const std::string &x);
    /*  .............................................   */

    double safeDouble(const std::string &k, double defaultValue = std::numeric_limits<double>::quiet_NaN());
    double safeDouble(double k, double defaultValue = std::numeric_limits<double>::quiet_NaN());
    int safeInteger(const std::string &k, int defaultValue = std::numeric_limits<int>::min());
    int safeInteger(int k, int defaultValue = std::numeric_limits<int>::min());
    int safeInteger(const nlohmann::json &j, const std::string &k, int defaultValue = std::numeric_limits<int>::min());
    std::string safeString(const std::string &k, const std::string &defaultValue = "");
    std::string safeString(int k, const std::string &defaultValue = "");
    std::string safeString(const nlohmann::json &j, const std::string &k, const std::string &defaultValue = "");
    std::string safeStringLower(const nlohmann::json &j, const std::string &k, const std::string &defaultValue = "");

    int safeInteger2(const nlohmann::json &j, const std::string &k1, const std::string &k2, int defaultValue = std::numeric_limits<int>::min());
    long safeLong2(const nlohmann::json &j, const std::string &k1, const std::string &k2, long defaultValue = std::numeric_limits<long>::min());
    uint64_t safeuint64_t2(const nlohmann::json& j, const std::string& k1, const std::string& k2, uint64_t defaultValue = std::numeric_limits<uint64_t>::min());
    double safeValue2(double k1, double k2, double defaultValue = std::numeric_limits<double>::quiet_NaN());
    std::string safeString2(const std::string &k1, const std::string &k2, const std::string &defaultValue = "");
    std::string safeString2(int k1, const std::string &k2, const std::string &defaultValue = "");
    std::string safeString2(const std::string &k1, int k2, const std::string &defaultValue = "");
    std::string safeString2(int k1, int k2, const std::string &defaultValue = "");
    std::string safeString2(const nlohmann::json &j, const std::string &k1, const std::string &k2, const std::string &defaultValue = "");

    double safeIntegerProduct(const std::string &k, double factor, double defaultValue = 0.0);

}