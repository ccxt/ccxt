# Static request-fixture tests — the Julia port of `testRequestStatically` in
# `ts/src/test/tests.ts` (and of `npm run request-js` / `request-py` / …).
#
# For every entry in `test/fixtures/request/<exchange>.json` the exchange method
# is invoked offline and the request it *would* have sent is compared against
# the recorded URL and body. Nothing touches the network: the exchange is
# constructed with two conflicting proxy settings so the base `fetch` raises
# `InvalidProxySettings` right after the request has been signed and recorded
# in `last_request_url` / `last_request_body`. That is exactly the trick the TS
# runner uses, and it is what makes these tests a pure offline regression net
# over signing, parameter serialisation and URL construction.
#
# This file only *defines* the checks; `static_request_testset(id)` runs one
# exchange. `test/runtests.jl` exposes each exchange as its own group
# (`request_binance`, `request_kraken`, …) so the 748 entries can be run in
# shards rather than as one 34-second block — see the group table there.

using Test
using Ccxt
using JSON3

const STATIC_REQUEST_ROOT = joinpath(@__DIR__)

# The offline-construction helper, the JSON loaders and the `FIXTURE_EXCHANGES`
# registry. Also included directly by the `fixtures_init` group, and `include`
# is idempotent enough here (plain function/const definitions) that loading it
# twice is harmless.
include("static_init_offline.jl")

# ---------------------------------------------------------------------------
# JSON loading
#
# JSON3 hands back its own immutable views keyed by `String`; transpiled CCXT
# code indexes everything with `Symbol` keys and mutates freely, so every object
# is converted to a plain `Dict{Symbol,Any}` and every array to `Any[]` — see
# `_static_tosym` in `static_init_offline.jl`.
# ---------------------------------------------------------------------------

function _static_parsejson(s::AbstractString)
    t = strip(s)
    startswith(t, "[") && return _static_tosym(JSON3.read(t, Vector{Any}))
    return _static_tosym(JSON3.read(t, Dict{String,Any}))
end

# ---------------------------------------------------------------------------
# Offline exchange construction
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Comparison helpers — ports of `assertNewAndStoredOutput` / `removeHostnamefromUrl`
# / `urlencodedToDict` in `ts/src/test/tests.ts`.
# ---------------------------------------------------------------------------

"""
    static_remove_hostname(url) -> String

Strip scheme and host, keeping only the path (up to any query string). Stored
fixtures were captured against whichever host the recording session used
(testnet, a regional domain, …), so only the path is compared.
"""
function static_remove_hostname(url)
    url === nothing && return nothing
    parts = split(url, '/')
    res = ""
    for i in 3:(length(parts) - 1)
        cur = parts[i + 1]
        q = findfirst('?', cur)
        if q !== nothing
            res *= "/" * cur[1:(q - 1)]
            break
        end
        res *= "/" * cur
    end
    return res
end

"""
    static_urlencoded_to_dict(query) -> Dict{Symbol,Any}

Split an `a=1&b=2` query string into a dict so ordering differences between
languages do not cause spurious failures. Values that look like JSON are
parsed so nested structures compare structurally rather than textually.
"""
function static_urlencoded_to_dict(url)
    result = Dict{Symbol,Any}()
    url === nothing && return result
    for part in split(url, '&')
        kv = split(part, '=')
        length(kv) == 2 || continue
        key, value = kv[1], kv[2]
        v = String(value)
        if startswith(v, "[") || startswith(v, "{")
            try
                v = _static_parsejson(v)
            catch
                # not JSON after all — compare as the raw string
            end
        end
        result[Symbol(key)] = v
    end
    return result
end

_static_isdict(x) = x isa AbstractDict
_static_islist(x) = x isa AbstractVector

"""
    _static_js_falsy(x) -> Bool

Whether `x` is falsy under JavaScript's rules: `false`, `0` (any numeric
zero), `NaN`, `""`, `null` and `undefined`. Everything else — including empty
arrays and empty objects — is truthy.

This mirrors the second early-return in `assertNewAndStoredOutputInner`
(`ts/src/test/tests.ts:1090`):

```ts
if (!newOutput && !storedOutput) {
    return true;
}
```

which the reference runner applies to *both* request and response comparisons.
It is what lets a computed `undefined` match a stored `0` or `false`: the JSON
fixtures are generated from the JS implementation, where a parser that leaves a
field unset writes `null`, but a numeric `0`/boolean `false` recorded from an
earlier capture is equally falsy and therefore accepted. Without this rule the
Julia port reported spurious mismatches (`hedged: nothing != false`,
`maintenanceMarginPercentage: nothing != 0`) on values where the reference JS
implementation also computes `undefined` — verified by calling
`parsePosition` directly against `js/ccxt.js`.
"""
function _static_js_falsy(x)
    x === nothing && return true
    x === false && return true
    x isa Number && return (x == 0) || isnan(float(x))
    x isa AbstractString && return isempty(x)
    return false
end

