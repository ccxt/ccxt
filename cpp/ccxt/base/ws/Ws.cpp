// WS/Pro base runtime pieces that need a translation unit: the order book's datetime
// refresh (iso8601, same semantics as ExchangeBase::iso8601).

#include "OrderBook.h"

#include <cstdio>
#include <ctime>

namespace ccxt {
namespace ws {

void WsOrderBook::refreshDatetime () {
    Impl& s = *this->impl;
    if (!isNum (s.timestamp)) {
        s.datetime = std::any {};
        return;
    }
    const long long ms = toLong (s.timestamp);
    if (ms < 0 || ms > 8640000000000000LL) {
        s.datetime = std::any {};
        return;
    }
    const std::time_t whole = static_cast<std::time_t> (ms / 1000);
    std::tm utc {};
    gmtime_r (&whole, &utc);
    char buffer[64];
    std::snprintf (buffer, sizeof (buffer), "%04d-%02d-%02dT%02d:%02d:%02d.%03lldZ",
                   utc.tm_year + 1900, utc.tm_mon + 1, utc.tm_mday,
                   utc.tm_hour, utc.tm_min, utc.tm_sec, ms % 1000);
    s.datetime = std::any (std::string (buffer));
}

} // namespace ws
} // namespace ccxt
