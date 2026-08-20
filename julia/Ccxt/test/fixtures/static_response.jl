# Static response-fixture tests — the Julia port of `testResponseStatically` in
# `ts/src/test/tests.ts` (and of `npm run response-js` / `response-py` / …).
#
# Each entry in `test/fixtures/response/<exchange>.json` pairs a recorded raw
# exchange payload (`httpResponse`) with the unified CCXT structure it must
# parse into (`parsedResponse`). The exchange method is called with the HTTP
# layer stubbed out to replay the recorded payload, and the returned structure
# is compared field-by-field against the stored one. Where the request tests
# cover signing and URL construction, these cover the parsing half: every
# `parseTicker` / `parseOrder` / `parseTrade` implementation is exercised
# against real exchange output without touching the network.
#
# The stub is installed at `fetchImplementation` rather than at `fetch`, so the
# whole response pipeline — `handleRestResponse`, `parseJson`, `handleErrors`,
# and the exchange's own parsers — still runs, exactly as it would live.
#
# Loading order note: this file reuses the offline-construction and comparison
# helpers defined in `static_request.jl`, which the `static_drivers` group
# includes first.
#
# Like the request driver, this file only *defines* the checks;
# `static_response_testset(id)` runs one exchange, and `test/runtests.jl`
# registers each as its own group (`response_binance`, …).

using Test
using Ccxt
using JSON3

const STATIC_RESPONSE_ROOT = joinpath(@__DIR__)

"""
    static_mock_http!(exchange, payload)

Replace the exchange's HTTP backend with one that replays `payload`. The shape
returned here mirrors what `ccxt_fetch` in `src/runtime.jl` produces (the
`:status`/`:headers`/`:text` dict consumed by `handleRestResponse`), so the
response travels the same code path as a real one.
"""
function static_mock_http!(ex, payload)
    bodyText = JSON3.write(payload)
    ex.fetchImplementation = (url, params) -> Dict(
        :status => 200,
        :statusText => "OK",
        :headers => Dict{Symbol,Any}(Symbol("Content-Type") => "application/json"),
        :text => (() -> bodyText),
        :arrayBuffer => (() -> Vector{UInt8}(codeunits(bodyText))),
    )
    return ex
end

"""
    static_compare_response(computed, stored, skipKeys, path, errs)

Like [`static_compare`](@ref) but with the relaxed scalar rule the TS runner
uses for responses (`strictTypeCheck = false`): a value that round-tripped
through JSON may come back as `50.0` where `50` was stored, so numbers are
compared numerically and everything else by string value. Keys in `skipKeys`
are ignored, and a stored `null` matches a computed `nothing`.
"""
function static_compare_response(newv, storedv, skipKeys, path, errs)
    (newv === nothing && storedv === nothing) && return
    # Both falsy -> equal, per `ts/src/test/tests.ts:1090` (see
    # `_static_js_falsy` in `static_request.jl`). Containers are never falsy in
    # JS, so this only short-circuits scalars: a computed `nothing` matches a
    # stored `0`/`false`/`""` exactly as the reference JS runner accepts them.
    (_static_js_falsy(newv) && _static_js_falsy(storedv)) && return
    if _static_isdict(storedv) && _static_isdict(newv)
        sk = collect(keys(storedv))
        for k in sk
            string(k) in skipKeys && continue
            if !haskey(newv, k)
                push!(errs, "$path: missing key $k")
                continue
            end
            static_compare_response(newv[k], storedv[k], skipKeys, "$path.$k", errs)
        end
        return
    end
    if _static_islist(storedv) && _static_islist(newv)
        if length(storedv) != length(newv)
            push!(errs, "$path: length mismatch $(length(newv)) != $(length(storedv))")
            return
        end
        for i in eachindex(storedv)
            static_compare_response(newv[i], storedv[i], skipKeys, "$path[$i]", errs)
        end
        return
    end
    newv === storedv && return
    # Numbers first: `50` and `50.0` are the same value stored differently.
    a = newv isa Number ? float(newv) : (newv isa AbstractString ? tryparse(Float64, newv) : nothing)
    b = storedv isa Number ? float(storedv) : (storedv isa AbstractString ? tryparse(Float64, storedv) : nothing)
    if a !== nothing && b !== nothing
        a == b || push!(errs, "$path: $(repr(newv)) != $(repr(storedv))")
        return
    end
    string(newv) == string(storedv) || push!(errs, "$path: $(repr(newv)) != $(repr(storedv))")
end

"""
    static_response_testset(id)

Run every recorded response fixture for exchange `id`, comparing the parsed
structure against the stored one.

Scoped per exchange for the same reason as
[`static_request_testset`](@ref): it lets the suite shard the work and lets a
single exchange be re-run on its own while iterating on its parsers.
"""
function static_response_testset(id::AbstractString)
    cls = fixture_exchange_class(id)
    @testset "static response fixtures: $id" begin
        data = _static_loadjson(joinpath(STATIC_RESPONSE_ROOT, "response", id * ".json"))
        skipKeys = String[string(k) for k in get(data, :skipKeys, Any[])]
        # `info` mirrors the raw payload verbatim; it is intentionally not
        # part of the unified contract, and the TS runner skips it too.
        push!(skipKeys, "info")
        globalOptions = get(data, :options, Dict{Symbol,Any}())
        methods_ = get(data, :methods, Dict{Symbol,Any}())
        for (mname, entries) in methods_
            for entry in entries
                get(entry, :disabled, false) === true && continue
                desc = String(get(entry, :description, ""))
                stored = get(entry, :parsedResponse, nothing)
                stored === nothing && continue
                ex = static_init_offline(id, cls)
                # No proxy here: unlike the request tests we *want* the call
                # to complete, against the stubbed transport.
                ex.httpProxy = nothing
                ex.httpsProxy = nothing
                Ccxt.extendExchangeOptions(ex, globalOptions)
                entryOptions = get(entry, :options, nothing)
                entryOptions !== nothing && Ccxt.extendExchangeOptions(ex, entryOptions)
                static_mock_http!(ex, get(entry, :httpResponse, nothing))
                errs = String[]
                computed = nothing
                try
                    computed = getproperty(ex, Symbol(mname))(_static_sanitize(get(entry, :input, nothing))...)
                catch e
                    push!(errs, "call raised " * sprint(showerror, e)[1:min(end, 250)])
                end
                if isempty(errs)
                    static_compare_response(computed, stored, skipKeys, string(mname), errs)
                end
                @test isempty(errs) || error("[$id][$mname][$desc] " * join(errs, "; "))
            end
        end
    end
end
