module Ccxt
__precompile__(false)

# TS string concatenation `a + b` is transpiled to Julia `+`; Julia uses `*`.
# Fall back to Base.:+ for all other types (numbers, etc.).
+(a::AbstractString, b::AbstractString) = a * b
+(a, b) = Base.:(+)(a, b)
+(a, b, c) = Base.:(+)(a, b, c)
+(a, b, c, d...) = Base.:(+)(a, b, c, d...)

include("TypeAliases.jl")
include("CCXTBase.jl")
include("Precise.jl")
include("Errors.jl")
include("functions.jl")
using .functions
using .functions: objectAssign, objectKeys, objectValues, objectEntries, ccxt_then, ccxtruthy, concat, getOwnPropertyNames, ccxt_unCamelCaseProperties, ccxt_Object, ccxt_Object_prototype, getPrototypeOf, ccxt_getOwnPropertyNames, ccxt_toNumber, ccxt_in, ccxt_lt, ccxt_gt, ccxt_le, ccxt_ge, ccxt_isArray, ccxt_parseInt, ccxt_find, ccxt_splice, ccxt_indexOf
export functions
include("wsbase.jl")
# `PreciseArith` exports short arithmetic names (`min`, `max`, `abs`, `div`,
# `add`, `sub`, `gt`, …) that collide with `Base`. A blanket
# `using .PreciseArith` makes every one of them ambiguous inside `Ccxt`, so a
# transpiled `min(limit, maxLimit)` in an exchange fails at runtime with
# "UndefVarError: `min` not defined in `Ccxt`". Import only the names the
# transpiled code actually calls at this scope: the `Precise` type itself
# (transpiled `new Precise (x)` becomes `Precise(x)`), the `string*` wrappers,
# and `reduce` (applied to a `Precise` by bitget/phemex — the explicit import
# deliberately shadows `Base.reduce`, which nothing at this scope uses).
# The rounding-mode constants are not imported here; `BaseMethods.jl` already
# binds them from `functions`, and an imported name cannot be reassigned.
#
# The module deliberately does NOT share the type's name: a submodule binding
# outranks anything `using` brings in, so a `module Precise` would leave the
# bare name `Precise` pointing at the module and make `Precise(x)` fail with
# "objects of type Module are not callable". See the header of `Precise.jl`.
using .PreciseArith: Precise, reduce,
    stringMul, stringDiv, stringAdd, stringSub, stringAbs, stringNeg,
    stringMod, stringOr, stringEquals, stringEq, stringMin, stringMax,
    stringGt, stringGe, stringLt, stringLe
using JSON3

include("BaseMethods.jl")
include("runtime.jl")
include("exchanges.jl")

# JS allows property access on `undefined`/`null` to yield `undefined`
# (e.g. `this.options.newUpdates` when `options` is still null). In Julia
# `nothing` has no fields, so we return `nothing` for any property access.
Base.getproperty(::Nothing, ::Symbol) = nothing

export Exchange, Alpaca, Apex, Aster, Backpack, Bequant, Bigone, Binance, Binancecoinm, Binanceus, Binanceusdm, Bingx, Bit2c, Bitbank, Bitbns, Bitfinex, Bitflyer, Bitget, Bithumb, Bitmart, Bitmex, Bitopro, Bitrue, Bitso, Bitstamp, Bitteam, Bittrade, Bitvavo, Blockchaincom, Blofin, Btcbox, Btcmarkets, Btcturk, Bullish, Bybit, Bybiteu, Bydfi, Cex, Coinbase, Coinbaseexchange, Coinbaseinternational, Coincheck, Coinex, Coinmate, Coinone, Coinsph, Coinspot, Cryptocom, Cryptomus, Deepcoin, Delta, Deribit, Derive, Digifinex, Dydx, Exmo, Extended, Fmfwio, Foxbit, Gate, Gateeu, Gemini, Grvt, Hashkey, Hibachi, Hitbtc, Hollaex, Htx, Hyperliquid, Independentreserve, Indodax, Kraken, Krakenfutures, Kucoin, Kucoineu, Kucoinfutures, Latoken, Lbank, Lighter, Luno, Mercado, Mexc, Modetrade, Mudrex, Myokx, Ndax, Okx, Okxus, Onetrading, P2b, Pacifica, Paradex, Paymium, Phemex, Poloniex, Tokocrypto, Toobit, Upbit, Weex, Whitebit, Woo, Woofipro, Xt, Zaif, Zebpay
end
