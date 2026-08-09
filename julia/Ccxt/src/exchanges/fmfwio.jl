@kwdef mutable struct Fmfwio <: CcxtExchange
    parent::Union{Hitbtc, Nothing} = Hitbtc()
    describe::Function = describe
end
function describe(self::Fmfwio, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "fmfwio",
    Symbol("name") => "FMFW.io",
    Symbol("countries") => ["KN"],
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/159177712-b685b40c-5269-4cea-ac83-f7894c49525d.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.fmfw.io/api/3",
            Symbol("private") => "https://api.fmfw.io/api/3"
        ),
        Symbol("www") => "https://fmfw.io",
        Symbol("doc") => "https://api.fmfw.io/",
        Symbol("fees") => "https://fmfw.io/fees-and-limits",
        Symbol("referral") => "https://fmfw.io/referral/da948b21d6c92d69"
    ),
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("maker") => self.parseNumber("0.005"),
            Symbol("taker") => self.parseNumber("0.005")
        )
    )
))

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Fmfwio, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Fmfwio(; kwargs...)
    inst = Fmfwio(Hitbtc(), describe)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
