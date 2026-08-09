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

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bybiteu, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Bybiteu(; kwargs...)
    inst = Bybiteu(Bybit(), describe)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
