package ccxt

// Native dedicated prediction-market structs. Each is STANDALONE: it does NOT embed
// a base unified struct (Ticker/Order/Trade/...) and therefore carries no Symbol field.
// The outcome-addressed identity (Outcome — the "MARKET:LABEL" handle — plus OutcomeId /
// Market / Event) is the canonical identity. Mirrors the standalone `Prediction*`
// interfaces in ts/src/base/types.ts. The transpiler wraps a `-> PredictionTicker`
// return with NewPredictionTicker(res) and a list with NewPredictionTickerArray(res).

type PredictionTicker struct {
	Info          map[string]any
	Timestamp     *int64
	Datetime      *string
	High          *float64
	Low           *float64
	Bid           *float64
	BidVolume     *float64
	Ask           *float64
	AskVolume     *float64
	Vwap          *float64
	Open          *float64
	Close         *float64
	Last          *float64
	PreviousClose *float64
	Change        *float64
	Percentage    *float64
	Average       *float64
	QuoteVolume   *float64
	BaseVolume    *float64
	IndexPrice    *float64
	MarkPrice     *float64
	Outcome       *string
	OutcomeId     *string
	Label         *string
	Market        *string
	Event         *string
	OpenInterest  *float64
}

func NewPredictionTicker(data any) PredictionTicker {
	m := data.(map[string]any)
	return PredictionTicker{
		Info:          GetInfo(m),
		Timestamp:     SafeInt64Typed(m, "timestamp"),
		Datetime:      SafeStringTyped(m, "datetime"),
		High:          SafeFloatTyped(m, "high"),
		Low:           SafeFloatTyped(m, "low"),
		Bid:           SafeFloatTyped(m, "bid"),
		BidVolume:     SafeFloatTyped(m, "bidVolume"),
		Ask:           SafeFloatTyped(m, "ask"),
		AskVolume:     SafeFloatTyped(m, "askVolume"),
		Vwap:          SafeFloatTyped(m, "vwap"),
		Open:          SafeFloatTyped(m, "open"),
		Close:         SafeFloatTyped(m, "close"),
		Last:          SafeFloatTyped(m, "last"),
		PreviousClose: SafeFloatTyped(m, "previousClose"),
		Change:        SafeFloatTyped(m, "change"),
		Percentage:    SafeFloatTyped(m, "percentage"),
		Average:       SafeFloatTyped(m, "average"),
		QuoteVolume:   SafeFloatTyped(m, "quoteVolume"),
		BaseVolume:    SafeFloatTyped(m, "baseVolume"),
		IndexPrice:    SafeFloatTyped(m, "indexPrice"),
		MarkPrice:     SafeFloatTyped(m, "markPrice"),
		Outcome:       SafeStringTyped(m, "outcome"),
		OutcomeId:     SafeStringTyped(m, "outcomeId"),
		Label:         SafeStringTyped(m, "label"),
		Market:        SafeStringTyped(m, "market"),
		Event:         SafeStringTyped(m, "event"),
		OpenInterest:  SafeFloatTyped(m, "openInterest"),
	}
}

func NewPredictionTickerArray(data any) []PredictionTicker {
	arr := data.([]any)
	result := make([]PredictionTicker, 0, len(arr))
	for _, item := range arr {
		if itemMap, ok := item.(map[string]any); ok {
			result = append(result, NewPredictionTicker(itemMap))
		}
	}
	return result
}

type PredictionOrder struct {
	Info                map[string]any
	Id                  *string
	ClientOrderId       *string
	Timestamp           *int64
	Datetime            *string
	LastTradeTimestamp  *int64
	LastUpdateTimestamp *int64
	Status              *string
	Type                *string
	TimeInForce         *string
	Side                *string
	Price               *float64
	Average             *float64
	Amount              *float64
	Filled              *float64
	Remaining           *float64
	StopPrice           *float64
	TriggerPrice        *float64
	TakeProfitPrice     *float64
	StopLossPrice       *float64
	Cost                *float64
	Fee                 Fee
	ReduceOnly          *bool
	PostOnly            *bool
	Outcome             *string
	OutcomeId           *string
	Label               *string
	Market              *string
	Event               *string
	Trades              []PredictionTrade
}

