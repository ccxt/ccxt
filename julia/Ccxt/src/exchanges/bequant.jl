@kwdef mutable struct Bequant <: CcxtExchange
    parent::Union{Hitbtc, Nothing} = Hitbtc()
    describe::Function = describe
end
function describe(self::Bequant, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "bequant",
    Symbol("name") => "Bequant",
    Symbol("pro") => true,
    Symbol("countries") => ["MT"],
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => true,
        Symbol("margin") => nothing,
        Symbol("swap") => false,
        Symbol("future") => nothing,
        Symbol("option") => nothing
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/01e199a6-5c65-4b03-83ab-7f9827c140f9",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.bequant.io/api/3",
            Symbol("private") => "https://api.bequant.io/api/3"
        ),
        Symbol("www") => "https://bequant.io",
        Symbol("doc") => ["https://api.bequant.io/"],
        Symbol("fees") => ["https://bequant.io/fees-and-limits"],
        Symbol("referral") => "https://bequant.io/referral/dd104e3bee7634ec"
    )
))

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Bequant, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Bequant(; kwargs...)
    inst = Bequant(Hitbtc(), describe)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
