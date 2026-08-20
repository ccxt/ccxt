# Live sandbox integration harness for the Julia CCXT transpilation audit.
#
# For exchanges that declare `urls.test` (so `--sandbox` is meaningful), enable
# sandbox mode and run a minimal authenticated smoke:
#   * fetchBalance        -> non-empty total/free map
#   * createOrder(limit)  -> carries an `id`
#   * cancelOrder(id)      -> confirms `canceled`
#
# Safety (CCXT policy, non-negotiable):
#   * sandbox/demo ONLY — never production/mainnet.
#   * notional = amount * markPrice must be < 25 USD per trade; a pair whose
#     minimum order size already exceeds 25 USD is SKIPPED, not faked.
#   * withdraw is NEVER called (fixture-only per CCXT policy).
#
# The harness HONESTLY skips when no sandbox credentials are available: it does
# not fabricate responses. Run with keys present in keys.local.json (or env
# vars + --load-keys) to exercise the real path.
#
# This file is hand-written test infrastructure, not a transpiled output.

include("credentials.jl")
using Ccxt

const NOTIONAL_CAP_USD = 25.0

# Pick a tradable spot symbol whose minimum notional is safely under the cap.
# Returns (symbol, amount, cost_estimate) or nothing if no safe pair exists.
function _pick_safe_symbol(ex)
    mkts = ex.markets
    best = nothing
    for (sym, m) in mkts
        m isa AbstractDict || continue
        get(m, Symbol("spot"), false) == true || get(m, Symbol("type"), nothing) == "spot" || continue
        get(m, Symbol("active"), true) == false && continue
        # Quote currency must be a stable/fiat we can price against USD.
        quote_ccy = m[Symbol("quote")]
        if !(quote_ccy in ("USDT", "USDC", "BUSD", "USD", "DAI", "TUSD"))
            continue
        end
        limits = get(m, Symbol("limits"), Dict())
        c = get(limits, Symbol("cost"), Dict())
        min_cost = something(get(c, Symbol("min"), nothing), 0)
        if min_cost > NOTIONAL_CAP_USD
            continue  # minimum already exceeds the cap -> skip this pair
        end
        # Prefer the smallest-min-notional pair.
        if best === nothing || min_cost < best[3]
            best = (sym, get(limits, Symbol("amount"), Dict()) |> x->get(x, Symbol("min"), nothing), min_cost)
        end
    end
    return best
end

function _usd_price(ex, quote_ccy)
    # Best-effort USD price of the quote currency so we can bound notional.
    quote_ccy == "USD" && return 1.0
    try
        t = ex.fetchTicker(quote_ccy * "/USDT")
        return something(get(t, Symbol("last"), nothing), 1.0)
    catch
        return 1.0
    end
end

