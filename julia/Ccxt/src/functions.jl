module functions

using Base64
using Dates
using JSON3


# ===========================================================================
# Ccxt-scoped accessors (NO global `Base` piracy on builtin types)
# ---------------------------------------------------------------------------
# The transpiled CCXT code relies on JavaScript object-access semantics:
#   * `get(x, Symbol(key), default)` must work for `Dict` (look up a Symbol
#     key), `Nothing` (return the default), `Module` (`getfield`/`nothing`),
#     and `AbstractVector` (0-based `Symbol` key → element, else default).
#   * `x.prop` on a `Dict`/`Nothing` whose key/field is absent must yield
#     `nothing` (JS `undefined`), not a `MethodError`.
#
# Loading `Ccxt` used to install these as global `Base.get` / `Base.getproperty`
# overrides on `Dict`, `Nothing`, `Module`, `AbstractVector` and `Symbol` — i.e.
# type piracy that silently changes the behaviour of those methods for every
# other package in the session. They are now plain `Ccxt.functions` helpers.
#
# To keep the (already-generated, ~725k-LOC) exchange tree unchanged, the
# helper names deliberately mirror `Base`: `ccxt_get` plays the role of `get`
# and `ccxt_getproperty` the role of `getproperty`. The module then binds
# *local* aliases `get` / `getproperty` to them, so every generated `get(...)`
# / `dict.prop` call site inside this module (and re-exported into `Ccxt` via
# `using .functions`) still resolves to the Ccxt implementation — without
# touching `Base` outside this module.
# ===========================================================================

# JS `ccxt.Exchange` / `ccxt["Binance"]` namespace lookups. The transpiled
# test code calls `get(ccxt, Symbol("Exchange"), nothing)` to resolve a class
# by name from the module. Map it to `getfield`.
function ccxt_get(m::Module, k::Symbol, default)
    return isdefined(m, k) ? getfield(m, k) : default
end

# JS `undefined.prop` is a TypeError, but `undefined?.prop` and — far more
# commonly in the transpiled output — a chained lookup whose intermediate step
# is absent both evaluate to `undefined`. The generator emits nested lookups
# such as `get(get(features, Symbol(marketType), nothing), Symbol(subType),
# nothing)` from TS that is only reached when the outer value exists, so the
# inner `get` can legitimately see `nothing`. Mirror the JS `undefined`.
function ccxt_get(::Nothing, key, default)
    return default
end

# JS `value[key]` on an array. The transpiler cannot always tell an array from
# an object at the call site, so it emits the object form
# `get(x, Symbol(key), default)` even when `x` turns out to be a Vector. In JS
# that access is legal: a numeric-looking key indexes the array (0-based) and
# anything else is `undefined`. Mirror both behaviours here instead of letting
# Julia raise `MethodError: no method matching get(::Vector, ::Symbol, ...)`.
#
# Restricted to the concrete `Vector` type (not `AbstractVector`): the
# WebSocket cache structs (`WsArray` family) are also `AbstractVector`s, but
# they need the richer `Base.get(a::WsArray, ...)` lookup (hashmap access,
# numeric-key rows) defined in `wsbase.jl`. The generic `ccxt_get` fallback
# below routes them to `Base.get`, so they must not be captured here.
function ccxt_get(v::Vector, k::Symbol, default)
    i = tryparse(Int, String(k))
    (i === nothing || i < 0 || i >= length(v)) && return default
    return v[i + 1]
end


# Generic fallback: `Base.get` already handles `AbstractDict`, `CcxtExchange`,
# `Exchange`, `Number`, `AbstractString` (via the overloads in `CCXTBase.jl` /
# `BaseMethods.jl`), so defer to it. The overloads above extend `Base.get` to
# the builtin types it does not cover (`Nothing` / `Module` / `AbstractVector`).
function ccxt_get(o, k, default)
    return Base.get(o, k, default)
end

# Property access on a `Dict`: `dict.prop` → `get(dict, Symbol("prop"), nothing)`,
# matching JS semantics where `undefined` is returned for missing keys.
# (Generated code rarely uses `dict.prop` — it prefers `get(dict, ...)` — but
# the helper keeps the semantics available without a global `Base` override.)
function ccxt_getproperty(d::Dict, key::Symbol)
    if hasfield(typeof(d), key)
        return getfield(d, key)
    end
    return ccxt_get(d, key, nothing)
end

# Property access on `nothing`: JS `undefined.prop` → `undefined`.
function ccxt_getproperty(::Nothing, key::Symbol)
    return nothing
end

# --- hand-written Julia helpers (no direct TS equivalent / Object.* mappings) ---
# Type aliases referenced by transpiled helpers (mirror TypeAliases.jl in the
# outer Ccxt module; the functions module is separate and cannot see them).
const ConstructorArgs = Any

# Returns true if function `f` is a `self`-method, i.e. its first argument is
# typed as a subtype of the abstract type used by our structs. Free functions
# take no `self` and are called directly. Used by getproperty closures.
function ccxt_takes_self(f::Function)
    for m in methods(f)
        sig = m.sig.parameters
        length(sig) >= 2 || continue
        arg1 = sig[2]
        (isa(arg1, Type) && arg1 === Throttler) && return true
    end
    return false
end
# Object.getOwnPropertyNames(obj) -> own property names as strings.
# Structs: their field names. Dicts: their keys. Dispatches on the arg type.
function getOwnPropertyNames(obj::Dict)
    return collect(string(k) for k in keys(obj))
end
function getOwnPropertyNames(obj)
    return collect(string(k) for k in fieldnames(typeof(obj)))
end
# Alias for compatibility
const ccxt_getOwnPropertyNames = getOwnPropertyNames
# snake_case -> camelCase (reverse of unCamelCase), used for property access
# fallback so both api_key and apiKey resolve to the same struct field.
function camelCase(s::AbstractString)
    parts = split(s, "_")
    isempty(parts) && return s
    return string(lowercase(parts[1]), join(uppercasefirst(lowercase(p)) for p in parts[2:end]))
end
# JS Object constructor sentinel (used by constructor()/isObject checks).
# Matches the transpiled 'const Object = :__js_Object__' so that
# 'constructor(x) == ccxt_Object' identifies plain Dicts, and
# 'get(ccxt_Object, :prototype, nothing)' yields nothing (Object.prototype).
const ccxt_Object = :__js_Object__
ccxt_get(s::Symbol, k::Symbol, default) = (s === :__js_Object__) ? nothing : default
const ccxt_Object_prototype = nothing
# JS Array/string concat: concat(a, b, ...) -> vcat for arrays, string join for strings.
function concat(args...)
    if length(args) == 0
        return []
    end
    if all(a -> a isa AbstractString, args)
        return string(args...)
    end
    result = []
    for a in args
        if a isa AbstractArray
            append!(result, a)
        else
            push!(result, a)
        end
    end
    return result
end
# JS `+` emulation. In JavaScript `+` is overloaded: when either operand is a
# string the result is string concatenation; otherwise it is numeric addition.
# The transpiler emits `a + b` for both, so the generated CCXT code relies on
# that overload. Julia's `Base.+` does NOT concatenate strings, so without this
# shim `url += string("/", path)` raises MethodError. We bind a Ccxt-scoped `+`
# alias (see `Ccxt.jl`) that routes here — this is a Ccxt-local helper, NOT a
# global `Base.:+` override, so loading Ccxt does not pirate `+` for the rest
# of the session (the way the old `+(::AbstractString, ::AbstractString)`
# pirate did).
function ccxt_plus(a, b)
    if (a isa AbstractString) || (b isa AbstractString)
        return string(a, b)
    end
    # NB: `Base.:+(a, b)` — the `:+` (regular addition), NOT `Base.+(a, b)`
    # which is the *broadcasted* `.+` operator and returns a lazy `Broadcasted`
    # that corrupts downstream indexing (e.g. `i + 1` used as an array index
    # in `unCamelCaseProperties`).
    return Base.:(+)(a, b)
end
# JS Promise continuation: p.then(onResolve, onReject).
# p may be a Task (from @async) or an already-resolved value.
# Returns a new Task mirroring the JS Promise chain.
function ccxt_then(p, onResolve=nothing, onReject=nothing)
    return @async begin
        local value
        try
            if p isa Task
                value = Base.fetch(p)
            else
                value = p
            end
            if onResolve !== nothing
                onResolve(value)
            else
                value
            end
        catch err
            if onReject !== nothing
                onReject(err)
            else
                rethrow(err)
            end
        end
    end
end
# Synchronous Promise chain: call onResolve(value) or onReject(error) immediately.
# Used by the transpiler when transpiling in --sync mode (async: false).
function ccxt_then_sync(p, onResolve=nothing, onReject=nothing)
    if onResolve !== nothing
        return onResolve(p)
    end
    return p
end

# catch_var(func, onReject=nothing) - synchronous try/catch wrapper.
# Used by transpiled code for `catch(e) { ... }` blocks.
function catch_var(f, onReject=nothing)
    try
        return f()
    catch e
        if onReject !== nothing
            return onReject(e)
        else
            rethrow(e)
        end
    end
end

# JS-safe relational comparison: `undefined < x` -> `false` in JS without throwing.
# Julia's `<` throws on Nothing operands, so route through these helpers.
function ccxt_lt(a, b)
    (a === nothing || b === nothing) && return false
    return a < b
end
function ccxt_gt(a, b)
    (a === nothing || b === nothing) && return false
    return a > b
end
function ccxt_le(a, b)
    (a === nothing || b === nothing) && return false
    return a <= b
end
function ccxt_ge(a, b)
    (a === nothing || b === nothing) && return false
    return a >= b
end
# JS `in` operator: `key in obj` checks property membership.
# Julia `in` tests Pair membership, so emit haskey for Dicts/arrays.
function ccxt_in(x, obj)
    obj === nothing && return false
    # Array index membership: JS `key in arr` is 0-based (`0 <= key < length`).
    if obj isa AbstractVector
        return (x isa Integer) && (0 <= x < length(obj))
    end
    haskey(obj, x) && return true
    # Transpiler emits Dict{Symbol, Any} keys but lookup may use String.
    # Try the inverse key type.
    if x isa AbstractString
        return haskey(obj, Symbol(x))
    elseif x isa Symbol
        return haskey(obj, string(x))
    end
    return false
end
# JS `parseInt` port: parse string to integer, return nothing on failure.
function ccxt_parseInt(x, radix=10)
    x === nothing && return nothing
    x isa Integer && return Int(x)
    x isa Real && return isfinite(x) ? Int(trunc(x)) : nothing
    s = strip(string(x))
    # JS `parseInt` accepts a leading sign, including an explicit '+' (which
    # shows up in exponent strings like the "+27" of "7e+27").
    m = radix == 16 ? match(r"^[+-]?(?:0[xX])?[0-9a-fA-F]+", s) : match(r"^[+-]?\d+", s)
    m === nothing && return nothing
    text = m.match
    if radix == 16
        text = replace(text, r"0[xX]" => "")
    end
    return tryparse(Int, text; base=radix)
end
# JS `String.prototype.charAt(n)` -> Julia `s[n+1]` (JS 0-indexed, Julia 1-indexed).
function charAt(s::AbstractString, n)
    idx = n + 1
    return idx > 0 && idx <= length(s) ? s[idx] : ""
end
charAt(s, n) = ""
# --- JS-truthiness emulation (required by the Julia transpiler) ---
# Julia's if/&&/|| demand a real Bool; JS uses truthiness (false for
# undefined/null/false/0/""/NaN). ccxtruthy reproduces JS semantics so the
# transpiler can wrap every condition in functions.ccxtruthy(...).
function ccxtruthy(x)
    return (x !== nothing) && (x !== false) && !(isa(x, Number) && (x == 0)) && !(isa(x, AbstractString) && (x == ""))
end
macro ccxt_or(a, b)
    return :(let _a = $(esc(a)); ccxtruthy(_a) ? _a : $(esc(b)); end)
end
macro ccxt_and(a, b)
    return :(let _a = $(esc(a)); ccxtruthy(_a) ? $(esc(b)) : _a; end)
end
function objectAssign(target, sources...)
    for src in sources
        if src isa Dict
            for (k, v) in src
                target[k] = v
            end
        end
    end
    return target
end
function objectKeys(obj)
    return collect(string(k) for k in Base.keys(obj))
end
function objectValues(obj)
    return collect(v for v in Base.values(obj))
end
function objectEntries(obj)
    return collect(p for p in Base.pairs(obj))
end
function utf8encode(s::AbstractString)
    return Vector{UInt8}(s)
end
function utf8decode(b::AbstractVector{UInt8})
    return String(b)
end
function base16encode(b::AbstractVector{UInt8})
    return bytes2hex(b)
end
function base16decode(s::AbstractString)
    return hex2bytes(s)
end
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
function base58encode(data::AbstractVector{UInt8})
    zeros = 0
    i = 1
    while i <= length(data) && data[i] == 0x00
        zeros += 1
        i += 1
    end
    digits = BigInt(0)
    for b in data
        digits = digits * 256 + Int(b)
    end
    result = ""
    while digits > 0
        digits, rem = divrem(digits, 58)
        result = BASE58_ALPHABET[rem + 1] * result
    end
    return "1"^zeros * result
end
function base58decode(s::AbstractString)
    zeros = 0
    i = 1
    while i <= length(s) && s[i] == '1'
        zeros += 1
        i += 1
    end
    num = BigInt(0)
    for c in s
        idx = findfirst(==(c), BASE58_ALPHABET)
        isnothing(idx) && error("invalid base58 character: " * string(c))
        num = num * 58 + (idx - 1)
    end
    bytes = UInt8[]
    while num > 0
        num, rem = divrem(num, 256)
        push!(bytes, UInt8(rem))
    end
    reverse!(bytes)
    return vcat(fill(0x00, zeros), bytes)
end

# --- crypto-dependent helpers (crypto.ts is skipped by the transpiler) ---
# --- Julia platform globals (window/process do not exist in Julia) ---
window = nothing
process = nothing
isBrowser = false
isWebWorker = false
isDeno = false
isElectron = false
isBun = false
isNode = false
isWeb = false
self = nothing
WorkerGlobalScope = nothing
Deno = nothing

# --- Date (port of the JS Date object used throughout CCXT) ---
struct Date
    ms::Int
end
Date() = Date(Int(round(Dates.datetime2unix(Dates.now()) * 1000)))
Date(ts::Real) = Date(Int(ts))
_dt(d::Date) = Dates.unix2datetime(d.ms / 1000)
function Base.getproperty(::Type{Date}, name::Symbol)
    if name === :now
        return () -> Date(Int(round(Dates.datetime2unix(Dates.now()) * 1000)))
    elseif name === :parse
        return (x) -> parse(Date, x)
    elseif name === :UTC
        return (y, m, d, h=0, mi=0, s=0, ms=0) ->
            Date(Int(round(Dates.datetime2unix(Dates.DateTime(y, m, d, h, mi, s)) * 1000)) + Int(ms))
    else
        return nothing
    end
end
function Base.parse(::Type{Date}, x)
    dt = try Dates.DateTime(s) catch; Dates.DateTime(replace(s, "T" => " ")) end
    return Date(Int(round(Dates.datetime2unix(dt) * 1000)))
end
function getTime(d::Date)
    return d.ms
end
function getUTCDate(d::Date)
    return Dates.day(_dt(d))
end
function getUTCFullYear(d::Date)
    return Dates.year(_dt(d))
end
function getUTCMonth(d::Date)
    return Dates.month(_dt(d)) - 1
end
function getUTCDay(d::Date)
    return Dates.dayofweek(_dt(d)) % 7
end
function getUTCHours(d::Date)
    return Dates.hour(_dt(d))
end
function getUTCMinutes(d::Date)
    return Dates.minute(_dt(d))
end
function getUTCSeconds(d::Date)
    return Dates.second(_dt(d))
end
function toISOString(d::Date)
    return Dates.format(_dt(d), "yyyy-mm-ddTHH:MM:SS.sssZ")
end

# --- Timers (synchronous Julia port of the JS timer helpers) ---
# NOTE: `Base.sleep` must be spelled out. This module defines its own
# JS-flavoured `sleep(ms)` further down, and an unqualified `sleep` here would
# resolve to that one and recurse back into `setTimeout_safe`.
setTimeout(f, ms) = (Base.sleep(Float64(ms) / 1000.0); f())
clearTimeout(_) = nothing

# --- AbortController / abort (synchronous Julia port) ---
# The transpiled `fetch` path builds an `AbortController` and wires a `setTimeout`
# that calls `abort(controller)` after `self.timeout` ms. In the synchronous
# Julia backend `setTimeout` already blocks (via `Base.sleep`) before the
# request returns, so the abort signal is never inspected mid-flight. We model
# `AbortController` as a trivial placeholder Dict carrying a `:signal` entry, so
# the transpiled `get(controller, Symbol("signal"), nothing)` lookup resolves
# natively, and `abort` as a no-op. The transpiled code only calls
# `AbortController()` (a 0-arg constructor) and never names the type directly.
function AbortController()
    return Dict{Symbol, Any}(Symbol("signal") => Dict{Symbol, Any}())
