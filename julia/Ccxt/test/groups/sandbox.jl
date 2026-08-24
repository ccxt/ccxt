# Group: sandbox — `setSandboxMode` rewires an exchange onto its testnet.
#
# This is the switch every authenticated sandbox test depends on: get it wrong
# and a test that believes it is trading on a testnet is in fact signing
# requests against the production host with production keys. It is therefore
# checked here, offline and unconditionally, rather than only implicitly by a
# live run that needs credentials to happen at all.
#
# Calls use the canonical instance API `ex.setSandboxMode(...)` (the form every
# CCXT consumer uses). The generated module-function form `Ccxt.setSandboxMode
# (ex, ...)` is NOT equivalent for composed aliases and is tracked separately
# under "module-function dispatch" below.
#
# Exchanges are constructed straight from `Ccxt`, not through
# `static_init_offline`: the point is to observe what a plain consumer gets,
# with no preloaded markets, dummy credentials or test scaffolding.
#
# Sandbox support comes in three shapes, and the difference is not cosmetic —
# asserting the URL swap on an exchange that switches by header would be
# asserting the wrong thing, and would pass while sandbox mode silently did
# nothing. All three were classified against the reference JS build
# (`js/ccxt.js`) over the same 104 exchanges:
#
#   * 43 swap URLs   — `urls["test"]` is a distinct host map
#   * 3  swap headers — okx, myokx, okxus: `urls["test"] == urls["api"]`, and
#                       the real switch is the `x-simulated-trading` header
#   * 58 no sandbox  — `urls["test"]` is `nothing`
#
# The `'test'` key is always *present* (the base `describe()` seeds it), so
# nothing here may test `haskey`: the value is what decides.

# One per shape, chosen to also span both `urls["api"]` layouts (plain string
# and per-section dict).
const SANDBOX_URL_IDS = ["binance", "bybit", "phemex", "bitmex", "deribit"]
const SANDBOX_HEADER_IDS = ["okx", "myokx", "okxus"]
const SANDBOX_NONE_IDS = ["bitbank", "aster", "bit2c"]

@testset "setSandboxMode" begin
    @testset "$id swaps api -> test" for id in SANDBOX_URL_IDS
        ex = getproperty(Ccxt, Symbol(uppercasefirst(id)))()

        production = ex.urls[Symbol("api")]
        testnet = ex.urls[Symbol("test")]
        @test testnet !== nothing
        # Guards the assertion below: if the exchange ever ships the same host
        # for both, the swap becomes unobservable and this group would be
        # asserting nothing.
        @test production != testnet
        @test ex.isSandboxModeEnabled == false

        ex.setSandboxMode(true)
        @test ex.isSandboxModeEnabled == true
        # The actual gate: requests now build against the testnet host.
        @test ex.urls[Symbol("api")] == testnet

        # For the dict-valued case, confirm every section moved. A partial swap
        # would leave some endpoints pointed at production, which is precisely
        # the dangerous outcome this group exists to rule out.
        if testnet isa AbstractDict
            for (section, host) in testnet
                @test ex.urls[Symbol("api")][section] == host
            end
        end

        ex.setSandboxMode(false)
        @test ex.isSandboxModeEnabled == false
        # Restored exactly, and the `apiBackup` scratch key cleaned up rather
        # than left behind for the next caller to trip over.
        @test ex.urls[Symbol("api")] == production
        @test !haskey(ex.urls, Symbol("apiBackup"))
    end

    # okx and its two aliases keep one host for both live and demo trading and
    # select between them with a header, so `setSandboxMode` must override the
    # base method. If the generator ever dropped that override the base would
    # run alone, swap a URL onto itself, report success — and every "sandbox"
    # order would execute live. That is the regression this asserts against.
    #
    # The override lives on `Okx`; `Myokx`/`Okxus` are composed from a parent
    # `Okx` and reach it through the instance-method path (verified identical
    # to `js/ccxt.js`, where `myokx.setSandboxMode(true)` also yields the
    # `x-simulated-trading` header).
    @testset "$id swaps the simulated-trading header" for id in SANDBOX_HEADER_IDS
        ex = getproperty(Ccxt, Symbol(uppercasefirst(id)))()
        header = Symbol("x-simulated-trading")

        @test !haskey(ex.headers, header)
        @test ex.urls[Symbol("test")] == ex.urls[Symbol("api")]

        ex.setSandboxMode(true)
        @test ex.headers[header] == "1"
        @test ex.options[Symbol("sandboxMode")] == true
        @test ex.isSandboxModeEnabled == true

        ex.setSandboxMode(false)
        @test !haskey(ex.headers, header)
        @test ex.options[Symbol("sandboxMode")] == false
    end

    # Exchanges with no testnet. `urls["test"]` is `nothing` rather than absent,
    # so the base method takes its "key is present" branch and clears `api` to
    # an empty map instead of raising `NotSupported`.
    #
    # That is upstream behaviour, not a Julia defect — verified identical in the
    # reference JS build, where `bitbank.setSandboxMode(true)` also leaves
    # `urls.api === {}` and `isSandboxModeEnabled === true`. It is pinned here
    # because it is a sharp edge for the live harness: the flag says sandbox,
    # and the URLs say nothing at all, so a caller must check
    # `urls["test"] !== nothing` before trusting sandbox mode. `test/live/`
    # gates on exactly that.
    @testset "$id has no testnet to switch to" for id in SANDBOX_NONE_IDS
        ex = getproperty(Ccxt, Symbol(uppercasefirst(id)))()
        @test ex.urls[Symbol("test")] === nothing

        ex.setSandboxMode(true)
        @test isempty(ex.urls[Symbol("api")])
    end

    # --- Generator defect (tracked, not yet fixed) -------------------------
    # The generated module-function form `Ccxt.setSandboxMode(ex, ...)` does
    # NOT reach parent overrides for composed aliases. The override is defined
    # as `setSandboxMode(self::Okx, ...)`, and Julia composition (an alias holds
    # a `parent::Okx` rather than subtyping it) means `self` is never `Okx`, so
    # the base `setSandboxMode(self::CcxtExchange, ...)` runs instead and the
    # `x-simulated-trading` header is skipped. The instance form above routes
    # through `getproperty` and works; the module-function form silently does
    # not. Same latent gap exists for any parent override on every alias
    # (`binanceus`, `bybiteu`, `gateeu`, `kucoineu`, `kucoinfutures`,
    # `hollaex`, ...). Root cause: `build/juliaTranspiler.ts` alias wiring.
    # These are `@test_broken` so the defect stays visible as a known gap.
    @testset "module-function dispatch reaches parent override" begin
        # myokx: Ccxt.setSandboxMode(ex, true) currently skips the okx override
        # (defined as setSandboxMode(self::Okx, ...)) and silently runs the base,
        # so the header is never set. Tracked as broken until build/juliaTranspiler.ts
        # makes composed aliases reach parent overrides through the module form.
        @test_broken get(
            let ex = getproperty(Ccxt, Symbol("Myokx"))()
                Ccxt.setSandboxMode(ex, true)
                ex.headers
            end,
            Symbol("x-simulated-trading"), nothing) == "1"
    end
end
