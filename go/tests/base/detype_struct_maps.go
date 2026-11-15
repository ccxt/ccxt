package base

import (
	"reflect"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

// W29/W30/W31/W32 struct and map-of-struct channels: DetypeForComparison projects their rows.
// Registered by assignment (not in the detypedStructs literal) so units adding the same struct merge cleanly.
func init() {
	for _, t := range []reflect.Type{
		reflect.TypeOf(ccxt.Ticker{}),
		reflect.TypeOf(ccxt.Order{}),
		reflect.TypeOf(ccxt.Trade{}),
		reflect.TypeOf(ccxt.Position{}),
		reflect.TypeOf(ccxt.Transaction{}),
		reflect.TypeOf(ccxt.LedgerEntry{}),
		reflect.TypeOf(ccxt.DepositAddress{}),
		reflect.TypeOf(ccxt.TransferEntry{}),
		reflect.TypeOf(ccxt.FundingRate{}),
		reflect.TypeOf(ccxt.OpenInterest{}),
		reflect.TypeOf(ccxt.TradingFeeInterface{}),
		reflect.TypeOf(ccxt.Leverage{}),
		reflect.TypeOf(ccxt.MarginMode{}),
		reflect.TypeOf(ccxt.Greeks{}),
		reflect.TypeOf(ccxt.Option{}),
		reflect.TypeOf(ccxt.Conversion{}),
		reflect.TypeOf(ccxt.ADL{}),
		reflect.TypeOf(ccxt.CrossBorrowRate{}),
		reflect.TypeOf(ccxt.IsolatedBorrowRate{}),
		reflect.TypeOf(ccxt.LastPrice{}),
		reflect.TypeOf(ccxt.LongShortRatio{}),
		reflect.TypeOf(ccxt.MarginModification{}),
		reflect.TypeOf(ccxt.Liquidation{}),
		reflect.TypeOf(ccxt.BorrowInterest{}),
		reflect.TypeOf(ccxt.FundingHistory{}),
		reflect.TypeOf(ccxt.FundingRateHistory{}),
		reflect.TypeOf(ccxt.LeverageTier{}),
		reflect.TypeOf(ccxt.Status{}),
		reflect.TypeOf(ccxt.PositionModeInfo{}),
		reflect.TypeOf(ccxt.DepositWithdrawFee{}),
		reflect.TypeOf(ccxt.Account{}),
		reflect.TypeOf(ccxt.OrderBook{}),
		reflect.TypeOf(ccxt.OrderBookL3{}),
		reflect.TypeOf(ccxt.MarginLoan{}),
		reflect.TypeOf(ccxt.Balance{}),
		reflect.TypeOf(ccxt.Precision{}),
		reflect.TypeOf(ccxt.Limits{}),
		reflect.TypeOf(ccxt.MinMax{}),
		reflect.TypeOf(ccxt.PredictionTicker{}),
		reflect.TypeOf(ccxt.PredictionOrder{}),
		reflect.TypeOf(ccxt.PredictionTrade{}),
		reflect.TypeOf(ccxt.PredictionPosition{}),
		reflect.TypeOf(ccxt.PredictionTradingFee{}),
		reflect.TypeOf(ccxt.PredictionOpenInterest{}),
		reflect.TypeOf(ccxt.PredictionEvent{}),
		reflect.TypeOf(ccxt.PredictionMarket{}),
		reflect.TypeOf(ccxt.PredictionOutcome{}),
		reflect.TypeOf(ccxt.PredictionFees{}),
		reflect.TypeOf(ccxt.PredictionSettlement{}),
		reflect.TypeOf(ccxt.CurrencyLimits{}),
		reflect.TypeOf(ccxt.Network{}),
		reflect.TypeOf(ccxt.MarketMarginModes{}),
		reflect.TypeOf(ccxt.MarketInterface{}),
	} {
		detypedStructs[t] = true
	}
}
