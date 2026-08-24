# Group: exchange_stubs — every generated exchange module loads, the generated
# set still matches the coverage manifest, and the runner's view of the fixture
# exchanges matches the fixtures' own.
#
# Cheap (a fraction of a second) and independent of the fixture layers, so it is
# its own group rather than a tail-end of the fixture run.
include("../fixtures.jl")
include("../test_exchanges.jl")

# `test/runtests.jl` needs the fixture exchange ids to build the `request_<id>`
# / `response_<id>` / `unified_<id>` groups, and it does that *before* loading
# `Ccxt` — deliberately, so `--list` and the parallel parent stay instant. The
# authoritative registry (`FIXTURE_EXCHANGES`) names exchange classes, so it
# cannot be read without `Ccxt`, which leaves the runner with its own
# `FIXTURE_IDS` list.
#
# The two are therefore checked against each other here rather than merely
# commented. Without this, adding an exchange to the registry and forgetting the
# runner would silently produce no group for it: the fixtures would exist, the
# suite would stay green, and nothing would ever run them.
#
# `Base.sort` must be qualified: `test/setup.jl` imports a number of CCXT
# helpers into `Main`, which leaves `sort` (among others) ambiguous for a bare
# call.
@testset "fixture exchange registry matches the runner" begin
    @test Base.sort(FIXTURE_IDS) == Base.sort(FIXTURE_EXCHANGE_IDS)
end