"""
    static_compare(computed, stored, skipKeys, path, errs)

Recursively compare a computed request against the stored fixture, appending a
human-readable message to `errs` for each mismatch. Keys listed in `skipKeys`
(nonces, timestamps, signatures — anything that legitimately varies per run)
are ignored, mirroring the `skipKeys` handling in the TS runner.
"""
function static_compare(newv, storedv, skipKeys, path, errs)
    if newv === nothing && storedv === nothing
        return
    end
    # Both falsy -> equal, per `ts/src/test/tests.ts:1090`. Containers are
    # never falsy in JS, so this only ever short-circuits scalars.
    if _static_js_falsy(newv) && _static_js_falsy(storedv)
        return
    end
    if _static_isdict(storedv) && _static_isdict(newv)
        sk = collect(keys(storedv))
        nk = collect(keys(newv))
        if length(sk) != length(nk)
            push!(errs, "$path: key count mismatch $(length(nk)) != $(length(sk)) " *
                        "new=$(sort(string.(nk))) stored=$(sort(string.(sk)))")
            return
        end
        for k in sk
            string(k) in skipKeys && continue
            if !haskey(newv, k)
                push!(errs, "$path: missing key $k")
                continue
            end
            static_compare(newv[k], storedv[k], skipKeys, "$path.$k", errs)
        end
        return
    end
    if _static_islist(storedv) && _static_islist(newv)
        if length(storedv) != length(newv)
            push!(errs, "$path: length mismatch $(length(newv)) != $(length(storedv))")
            return
        end
        for i in eachindex(storedv)
            static_compare(newv[i], storedv[i], skipKeys, "$path[$i]", errs)
        end
        return
    end
    newv === storedv && return
    if string(newv) != string(storedv)
        push!(errs, "$path: $(repr(newv)) != $(repr(storedv))")
    end
end

# `null` in a fixture's `input` array means "argument omitted" -> `nothing`.
_static_sanitize(input) = input === nothing ? Any[] : Any[x for x in input]

"""
    static_check_request_entry(ex, mname, entry, skipKeys, outputType) -> Vector{String}

Run one fixture entry and return the list of mismatches (empty when it passes).
"""
function static_check_request_entry(ex, mname, entry, skipKeys, outputType)
    errs = String[]
    try
        getproperty(ex, Symbol(mname))(_static_sanitize(get(entry, :input, nothing))...)
    catch e
        # `InvalidProxySettings` is the expected stop signal — the request was
        # built and recorded. Anything else means the request itself failed.
        if !(e isa Ccxt.InvalidProxySettings)
            push!(errs, "call raised " * sprint(showerror, e)[1:min(end, 250)])
            return errs
        end
    end
    url = ex.last_request_url
    body = ex.last_request_body
    storedUrl = get(entry, :url, nothing)
    storedOutput = get(entry, :output, nothing)
    if storedUrl != url
        static_compare(static_remove_hostname(url), static_remove_hostname(storedUrl), skipKeys, "url", errs)
    end
    if storedOutput === nothing && body === nothing
        # GET-style call: everything of interest is in the query string.
        sq = storedUrl === nothing ? nothing :
             (occursin('?', storedUrl) ? split(storedUrl, '?'; limit = 2)[2] : nothing)
        nq = url === nothing ? nothing :
             (occursin('?', url) ? split(url, '?'; limit = 2)[2] : nothing)
        if !(sq === nothing && nq === nothing)
            static_compare(static_urlencoded_to_dict(nq), static_urlencoded_to_dict(sq), skipKeys, "query", errs)
        end
    else
        so, no = storedOutput, body
        isJsonBody = outputType == "json" ||
            (outputType == "both" && so isa AbstractString && (startswith(so, "{") || startswith(so, "[")))
        if isJsonBody
            so isa AbstractString && (so = _static_parsejson(so))
            no isa AbstractString && (no = _static_parsejson(no))
        else
            so isa AbstractString && (so = static_urlencoded_to_dict(so))
            no isa AbstractString && (no = static_urlencoded_to_dict(no))
        end
        static_compare(no, so, skipKeys, "body", errs)
    end
    return errs
end

# ---------------------------------------------------------------------------
# The test set — one exchange per call
# ---------------------------------------------------------------------------

"""
    static_request_testset(id)

Run every enabled request fixture recorded for exchange `id`.

Scoped to a single exchange so the suite can shard it: binance alone carries
338 of the 748 entries, and running all five in one `@testset` made this the
longest single block in the run. `test/runtests.jl` registers one group per
exchange on top of this.
"""
function static_request_testset(id::AbstractString)
    cls = fixture_exchange_class(id)
    @testset "static request fixtures: $id" begin
        data = _static_loadjson(joinpath(STATIC_REQUEST_ROOT, "request", id * ".json"))
        skipKeys = String[string(k) for k in get(data, :skipKeys, Any[])]
        outputType = String(get(data, :outputType, "json"))
        globalOptions = get(data, :options, Dict{Symbol,Any}())
        methods_ = get(data, :methods, Dict{Symbol,Any}())
        for (mname, entries) in methods_
            for entry in entries
                get(entry, :disabled, false) === true && continue
                desc = String(get(entry, :description, ""))
                # A fresh instance per entry: fixtures carry per-entry
                # `options` that must not leak into the next case.
                ex = static_init_offline(id, cls)
                Ccxt.extendExchangeOptions(ex, globalOptions)
                entryOptions = get(entry, :options, nothing)
                entryOptions !== nothing && Ccxt.extendExchangeOptions(ex, entryOptions)
                errs = static_check_request_entry(ex, mname, entry, skipKeys, outputType)
                @test isempty(errs) || error("[$id][$mname][$desc] " * join(errs, "; "))
            end
        end
    end
end
