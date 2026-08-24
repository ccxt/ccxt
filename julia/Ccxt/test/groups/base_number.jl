# Group: base_number — numeric formatting and precision, from
# `ts/src/base/functions/number.ts` and `ts/src/base/Precise.ts`.
include("../base/test.decimalToPrecision.jl")
include("../base/test.numberToBE.jl")
include("../base/test.numberToString.jl")
include("../base/test.parsePrecision.jl")
include("../base/test.precise.jl")
include("../base/test.precisionFromString.jl")

@testset "base_number" begin
    testDecimalToPrecision()
    testNumberToBE()
    testNumberToString()
    testParsePrecision()
    testPrecise()
    testPrecisionFromString()
end
