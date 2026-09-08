// step-by-step trace of the generated toEn chain.
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/exchanges/phemex.h"
#include "../ccxt/base/ExchangeBase.h"
#include "../ccxt/base/helpers.h"
#include <iostream>

int main () {
    try {
        auto ex = ccxt::factory::createExchange (std::string ("phemex"), ccxt::dict {});
        const std::any n = std::string ("10");
        const std::any scale = 8;
        std::cout << "isEqual(n,{}): " << ::str (::toString (::isEqual (n, std::any {}))) << std::endl;
        std::cout << "isEqual(scale,{}): " << ::str (::toString (::isEqual (scale, std::any {}))) << std::endl;
        const std::any stringN = ex->callDynamically (std::string ("numberToString"), ccxt::list {n});
        std::cout << "numberToString(10): '" << ::str (::toString (stringN)) << "'" << std::endl;
        ccxt::Precise precise (stringN);
        std::cout << "Precise(stringN).toString(): " << ::str (precise.toString ()) << " decimals:" << precise.decimals << std::endl;
        const std::any subbed = ::subtract (std::any (precise.decimals), scale);
        std::cout << "subtract: " << ::str (::toString (subbed)) << " toLong: " << ccxt::toLong (subbed) << std::endl;
        precise.decimals = static_cast<int> (ccxt::toLong (subbed));
        precise.reduce ();
        const std::any preciseString = precise.toString ();
        std::cout << "after reduce: '" << ::str (::toString (preciseString)) << "'" << std::endl;
                const std::any freeStr = ::toString (std::any (precise));
        std::cout << "free toString(Precise): '" << ::str (freeStr) << "'" << std::endl;
const std::any num = ex->callDynamically (std::string ("parseToNumeric"), ccxt::list {preciseString});
        std::cout << "parseToNumeric: " << ::str (ex->json (num)) << " type:" << ::str (std::string (num.type ().name ())) << std::endl;
    } catch (const std::exception& e) {
        std::cout << "[ERROR] " << e.what () << std::endl;
    }
    return 0;
}
