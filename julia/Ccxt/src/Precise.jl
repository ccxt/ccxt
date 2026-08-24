# Precise — arbitrary-precision decimal arithmetic for CCXT, ported from ts/src/base/Precise.ts
#
# This is a hand-written, correct Julia implementation (the early-stage TS->Julia
# transpiler does not yet transpile non-trivial function bodies). It mirrors the
# TypeScript `Precise` class: a decimal value stored as a big-integer `integer`
# scaled by `decimals` powers of ten.
#
# NAMING: the module is `PreciseArith`, not `Precise`, so that the *type*
# `Precise` can be imported into `Ccxt` under its own name. Julia gives a
# submodule binding precedence over any same-named name a `using` would bring
# in — `using .Precise: Precise` inside `module Ccxt` is silently ignored
# ("import of Precise.Precise into Ccxt conflicts with an existing identifier"),
# leaving the bare name `Precise` bound to the module. Transpiled exchanges
# emit `new Precise (x)` as `Precise(x)` (binance/aster/bitget/phemex), which
# then failed at runtime with "objects of type Module are not callable".
# Distinguishing the two names is what makes the constructor reachable.

module PreciseArith

const _base = BigInt(10)
const _zero = BigInt(0)
const _minusOne = BigInt(-1)

# Rounding / counting-mode constants (referenced by BaseMethods.jl via functions.*)
const TRUNCATE = 0
const ROUND = 1
const ROUND_UP = 2
const ROUND_DOWN = 3
const DECIMAL_PLACES = 2
const SIGNIFICANT_DIGITS = 3
const TICK_SIZE = 4
const NO_PADDING = 5
const PAD_WITH_ZERO = 6

mutable struct Precise
    integer::BigInt
    decimals::Int
end

function Precise(number::Union{BigInt,String,Int}, decimals::Union{Int,Nothing} = nothing)
    if decimals === nothing
        modifier = 0
        s = lowercase(string(number))
        if occursin("e", s)
            parts = split(s, "e")
            s = parts[1]
            modifier = parse(Int, parts[2])
        end
        di = findfirst(isequal('.'), s)
        ndecimals = (di !== nothing) ? length(s) - (di - 1) - 1 : 0
        integerString = replace(s, "." => "")
        integer = parse(BigInt, integerString)
        decimals = ndecimals - modifier
        return Precise(integer, decimals)
    else
        return Precise(BigInt(number), decimals)
    end
end

function mul(p::Precise, other::Precise)
    integerResult = p.integer * other.integer
    return Precise(integerResult, p.decimals + other.decimals)
end

function div(p::Precise, other::Precise, precision = 18)
    distance = precision - p.decimals + other.decimals
    if distance == 0
        numerator = p.integer
    elseif distance < 0
        exponent = _base ^ BigInt(-distance)
        numerator = p.integer ÷ exponent
    else
        exponent = _base ^ BigInt(distance)
        numerator = p.integer * exponent
    end
    result = numerator ÷ other.integer
    return Precise(result, precision)
end

function add(p::Precise, other::Precise)
    if p.decimals == other.decimals
        integerResult = p.integer + other.integer
        return Precise(integerResult, p.decimals)
    else
        if p.decimals > other.decimals
            smaller, bigger = other, p
        else
            smaller, bigger = p, other
        end
        exponent = bigger.decimals - smaller.decimals
        normalised = smaller.integer * (_base ^ BigInt(exponent))
        result = normalised + bigger.integer
        return Precise(result, bigger.decimals)
    end
end

function mod(p::Precise, other::Precise)
    rationizerNumerator = Base.max(-p.decimals + other.decimals, 0)
    numerator = p.integer * (_base ^ BigInt(rationizerNumerator))
    rationizerDenominator = Base.max(-other.decimals + p.decimals, 0)
    denominator = other.integer * (_base ^ BigInt(rationizerDenominator))
    result = numerator % denominator
    return Precise(result, rationizerDenominator + other.decimals)
end

function sub(p::Precise, other::Precise)
    negative = Precise(-other.integer, other.decimals)
    return add(p, negative)
end

function abs(p::Precise)
    return Precise(p.integer < 0 ? p.integer * _minusOne : p.integer, p.decimals)
end

function neg(p::Precise)
    return Precise(-p.integer, p.decimals)
end

function or(p::Precise, other::Precise)
    integerResult = p.integer | other.integer
    return Precise(integerResult, p.decimals)
end

function min(p::Precise, other::Precise)
    return lt(p, other) ? p : other
end

function max(p::Precise, other::Precise)
    return gt(p, other) ? p : other
end

function gt(p::Precise, other::Precise)
    sum = sub(p, other)
    return sum.integer > 0
end

function ge(p::Precise, other::Precise)
    sum = sub(p, other)
    return sum.integer >= 0
end

function lt(p::Precise, other::Precise)
    return gt(other, p)
end

function le(p::Precise, other::Precise)
    return ge(other, p)
end

