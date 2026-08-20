# Exchange is defined as a mutable struct in BaseMethods.jl
# This file provides the module-level exports for base types
export Exchange

# Abstract supertype for every generated exchange struct. The transpiler maps
# `class X extends Exchange` to `mutable struct X <: CcxtExchange` (and the root
# `Exchange` struct itself subtypes `CcxtExchange`) so that `Base` overloads
# (e.g. safe property access) dispatch across all exchanges via one type.
abstract type CcxtExchange end
export CcxtExchange

# Returns true if function `f` is a `self`-method, i.e. it has at least one
# method whose first argument is typed as a subtype of CcxtExchange. Such
# methods must be invoked with the instance as the first argument. Free
# functions (base helpers like safeString2) take no `self` and are called
# directly with the user-supplied arguments. Used by the generated
# `getproperty` closures to decide whether to inject `self`.
function ccxt_takes_self(f::Function)
    for m in methods(f)
        # A parametric method (`f(x::T, ...) where T`) has a `UnionAll` sig,
        # whose `.parameters` live on the wrapped body — unwrap before reading.
        sig = Base.unwrap_unionall(m.sig)
        sig isa DataType || continue
        params = sig.parameters
        length(params) >= 2 || continue
        arg1 = params[2]
        (isa(arg1, Type) && arg1 <: CcxtExchange) && return true
    end
    return false
end
export ccxt_takes_self

# ---------------------------------------------------------------------------
# Safe property access for the transpiler's `get(x, Symbol("prop"), nothing)`
# pattern. In TypeScript, `x.prop` works uniformly on objects, arrays, strings
# and numbers. Julia's `Base.get` only covers AbstractDict / AbstractArray, so
# we add fallbacks for primitives and mutable structs (exchange instances).
# ---------------------------------------------------------------------------

# Strings and numbers are always "toString"-coercible in JS, so `x.toString`
# must be truthy to preserve `isStringCoercible` semantics.
function Base.get(o::AbstractString, key::Symbol, default)
    return key === :toString ? String : default
end

function Base.get(o::Number, key::Symbol, default)
    return key === :toString ? Number : default
end

# Safe property access for exchange instances (all subtype `CcxtExchange`).
# The transpiler emits `get(self, Symbol("prop"), nothing)` for `self.prop`
# where `self` is typed as the exchange class. Julia's `Base.get` does not
# cover mutable structs, so we delegate to `getfield` with a `hasfield` guard
# (returning `default` for missing keys, matching JS `undefined` semantics).
function Base.get(o::CcxtExchange, key::Symbol, default)
    if hasfield(typeof(o), key)
        return getfield(o, key)
    else
        return default
    end
end

# Property writes on an exchange instance route to `parent` (the Exchange
# struct holds all state fields: last_http_response, markets, lastRestRequestTimestamp,
# ...). The generated exchange struct only carries function fields + `parent`,
# so writing a state field must land on the parent, not raise FieldError.
function Base.setproperty!(o::CcxtExchange, name::Symbol, val)
    if hasfield(typeof(o), name)
        setfield!(o, name, val)
    else
        parent = getfield(o, :parent)
        if parent !== nothing
            setproperty!(parent, name, val)
        else
            error("Property $name not found")
        end
    end
end

# Indexed reads/writes on an exchange instance (`inst[Symbol("key")]` and
# `inst[Symbol("key")] = v`) route to the parent `Exchange` (which owns the
# state fields and the type-overlay). The generated exchange struct only
# carries function fields + `parent`, so these must land on the parent.
function Base.getindex(o::CcxtExchange, key::Symbol)
    parent = getfield(o, :parent)
    if parent !== nothing
        return parent[key]
    end
    error("Property $key not found")
end

function Base.setindex!(o::CcxtExchange, val, key::Symbol)
    parent = getfield(o, :parent)
    if parent !== nothing
        parent[key] = val
        return val
    end
    error("Property $key not found")
end

function Base.getproperty(o::CcxtExchange, name::Symbol)
    # 1. Own fields (methods defined on this specific struct)
    if hasfield(typeof(o), name)
        value = getfield(o, name)
        if value isa Function
            return (args...; kwargs...) -> (ccxt_takes_self(value) ? value(o, args...; kwargs...) : value(args...; kwargs...))
        else
            return value
        end
    end
    # 2. Module-level functions (sign, fetch2, request, fetch, …).
    #    TypeScript `this.method()` is transpiled to modular functions with
    #    `self::Exchange` or `self::Binance` first arg. We preserve the
    #    ORIGINAL instance type (e.g. Binance) as self, so dispatch resolves
    #    the most specific method (sign(self::Binance, …) vs sign(self::CcxtExchange, …)).
    if isdefined(@__MODULE__, name)
        maybe_fn = getfield(@__MODULE__, name)
        if maybe_fn isa Function
            if ccxt_takes_self(maybe_fn)
                return (args...; kwargs...) -> maybe_fn(o, args...; kwargs...)
            else
                return maybe_fn
            end
        end
    end
    # 3. Data fields on the parent Exchange (id, name, markets, …).
    #    The generated exchange struct only holds function fields + parent;
    #    all state lives on the parent Exchange.
    parent = getfield(o, :parent)
    if parent !== nothing && parent !== o
        return getproperty(parent, name)
    end
    error("Property $name not found on $(typeof(o))")
