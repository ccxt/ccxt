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
        Symbol("fetchBidsAsks") => true,
        Symbol("transfer") => true
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
"""
fetches the bid and ask price and volume for multiple markets

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
function fetchBidsAsks(self::Kucoinfutures; symbols=nothing, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("method") => "futuresPublicGetAllTickers"
    );
    return Base.fetch(self.fetchTickers(symbols = symbols, params = extend(request, params)))

end
"""
transfer currency internally between wallets on the same account

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
function transfer(self::Kucoinfutures, code, amount, fromAccount, toAccount; params=Dict())
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
    data = self.safeDict(response, "data", defaultValue = Dict{Symbol, Any}());
    return extend(self.parseTransfer(data, currency = currency), Dict{Symbol, Any}(
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

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Kucoinfutures, name::Symbol) = ccxt_getproperty(self, name)
# (undefined suppressed)
function Kucoinfutures(; kwargs...)
    inst = Kucoinfutures(Kucoin(), describe, fetchBidsAsks, transfer, parseTransferType)
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


# Per-exchange docstring holders (see build/juliaTranspileCLI.ts buildDocRegistrySource).
function __ccxt_doc_Kucoinfutures_fetchBidsAsks() end
"""
fetches the bid and ask price and volume for multiple markets

# Arguments
- `symbols`::array, optional: unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
"""
__ccxt_doc_Kucoinfutures_fetchBidsAsks

function __ccxt_doc_Kucoinfutures_transfer() end
"""
transfer currency internally between wallets on the same account

# Arguments
- `code`::string: unified currency code
- `amount`::float: amount to transfer
- `fromAccount`::string: account to transfer from
- `toAccount`::string: account to transfer to
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
"""
__ccxt_doc_Kucoinfutures_transfer
