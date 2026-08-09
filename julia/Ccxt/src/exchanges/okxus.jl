@kwdef mutable struct Okxus <: CcxtExchange
    parent::Union{Okx, Nothing} = Okx()
    describe::Function = describe
end
function describe(self::Okxus, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "okxus",
    Symbol("name") => "OKX (US)",
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("hostname") => "us.okx.com",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("rest") => "https://{hostname}"
        ),
        Symbol("www") => "https://app.okx.com",
        Symbol("doc") => "https://app.okx.com/docs-v5/en/#overview",
        Symbol("fees") => "https://app.okx.com/pages/products/fees.html",
        Symbol("referral") => Dict{Symbol, Any}(
            Symbol("url") => "https://www.app.okx.com/join/CCXT2023",
            Symbol("discount") => 0.2
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("rest") => "https://{hostname}"
        )
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => true,
        Symbol("future") => false,
        Symbol("option") => false
    ),
    Symbol("features") => Dict{Symbol, Any}(
        Symbol("future") => Dict{Symbol, Any}(
            Symbol("linear") => nothing,
            Symbol("inverse") => nothing
        )
    )
))

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Okxus, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Okxus(; kwargs...)
    inst = Okxus(Okx(), describe)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
