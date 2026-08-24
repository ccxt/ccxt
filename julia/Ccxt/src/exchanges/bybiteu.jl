@kwdef mutable struct Bybiteu <: CcxtExchange
    parent::Union{Bybit, Nothing} = Bybit()
    describe::Function = describe
end
function describe(self::Bybiteu, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bybiteu",
    Symbol("name") => "Bybit EU",
    Symbol("countries") => ["EU"],
    Symbol("version") => "v5",
    Symbol("rateLimit") => 20,
    Symbol("hostname") => "bybit.eu",
    Symbol("pro") => true,
    Symbol("certified") => false,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("spot") => "https://api-testnet.{hostname}",
            Symbol("futures") => "https://api-testnet.{hostname}",
            Symbol("v2") => "https://api-testnet.{hostname}",
            Symbol("public") => "https://api-testnet.{hostname}",
            Symbol("private") => "https://api-testnet.{hostname}"
        ),
        Symbol("logo") => "https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("spot") => "https://api.{hostname}",
            Symbol("futures") => "https://api.{hostname}",
            Symbol("v2") => "https://api.{hostname}",
            Symbol("public") => "https://api.{hostname}",
            Symbol("private") => "https://api.{hostname}"
        ),
        Symbol("demotrading") => Dict{Symbol, Any}(
            Symbol("spot") => "https://api-demo.{hostname}",
            Symbol("futures") => "https://api-demo.{hostname}",
            Symbol("v2") => "https://api-demo.{hostname}",
            Symbol("public") => "https://api-demo.{hostname}",
            Symbol("private") => "https://api-demo.{hostname}"
        ),
        Symbol("www") => "https://www.bybit.com",
        Symbol("doc") => ["https://bybit-exchange.github.io/docs/inverse/", "https://bybit-exchange.github.io/docs/linear/", "https://github.com/bybit-exchange"],
        Symbol("fees") => "https://help.bybit.com/hc/en-us/articles/360039261154",
        Symbol("referral") => "https://www.bybit.com/invite?ref=XDK12WP"
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => true,
        Symbol("spot") => true,
        Symbol("margin") => true,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => nothing
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("mica") => true
    )
))

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bybiteu, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Bybiteu(; kwargs...)
    inst = Bybiteu(Bybit(), describe)
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
