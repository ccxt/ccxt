@kwdef mutable struct Gateeu <: CcxtExchange
    parent::Union{Gate, Nothing} = Gate()
    describe::Function = describe
end
function describe(self::Gateeu, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "gateeu",
    Symbol("name") => "Gate EU",
    Symbol("countries") => ["EU"],
    Symbol("version") => "v4",
    Symbol("rateLimit") => 20,
    Symbol("pro") => true,
    Symbol("certified") => false,
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => Dict{Symbol, Any}(
                Symbol("wallet") => "https://api.gateeu.com/api/v4",
                Symbol("margin") => "https://api.gateeu.com/api/v4",
                Symbol("spot") => "https://api.gateeu.com/api/v4",
                Symbol("sub_accounts") => "https://api.gateeu.com/api/v4",
                Symbol("earn") => "https://api.gateeu.com/api/v4"
            ),
            Symbol("private") => Dict{Symbol, Any}(
                Symbol("withdrawals") => "https://api.gateeu.com/api/v4",
                Symbol("wallet") => "https://api.gateeu.com/api/v4",
                Symbol("margin") => "https://api.gateeu.com/api/v4",
                Symbol("spot") => "https://api.gateeu.com/api/v4",
                Symbol("subAccounts") => "https://api.gateeu.com/api/v4",
                Symbol("unified") => "https://api.gateeu.com/api/v4",
                Symbol("rebate") => "https://api.gateeu.com/api/v4",
                Symbol("earn") => "https://api.gateeu.com/api/v4",
                Symbol("account") => "https://api.gateeu.com/api/v4",
                Symbol("loan") => "https://api.gateeu.com/api/v4",
                Symbol("otc") => "https://api.gateeu.com/api/v4"
            )
        )
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
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["spot"]
        ),
        Symbol("mica") => true
    )
))

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Gateeu, name::Symbol) = ccxt_getproperty(self, name)

function Gateeu(; kwargs...)
    inst = Gateeu(Gate(), describe)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
