# Flying Tulip

This draft adapter exposes Flying Tulip cross-margin ERC-20 exposure through CCXT. It does not represent these positions as perpetual futures: borrowing incurs lending interest, and there is no perpetual funding-rate API. One instance handles one chain (`options.chainId`, default `146`).

## Account and collateral

Set `walletAddress` to the owner of the margin account. Any asset currently marked valid collateral by the chain's lending registry can fund the account; collateral, debt and bought exposure are independent assets. No ftUSD conversion is required for valid collateral.

`fetchBalance()` returns margin collateral; `fetchBalance({type: 'spot'})` returns wallet balances. Missing reads remain unknown. The full lending snapshot, debt and account metrics remain in `info`.

`prepareCollateralDeposit(code, amount)` returns unsigned, exact-amount ERC-20 approvals and a PositionsManager deposit. The caller reviews and executes these transactions, waits for confirmation and refreshes the account before placing an order. Order preparation also returns exact engine borrow/debit approval transactions. The adapter never submits approval/deposit transactions, grants unlimited allowances or creates sessions automatically.

## Orders

Use `params.collateral` (symbol or token address) on opens. The amount is in base-token units. A market buy additionally requires `params.cost` in market-quote units because the executor accepts exact-input orders. Alternatively use `createMarketBuyOrderWithCost(symbol, cost, params)`. A long's `params.debtToken` may select any currently borrowable token; the default is market quote with a USDC fallback when the quote cannot be borrowed. Short opens borrow the base token; `params.fundingToken` selects the quote-side token bought by the short.

`params.leverage` is a sizing annotation subject to market bounds. The on-chain signed borrow and minimum receive amounts enforce the actual exposure; the adapter does not change a persistent account leverage setting. Account-wide equity, collateral/debt maintenance, fees and minimum output must fit the safe health-factor gate.

```javascript
const exchange = new ccxt.flyingtulip({
    walletAddress: process.env.FT_ACCOUNT_ADDRESS,
    options: { chainId: 146 },
});
await exchange.loadMarkets();
const plan = await exchange.prepareLeverageOrder(
    'WBTC/USDC', 'limit', 'buy', '0.001', '50000',
    { collateral: 'WETH', leverage: '1.15' },
);
// Review plan.request, plan.typedData and plan.approvals.
// Execute required approvals using the account's wallet, then sign the exact
// plan.typedData with that wallet. Do not regenerate the plan after signing.
const signature = await wallet.signTypedData(plan.typedData);
const order = await exchange.submitLeverageOrder(plan, signature, 'erc1271');
```

An EOA may set `privateKey` and call unified `createOrder`; no API key is needed. The adapter checks that the EOA key matches the owner. External EOA signing uses `submitLeverageOrder(..., 'eip712')`; contract-wallet signatures use `'erc1271'`. Expired or changed signing configurations are refused before submission. Limit minimum outputs are not reduced by market slippage. Aggregate quotes use all routes enabled by the executor, including conversion routes, without selecting a single aggregator in the client.

`fetchOrder`, `fetchOrders`, `fetchOpenOrders` and `fetchClosedOrders` use executor status. `broadcasting` remains open until reconciliation. Client display size and limit price are not reported as realized fills or average execution prices. Order listing uses a bounded page (default 100, maximum 500); use `params.offset` to fetch older pages. `since` is a millisecond timestamp applied to that page.

## Closes and cancellation

`prepareClosePosition` returns exact typed terms and approval requirements. Close debt is selected from live debt candidates; ambiguity requires `params.debtToken`. Long closes use the base-denominated `maxCloseAmount`; optional `params.amount` is in base units. Short closes require `params.cost` in the selected funding token's units. A short's base-denominated close cap is never interpreted as quote-token wei. The default minimum covers the selected account debt; partial closes may specify `params.minBuyAmount` in buy-token raw units. The account-level debt floor can be conservative when other positions share that debt asset.

`closePosition` signs with the owner EOA; external wallets use `prepareClosePosition` and `submitLeverageOrder`. `cancelOrder` signs a short-lived cancellation with an owner or authorized delegate EOA. The executor still decides whether an order already being broadcast can be canceled.

## Draft limitations and validation

This PR remains draft. Offline fixtures cover collateral/debt separation, precision, fees, health-factor refusal, order-response mapping, signed limits, v1/v2 terms, unsigned deposit plans and short-close units. No financial transaction has been executed to validate this adapter.

Pending: session-delegate preparation, language-generation/style validation, broader refusal-path fixtures and read-only live smoke testing. Batched margin conversion, automated funding transactions, trigger/TP-SL orders, partial fills, post-only and IOC/FOK semantics are not advertised. Unsupported parameters fail explicitly. The executor's alpha order book is not used.
