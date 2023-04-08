#include <ccxt/base/functions/time.h>
#include <chrono>
#include <fmt/format.h>

namespace ccxt
{

    double now()
    {
        return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    }

    std::string yymmdd(int timestamp, std::string infix)
    {
        std::time_t t = timestamp / 1000;
        std::tm tm = *std::gmtime(&t);
        char buf[32];
        std::string s = fmt::format("%y{}%m{}%d", infix, infix);
        std::strftime(buf, sizeof(buf), s.c_str(), &tm);
        return std::string(buf);
    }

    std::string iso8601(int timestamp)
    {
        std::time_t t = timestamp / 1000;
        std::tm tm = *std::gmtime(&t);
        char buf[32];
        std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S.000Z", &tm);
        return std::string(buf);
    }

} // namespace ccxt