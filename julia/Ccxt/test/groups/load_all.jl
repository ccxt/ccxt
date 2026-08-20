# Group: load_all — every generated exchange constructs, indexes a recorded
# market set and resolves a symbol back through `market()`.
#
# `exchange_stubs` already asserts each exchange *type* exists, but a type that
# exists can still fail the moment it is instantiated: `describe()` runs at
# construction and is the single largest block of transpiled code in an exchange
# file, so a generator bug there produces a module that loads cleanly and throws
# on first use. Likewise, `setMarkets` walks every recorded market through
# `safeMarketStructure` + `deepExtend`, deriving fields the recorded entry does
# not carry — which is where a bad merge or a mis-keyed index surfaces.
#
# So this group covers the two steps between "the file parsed" and "the exchange
# is usable", for all of them at once:
#
#   1. `cls()`                     — describe() evaluates, defaults merge
#   2. `static_init_offline(...)`  — setMarkets indexes the recorded markets
#   3. `market(ex, symbol)`        — the resulting index actually resolves
#
# Step 3 matters: `setMarkets` can populate `markets` while leaving
# `markets_by_id`, `symbols` or `ids` inconsistent, and every unified method
# reaches a market through this lookup rather than through the raw dict.
#
# The fixtures are small on purpose — a handful of markets per exchange, chosen
# to span the market types that exchange supports (see
# `test/fixtures/markets/README.md`). Breadth across exchanges is what this group
# buys; depth within one exchange is what the `request_*`/`response_*` groups buy.

# Exchanges with no `markets/<id>.json`, and why. Each needs a live, authorised
# call to enumerate its markets, so no fixture can be recorded offline. They are
# still constructed here (step 1); only steps 2-3 are skipped.
#
# Listed explicitly rather than inferred from a missing file, so that deleting a
# fixture by accident fails the suite instead of quietly reducing its coverage.
const LOAD_ALL_NO_FIXTURE = Dict(
    "alpaca"   => "loadMarkets requires an apiKey credential",
    "extended" => "market endpoint returns 403 to unauthenticated clients",
    "gate"     => "market endpoint TLS chain is not verifiable offline",
    "mudrex"   => "loadMarkets requires a secret credential",
)

const LOAD_ALL_IDS = Base.sort([replace(f, r"\.jl$" => "")
                                for f in readdir(joinpath(@__DIR__, "..", "..", "src", "exchanges"))
                                if endswith(f, ".jl")])

load_all_markets_path(id) = joinpath(@__DIR__, "..", "fixtures", "markets", id * ".json")

"""
    load_all_raw_markets(id) -> Dict{String,Any}

The recorded markets for `id` exactly as they sit on disk, string-keyed.

Read independently of `static_init_offline`, which converts to symbol keys and
runs the entries through `setMarkets`. Having the untransformed input on hand is
what lets the assertions below compare the loaded index against its *source*
rather than against itself.
"""
load_all_raw_markets(id) = JSON3.read(read(load_all_markets_path(id), String), Dict{String,Any})

@testset "every generated exchange constructs and loads markets" begin
    # A generator regression tends to hit many exchanges at once, so the count is
    # asserted up front: if the exchange directory is half-written, this fails
    # with one clear message instead of a hundred confusing ones.
    @test length(LOAD_ALL_IDS) > 100

    for id in LOAD_ALL_IDS
        cls = getproperty(Ccxt, Symbol(uppercasefirst(id)))
        @testset "$id" begin
            ex = cls()
            @test ex.id == id

            if haskey(LOAD_ALL_NO_FIXTURE, id)
                # Documented above; construction alone is the available coverage.
                @test !isfile(load_all_markets_path(id))
                continue
            end

            raw = load_all_raw_markets(id)
            loaded = static_init_offline(id, cls)

            # Every recorded market survives indexing. Compared against the file
            # rather than against `loaded` itself, so a `setMarkets` that drops
            # or collapses entries is caught instead of being echoed back.
            @test length(loaded.markets) == length(raw)
            @test length(loaded.symbols) == length(raw)
            # `Base.` qualified: `test/setup.jl` imports a number of CCXT helpers
            # into `Main`, which leaves bare `values`/`unique` ambiguous.
            @test length(loaded.ids) == length(Base.unique(m["id"] for m in Base.values(raw)))

            # `subType` is *computed* by `setMarkets` from the linear/inverse
            # flags rather than copied -- two thirds of the recorded entries
            # carry no `subType` of their own. Checking the result against the
            # flags in the source file (not against the loaded market, which
            # would just restate the code) is what makes this an input/output
            # assertion.
            for (symbol, market) in loaded.markets
                expected = if get(raw[String(symbol)], "linear", false) == true
                    "linear"
                elseif get(raw[String(symbol)], "inverse", false) == true
                    "inverse"
                else
                    nothing
                end
                @test market[Symbol("subType")] == expected
                # Present on every market even where the recorded entry omits
                # them, because `setMarkets` deep-merges the exchange defaults
                # in. The *value* may legitimately be `nothing` when the
                # exchange declares no default (binance's dated futures), which
                # matches the reference JS build.
                @test haskey(market, Symbol("precision"))
                @test haskey(market, Symbol("limits"))
            end

            # Resolve through both branches of `market()`. The unified methods
            # reach markets by symbol, the parsers reach them by exchange-native
            # id via `markets_by_id`; the two indexes are built separately and
            # only this second lookup exercises the id one.
            symbol = first(loaded.symbols)
            @test Ccxt.market(loaded, symbol)[Symbol("symbol")] == symbol

            native_id = raw[symbol]["id"]
            by_id = Ccxt.market(loaded, native_id)
            @test by_id !== nothing
            @test by_id[Symbol("id")] == native_id
        end
    end
end
