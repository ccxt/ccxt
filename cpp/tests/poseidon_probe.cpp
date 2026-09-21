// poseidon vector check against the Python reference implementation.
#include "../ccxt/base/Starknet.h"
#include <iostream>
#include <string>
#include <vector>

int main () {
    struct Vec { std::vector<std::string> in; std::string want; };
    const std::vector<Vec> vecs = {
        {{"1", "2"}, "371cb6995ea5e7effcd2e174de264b5b407027a75a231a70c2c8d196107f0e7"},
        {{"0", "1", "2"}, "7a01142da8aecae3782ba66fc3285fd02fcd2c55aa868fe50fd95c089068d16"},
        {{"123456789012345678901234567890123456789"}, "6010e9f6a86be01e98250ca5827055d8be13ad7296ebbb4c001916ca4e6bd4d"},
        {{}, "2272be0f580fd156823304800919530eaa97430e972d7213ee13f4fbf7a5dbc"},
        {{"1", "2", "3", "4", "5", "6", "7"}, "16763d80d82ae53e5442d7ac5f76765d3c2780fe9428d4bc3082d4cf3dbfb4f"},
    };
    int pass = 0;
    for (const auto& v : vecs) {
        try {
            const std::string got = ccxt::starkcrypto::poseidonHashMany (v.in);
            const bool ok = (got == v.want);
            std::cout << (ok ? "PASS" : "FAIL") << " got=0x" << got << (ok ? "" : (" want=0x" + v.want)) << std::endl;
            if (ok) pass++;
        } catch (const std::exception& e) {
            std::cout << "FAIL threw: " << e.what () << std::endl;
        }
    }
    std::cout << pass << "/" << vecs.size () << " passed" << std::endl;
    return pass == static_cast<int> (vecs.size ()) ? 0 : 1;
}
