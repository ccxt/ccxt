// step-by-step trace of the generated toEn chain.
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/exchanges/phemex.h"
#include "../ccxt/base/ExchangeBase.h"
#include "../ccxt/base/helpers.h"
#include <iostream>

int main () {
    try {
        auto ex = ccxt::factory::createExchange (std::string ("phemex"), ccxt::dict {});
        const ccxt::any n = std::string ("10");
        const ccxt::any scale = 8;
        std::cout << "isEqual(n,{}): " << ::str (::toString (::isEqual (n, ccxt::any {}))) << std::endl;
        std::cout << "isEqual(scale,{}): " << ::str (::toString (::isEqual (scale, ccxt::any {}))) << std::endl;
        const ccxt::any stringN = ex->callDynamically (std::string ("numberToString"), ccxt::list {n});
        std::cout << "numberToString(10): '" << ::str (::toString (stringN)) << "'" << std::endl;
        ccxt::Precise precise (stringN);
        std::cout << "Precise(stringN).toString(): " << ::str (precise.toString ()) << " decimals:" << precise.decimals << std::endl;
        const ccxt::any subbed = ::subtract (ccxt::any (precise.decimals), scale);
        std::cout << "subtract: " << ::str (::toString (subbed)) << " toLong: " << ccxt::toLong (subbed) << std::endl;
        precise.decimals = static_cast<int> (ccxt::toLong (subbed));
        precise.reduce ();
        const ccxt::any preciseString = precise.toString ();
        std::cout << "after reduce: '" << ::str (::toString (preciseString)) << "'" << std::endl;
                const ccxt::any freeStr = ::toString (ccxt::any (precise));
        std::cout << "free toString(Precise): '" << ::str (freeStr) << "'" << std::endl;
const ccxt::any num = ex->callDynamically (std::string ("parseToNumeric"), ccxt::list {preciseString});
        std::cout << "parseToNumeric: " << ::str (ex->json (num)) << " type:" << ::str (std::string (num.type ().name ())) << std::endl;
    } catch (const std::exception& e) {
        std::cout << "[ERROR] " << e.what () << std::endl;
    }
    return 0;
}
