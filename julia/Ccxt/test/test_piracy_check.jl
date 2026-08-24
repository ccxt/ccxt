# Static + dynamic check that loading `Ccxt` does NOT pirate `Base` for the
# builtin types flagged in the review (Dict / Nothing / Module / AbstractVector
# / AbstractString). Run via:
#   julia --project=julia/Ccxt julia/Ccxt/test/test_piracy_check.jl
using Test
using Ccxt

@testset "no global Base piracy from Ccxt" begin
    # The review flagged these specific `Base.get` / `Base.getproperty` /
    # `Base.:+` overrides on builtin types. After de-globalization they must
    # NOT be introduced by Ccxt anywhere in the session.
    function methods_introduced_by_ccxt(method, T)
        results = Method[]
        for m in methods(method, (T, Symbol, Any))
            # A method owned by Base/CORE is pre-existing; Ccxt would have
            # added its own. We flag any method whose file is inside the Ccxt
            # package source tree AND whose first argument type is exactly the
            # builtin `T` (not a Ccxt subtype of it — e.g. `WsArray <:
            # AbstractVector` legitimately defines `get`, but that only affects
            # the WebSocket cache structs, not every `AbstractVector`).
            file = String(m.file)
            if (occursin("julia/Ccxt/src", file) && occursin("Ccxt", file)
                    && m.sig.parameters[2] === T)
                push!(results, m)
            end
        end
        return results
    end

    # 1) `get` on the builtin types the review flagged (Nothing / Module /
    # AbstractVector) must have NO Ccxt-owned method. (Ccxt legitimately keeps
    # `Base.get` overloads on `AbstractString`/`Number`/`CcxtExchange`/
    # `WsArray` to emulate JS `toString`/property access — those are not
    # flagged piracy.)
    for T in [Nothing, Module, AbstractVector]
        bad = methods_introduced_by_ccxt(get, T)
        @test isempty(bad)
        isempty(bad) || @error "Ccxt pirates Base.get on $T" bad
    end
    # Dict getproperty pirate
    bad_dict_prop = methods_introduced_by_ccxt(getproperty, Dict)
    @test isempty(bad_dict_prop)
    isempty(bad_dict_prop) || @error "Ccxt pirates Base.getproperty on Dict" bad_dict_prop
    # Nothing getproperty pirate
    bad_nothing_prop = methods_introduced_by_ccxt(getproperty, Nothing)
    @test isempty(bad_nothing_prop)
    isempty(bad_nothing_prop) || @error "Ccxt pirates Base.getproperty on Nothing" bad_nothing_prop

    # 2) `+` on two AbstractStrings must NOT be introduced by Ccxt (string
    # concatenation is `*`, not `+`; `+` on strings is a MethodError in plain
    # Julia).
    plus_str = methods_introduced_by_ccxt(+, AbstractString)
    @test isempty(plus_str)
    isempty(plus_str) || @error "Ccxt pirates Base.:+ on (AbstractString, AbstractString)" plus_str

    # 3) Sanity: standard Base behaviour is intact for unrelated packages.
    @test get(Dict(:a => 1), :a, nothing) === 1
    d2 = Dict{Symbol,Any}(:b => 2)
    @test get(d2, :missing_key, :default) === :default
    # `get` on a Number still hits the (legitimate, pre-existing CCXTBase)
    # Base.get overloads used by exchange structs:
    @test Ccxt.functions.ccxt_get(5, :x, :def) === :def
end