end
abort(_) = nothing

# --- JS Error base type ---
const Error = ErrorException

ccxt_isArray(x) = x isa AbstractArray

# --- JS `for (const k in obj)` ------------------------------------------------
#
# JS `for...in` enumerates *keys*, and it does so for arrays too, where the keys
# are the stringified indices "0", "1", ... . Julia's iteration protocol yields
# values for a vector and `key => value` pairs for a dict, so neither maps onto
# `for...in` directly. `ccxt_forin` normalises both to a vector of JS-shaped
# keys, letting the transpiler emit one uniform `for k in ccxt_forin(x)` loop
# that behaves identically whichever runtime type `x` turns out to be — the same
# ambiguity the `Base.get(::AbstractVector, ::Symbol, default)` shim above
# resolves on the read side.
#
# Keys are returned as `String` because the transpiled body immediately does
# `get(obj, Symbol(k), nothing)`, and because JS compares them as strings
# (`if (prop === 'hashmap')`).
ccxt_forin(x::AbstractDict) = String[string(k) for k in Base.keys(x)]
ccxt_forin(x::AbstractArray) = String[string(i - 1) for i in 1:length(x)]
ccxt_forin(x::AbstractString) = String[string(i - 1) for i in 1:length(x)]
ccxt_forin(::Nothing) = String[]
# Fallback for any other value: JS `for...in` over a primitive yields nothing,
# while a struct-like object yields its own property names.
function ccxt_forin(x)
    if isstructtype(typeof(x))
        return String[string(f) for f in fieldnames(typeof(x))]
    end
    return String[]
end

# --- JS Number.* semantics: return false (not error) for non-numeric inputs ---
Base.isfinite(x::Any) = false
Base.isnan(x::Any) = false
Base.isinteger(x::Any) = false


ccxt_toNumber(x) = x isa AbstractString ? parse(Float64, x) : (x isa Number ? x : Float64(x))

# --- JS Math.* / String.prototype.* / Uint8Array shims -------------------------
#
# The transpiler emits these JS built-ins verbatim; they have no Julia
# equivalent under the same name, so they are defined here once.

# `Math.pow (base, exponent)`. JS always works in Float64, and a negative
# integer exponent must not throw the way Julia's integer `^` does.
pow(base, exponent) = Float64(base) ^ Float64(exponent)

# `new Uint8Array (n)` allocates n zeroed bytes; `new Uint8Array (bytes)` wraps
# an existing byte sequence. Used as a mutable char buffer in number.ts.
Uint8Array() = UInt8[]
Uint8Array(n::Integer) = zeros(UInt8, n)
Uint8Array(data::AbstractVector) = Vector{UInt8}(data)
Uint8Array(s::AbstractString) = Vector{UInt8}(codeunits(s))
const ArrayBuffer = Vector{UInt8}

# A 0-indexed view over a Julia vector. The character-buffer arithmetic in
# `_decimalToPrecision` is written against JS array indices, where the first
# element is `[0]`; rebasing every index inline is where off-by-one bugs creep
# in, so the buffer itself is made 0-based instead.
struct _Buf{T}
    data::Vector{T}
end
Base.getindex(b::_Buf, i::Integer) = b.data[i + 1]
Base.setindex!(b::_Buf, v, i::Integer) = (b.data[i + 1] = v)
Base.length(b::_Buf) = length(b.data)

# `String.fromCharCode (...codes)` — build a string from character codes.
fromCharCode(codes...) = String(UInt8[UInt8(c) for c in codes])
fromCharCode(codes::AbstractVector) = String(UInt8[UInt8(c) for c in codes])

# `str.charCodeAt (i)` — JS is 0-indexed, Julia is 1-indexed.
function charCodeAt(s::AbstractString, i)
    units = codeunits(s)
    idx = Int(i) + 1
    return (idx >= 1 && idx <= length(units)) ? Int(units[idx]) : nothing
end

# `str.substring (start[, stop])` — 0-indexed, `stop` exclusive. JS coerces a
# boolean start to 0/1, which `numberToString` relies on.
function substring(s::AbstractString, start, stop=nothing)
    units = codeunits(s)
    n = length(units)
    a = clamp(Int(start isa Bool ? (start ? 1 : 0) : start), 0, n)
    b = stop === nothing ? n : clamp(Int(stop), 0, n)
    a > b && ((a, b) = (b, a))
    return String(units[(a + 1):b])
end

# `num.toFixed (digits)` — fixed-point notation, always `digits` decimals.
toFixed(x, digits=0) = Base.Ryu.writefixed(Float64(x), Int(digits))

# `Number.prototype.toString ()`. Julia and JS both print the shortest
# round-tripping decimal, but they format it differently: Julia writes
# `1.0e-7` and `7.0e27` where JS writes `1e-7` and `7e+27`, and the two
# disagree about when to switch to exponential notation at all. `numberToString`
# parses that textual form, so it has to be the JS one. Implements the
# `Number::toString` algorithm from the ECMAScript spec (§6.1.6.1.20).
function _jsNumberToString(x::Real)
    x isa Integer && return string(x)
    v = Float64(x)
    isnan(v) && return "NaN"
    isinf(v) && return v > 0 ? "Infinity" : "-Infinity"
    v == 0 && return "0"
    sign = v < 0 ? "-" : ""
    s = string(abs(v))
    # Decompose Julia's rendering into `0.<digits> * 10^n`.
    mantissa, _, expstr = partition_exp(s)
    e10 = isempty(expstr) ? 0 : parse(Int, expstr)
    dot = findfirst('.', mantissa)
    intpart = dot === nothing ? mantissa : mantissa[1:(dot - 1)]
    fracpart = dot === nothing ? "" : mantissa[(dot + 1):end]
    digits = intpart * fracpart
    n = length(intpart) + e10
    while length(digits) > 1 && first(digits) == '0'
        digits = digits[2:end]
        n -= 1
    end
    while length(digits) > 1 && last(digits) == '0'
        digits = digits[1:(end - 1)]
    end
    k = length(digits)
    if k <= n <= 21
        return sign * digits * repeat("0", n - k)
    elseif 0 < n <= 21
        return sign * digits[1:n] * "." * digits[(n + 1):end]
    elseif -6 < n <= 0
        return sign * "0." * repeat("0", -n) * digits
    end
    # Exponential form: one digit, optional fraction, then a signed exponent.
    head = string(digits[1]) * (k > 1 ? "." * digits[2:end] : "")
    e = n - 1
    return sign * head * "e" * (e >= 0 ? "+" : "-") * string(abs(e))
end
_jsNumberToString(x) = string(x)

# Split "1.0e-7" into ("1.0", 'e', "-7"); returns an empty exponent when absent.
function partition_exp(s::AbstractString)
    i = findfirst(c -> c == 'e' || c == 'E', s)
    i === nothing && return (s, ' ', "")
    return (s[1:(i - 1)], s[i], s[(i + 1):end])
end

# --- JS Object / constructor plain-object check ---
const Object = :__js_Object__
constructor(x) = isa(x, AbstractDict) ? Object : nothing







concatBytes(args...) = reduce(vcat, Vector{UInt8}[Vector{UInt8}(a) for a in args]; init=UInt8[])

# `numberToBytesBE`/`numberToBytesLE` from `@noble/curves/utils.js`: render a
# (big) integer as exactly `padding` bytes, most/least significant byte first.
function numberToBytesBE(n, padding)
    v = BigInt(n)
    len = Int(padding)
    bytes = zeros(UInt8, len)
    for i in len:-1:1
        bytes[i] = UInt8(v & 0xff)
        v >>= 8
    end
    return bytes
end
numberToBytesLE(n, padding) = reverse(numberToBytesBE(n, padding))


using SHA

# --- hash algorithm selectors -------------------------------------------------
#
# In the TS source a hash algorithm is passed around as a *value* — the noble
# `CHash` function object, e.g. `hash (encode ('x'), sha256, 'hex')`. Julia has
# no equivalent, so each algorithm is represented by a small immutable struct
# that carries its name and digest length. `HashAlgorithm` is callable, so
# `sha256 (bytes)` still works the way `CHash` does in JS, and
# `sha256.outputLen` matches the property `jwt` reads.
struct HashAlgorithm
    name::String
    outputLen::Int
end
Base.show(io::IO, h::HashAlgorithm) = print(io, h.name)
Base.getproperty(h::HashAlgorithm, k::Symbol) =
    k === :outputLen ? getfield(h, :outputLen) :
    k === :name ? getfield(h, :name) : nothing

const md5      = HashAlgorithm("md5", 16)
const sha1     = HashAlgorithm("sha1", 20)
const sha256   = HashAlgorithm("sha256", 32)
const sha384   = HashAlgorithm("sha384", 48)
const sha512   = HashAlgorithm("sha512", 64)
const sha3_256 = HashAlgorithm("sha3-256", 32)
const sha3_512 = HashAlgorithm("sha3-512", 64)
const keccak   = HashAlgorithm("keccak256", 32)

# Keccak-256 (the pre-standard variant Ethereum uses). SHA.jl only ships the
# final FIPS-202 SHA-3, which differs from Keccak in one byte of padding
# (`0x01` instead of `0x06`), so the sponge is implemented here.
const _KECCAK_ROUND_CONSTANTS = UInt64[
    0x0000000000000001, 0x0000000000008082, 0x800000000000808a, 0x8000000080008000,
    0x000000000000808b, 0x0000000080000001, 0x8000000080008081, 0x8000000000008009,
    0x000000000000008a, 0x0000000000000088, 0x0000000080008009, 0x000000008000000a,
    0x000000008000808b, 0x800000000000008b, 0x8000000000008089, 0x8000000000008003,
    0x8000000000008002, 0x8000000000000080, 0x000000000000800a, 0x800000008000000a,
    0x8000000080008081, 0x8000000000008080, 0x0000000080000001, 0x8000000080008008,
]
const _KECCAK_ROTATIONS = [
    0 36  3 41 18;
    1 44 10 45  2;
   62  6 43 15 61;
   28 55 25 21 56;
   27 20 39  8 14
]

function _keccakF1600!(A::Matrix{UInt64})
    C = zeros(UInt64, 5)
    D = zeros(UInt64, 5)
    B = zeros(UInt64, 5, 5)
    for round in 1:24
        # θ
        for x in 1:5
            C[x] = A[x, 1] ⊻ A[x, 2] ⊻ A[x, 3] ⊻ A[x, 4] ⊻ A[x, 5]
        end
        for x in 1:5
            prev = C[mod1(x - 1, 5)]
            nxt = C[mod1(x + 1, 5)]
            D[x] = prev ⊻ bitrotate(nxt, 1)
        end
        for x in 1:5, y in 1:5
            A[x, y] ⊻= D[x]
        end
        # ρ and π
        for x in 1:5, y in 1:5
            nx = y
            ny = mod1(2 * (x - 1) + 3 * (y - 1) + 1, 5)
            B[nx, ny] = bitrotate(A[x, y], _KECCAK_ROTATIONS[x, y])
        end
        # χ
        for x in 1:5, y in 1:5
            A[x, y] = B[x, y] ⊻ (~B[mod1(x + 1, 5), y] & B[mod1(x + 2, 5), y])
        end
        # ι
        A[1, 1] ⊻= _KECCAK_ROUND_CONSTANTS[round]
    end
    return A
end

"Keccak-256 digest of `data`, as a 32-byte vector."
function keccak_256(data)
    msg = _utf8Bytes(data)
    rate = 136                                   # 1600 bits - 2*256 bits, in bytes
    padded = copy(msg)
    push!(padded, 0x01)                          # original Keccak padding
    while length(padded) % rate != 0
        push!(padded, 0x00)
    end
    padded[end] |= 0x80
    A = zeros(UInt64, 5, 5)
    for block in 1:rate:length(padded)
        chunk = padded[block:(block + rate - 1)]
        for i in 0:(rate ÷ 8 - 1)
            lane = UInt64(0)
            for j in 7:-1:0
                lane = (lane << 8) | UInt64(chunk[i * 8 + j + 1])
            end
            A[mod(i, 5) + 1, div(i, 5) + 1] ⊻= lane
        end
        _keccakF1600!(A)
    end
    out = UInt8[]
    for i in 0:3                                 # 32 bytes == 4 lanes
        lane = A[mod(i, 5) + 1, div(i, 5) + 1]
        for j in 0:7
            push!(out, UInt8((lane >> (8 * j)) & 0xff))
        end
    end
    return out
end
export keccak_256

# `utf8Bytes` in crypto.ts: strings become UTF-8 bytes, byte arrays pass through.
_utf8Bytes(data) = data isa AbstractString ? Vector{UInt8}(codeunits(data)) : Vector{UInt8}(data)

# MD5 (RFC 1321). SHA.jl does not ship one and several exchanges still sign
# with it, so it is implemented here rather than pulling in a dependency.
const _MD5_S = UInt32[
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]
const _MD5_K = UInt32[floor(UInt32, abs(sin(i)) * 2.0^32) for i in 1:64]
function _md5(message::Vector{UInt8})
    a0, b0, c0, d0 = 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476
    msg = copy(message)
    bitlen = UInt64(length(message)) * 8
    push!(msg, 0x80)
    while length(msg) % 64 != 56
        push!(msg, 0x00)
    end
    append!(msg, reinterpret(UInt8, [htol(bitlen)]))
    for chunk in 1:64:length(msg)
        m = [reinterpret(UInt32, msg[(chunk + 4j):(chunk + 4j + 3)])[1] |> ltoh for j in 0:15]
        A, B, C, D = a0, b0, c0, d0
        for i in 0:63
            if i < 16
                F = (B & C) | (~B & D); g = i
            elseif i < 32
                F = (D & B) | (~D & C); g = (5i + 1) % 16
            elseif i < 48
                F = B ⊻ C ⊻ D;         g = (3i + 5) % 16
            else
                F = C ⊻ (B | ~D);      g = (7i) % 16
            end
            F = F + A + _MD5_K[i + 1] + m[g + 1]
            A, D, C = D, C, B
            B = B + ((F << _MD5_S[i + 1]) | (F >> (0x20 - _MD5_S[i + 1])))
        end
        a0 += A; b0 += B; c0 += C; d0 += D
    end
    return reinterpret(UInt8, [htol(a0), htol(b0), htol(c0), htol(d0)])
end
_md5(s::AbstractString) = _md5(Vector{UInt8}(codeunits(s)))

# Normalise the algorithm argument: a `HashAlgorithm` value, or the plain string
# name that the per-exchange transpiled code passes.
_algoName(algo::HashAlgorithm) = algo.name
_algoName(algo::AbstractString) = String(algo)
_algoName(::Nothing) = "sha256"

function _ccxt_sha(algo, data)
    d = _utf8Bytes(data)
    name = _algoName(algo)
    if name == "sha1"; return SHA.sha1(d)
    elseif name == "sha256"; return SHA.sha256(d)
    elseif name == "sha384"; return SHA.sha384(d)
    elseif name == "sha512"; return SHA.sha512(d)
    elseif name == "md5"; return _md5(d)
    elseif name == "sha3-224"; return SHA.sha3_224(d)
    elseif name == "sha3-256"; return SHA.sha3_256(d)
    elseif name == "sha3-384"; return SHA.sha3_384(d)
    elseif name == "sha3-512"; return SHA.sha3_512(d)
    elseif name == "keccak256"; return keccak_256(d)
    else; error("unsupported hash algorithm: " * name)
    end
end

# Make an algorithm value callable, mirroring noble's `sha256 (bytes)`.
(h::HashAlgorithm)(data) = _ccxt_sha(h, data)

# Digest encoders — TS `encoders` map in crypto.ts:22-26.
function _encodeDigest(binary, digest)
    if digest == "hex"; return bytes2hex(binary)
    elseif digest == "base64"; return base64encode(binary)
    else; return binary
    end
end

function hash(request, algo=sha256, digest="hex")
    return _encodeDigest(_ccxt_sha(algo, request), digest)
end

function hmac(request, secret, algo=sha256, digest="hex")
    key = _utf8Bytes(secret)
    msg = _utf8Bytes(request)
    name = _algoName(algo)
    if name == "sha1"; h = SHA.hmac_sha1(key, msg)
    elseif name == "sha256"; h = SHA.hmac_sha256(key, msg)
    elseif name == "sha384"; h = SHA.hmac_sha384(key, msg)
    elseif name == "sha512"; h = SHA.hmac_sha512(key, msg)
    elseif name == "md5"; h = _hmac_generic(_md5, 64, key, msg)
    else; error("unsupported hmac algorithm: " * name)
    end
    return _encodeDigest(h, digest)
end

