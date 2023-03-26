#include <ccxt/base/functions/throttle.h>
#include <ccxt/base/errors.h>

// TODO: Limit the rate with which we send requests to the http server by implementing a token bucket algorithm.
// See
// https://dev.to/satrobit/rate-limiting-using-the-token-bucket-algorithm-3cjh
// https://en.m.wikipedia.org/wiki/Token_bucket
// https://github.com/rigtorp/TokenBucket
// https://rextester.com/discussion/YPQYU2506/Throttle-Example-in-C-80-requests-every-2-seconds-

namespace ccxt {

Throttle::Throttle(double refillRate, 
                   double delay, 
                   double capacity,
                   int maxCapacity,
                   int tokens,
                   double cost) 
                : _refillRate{refillRate}, _delay{delay}, _capacity{capacity}, _maxCapacity{maxCapacity}, _tokens{tokens}, _cost{cost}
{
}

}