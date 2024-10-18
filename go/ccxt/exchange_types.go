package ccxt

import (
	"math"
	"time"
)

// Utility functions for safe extraction from maps
func SafeFloatTyped(m interface{}, key interface{}) float64 {
	res := SafeFloat(m, key, nil)
	if res != nil {
		return res.(float64)
	}
	return math.NaN()
}

func SafeStringTyped(m interface{}, key interface{}) string {
	res := SafeString(m, key, nil)
	if res != nil {
		return res.(string)
	}
	return ""
}

func SafeBoolTyped(m interface{}, key interface{}) bool {
	res := SafeBool(m, key, false)
	if res != nil {
		return res.(bool)
	}
	return false
}

func SafeInt64Typed(m interface{}, key interface{}) int64 {
	res := SafeInteger(m, key, nil)
	if res != nil {
		return res.(int64)
	}
	return 0
}

// MarketInterface struct
type MarketInterface struct {
	Info           map[string]interface{}
	UppercaseID    string
	LowercaseID    string
	Symbol         string
	BaseCurrency   string
	QuoteCurrency  string
	BaseID         string
	QuoteID        string
	Active         bool
	Type           string
	Spot           bool
	Margin         bool
	Swap           bool
	Future         bool
	Option         bool
	Contract       bool
	Settle         string
	SettleID       string
	ContractSize   float64
	Linear         bool
	Inverse        bool
	Quanto         bool
	Expiry         int64
	ExpiryDatetime string
	Strike         float64
	OptionType     string
	Taker          float64
	Maker          float64
	Limits         Limits
	Created        int64
}

// CreateMarketInterface initializes the MarketInterface struct
func CreateMarketInterface(data interface{}) MarketInterface {
	m := data.(map[string]interface{})

	// Handle limits if present
	var limits Limits
	if v, ok := m["limits"]; ok {
		limits = CreateLimits(v)
	}

	return MarketInterface{
		Info:           m,
		UppercaseID:    SafeStringTyped(m, "uppercaseId"),
		LowercaseID:    SafeStringTyped(m, "lowercaseId"),
		Symbol:         SafeStringTyped(m, "symbol"),
		BaseCurrency:   SafeStringTyped(m, "base"),
		QuoteCurrency:  SafeStringTyped(m, "quote"),
		BaseID:         SafeStringTyped(m, "baseId"),
		QuoteID:        SafeStringTyped(m, "quoteId"),
		Active:         SafeBoolTyped(m, "active"),
		Type:           SafeStringTyped(m, "type"),
		Spot:           SafeBoolTyped(m, "spot"),
		Margin:         SafeBoolTyped(m, "margin"),
		Swap:           SafeBoolTyped(m, "swap"),
		Future:         SafeBoolTyped(m, "future"),
		Option:         SafeBoolTyped(m, "option"),
		Contract:       SafeBoolTyped(m, "contract"),
		Settle:         SafeStringTyped(m, "settle"),
		SettleID:       SafeStringTyped(m, "settleId"),
		ContractSize:   SafeFloatTyped(m, "contractSize"),
		Linear:         SafeBoolTyped(m, "linear"),
		Inverse:        SafeBoolTyped(m, "inverse"),
		Quanto:         SafeBoolTyped(m, "quanto"),
		Expiry:         SafeInt64Typed(m, "expiry"),
		ExpiryDatetime: SafeStringTyped(m, "expiryDatetime"),
		Strike:         SafeFloatTyped(m, "strike"),
		OptionType:     SafeStringTyped(m, "optionType"),
		Taker:          SafeFloatTyped(m, "taker"),
		Maker:          SafeFloatTyped(m, "maker"),
		Limits:         limits,
		Created:        SafeInt64Typed(m, "created"),
	}
}

// Precision struct
type Precision struct {
	Amount float64
	Price  float64
}

func CreatePrecision(data interface{}) Precision {
	m := data.(map[string]interface{})
	return Precision{
		Amount: SafeFloatTyped(m, "amount"),
		Price:  SafeFloatTyped(m, "price"),
	}
}

// MarketMarginModes struct
type MarketMarginModes struct {
	Cross    bool
	Isolated bool
}

func CreateMarketMarginModes(data interface{}) MarketMarginModes {
	m := data.(map[string]interface{})
	return MarketMarginModes{
		Cross:    SafeBoolTyped(m, "cross"),
		Isolated: SafeBoolTyped(m, "isolated"),
	}
}

// MinMax struct
type MinMax struct {
	Min float64
	Max float64
}

