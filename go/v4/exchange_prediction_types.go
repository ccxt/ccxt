package ccxt

// Native dedicated prediction-market structs. Each embeds its base unified struct
// (so all base fields are promoted) and adds the prediction identity fields. The
// inherited Symbol is left unpopulated — Outcome (the "MARKET:LABEL" handle) is the
// canonical identity. Mirrors the `Prediction* extends <Base>` interfaces in
// ts/src/base/types.ts. The transpiler wraps a `-> PredictionTicker` return with
// NewPredictionTicker(res) and a list with NewPredictionTickerArray(res).

type PredictionTicker struct {
	Ticker
	Outcome      *string
	OutcomeId    *string
	Label        *string
	Market       *string
	Event        *string
	OpenInterest *float64
}

func NewPredictionTicker(data any) PredictionTicker {
	m := data.(map[string]any)
	return PredictionTicker{
		Ticker:       NewTicker(data),
		Outcome:      SafeStringTyped(m, "outcome"),
		OutcomeId:    SafeStringTyped(m, "outcomeId"),
		Label:        SafeStringTyped(m, "label"),
		Market:       SafeStringTyped(m, "market"),
		Event:        SafeStringTyped(m, "event"),
		OpenInterest: SafeFloatTyped(m, "openInterest"),
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
	Order
	Outcome   *string
	OutcomeId *string
	Label     *string
	Market    *string
	Event     *string
}

func NewPredictionOrder(data any) PredictionOrder {
	m := data.(map[string]any)
	return PredictionOrder{
		Order:     NewOrder(data),
		Outcome:   SafeStringTyped(m, "outcome"),
		OutcomeId: SafeStringTyped(m, "outcomeId"),
		Label:     SafeStringTyped(m, "label"),
		Market:    SafeStringTyped(m, "market"),
		Event:     SafeStringTyped(m, "event"),
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
	Trade
	Outcome     *string
	OutcomeId   *string
	Label       *string
	Market      *string
	RealizedPnl *float64
}

func NewPredictionTrade(data any) PredictionTrade {
	m := data.(map[string]any)
	return PredictionTrade{
		Trade:       NewTrade(data),
		Outcome:     SafeStringTyped(m, "outcome"),
		OutcomeId:   SafeStringTyped(m, "outcomeId"),
		Label:       SafeStringTyped(m, "label"),
		Market:      SafeStringTyped(m, "market"),
		RealizedPnl: SafeFloatTyped(m, "realizedPnl"),
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
	Position
	Outcome         *string
	OutcomeId       *string
	Label           *string
	Market          *string
	Event           *string
	OppositeOutcome *string
	Resolved        *bool
	Won             *bool
	SettleFraction  *float64
	Payout          *float64
}

func NewPredictionPosition(data any) PredictionPosition {
	m := data.(map[string]any)
	return PredictionPosition{
		Position:        NewPosition(data),
		Outcome:         SafeStringTyped(m, "outcome"),
		OutcomeId:       SafeStringTyped(m, "outcomeId"),
		Label:           SafeStringTyped(m, "label"),
		Market:          SafeStringTyped(m, "market"),
		Event:           SafeStringTyped(m, "event"),
		OppositeOutcome: SafeStringTyped(m, "oppositeOutcome"),
		Resolved:        SafeBoolTyped(m, "resolved"),
		Won:             SafeBoolTyped(m, "won"),
		SettleFraction:  SafeFloatTyped(m, "settleFraction"),
		Payout:          SafeFloatTyped(m, "payout"),
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

type PredictionOrderBook struct {
	OrderBook
	Outcome   *string
	OutcomeId *string
	Market    *string
}

func NewPredictionOrderBook(data any) PredictionOrderBook {
	m := data.(map[string]any)
	return PredictionOrderBook{
		OrderBook: NewOrderBook(data),
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
	TradingFeeInterface
	Outcome   *string
	OutcomeId *string
	Market    *string
}

func NewPredictionTradingFee(data any) PredictionTradingFee {
	m := data.(map[string]any)
	return PredictionTradingFee{
		TradingFeeInterface: NewTradingFeeInterface(data),
		Outcome:             SafeStringTyped(m, "outcome"),
		OutcomeId:           SafeStringTyped(m, "outcomeId"),
		Market:              SafeStringTyped(m, "market"),
	}
}

type PredictionOpenInterest struct {
	OpenInterest
	Outcome   *string
	OutcomeId *string
	Market    *string
}

func NewPredictionOpenInterest(data any) PredictionOpenInterest {
	m := data.(map[string]any)
	return PredictionOpenInterest{
		OpenInterest: NewOpenInterest(data),
		Outcome:      SafeStringTyped(m, "outcome"),
		OutcomeId:    SafeStringTyped(m, "outcomeId"),
		Market:       SafeStringTyped(m, "market"),
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
