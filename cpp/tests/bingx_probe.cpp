// bingx sign() direct isolation.
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/base/ExchangeBase.h"
#include "../ccxt/base/helpers.h"
#include <iostream>

int main () {
    auto ex = ccxt::factory::createExchange (std::string ("bingx"), ccxt::dict {
        {std::string ("apiKey"), std::string ("key")},
        {std::string ("secret"), std::string ("secretsecret")},
    });
    const ccxt::list section {
        std::string ("account"), std::string ("v1"), std::string ("private"),
    };
    const std::any signedReq = ex->callDynamically (std::string ("sign"), ccxt::list {
        std::string ("account/apiRestrictions"), std::any (section), std::string ("GET"), std::any (ccxt::dict {}),
    });
    std::cout << "sign result: " << ::str (ex->json (signedReq)) << std::endl;
    // step the internals
    ccxt::dict params;
    params.set ("timestamp", ex->callDynamically (std::string ("nonce"), ccxt::list {}));
    const std::any parsedParams = ex->callDynamically (std::string ("parseParams"), ccxt::list {std::any (params)});
    std::cout << "parsedParams: " << ::str (ex->json (parsedParams)) << std::endl;
    const std::any enc = ex->callDynamically (std::string ("rawencode"), ccxt::list {parsedParams, true});
    std::cout << "rawencode: " << ::str (ex->json (enc)) << std::endl;
    const std::any q = ex->callDynamically (std::string ("urlencode"), ccxt::list {parsedParams, true});
    std::cout << "urlencode: " << ::str (ex->json (q)) << std::endl;
    return 0;
}