# Generic HMAC (RFC 2104) for algorithms SHA.jl does not provide directly.
function _hmac_generic(hashfn, blocksize::Int, key::Vector{UInt8}, msg::Vector{UInt8})
    k = length(key) > blocksize ? hashfn(key) : copy(key)
    append!(k, zeros(UInt8, blocksize - length(k)))
    return hashfn(vcat(k .⊻ 0x5c, hashfn(vcat(k .⊻ 0x36, msg))))
end

# CRC-32 (IEEE 802.3), a faithful port of `crc32` in crypto.ts:190-207. The
# `signed` flag reinterprets the result as a two's-complement Int32, which is
# what the TS tests assert against.
const _CRC32_TABLE = let table = zeros(UInt32, 256)
    for i in 0:255
        c = UInt32(i)
        for _ in 1:8
            c = (c & 0x00000001) != 0 ? (0xedb88320 ⊻ (c >> 1)) : (c >> 1)
        end
        table[i + 1] = c
    end
    table
end
function crc32(str, signed=false)
    crc = 0xffffffff
    for b in _utf8Bytes(str)
        crc = (crc >> 8) ⊻ _CRC32_TABLE[((crc ⊻ UInt32(b)) & 0xff) + 1]
    end
    unsigned = crc ⊻ 0xffffffff
    if ccxtruthy(signed) && unsigned >= 0x80000000
        # Note the plain Int literal: `0x100000000` is a UInt64 in Julia and
        # would promote the subtraction back to unsigned, wrapping the result.
        return Int(unsigned) - 4294967296
    end
    return Int(unsigned)
end

export hash, hmac, crc32, HashAlgorithm, md5, sha1, sha256, sha384, sha512,
    sha3_256, sha3_512, keccak


# ===== encode.ts =====
function json(data, params=nothing)
    return JSON3.write(data)
end

# --- JSON.stringify with a replacer ------------------------------------------
#
# `Exchange.jsonStringifyWithNull` is TS's
# `JSON.stringify (obj, (_, v) => (v === undefined ? null : v))`. The backend
# transpiles the call itself but has no equivalent for the replacer callback,
# and emits `JSON3.json(obj, function ... end)` — a function JSON3 does not
# have (it is `JSON3.write`, and it takes no replacer). The generator cannot
# express this, so the base method is redirected here by a post-pass in
# `build/juliaTranspileCLI.ts`.
#
# The replacer itself needs no port: `JSON3.write` already encodes `nothing`
# as `null`, which is exactly what it exists to do.
#
# One deliberate divergence from JS. Objects there iterate in insertion order,
# so `JSON.stringify` of two structurally-equal objects yields byte-identical
# text. A Julia `Dict` is a hash table with no ordering guarantee, so the same
# two dicts can serialize differently. The only consumer of this method is
# `deepEqual` in the shared test helpers, which compares the two strings, so
# keys are sorted recursively: the encoding becomes canonical and the
# comparison order-independent.
function jsonStringifyCanonical(value)
    if isa(value, AbstractDict)
        ks = sort!(String[string(k) for k in keys(value)])
        parts = String[]
        for k in ks
            push!(parts, string(JSON3.write(k), ":", jsonStringifyCanonical(value[_matchingJsonKey(value, k)])))
        end
        return string("{", join(parts, ","), "}")
    elseif isa(value, AbstractVector) && !isa(value, AbstractVector{UInt8})
        return string("[", join((jsonStringifyCanonical(v) for v in value), ","), "]")
    end
    return JSON3.write(value)
end

# Dict keys may be `Symbol` or `String` depending on where the value came from
# (`describe()` builds Symbol-keyed dicts, parsed JSON is materialised the same
# way, fixtures arrive String-keyed). Recover the original key object from its
# stringified form so the lookup succeeds either way.
function _matchingJsonKey(d::AbstractDict, k::String)
    for key in keys(d)
        string(key) == k && return key
    end
    return k
end

# --- JSON parsing -----------------------------------------------------------
#
# TS `JSON.parse` yields plain, mutable JS objects and arrays. `JSON3.read`
# instead returns lazy, *immutable* views (`JSON3.Object` / `JSON3.Array`).
# Those are not `Dict`s, so `isObject` rejects them and every `safe*` lookup
# silently returns the default — a parsed order book comes back with empty
# `bids`/`asks` rather than an error. They also cannot be mutated, which the
# transpiled parsers do freely.
#
# `ccxt_json_parse` therefore materialises the result into native containers:
# `Dict{Symbol,Any}` (matching the Symbol keys the transpiled code indexes
# with) and `Vector{Any}`. Scalars pass through unchanged.
_ccxt_json_materialize(v) = v
_ccxt_json_materialize(v::AbstractDict) =
    Dict{Symbol,Any}(Symbol(k) => _ccxt_json_materialize(x) for (k, x) in pairs(v))
_ccxt_json_materialize(v::AbstractVector) = Any[_ccxt_json_materialize(x) for x in v]

"""
    ccxt_json_parse(text)

Parse a JSON document into plain mutable Julia containers, mirroring the
semantics of `JSON.parse` in the TypeScript source. Returns `nothing` for
input that is not valid JSON, matching the transpiled `parseJson` contract.
"""
function ccxt_json_parse(text)
    text isa AbstractString || return _ccxt_json_materialize(text)
    return _ccxt_json_materialize(JSON3.read(text))
end
function isJsonEncodedObject(object)
    if !isa(object, AbstractString) || isempty(object)
        return false
    end
    c = first(object)
    return c == '{' || c == '['
end
binaryToString = utf8encode
stringToBinary = utf8decode
function stringToBase64(string)
    # TS: base64.encode(utf8.decode(string)) -> UTF-8 bytes, then base64.
    return Base64.base64encode(Vector{UInt8}(string))
end
function base64ToString(string)
    # TS: utf8.encode(base64.decode(string)) -> base64 decode, then UTF-8 string.
    return String(Base64.base64decode(string))
end
base64ToBinary = Base64.base64decode
binaryToBase64 = Base64.base64encode
base16ToBinary = base16decode
binaryToBase16 = base16encode
base58ToBinary = base58decode
binaryToBase58 = base58encode
binaryConcat = concatBytes
function binaryConcatArray(arr)
    return concatBytes(arr...)
end
# ---------------------------------------------------------------------------
# `qs.stringify` — the subset CCXT relies on.
#
# TS delegates the four url-encoders below to the bundled `qs` package
# (`ts/src/static_dependencies/qs/`). There is no Julia equivalent, so the
# needed behaviour is ported directly:
#
#   urlencode                -> qs.stringify (object)
#   urlencodeNested          -> qs.stringify (object, { encodeValuesOnly: true })
#   urlencodeWithArrayRepeat -> qs.stringify (object, { arrayFormat: 'repeat' })
#   rawencode                -> qs.stringify (object, { encode: false })
#
# The pieces that matter are RFC 3986 percent-encoding (`qs/utils.js:113`) and
# the default `arrayFormat: 'indices'` bracket notation (`qs/stringify.js`).
# ---------------------------------------------------------------------------

const _QS_HEX = [uppercase(Base.string("%", Base.string(i, base = 16, pad = 2))) for i in 0:255]

"""
    _qsEscape(s) -> String

RFC 3986 percent-encoding, a port of `qs/utils.js:113-176`. Unreserved
characters (`A-Za-z0-9-._~`) pass through; everything else is encoded from its
UTF-8 bytes. Note this differs from `encodeURIComponent` in that `!*'()` are
also encoded.
"""
function _qsEscape(s)
    str = isa(s, AbstractString) ? Base.string(s) : Base.string(s)
    out = IOBuffer()
    for b in codeunits(str)
        c = UInt32(b)
        if c == 0x2D || c == 0x2E || c == 0x5F || c == 0x7E ||
           (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A)
            write(out, UInt8(c))
        else
            write(out, _QS_HEX[c + 1])
        end
    end
    return String(take!(out))
end

# `qs` formats scalars with JS semantics: booleans as `true`/`false`, numbers
# without a trailing `.0`, and `null`/`undefined` as the empty string.
function _qsScalar(v)
    v === nothing && return ""
    v isa Bool && return v ? "true" : "false"
    v isa Real && return _jsNumberToString(v)
    return Base.string(v)
end

_qsIsList(v) = isa(v, AbstractVector) || isa(v, Tuple)
_qsIsMap(v) = isa(v, AbstractDict)

# Walk one key/value pair, appending `key=value` parts to `parts`.
# `arrayFormat` is `:indices` (default, `a[0]=1`) or `:repeat` (`a=1&a=2`).
# `encodeKeys`/`encodeValues` mirror `encode` and `encodeValuesOnly`.
function _qsWalk!(parts::Vector{String}, prefix::String, value, arrayFormat::Symbol,
                  encodeKeys::Bool, encodeValues::Bool)
    if _qsIsList(value)
        for (i, item) in enumerate(value)
            child = (arrayFormat === :repeat) ? prefix : (prefix * "[" * Base.string(i - 1) * "]")
            _qsWalk!(parts, child, item, arrayFormat, encodeKeys, encodeValues)
        end
    elseif _qsIsMap(value)
        for k in objectKeys(value)
            child = prefix * "[" * Base.string(k) * "]"
            _qsWalk!(parts, child, _qsGet(value, k), arrayFormat, encodeKeys, encodeValues)
        end
    else
        k = encodeKeys ? _qsEscape(prefix) : prefix
        v = _qsScalar(value)
        push!(parts, k * "=" * (encodeValues ? _qsEscape(v) : v))
    end
    return parts
end

_qsGet(d::AbstractDict, k) = haskey(d, k) ? d[k] : get(d, Symbol(k), get(d, Base.string(k), nothing))

function _qsStringify(object; encode::Bool = true, encodeValuesOnly::Bool = false,
                      arrayFormat::Symbol = :indices)
    object === nothing && return ""
    parts = String[]
    # `encodeValuesOnly` leaves the bracketed keys readable but still encodes
    # the values; `encode: false` disables both.
    encodeKeys = encode && !encodeValuesOnly
    encodeValues = encode
    if _qsIsMap(object)
        for k in objectKeys(object)
            _qsWalk!(parts, Base.string(k), _qsGet(object, k), arrayFormat, encodeKeys, encodeValues)
        end
    elseif _qsIsList(object)
        for (i, item) in enumerate(object)
            _qsWalk!(parts, Base.string(i - 1), item, arrayFormat, encodeKeys, encodeValues)
        end
    end
    return join(parts, "&")
end

"""
    encodeURIComponent(s) -> String

JS `encodeURIComponent`: percent-encodes every character except the unreserved
set `A-Za-z0-9-_.!~*'()`. This is deliberately *not* `urlencode`, which takes
an object and serialises it as a query string — passing a bare string there
yields `""`, which silently blanked values such as binance's `symbol` in the
`DELETE batchOrders` signing branch.
"""
function encodeURIComponent(s)
    str = Base.string(s)
    out = IOBuffer()
    for b in codeunits(str)
        c = UInt32(b)
        if (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A) ||
           c == 0x2D || c == 0x5F || c == 0x2E || c == 0x21 || c == 0x7E ||
           c == 0x2A || c == 0x27 || c == 0x28 || c == 0x29
            write(out, UInt8(c))
        else
            write(out, _QS_HEX[c + 1])
        end
    end
    return String(take!(out))
end

"""
    decodeURIComponent(s) -> String

JS `decodeURIComponent`: the inverse of [`encodeURIComponent`](@ref), turning
`%XX` triplets back into their UTF-8 bytes.
"""
function decodeURIComponent(s)
    str = Base.string(s)
    bytes = UInt8[]
    i = 1
    n = ncodeunits(str)
    cu = codeunits(str)
    while i <= n
        c = cu[i]
        if c == UInt8('%') && i + 2 <= n
            hexval = tryparse(UInt8, String(cu[(i + 1):(i + 2)]); base = 16)
            if hexval !== nothing
                push!(bytes, hexval)
                i += 3
                continue
            end
        end
        push!(bytes, c)
        i += 1
    end
    return String(bytes)
end

function urlencode(object, sort=false)
    return _qsStringify(object)
end
function urlencodeNested(object)
    return _qsStringify(object; encodeValuesOnly = true)
end
function urlencodeWithArrayRepeat(object)
    return _qsStringify(object; arrayFormat = :repeat)
end
function rawencode(object, sort=false)
    return _qsStringify(object; encode = false)
end
# TS `encode = utf8.decode` / `decode = utf8.encode` (encode.ts:34-35). In
# `@scure/base` the direction is named from the *string's* point of view:
# `utf8.decode` turns a string into bytes and `utf8.encode` turns bytes back
# into a string. Julia's own `utf8encode`/`utf8decode` use the opposite
# (Python-style) convention, so the aliases cross over.
encode = utf8encode   # string -> bytes
decode = utf8decode   # bytes  -> string
function urlencodeBase64(payload)
    payload64 = functions.ccxtruthy((isa(payload, AbstractString))) ? stringToBase64(payload) : binaryToBase64(payload);
    return replace(replace(replace(payload64, Regex("[=]+\$") => ""), Regex("\\+") => "-"), Regex("\\/") => "_")
end
function numberToLE(n, padding)
    return numberToBytesLE(BigInt(n), padding)
end
function numberToBE(n, padding)
    return numberToBytesBE(BigInt(n), padding)
end;
function packb(req)

    return serialize(req)
end


function base64ToBase64Url(base64, stripPadding=true)

    base64url = replace(replace(base64, Regex("\\+") => "-"), Regex("\\/") => "_");
    if functions.ccxtruthy(stripPadding)
        base64url = replace(base64url, Regex("=+\$") => "");
    end
    return base64url
end


export json, jsonStringifyCanonical, isJsonEncodedObject, binaryToString, stringToBinary, stringToBase64, base64ToBinary, base64ToString, binaryToBase64, base16ToBinary, binaryToBase16, binaryConcat, binaryConcatArray, base64ToBase64Url, urlencode, urlencodeWithArrayRepeat, rawencode, encode, decode, urlencodeBase64, numberToLE, numberToBE, base58ToBinary, binaryToBase58, urlencodeNested, packb, ccxt_json_parse


# ===== generic.ts =====
keys_var = objectKeys;
function values(x)
    return (functions.ccxtruthy((!functions.ccxtruthy(isArray(x)))) ? objectValues(x) : x)
end;
function index(x)
    return Set(values(x))
end;
# JS `Array.from(x)` — materialise an iterable/array into a plain array.
from = collect
function extend(args...)
    return objectAssign(Dict{Symbol, Any}(), args...)
end;
function clone(x)
    return (functions.ccxtruthy(isArray(x)) ? from(x) : extend(x))
end;
function ordered(x)
    return x
end;
function unique(x)
    return from(index(x))
end;
function arrayConcat(a, b)
    return concat(a, b)
end;
function inArray(needle, haystack)
    needle in haystack && return true
    # Transpiler emits Dict{Symbol, Any} keys but lookups may use either String
    # or Symbol; the array form of `assertStructure`'s `emptyAllowedFor` keeps
    # String entries while `objectKeys(format)` yields Symbol keys. Normalise so
    # `"margin" in [Symbol("margin")]` and `:margin in ["margin"]` both match.
    if haystack isa AbstractVector && (needle isa Symbol || needle isa AbstractString)
        needleSym = needle isa Symbol ? needle : Symbol(needle)
        for item in haystack
            itemSym = item isa Symbol ? item : (item isa AbstractString ? Symbol(item) : nothing)
            itemSym !== nothing && itemSym == needleSym && return true
        end
    end
    return false
end;
# Transpiler maps `exchange.inArray(a, b)` (the TS convention) to a 3-arg call
# `inArray(exchange, a, b)`. The leading `exchange` argument is the same
# pass-through the other `exchange.*` helpers receive and is ignored here.
function inArray(exchange, needle, haystack)
    return inArray(needle, haystack)
end;
function toArray(object)
    return objectValues(object)
end;
function isEmpty(object)
    if functions.ccxtruthy(@functions.ccxt_or(object == nothing, object == nothing))
        return true
end

    if functions.ccxtruthy(functions.ccxt_isArray(object))
        return functions.ccxt_lt(length(object), 1)
end

    if functions.ccxtruthy(isDict(object))
        return functions.ccxt_lt(length(objectKeys(object)), 1)
end

    return false
end;
function keysort(x, out=Dict())
    for k in sort(keys(x))
    out[Symbol(k)] = get(x, Symbol(k), nothing);
end
    return out
end;
function sort(array)
    # CCXT `sort(array)` — JS `array.slice().sort()` with the default comparator:
    # ascending lexicographic (string) order. Returns a *copy*, never mutates.
    # `collect` covers the unordered iterables (`keys(dict)`, `Set`) that
    # `keysort` feeds in; `Base.sort!` only accepts an `AbstractVector`.
    newArray = Any[x for x in array];
    Base.sort!(newArray; lt=(a, b) -> string(a) < string(b));
    return newArray
