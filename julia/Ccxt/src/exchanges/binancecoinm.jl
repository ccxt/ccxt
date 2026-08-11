@kwdef mutable struct Binancecoinm <: CcxtExchange
    parent::Union{Binance, Nothing} = Binance()
    describe::Function = describe
    transferIn::Function = transferIn
    transferOut::Function = transferOut
end
function describe(self::Binancecoinm, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "binancecoinm",
    Symbol("name") => "Binance COIN-M",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/387cfc4e-5f33-48cd-8f5c-cd4854dabf0c",
        Symbol("doc") => ["https://binance-docs.github.io/apidocs/delivery/en/", "https://binance-docs.github.io/apidocs/spot/en", "https://developers.binance.com/en"]
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => nothing,
        Symbol("createStopMarketOrder") => true
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["inverse"]
        ),
        Symbol("defaultSubType") => "inverse",
        Symbol("leverageBrackets") => nothing
    )
))

end
function transferIn(self::Binancecoinm, code, amount, params=Dict())
    return Base.fetch(self.futuresTransfer(code, amount, 3, params))

end
function transferOut(self::Binancecoinm, code, amount, params=Dict())
    return Base.fetch(self.futuresTransfer(code, amount, 4, params))

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Binancecoinm, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Binancecoinm(; kwargs...)
    inst = Binancecoinm(Binance(), describe, transferIn, transferOut)
    # describe() first, then the user config — the same order, and the same
    # merge rule, as the TS base constructor (Exchange.ts, "merge constructor
    # overrides to this instance"): a plain object is deep-merged onto the
    # current value, anything else is assigned. Assigning dictionaries
    # wholesale would drop the base defaults an exchange does not restate —
    # e.g. `options.defaultNetworkCodeReplacements`, which every
    # networkIdToCode lookup needs.
    #
    # `features` is the exception, and is assigned rather than merged.
    # Julia models inheritance by composition, so a child's `parent` is a
    # fully-built instance that has already run `afterConstruct` — and
    # `featuresGenerator` rewrites `features` in place, expanding the raw
    # `{'default': ...}` / `{'swap': {'extends': ...}}` shorthand into a
    # per-market-type table and recording absent types as `nothing`. Merging
    # that derived table with the raw `describe()` value it was derived from
    # feeds the generator its own output on the child's pass: a market type
    # the parent recorded as absent comes back as a present-but-`nothing`
    # entry, which the generator then tries to index into. In TS the
    # generator only ever sees the raw value, so assign it here too.
    desc = inst.describe()
    for (k, v) in desc
        key = Symbol(k)
        if v isa AbstractDict && key !== :features
            inst[key] = deepExtend(get(inst, key, nothing), v)
        else
            inst[key] = v
        end
    end
    for (k, v) in kwargs
        if v isa AbstractDict && k !== :features
            inst[k] = deepExtend(get(inst, k, nothing), v)
        else
            inst[k] = v
        end
    end
    # Re-run the tail of the TS base constructor now that this exchange's
    # own describe() has been merged in. The composed parent Exchange only
    # ever saw the base describe(), so these derived values are still the
    # base ones until they are recomputed here.
    #
    # defineRestApi is deliberately not repeated: the generator emits every
    # api endpoint as a real Julia function (and a struct field), so the
    # dynamic closures the TS constructor installs have no work to do.
    for k in objectKeys(inst.has)
        inst[Symbol(string("has", capitalize(k)))] = ccxtruthy(get(inst.has, Symbol(k), nothing))
    end
    newUpdates = get(inst.options, Symbol("newUpdates"), nothing)
    inst.newUpdates = newUpdates === nothing ? true : newUpdates
    # afterConstruct already honours `options.sandbox`/`options.testnet`; the
    # TS constructor's extra `setSandboxMode` call reads the *user config*,
    # which arrives here as kwargs. Repeating the options-based check would
    # swap the api/test URLs a second time and clobber the apiBackup snapshot.
    inst.afterConstruct()
    if ccxtruthy(get(kwargs, :sandbox, false)) || ccxtruthy(get(kwargs, :testnet, false))
        inst.setSandboxMode(true)
    end
    inst.loadExchangeSpecificFiles()
    return inst
end
