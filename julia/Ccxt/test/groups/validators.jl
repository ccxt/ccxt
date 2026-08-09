# Group: validators — unified-structure validators transpiled from
# `ts/src/test/Exchange/base/test.<structure>.ts`. Each file defines a
# `testStructure` entry point (e.g. `testTicker`, `testOrder`, `testBalance`)
# that asserts a parsed exchange object has the expected unified shape.
#
# These functions are not invoked directly here; they are driven by the
# unified-method wrappers in the `exchange_methods` group (e.g. `testFetchTicker`
# calls `testTicker`), which the `fixtures` group runs against the static
# response JSON. That mirrors the upstream TS layout where the validators are
# shared helpers invoked from each `test.<method>.ts`. Listing them here keeps
# them loaded so the dependency chain in `runtests.jl` is explicit.
include("../validators/test.account.jl")
include("../validators/test.balance.jl")
include("../validators/test.borrowInterest.jl")
include("../validators/test.borrowRate.jl")
include("../validators/test.currency.jl")
include("../validators/test.depositWithdrawal.jl")
include("../validators/test.fundingRateHistory.jl")
include("../validators/test.lastPrice.jl")
include("../validators/test.ledgerEntry.jl")
include("../validators/test.leverageTier.jl")
include("../validators/test.liquidation.jl")
include("../validators/test.marginMode.jl")
include("../validators/test.marginModification.jl")
include("../validators/test.market.jl")
include("../validators/test.ohlcv.jl")
include("../validators/test.openInterest.jl")
include("../validators/test.order.jl")
include("../validators/test.orderBook.jl")
include("../validators/test.position.jl")
include("../validators/test.status.jl")
include("../validators/test.ticker.jl")
include("../validators/test.trade.jl")
include("../validators/test.tradingFee.jl")
include("../validators/test.transfer.jl")