end;
# Threaded-self variant emitted by the transpiler for `exchange.sort(array)`:
# `sort!(array, exchange, ...)`. The extra args are the `self` instance and are
# ignored; behaviour matches `sort` above — returns a sorted copy without
# mutating. When called with sorting keywords (`lt`, `by`, ...), as `sortBy`
# does, delegate to `Base.sort!` so the comparator is honoured.
function sort!(array, args...; kwargs...)
    if isempty(kwargs)
        return sort(array)
    end
    if array isa AbstractVector
        return Base.sort!(array; kwargs...)
    end
    return Base.sort!(Any[x for x in array]; kwargs...)
end;
function groupBy(x, k, out=Dict())
    for v in values(x)
    if functions.ccxtruthy(ccxt_in(k, v))
        p = get(v, Symbol(k), nothing);
        out[Symbol(p)] = @functions.ccxt_or(get(out, Symbol(p), nothing), []);
                push!(get(out, Symbol(p), nothing), v);
    end
end
    return out
end;
function indexBy(x, k, out=Dict())
    for v in values(x)
    if functions.ccxtruthy(ccxt_in(k, v))
        # JS `v[k]`: when `v` is an array and `k` an integer, this is a 0-based
        # index; otherwise `k` is a property key on a Dict.
        val = v isa AbstractVector ? v[k + 1] : get(v, Symbol(k), nothing);
        out[Symbol(val)] = v;
    end
end
    return out
end;
function filterBy(x, k, value=nothing, out=[])
    for v in values(x)
    if functions.ccxtruthy(get(v, Symbol(k), nothing) == value)
                push!(out, v);
    end
end
    return out
end;
function sortBy(array, key, descending=false, defaultValue=0, direction=functions.ccxtruthy(descending) ? -1 : 1)
    # The transpiler emits `key` as a JS 0-based integer when sorting a vector of
    # vectors (e.g. `sortBy(bids, 0)` sorts by the element at index 0). Julia is
    # 1-based, so translate the index. For dict-like `key`s, fall back to the
    # key-membership lookup used for object properties.
    _keyval(x) = begin
        if (key isa Integer) && (x isa AbstractVector) && (0 <= key < length(x))
            return x[key + 1]
        end
        return functions.ccxtruthy(ccxt_in(key, x)) ? get(x, Symbol(key), nothing) : defaultValue
    end
    return sort!(array, lt=(a, b) -> begin
        first_var = _keyval(a);
        second = _keyval(b);
        # Julia `lt(a,b)` returns true when `a` precedes `b`, which matches the
        # JS comparator returning a negative value. JS returns -direction when
        # first<second and +direction when first>second, so `lt` is true iff
        # (first<second && direction>0) || (first>second && direction<0).
        if functions.ccxtruthy(functions.ccxt_lt(first_var, second))
            return direction > 0
        elseif functions.ccxtruthy(functions.ccxt_gt(first_var, second))
            return direction < 0
        else
            return false
        end
    end)
end;
function sortBy2(array, key1, key2, descending=false, direction=functions.ccxtruthy(descending) ? -1 : 1)
    return sort!(array, lt=(a, b) -> begin
        if functions.ccxtruthy(functions.ccxt_lt(get(a, Symbol(key1), nothing), get(b, Symbol(key1), nothing)))
            return direction > 0
        elseif functions.ccxtruthy(functions.ccxt_gt(get(a, Symbol(key1), nothing), get(b, Symbol(key1), nothing)))
            return direction < 0
        else
            if functions.ccxtruthy(functions.ccxt_lt(get(a, Symbol(key2), nothing), get(b, Symbol(key2), nothing)))
                return direction > 0
            elseif functions.ccxtruthy(functions.ccxt_gt(get(a, Symbol(key2), nothing), get(b, Symbol(key2), nothing)))
                return direction < 0
            else
                return false
            end
        end
    end)
end;
function flatten(x, out=[])
    for v in x
    if functions.ccxtruthy(isArray(v))
        flatten(v, out);
    else
        push!(out, v);
    end
end
    return out
end;
function pluck(x, k)
    return map(function (v)

    return get(v, Symbol(k), nothing);
end

, filter(function (v)

    return ccxt_in(k, v);
end

, values(x)))
end;
function omit(x, args...)
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(x)))
    out = clone(x);
    for k in args
        if functions.ccxtruthy(isArray(k))  # omit (x, ['a', 'b'])
            for kk in k
            delete!(out, Symbol(kk));
        end
        else
            delete!(out, Symbol(k));  # omit (x, 'a', 'b')
        end
    end
        return out
end

    return x
end;
function sum(xs...)
    # TS `sum(...xs)` filters the numeric args and adds them. Julia receives the
    # (self-)threaded args as a tuple; flatten any nested arrays and keep only
    # the numbers, then fold with `+`.
    flat = []
    for x in xs
        if isArray(x)
            append!(flat, x)
        else
            push!(flat, x)
        end
    end
    ns = filter(isNumber, flat);
    return functions.ccxtruthy((functions.ccxt_gt(length(ns), 0))) ? reduce(function (a, b)

    return a + b;
end, ns; init=0) : nothing
end;
function deepExtend(args...)
    result = nothing;
    resultIsObject = false;
    for arg in args
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(arg != nothing, isa(arg, Dict)), constructor(arg) == ccxt_Object))
        if functions.ccxtruthy(@functions.ccxt_or(result == nothing, !functions.ccxtruthy(resultIsObject)))
            result = Dict{Symbol, Any}();
            resultIsObject = true;
        end
        if functions.ccxtruthy(length(objectKeys(arg)) == 0)
            continue;
        end
        for (key, _) in arg
            value = get(arg, Symbol(key), nothing);
            current = get(result, Symbol(key), nothing);
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(current != nothing, isa(current, Dict)), constructor(current) == ccxt_Object), value != nothing), isa(value, Dict)), constructor(value) == ccxt_Object))
                result[Symbol(key)] = deepExtend(current, value);
            else
                result[Symbol(key)] = value;
            end
        end
    else
        result = arg;
        resultIsObject = false;
    end
end
    return result
end;
function merge(target, args...)
    overwrite = Dict{Symbol, Any}();
    merged = objectAssign(Dict{Symbol, Any}(), args...);
    keys_var = objectKeys(merged);
    i = 0
while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
    key = get(keys_var, i + 1, nothing);
    if functions.ccxtruthy(get(target, Symbol(key), nothing) == nothing)
        overwrite[Symbol(key)] = get(merged, Symbol(key), nothing);
    end
    i += 1
end

    return objectAssign(Dict{Symbol, Any}(), target, overwrite)
end;
export keys_var, values, extend, clone, index, ordered, unique, arrayConcat, inArray, toArray, isEmpty, sort, keysort, indexBy, groupBy, filterBy, sortBy, sortBy2, flatten, pluck, omit, sum, deepExtend, merge


# ===== io.ts =====
fsSyncModule = nothing;
osSyncModule = nothing;
pathSyncModule = nothing;
urlSyncModule = nothing;
function initFileSystem()

    if functions.ccxtruthy(isNode)
        if functions.ccxtruthy(fsSyncModule == nothing)
            try
                fsSyncModule = Base.fetch(("node:fs"));
            catch e

            end
        end
        if functions.ccxtruthy(osSyncModule == nothing)
            try
                osSyncModule = Base.fetch(("node:os"));
            catch e

            end
        end
        if functions.ccxtruthy(pathSyncModule == nothing)
            try
                pathSyncModule = Base.fetch(("node:path"));
            catch e

            end
        end
        if functions.ccxtruthy(urlSyncModule == nothing)
            try
                urlSyncModule = Base.fetch(("node:url"));
            catch e

            end
        end
    end
end


if functions.ccxtruthy(isNode)
    initFileSystem();
end

# --- Platform file-system layer -------------------------------------------
# The TypeScript originals delegate to Node's `fs`/`os`/`path` modules. Julia
# has those facilities in Base, so these are implemented natively here (the
# same way the Python and PHP bases hand-write their platform layer) rather
# than transpiled.

function getTempDir()
    try
        dir = abspath(tempdir())
        sep = Base.Filesystem.path_separator
        return endswith(dir, sep) ? dir : string(dir, sep)
    catch e
        return nothing
    end
end


"""
Mirror of the TS whitelist guard: only `.ccxtfile` and `.wasm` paths may be
touched, so a caller cannot use these helpers to read or clobber arbitrary
files.
"""
function ensureWhitelistedFile(filePath)
    sanitizedFilePath = abspath(filePath)
    if (startswith(sanitizedFilePath, filePath) && endswith(sanitizedFilePath, ".ccxtfile")) || endswith(sanitizedFilePath, ".wasm")
        return
    end
    throw(ErrorException(string("invalid file path: ", filePath)))
end


function readFile(path, encoding="utf8")
    ensureWhitelistedFile(path)
    try
        return read(path, String)
    catch e
        return nothing
    end
end


function writeFile(path, data, encoding="utf8")
    ensureWhitelistedFile(path)
    try
        open(path, "w") do io
            write(io, data)
        end
        return true
    catch e
        return false
    end
end


function existsFile(path)
    ensureWhitelistedFile(path)
    try
        return ispath(path)
    catch e
        return false
    end
end


function filePathToFileUrlForWindows(filePath)

    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(!functions.ccxtruthy(isNode), !functions.ccxtruthy(filePath)), startswith(filePath, "file://")), osSyncModule == nothing), urlSyncModule == nothing))
            return filePath
    end
    if functions.ccxtruthy(platform(osSyncModule) != "win32")
            return filePath
    end
    looksLikeWindowsPath = @functions.ccxt_or(test(Regex("^[a-zA-Z]:[\\\\/]"), filePath), startswith(filePath, "\\\\"));
    return functions.ccxtruthy(looksLikeWindowsPath) ? get(pathToFileURL(urlSyncModule, filePath), Symbol("href"), nothing) : filePath
end


# ===== misc.ts =====
function parseTimeframe(timeframe)
    amount = asFloat(timeframe[1:end-1]);
    unit = string(timeframe[end]);
    scale = nothing;
    if functions.ccxtruthy(unit == "y")
    scale = 60 * 60 * 24 * 365;
elseif functions.ccxtruthy(unit == "M")
    scale = 60 * 60 * 24 * 30;
else
    if functions.ccxtruthy(unit == "w")
        scale = 60 * 60 * 24 * 7;
    elseif functions.ccxtruthy(unit == "d")
        scale = 60 * 60 * 24;
    else
        if functions.ccxtruthy(unit == "h")
            scale = 60 * 60;
        elseif functions.ccxtruthy(unit == "m")
            scale = 60;
        else
            if functions.ccxtruthy(unit == "s")
                scale = 1;
            else
                throw(NotSupported(string("timeframe unit ", unit, " is not supported")));
            end

        end

    end

end

    return amount * scale
end;
function roundTimeframe(timeframe, timestamp, direction=ROUND_DOWN)
    ms = parseTimeframe(timeframe) * 1000;
    offset = timestamp % ms;
    return timestamp - offset + (functions.ccxtruthy((direction == ROUND_UP)) ? ms : 0)
end;
function extractParams(string)
    # Port of `ts/src/base/functions/misc.ts:43` — the TS version drives a
    # sticky `/{([\w-]+)}/g` regex with repeated `re.exec(string)` calls, which
    # Julia expresses directly as `eachmatch`. `\w` in JS is `[A-Za-z0-9_]`;
    # Julia's PCRE `\w` is Unicode-aware by default, so spell the class out to
    # keep the two implementations byte-for-byte identical.
    re = r"\{([A-Za-z0-9_-]+)\}"
    matches = String[]
    for m in eachmatch(re, string)
        push!(matches, m.captures[1])
    end
    return matches
end;
function implodeParams(str, params)
    # Port of `ts/src/base/functions/misc.ts:60`. The TS parameter is named
    # `string`, which the transpiler carried over verbatim — in Julia that
    # shadows `Base.string`, so the generated `string("{", key, "}")` call
    # tried to invoke the String argument. Renamed to `str` and the
    # concatenation spelled with `*`.
    #
    # `String.prototype.replace(pattern, replacement)` with a string pattern
    # replaces only the FIRST occurrence, hence `count = 1`. The replacement is
    # inserted literally (no `\1` backreference expansion), which is what
    # `SubstitutionString`-free plain-string replacement does in Julia.
    if !functions.ccxt_isArray(params)
        keys_var = objectKeys(params)
        i = 0
        while i < length(keys_var)
            key = get(keys_var, i + 1, nothing)
            value = get(params, Symbol(key), nothing)
            if !functions.ccxt_isArray(value)
                needle = "{" * Base.string(key) * "}"
                str = replace(str, needle => Base.string(value); count = 1)
            end
            i += 1
        end
    end
    return str
end;
function vwap(baseVolume, quoteVolume)

    return functions.ccxtruthy((@functions.ccxt_and(@functions.ccxt_and((baseVolume != nothing), (quoteVolume != nothing)), (functions.ccxt_gt(baseVolume, 0))))) ? (quoteVolume / baseVolume) : nothing
end


function aggregate(bidasks)

    # Port of ts/src/base/functions/misc.ts `aggregate`. JS keys `result` by the
    # price coerced to a string and returns `Object.keys(result)` (insertion
    # order). Julia `Dict`/`objectKeys` are unordered, so track insertion order
    # explicitly and key by the stringified price for stable lookup.
    result = Dict{String, Any}();
    order = String[];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(bidasks)))
        pair = get(bidasks, i + 1, nothing);
        price = get(pair, 1, nothing);
        volume = get(pair, 2, nothing);
        if functions.ccxtruthy(functions.ccxt_gt(volume, 0))
            priceKey = string(price);
            if !functions.ccxtruthy(ccxt_in(priceKey, result))
                push!(order, priceKey);
            end
            result[priceKey] = (@functions.ccxt_or(get(result, priceKey, nothing), 0)) + volume;
        end
        i += 1
    end
    return map(function (priceKey)

    return [ccxt_toNumber(priceKey), ccxt_toNumber(get(result, priceKey, nothing))];
end

, order)
end


function selfIsDefined()

    selfIsDefined = false;
    try
        selfIsDefined = self != nothing;
    catch e
        selfIsDefined = false;

    end
    return selfIsDefined
end


export aggregate, parseTimeframe, roundTimeframe, implodeParams, extractParams, vwap, selfIsDefined


# ===== number.ts =====
TRUNCATE = 0;
ROUND = 1;
ROUND_UP = 2;
ROUND_DOWN = 3;
DECIMAL_PLACES = 2;
SIGNIFICANT_DIGITS = 3;
TICK_SIZE = 4;
NO_PADDING = 5;
PAD_WITH_ZERO = 6;
precisionConstants = Dict{Symbol, Any}(
    Symbol("ROUND") => ROUND,
    Symbol("TRUNCATE") => TRUNCATE,
    Symbol("ROUND_UP") => ROUND_UP,
    Symbol("ROUND_DOWN") => ROUND_DOWN,
    Symbol("DECIMAL_PLACES") => DECIMAL_PLACES,
    Symbol("SIGNIFICANT_DIGITS") => SIGNIFICANT_DIGITS,
    Symbol("TICK_SIZE") => TICK_SIZE,
    Symbol("NO_PADDING") => NO_PADDING,
    Symbol("PAD_WITH_ZERO") => PAD_WITH_ZERO
);
function assert(x, y)
    if functions.ccxtruthy(!functions.ccxtruthy(x))
    throw(Error(@functions.ccxt_or(y, "assertion failed")));
end

end;
# NOTE: TypeScript declares `numberToString` three times — two overload
# signatures followed by the implementation. The transpiler emits all three,
# but in Julia the empty signature bodies would just be dead methods returning
# `nothing`, so only the implementation is kept.
function numberToString(x)
    # Faithful port of `numberToString` in ts/src/base/functions/number.ts:43-70:
    # renders a number without scientific notation. `_jsNumberToString` supplies
    # the JS `Number.prototype.toString` form the algorithm below parses, since
    # Julia's own float printing differs (`1.0e-7` vs JS `1e-7`).
    if x === nothing
        return nothing
    end
    if !isa(x, Number)
        return string(x)
    end
    s = _jsNumberToString(x)
    if abs(x) < 1
        n_e = split(s, "e-")
        n = replace(n_e[1], "." => "")
        e = length(n_e) > 1 ? ccxt_parseInt(n_e[2]) : nothing
        neg = startswith(s, "-")
        if ccxtruthy(e)
            # JS `(new Array (e)).join ('0')` yields `e - 1` zeros (an array of
            # `e` empty slots joined by the separator), and `n.substring (neg)`
            # drops the leading '-' for negatives via JS boolean-to-int coercion.
            return string(neg ? "-" : "", "0.", repeat("0", max(e - 1, 0)), substring(n, neg))
        end
    else
        parts = split(s, "e")
        if length(parts) > 1 && ccxtruthy(parts[2])
            e = ccxt_parseInt(parts[2])
            m = split(parts[1], ".")
            part = ""
            if length(m) > 1 && ccxtruthy(m[2])
                e -= length(m[2])
                part = m[2]
            end
            return string(m[1], part, repeat("0", max(e, 0)))
        end
    end
    return s
