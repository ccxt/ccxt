# Group: unified_driver — definitions only, no assertions.
#
# Loads the driver that runs the transpiled unified-method tests
# (`testFetchTicker`, `testFetchBalance`, …) against the recorded static
# response fixtures. The `unified_<id>` groups invoke it one exchange at a time.
#
# The `exchange_methods` group only *defines* those `testFetch*` functions;
# without this driver they contribute zero assertions, because nothing calls
# them. Here the HTTP layer is stubbed with the recorded payload and each test
# runs unchanged on top of it, so the exchange's own parsers, the structure
# validators and the shared assertion helpers all execute exactly as they would
# live — only the socket is replaced.
include("../exchange/unified_methods.jl")