func NewPredictionOrder(data any) PredictionOrder {
	m := data.(map[string]any)
	var trades []PredictionTrade
	if v, ok := m["trades"]; ok {
		if tradesData, ok := v.([]any); ok {
			for _, tradeData := range tradesData {
				trades = append(trades, NewPredictionTrade(tradeData))
			}
		}
	}
	return PredictionOrder{
		Info:                GetInfo(m),
		Id:                  SafeStringTyped(m, "id"),
		ClientOrderId:       SafeStringTyped(m, "clientOrderId"),
		Timestamp:           SafeInt64Typed(m, "timestamp"),
		Datetime:            SafeStringTyped(m, "datetime"),
		LastTradeTimestamp:  SafeInt64Typed(m, "lastTradeTimestamp"),
		LastUpdateTimestamp: SafeInt64Typed(m, "lastUpdateTimestamp"),
		Status:              SafeStringTyped(m, "status"),
		Type:                SafeStringTyped(m, "type"),
		TimeInForce:         SafeStringTyped(m, "timeInForce"),
		Side:                SafeStringTyped(m, "side"),
		Price:               SafeFloatTyped(m, "price"),
		Average:             SafeFloatTyped(m, "average"),
		Amount:              SafeFloatTyped(m, "amount"),
		Filled:              SafeFloatTyped(m, "filled"),
		Remaining:           SafeFloatTyped(m, "remaining"),
		StopPrice:           SafeFloatTyped(m, "stopPrice"),
		TriggerPrice:        SafeFloatTyped(m, "triggerPrice"),
		TakeProfitPrice:     SafeFloatTyped(m, "takeProfitPrice"),
		StopLossPrice:       SafeFloatTyped(m, "stopLossPrice"),
		Cost:                SafeFloatTyped(m, "cost"),
		Fee:                 NewFee(SafeValue(m, "fee", map[string]any{}).(map[string]any)),
		ReduceOnly:          SafeBoolTyped(m, "reduceOnly"),
		PostOnly:            SafeBoolTyped(m, "postOnly"),
		Outcome:             SafeStringTyped(m, "outcome"),
		OutcomeId:           SafeStringTyped(m, "outcomeId"),
		Label:               SafeStringTyped(m, "label"),
		Market:              SafeStringTyped(m, "market"),
		Event:               SafeStringTyped(m, "event"),
		Trades:              trades,
	}
}

func NewPredictionOrderArray(data any) []PredictionOrder {
	arr := data.([]any)
	result := make([]PredictionOrder, 0, len(arr))
	for _, item := range arr {
		if itemMap, ok := item.(map[string]any); ok {
			result = append(result, NewPredictionOrder(itemMap))
		}
	}
	return result
}

type PredictionTrade struct {
	Info         map[string]any
	Id           *string
	Order        *string
	Timestamp    *int64
	Datetime     *string
	Amount       *float64
	Price        *float64
	Cost         *float64
	Type         *string
	Side         *string
	TakerOrMaker *string
	Fee          Fee
	Outcome      *string
	OutcomeId    *string
	Label        *string
	Market       *string
	RealizedPnl  *float64
}

func NewPredictionTrade(data any) PredictionTrade {
	m := data.(map[string]any)
	return PredictionTrade{
		Info:         GetInfo(m),
		Id:           SafeStringTyped(m, "id"),
		Order:        SafeStringTyped(m, "order"),
		Timestamp:    SafeInt64Typed(m, "timestamp"),
		Datetime:     SafeStringTyped(m, "datetime"),
		Amount:       SafeFloatTyped(m, "amount"),
		Price:        SafeFloatTyped(m, "price"),
		Cost:         SafeFloatTyped(m, "cost"),
		Type:         SafeStringTyped(m, "type"),
		Side:         SafeStringTyped(m, "side"),
		TakerOrMaker: SafeStringTyped(m, "takerOrMaker"),
		Fee:          NewFee(SafeValue(m, "fee", map[string]any{}).(map[string]any)),
		Outcome:      SafeStringTyped(m, "outcome"),
		OutcomeId:    SafeStringTyped(m, "outcomeId"),
		Label:        SafeStringTyped(m, "label"),
		Market:       SafeStringTyped(m, "market"),
		RealizedPnl:  SafeFloatTyped(m, "realizedPnl"),
	}
}

func NewPredictionTradeArray(data any) []PredictionTrade {
	arr := data.([]any)
	result := make([]PredictionTrade, 0, len(arr))
	for _, item := range arr {
		if itemMap, ok := item.(map[string]any); ok {
			result = append(result, NewPredictionTrade(itemMap))
		}
	}
	return result
}

type PredictionPosition struct {
	Info                        map[string]any
	Id                          *string
	Timestamp                   *int64
	Datetime                    *string
	Contracts                   *float64
	ContractSize                *float64
	Side                        *string
	Notional                    *float64
	Leverage                    *float64
	UnrealizedPnl               *float64
	RealizedPnl                 *float64
	Collateral                  *float64
	EntryPrice                  *float64
	MarkPrice                   *float64
	LiquidationPrice            *float64
	MarginMode                  *string
	Hedged                      *bool
	MaintenanceMargin           *float64
	MaintenanceMarginPercentage *float64
	InitialMargin               *float64
	InitialMarginPercentage     *float64
	MarginRatio                 *float64
	LastUpdateTimestamp         *int64
	LastPrice                   *float64
	StopLossPrice               *float64
	TakeProfitPrice             *float64
	Percentage                  *float64
	Outcome                     *string
	OutcomeId                   *string
	Label                       *string
	Market                      *string
	Event                       *string
	OppositeOutcome             *string
	Resolved                    *bool
	Won                         *bool
	SettleFraction              *float64
	Payout                      *float64
}