end


truncate_regExpCache = [];
function truncate_to_string(num, precision=0)
    # Port of `truncate_to_string` in ts/src/base/functions/number.ts:75-83.
    # `RegExp` has no Julia counterpart, so the pattern is built with `Regex`;
    # a failed match falls back to the unmodified number, as in the TS source.
    num = numberToString(num)
    if precision > 0
        re = Regex("([-]*\\d+\\.\\d{" * string(Int(precision)) * "})(\\d)")
        m = match(re, string(num))
        result = m === nothing ? num : m.captures[1]
        return string(result)
    end
    return string(ccxt_parseInt(num))
end;
function truncate(num, precision=0)
    return ccxt_toNumber(truncate_to_string(num, precision))
end;
function precisionFromString(str)

    if functions.ccxtruthy(@functions.ccxt_or(findfirst("e", str) !== nothing, findfirst("E", str) !== nothing))
        numStr = replace(str, Regex("\\d\\.?\\d*[eE]") => "");
            return ccxt_parseInt(numStr) * -1
    end
    split_var = split(replace(str, Regex("0+\$") => ""), ".");
    return functions.ccxtruthy((functions.ccxt_gt(length(split_var), 1))) ? (length(get(split_var, 2, nothing))) : 0
end


function decimalToPrecision(x, roundingMode, numPrecisionDigits, countingMode=DECIMAL_PLACES, paddingMode=NO_PADDING)
    return _decimalToPrecision(x, roundingMode, numPrecisionDigits, countingMode, paddingMode)
end;
function _decimalToPrecision(x, roundingMode, numPrecisionDigits, countingMode=DECIMAL_PLACES, paddingMode=NO_PADDING)
    # Faithful port of `_decimalToPrecision` in ts/src/base/functions/number.ts.
    #
    # The algorithm works on a raw character buffer with JS 0-based indices, so
    # the buffer is kept 0-based here too via `_Buf`, a thin wrapper whose
    # `[i]` means "the i-th byte counting from zero". Translating the indices
    # inline is what made earlier attempts drift off by one.
    @assert numPrecisionDigits !== nothing "numPrecisionDigits should not be undefined"
    if isa(numPrecisionDigits, AbstractString)
        numPrecisionDigits = ccxt_toNumber(numPrecisionDigits)
    end
    @assert isfinite(numPrecisionDigits) "numPrecisionDigits has an invalid number"
    if countingMode == TICK_SIZE
        @assert numPrecisionDigits > 0 "negative or zero numPrecisionDigits can not be used with TICK_SIZE precisionMode"
    else
        @assert isinteger(numPrecisionDigits) "numPrecisionDigits must be an integer with DECIMAL_PLACES or SIGNIFICANT_DIGITS precisionMode"
    end
    @assert (roundingMode == ROUND) || (roundingMode == TRUNCATE) "invalid roundingMode provided"
    @assert (countingMode == DECIMAL_PLACES) || (countingMode == SIGNIFICANT_DIGITS) || (countingMode == TICK_SIZE) "invalid countingMode provided"
    @assert (paddingMode == NO_PADDING) || (paddingMode == PAD_WITH_ZERO) "invalid paddingMode provided"

    if numPrecisionDigits < 0
        toNearest = pow(10, -numPrecisionDigits)
        # JS coerces the string `x` to a number for these arithmetic operators.
        xNumber = ccxt_toNumber(x)
        if roundingMode == ROUND
            return _jsNumberToString(toNearest * ccxt_toNumber(_decimalToPrecision(xNumber / toNearest, roundingMode, 0, countingMode, paddingMode)))
        end
        if roundingMode == TRUNCATE
            return _jsNumberToString(xNumber - (xNumber % toNearest))
        end
    end

    # --- tick size ---
    if countingMode == TICK_SIZE
        precisionDigitsString = _decimalToPrecision(numPrecisionDigits, ROUND, 22, DECIMAL_PLACES, NO_PADDING)
        newNumPrecisionDigits = precisionFromString(precisionDigitsString)
        if roundingMode == TRUNCATE
            # Truncate the string form first, to dodge floating-point drift.
            xStr = numberToString(x)
            truncatedX = truncate_to_string(xStr === nothing ? "" : xStr, max(0, newNumPrecisionDigits))
            xNum = ccxt_toNumber(truncatedX)
            scale = pow(10, newNumPrecisionDigits)
            xScaled = round(xNum * scale)
            tickScaled = round(numPrecisionDigits * scale)
            ticks = trunc(xScaled / tickScaled)
            x = (ticks * tickScaled) / scale
            if paddingMode == NO_PADDING
                return _jsNumberToString(ccxt_toNumber(toFixed(x, newNumPrecisionDigits)))
            end
            return _decimalToPrecision(x, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, paddingMode)
        end
        missing_var = ccxt_toNumber(x) % numPrecisionDigits
        # See: https://github.com/ccxt/ccxt/pull/6486
        missing_var = ccxt_toNumber(_decimalToPrecision(missing_var, ROUND, 8, DECIMAL_PLACES, NO_PADDING))
        fpError = _decimalToPrecision(missing_var / numPrecisionDigits, ROUND, max(newNumPrecisionDigits, 8), DECIMAL_PLACES, NO_PADDING)
        if precisionFromString(fpError) != 0
            if roundingMode == ROUND
                xNumber = ccxt_toNumber(x)
                if xNumber > 0
                    if missing_var >= numPrecisionDigits / 2
                        x = xNumber - missing_var + numPrecisionDigits
                    else
                        x = xNumber - missing_var
                    end
                else
                    if missing_var >= numPrecisionDigits / 2
                        x = xNumber - missing_var
                    else
                        x = xNumber - missing_var - numPrecisionDigits
                    end
                end
            end
        end
        return _decimalToPrecision(x, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, paddingMode)
    end

    # --- convert to a string, skip a leading minus sign ---
    str = numberToString(x)
    bytes = codeunits(str)
    isNegative = (length(bytes) > 0) && (bytes[1] == UInt8('-'))
    strStart = isNegative ? 1 : 0
    strEnd = length(bytes)

    # Find the dot position in the source buffer.
    strDot = 0
    while strDot < strEnd
        if bytes[strDot + 1] == UInt8('.')
            break
        end
        strDot += 1
    end
    hasDot = strDot < strEnd

    MINUS = 45
    DOT = 46
    ZERO = 48
    ONE = ZERO + 1
    FIVE = ZERO + 5
    NINE = ZERO + 9

    # For -123.4567 `chars` holds 01234567; the leading zero is reserved for
    # rounding cases where 099 becomes 100.
    chars = _Buf(zeros(Int, (strEnd - strStart) + (hasDot ? 0 : 1)))
    chars[0] = ZERO

    # Validate and copy digits, recording key positions in the buffer.
    afterDot = length(chars)
    digitsStart = -1
    digitsEnd = -1
    i = 1
    j = strStart
    while j < strEnd
        c = Int(bytes[j + 1])
        if c == DOT
            afterDot = i
            i -= 1
        elseif (c < ZERO) || (c > NINE)
            throw(Error("$(str): invalid number (contains an illegal character '$(Char(bytes[i]))')"))
        else
            chars[i] = c
            if (c != ZERO) && (digitsStart < 0)
                digitsStart = i
            end
        end
        j += 1
        i += 1
    end
    if digitsStart < 0
        digitsStart = 1
    end

    # Determine the range to cut.
    precisionStart = (countingMode == DECIMAL_PLACES) ? afterDot : digitsStart
    precisionEnd = precisionStart + numPrecisionDigits
    digitsEnd = -1

    # Round/truncate digit by digit, from the end back to the start.
    allZeros = true
    signNeeded = isNegative
    memo = 0
    i = length(chars) - 1
    while i >= 0
        c = chars[i]
        if i != 0
            c += memo
            if i >= (precisionStart + numPrecisionDigits)
                # `!((c === FIVE) && memo)` prevents rounding 1.45 up to 2.
                ceil_var = (roundingMode == ROUND) && (c >= FIVE) && !((c == FIVE) && (memo != 0))
                c = ceil_var ? (NINE + 1) : ZERO
            end
            if c > NINE
                c = ZERO
                memo = 1
            else
                memo = 0
            end
        elseif memo != 0
            c = ONE  # leading extra digit (0900 -> 1000)
        end
        chars[i] = c
        if c != ZERO
            allZeros = false
            digitsStart = i
            digitsEnd = (digitsEnd < 0) ? (i + 1) : digitsEnd
        end
        i -= 1
    end

    # `digitsStart` may have moved, so refresh the precision range.
    if countingMode == SIGNIFICANT_DIGITS
        precisionStart = digitsStart
        precisionEnd = precisionStart + numPrecisionDigits
    end
    if allZeros
        signNeeded = false
    end

    # Determine the input character range.
    readStart = ((digitsStart >= afterDot) || allZeros) ? (afterDot - 1) : digitsStart
    readEnd = (digitsEnd < afterDot) ? afterDot : digitsEnd

    nSign = signNeeded ? 1 : 0
    nBeforeDot = nSign + (afterDot - readStart)
    nAfterDot = max(readEnd - afterDot, 0)
    actualLength = readEnd - readStart
    desiredLength = (paddingMode == NO_PADDING) ? actualLength : (precisionEnd - readStart)
    pad = max(desiredLength - actualLength, 0)
    padStart = nBeforeDot + 1 + nAfterDot
    padEnd = padStart + pad
    isInteger = (nAfterDot + pad) == 0

    # Fill the output buffer.
    out = _Buf(zeros(Int, nBeforeDot + (isInteger ? 0 : 1) + nAfterDot + pad))
    if signNeeded
        out[0] = MINUS
    end
    i = nSign
    j = readStart
    while i < nBeforeDot
        out[i] = chars[j]
        i += 1
        j += 1
    end
    if !isInteger
        out[nBeforeDot] = DOT
    end
    i = nBeforeDot + 1
    j = afterDot
    while i < padStart
        out[i] = chars[j]
        i += 1
        j += 1
    end
    i = padStart
    while i < padEnd
        out[i] = ZERO
        i += 1
    end
    return String(UInt8[UInt8(c) for c in out.data])
end;
function omitZero(stringNumber)

    try
        if functions.ccxtruthy(@functions.ccxt_or(stringNumber == nothing, stringNumber == ""))
                return nothing
        end
        if functions.ccxtruthy(ccxt_toNumber(stringNumber) == 0)
                return nothing
        end
        return stringNumber
    catch e
        return stringNumber

    end
end


export numberToString, precisionFromString, decimalToPrecision, truncate_to_string, truncate, omitZero, precisionConstants, ROUND, TRUNCATE, ROUND_UP, ROUND_DOWN, DECIMAL_PLACES, SIGNIFICANT_DIGITS, TICK_SIZE, NO_PADDING, PAD_WITH_ZERO


# ===== platform.ts =====
isBrowser = window !== nothing;
isElectron = @functions.ccxt_and(@functions.ccxt_and(process !== nothing, get(process, Symbol("versions"), nothing) !== nothing), get(get(process, Symbol("versions"), nothing), Symbol("electron"), nothing) !== nothing);
isWebWorker = @functions.ccxt_and(WorkerGlobalScope !== nothing, (isa(self, WorkerGlobalScope)));
isWindows = @functions.ccxt_and(process !== nothing, get(process, Symbol("platform"), nothing) == "win32");
isDeno = Deno !== nothing;
isBun = @functions.ccxt_and(@functions.ccxt_and(process !== nothing, get(process, Symbol("versions"), nothing) !== nothing), get(get(process, Symbol("versions"), nothing), Symbol("bun"), nothing) !== nothing);
isNode = !functions.ccxtruthy((@functions.ccxt_or(@functions.ccxt_or(isBrowser, isWebWorker), isDeno)));
export isBrowser, isElectron, isWebWorker, isNode, isDeno, isBun, isWindows


# ===== rsa.ts =====
#
# The TS source delegates RSA signing to Node's `crypto` module and ECDSA to
# `@noble/curves`. Neither exists here, and the offline Julia depot has no
# crypto package, so both primitives are implemented directly below. Both are
# plain integer arithmetic, which `BigInt` covers, so the ports are faithful
# rather than approximations: they reproduce the exact signatures the shared
# CCXT test vectors assert.

# --- ASN.1 / DER --------------------------------------------------------------
#
# Enough of DER to read a PKCS#1 `RSAPrivateKey` and an SEC1 `ECPrivateKey`,
# mirroring `pemToDer`/`parseDerElements` in `ts/src/base/functions/crypto.ts`.

"Strip the PEM armour and base64-decode the body."
function pemToDer(pem::AbstractString)
    body = IOBuffer()
    for line in split(pem, '\n')
        l = strip(line)
        (isempty(l) || startswith(l, "-----")) && continue
        print(body, l)
    end
    return Base64.base64decode(String(take!(body)))
end

"Split a DER buffer into its top-level `(tag, content)` elements."
function parseDerElements(der::AbstractVector{UInt8})
    elements = Vector{NamedTuple{(:tag, :content), Tuple{UInt8, Vector{UInt8}}}}()
    i = 1
    n = length(der)
    while i <= n
        tag = der[i]
        i += 1
        i > n && break
        len = Int(der[i])
        i += 1
        if len & 0x80 != 0                    # long form: low bits give byte count
            nbytes = len & 0x7f
            len = 0
            for _ in 1:nbytes
                len = (len << 8) | Int(der[i])
                i += 1
            end
        end
        push!(elements, (tag = tag, content = Vector{UInt8}(der[i:(i + len - 1)])))
        i += len
    end
    return elements
end

_derInteger(bytes::AbstractVector{UInt8}) = isempty(bytes) ? BigInt(0) : parse(BigInt, bytes2hex(bytes), base = 16)

"""
    parseRsaPrivateKey(pem) -> (n, e, d)

Read the modulus, public exponent and private exponent out of a PKCS#1
`-----BEGIN RSA PRIVATE KEY-----` block. PKCS#8 (`BEGIN PRIVATE KEY`) is
unwrapped first, since the inner structure is the same PKCS#1 sequence.
"""
function parseRsaPrivateKey(pem::AbstractString)
    der = pemToDer(pem)
    top = parseDerElements(der)
    isempty(top) && error("rsa: malformed PEM key")
    fields = parseDerElements(top[1].content)
    # PKCS#8 wraps the PKCS#1 key in an OCTET STRING as its third field.
    if length(fields) == 3 && fields[3].tag == 0x04
        fields = parseDerElements(parseDerElements(fields[3].content)[1].content)
    end
    length(fields) < 4 && error("rsa: unsupported key format")
    # RSAPrivateKey ::= SEQUENCE { version, modulus, publicExponent,
    #                              privateExponent, prime1, prime2, ... }
    return (_derInteger(fields[2].content),
            _derInteger(fields[3].content),
            _derInteger(fields[4].content))
end

# DigestInfo prefixes from RFC 8017 §9.2, notes 1. Prepended to the raw digest
# before PKCS#1 v1.5 padding so a verifier can tell which hash was used.
const _RSA_DIGEST_INFO = Dict(
    "sha256" => UInt8[0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65,
                      0x03, 0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20],
    "sha384" => UInt8[0x30, 0x41, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65,
                      0x03, 0x04, 0x02, 0x02, 0x05, 0x00, 0x04, 0x30],
    "sha512" => UInt8[0x30, 0x51, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65,
                      0x03, 0x04, 0x02, 0x03, 0x05, 0x00, 0x04, 0x40],
)

"""
    rsa(request, secret, hash) -> String

RSASSA-PKCS1-v1_5 signature, base64-encoded — the same contract as `rsa` in
`ts/src/base/functions/rsa.ts`, which calls `crypto.createSign(...).sign(key,
'base64')`. `secret` is a PEM-encoded private key and `hash` selects the digest
(only the three RFC 8017 SHA-2 variants Node exposes as `RSA-SHA*`).
"""
function rsa(request, secret, hash)
    name = _algoName(hash)
    prefix = get(_RSA_DIGEST_INFO, name, nothing)
    prefix === nothing && error("rsa: unsupported hash algorithm: " * name)
    n, _e, d = parseRsaPrivateKey(secret isa AbstractString ? secret : String(Vector{UInt8}(secret)))
    k = cld(ndigits(n, base = 2), 8)                 # modulus size in bytes
    digestInfo = vcat(prefix, _ccxt_sha(hash, request))
    length(digestInfo) + 11 > k && error("rsa: key too short for digest")
    # EM = 0x00 || 0x01 || PS (0xff...) || 0x00 || DigestInfo   (RFC 8017 §9.2)
    em = vcat(UInt8[0x00, 0x01], fill(0xff, k - length(digestInfo) - 3), UInt8[0x00], digestInfo)
    m = parse(BigInt, bytes2hex(em), base = 16)
    s = powermod(m, d, n)
    return Base64.base64encode(numberToBytesBE(s, k))
