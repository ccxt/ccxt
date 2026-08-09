@kwdef mutable struct Kucoinfutures <: CcxtExchange
    parent::Union{Kucoin, Nothing} = Kucoin()
    describe::Function = describe
    fetchBidsAsks::Function = fetchBidsAsks
    transfer::Function = transfer
    parseTransferType::Function = parseTransferType
end
function describe(self::Kucoinfutures, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "kucoinfutures",
    Symbol("name") => "KuCoin Futures",
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg",
        Symbol("www") => "https://futures.kucoin.com/",
        Symbol("referral") => "https://futures.kucoin.com/?rcode=E5wkqe"
    ),
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => true,
        Symbol("future") => true,
        Symbol("option") => nothing,
        Symbol("fetchBidsAsks") => true
    ),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("fetchMarkets") => Dict{Symbol, Any}(
            Symbol("types") => ["swap", "future", "contract"],
            Symbol("fetchTickersFees") => false
        ),
        Symbol("defaultType") => "swap",
        Symbol("defaultAccountType") => "contract"
    )
))

end
function fetchBidsAsks(self::Kucoinfutures, symbols=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("method") => "futuresPublicGetAllTickers"
    );
    return Base.fetch(self.fetchTickers(symbols, extend(request, params)))

end
function transfer(self::Kucoinfutures, code, amount, fromAccount, toAccount, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    currency = self.currency(code);
    amountToPrecision = self.currencyToPrecision(code, amount);
    request = Dict{Symbol, Any}(
        Symbol("currency") => safeString(currency, "id"),
        Symbol("amount") => amountToPrecision
    );
    toAccountString = self.parseTransferType(toAccount);
    response = nothing;
    if functions.ccxtruthy(@functions.ccxt_or(toAccountString == "TRADE", toAccountString == "MAIN"))
        request[Symbol("recAccountType")] = toAccountString;
        response = Base.fetch(self.futuresPrivatePostTransferOut(extend(request, params)));
    elseif functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(toAccount == "future", toAccount == "swap"), toAccount == "contract"))
        request[Symbol("payAccountType")] = self.parseTransferType(fromAccount);
        response = Base.fetch(self.futuresPrivatePostTransferIn(extend(request, params)));
    else
        throw(BadRequest(string(self.id, " transfer() only supports transfers between future/swap, spot and funding accounts")));
    end
    data = self.safeDict(response, "data", Dict{Symbol, Any}());
    return extend(self.parseTransfer(data, currency), Dict{Symbol, Any}(
    Symbol("amount") => self.parseNumber(amountToPrecision),
    Symbol("fromAccount") => fromAccount,
    Symbol("toAccount") => toAccount
))

end
function parseTransferType(self::Kucoinfutures, transferType)
    transferTypes = Dict{Symbol, Any}(
        Symbol("spot") => "TRADE",
        Symbol("funding") => "MAIN"
    );
    return safeStringUpper(transferTypes, transferType, transferType)

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Kucoinfutures, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Kucoinfutures(; kwargs...)
    inst = Kucoinfutures(Kucoin(), describe, fetchBidsAsks, transfer, parseTransferType)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