func NewPredictionPosition(data any) PredictionPosition {
	m := data.(map[string]any)
	return PredictionPosition{
		Info:                        GetInfo(m),
		Id:                          SafeStringTyped(m, "id"),
		Timestamp:                   SafeInt64Typed(m, "timestamp"),
		Datetime:                    SafeStringTyped(m, "datetime"),
		Contracts:                   SafeFloatTyped(m, "contracts"),
		ContractSize:                SafeFloatTyped(m, "contractSize"),
		Side:                        SafeStringTyped(m, "side"),
		Notional:                    SafeFloatTyped(m, "notional"),
		Leverage:                    SafeFloatTyped(m, "leverage"),
		UnrealizedPnl:               SafeFloatTyped(m, "unrealizedPnl"),
		RealizedPnl:                 SafeFloatTyped(m, "realizedPnl"),
		Collateral:                  SafeFloatTyped(m, "collateral"),
		EntryPrice:                  SafeFloatTyped(m, "entryPrice"),
		MarkPrice:                   SafeFloatTyped(m, "markPrice"),
		LiquidationPrice:            SafeFloatTyped(m, "liquidationPrice"),
		MarginMode:                  SafeStringTyped(m, "marginMode"),
		Hedged:                      SafeBoolTyped(m, "hedged"),
		MaintenanceMargin:           SafeFloatTyped(m, "maintenanceMargin"),
		MaintenanceMarginPercentage: SafeFloatTyped(m, "maintenanceMarginPercentage"),
		InitialMargin:               SafeFloatTyped(m, "initialMargin"),
		InitialMarginPercentage:     SafeFloatTyped(m, "initialMarginPercentage"),
		MarginRatio:                 SafeFloatTyped(m, "marginRatio"),
		LastUpdateTimestamp:         SafeInt64Typed(m, "lastUpdateTimestamp"),
		LastPrice:                   SafeFloatTyped(m, "lastPrice"),
		StopLossPrice:               SafeFloatTyped(m, "stopLossPrice"),
		TakeProfitPrice:             SafeFloatTyped(m, "takeProfitPrice"),
		Percentage:                  SafeFloatTyped(m, "percentage"),
		Outcome:                     SafeStringTyped(m, "outcome"),
		OutcomeId:                   SafeStringTyped(m, "outcomeId"),
		Label:                       SafeStringTyped(m, "label"),
		Market:                      SafeStringTyped(m, "market"),
		Event:                       SafeStringTyped(m, "event"),
		OppositeOutcome:             SafeStringTyped(m, "oppositeOutcome"),
		Resolved:                    SafeBoolTyped(m, "resolved"),
		Won:                         SafeBoolTyped(m, "won"),
		SettleFraction:              SafeFloatTyped(m, "settleFraction"),
		Payout:                      SafeFloatTyped(m, "payout"),
	}
}

func NewPredictionPositionArray(data any) []PredictionPosition {
	arr := data.([]any)
	result := make([]PredictionPosition, 0, len(arr))
	for _, item := range arr {
		if itemMap, ok := item.(map[string]any); ok {
			result = append(result, NewPredictionPosition(itemMap))
		}
	}
	return result
}

// PredictionSettlement is a standalone record: one settled outcome the user held, with the
// collateral paid in and paid out. Mirrors the PredictionSettlement interface in
// ts/src/base/types.ts.
type PredictionSettlement struct {
	Info      map[string]any
	Id        *string
	Timestamp *int64
	Datetime  *string
	Outcome   *string
	OutcomeId *string
	Market    *string
	Event     *string
	Result    *string
	Won       *bool
	Amount    *float64
	Price     *float64
	Cost      *float64
	Payout    *float64
	Pnl       *float64
}

func NewPredictionSettlement(data any) PredictionSettlement {
	m := data.(map[string]any)
	return PredictionSettlement{
		Info:      GetInfo(m),
		Id:        SafeStringTyped(m, "id"),
		Timestamp: SafeInt64Typed(m, "timestamp"),
		Datetime:  SafeStringTyped(m, "datetime"),
		Outcome:   SafeStringTyped(m, "outcome"),
		OutcomeId: SafeStringTyped(m, "outcomeId"),
		Market:    SafeStringTyped(m, "market"),
		Event:     SafeStringTyped(m, "event"),
		Result:    SafeStringTyped(m, "result"),
		Won:       SafeBoolTyped(m, "won"),
		Amount:    SafeFloatTyped(m, "amount"),
		Price:     SafeFloatTyped(m, "price"),
		Cost:      SafeFloatTyped(m, "cost"),
		Payout:    SafeFloatTyped(m, "payout"),
		Pnl:       SafeFloatTyped(m, "pnl"),
	}
}