end

function Base.get(o::CcxtExchange, key::Symbol, default)
    parent = getfield(o, :parent)
    if parent !== nothing
        return get(parent, key, default)
    end
    return default
end

# ---------------------------------------------------------------------------
# Shared property resolution for every generated exchange struct.
#
# Each generated `src/exchanges/<id>.jl` ends with a one-line
# `Base.getproperty(self::<Id>, name::Symbol) = ccxt_getproperty(self, name)`
# so the resolution order lives in exactly one place.
#
# Order:
#   1. Own struct fields — the exchange's own methods and the `describe()`
#      values copied onto the instance by its constructor.
#   2. For a ROOT exchange (its `parent` is the plain `Exchange` struct):
#      module-level methods that take a `self` argument, invoked with the
#      CONCRETE instance. This is what makes overriding work: `fetch2` must
#      see `self::Binance` so that `self.sign(...)` picks
#      `sign(self::Binance, ...)` rather than the base no-op. Resolving these
#      through the parent instead would bind `self::Exchange` and silently
#      run every base default.
#      Safe because no `self`-taking method name collides with an `Exchange`
#      field name or a `describe()` key.
#   3. The parent chain — data fields (`id`, `markets`, `options`, …) and, for
#      a CHILD exchange (e.g. `Binanceus` whose parent is a `Binance`), the
#      parent's own methods. Julia composition is by containment rather than
#      subtyping, so a parent method necessarily runs with the parent as
#      `self`; step 2 is deliberately skipped for children so their parent's
#      overrides still win over the base defaults.
#   4. Any remaining module-level function (free helpers that take no `self`).
# ---------------------------------------------------------------------------
function ccxt_getproperty(self::CcxtExchange, name::Symbol)
    if hasfield(typeof(self), name)
        value = getfield(self, name)
        if value isa Function
            return (args...; kwargs...) -> (ccxt_takes_self(value) ? value(self, args...; kwargs...) : value(args...; kwargs...))
        end
        return value
    end
    parent = getfield(self, :parent)
    if parent isa Exchange && isdefined(@__MODULE__, name)
        fn = getfield(@__MODULE__, name)
        if fn isa Function && ccxt_takes_self(fn)
            return (args...; kwargs...) -> fn(self, args...; kwargs...)
        end
    end
    if parent !== nothing
        try
            pvalue = getproperty(parent, name)
            if pvalue isa Function
                return (args...; kwargs...) -> (ccxt_takes_self(pvalue) ? pvalue(self, args...; kwargs...) : pvalue(args...; kwargs...))
            end
            return pvalue
        catch e
            if !(e isa ErrorException && startswith(e.msg, "Property "))
                rethrow(e)
            end
        end
    end
    if isdefined(@__MODULE__, name)
        fn = getfield(@__MODULE__, name)
        if fn isa Function
            return (args...; kwargs...) -> (ccxt_takes_self(fn) ? fn(self, args...; kwargs...) : fn(args...; kwargs...))
        end
    end
    error("Property $name not found")
end
export ccxt_getproperty

# ---------------------------------------------------------------------------
# Docstring resolution for instance-method access (`@doc e.fetchOHLCV`).
#
# The `@doc` macro resolves `@doc e.method` by building a `Docs.Binding(e,
# :method)` and looking it up via `binding_module`/`getfield`. But `Binding`
# only accepts `(::Module, ::Symbol)` — there is no `(::CcxtExchange, ::Symbol)`
# constructor — so by default `@doc e.fetchOHLCV` raises
# `MethodError: no method matching Base.Docs.Binding(::Binance, ::Symbol)`.
#
# The generated exchange functions are registered as module-level bindings
# (`Ccxt.fetchOHLCV`, …) carrying their TS-sourced docstrings. An exchange
# instance `e` merely *exposes* those via `getproperty`. We therefore redirect
# an instance binding to the module binding of the same name, so `@doc` finds
# the function's real, registered docstring. This covers every unified method
# on every exchange at once — no per-method annotation needed.
# ---------------------------------------------------------------------------
# Redirect an instance-method binding (`@doc e.fetchOHLCV`) to the per-exchange
# docstring holder generated for that method (see buildDocRegistrySource in
# build/juliaTranspileCLI.ts). `nameof(typeof(o))` is the PascalCase exchange
# struct (e.g. `Binance`), matching the holder name `__ccxt_doc_Binance_fetchOHLCV`.
# If a given method has no generated holder, fall back to the generic module
# binding so `@doc` still resolves whatever docstring exists.
function Base.Docs.Binding(o::CcxtExchange, v::Symbol)
    ex = nameof(typeof(o))
    docSym = Symbol("__ccxt_doc_", ex, "_", v)
    if isdefined(@__MODULE__, docSym)
        return Base.Docs.Binding(@__MODULE__, docSym)
    end
    return Base.Docs.Binding(@__MODULE__, v)
end
