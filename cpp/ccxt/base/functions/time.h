#pragma once

#include <string>

namespace ccxt
{

    // returns the current timestamp in milliseconds
    double now();

    // Returns the unix timestamp in yymmmdd format, assuming the timestamp is in milliseconds and UTC timezone.
    std::string yymmdd(uint64_t timestamp, std::string infix = "");

    // Returns the unix timestamp in ISO8601 format, assuming the timestamp is in milliseconds and UTC timezone.
    std::string iso8601(uint64_t timestamp);

} // namespace ccxt
