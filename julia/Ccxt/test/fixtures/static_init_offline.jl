# Offline exchange construction helper, shared by the static fixture tests and
# the validator driver. Split out of `static_request.jl` so the `validators_pass`
# group can depend on this cheap include alone — without pulling in the large
# 748-entry static-request @testset that `static_request.jl` also contains.

using Ccxt
using JSON3
const _OFFLINE_FIXTURE_ROOT = joinpath(@__DIR__)

# The exchanges the static fixtures cover. Each needs a `markets/<id>.json` and
# `currencies/<id>.json` here alongside its `request/<id>.json` and
# `response/<id>.json`.
#
# Declared once, in the cheapest include, because all three fixture-driven
# layers need the same id -> class mapping: the request tests, the response
# tests and the unified-method driver. Each of those runs one exchange at a
# time (see `test/runtests.jl`), so they need to look a class up by id rather
# than just iterate the list.
const FIXTURE_EXCHANGES = Pair{String,Any}[
    "binance"  => Ccxt.Binance,
    "kraken"   => Ccxt.Kraken,
    "bybit"    => Ccxt.Bybit,
    "okx"      => Ccxt.Okx,
    "coinbase" => Ccxt.Coinbase,
]

const FIXTURE_EXCHANGE_IDS = String[first(p) for p in FIXTURE_EXCHANGES]

"""
    fixture_exchange_class(id) -> type

The exchange class recorded for `id` in [`FIXTURE_EXCHANGES`](@ref).
"""
function fixture_exchange_class(id::AbstractString)
    for (name, cls) in FIXTURE_EXCHANGES
        name == id && return cls
    end
    error("no fixture exchange registered under `$id`; known: " *
          join(FIXTURE_EXCHANGE_IDS, ", "))
end

_static_tosym(v) = v
_static_tosym(v::AbstractDict) = Dict{Symbol,Any}(Symbol(k) => _static_tosym(x) for (k, x) in v)
_static_tosym(v::AbstractVector) = Any[_static_tosym(x) for x in v]

_static_loadjson(path) = _static_tosym(JSON3.read(read(path, String), Dict{String,Any}))

"""
    static_init_offline(id, cls) -> exchange

Build an exchange preloaded with the recorded markets and currencies and with
dummy credentials, so private endpoints sign without hitting the network. The
two conflicting proxy settings guarantee `fetch` throws before any socket is
opened, leaving the fully-built request in `last_request_url`/`last_request_body`.
"""
function static_init_offline(id::AbstractString, cls)
    markets = _static_loadjson(joinpath(_OFFLINE_FIXTURE_ROOT, "markets", id * ".json"))
    currencies = _static_loadjson(joinpath(_OFFLINE_FIXTURE_ROOT, "currencies", id * ".json"))
    ex = cls()
    ex.enableRateLimit = false
    ex.rateLimit = 1
    ex.httpProxy = "http://fake:8080"
    ex.httpsProxy = "http://fake:8080"
    ex.apiKey = "key"
    ex.secret = "secretsecret"
    ex.password = "password"
    ex.walletAddress = "wallet"
    ex.privateKey = "0xff3bdd43534543d421f05aec535965b5050ad6ac15345435345435453495e771"
    ex.uid = "uid"
    ex.token = "token"
    ex.login = "login"
    ex.accountId = "12345"
    ex.accounts = Any[Dict{Symbol,Any}(:id => "myAccount", :code => "USDT"),
                      Dict{Symbol,Any}(:id => "myAccount", :code => "USDC")]
    Ccxt.extendExchangeOptions(ex, Dict{Symbol,Any}(
        :enableUnifiedAccount => true,
        :enableUnifiedMargin => false,
        :accessToken => "token",
        :expires => 999999999999999,
        :leverageBrackets => Dict{Symbol,Any}(),
    ))
    Ccxt.setMarkets(ex, markets; currencies=currencies)
    ex.currencies = currencies
    return ex
end