end

# --- ECDSA --------------------------------------------------------------------
#
# Short-Weierstrass curves `y^2 = x^3 + ax + b` over a prime field, with RFC
# 6979 deterministic nonces — the same scheme `@noble/curves` implements, so the
# signatures match byte for byte.

struct EllipticCurve
    name::String
    p::BigInt      # field prime
    a::BigInt
    b::BigInt
    n::BigInt      # group order
    gx::BigInt
    gy::BigInt
end

const secp256k1 = EllipticCurve("secp256k1",
    parse(BigInt, "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f", base = 16),
    BigInt(0), BigInt(7),
    parse(BigInt, "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", base = 16),
    parse(BigInt, "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", base = 16),
    parse(BigInt, "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8", base = 16))

const p256 = EllipticCurve("p256",
    parse(BigInt, "ffffffff00000001000000000000000000000000ffffffffffffffffffffffff", base = 16),
    parse(BigInt, "ffffffff00000001000000000000000000000000fffffffffffffffffffffffc", base = 16),
    parse(BigInt, "5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b", base = 16),
    parse(BigInt, "ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551", base = 16),
    parse(BigInt, "6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296", base = 16),
    parse(BigInt, "4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5", base = 16))

const P256 = p256

# Points are `nothing` (the identity) or an `(x, y)` tuple, in affine coordinates.
const ECPoint = Union{Nothing, Tuple{BigInt, BigInt}}

function _ecAdd(curve::EllipticCurve, P::ECPoint, Q::ECPoint)
    P === nothing && return Q
    Q === nothing && return P
    (x1, y1) = P
    (x2, y2) = Q
    p = curve.p
    if x1 == x2
        mod(y1 + y2, p) == 0 && return nothing      # P + (-P) = identity
        λ = mod((3 * x1 * x1 + curve.a) * invmod(2 * y1, p), p)
    else
        λ = mod((y2 - y1) * invmod(mod(x2 - x1, p), p), p)
    end
    x3 = mod(λ * λ - x1 - x2, p)
    return (x3, mod(λ * (x1 - x3) - y1, p))
end

"Double-and-add scalar multiplication."
function _ecMul(curve::EllipticCurve, k::BigInt, P::ECPoint)
    result::ECPoint = nothing
    addend = P
    k = mod(k, curve.n)
    while k > 0
        if k & 1 == 1
            result = _ecAdd(curve, result, addend)
        end
        addend = _ecAdd(curve, addend, addend)
        k >>= 1
    end
    return result
end

_ecBasePoint(curve::EllipticCurve) = (curve.gx, curve.gy)

"Left-most `bitlen(n)` bits of the digest, as an integer (RFC 6979 `bits2int`)."
function _bits2int(curve::EllipticCurve, bytes::Vector{UInt8})
    z = isempty(bytes) ? BigInt(0) : parse(BigInt, bytes2hex(bytes), base = 16)
    excess = length(bytes) * 8 - ndigits(curve.n, base = 2)
    return excess > 0 ? (z >> excess) : z
end

"""
    _rfc6979Nonce(curve, digest, privateKey, algo, extraEntropy) -> BigInt

Deterministic nonce generation (RFC 6979 §3.2). `@noble/curves` uses the same
construction, and it is what makes an ECDSA signature reproducible — without it
the test vectors could not be asserted at all.
"""
function _rfc6979Nonce(curve::EllipticCurve, digest::Vector{UInt8}, privateKey::BigInt,
                       algo, extraEntropy::Union{Nothing, Vector{UInt8}} = nothing)
    holen = length(digest)
    qlen = ndigits(curve.n, base = 2)
    rolen = cld(qlen, 8)
    # bits2octets: reduce the digest mod n, then render it as `rolen` bytes.
    h1int = _bits2int(curve, digest)
    bx = vcat(numberToBytesBE(privateKey, rolen), numberToBytesBE(mod(h1int, curve.n), rolen))
    if extraEntropy !== nothing
        bx = vcat(bx, extraEntropy)
    end
    V = fill(0x01, holen)
    K = fill(0x00, holen)
    _mac(key, msg) = _utf8Bytes(hmac(msg, key, algo, "binary"))
    K = _mac(K, vcat(V, UInt8[0x00], bx))
    V = _mac(K, V)
    K = _mac(K, vcat(V, UInt8[0x01], bx))
    V = _mac(K, V)
    while true
        T = UInt8[]
        while length(T) < rolen
            V = _mac(K, V)
            append!(T, V)
        end
        k = _bits2int(curve, T[1:rolen])
        if k >= 1 && k < curve.n
            return k
        end
        K = _mac(K, vcat(V, UInt8[0x00]))
        V = _mac(K, V)
    end
end

"""
    ecdsa(request, secret, curve, prehash=nothing, fixedLength=false)

ECDSA signing, a port of `ecdsa` in `ts/src/base/functions/crypto.ts`. Returns
the low-`s` normalised signature as `{ r, s, v }` with `r`/`s` as hex strings
and `v` the recovery id, exactly as the TS version does.
"""
function ecdsa(request, secret, curve::EllipticCurve = secp256k1, prehash = nothing, fixedLength = false)
    if prehash !== nothing && prehash !== false
        request = hash(request, prehash, "hex")
    end
    secretHex = secret isa AbstractString ? secret : bytes2hex(Vector{UInt8}(secret))
    if length(secretHex) > 64
        # PEM-encoded SEC1 key: ECPrivateKey ::= SEQUENCE { version,
        # privateKey OCTET STRING, parameters [0], publicKey [1] }
        startswith(secretHex, "-") || startswith(strip(String(secretHex)), "-----") ||
            error("ecdsa: unsupported key format")
        fields = parseDerElements(parseDerElements(pemToDer(secretHex))[1].content)
        length(fields) < 2 && error("ecdsa: unsupported key format")
        secretHex = bytes2hex(fields[2].content)
    end
    messageBytes = hex2bytes(length(request) % 2 == 1 ? "0" * String(request) : String(request))
    d = parse(BigInt, secretHex, base = 16)
    z = _bits2int(curve, messageBytes)
    # The digest is rehashed for the nonce with a hash of matching width, which
    # is what noble does (`hmacSha256` for a 32-byte curve).
    nonceAlgo = curve.n > (BigInt(1) << 256) ? sha512 : sha256
    minimumSize = (BigInt(1) << (8 * 31)) - 1
    halfOrder = curve.n >> 1
    counter = 0
    local r, s, v
    while true
        extra = counter == 0 ? nothing : numberToBytesLE(BigInt(counter - 1), 32)
        k = _rfc6979Nonce(curve, messageBytes, d, nonceAlgo, extra)
        R = _ecMul(curve, k, _ecBasePoint(curve))
        if R === nothing
            counter += 1
            counter += 1; continue
        end
        (Rx, Ry) = R
        r = mod(Rx, curve.n)
        if r == 0
            counter += 1
            counter += 1; continue
        end
        s = mod(invmod(k, curve.n) * (z + r * d), curve.n)
        if s == 0
            counter += 1
            counter += 1; continue
        end
        v = (Int(mod(Ry, BigInt(2))) & 1) | (Rx > curve.n ? 2 : 0)
        if s > halfOrder                    # `lowS: true` — flip and adjust recovery
            s = curve.n - s
            v ⊻= 1
        end
        if !ccxtruthy(fixedLength) || (r <= halfOrder && r > minimumSize && s > minimumSize)
            break
        end
        counter += 1
    end
    return Dict{Symbol, Any}(
        Symbol("r") => string(r, base = 16),
        Symbol("s") => string(s, base = 16),
        Symbol("v") => v,
    )
end

"Public key for a private scalar, SEC1 compressed (33 bytes) or uncompressed (65)."
function getPublicKey(curve::EllipticCurve, privateKey, compressed::Bool = true)
    d = privateKey isa AbstractString ? parse(BigInt, privateKey, base = 16) :
        parse(BigInt, bytes2hex(Vector{UInt8}(privateKey)), base = 16)
    P = _ecMul(curve, d, _ecBasePoint(curve))
    P === nothing && error("invalid private key")
    (x, y) = P
    if compressed
        return vcat(UInt8[mod(y, 2) == 0 ? 0x02 : 0x03], numberToBytesBE(x, 32))
    end
    return vcat(UInt8[0x04], numberToBytesBE(x, 32), numberToBytesBE(y, 32))
end

"Decompress a SEC1 point back to its uncompressed 65-byte encoding."
function ecPointToUncompressed(curve::EllipticCurve, encoded)
    bytes = Vector{UInt8}(encoded)
    bytes[1] == 0x04 && return bytes
    x = parse(BigInt, bytes2hex(bytes[2:33]), base = 16)
    p = curve.p
    ySq = mod(x^3 + curve.a * x + curve.b, p)
    y = powermod(ySq, (p + 1) >> 2, p)      # p ≡ 3 (mod 4) for both curves here
    if mod(y, 2) != (bytes[1] == 0x03 ? 1 : 0)
        y = p - y
    end
    return vcat(UInt8[0x04], numberToBytesBE(x, 32), numberToBytesBE(y, 32))
end

# --- TOTP ---------------------------------------------------------------------

"""
    totp(secret) -> String

RFC 6238 time-based one-time password over a base32 secret, matching `totp` in
`ts/src/base/functions/totp.ts`.
"""
function totp(secret)
    # base32 decode, ignoring the spaces exchanges print in their setup UI
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    cleaned = uppercase(replace(String(secret), " " => ""))
    bits = 0
    value = 0
    key = UInt8[]
    for c in cleaned
        c == '=' && continue
        idx = findfirst(isequal(c), alphabet)
        idx === nothing && continue
        value = (value << 5) | (idx - 1)
        bits += 5
        if bits >= 8
            push!(key, UInt8((value >> (bits - 8)) & 0xff))
            bits -= 8
        end
    end
    counter = numberToBytesBE(BigInt(floor(Int, time() / 30)), 8)
    mac = _utf8Bytes(hmac(counter, key, sha1, "binary"))
    offset = Int(mac[end] & 0x0f)
    code = ((Int(mac[offset + 1]) & 0x7f) << 24) | (Int(mac[offset + 2]) << 16) |
           (Int(mac[offset + 3]) << 8) | Int(mac[offset + 4])
    return lpad(string(code % 1000000), 6, "0")
end

# --- JWT ----------------------------------------------------------------------

"""
    jwt(request, secret, hash, isRSA=false, opts=Dict())

JSON Web Token, a port of `jwt` in `ts/src/base/functions/rsa.ts`. Supports the
`HS*`, `RS*` and `ES*` families; the algorithm is derived from `hash.outputLen`
unless `opts['alg']` overrides it.
"""
function jwt(request, secret, hash, isRSA = false, opts = Dict{Symbol, Any}())
    alg = (ccxtruthy(isRSA) ? "RS" : "HS") * string(hash.outputLen * 8)
    optAlg = get(opts, Symbol("alg"), get(opts, "alg", nothing))
    if ccxtruthy(optAlg)
        alg = uppercase(optAlg)
    end
    header = objectAssign(Dict{Symbol, Any}(Symbol("alg") => alg, Symbol("typ") => "JWT"), opts)
    iat = get(header, Symbol("iat"), nothing)
    if iat !== nothing
        request[Symbol("iat")] = iat
        delete!(header, Symbol("iat"))
    end
    # Key order matters: the signature covers the serialised bytes, so `alg`
    # must precede `typ` the way `Object.assign` leaves it in JS.
    encodedHeader = urlencodeBase64(_jwtJson(header, [:alg, :typ]))
    encodedData = urlencodeBase64(_jwtJson(request, Symbol[]))
    token = join([encodedHeader, encodedData], ".")
    algoType = alg[1:2]
    signature = nothing
    if algoType == "HS"
        signature = urlencodeBase64(hmac(token, secret, hash, "binary"))
    elseif ccxtruthy(isRSA) || algoType == "RS"
        signature = urlencodeBase64(base64ToBinary(rsa(token, utf8decode(_utf8Bytes(secret)), hash)))
    elseif algoType == "ES"
        signedHash = ecdsa(token, utf8decode(_utf8Bytes(secret)), P256, hash)
        r = lpad(get(signedHash, Symbol("r"), nothing), 64, "0")
        s = lpad(get(signedHash, Symbol("s"), nothing), 64, "0")
        signature = urlencodeBase64(base16ToBinary(string(r, s)))
    end
    return join([token, signature], ".")
end

"""
    _jwtJson(dict, first) -> String

`JSON.stringify` for the JWT payload. JS preserves insertion order; Julia's
`Dict` does not, so the keys named in `first` are emitted up front and the rest
follow in insertion order as best as the dictionary can report it.
"""
function _jwtJson(dict, first::Vector{Symbol})
    keys = Symbol[]
    for k in first
        haskey(dict, k) && push!(keys, k)
    end
    for k in Base.keys(dict)
        sym = k isa Symbol ? k : Symbol(k)
        sym in keys || push!(keys, sym)
    end
    parts = String[]
    for k in keys
        v = haskey(dict, k) ? dict[k] : dict[string(k)]
        push!(parts, JSON3.write(string(k)) * ":" * JSON3.write(v))
    end
    return "{" * join(parts, ",") * "}"
end

function toHex(str)
    result = ""
    for c in String(str)
        result *= string(UInt32(c), base = 16)
    end
    return result
end

export rsa, jwt, ecdsa, totp, secp256k1, p256, P256, getPublicKey, EllipticCurve,
    pemToDer, parseDerElements, ecPointToUncompressed


# ===== string.ts =====
function unCamelCase(s)
    exceptions = Dict{Symbol, Any}(
    Symbol("fetchOHLCVWs") => "fetch_ohlcv_ws"
);
    if functions.ccxtruthy(get(exceptions, Symbol(s), nothing))
        return get(exceptions, Symbol(s), nothing)
end

    return functions.ccxtruthy(match(Regex("[A-Z]"), s)) ? lowercase(replace(replace(replace(s, Regex("[a-z0-9][A-Z]") => function (x)

    return string(get(x, 1, nothing), "_", get(x, 2, nothing));
end

), Regex("[A-Z0-9][A-Z0-9][a-z][^\$]") => function (x)

    return string(get(x, 1, nothing), "_", get(x, 2, nothing), get(x, 3, nothing), get(x, 4, nothing));
end

), Regex("[a-z][0-9]\$") => function (x)

    return string(get(x, 1, nothing), "_", get(x, 2, nothing));
end

)) : s
end;
function capitalize(s)
    return functions.ccxtruthy(length(s)) ? (string(uppercase(charAt(s, 0)), s[1 + 1:end])) : s
end;
function strip(s)
    return replace(s, Regex("^\\s+|\\s+\$") => "")
end;
# Faithful Julia port of ts/src/base/functions/string.ts `uuid`/`uuid16`/`uuid22`.
# JS uses array+string coercion (`[1e7] + -1e3 + ...`) to build a template string,
# then substitutes each [018] digit using a recursive call. The transpiler emitted
# invalid Vector arithmetic, so the template is written out explicitly here.
function uuid(a=nothing)
    if functions.ccxtruthy(a)
        # JS `(a ^ Math.random () * 16 >> a / 4).toString (16)`. `*` and `>>`
        # bind tighter than `^`, so the xor applies to the *shifted* random
        # nibble; grouping it the other way yields two-hex-digit substitutions
        # and a uuid two characters too long.
        c = parse(Int, string(a))
        r = floor(Int, rand() * 16)
        return string(c ⊻ (r >> (c ÷ 4)), base=16)
    end
    template = "10000000-1000-4000-8000-100000000000"
    return replace(template, r"[018]" => function (m)
        return uuid(m)
    end)
end;
function uuid16(a=nothing)
    if functions.ccxtruthy(a)
        # JS `(a ^ Math.random () * 16 >> a / 4).toString (16)`. `*` and `>>`
        # bind tighter than `^`, so the xor applies to the *shifted* random
        # nibble; grouping it the other way yields two-hex-digit substitutions
        # and a uuid two characters too long.
        c = parse(Int, string(a))
        r = floor(Int, rand() * 16)
        return string(c ⊻ (r >> (c ÷ 4)), base=16)
    end
    template = "1000001004008000"
    return replace(template, r"[018]" => function (m)
        return uuid16(m)
    end)
end;
function uuid22(a=nothing)
    if functions.ccxtruthy(a)
        # JS `(a ^ Math.random () * 16 >> a / 4).toString (16)`. `*` and `>>`
        # bind tighter than `^`, so the xor applies to the *shifted* random
        # nibble; grouping it the other way yields two-hex-digit substitutions
        # and a uuid two characters too long.
        c = parse(Int, string(a))
        r = floor(Int, rand() * 16)
        return string(c ⊻ (r >> (c ÷ 4)), base=16)
    end
    template = "1000000010004000800000"
    return replace(template, r"[018]" => function (m)
        return uuid22(m)
    end)
