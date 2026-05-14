package ccxt

import (
	"fmt"
	"math"
	"strings"
	"sync"
	"time"
)

// Utility functions for safe extraction from maps
func SafeFloatTyped(m any, key any) *float64 {
	res := SafeFloat(m, key, math.NaN())

	if res != nil {
		resFloat := res.(float64)
		if math.IsNaN(resFloat) {
			return nil
		}
		return &resFloat
	}
	return nil
}

func SafeStringTyped(m any, key any) *string {
	res := SafeString(m, key, nil)
	if res != nil {
		resStr := res.(string)
		return &resStr
	}
	return nil
}

func SafeBoolTyp(m any, key any) *bool {
	res := SafeBool(m, key, false)
	if res != nil {
		resBool := res.(bool)
		return &resBool
	}
	return nil
}

func SafeInt64Typed(m any, key any) *int64 {
	res := SafeInteger(m, key, nil)
	if res != nil {
		resInt := res.(int64)
		return &resInt
	}
	return nil
}

func SafeBoolTyped(m any, key any) *bool {
	res := SafeBool(m, key, nil)
	if res != nil {
		resBool := res.(bool)
		return &resBool
	}
	return nil
}

func SafeMapToMap(sm *sync.Map) map[string]any {
	if sm == nil {
		return nil
	}
	result := make(map[string]any)
	sm.Range(func(key, value any) bool {
		if strKey, ok := key.(string); ok {
			result[strKey] = value
		}
		return true
	})
	return result
}

// MarketInterface struct
type MarketInterface struct {
	Info           map[string]any
	Id             *string
	UppercaseId    *string
	LowercaseId    *string
	Symbol         *string
	BaseCurrency   *string
	QuoteCurrency  *string
	BaseId         *string
	QuoteId        *string
	Active         *bool
	Type           *string
	Spot           *bool
	Margin         *bool
	Swap           *bool
	Future         *bool
	Option         *bool
	Contract       *bool
	Settle         *string
	SettleId       *string
	ContractSize   *float64
	Linear         *bool
	Inverse        *bool
	Quanto         *bool
	Expiry         *int64
	ExpiryDatetime *string
	Strike         *float64
	OptionType     *string
	Taker          *float64
	Maker          *float64
	Limits         Limits
	Created        *int64
}

