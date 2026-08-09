# Group: base_datetime — timestamp parsing/formatting and timeframes, from
# `ts/src/base/functions/time.ts`.
include("../base/test.constants.jl")
include("../base/test.datetime.jl")
include("../base/test.sleep.jl")
include("../base/test.timeframes.jl")

@testset "base_datetime" begin
    testConstants()
    testDatetime()
    testSleep()
    testTimeframes()
end