end;
export uuid, uuid16, uuid22, unCamelCase, capitalize, strip


# ===== throttle.ts =====
@kwdef mutable struct Config
        refillRate::Float64 = 0.0
        delay::Float64 = 0.0
        capacity::Float64 = 0.0
        tokens::Float64 = 0.0
        cost::Float64 = 0.0
        algorithm::String = ""
        rateLimit::Float64 = 0.0
        windowSize::Float64 = 0.0
        maxWeight::Float64 = 0.0
end

@kwdef mutable struct Throttler
    attrs::Dict{Symbol, Any} = Dict{Symbol, Any}()
    running::Union{Bool, Nothing} = nothing
    queue::Union{Vector{Any}, Nothing} = nothing
    config::Any = nothing
    timestamps::Union{Vector{Any}, Nothing} = nothing
    function Throttler(attrs=Dict{Symbol, Any}(), running=false, queue=Vector{Any}(), config=Dict{Symbol, Any}(), timestamps=Vector{Any}(); userConfig::ConstructorArgs = Dict{Symbol, Any}(), kwargs...)
        v = new(attrs, running, queue, config, timestamps)
        v.attrs[:userConfig] = userConfig
        for (key, value) in kwargs
            v.attrs[key] = value
        end
        v.config = Dict{Symbol, Any}(
            Symbol("refillRate") => 1,
            Symbol("delay") => 0.001,
            Symbol("capacity") => 1,
            Symbol("tokens") => 0,
            Symbol("cost") => 1,
            Symbol("algorithm") => "leakyBucket",
            Symbol("windowSize") => 60000,
            Symbol("maxWeight") => nothing
        );
        objectAssign(v.config, config);
        if functions.ccxtruthy(get(v.config, Symbol("algorithm"), nothing) != "leakyBucket")
            v.config[Symbol("maxWeight")] = get(v.config, Symbol("windowSize"), nothing) / get(v.config, Symbol("rateLimit"), nothing);
        end
        v.queue = [];
        v.running = false;
        v.timestamps = [];
        return v
    end
end
function leakyBucketLoop(self::Throttler, )
    lastTimestamp = now();
    while functions.ccxtruthy(self.running)
        head = get(self.queue, 1, nothing)
        resolver = get(head, Symbol("resolver"), nothing)
        cost = get(head, Symbol("cost"), nothing);
        if functions.ccxtruthy(functions.ccxt_ge(get(self.config, Symbol("tokens"), nothing), 0))
            self.config[Symbol("tokens")] -= cost;
            resolver();
                        popfirst!(self.queue);
            # contextswitch (JS: await Promise.resolve())
            yield();
              if functions.ccxtruthy(length(self.queue) == 0)
                  self.running = false;
              end
          else
            sleep(get(self.config, Symbol("delay"), nothing) * 1000);
            current = now();
            elapsed = current - lastTimestamp;
            lastTimestamp = current;
            tokens = get(self.config, Symbol("tokens"), nothing) + (get(self.config, Symbol("refillRate"), nothing) * elapsed);
            self.config[Symbol("tokens")] = min(tokens, get(self.config, Symbol("capacity"), nothing));
        end
    end

end
function rollingWindowLoop(self::Throttler, )
    while functions.ccxtruthy(self.running)
        head = get(self.queue, 1, nothing)
        resolver = get(head, Symbol("resolver"), nothing)
        cost = get(head, Symbol("cost"), nothing);
        nowTime = now();
        cutOffTime = nowTime - get(self.config, Symbol("windowSize"), nothing);
        totalCost = 0;
        timestamps = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(self.timestamps)))
            element = get(self.timestamps, i + 1, nothing);
            if functions.ccxtruthy(functions.ccxt_gt(get(element, Symbol("timestamp"), nothing), cutOffTime))
                totalCost += get(element, Symbol("cost"), nothing);
                                push!(timestamps, element);
            end
            i += 1
        end
        self.timestamps = timestamps;
        if functions.ccxtruthy(functions.ccxt_le(totalCost + cost, get(self.config, Symbol("maxWeight"), nothing)))
                        push!(self.timestamps, Dict{Symbol, Any}(
    Symbol("timestamp") => nowTime,
    Symbol("cost") => cost
));
            resolver();
                        popfirst!(self.queue);
            yield();
            if functions.ccxtruthy(length(self.queue) == 0)
                self.running = false;
            end
        else
            earliestRequestTime = get(get(self.timestamps, 1, nothing), Symbol("timestamp"), nothing);
            waitTime = (earliestRequestTime + get(self.config, Symbol("windowSize"), nothing)) - nowTime;
            if functions.ccxtruthy(functions.ccxt_gt(waitTime, 0))
                sleep(waitTime);
            end
        end
    end

end
function loop(self::Throttler, )
    if functions.ccxtruthy(get(self.config, Symbol("algorithm"), nothing) == "leakyBucket")
        self.leakyBucketLoop();
    else
        self.rollingWindowLoop();
    end

end
function throttle(self::Throttler, cost=nothing)
    promise = begin
        resolve = () -> nothing
        reject = () -> nothing
        resolver = resolve;
    
    end;
    cost = functions.ccxtruthy((cost == nothing)) ? get(self.config, Symbol("cost"), nothing) : cost;
    push!(self.queue, Dict{Symbol, Any}(
    Symbol("resolver") => resolver,
    Symbol("cost") => cost
));
    if functions.ccxtruthy(!functions.ccxtruthy(self.running))
        self.running = true;
        self.loop();
    end
    return promise

end

function Base.getproperty(self::Throttler, name::Symbol)
    if hasfield(Throttler, name)
        value = getfield(self, name)
        if value isa Function
            return (args...) -> (ccxt_takes_self(value) ? value(self, args...) : value(args...))
        else
            return value
        end
    end
    # Fall back to module-level functions (loop, leakyBucketLoop, rollingWindowLoop)
    if isdefined(@__MODULE__, name) && getfield(@__MODULE__, name) isa Function
        fn = getfield(@__MODULE__, name)
        return (args...) -> (ccxt_takes_self(fn) ? fn(self, args...) : fn(args...))
    end
    error("Property $name not found")
end

export Throttler


# ===== time.ts =====
# `Date.now` is a Type-getter that returns a 0-arg closure yielding the current
# `Date`. In TypeScript `now` is `Date.now`, which returns a *number* of epoch
# milliseconds — not a `Date`. Callers rely on that: the throttler computes
# `current - lastTimestamp`, which only works on numbers. So bind `now` to the
# epoch-ms value rather than to the `Date` constructor closure.
now() = Int(round(Dates.datetime2unix(Dates.now()) * 1000))
function _now_ms()
    return now()
end;
function microseconds()
    return _now_ms() * 1000
end;
function milliseconds()
    return _now_ms()
end;
function seconds()
    # TS: `Math.floor (now () / 1000)`. JS numbers render integral values
    # without a decimal point, so return an `Int` rather than the `Float64`
    # that a bare `floor` would give (which stringifies as `1.750123456e9`).
    return floor(Int, _now_ms() / 1000)
end;
function uuidv1()
    biasSeconds = 12219292800;
    bias = biasSeconds * 10000000;
    time = microseconds() * 10 + bias;
    timeHex = string(time, base=16);
    arranged = string(timeHex[7 + 1:15], timeHex[3 + 1:7], "1", timeHex[0 + 1:3]);
    clockId = "9696";
    macAddress = repeat("ff", 6);
    return string(arranged, clockId, macAddress)
end;
setTimeout_original = setTimeout;
function setTimeout_safe(done, ms, setTimeout=setTimeout_original, targetTime=_now_ms() + ms)
    if functions.ccxtruthy(functions.ccxt_ge(ms, 2147483647))
    throw(Error(string("setTimeout() function was called with unrealistic value of ", ms)));
end

    function clearInnerTimeout()
end;
    active = true;
    id = setTimeout(function ()

    active = true;
    rest = targetTime - _now_ms();
    if functions.ccxtruthy(functions.ccxt_gt(rest, 0))
        clearInnerTimeout = setTimeout_safe(done, rest, setTimeout, targetTime);
    else
        done();
    end
end, ms);
    return function clear()

    if functions.ccxtruthy(active)
        active = false;
        clearTimeout(id);
    end
    clearInnerTimeout();
end


end;
@kwdef mutable struct TimedOut <: Any
    parent::Union{Error, Nothing} = Error()
    attrs::Dict{Symbol, Any} = Dict{Symbol, Any}()
    constructor::Any = nothing
    __proto__::Any = nothing
    message::Any = nothing
    function TimedOut(parent=Error(), attrs=Dict{Symbol, Any}(), constructor_var=nothing, __proto___var=nothing, message=nothing; userConfig::ConstructorArgs = Dict{Symbol, Any}(), kwargs...)
        v = new(parent, attrs, constructor_var, __proto___var, message)
        v.attrs[:userConfig] = userConfig
        for (key, value) in kwargs
            v.attrs[key] = value
        end
        message = "timed out";
        v.constructor = TimedOut;
        v.___proto__ = TimedOut.prototype;
        v.message = message;
        return v
    end
end

function iso8601(timestamp)
    _timestampNumber = nothing;
    if functions.ccxtruthy(isa(timestamp, Number))
    _timestampNumber = floor(timestamp);
else
    _timestampNumber = ccxt_parseInt(timestamp, 10);
end

    if functions.ccxtruthy(@functions.ccxt_or(isnan(_timestampNumber), functions.ccxt_lt(_timestampNumber, 0)))
        return nothing
end

    try
    return toISOString(Date(_timestampNumber))
catch e
    return nothing

end
end;
"""
    _jsDateParse(s) -> Union{Int, Nothing}

The slice of `Date.parse` that CCXT's `parse8601`/`parseDate` rely on: an ISO
8601 date-time with an optional fractional-second part and an optional `Z` or
`±HH:MM` offset, returned as milliseconds since the Unix epoch. Returns
`nothing` for anything unparseable or out of range (JS yields `NaN` there,
which the callers map to `undefined`).

Unlike Julia's `Dates.DateTime` parser, JS rejects out-of-range components
(month 13, hour 25) rather than rolling them over, so each field is
range-checked explicitly. Fractional seconds are truncated to milliseconds and
left-aligned, so `.6` is 600 ms and `.06` is 60 ms — matching JS.
"""
function _jsDateParse(s::AbstractString)
    re = r"^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?)?(Z|[+-]\d{2}:?\d{2})?$"
    m = match(re, strip(s))
    m === nothing && return nothing
    year = Base.parse(Int, m.captures[1])
    month = Base.parse(Int, m.captures[2])
    day = Base.parse(Int, m.captures[3])
    hour = m.captures[4] === nothing ? 0 : Base.parse(Int, m.captures[4])
    minute = m.captures[5] === nothing ? 0 : Base.parse(Int, m.captures[5])
    second = m.captures[6] === nothing ? 0 : Base.parse(Int, m.captures[6])
    # JS: out-of-range components make the whole date invalid (NaN).
    (1 <= month <= 12) || return nothing
    (1 <= day <= Dates.daysinmonth(year, month)) || return nothing
    (0 <= hour <= 24) || return nothing
    (0 <= minute <= 59) || return nothing
    (0 <= second <= 59) || return nothing
    # `.6` -> 600ms, `.06` -> 60ms, `.0625` -> 62ms (truncated, not rounded).
    frac = m.captures[7]
    ms = 0
    if frac !== nothing
        padded = rpad(frac, 3, '0')[1:3]
        ms = Base.parse(Int, padded)
    end
    dt = Dates.DateTime(year, month, day, hour, minute, second, ms)
    total = Dates.value(dt) - Dates.UNIXEPOCH
    # Apply the UTC offset when the string carries one; a bare timestamp or a
    # trailing `Z` is already UTC.
    offset = m.captures[8]
    if offset !== nothing && offset != "Z"
        sign = offset[1] == '-' ? 1 : -1
        digits = replace(offset[2:end], ":" => "")
        offHours = Base.parse(Int, digits[1:2])
        offMinutes = Base.parse(Int, digits[3:4])
        total += sign * (offHours * 3600000 + offMinutes * 60000)
    end
    return total
end

function parse8601(x)
    # Port of `ts/src/base/functions/time.ts`. `Date.parse` has no Julia
    # equivalent, so `_jsDateParse` above supplies the needed subset.
    if !isa(x, AbstractString) || !functions.ccxtruthy(x)
        return nothing
    end
    if match(r"^[0-9]+$", x) !== nothing
        # A valid number in a string, not a date.
        return nothing
    end
    if findfirst("-", x) === nothing || findfirst(":", x) === nothing
        # No date can be without a dash and a colon.
        return nothing
    end
    # TS appends `Z` and rewrites the `<space>HH:` separator to `THH:` when the
    # string carries neither an explicit offset nor a trailing `Z`.
    normalized = if (findfirst("+", x) !== nothing) || (length(x) > 0 && x[end] == 'Z')
        Base.string(x)
    else
        replace(Base.string(x, "Z"), r"\s(\d\d):" => s"T\1:")
    end
    return _jsDateParse(normalized)
end;
function parseDate(x)
    if !isa(x, AbstractString) || !functions.ccxtruthy(x)
        return nothing
    end
    if findfirst("GMT", x) !== nothing
        return _jsDateParse(replace(x, "GMT" => "", " " => "T"))
    end
    return parse8601(x)
end;
function mdy(timestamp, infix="-")
    infix = @functions.ccxt_or(infix, "");
    date = Date(timestamp);
    Y = string(getUTCFullYear(date));
    m = getUTCMonth(date) + 1;
    d = getUTCDate(date);
    m = functions.ccxtruthy(functions.ccxt_lt(m, 10)) ? (string("0", m)) : string(m);
    d = functions.ccxtruthy(functions.ccxt_lt(d, 10)) ? (string("0", d)) : string(d);
    return string(m, infix, d, infix, Y)
end;
function ymd(timestamp, infix, fullYear=true)
    infix = @functions.ccxt_or(infix, "");
    date = Date(timestamp);
    intYear = getUTCFullYear(date);
    year = functions.ccxtruthy(fullYear) ? intYear : (intYear - 2000);
    Y = string(year);
    m = getUTCMonth(date) + 1;
    d = getUTCDate(date);
    m = functions.ccxtruthy(functions.ccxt_lt(m, 10)) ? (string("0", m)) : string(m);
    d = functions.ccxtruthy(functions.ccxt_lt(d, 10)) ? (string("0", d)) : string(d);
    return string(Y, infix, m, infix, d)
end;
function yymmdd(timestamp, infix="")
    return ymd(timestamp, infix, false)
end;
function yyyymmdd(timestamp, infix="-")
    return ymd(timestamp, infix, true)
end;
function ymdhms(timestamp, infix=" ")
    date = Date(timestamp);
    Y = getUTCFullYear(date);
    m = getUTCMonth(date) + 1;
    d = getUTCDate(date);
    H = getUTCHours(date);
    M = getUTCMinutes(date);
    S = getUTCSeconds(date);
    m = functions.ccxtruthy(functions.ccxt_lt(m, 10)) ? (string("0", m)) : m;
    d = functions.ccxtruthy(functions.ccxt_lt(d, 10)) ? (string("0", d)) : d;
    H = functions.ccxtruthy(functions.ccxt_lt(H, 10)) ? (string("0", H)) : H;
    M = functions.ccxtruthy(functions.ccxt_lt(M, 10)) ? (string("0", M)) : M;
    S = functions.ccxtruthy(functions.ccxt_lt(S, 10)) ? (string("0", S)) : S;
    return string(Y, "-", m, "-", d, infix, H, ":", M, ":", S)
end;
function sleep(ms)
    # TS: `new Promise ((resolve) => setTimeout_safe (resolve, ms))`.
    # The Julia stand-in for a Promise is a `Task`, so callers can `Base.fetch`
    # the result to await it — matching `await sleep (ms)` — or ignore it, as
    # `close()` does, matching a floating promise in JS. `setTimeout_safe` invokes
    # `done()` with no arguments (JS `resolve()` resolves to `undefined`), so the
    # closure must be 0-arg — `identity` would require one and crash the Task.
    return @async setTimeout_safe(() -> nothing, ms)
end;
function timeout(ms, promise)
    function clear()
end;
    expires = begin
    resolve = identity
    reject = identity
    (clear = setTimeout_safe(resolve, ms))

end;
    try
    return Base.fetch(race([promise, functions.ccxt_then(expires, function ()

    throw(TimedOut());
end

, nothing)]))
finally
    clear();

end
end;
export now, microseconds, milliseconds, seconds, iso8601, parse8601, uuidv1, parseDate, mdy, ymd, yymmdd, yyyymmdd, ymdhms, setTimeout_safe, sleep, TimedOut, timeout


