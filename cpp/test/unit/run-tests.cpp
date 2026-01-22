#include <doctest.h>
#include <string>
#include <vector>

std::vector<std::string> exchanges;
std::string symbol{"all"};
int maxConcurrency = 5; // MAX_VALUE // no limit

TEST_CASE("Test All Exchanges")
{
    // TODO: run tests concurrently.

    // for (const exchange of exchanges) {
    //         taskPool.run (() => testExchange (exchange).then (x => results.push (x)))
    //     }
}