func CreateMinMax(data interface{}) MinMax {
	m := data.(map[string]interface{})
	return MinMax{
		Min: SafeFloatTyped(m, "min"),
		Max: SafeFloatTyped(m, "max"),
	}
}

// Fee struct
type Fee struct {
	Rate float64
	Cost float64
}

func CreateFee(data interface{}) Fee {
	m := data.(map[string]interface{})
	return Fee{
		Rate: SafeFloatTyped(m, "rate"),
		Cost: SafeFloatTyped(m, "cost"),
	}
}

// TradingFeeInterface struct
type TradingFeeInterface struct {
	Symbol     string
	Maker      float64
	Taker      float64
	Percentage bool
	TierBased  bool
	Info       map[string]interface{}
}

func CreateTradingFeeInterface(data interface{}) TradingFeeInterface {
	m := data.(map[string]interface{})
	return TradingFeeInterface{
		Symbol:     SafeStringTyped(m, "symbol"),
		Maker:      SafeFloatTyped(m, "maker"),
		Taker:      SafeFloatTyped(m, "taker"),
		Percentage: SafeBoolTyped(m, "percentage"),
		TierBased:  SafeBoolTyped(m, "tierBased"),
		Info:       m,
	}
}

// Limits struct
type Limits struct {
	Amount   *MinMax
	Cost     *MinMax
	Leverage *MinMax
	Price    *MinMax
}

func CreateLimits(data interface{}) Limits {
	m := data.(map[string]interface{})
	var amount, cost, leverage, price *MinMax
	if v, ok := m["amount"]; ok {
		amountValue := CreateMinMax(v)
		amount = &amountValue
	}
	if v, ok := m["cost"]; ok {
		costValue := CreateMinMax(v)
		cost = &costValue
	}
	if v, ok := m["leverage"]; ok {
		leverageValue := CreateMinMax(v)
		leverage = &leverageValue
	}
	if v, ok := m["price"]; ok {
		priceValue := CreateMinMax(v)
		price = &priceValue
	}
	return Limits{
		Amount:   amount,
		Cost:     cost,
		Leverage: leverage,
		Price:    price,
	}
}

// Market struct
type Market struct {
	ID            string
	Symbol        string
	BaseCurrency  string
	QuoteCurrency string
	BaseID        string
	QuoteID       string
	Active        bool
	Type          string
	Precision     *Precision
	MarginModes   *MarketMarginModes
	Limits        *Limits
	Info          map[string]interface{}
	Created       time.Time
}

func CreateMarket(data interface{}) Market {
	m := data.(map[string]interface{})
	var precision *Precision
	var marginModes *MarketMarginModes
	var limits *Limits
	if v, ok := m["precision"]; ok {
		precisionValue := CreatePrecision(v)
		precision = &precisionValue
	}
	if v, ok := m["marginModes"]; ok {
		marginModesValue := CreateMarketMarginModes(v)
		marginModes = &marginModesValue
	}
	if v, ok := m["limits"]; ok {
		limitsValue := CreateLimits(v)
		limits = &limitsValue
	}

	created := time.Unix(0, 0)
	if v, ok := m["created"]; ok {
		if timestamp, ok := v.(int64); ok {
			created = time.Unix(timestamp/1000, 0)
		}
	}

	return Market{
		ID:            SafeStringTyped(m, "id"),
		Symbol:        SafeStringTyped(m, "symbol"),
		BaseCurrency:  SafeStringTyped(m, "base"),
		QuoteCurrency: SafeStringTyped(m, "quote"),
		BaseID:        SafeStringTyped(m, "baseId"),
		QuoteID:       SafeStringTyped(m, "quoteId"),
		Active:        SafeBoolTyped(m, "active"),
		Type:          SafeStringTyped(m, "type"),
		Precision:     precision,
		MarginModes:   marginModes,
		Limits:        limits,
		Info:          m,
		Created:       created,
	}
}

// Trade struct
type Trade struct {
	Amount       float64
	Price        float64
	Cost         float64
	ID           string
	Order        string
	Info         map[string]interface{}
	Timestamp    int64
	Datetime     string
	Symbol       string
	Type         string
	Side         string
	TakerOrMaker string
	Fee          *Fee
}

