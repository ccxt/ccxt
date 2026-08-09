@kwdef mutable struct Binanceusdm <: CcxtExchange
    parent::Union{Binance, Nothing} = Binance()
    describe::Function = describe
    transferIn::Function = transferIn
    transferOut::Function = transferOut
end
function describe(self::Binanceusdm, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "binanceusdm",
    Symbol("name") => "Binance USDⓈ-M",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/871cbea7-eebb-4b28-b260-c1c91df0487a",
        Symbol("doc") => ["https://binance-docs.github.io/apidocs/futures/en/", "https://binance-docs.github.io/apidocs/spot/en", "https://developers.binance.com/en"]
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
            Symbol("types") => ["linear"]
        ),
        Symbol("defaultType") => "swap",
        Symbol("defaultSubType") => "linear",
        Symbol("leverageBrackets") => nothing,
        Symbol("marginTypes") => Dict{Symbol, Any}(),
        Symbol("marginModes") => Dict{Symbol, Any}()
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-5021") => InvalidOrder,
            Symbol("-5022") => InvalidOrder,
            Symbol("-5028") => InvalidOrder
        )
    )
))

end
function transferIn(self::Binanceusdm, code, amount, params=Dict())
    return Base.fetch(self.futuresTransfer(code, amount, 1, params))

end
function transferOut(self::Binanceusdm, code, amount, params=Dict())
    return Base.fetch(self.futuresTransfer(code, amount, 2, params))

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Binanceusdm, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Binanceusdm(; kwargs...)
    inst = Binanceusdm(Binance(), describe, transferIn, transferOut)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
