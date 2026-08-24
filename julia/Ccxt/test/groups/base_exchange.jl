# Group: base_exchange — `Exchange` base-class behaviour: safe* accessors,
# market/network handling, construction, and IO.
include("../base/test.afterConstructor.jl")
include("../base/test.fetchHistory.jl")
include("../base/test.handleMethods.jl")
include("../base/test.io.jl")
include("../base/test.networkMethods.jl")
include("../base/test.safeMethods.jl")
include("../base/test.safeTicker.jl")
include("../base/test.setMarketsFromExchange.jl")

@testset "base_exchange" begin
    testAfterConstructor()
    testFetchHistory()
    testHandleMethods()
    testIo()
    testNetworkMethods()
    testSafeMethods()
    testSafeTicker()
    testSetMarketsFromExchange()
end
