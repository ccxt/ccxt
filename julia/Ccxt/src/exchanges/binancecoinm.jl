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

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Binancecoinm, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Binancecoinm(; kwargs...)
    inst = Binancecoinm(Binance(), describe, transferIn, transferOut)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
