# Group: base_crypto — hashing, HMAC, ECDSA/RSA signing, JWT, UUID.
include("../base/test.cryptography.jl")
include("../base/test.ethMethods.jl")
include("../base/test.uuid.jl")

@testset "base_crypto" begin
    testCryptography()
    testEthMethods()
    testUuid()
end