function reduce(p::Precise)
    s = string(p.integer)
    start = length(s) - 1
    if start == 0
        if s == "0"
            p.decimals = 0
        end
        return p
    end
    i = start
    while i >= 0
        if s[i+1] != '0'
            break
        end
        i -= 1
    end
    difference = start - i
    if difference == 0
        return p
    end
    p.decimals -= difference
    p.integer = parse(BigInt, s[1:(i+1)])
    return p
end

function equals(p::Precise, other)
    reduce(p)
    reduce(other)
    return (p.decimals == other.decimals) && (p.integer == other.integer)
end

function stringify(p::Precise)
    reduce(p)
    sign = p.integer < 0 ? "-" : ""
    absv = p.integer < 0 ? -p.integer : p.integer
    integerArray = collect(string(absv, base = Int(_base)))
    if p.decimals > 0 && length(integerArray) < p.decimals
        integerArray = vcat(fill('0', p.decimals - length(integerArray)), integerArray)
    end
    index = length(integerArray) - p.decimals
    if index == 0
        item = "0."
    elseif p.decimals < 0
        item = repeat("0", -p.decimals)
    elseif p.decimals == 0
        item = ""
    else
        item = "."
    end
    if p.decimals < 0
        append!(integerArray, collect(item))
    elseif index >= 0
        splice!(integerArray, (index + 1):index, collect(item))
    else
        append!(integerArray, collect(item))
    end
    return sign * join(integerArray)
end

# `stringify` is the port of TS `Precise.prototype.toString()`. Transpiled
# exchange code reaches it through two spellings, both wired up here:
#
#   * `rounder.toString ()`      -> `string(rounder)`            (binance, aster, bitget, phemex)
#   * `precise.decimals`         -> `get(precise, :decimals, …)` (bitget, phemex)
#
# `Base.string` dispatches through `Base.print`/`show`, so defining `show` is
# what makes `string(p)` and string interpolation both yield the decimal text
# rather than the struct's default `Precise(BigInt, Int)` rendering.
Base.show(io::IO, p::Precise) = print(io, stringify(p))

# JS property reads on a `Precise` instance (`precise.decimals`) are emitted by
# the transpiler as `get(obj, Symbol("decimals"), nothing)`, the same shape it
# uses for plain objects. `Base.get` has no method for structs, so mirror the
# `CcxtExchange` fallback in `CCXTBase.jl`: read the field when it exists,
# otherwise return the default (JS `undefined`).
function Base.get(p::Precise, key::Symbol, default)
    return hasfield(Precise, key) ? getfield(p, key) : default
end

# --- string* static helpers (mirror Precise.stringMul / stringDiv / ...) ---
# Return `nothing` for undefined inputs, matching the TypeScript contract.

function stringMul(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return nothing
    end
    return stringify(mul(Precise(string1), Precise(string2)))
end

function stringDiv(string1::Union{String,Nothing}, string2::Union{String,Nothing}, precision = 18)
    if string1 === nothing || string2 === nothing
        return nothing
    end
    string2Precise = Precise(string2)
    if string2Precise.integer == _zero
        return nothing
    end
    return stringify(div(Precise(string1), string2Precise, precision))
end

function stringAdd(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return nothing
    end
    return stringify(add(Precise(string1), Precise(string2)))
end

function stringSub(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return nothing
    end
    return stringify(sub(Precise(string1), Precise(string2)))
end

function stringAbs(string::Union{String,Nothing})
    if string === nothing
        return nothing
    end
    return stringify(abs(Precise(string)))
end

function stringNeg(string::Union{String,Nothing})
    if string === nothing
        return nothing
    end
    return stringify(neg(Precise(string)))
end

function stringMod(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return nothing
    end
    return stringify(mod(Precise(string1), Precise(string2)))
end

function stringOr(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return nothing
    end
    return stringify(or(Precise(string1), Precise(string2)))
end

function stringEquals(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return false
    end
    return equals(Precise(string1), Precise(string2))
end

function stringEq(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return false
    end
    return equals(Precise(string1), Precise(string2))
end

function stringMin(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return nothing
    end
    return stringify(min(Precise(string1), Precise(string2)))
end

function stringMax(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return nothing
    end
    return stringify(max(Precise(string1), Precise(string2)))
end

function stringGt(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return false
    end
    return gt(Precise(string1), Precise(string2))
end

function stringGe(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return false
    end
    return ge(Precise(string1), Precise(string2))
end

function stringLt(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return false
    end
    return lt(Precise(string1), Precise(string2))
end

function stringLe(string1::Union{String,Nothing}, string2::Union{String,Nothing})
    if string1 === nothing || string2 === nothing
        return false
    end
    return le(Precise(string1), Precise(string2))
end

export Precise, TRUNCATE, ROUND, ROUND_UP, ROUND_DOWN, DECIMAL_PLACES,
       SIGNIFICANT_DIGITS, TICK_SIZE, NO_PADDING, PAD_WITH_ZERO,
       mul, div, add, mod, sub, abs, neg, or, min, max, gt, ge, lt, le,
       reduce, equals, stringify,
       stringMul, stringDiv, stringAdd, stringSub, stringAbs, stringNeg,
       stringMod, stringOr, stringEquals, stringEq, stringMin, stringMax,
       stringGt, stringGe, stringLt, stringLe

end # module PreciseArith