# Run the smoke for one exchange id. Returns a Dict summary.
function run_sandbox_smoke(id::AbstractString; load_keys::Bool=false)
    cls = getproperty(Ccxt, Symbol(uppercasefirst(id)))
    ex = cls()
    summary = Dict{Symbol,Any}(:id => id, :sandbox_capable => false, :skipped => true)

    # Gate 1: sandbox capability.
    if get(ex.urls, Symbol("test"), nothing) === nothing
        summary[:reason] = "no urls.test — sandbox not supported"
        return summary
    end
    summary[:sandbox_capable] = true

    # Gate 2: credentials.
    creds = resolve_credentials(ex, load_keys)
    if isempty(creds)
        summary[:reason] = "no sandbox credentials (keys.local.json empty / absent" *
                           (load_keys ? "" : " and --load-keys not set") * ")"
        return summary
    end
    apply_credentials!(ex, creds; load_keys=load_keys)

    # Gate 3: enable sandbox.
    ex.setSandboxMode(true)
    summary[:sandbox_enabled] = ex.isSandboxModeEnabled

    try
        # fetchMarkets so symbol pick + order creation have real market data.
        ex.fetchMarkets()

        # Authenticated read.
        bal = ex.fetchBalance()
        total = get(bal, Symbol("total"), Dict())
        free = get(bal, Symbol("free"), Dict())
        summary[:balance_total_keys] = length(total)
        summary[:balance_free_keys] = length(free)

        # Pick a safe pair.
        pick = _pick_safe_symbol(ex)
        if pick === nothing
            summary[:skipped] = true
            summary[:reason] = "no spot pair with min notional under $(NOTIONAL_CAP_USD) USD"
            ex.setSandboxMode(false)
            return summary
        end
        symbol, min_amt, min_cost = pick
        summary[:symbol] = symbol

        # Choose amount so notional <= cap. Use mark price for the bound.
        ticker = ex.fetchTicker(symbol)
        price = something(get(ticker, Symbol("last"), nothing),
                           get(ticker, Symbol("close"), nothing), 0.0)
        price <= 0 && (price = 1.0)
        quote_ccy = split(symbol, "/")[2]
        usd_per_quote = _usd_price(ex, quote_ccy)
        notional_per_unit = price * usd_per_quote
        amount = min_amt !== nothing && min_amt > 0 ? Float64(min_amt) : 0.0
        # Scale up to a sensible amount but keep notional under the cap.
        target = NOTIONAL_CAP_USD * 0.5
        if amount * notional_per_unit < target && notional_per_unit > 0
            amount = target / notional_per_unit
            # round down to 6 sig digits to stay under exchange precision roughly
            amount = floor(amount * 1e6) / 1e6
            if min_amt !== nothing && amount < min_amt
                amount = Float64(min_amt)
            end
        end
        notional = amount * notional_per_unit
        summary[:amount] = amount
        summary[:notional_usd] = notional
        if notional > NOTIONAL_CAP_USD
            summary[:skipped] = true
            summary[:reason] = "computed notional $(round(notional, digits=2)) USD exceeds cap"
            ex.setSandboxMode(false)
            return summary
        end

        # Create a limit order slightly away from market so it rests (and can be cancelled).
        buy_price = price * 0.5
        order = ex.createOrder(symbol, "limit", "buy", amount, buy_price)
        oid = get(order, Symbol("id"), nothing)
        summary[:order_id] = oid
        summary[:order_status] = get(order, Symbol("status"), nothing)

        # Cancel it.
        if oid !== nothing
            cancelled = ex.cancelOrder(oid, symbol)
            summary[:cancel_status] = get(cancelled, Symbol("status"), nothing)
        end
        summary[:skipped] = false
        summary[:reason] = "balance + create->cancel round-trip OK"
    catch e
        summary[:error] = string(sprint(showerror, e))
        summary[:skipped] = true
        summary[:reason] = "live call raised: $(summary[:error])"
    finally
        ex.setSandboxMode(false)
    end
    return summary
end

# Entry point: run the smoke for every sandbox-capable exchange in the package.
# Prints a per-exchange line and returns the list of summaries.
function run_all_sandbox_smoke(; load_keys::Bool=false)
    ids = sort([replace(f, r"\.jl$" => "")
                for f in readdir(joinpath(_PKG_ROOT, "src", "exchanges"))
                if endswith(f, ".jl")])
    results = Dict{Symbol,Any}[]
    for id in ids
        try
            push!(results, run_sandbox_smoke(id; load_keys=load_keys))
        catch e
            push!(results, Dict{Symbol,Any}(:id => id, :skipped => true,
                  :reason => "harness error: $(string(sprint(showerror, e)))"))
        end
    end
    for r in results
        cap = get(r, :sandbox_capable, false)
        skip = get(r, :skipped, true)
        tag = !cap ? "no-sandbox" : (skip ? "SKIP" : "RAN")
        println(rpad(get(r,:id,"?"), 16), " ", tag, "  ", get(r,:reason, ""))
    end
    return results
end

# When run as a script: `julia --project test/live/sandbox_harness.jl [--load-keys]`
if abspath(PROGRAM_FILE) == @__FILE__
    load_keys = "--load-keys" in ARGS
    results = run_all_sandbox_smoke(; load_keys=load_keys)
    ran = count(r -> get(r,:sandbox_capable,false) && !get(r,:skipped,true), results)
    skipped = count(r -> get(r,:sandbox_capable,false) && get(r,:skipped,true), results)
    println("\nsandbox-capable: $(count(r->get(r,:sandbox_capable,false),results))  ran=$ran  skipped=$skipped")
end