// CreateMarketInterface initializes the MarketInterface struct
func NewMarketInterface(data any) MarketInterface {
	if data == nil {
		return MarketInterface{}
	}

	m := data.(map[string]any)

	// Handle limits if present
	var limits Limits
	if v, ok := m["limits"]; ok {
		limits = NewLimits(v)
	}

	return MarketInterface{
		Info:           m,
		Id:             SafeStringTyped(m, "id"),
		UppercaseId:    SafeStringTyped(m, "uppercaseId"),
		LowercaseId:    SafeStringTyped(m, "lowercaseId"),
		Symbol:         SafeStringTyped(m, "symbol"),
		BaseCurrency:   SafeStringTyped(m, "base"),
		QuoteCurrency:  SafeStringTyped(m, "quote"),
		BaseId:         SafeStringTyped(m, "baseId"),
		QuoteId:        SafeStringTyped(m, "quoteId"),
		Active:         SafeBoolTyped(m, "active"),
		Type:           SafeStringTyped(m, "type"),
		Spot:           SafeBoolTyped(m, "spot"),
		Margin:         SafeBoolTyped(m, "margin"),
		Swap:           SafeBoolTyped(m, "swap"),
		Future:         SafeBoolTyped(m, "future"),
		Option:         SafeBoolTyped(m, "option"),
		Contract:       SafeBoolTyped(m, "contract"),
		Settle:         SafeStringTyped(m, "settle"),
		SettleId:       SafeStringTyped(m, "settleId"),
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

func NewMarketsMap(data2 any) map[string]MarketInterface {
	if data2 == nil {
		data2 = make(map[string]any)
	}
	// data := ConvertToMap(data2)
	if dataMap, ok := data2.(*sync.Map); ok {
		data2 = SafeMapToMap(dataMap)
	}
	data := data2.(map[string]any)
	result := make(map[string]MarketInterface)
	for key, value := range data {
		result[key] = NewMarketInterface(value)
	}
	return result
}

// Precision struct
type Precision struct {
	Amount *float64
	Price  *float64
}

func NewPrecision(data any) Precision {
	m := data.(map[string]any)
	return Precision{
		Amount: SafeFloatTyped(m, "amount"),
		Price:  SafeFloatTyped(m, "price"),
	}
}

// MarketMarginModes struct
type MarketMarginModes struct {
	Cross    *bool
	Isolated *bool
}

func NewMarketMarginModes(data any) MarketMarginModes {
	m := data.(map[string]any)
	return MarketMarginModes{
		Cross:    SafeBoolTyped(m, "cross"),
		Isolated: SafeBoolTyped(m, "isolated"),
	}
}

// MinMax struct
// type MinMax struct {
// 	Min *float64
// 	Max *float64
// }

// func NewMinMax(data any) MinMax {
// 	m := data.(map[string]any)
// 	return MinMax{
// 		Min: SafeFloatTyped(m, "min"),
// 		Max: SafeFloatTyped(m, "max"),
// 	}
// }

// Fee struct
type Fee struct {
	Rate *float64
	Cost *float64
}

func NewFee(data any) Fee {
	m := data.(map[string]any)
	return Fee{
		Rate: SafeFloatTyped(m, "rate"),
		Cost: SafeFloatTyped(m, "cost"),
	}
}

// TradingFeeInterface struct
type TradingFeeInterface struct {
	Symbol     *string
	Maker      *float64
	Taker      *float64
	Percentage *bool
	TierBased  *bool
	Info       map[string]any
}

func NewTradingFeeInterface(data any) TradingFeeInterface {
	m := data.(map[string]any)
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
	Amount   MinMax
	Cost     MinMax
	Leverage MinMax
	Price    MinMax
}

func NewLimits(data any) Limits {
	m := data.(map[string]any)
	var amount, cost, leverage, price MinMax
	if v, ok := m["amount"]; ok {
		amountValue := NewMinMax(v.(map[string]any))
		amount = amountValue
	}
	if v, ok := m["cost"]; ok {
		costValue := NewMinMax(v.(map[string]any))
		cost = costValue
	}
	if v, ok := m["leverage"]; ok {
		leverageValue := NewMinMax(v.(map[string]any))
		leverage = leverageValue
	}
	if v, ok := m["price"]; ok {
		priceValue := NewMinMax(v.(map[string]any))
		price = priceValue
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
	Id            *string
	Symbol        *string
	BaseCurrency  *string
	QuoteCurrency *string
	BaseId        *string
	QuoteId       *string
	Active        *bool
	Type          *string
	Precision     *Precision
	MarginModes   *MarketMarginModes
	Limits        *Limits
	Info          map[string]any
	Created       time.Time
}

func NewMarket(data any) Market {
	m := data.(map[string]any)
	var precision *Precision
	var marginModes *MarketMarginModes
	var limits *Limits
	if v, ok := m["precision"]; ok {
		precisionValue := NewPrecision(v)
		precision = &precisionValue
	}
	if v, ok := m["marginModes"]; ok {
		marginModesValue := NewMarketMarginModes(v)
		marginModes = &marginModesValue
	}
	if v, ok := m["limits"]; ok {
		limitsValue := NewLimits(v)
		limits = &limitsValue
	}

	created := time.Unix(0, 0)
	if v, ok := m["created"]; ok {
		if timestamp, ok := v.(int64); ok {
			created = time.Unix(timestamp/1000, 0)
		}
	}

	return Market{
		Id:            SafeStringTyped(m, "id"),
		Symbol:        SafeStringTyped(m, "symbol"),
		BaseCurrency:  SafeStringTyped(m, "base"),
		QuoteCurrency: SafeStringTyped(m, "quote"),
		BaseId:        SafeStringTyped(m, "baseId"),
		QuoteId:       SafeStringTyped(m, "quoteId"),
		Active:        SafeBoolTyped(m, "active"),
		Type:          SafeStringTyped(m, "type"),
		Precision:     precision,
		MarginModes:   marginModes,
		Limits:        limits,
		Info:          GetInfo(m),
		Created:       created,
	}
}

// Trade struct
type Trade struct {
	Amount       *float64
	Price        *float64
	Cost         *float64
	Id           *string
	Order        *string
	Info         map[string]any
	Timestamp    *int64
	Datetime     *string
	Symbol       *string
	Type         *string
	Side         *string
	TakerOrMaker *string
	Fee          Fee
}

func NewTrade(data any) Trade {
	m := data.(map[string]any)

	return Trade{
		Amount:       SafeFloatTyped(m, "amount"),
		Price:        SafeFloatTyped(m, "price"),
		Cost:         SafeFloatTyped(m, "cost"),
		Id:           SafeStringTyped(m, "id"),
		Order:        SafeStringTyped(m, "order"),
		Timestamp:    SafeInt64Typed(m, "timestamp"),
		Datetime:     SafeStringTyped(m, "datetime"),
		Symbol:       SafeStringTyped(m, "symbol"),
		Type:         SafeStringTyped(m, "type"),
		Side:         SafeStringTyped(m, "side"),
		TakerOrMaker: SafeStringTyped(m, "takerOrMaker"),
		Fee:          NewFee(SafeValue(m, "fee", map[string]any{}).(map[string]any)),
		Info:         m,
	}
}

// Order struct
type Order struct {
	Id                 *string
	ClientOrderId      *string
	Timestamp          *int64
	Datetime           *string
	LastTradeTimestamp *string
	Symbol             *string
	Type               *string
	Side               *string
	Price              *float64
	Cost               *float64
	Average            *float64
	Amount             *float64
	Filled             *float64
	Remaining          *float64
	Status             *string
	ReduceOnly         *bool
	PostOnly           *bool
	Fee                Fee
	Trades             []Trade
	TriggerPrice       *float64
	StopLossPrice      *float64
	TakeProfitPrice    *float64
	Info               map[string]any
}

func NewOrder(data any) Order {
	m := data.(map[string]any)
	var trades []Trade
	if v, ok := m["trades"]; ok {
		tradesData := v.([]any)
		for _, tradeData := range tradesData {
			trade := NewTrade(tradeData)
			trades = append(trades, trade)
		}
	}

	return Order{
		Id:                 SafeStringTyped(m, "id"),
		ClientOrderId:      SafeStringTyped(m, "clientOrderId"),
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
		Fee:                NewFee(SafeValue(m, "fee", map[string]any{}).(map[string]any)),
		Trades:             trades,
		TriggerPrice:       SafeFloatTyped(m, "triggerPrice"),
		StopLossPrice:      SafeFloatTyped(m, "stopLossPrice"),
		TakeProfitPrice:    SafeFloatTyped(m, "takeProfitPrice"),
		Info:               m,
	}
}

// Ticker struct
type Ticker struct {
	Symbol        *string
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
	BaseVolume    *float64
	QuoteVolume   *float64
	Info          map[string]any
}

func NewTicker(data any) Ticker {
	m := data.(map[string]any)
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
		Info:          GetInfo(m),
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

func NewOHLCV(data any) OHLCV {
	ohlcv := data.([]any)
	return OHLCV{
		Timestamp: *SafeInt64Typed(ohlcv, 0),
		Open:      *SafeFloatTyped(ohlcv, 1),
		High:      *SafeFloatTyped(ohlcv, 2),
		Low:       *SafeFloatTyped(ohlcv, 3),
		Close:     *SafeFloatTyped(ohlcv, 4),
		Volume:    *SafeFloatTyped(ohlcv, 5),
	}
}

// transaction

type Transaction struct {
	Id        *string
	TxId      *string
	Address   *string
	Tag       *string
	Type      *string
	Currency  *string
	Amount    *float64
	Status    *string
	Updated   *int64
	Timestamp *int64
	Datetime  *string
}

// NewTransaction initializes a Transaction struct from a map.
func NewTransaction(transaction2 any) Transaction {
	transaction := transaction2.(map[string]any)
	return Transaction{
		Id:        SafeStringTyped(transaction, "id"),
		TxId:      SafeStringTyped(transaction, "txid"),
		Address:   SafeStringTyped(transaction, "address"),
		Tag:       SafeStringTyped(transaction, "tag"),
		Type:      SafeStringTyped(transaction, "type"),
		Currency:  SafeStringTyped(transaction, "currency"),
		Amount:    SafeFloatTyped(transaction, "amount"),
		Status:    SafeStringTyped(transaction, "status"),
		Updated:   SafeInt64Typed(transaction, "updated"),
		Timestamp: SafeInt64Typed(transaction, "timestamp"),
		Datetime:  SafeStringTyped(transaction, "datetime"),
	}
}

// orderbook

type OrderBook struct {
	Bids      [][]float64
	Asks      [][]float64
	Symbol    *string
	Timestamp *int64
	Datetime  *string
	Nonce     *int64
}

// NewOrderBook initializes an OrderBook struct from a map.
func NewOrderBook(orderbook2 any) OrderBook {
	if orderbook2 == nil {
		return OrderBook{}
	}
	orderbook := orderbook2.(map[string]any)
	return OrderBook{
		Bids:      parseOrderBookEntries(orderbook, "bids"),
		Asks:      parseOrderBookEntries(orderbook, "asks"),
		Symbol:    SafeStringTyped(orderbook, "symbol"),
		Timestamp: SafeInt64Typed(orderbook, "timestamp"),
		Datetime:  SafeStringTyped(orderbook, "datetime"),
		Nonce:     SafeInt64Typed(orderbook, "nonce"),
	}
}

// parseOrderBookEntries extracts and converts order book entries to [][]float64.
func parseOrderBookEntries(orderbook map[string]any, key string) [][]float64 {
	if value, ok := orderbook[key]; ok {
		var result [][]float64
		if entries, ok := value.([]any); ok {
			for _, entry := range entries {
				if pair, ok := entry.([]any); ok {
					var floatPair []float64
					for _, v := range pair {
						if num, ok := v.(float64); ok {
							floatPair = append(floatPair, num)
						}
					}
					if len(floatPair) == 2 { // Ensure bid/ask pairs have two values
						result = append(result, floatPair)
					}
				}
			}
			return result
		} else if entries, ok := value.([][]any); ok {
			for _, entry := range entries {
				var floatPair []float64
				for _, v := range entry {
					if num, ok := v.(float64); ok {
						floatPair = append(floatPair, num)
					}
				}
				if len(floatPair) == 2 { // Ensure bid/ask pairs have two values
					result = append(result, floatPair)
				}
			}
			return result
		}
	}
	return nil
}

// tickers
// Tickers struct
type Tickers struct {
	Info    map[string]any
	Tickers map[string]Ticker
}

// NewTickers initializes a Tickers struct from a map.
func NewTickers(tickersData2 any) Tickers {
	tickersData := tickersData2.(map[string]any)
	info := GetInfo(tickersData) // Assuming Helper.GetInfo is implemented as GetInfo
	tickersMap := make(map[string]Ticker)

	for key, value := range tickersData {
		if key != "info" {
			if tickerData, ok := value.(map[string]any); ok {
				tickersMap[key] = NewTicker(tickerData) // Assuming NewTicker is the Ticker constructor
			}
		}
	}

	return Tickers{
		Info:    info,
		Tickers: tickersMap,
	}
}

// GetTicker retrieves a Ticker by key, similar to the indexer in C#.
func (t *Tickers) GetTicker(key string) (Ticker, error) {
	ticker, exists := t.Tickers[key]
	if !exists {
		return Ticker{}, fmt.Errorf("the key '%s' was not found in the tickers", key)
	}
	return ticker, nil
}

// SetTicker sets or updates a Ticker by key.
func (t *Tickers) SetTicker(key string, ticker Ticker) {
	t.Tickers[key] = ticker
}

// Mocked GetInfo function for demonstration purposes.
func GetInfo(data2 any) map[string]any {
	data := data2.(map[string]any)
	if info, ok := data["info"].(map[string]any); ok {
		return info
	}
	return nil
}

// balances

type Balance struct {
	Free  *float64
	Used  *float64
	Total *float64
}

// String returns a string representation of the Balance struct
func (b *Balance) String() string {
	var result strings.Builder
	result.WriteString("Balance{")

	if b.Free != nil {
		result.WriteString(fmt.Sprintf(" Free:%v", *b.Free))
	} else {
		result.WriteString(" Free:nil")
	}

	if b.Used != nil {
		result.WriteString(fmt.Sprintf(" Used:%v", *b.Used))
	} else {
		result.WriteString(" Used:nil")
	}

	if b.Total != nil {
		result.WriteString(fmt.Sprintf(" Total:%v", *b.Total))
	} else {
		result.WriteString(" Total:nil")
	}

	result.WriteString("}")
	return result.String()
}

type Balances struct {
	Balances map[string]Balance
	Free     map[string]*float64
	Used     map[string]*float64
	Total    map[string]*float64
	Info     map[string]any
}

// NewBalance initializes a Balance struct from a map.
func NewBalance(balanceData2 any) Balance {
	balanceData := balanceData2.(map[string]any)
	return Balance{
		Free:  SafeFloatTyped(balanceData, "free"),
		Used:  SafeFloatTyped(balanceData, "used"),
		Total: SafeFloatTyped(balanceData, "total"),
	}
}

// NewBalances initializes a Balances struct from a map.
func NewBalances(balancesData2 any) Balances {
	balancesData := balancesData2.(map[string]any)
	balancesMap := make(map[string]Balance)
	freeBalances := make(map[string]*float64)
	usedBalances := make(map[string]*float64)
	totalBalances := make(map[string]*float64)

	for key, value := range balancesData {
		// Skip non-balance fields
		if key == "info" || key == "free" || key == "used" || key == "total" || key == "timestamp" || key == "datetime" {
			continue
		}

		if balanceData, ok := value.(map[string]any); ok {
			balancesMap[key] = NewBalance(balanceData)
		}
	}

	// Handle "free" balances
	if freeData, ok := balancesData["free"].(map[string]any); ok {
		for key, value := range freeData {
			if value == nil {
				freeBalances[key] = nil
			} else if floatValue, ok := value.(float64); ok {
				freeBalances[key] = &floatValue
			}
		}
	}

	// Handle "used" balances
	if usedData, ok := balancesData["used"].(map[string]any); ok {
		for key, value := range usedData {
			if value == nil {
				usedBalances[key] = nil
			} else if floatValue, ok := value.(float64); ok {
				usedBalances[key] = &floatValue
			}
		}
	}

	// Handle "total" balances
	if totalData, ok := balancesData["total"].(map[string]any); ok {
		for key, value := range totalData {
			if value == nil {
				totalBalances[key] = nil
			} else if floatValue, ok := value.(float64); ok {
				totalBalances[key] = &floatValue
			}
		}
	}

	// Extract "info"
	info := GetInfo(balancesData) // Assuming GetInfo is implemented

	return Balances{
		Balances: balancesMap,
		Free:     freeBalances,
		Used:     usedBalances,
		Total:    totalBalances,
		Info:     info,
	}
}

// GetBalance retrieves a Balance by key.
func (b *Balances) GetBalance(key string) (Balance, error) {
	balance, exists := b.Balances[key]
	if !exists {
		return Balance{}, fmt.Errorf("the key '%s' was not found in the balances", key)
	}
	return balance, nil
}

// SetBalance sets or updates a Balance by key.
func (b *Balances) SetBalance(key string, balance Balance) {
	b.Balances[key] = balance
}

// String returns a string representation of the Balances struct
func (b *Balances) String() string {
	var result strings.Builder
	result.WriteString("Balances{")

	if len(b.Balances) > 0 {
		result.WriteString(" Balances:{")
		for key, balance := range b.Balances {
			result.WriteString(fmt.Sprintf(" %s:%s", key, balance.String()))
		}
		result.WriteString("}")
	}

	if len(b.Free) > 0 {
		result.WriteString(" Free:{")
		for key, value := range b.Free {
			if value != nil {
				result.WriteString(fmt.Sprintf(" %s:%v", key, *value))
			} else {
				result.WriteString(fmt.Sprintf(" %s:nil", key))
			}
		}
		result.WriteString("}")
	}

	if len(b.Used) > 0 {
		result.WriteString(" Used:{")
		for key, value := range b.Used {
			if value != nil {
				result.WriteString(fmt.Sprintf(" %s:%v", key, *value))
			} else {
				result.WriteString(fmt.Sprintf(" %s:nil", key))
			}
		}
		result.WriteString("}")
	}

	if len(b.Total) > 0 {
		result.WriteString(" Total:{")
		for key, value := range b.Total {
			if value != nil {
				result.WriteString(fmt.Sprintf(" %s:%v", key, *value))
			} else {
				result.WriteString(fmt.Sprintf(" %s:nil", key))
			}
		}
		result.WriteString("}")
	}

	result.WriteString("}")
	return result.String()
}

// funding rate

type FundingRate struct {
	Symbol                   *string
	Timestamp                *int64
	Datetime                 *string
	FundingRate              *float64
	MarkPrice                *float64
	IndexPrice               *float64
	InterestRate             *float64
	EstimatedSettlePrice     *float64
	FundingTimestamp         *float64
	NextFundingTimestamp     *float64
	NextFundingRate          *float64
	NextFundingDatetime      *int64
	PreviousFundingTimestamp *float64
	PreviousFundingDatetime  *string
	PreviousFundingRate      *float64
	Interval                 *string
}

// NewFundingRate initializes a FundingRate struct from a map.
func NewFundingRate(fundingRateEntry2 any) FundingRate {
	fundingRateEntry := fundingRateEntry2.(map[string]any)
	return FundingRate{
		Symbol:                   SafeStringTyped(fundingRateEntry, "symbol"),
		Datetime:                 SafeStringTyped(fundingRateEntry, "datetime"),
		Timestamp:                SafeInt64Typed(fundingRateEntry, "timestamp"),
		FundingRate:              SafeFloatTyped(fundingRateEntry, "fundingRate"),
		MarkPrice:                SafeFloatTyped(fundingRateEntry, "markPrice"),
		IndexPrice:               SafeFloatTyped(fundingRateEntry, "indexPrice"),
		InterestRate:             SafeFloatTyped(fundingRateEntry, "interestRate"),
		EstimatedSettlePrice:     SafeFloatTyped(fundingRateEntry, "estimatedSettlePrice"),
		FundingTimestamp:         SafeFloatTyped(fundingRateEntry, "fundingTimestamp"),
		NextFundingTimestamp:     SafeFloatTyped(fundingRateEntry, "nextFundingTimestamp"),
		NextFundingRate:          SafeFloatTyped(fundingRateEntry, "nextFundingRate"),
		NextFundingDatetime:      SafeInt64Typed(fundingRateEntry, "nextFundingDatetime"),
		PreviousFundingTimestamp: SafeFloatTyped(fundingRateEntry, "previousFundingTimestamp"),
		PreviousFundingDatetime:  SafeStringTyped(fundingRateEntry, "previousFundingDatetime"),
		PreviousFundingRate:      SafeFloatTyped(fundingRateEntry, "previousFundingRate"),
		Interval:                 SafeStringTyped(fundingRateEntry, "interval"),
	}
}

type FundingRates struct {
	Info         map[string]any
	FundingRates map[string]FundingRate
}

// NewFundingRates initializes a FundingRates struct from a map.
func NewFundingRates(fundingRatesData2 any) FundingRates {
	fundingRatesData := fundingRatesData2.(map[string]any)
	info := GetInfo(fundingRatesData) // Assuming Helper.GetInfo is implemented
	fundingRatesMap := make(map[string]FundingRate)

	for key, value := range fundingRatesData {
		if key != "info" {
			if rateData, ok := value.(map[string]any); ok {
				fundingRatesMap[key] = NewFundingRate(rateData)
			}
		}
	}

	return FundingRates{
		Info:         info,
		FundingRates: fundingRatesMap,
	}
}

// transfer entry

type TransferEntry struct {
	Info        map[string]any
	Id          *string
	Timestamp   *int64
	Datetime    *string
	Currency    *string
	Amount      *float64
	FromAccount *string
	ToAccount   *string
	Status      *string
}

// NewTransferEntry initializes a TransferEntry struct from a map.
func NewTransferEntry(transferData2 any) TransferEntry {
	transferData := transferData2.(map[string]any)
	return TransferEntry{
		Info:        GetInfo(transferData), // Assuming GetInfo is implemented
		Id:          SafeStringTyped(transferData, "id"),
		Timestamp:   SafeInt64Typed(transferData, "timestamp"),
		Datetime:    SafeStringTyped(transferData, "datetime"),
		Currency:    SafeStringTyped(transferData, "currency"),
		Amount:      SafeFloatTyped(transferData, "amount"),
		FromAccount: SafeStringTyped(transferData, "fromAccount"),
		ToAccount:   SafeStringTyped(transferData, "toAccount"),
		Status:      SafeStringTyped(transferData, "status"),
	}
}

type OrderRequest struct {
	Symbol     *string
	Type       *string
	Side       *string
	Amount     *float64
	Price      *float64
	Parameters map[string]any
}

// NewOrderRequest initializes an OrderRequest struct from a map.
func NewOrderRequest(requestData map[string]any) OrderRequest {
	parameters := SafeValue(requestData, "parameters", nil) // Assuming SafeValue is implemented
	var parametersMap map[string]any
	if parameters != nil {
		parametersMap, _ = parameters.(map[string]any)
	}

	return OrderRequest{
		Symbol:     SafeStringTyped(requestData, "symbol"),
		Type:       SafeStringTyped(requestData, "type"),
		Side:       SafeStringTyped(requestData, "side"),
		Amount:     SafeFloatTyped(requestData, "amount"),
		Price:      SafeFloatTyped(requestData, "price"),
		Parameters: parametersMap,
	}
}

func ConvertOrderRequestListToArray(orderRequests []OrderRequest) []any {
	var result []any
	for _, orderRequest := range orderRequests {
		symbol := *orderRequest.Symbol
		orderType := *orderRequest.Type
		side := *orderRequest.Side
		amount := *orderRequest.Amount
		price := *orderRequest.Price
		parameters := orderRequest.Parameters
		individualOrderRequest := map[string]any{
			"symbol": symbol,
			"type":   orderType,
			"side":   side,
			"amount": amount,
			"price":  price,
			"params": parameters,
		}
		result = append(result, individualOrderRequest)
	}

	return result
}

type LastPrice struct {
	Symbol    *string
	Timestamp *int64
	Datetime  *string
	Price     *float64
	Side      *string
	Info      map[string]any
}

func NewLastPrice(data any) LastPrice {
	return LastPrice{
		Symbol:    SafeStringTyped(data, "symbol"),
		Timestamp: SafeInt64Typed(data, "timestamp"),
		Datetime:  SafeStringTyped(data, "datetime"),
		Price:     SafeFloatTyped(data, "price"),
		Side:      SafeStringTyped(data, "side"),
		Info:      GetInfo(data),
	}
}

type LastPrices struct {
	Info       map[string]any
	LastPrices map[string]LastPrice
}

// NewLastPrices initializes a LastPrices struct from a map.
func NewLastPrices(lastPricesData2 any) LastPrices {
	lastPricesData := lastPricesData2.(map[string]any)
	info := GetInfo(lastPricesData) // Assuming GetInfo is implemented
	lastPricesMap := make(map[string]LastPrice)

	for key, value := range lastPricesData {
		if key != "info" {
			if lastPriceData, ok := value.(map[string]any); ok {
				lastPricesMap[key] = NewLastPrice(lastPriceData)
			}
		}
	}

	return LastPrices{
		Info:       info,
		LastPrices: lastPricesMap,
	}
}

// GetLastPrice retrieves a LastPrice by key.
func (lp *LastPrices) GetLastPrice(key string) (LastPrice, error) {
	lastPrice, exists := lp.LastPrices[key]
	if !exists {
		return LastPrice{}, fmt.Errorf("the key '%s' was not found in the lastPrices", key)
	}
	return lastPrice, nil
}

// SetLastPrice sets or updates a LastPrice by key.
func (lp *LastPrices) SetLastPrice(key string, lastPrice LastPrice) {
	lp.LastPrices[key] = lastPrice
}

type WithdrawlResponse struct {
	Info map[string]any
	Id   *string
}

// NewWithdrawlResponse initializes a WithdrawlResponse struct from a map.
func NewWithdrawlResponse(withdrawlResponseData map[string]any) WithdrawlResponse {
	info, _ := withdrawlResponseData["info"].(map[string]any) // Assuming "info" is always a map
	return WithdrawlResponse{
		Info: info,
		Id:   SafeStringTyped(withdrawlResponseData, "id"),
	}
}

type CrossBorrowRate struct {
	Currency  *string
	Rate      *float64
	Timestamp *int64
	Datetime  *string
	Info      map[string]any
}

func NewCrossBorrowRate(data any) CrossBorrowRate {
	return CrossBorrowRate{
		Currency:  SafeStringTyped(data, "currency"),
		Rate:      SafeFloatTyped(data, "rate"),
		Timestamp: SafeInt64Typed(data, "timestamp"),
		Datetime:  SafeStringTyped(data, "datetime"),
		Info:      GetInfo(data),
	}
}

type CrossBorrowRates struct {
	Info             map[string]any
	CrossBorrowRates map[string]CrossBorrowRate
}

func NewCrossBorrowRates(data2 any) CrossBorrowRates {
	data := data2.(map[string]any)
	info := GetInfo(data)
	rates := make(map[string]CrossBorrowRate)
	for key, value := range data {
		if key != "info" {
			rates[key] = NewCrossBorrowRate(value.(map[string]any))
		}
	}
	return CrossBorrowRates{Info: info, CrossBorrowRates: rates}
}

type IsolatedBorrowRate struct {
	Symbol    *string
	BaseRate  *float64
	Quote     *string
	QuoteRate *float64
	Rate      *float64
	Timestamp *int64
	Datetime  *string
	Info      map[string]any
}

func NewIsolatedBorrowRate(data any) IsolatedBorrowRate {
	return IsolatedBorrowRate{
		Symbol:    SafeStringTyped(data, "symbol"),
		BaseRate:  SafeFloatTyped(data, "baseRate"),
		Quote:     SafeStringTyped(data, "quote"),
		QuoteRate: SafeFloatTyped(data, "quoteRate"),
		Rate:      SafeFloatTyped(data, "rate"),
		Timestamp: SafeInt64Typed(data, "timestamp"),
		Datetime:  SafeStringTyped(data, "datetime"),
		Info:      GetInfo(data),
	}
}

type IsolatedBorrowRates struct {
	Info                map[string]any
	IsolatedBorrowRates map[string]IsolatedBorrowRate
}

func NewIsolatedBorrowRates(data2 any) IsolatedBorrowRates {
	data := data2.(map[string]any)
	info := GetInfo(data)
	rates := make(map[string]IsolatedBorrowRate)
	for key, value := range data {
		if key != "info" {
			rates[key] = NewIsolatedBorrowRate(value.(map[string]any))
		}
	}
	return IsolatedBorrowRates{Info: info, IsolatedBorrowRates: rates}
}

type BorrowInterest struct {
	Info           map[string]any
	Symbol         *string
	Currency       *string
	Interest       *float64
	InterestRate   *float64
	AmountBorrowed *float64
	MarginMode     *string
	Timestamp      *int64
	Datetime       *string
}

func NewBorrowInterest(data any) BorrowInterest {
	return BorrowInterest{
		Info:           GetInfo(data),
		Symbol:         SafeStringTyped(data, "symbol"),
		Currency:       SafeStringTyped(data, "currency"),
		Interest:       SafeFloatTyped(data, "interest"),
		InterestRate:   SafeFloatTyped(data, "interestRate"),
		AmountBorrowed: SafeFloatTyped(data, "amountBorrowed"),
		MarginMode:     SafeStringTyped(data, "marginMode"),
		Timestamp:      SafeInt64Typed(data, "timestamp"),
		Datetime:       SafeStringTyped(data, "datetime"),
	}
}

type OpenInterest struct {
	Symbol             *string
	OpenInterestAmount *float64
	OpenInterestValue  *float64
	Timestamp          *int64
	Datetime           *string
	Info               map[string]any
}

func NewOpenInterest(data any) OpenInterest {
	return OpenInterest{
		Symbol:             SafeStringTyped(data, "symbol"),
		OpenInterestAmount: SafeFloatTyped(data, "openInterestAmount"),
		OpenInterestValue:  SafeFloatTyped(data, "openInterestValue"),
		Timestamp:          SafeInt64Typed(data, "timestamp"),
		Datetime:           SafeStringTyped(data, "datetime"),
		Info:               GetInfo(data),
	}
}

type OpenInterests struct {
	Info          map[string]any
	OpenInterests map[string]OpenInterest
}

// NewFundingRates initializes a FundingRates struct from a map.
func NewOpenInterests(fundingRatesData2 any) OpenInterests {
	fundingRatesData := fundingRatesData2.(map[string]any)
	info := GetInfo(fundingRatesData) // Assuming Helper.GetInfo is implemented
	fundingRatesMap := make(map[string]OpenInterest)

	for key, value := range fundingRatesData {
		if key != "info" {
			if rateData, ok := value.(map[string]any); ok {
				fundingRatesMap[key] = NewOpenInterest(rateData)
			}
		}
	}

	return OpenInterests{
		Info:          info,
		OpenInterests: fundingRatesMap,
	}
}

type Liquidation struct {
	Symbol       *string
	QuoteValue   *float64
	BaseValue    *float64
	Timestamp    *int64
	Datetime     *string
	Side         *string
	Contracts    *float64
	ContractSize *float64
	Price        *float64
	Info         map[string]any
}

func NewLiquidation(data any) Liquidation {
	return Liquidation{
		Symbol:       SafeStringTyped(data, "symbol"),
		QuoteValue:   SafeFloatTyped(data, "quoteValue"),
		BaseValue:    SafeFloatTyped(data, "baseValue"),
		Timestamp:    SafeInt64Typed(data, "timestamp"),
		Datetime:     SafeStringTyped(data, "datetime"),
		Side:         SafeStringTyped(data, "side"),
		Contracts:    SafeFloatTyped(data, "contracts"),
		ContractSize: SafeFloatTyped(data, "contractSize"),
		Price:        SafeFloatTyped(data, "price"),
		Info:         GetInfo(data),
	}
}

type MinMax struct {
	Min *float64
	Max *float64
}

func NewMinMax(data any) MinMax {
	return MinMax{
		Min: SafeFloatTyped(data, "min"),
		Max: SafeFloatTyped(data, "max"),
	}
}

type CurrencyLimits struct {
	Amount   MinMax
	Withdraw MinMax
}

func NewCurrencyLimits(data any) CurrencyLimits {
	return CurrencyLimits{
		Amount:   NewMinMax(SafeValue(data, "amount", map[string]any{}).(map[string]any)),
		Withdraw: NewMinMax(SafeValue(data, "withdraw", map[string]any{}).(map[string]any)),
	}
}

type Network struct {
	Info      map[string]any
	Id        *string
	Fee       *float64
	Active    *bool
	Deposit   *bool
	Withdraw  *bool
	Precision *float64
	Limits    CurrencyLimits
}

func NewNetwork(data any) Network {
	return Network{
		Info:      GetInfo(data),
		Id:        SafeStringTyped(data, "id"),
		Fee:       SafeFloatTyped(data, "fee"),
		Active:    SafeBoolTyped(data, "active"),
		Deposit:   SafeBoolTyped(data, "deposit"),
		Withdraw:  SafeBoolTyped(data, "withdraw"),
		Precision: SafeFloatTyped(data, "precision"),
		Limits:    NewCurrencyLimits(SafeValue(data, "limits", map[string]any{}).(map[string]any)),
	}
}

type Currency struct {
	Info      map[string]any
	Id        *string
	Code      *string
	Precision *float64
	Name      *string
	Fee       *float64
	Active    *bool
	Deposit   *bool
	Withdraw  *bool
	NumericId *int64
	Type      *string
	Margin    *bool
	Limits    CurrencyLimits
	Networks  map[string]Network
}

func NewCurrency(data any) Currency {
	networks := make(map[string]Network)
	if nets, ok := SafeValue(data, "networks", nil).(map[string]any); ok {
		for key, val := range nets {
			networks[key] = NewNetwork(val.(map[string]any))
		}
	}

	return Currency{
		Info:      GetInfo(data),
		Id:        SafeStringTyped(data, "id"),
		Code:      SafeStringTyped(data, "code"),
		Precision: SafeFloatTyped(data, "precision"),
		Name:      SafeStringTyped(data, "name"),
		Fee:       SafeFloatTyped(data, "fee"),
		Active:    SafeBoolTyped(data, "active"),
		Deposit:   SafeBoolTyped(data, "deposit"),
		Withdraw:  SafeBoolTyped(data, "withdraw"),
		NumericId: SafeInt64Typed(data, "numericId"),
		Type:      SafeStringTyped(data, "type"),
		Margin:    SafeBoolTyped(data, "margin"),
		Limits:    NewCurrencyLimits(SafeValue(data, "limits", map[string]any{}).(map[string]any)),
		Networks:  networks,
	}
}

func ifExists(data map[string]any, key string, fn func(val any) any) any {
	if val, ok := data[key]; ok {
		return fn(val)
	}
	return nil
}

type MarginMode struct {
	Info       map[string]any
	Symbol     *string
	MarginMode *string
}

func NewMarginMode(data any) MarginMode {
	return MarginMode{
		Info:       GetInfo(data),
		Symbol:     SafeStringTyped(data, "symbol"),
		MarginMode: SafeStringTyped(data, "marginMode"),
	}
}

type MarginModes struct {
	Info        map[string]any
	MarginModes map[string]MarginMode
}

func NewMarginModes(data2 any) MarginModes {
	data := data2.(map[string]any)
	info := GetInfo(data)
	marginModes := make(map[string]MarginMode)
	for key, value := range data {
		if key != "info" {
			marginModes[key] = NewMarginMode(value.(map[string]any))
		}
	}
	return MarginModes{Info: info, MarginModes: marginModes}
}

func (m *MarginModes) Get(key string) (MarginMode, error) {
	mode, exists := m.MarginModes[key]
	if !exists {
		return MarginMode{}, fmt.Errorf("the key '%s' was not found in the marginModes", key)
	}
	return mode, nil
}

func (m *MarginModes) Set(key string, mode MarginMode) {
	m.MarginModes[key] = mode
}

type Leverage struct {
	Info          map[string]any
	Symbol        *string
	MarginMode    *string
	Leverage      *int64
	LongLeverage  *int64
	ShortLeverage *int64
}

func NewLeverage(data any) Leverage {
	return Leverage{
		Info:          GetInfo(data),
		Symbol:        SafeStringTyped(data, "symbol"),
		MarginMode:    SafeStringTyped(data, "marginMode"),
		Leverage:      SafeInt64Typed(data, "leverage"),
		LongLeverage:  SafeInt64Typed(data, "longLeverage"),
		ShortLeverage: SafeInt64Typed(data, "shortLeverage"),
	}
}

type Leverages struct {
	Info      map[string]any
	Leverages map[string]Leverage
}

func NewLeverages(data2 any) Leverages {
	data := data2.(map[string]any)
	info := GetInfo(data)
	leverages := make(map[string]Leverage)
	for key, value := range data {
		if key != "info" {
			leverages[key] = NewLeverage(value.(map[string]any))
		}
	}
	return Leverages{Info: info, Leverages: leverages}
}

func (l *Leverages) Get(key string) (Leverage, error) {
	lev, exists := l.Leverages[key]
	if !exists {
		return Leverage{}, fmt.Errorf("the key '%s' was not found in the leverages", key)
	}
	return lev, nil
}

func (l *Leverages) Set(key string, lev Leverage) {
	l.Leverages[key] = lev
}

type BalanceAccount struct {
	Free  *string
	Used  *string
	Total *string
}

func NewBalanceAccount(data any) BalanceAccount {
	return BalanceAccount{
		Free:  SafeStringTyped(data, "free"),
		Used:  SafeStringTyped(data, "used"),
		Total: SafeStringTyped(data, "total"),
	}
}

type Account struct {
	Id   *string
	Type *string
	Code *string
	Info map[string]any
}

func NewAccount(data any) Account {
	return Account{
		Info: GetInfo(data),
		Id:   SafeStringTyped(data, "id"),
		Type: SafeStringTyped(data, "type"),
		Code: SafeStringTyped(data, "code"),
	}
}

type Option struct {
	Currency          *string
	Symbol            *string
	Timestamp         *int64
	Datetime          *string
	ImpliedVolatility *float64
	OpenInterest      *float64
	BidPrice          *float64
	AskPrice          *float64
	MidPrice          *float64
	MarkPrice         *float64
	LastPrice         *float64
	UnderlyingPrice   *float64
	Change            *float64
	Percentage        *float64
	BaseVolume        *float64
	QuoteVolume       *float64
	Info              map[string]any
}

func NewOption(data any) Option {
	return Option{
		Currency:          SafeStringTyped(data, "currency"),
		Symbol:            SafeStringTyped(data, "symbol"),
		Timestamp:         SafeInt64Typed(data, "timestamp"),
		Datetime:          SafeStringTyped(data, "datetime"),
		ImpliedVolatility: SafeFloatTyped(data, "bidVolume"),
		OpenInterest:      SafeFloatTyped(data, "openInterest"),
		BidPrice:          SafeFloatTyped(data, "askVolume"),
		AskPrice:          SafeFloatTyped(data, "vwap"),
		MidPrice:          SafeFloatTyped(data, "open"),
		MarkPrice:         SafeFloatTyped(data, "close"),
		LastPrice:         SafeFloatTyped(data, "last"),
		UnderlyingPrice:   SafeFloatTyped(data, "previousClose"),
		Change:            SafeFloatTyped(data, "change"),
		Percentage:        SafeFloatTyped(data, "percentage"),
		BaseVolume:        SafeFloatTyped(data, "baseVolume"),
		QuoteVolume:       SafeFloatTyped(data, "quoteVolume"),
		Info:              GetInfo(data),
	}
}

type OptionChain struct {
	Info   map[string]any
	Chains map[string]Option
}

func NewOptionChain(data2 any) OptionChain {
	data := data2.(map[string]any)
	info := GetInfo(data)
	chains := make(map[string]Option)
	for key, value := range data {
		if key != "info" {
			chains[key] = NewOption(value.(map[string]any))
		}
	}
	return OptionChain{Info: info, Chains: chains}
}

func (oc *OptionChain) Get(key string) (Option, error) {
	option, exists := oc.Chains[key]
	if !exists {
		return Option{}, fmt.Errorf("the key '%s' was not found in the chains", key)
	}
	return option, nil
}

func (oc *OptionChain) Set(key string, option Option) {
	oc.Chains[key] = option
}

type LongShortRatio struct {
	Info           map[string]any
	Symbol         *string
	Timestamp      *int64
	Datetime       *string
	Timeframe      *string
	LongShortRatio *float64
}

func NewLongShortRatio(data any) LongShortRatio {
	return LongShortRatio{
		Info:           GetInfo(data),
		Symbol:         SafeStringTyped(data, "symbol"),
		Timestamp:      SafeInt64Typed(data, "timestamp"),
		Datetime:       SafeStringTyped(data, "datetime"),
		Timeframe:      SafeStringTyped(data, "timeframe"),
		LongShortRatio: SafeFloatTyped(data, "longShortRatio"),
	}
}

type Position struct {
	Symbol                      *string
	Id                          *string
	Info                        map[string]any
	Timestamp                   *float64
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
	LastUpdateTimestamp         *float64
	LastPrice                   *float64
	Percentage                  *float64
	TakeProfitPrice             *float64
	StopLossPrice               *float64
}

func NewPosition(data any) Position {
	return Position{
		Symbol:                      SafeStringTyped(data, "symbol"),
		Id:                          SafeStringTyped(data, "id"),
		Info:                        GetInfo(data),
		Timestamp:                   SafeFloatTyped(data, "timestamp"),
		Datetime:                    SafeStringTyped(data, "datetime"),
		Contracts:                   SafeFloatTyped(data, "contracts"),
		ContractSize:                SafeFloatTyped(data, "contractsSize"),
		Side:                        SafeStringTyped(data, "side"),
		Notional:                    SafeFloatTyped(data, "notional"),
		Leverage:                    SafeFloatTyped(data, "leverage"),
		UnrealizedPnl:               SafeFloatTyped(data, "unrealizedPnl"),
		RealizedPnl:                 SafeFloatTyped(data, "realizedPnl"),
		Collateral:                  SafeFloatTyped(data, "collateral"),
		EntryPrice:                  SafeFloatTyped(data, "entryPrice"),
		MarkPrice:                   SafeFloatTyped(data, "markPrice"),
		LiquidationPrice:            SafeFloatTyped(data, "liquidationPrice"),
		MarginMode:                  SafeStringTyped(data, "marginMode"),
		Hedged:                      SafeBoolTyped(data, "hedged"),
		MaintenanceMargin:           SafeFloatTyped(data, "maintenenceMargin"),
		MaintenanceMarginPercentage: SafeFloatTyped(data, "maintenanceMarginPercentage"),
		InitialMargin:               SafeFloatTyped(data, "initialMargin"),
		InitialMarginPercentage:     SafeFloatTyped(data, "initialMarginPercentage"),
		MarginRatio:                 SafeFloatTyped(data, "marginRatio"),
		LastUpdateTimestamp:         SafeFloatTyped(data, "lastUpdateTimestamp"),
		LastPrice:                   SafeFloatTyped(data, "lastPrice"),
		Percentage:                  SafeFloatTyped(data, "percentage"),
		TakeProfitPrice:             SafeFloatTyped(data, "takeProfitPrice"),
		StopLossPrice:               SafeFloatTyped(data, "stopLossPrice"),
	}
}

type FundingHistory struct {
	Info      map[string]any
	Id        *string
	Timestamp *int64
	Code      *string
	Symbol    *string
	Datetime  *string
	Currency  *string
	Amount    *float64
}

func NewFundingHistory(data any) FundingHistory {
	return FundingHistory{
		Info:      GetInfo(data),
		Id:        SafeStringTyped(data, "id"),
		Timestamp: SafeInt64Typed(data, "timestamp"),
		Datetime:  SafeStringTyped(data, "datetime"),
		Currency:  SafeStringTyped(data, "currency"),
		Amount:    SafeFloatTyped(data, "amount"),
		Code:      SafeStringTyped(data, "code"),
		Symbol:    SafeStringTyped(data, "symbol"),
	}
}

type LedgerEntry struct {
	Id               *string
	Info             map[string]any
	Timestamp        *int64
	Datetime         *string
	Direction        *string
	Account          *string
	ReferenceId      *string
	ReferenceAccount *string
	Type             *string
	Currency         *string
	Amount           *float64
	Before           *float64
	After            *float64
	Status           *string
	Fee              Fee
}

func NewLedgerEntry(data any) LedgerEntry {
	return LedgerEntry{
		Id:               SafeStringTyped(data, "id"),
		Info:             GetInfo(data),
		Timestamp:        SafeInt64Typed(data, "timestamp"),
		Datetime:         SafeStringTyped(data, "datetime"),
		Direction:        SafeStringTyped(data, "direction"),
		Account:          SafeStringTyped(data, "account"),
		ReferenceId:      SafeStringTyped(data, "referenceId"),
		ReferenceAccount: SafeStringTyped(data, "referenceAccount"),
		Type:             SafeStringTyped(data, "type"),
		Currency:         SafeStringTyped(data, "currency"),
		Amount:           SafeFloatTyped(data, "amount"),
		Before:           SafeFloatTyped(data, "before"),
		After:            SafeFloatTyped(data, "after"),
		Status:           SafeStringTyped(data, "status"),
		Fee:              NewFee(SafeValue(data, "fee", map[string]any{}).(map[string]any)),
	}
}

type Greeks struct {
	Info                  map[string]any
	Symbol                *string
	Timestamp             *int64
	Datetime              *string
	Delta                 *float64
	Gamma                 *float64
	Theta                 *float64
	Vega                  *float64
	Rho                   *float64
	Vanna                 *float64
	Volga                 *float64
	Charm                 *float64
	BidSize               *float64
	AskSize               *float64
	BidImpliedVolatility  *float64
	AskImpliedVolatility  *float64
	MarkImpliedVolatility *float64
	BidPrice              *float64
	AskPrice              *float64
	MarkPrice             *float64
	LastPrice             *float64
	UnderlyingPrice       *float64
}

func NewGreeks(data any) Greeks {
	return Greeks{
		Info:                  GetInfo(data),
		Timestamp:             SafeInt64Typed(data, "timestamp"),
		Symbol:                SafeStringTyped(data, "symbol"),
		Datetime:              SafeStringTyped(data, "datetime"),
		Delta:                 SafeFloatTyped(data, "delta"),
		Gamma:                 SafeFloatTyped(data, "gamma"),
		Theta:                 SafeFloatTyped(data, "theta"),
		Vega:                  SafeFloatTyped(data, "vega"),
		Rho:                   SafeFloatTyped(data, "rho"),
		Vanna:                 SafeFloatTyped(data, "vanna"),
		Volga:                 SafeFloatTyped(data, "volga"),
		Charm:                 SafeFloatTyped(data, "charm"),
		BidSize:               SafeFloatTyped(data, "bidSize"),
		AskSize:               SafeFloatTyped(data, "askSize"),
		BidImpliedVolatility:  SafeFloatTyped(data, "bidImpliedVolatility"),
		AskImpliedVolatility:  SafeFloatTyped(data, "askImpliedVolatility"),
		MarkImpliedVolatility: SafeFloatTyped(data, "markImpliedVolatility"),
		BidPrice:              SafeFloatTyped(data, "bidPrice"),
		AskPrice:              SafeFloatTyped(data, "askPrice"),
		MarkPrice:             SafeFloatTyped(data, "markPrice"),
		LastPrice:             SafeFloatTyped(data, "lastPrice"),
		UnderlyingPrice:       SafeFloatTyped(data, "underlyingPrice"),
	}
}

type MarginModification struct {
	Symbol     *string
	Type       *string
	MarginMode *string
	Amount     *float64
	Total      *float64
	Code       *string
	Status     *string
	Timestamp  *int64
	Datetime   *string
	Info       map[string]any
}

func NewMarginModification(data any) MarginModification {
	return MarginModification{
		Symbol:     SafeStringTyped(data, "symbol"),
		Type:       SafeStringTyped(data, "type"),
		MarginMode: SafeStringTyped(data, "marginMode"),
		Amount:     SafeFloatTyped(data, "amount"),
		Total:      SafeFloatTyped(data, "total"),
		Code:       SafeStringTyped(data, "code"),
		Status:     SafeStringTyped(data, "status"),
		Timestamp:  SafeInt64Typed(data, "timestamp"),
		Datetime:   SafeStringTyped(data, "datetime"),
		Info:       GetInfo(data),
	}
}

type Currencies struct {
	Info       map[string]any
	Currencies map[string]Currency
}

func NewCurrencies(data2 any) Currencies {
	if data2 == nil {
		data2 = make(map[string]any)
	}
	data := data2.(map[string]any)
	info := GetInfo(data)
	currencies := make(map[string]Currency)
	for key, value := range data {
		if key != "info" {
			currencies[key] = NewCurrency(value.(map[string]any))
		}
	}
	return Currencies{Info: info, Currencies: currencies}
}

func (c *Currencies) Get(key string) (Currency, error) {
	cur, exists := c.Currencies[key]
	if !exists {
		return Currency{}, fmt.Errorf("the key '%s' was not found in the currencies", key)
	}
	return cur, nil
}

func (c *Currencies) Set(key string, cur Currency) {
	c.Currencies[key] = cur
}

type DepositAddress struct {
	Info     map[string]any
	Currency *string
	Network  *string
	Address  *string
	Tag      *string
}

func NewDepositAddress(data any) DepositAddress {
	return DepositAddress{
		Info:     GetInfo(data),
		Currency: SafeStringTyped(data, "currency"),
		Network:  SafeStringTyped(data, "network"),
		Address:  SafeStringTyped(data, "address"),
		Tag:      SafeStringTyped(data, "tag"),
	}
}

type TradingFees struct {
	Info        map[string]any
	TradingFees map[string]TradingFeeInterface
}

func NewTradingFees(data2 any) TradingFees {
	data := data2.(map[string]any)
	info := GetInfo(data)
	tradingFees := make(map[string]TradingFeeInterface)
	for key, value := range data {
		if key != "info" {
			tradingFees[key] = NewTradingFeeInterface(value.(map[string]any))
		}
	}
	return TradingFees{Info: info, TradingFees: tradingFees}
}

func (t *TradingFees) Get(key string) (TradingFeeInterface, error) {
	fee, exists := t.TradingFees[key]
	if !exists {
		return TradingFeeInterface{}, fmt.Errorf("the key '%s' was not found in the tradingFees", key)
	}
	return fee, nil
}

func (t *TradingFees) Set(key string, fee TradingFeeInterface) {
	t.TradingFees[key] = fee
}

type FundingRateHistory struct {
	Symbol      *string
	Timestamp   *int64
	Datetime    *string
	FundingRate *float64
}

func NewFundingRateHistory(data any) FundingRateHistory {
	return FundingRateHistory{
		Symbol:      SafeStringTyped(data, "symbol"),
		Datetime:    SafeStringTyped(data, "datetime"),
		Timestamp:   SafeInt64Typed(data, "timestamp"),
		FundingRate: SafeFloatTyped(data, "fundingRate"),
	}
}

type Conversion struct {
	Info         map[string]any
	Timestamp    *int64
	Datetime     *string
	Id           *string
	FromCurrency *string
	FromAmount   *float64
	ToCurrency   *string
	ToAmount     *float64
	Price        *float64
	Fee          *float64
}

func NewConversion(data any) Conversion {
	return Conversion{
		Info:         GetInfo(data),
		Timestamp:    SafeInt64Typed(data, "timestamp"),
		Datetime:     SafeStringTyped(data, "datetime"),
		Id:           SafeStringTyped(data, "id"),
		FromCurrency: SafeStringTyped(data, "fromCurrency"),
		FromAmount:   SafeFloatTyped(data, "fromAmount"),
		ToCurrency:   SafeStringTyped(data, "toCurrency"),
		ToAmount:     SafeFloatTyped(data, "toAmount"),
		Price:        SafeFloatTyped(data, "price"),
		Fee:          SafeFloatTyped(data, "fee"),
	}
}

type LeverageTiers struct {
	Info  any
	Tiers map[string][]LeverageTier
}

func NewLeverageTiers(data2 any) LeverageTiers {
	data := data2.(map[string]any)
	info := data["info"]
	tiers := make(map[string][]LeverageTier)
	for key, value := range data {
		if key != "info" {
			if leverageList, ok := value.([]any); ok {
				leverageTiers := make([]LeverageTier, len(leverageList))
				for i, tierData := range leverageList {
					leverageTiers[i] = NewLeverageTier(tierData.(map[string]any))
				}
				tiers[key] = leverageTiers
			}
		}
	}
	return LeverageTiers{Info: info, Tiers: tiers}
}

func (lt *LeverageTiers) Get(key string) ([]LeverageTier, error) {
	tiers, exists := lt.Tiers[key]
	if !exists {
		return nil, fmt.Errorf("the key '%s' was not found in the tiers", key)
	}
	return tiers, nil
}

func (lt *LeverageTiers) Set(key string, tiers []LeverageTier) {
	lt.Tiers[key] = tiers
}

type LeverageTier struct {
	Tier                  *int64
	Symbol                *string
	Currency              *string
	MinNotional           *float64
	MaxNotional           *float64
	MaintenanceMarginRate *float64
	MaxLeverage           *float64
	Info                  map[string]any
}

func NewLeverageTier(data any) LeverageTier {
	return LeverageTier{
		Tier:                  SafeInt64Typed(data, "tier"),
		Symbol:                SafeStringTyped(data, "symbol"),
		Currency:              SafeStringTyped(data, "currency"),
		MinNotional:           SafeFloatTyped(data, "minNotional"),
		MaxNotional:           SafeFloatTyped(data, "maxNotional"),
		MaintenanceMarginRate: SafeFloatTyped(data, "maintenanceMarginRate"),
		MaxLeverage:           SafeFloatTyped(data, "maxLeverage"),
		Info:                  GetInfo(data),
	}
}

// array helpers

func NewTradeArray(trades2 any) []Trade {
	var trades []any
	if tr, ok := trades2.(*ArrayCache); ok {
		trades = tr.ToArray()
	} else {
		trades = trades2.([]any)
	}
	result := make([]Trade, 0, len(trades))
	for _, t := range trades {
		if tradeMap, ok := t.(map[string]any); ok {
			trade := NewTrade(tradeMap)
			result = append(result, trade)
		}
	}
	return result
}

func NewOrderArray(orders2 any) []Order {
	var orders []any
	if tr, ok := orders2.(*ArrayCache); ok {
		orders = tr.ToArray()
	} else {
		orders = orders2.([]any)

	}
	result := make([]Order, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewOrder(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewGreeksArray(orders2 any) []Greeks {
	orders := orders2.([]any)
	result := make([]Greeks, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewGreeks(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewOHLCVArray(orders2 any) []OHLCV {
	// orders := orders2.([]any)
	var orders []any
	if tr, ok := orders2.(*ArrayCache); ok {
		orders = tr.ToArray()
	} else if tr2, ok := orders2.(*ArrayCacheByTimestamp); ok {
		orders = tr2.ToArray()
	} else {
		orders = orders2.([]any)
	}
	result := make([]OHLCV, 0, len(orders))
	for _, t := range orders {
		if ohlcvlist, ok := t.([]any); ok {
			order := NewOHLCV(ohlcvlist)
			result = append(result, order)
		}
	}
	return result
}

func NewTransactionArray(orders2 any) []Transaction {
	orders := orders2.([]any)
	result := make([]Transaction, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewTransaction(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewMarketInterfaceArray(orders2 any) []MarketInterface {
	orders := orders2.([]any)
	result := make([]MarketInterface, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewMarketInterface(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewFundingRateHistoryArray(orders2 any) []FundingRateHistory {
	orders := orders2.([]any)
	result := make([]FundingRateHistory, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewFundingRateHistory(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewFundingHistoryArray(orders2 any) []FundingHistory {
	orders := orders2.([]any)
	result := make([]FundingHistory, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewFundingHistory(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewTransferEntryArray(orders2 any) []TransferEntry {
	orders := orders2.([]any)
	result := make([]TransferEntry, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewTransferEntry(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewPositionArray(orders2 any) []Position {
	// orders := orders2.([]any)
	var orders []any
	if tr, ok := orders2.(*ArrayCache); ok {
		orders = tr.ToArray()
	} else if tr2, ok := orders2.(*ArrayCacheBySymbolBySide); ok {
		orders = tr2.ToArray()
	} else {
		orders = orders2.([]any)
	}
	result := make([]Position, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewPosition(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewLedgerEntryArray(orders2 any) []LedgerEntry {
	orders := orders2.([]any)
	result := make([]LedgerEntry, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewLedgerEntry(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewBorrowInterestArray(orders2 any) []BorrowInterest {
	orders := orders2.([]any)
	result := make([]BorrowInterest, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewBorrowInterest(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewOpenInterestArray(orders2 any) []OpenInterest {
	orders := orders2.([]any)
	result := make([]OpenInterest, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewOpenInterest(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewLiquidationArray(orders2 any) []Liquidation {
	orders := orders2.([]any)
	result := make([]Liquidation, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewLiquidation(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewMarginModificationArray(orders2 any) []MarginModification {
	orders := orders2.([]any)
	result := make([]MarginModification, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewMarginModification(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewConversionArray(orders2 any) []Conversion {
	orders := orders2.([]any)
	result := make([]Conversion, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewConversion(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewLongShortRatioArray(orders2 any) []LongShortRatio {
	orders := orders2.([]any)
	result := make([]LongShortRatio, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewLongShortRatio(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewDepositAddressArray(orders2 any) []DepositAddress {
	orders := orders2.([]any)
	result := make([]DepositAddress, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewDepositAddress(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewLeverageTierArray(orders2 any) []LeverageTier {
	orders := orders2.([]any)
	result := make([]LeverageTier, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewLeverageTier(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

func NewAccountArray(orders2 any) []Account {
	orders := orders2.([]any)
	result := make([]Account, 0, len(orders))
	for _, t := range orders {
		if tradeMap, ok := t.(map[string]any); ok {
			order := NewAccount(tradeMap)
			result = append(result, order)
		}
	}
	return result
}

// ADL Type

type ADL struct {
	Info       map[string]any
	Symbol     *string
	Rank       *int64
	Rating     *string
	Percentage *float64
	Timestamp  *int64
	Datetime   *string
}

func NewADL(adlObj2 any) ADL {
	adlObj := adlObj2.(map[string]any)
	return ADL{
		Info:       GetInfo(adlObj),
		Symbol:     SafeStringTyped(adlObj, "symbol"),
		Rank:       SafeInt64Typed(adlObj, "rank"),
		Rating:     SafeStringTyped(adlObj, "rating"),
		Percentage: SafeFloatTyped(adlObj, "percentage"),
		Timestamp:  SafeInt64Typed(adlObj, "timestamp"),
		Datetime:   SafeStringTyped(adlObj, "datetime"),
	}
}

func NewADLArray(data2 any) []ADL {
	data := data2.([]any)
	result := make([]ADL, 0, len(data))

	for _, item := range data {
		obj, ok := item.(map[string]any)
		if !ok {
			continue
		}
		result = append(result, NewADL(obj))
	}

	return result
}

// OrderBooks struct
type OrderBooks struct {
	Info       map[string]any
	OrderBooks map[string]OrderBook
}

// Constructor for OrderBooks
func NewOrderBooks(tickers any) OrderBooks {
	tickersMap := tickers.(map[string]any)

	info := GetInfo(tickersMap)
	orderBooks := make(map[string]OrderBook)

	for key, value := range tickersMap {
		if key != "info" {
			orderBooks[key] = NewOrderBook(value)
		}
	}

	return OrderBooks{
		Info:       info,
		OrderBooks: orderBooks,
	}
}

// Indexer-like access for OrderBooks
func (o *OrderBooks) Get(key string) (OrderBook, error) {
	if val, exists := o.OrderBooks[key]; exists {
		return val, nil
	}
	return OrderBook{}, fmt.Errorf("the key '%s' was not found in the OrderBooks", key)
}

func (o *OrderBooks) Set(key string, value OrderBook) {
	o.OrderBooks[key] = value
}

type CancellationRequest struct {
	Symbol *string
	Id     *string
}

func NewCancellationRequest(request map[string]any) CancellationRequest {
	return CancellationRequest{
		Id:     SafeStringTyped(request, "id"),
		Symbol: SafeStringTyped(request, "symbol"),
	}
}

// DepositWithdrawFeeNetwork

type DepositWithdrawFeeNetwork struct {
	fee        *float64
	percentage *float64
}

func NewDepositWithdrawFeeNetwork(data any) DepositWithdrawFeeNetwork {
	return DepositWithdrawFeeNetwork{
		fee:        SafeFloatTyped(data, "fee"),
		percentage: SafeFloatTyped(data, "percentage"),
	}
}