func NewPredictionSettlementArray(data any) []PredictionSettlement {
	arr := data.([]any)
	result := make([]PredictionSettlement, 0, len(arr))
	for _, item := range arr {
		if itemMap, ok := item.(map[string]any); ok {
			result = append(result, NewPredictionSettlement(itemMap))
		}
	}
	return result
}

type PredictionOrderBook struct {
	Bids      [][]float64
	Asks      [][]float64
	Timestamp *int64
	Datetime  *string
	Nonce     *int64
	Outcome   *string
	OutcomeId *string
	Market    *string
}

func NewPredictionOrderBook(data any) PredictionOrderBook {
	if data == nil {
		return PredictionOrderBook{}
	}
	m := data.(map[string]any)
	return PredictionOrderBook{
		Bids:      parseOrderBookEntries(m, "bids"),
		Asks:      parseOrderBookEntries(m, "asks"),
		Timestamp: SafeInt64Typed(m, "timestamp"),
		Datetime:  SafeStringTyped(m, "datetime"),
		Nonce:     SafeInt64Typed(m, "nonce"),
		Outcome:   SafeStringTyped(m, "outcome"),
		OutcomeId: SafeStringTyped(m, "outcomeId"),
		Market:    SafeStringTyped(m, "market"),
	}
}

// NewPredictionOrderBookFromWs mirrors NewOrderBookFromWs but yields a PredictionOrderBook.
// watchOrderBook resolves the live *WsOrderBook cache, which NewPredictionOrderBook's direct
// map assertion would panic on — normalize it to a map first.
func NewPredictionOrderBookFromWs(v any) PredictionOrderBook {
	switch t := v.(type) {
	case *WsOrderBook:
		return NewPredictionOrderBook(t.ToMap())
	case map[string]any:
		return NewPredictionOrderBook(t)
	default:
		ob := NewWsOrderBook(map[string]any{}, nil)
		return NewPredictionOrderBook(ob.ToMap())
	}
}

type PredictionTradingFee struct {
	Info       map[string]any
	Maker      *float64
	Taker      *float64
	Percentage *bool
	TierBased  *bool
	Outcome    *string
	OutcomeId  *string
	Market     *string
}

func NewPredictionTradingFee(data any) PredictionTradingFee {
	m := data.(map[string]any)
	return PredictionTradingFee{
		Info:       GetInfo(m),
		Maker:      SafeFloatTyped(m, "maker"),
		Taker:      SafeFloatTyped(m, "taker"),
		Percentage: SafeBoolTyped(m, "percentage"),
		TierBased:  SafeBoolTyped(m, "tierBased"),
		Outcome:    SafeStringTyped(m, "outcome"),
		OutcomeId:  SafeStringTyped(m, "outcomeId"),
		Market:     SafeStringTyped(m, "market"),
	}
}

type PredictionOpenInterest struct {
	Info               map[string]any
	OpenInterestAmount *float64
	OpenInterestValue  *float64
	BaseVolume         *float64
	QuoteVolume        *float64
	Timestamp          *int64
	Datetime           *string
	Outcome            *string
	OutcomeId          *string
	Market             *string
}

func NewPredictionOpenInterest(data any) PredictionOpenInterest {
	m := data.(map[string]any)
	return PredictionOpenInterest{
		Info:               GetInfo(m),
		OpenInterestAmount: SafeFloatTyped(m, "openInterestAmount"),
		OpenInterestValue:  SafeFloatTyped(m, "openInterestValue"),
		BaseVolume:         SafeFloatTyped(m, "baseVolume"),
		QuoteVolume:        SafeFloatTyped(m, "quoteVolume"),
		Timestamp:          SafeInt64Typed(m, "timestamp"),
		Datetime:           SafeStringTyped(m, "datetime"),
		Outcome:            SafeStringTyped(m, "outcome"),
		OutcomeId:          SafeStringTyped(m, "outcomeId"),
		Market:             SafeStringTyped(m, "market"),
	}
}

type PredictionTickers struct {
	Info    map[string]any
	Tickers map[string]PredictionTicker
}

func NewPredictionTickers(tickersData2 any) PredictionTickers {
	tickersData := tickersData2.(map[string]any)
	info := GetInfo(tickersData)
	tickersMap := make(map[string]PredictionTicker)
	for key, value := range tickersData {
		if key != "info" {
			if tickerData, ok := value.(map[string]any); ok {
				tickersMap[key] = NewPredictionTicker(tickerData)
			}
		}
	}
	return PredictionTickers{
		Info:    info,
		Tickers: tickersMap,
	}
}