func CreateTrade(data interface{}) Trade {
	m := data.(map[string]interface{})
	var fee *Fee
	if v, ok := m["fee"]; ok {
		feeValue := CreateFee(v)
		fee = &feeValue
	}

	return Trade{
		Amount:       SafeFloatTyped(m, "amount"),
		Price:        SafeFloatTyped(m, "price"),
		Cost:         SafeFloatTyped(m, "cost"),
		ID:           SafeStringTyped(m, "id"),
		Order:        SafeStringTyped(m, "order"),
		Timestamp:    SafeInt64Typed(m, "timestamp"),
		Datetime:     SafeStringTyped(m, "datetime"),
		Symbol:       SafeStringTyped(m, "symbol"),
		Type:         SafeStringTyped(m, "type"),
		Side:         SafeStringTyped(m, "side"),
		TakerOrMaker: SafeStringTyped(m, "takerOrMaker"),
		Fee:          fee,
		Info:         m,
	}
}

// Order struct
type Order struct {
	ID                 string
	ClientOrderID      string
	Timestamp          int64
	Datetime           string
	LastTradeTimestamp string
	Symbol             string
	Type               string
	Side               string
	Price              float64
	Cost               float64
	Average            float64
	Amount             float64
	Filled             float64
	Remaining          float64
	Status             string
	ReduceOnly         bool
	PostOnly           bool
	Fee                *Fee
	Trades             []Trade
	TriggerPrice       float64
	StopLossPrice      float64
	TakeProfitPrice    float64
	Info               map[string]interface{}
}

func CreateOrder(data interface{}) Order {
	m := data.(map[string]interface{})
	var fee *Fee
	if v, ok := m["fee"]; ok {
		feeValue := CreateFee(v)
		fee = &feeValue
	}
	var trades []Trade
	if v, ok := m["trades"]; ok {
		tradesData := v.([]interface{})
		for _, tradeData := range tradesData {
			trade := CreateTrade(tradeData)
			trades = append(trades, trade)
		}
	}

	return Order{
		ID:                 SafeStringTyped(m, "id"),
		ClientOrderID:      SafeStringTyped(m, "clientOrderId"),
		Timestamp:          SafeInt64Typed(m, "timestamp"),
		Datetime:           SafeStringTyped(m, "datetime"),
		LastTradeTimestamp: SafeStringTyped(m, "lastTradeTimestamp"),
		Symbol:             SafeStringTyped(m, "symbol"),
		Type:               SafeStringTyped(m, "type"),
		Side:               SafeStringTyped(m, "side"),
		Price:              SafeFloatTyped(m, "price"),
		Cost:               SafeFloatTyped(m, "cost"),
		Average:            SafeFloatTyped(m, "average"),
		Amount:             SafeFloatTyped(m, "amount"),
		Filled:             SafeFloatTyped(m, "filled"),
		Remaining:          SafeFloatTyped(m, "remaining"),
		Status:             SafeStringTyped(m, "status"),
		ReduceOnly:         SafeBoolTyped(m, "reduceOnly"),
		PostOnly:           SafeBoolTyped(m, "postOnly"),
		Fee:                fee,
		Trades:             trades,
		TriggerPrice:       SafeFloatTyped(m, "triggerPrice"),
		StopLossPrice:      SafeFloatTyped(m, "stopLossPrice"),
		TakeProfitPrice:    SafeFloatTyped(m, "takeProfitPrice"),
		Info:               m,
	}
}

// Ticker struct
type Ticker struct {
	Symbol        string
	Timestamp     int64
	Datetime      string
	High          float64
	Low           float64
	Bid           float64
	BidVolume     float64
	Ask           float64
	AskVolume     float64
	Vwap          float64
	Open          float64
	Close         float64
	Last          float64
	PreviousClose float64
	Change        float64
	Percentage    float64
	Average       float64
	BaseVolume    float64
	QuoteVolume   float64
	Info          map[string]interface{}
}

func CreateTicker(data interface{}) Ticker {
	m := data.(map[string]interface{})
	return Ticker{
		Symbol:        SafeStringTyped(m, "symbol"),
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
		BaseVolume:    SafeFloatTyped(m, "baseVolume"),
		QuoteVolume:   SafeFloatTyped(m, "quoteVolume"),
		Info:          m,
	}
}

// OHLCV struct
type OHLCV struct {
	Timestamp int64
	Open      float64
	High      float64
	Low       float64
	Close     float64
	Volume    float64
}

func CreateOHLCV(data interface{}) OHLCV {
	ohlcv := data.([]interface{})
	return OHLCV{
		Timestamp: SafeInt64Typed(ohlcv, 0),
		Open:      SafeFloatTyped(ohlcv, 1),
		High:      SafeFloatTyped(ohlcv, 2),
		Low:       SafeFloatTyped(ohlcv, 3),
		Close:     SafeFloatTyped(ohlcv, 4),
		Volume:    SafeFloatTyped(ohlcv, 5),
	}
}
