@kwdef mutable struct Kucoineu <: CcxtExchange
    parent::Union{Kucoin, Nothing} = Kucoin()
    describe::Function = describe
end
function describe(self::Kucoineu, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "kucoineu",
    Symbol("name") => "KuCoin EU",
    Symbol("countries") => ["EU"],
    Symbol("hostname") => "kucoin.eu",
    Symbol("certified") => false,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.kucoin.eu",
            Symbol("private") => "https://api.kucoin.eu"
        ),
        Symbol("www") => "https://www.kucoin.com/en-eu",
        Symbol("doc") => ["https://www.kucoin.com/en-eu/docs-new"]
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("mica") => true
    )
))

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Kucoineu, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Kucoineu(; kwargs...)
    inst = Kucoineu(Kucoin(), describe)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