# ===== type.ts =====
isNumber = isfinite;
isInteger = isinteger;
isArray = functions.ccxt_isArray;
function hasProps(o)
    return (@functions.ccxt_and((o != nothing), (o != nothing)))
end;
function isString(s)
    return (isa(s, AbstractString))
end;
function isObject(o)
    # JS `typeof o === 'object'` is true for plain Dicts AND arrays, so both count
    # as "objects" here (unlike `isDictionary`, which excludes arrays).
    return (@functions.ccxt_and((o != nothing), (@functions.ccxt_or(isa(o, Dict), isa(o, AbstractVector)))))
end;
# JS `RegExp` has no direct Julia equivalent; the codebase uses Julia `Regex`
# for actual pattern work (see call sites above). This alias lets `isRegExp`
# type-check; in Julia no value is ever a `RegExp`, matching JS where only real
# regex objects pass the check.
const RegExp = Regex
function isRegExp(o)
    return (isa(o, RegExp))
end;
function isDictionary(o)
    return (@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(isObject(o), (nothing == nothing)), !functions.ccxtruthy(isArray(o))), !functions.ccxtruthy(isRegExp(o))))
end;
# TS exports `isDictionary` aliased as `isDict`; the transpiler threads the
# latter name in some call sites (e.g. `isEmpty`). Define it as the same fn.
isDict = isDictionary
function isStringCoercible(x)
    return (@functions.ccxt_or((@functions.ccxt_and(hasProps(x), get(x, Symbol("toString"), nothing))), isNumber(x)))
end;
# TS `prop`/`prop2` in type.ts: read `o[k]`, treating '' and undefined as
# absent. `o` may be an array indexed by an integer key (`safeValue (list, 0)`),
# so the read goes through `getPropValue` rather than a bare `get`, which has no
# Symbol-keyed method for vectors.
function prop(o, k)
    isObject(o) || return nothing
    v = getPropValue(o, k)
    return (v != "" && v !== nothing) ? v : nothing
end;
function prop2(o, k1, k2)
    isObject(o) || return nothing
    v1 = prop(o, k1)
    v1 !== nothing && return v1
    return prop(o, k2)
end;
function getPropValue(object, k)
    # JS `object[k]`: for an array and an integer key this is a 0-based index;
    # otherwise `k` is a property name on a Dict.
    if object isa AbstractVector
        return (k isa Integer && 0 <= k < length(object)) ? object[k + 1] : nothing
    end
    return get(object, Symbol(k), nothing)
end
# TS: `isObject (object) ? object[array.find ((k) => prop (object, k) !== undefined)] : undefined`
#
# The search predicate is `prop`, not a raw read: `prop` maps JS's three
# "absent" spellings (missing key, `''`, `null`) onto `undefined`, so a key
# holding an empty string does NOT count as found and the scan moves on to the
# next candidate. Probing with a raw read instead stops at the empty string and
# returns `""` where every other language returns the default — which then
# flows into `safeString*N` and turns a missing field into a present-but-blank
# one.
function getValueFromKeysInArray(object, array)
    if functions.ccxtruthy(isObject(object))
        key = ccxt_find(array, function (k)
            return prop(object, k) !== nothing;
        end)
        return key === nothing ? nothing : getPropValue(object, key)
    end
    return nothing
end;
function asFloat(x)
    return (functions.ccxtruthy((@functions.ccxt_or(isNumber(x), (@functions.ccxt_and(isString(x), length(x) != 0))))) ? ccxt_toNumber(x) : NaN)
end;
function asInteger(x)
    return (functions.ccxtruthy((@functions.ccxt_or(isNumber(x), (@functions.ccxt_and(isString(x), length(x) != 0))))) ? trunc(ccxt_toNumber(x)) : NaN)
end;
function safeFloat(o, k, default_var=nothing)
    n = asFloat(prop(o, k));
    return functions.ccxtruthy(isNumber(n)) ? n : default_var
end;
function safeInteger(o, k, default_var)

end


function safeInteger(o, k, default_var=nothing)

end


function safeInteger(o, k, default_var=nothing)

    n = asInteger(prop(o, k));
    return functions.ccxtruthy(isNumber(n)) ? n : default_var
end


function safeIntegerProduct(o, k, factor, default_var=nothing)
    n = asFloat(prop(o, k));
    return functions.ccxtruthy(isNumber(n)) ? ccxt_parseInt(n * factor) : default_var
end;
function safeTimestamp(o, k, default_var=nothing)
    n = asFloat(prop(o, k));
    return functions.ccxtruthy(isNumber(n)) ? ccxt_parseInt(n * 1000) : default_var
end;
function safeValue(o, k, default_var=nothing)
    x = prop(o, k);
    return functions.ccxtruthy(hasProps(x)) ? x : default_var
end;
# --- the safeString family ---------------------------------------------------
#
# `ts/src/base/functions/type.ts` states the rule three times per variant:
#
#     if (typeof x === 'string') return x;
#     if (Number.isFinite (x)) return String (x);
#     return $default;
#
# so it is factored into one helper here and each variant supplies the case
# transform. Three properties of that rule are easy to get wrong, and each was
# an actual bug in this port:
#
#  1. Only strings and FINITE numbers convert. The older implementation tested
#     `isStringCoercible`, which is JS's `hasProps (x) && x.toString`. In JS
#     that is a duck-typing check that happens to exclude very little —
#     a boolean has `toString`, so `safeString (dict, 'bool')` returned
#     "true" instead of `undefined`. `Number.isFinite` also rules out `NaN`
#     and the infinities, which do have a `toString`.
#  2. The DEFAULT is returned verbatim, never transformed. `safeStringLower`
#     lowercases the value it found, not the caller's fallback:
#     `safeStringLower (dict, 'nonexistent', 'MiXed_Case')` is `'MiXed_Case'`.
#     Lowercasing the default is a silent data corruption for anything
#     case-sensitive (an order id, a signature, a network code).
#  3. The default is returned as-is even when it is not a string — no
#     coercion, no case change.
#
# `prop`/`getValueFromKeysInArray` already map the JS "absent" cases (missing
# key, `''`, `null`) onto `nothing`, so this only has to classify what they
# hand back.
function _safeStringCoerce(x, default_var, transform)
    # `String(::String)` is the identity, so this only materialises the
    # `SubString` views that `split`/`getindex` hand back. Returning one of
    # those verbatim would be closer to TS (which returns the same object) but
    # it leaks a non-`String` type into a codebase whose helpers — the
    # `Precise` `string*` wrappers above all — are declared `::String`.
    isa(x, AbstractString) && return transform(String(x))
    # `isa(true, Integer)` holds in Julia (Bool <: Integer) but JS's
    # `Number.isFinite (true)` is false, so booleans are excluded explicitly.
    # `_jsNumberToString` is the port of `Number.prototype.toString`, which is
    # what TS's `String (x)` calls here — Julia's own `string` renders
    # `1e-7` as "1.0e-7" where JS gives "1e-7".
    if isa(x, Real) && !isa(x, Bool) && isfinite(x)
        return transform(_jsNumberToString(x))
    end
    return default_var
end
function safeString(o, k, default_var=nothing)
    return _safeStringCoerce(prop(o, k), default_var, identity)
end
function safeStringLower(o, k, default_var=nothing)
    return _safeStringCoerce(prop(o, k), default_var, lowercase)
end
function safeStringUpper(o, k, default_var=nothing)
    return _safeStringCoerce(prop(o, k), default_var, uppercase)
end
function safeFloat2(o, k1, k2, default_var=nothing)
    n = asFloat(prop2(o, k1, k2));
    return functions.ccxtruthy(isNumber(n)) ? n : default_var
end;
function safeInteger2(o, k1, k2, default_var)

end


function safeInteger2(o, k1, k2, default_var=nothing)

end


function safeInteger2(o, k1, k2, default_var=nothing)

    n = asInteger(prop2(o, k1, k2));
    return functions.ccxtruthy(isNumber(n)) ? n : default_var
end


function safeIntegerProduct2(o, k1, k2, factor, default_var=nothing)
    n = asFloat(prop2(o, k1, k2));
    return functions.ccxtruthy(isNumber(n)) ? ccxt_parseInt(n * factor) : default_var
end;
function safeTimestamp2(o, k1, k2, default_var=nothing)
    n = asFloat(prop2(o, k1, k2));
    return functions.ccxtruthy(isNumber(n)) ? ccxt_parseInt(n * 1000) : default_var
end;
function safeValue2(o, k1, k2, default_var=nothing)
    x = prop2(o, k1, k2);
    return functions.ccxtruthy(hasProps(x)) ? x : default_var
end;
function safeString2(o, k1, k2, default_var=nothing)
    return _safeStringCoerce(prop2(o, k1, k2), default_var, identity)
end
function safeStringLower2(o, k1, k2, default_var=nothing)
    return _safeStringCoerce(prop2(o, k1, k2), default_var, lowercase)
end
function safeStringUpper2(o, k1, k2, default_var=nothing)
    return _safeStringCoerce(prop2(o, k1, k2), default_var, uppercase)
end
function safeFloatN(o, k, default_var=nothing)
    n = asFloat(getValueFromKeysInArray(o, k));
    return functions.ccxtruthy(isNumber(n)) ? n : default_var
end;
function safeIntegerN(o, k, default_var)

end


function safeIntegerN(o, k, default_var=nothing)

end


function safeIntegerN(o, k, default_var=nothing)

    if functions.ccxtruthy(o == nothing)
            return default_var
    end
    n = asInteger(getValueFromKeysInArray(o, k));
    return functions.ccxtruthy(isNumber(n)) ? n : default_var
end


function safeIntegerProductN(o, k, factor, default_var=nothing)
    n = asFloat(getValueFromKeysInArray(o, k));
    return functions.ccxtruthy(isNumber(n)) ? ccxt_parseInt(n * factor) : default_var
end;
function safeTimestampN(o, k, default_var=nothing)
    n = asFloat(getValueFromKeysInArray(o, k));
    return functions.ccxtruthy(isNumber(n)) ? ccxt_parseInt(n * 1000) : default_var
end;
function safeValueN(o, k, default_var=nothing)
    if functions.ccxtruthy(o == nothing)
        return default_var
end

    x = getValueFromKeysInArray(o, k);
    return functions.ccxtruthy(hasProps(x)) ? x : default_var
end;
function safeStringN(o, k, default_var=nothing)
    o === nothing && return default_var
    return _safeStringCoerce(getValueFromKeysInArray(o, k), default_var, identity)
end
function safeStringLowerN(o, k, default_var=nothing)
    o === nothing && return default_var
    return _safeStringCoerce(getValueFromKeysInArray(o, k), default_var, lowercase)
end
function safeStringUpperN(o, k, default_var=nothing)
    o === nothing && return default_var
    return _safeStringCoerce(getValueFromKeysInArray(o, k), default_var, uppercase)
end
export isNumber, isInteger, isArray, isObject, isString, isStringCoercible, isDict, hasProps, prop, asFloat, asInteger, safeFloat, safeInteger, safeIntegerProduct, safeTimestamp, safeValue, safeString, safeStringLower, safeStringUpper, safeFloat2, safeInteger2, safeIntegerProduct2, safeTimestamp2, safeValue2, safeString2, safeStringLower2, safeStringUpper2, safeFloatN, safeIntegerN, safeIntegerProductN, safeTimestampN, safeValueN, safeStringN, safeStringLowerN, safeStringUpperN


# --- Julia runtime overrides (transpiled platform detection is Node-centric) ---
isNode = false
isBrowser = false
isWebWorker = false
isDeno = false
isElectron = false
isBun = false

# JS Array.indexOf - returns the index of the first occurrence of an element, or -1 if not found
# JS `haystack.indexOf (needle)`. The transpiler turns a method call into a free
# function with the receiver last, so the needle comes first. The result is a
# 0-based offset, or -1 when absent, exactly like JS — call sites compare against
# literal indices (`indexOf ('-') === 8`) so the base must not drift.
function ccxt_indexOf(element, haystack, fromIndex=0)
    haystack === nothing && return -1
    start = Int(fromIndex) + 1
    if haystack isa AbstractString
        start > length(haystack) + 1 && return -1
        needle = element isa AbstractString ? element : string(element)
        # Search over character indices so the answer counts characters, not bytes.
        chars = collect(haystack)
        needleChars = collect(needle)
        n = length(needleChars)
        n == 0 && return Int(fromIndex)
        for i in max(start, 1):(length(chars) - n + 1)
            if view(chars, i:(i + n - 1)) == needleChars
                return i - 1
            end
        end
        return -1
    end
    if haystack isa AbstractArray
        start > length(haystack) && return -1
        idx = findnext(isequal(element), haystack, max(start, 1))
        return idx === nothing ? -1 : idx - 1
    end
    return -1
end

"""
    ccxt_slice(subject, first, second=nothing)

`Array.prototype.slice` / `String.prototype.slice` semantics for Julia.

JS slicing is zero-based, the end index is exclusive, negative indices count back
from the end, and out-of-range indices are clamped instead of raising. Julia's
native `a[i:j]` does none of that, so a naive `a[first + 1:second]` translation
throws `BoundsError` the moment CCXT does something like `arraySlice(result, -limit)`
(a very common "take the last N entries" idiom). This helper restores the JS
behaviour so transpiled call sites keep working.

`first`/`second` may be `nothing`, meaning "argument omitted" (0 and `length`).
Strings are sliced by character, matching `ccxt_indexOf`.
"""
function ccxt_slice(subject, first, second=nothing)
    subject === nothing && return nothing
    if subject isa AbstractString
        chars = collect(subject)
        lo, hi = _ccxt_slice_range(length(chars), first, second)
        return lo > hi ? "" : String(chars[lo:hi])
    end
    if subject isa AbstractArray
        lo, hi = _ccxt_slice_range(length(subject), first, second)
        return lo > hi ? similar(subject, 0) : subject[lo:hi]
    end
    return subject
end

# Translate a JS (start, end) pair into an inclusive 1-based Julia range for a
# collection of `n` elements. Returns `(lo, hi)` with `lo > hi` for an empty slice.
function _ccxt_slice_range(n::Integer, first, second)
    start = _ccxt_slice_index(first, n, 0)
    stop = _ccxt_slice_index(second, n, n)
    start = clamp(start, 0, n)
    stop = clamp(stop, 0, n)
    # `start` is inclusive and zero-based, `stop` is exclusive: shift both by one.
    return (start + 1, stop)
end

# A single JS index: `nothing` falls back to `default`, negatives count from the end.
function _ccxt_slice_index(value, n::Integer, default::Integer)
    (value === nothing || value === missing) && return Int(default)
    idx = value isa Integer ? Int(value) : Int(trunc(Float64(value)))
    return idx < 0 ? n + idx : idx
end

# JS Array.splice - removes elements from an array and optionally inserts new elements
# Returns the removed elements
function ccxt_splice(array, start, deleteCount=0, replacementElements...)
    if array isa AbstractArray
        start = max(1, start)
        deleteCount = min(deleteCount, length(array) - start + 1)
        removed = array[start:start+deleteCount-1]
        if length(replacementElements) > 0
            splice!(array, start:start+deleteCount-1, replacementElements)
        else
            deleteat!(array, start:start+deleteCount-1)
        end
        return removed
    end
    return []
end

# JS Array.find - returns the first element that satisfies a predicate function
function ccxt_find(array, predicate)
    if array isa AbstractArray
        for element in array
            if predicate(element)
                return element
            end
        end
    end
    return nothing
end

# JS Object.getPrototypeOf - returns the prototype of an object
function getPrototypeOf(obj)
    if obj isa Dict
        return nothing
    end
    return nothing
end

# JS unCamelCase - converts camelCase to snake_case
function ccxt_unCamelCaseProperties(obj)
    if obj isa Dict
        result = Dict()
        for (k, v) in obj
            newKey = string(k)
            # Convert camelCase to snake_case
            newKey = replace(newKey, r"([a-z])([A-Z])" => s"\1_\2")
            newKey = lowercase(newKey)
            result[Symbol(newKey)] = v
        end
        return result
    end
    return obj
end

# Module-local `get` alias. This shadows `Base.get` ONLY within `Ccxt.functions`
# (and anywhere `using .functions` brings it in — i.e. the `Ccxt` module and
# the generated exchange files), so every generated `get(...)` call site stays
# unchanged even though `ccxt_get` is the real implementation. It does NOT
# mutate `Base.get`, so an unrelated `using Ccxt` does not change how `get`
# behaves on `Dict`/`Nothing`/`Module`/`AbstractVector` for the rest of the
# session. `CcxtExchange`/`Exchange`/`Number`/`AbstractString` arguments still
# reach the existing `Base.get` overloads via `ccxt_get`'s generic fallback.
# It is deliberately NOT exported: exporting it would make `using Ccxt.functions`
# (in the test preamble) ambiguous with `Base.get` and break the shared `get`.
const get = ccxt_get

end # module functions
