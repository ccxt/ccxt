// minimal parseJson isolation test.
#include "../ccxt/base/ExchangeBase.h"
#include <iostream>

int main () {
    try {
        ccxt::ExchangeBase parser;
        const ccxt::any v = parser.parseJson (std::string ("{\"serverTime\":1788834211451}"));
        std::cout << "small int ok: " << str (parser.json (v)) << std::endl;
        const ccxt::any v2 = parser.parseJson (std::string ("{\"id\":2880534893454904000}"));
        std::cout << "big int ok: " << str (parser.json (v2)) << std::endl;
        const ccxt::any v3 = parser.parseJson (std::string ("{\"a\":1.5,\"b\":[1,2],\"s\":\"x\"}"));
        std::cout << "mixed ok: " << str (parser.json (v3)) << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cout << "THREW: " << e.what () << std::endl;
        return 1;
    }
}
