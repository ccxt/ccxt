package ccxt

import (
	"fmt"
	"math"
	"strings"
)

// type CustomOrderBookProp interface {
// 	cache []any
// }

type OrderBookInterface interface {
	Limit() any
	Update(snapshot any) any
	Reset(optionalArgs ...any) any
	GetCache() *any
	SetCache(cache any)
	GetNonce() any
	GetValue(key string, defaultValue any) any
	ToMap() map[string]any
	Copy() OrderBookInterface
}

type WsOrderBook struct {
	Cache     any            `json:"-"`
	Asks      IOrderBookSide `json:"asks"`
	Bids      IOrderBookSide `json:"bids"`
	Timestamp *int64         `json:"timestamp"`
	Datetime  any            `json:"datetime"`
	Nonce     any            `json:"nonce"`
	Symbol    string         `json:"symbol"`
	// prediction-market identity (nil for crypto exchanges — omitted from the
	// json form then, matching the js/python/php/c#/java serializations)
	Outcome   any `json:"outcome,omitempty"`
	OutcomeId any `json:"outcomeId,omitempty"`
	Market    any `json:"market,omitempty"`
}

func strOrNil(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func int64OrNil(v *int64) any {
	if v == nil {
		return nil
	}
	return *v
}

func createOb(Obtype string) OrderBookInterface {
	switch strings.ToLower(Obtype) {
	case "counted":
		return &CountedOrderBook{}
	case "indexed":
		return &IndexedOrderBook{}
	// case "incremental":
	// 	return &IncrementalOrderBook{}
	// case "incrementalindexed":
	// 	return &IncrementalIndexedOrderBook{}
	default:
		return &WsOrderBook{}
	}
}

func (this *WsOrderBook) ToMap() map[string]any {
	result := map[string]any{
		"asks":      this.Asks.GetDataCopy(),
		"bids":      this.Bids.GetDataCopy(),
		"timestamp": int64OrNil(this.Timestamp),
		"datetime":  this.Datetime,
		"nonce":     this.Nonce,
		"symbol":    strOrNil(this.Symbol),
	}
	// prediction-market identity — only present on prediction books
	if this.Outcome != nil {
		result["outcome"] = this.Outcome
		result["outcomeId"] = this.OutcomeId
		result["market"] = this.Market
	}
	return result
}

func (this *WsOrderBook) GetValue(key string, defaultValue any) any {
	switch key {
	case "nonce":
		return this.Nonce
	case "cache":
		return this.Cache
	case "asks":
		return this.Asks
	case "bids":
		return this.Bids
	case "timestamp":
		return int64OrNil(this.Timestamp)
	case "datetime":
		return this.Datetime
	case "symbol":
		return this.Symbol
	case "outcome":
		return this.Outcome
	case "outcomeId":
		return this.OutcomeId
	case "market":
		return this.Market
	default:
		return defaultValue
	}
}

func NewWsOrderBook(snapshot any, depth any) *WsOrderBook {
	if depth == nil {
		depth = math.MaxInt32
	}
	if snapshot == nil {
		snapshot = make(map[string]any)
	}
	// Sanitize snapshot to ensure asks and bids are always [][]float64
	asks, bids := getAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]any)
	var timestamp *int64
	var datetime any
	if ts, ok := SafeInt64(snapshotMap, "timestamp", nil).(int64); ok {
		timestamp = &ts
		datetime = Iso8601(ts)
	}

	return &WsOrderBook{
		Cache:     SafeValue(snapshotMap, "cache", []any{}),
		Asks:      NewAsks(asks, depth),
		Bids:      NewBids(bids, depth),
		Timestamp: timestamp,
		Datetime:  datetime,
		Nonce:     SafeInteger(snapshotMap, "nonce", nil),
		Symbol:    SafeString(snapshotMap, "symbol", "").(string),
	}
}

func (this *WsOrderBook) Limit() any {
	// Ensure child sides are depth-limited in-place and return the same pointer
	this.Asks.Limit()
	this.Bids.Limit()
	return this
}

func (this *WsOrderBook) Update(snapshot any) any {
	// mirrors the JS base OrderBook.update: bail out only when the incoming
	// snapshot is not newer than the current one, otherwise delegate everything
	// (nonce, timestamp, datetime, symbol) to reset(snapshot) below
	snapshotMap, ok := snapshot.(map[string]any)
	if !ok {
		return this
	}
	// ws messages are parsed with encoding/json, so numeric fields arrive as
	// float64 / json.Number / string depending on the transport — normalize both
	// sides through ParseInt, ignoring the MinInt64 "not a number" sentinel so a
	// non-numeric value never masquerades as an older nonce
	snapshotNonce := SafeValue(snapshotMap, "nonce", nil)
	if snapshotNonce != nil && this.Nonce != nil {
		newNonce := ParseInt(snapshotNonce)
		currentNonce := ParseInt(this.Nonce)
		if newNonce != math.MinInt64 && currentNonce != math.MinInt64 && newNonce <= currentNonce {
			return this
		}
	}

	return this.Reset(snapshot)
}

func (this *WsOrderBook) Reset(optionalArgs ...any) any {
	snapshot := GetArg(optionalArgs, 0, nil)

	if snapshot == nil {
		snapshot = make(map[string]any)
	}
	asks, bids := getAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]any)

	for i := range *this.Asks.GetIndex() {
		(*this.Asks.GetIndex())[i] = math.MaxFloat64
	}
	this.Asks.SetData([][]any{})
	this.Asks.SetLen(0)
	for _, ask := range asks {
		this.Asks.StoreArray(ask)
	}

	for i := range *this.Bids.GetIndex() {
		(*this.Bids.GetIndex())[i] = math.MaxFloat64
	}
	this.Bids.SetData([][]any{})
	this.Bids.SetLen(0)
	for _, bid := range bids {
		this.Bids.StoreArray(bid)
	}
	this.Nonce = SafeInteger(snapshotMap, "nonce", nil)
	if ts, ok := SafeInt64(snapshotMap, "timestamp", nil).(int64); ok {
		this.Timestamp = &ts
		this.Datetime = Iso8601(ts)
	} else {
		// the JS base reassigns timestamp/datetime from the snapshot unconditionally,
		// so a snapshot without a timestamp must clear any stale pointer value here
		this.Timestamp = nil
		this.Datetime = nil
	}
	this.Symbol = SafeString(snapshotMap, "symbol", "").(string)
	this.Outcome = SafeString(snapshotMap, "outcome", nil)
	this.OutcomeId = SafeString(snapshotMap, "outcomeId", nil)
	this.Market = SafeString(snapshotMap, "market", nil)

	return this
}

// Might need if IndexedOrder and CountedOrderBook access the cache
func (this *WsOrderBook) GetCache() *any {
	return &this.Cache
}

func (this *WsOrderBook) SetCache(cache any) {
	this.Cache = cache
}

// String returns a formatted string representation of the WsOrderBook struct
func (this *WsOrderBook) String() string {
	var result strings.Builder
	result.WriteString("WsOrderBook{")

	if this.Symbol != "" {
		result.WriteString(fmt.Sprintf(" Symbol:%s", this.Symbol))
	}

	if this.Timestamp != nil {
		result.WriteString(fmt.Sprintf(" Timestamp:%d", *this.Timestamp))
	}

	if this.Datetime != nil {
		result.WriteString(fmt.Sprintf(" Datetime:%v", this.Datetime))
	}

	if this.Nonce != nil {
		result.WriteString(fmt.Sprintf(" Nonce:%d", this.Nonce))
	}

	result.WriteString(fmt.Sprintf(" Cache:%v", this.Cache))

	// Format Asks and Bids properly
	if this.Asks != nil {
		result.WriteString(fmt.Sprintf(" Asks:%s", this.Asks.String()))
	} else {
		result.WriteString(" Asks:nil")
	}

	if this.Bids != nil {
		result.WriteString(fmt.Sprintf(" Bids:%s", this.Bids.String()))
	} else {
		result.WriteString(" Bids:nil")
	}

	result.WriteString("}")
	return result.String()
}

func normalizeToFloat64SliceSlice(value any) [][]float64 {
	raw, ok := value.([]any)
	if !ok {
		return [][]float64{}
	}
	result := make([][]float64, 0, len(raw))
	for _, row := range raw {
		rowArr, ok := row.([]any)
		if !ok {
			continue
		}
		floatRow := make([]float64, 0, len(rowArr))
		for _, num := range rowArr {
			if f, ok := num.(float64); ok {
				floatRow = append(floatRow, f)
			} else if i, ok := num.(int); ok {
				floatRow = append(floatRow, float64(i))
			} else if i64, ok := num.(int64); ok {
				floatRow = append(floatRow, float64(i64))
			} else if f32, ok := num.(float32); ok {
				floatRow = append(floatRow, float64(f32))
			}
		}
		result = append(result, floatRow)
	}
	return result
}

func getAsksBids(snapshot any) ([][]float64, [][]float64) {
	asks := normalizeToFloat64SliceSlice(SafeValue(snapshot, "asks", nil))
	bids := normalizeToFloat64SliceSlice(SafeValue(snapshot, "bids", nil))
	return asks, bids
}

func getIndexedAsksBids(snapshot any) ([][]any, [][]any) {
	asks := SafeValue(snapshot, "asks", nil)
	bids := SafeValue(snapshot, "bids", nil)
	// normalize the price and size and keep the id as is (3rd value in a bidask delta)
	// so that it can be used as a key in IndexedOrderBookSide
	if asks == nil || bids == nil {
		return [][]any{}, [][]any{}
	}
	// Normalize the price and size
	newAsks := make([][]any, len(asks.([]any)))
	newBids := make([][]any, len(bids.([]any)))
	for i := range asks.([]any) {
		newAsks[i] = []any{
			normalizeNumber(asks.([]any)[i].([]any)[0]),
			normalizeNumber(asks.([]any)[i].([]any)[1]),
			asks.([]any)[i].([]any)[2],
		}
	}
	for i := range bids.([]any) {
		newBids[i] = []any{
			normalizeNumber(bids.([]any)[i].([]any)[0]),
			normalizeNumber(bids.([]any)[i].([]any)[1]),
			bids.([]any)[i].([]any)[2],
		}
	}
	return newAsks, newBids
}

type CountedOrderBook struct {
	*WsOrderBook
}

func NewCountedOrderBook(snapshot any, depth any) *CountedOrderBook {
	if depth == nil {
		depth = math.MaxInt32
	}
	if snapshot == nil {
		snapshot = make(map[string]any)
	}
	// Sanitize snapshot to ensure asks and bids are always [][]float64
	asks, bids := getIndexedAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]any)
	var timestamp *int64
	var datetime any
	if ts, ok := SafeInt64(snapshotMap, "timestamp", nil).(int64); ok {
		timestamp = &ts
		datetime = Iso8601(ts)
	}

	return &CountedOrderBook{
		WsOrderBook: &WsOrderBook{
			Cache:     SafeValue(snapshotMap, "cache", []any{}),
			Asks:      NewCountedAsks(asks, depth),
			Bids:      NewCountedBids(bids, depth),
			Timestamp: timestamp,
			Datetime:  datetime,
			Nonce:     SafeInteger(snapshotMap, "nonce", nil),
			Symbol:    SafeString(snapshotMap, "symbol", "").(string),
		},
	}
}

func (this *CountedOrderBook) ToMap() map[string]any {
	return map[string]any{
		"asks":      this.Asks.GetDataCopy(),
		"bids":      this.Bids.GetDataCopy(),
		"timestamp": int64OrNil(this.Timestamp),
		"datetime":  this.Datetime,
		"nonce":     this.Nonce,
		"symbol":    strOrNil(this.Symbol),
	}
}

// indexed by order ids (3rd value in a bidask delta)
type IndexedOrderBook struct {
	*WsOrderBook
}

func NewIndexedOrderBook(snapshot any, depth any) *IndexedOrderBook {
	if depth == nil {
		depth = math.MaxInt32
	}
	if snapshot == nil {
		snapshot = make(map[string]any)
	}
	// Sanitize snapshot to ensure asks and bids are always [][]float64
	asks, bids := getIndexedAsksBids(snapshot)
	snapshotMap := snapshot.(map[string]any)
	var timestamp *int64
	var datetime any
	if ts, ok := SafeInt64(snapshotMap, "timestamp", nil).(int64); ok {
		timestamp = &ts
		datetime = Iso8601(ts)
	}

	return &IndexedOrderBook{
		WsOrderBook: &WsOrderBook{
			Cache:     SafeValue(snapshotMap, "cache", []any{}),
			Asks:      NewIndexedAsks(asks, depth),
			Bids:      NewIndexedBids(bids, depth),
			Timestamp: timestamp,
			Datetime:  datetime,
			Nonce:     SafeInteger(snapshotMap, "nonce", nil),
			Symbol:    SafeString(snapshotMap, "symbol", "").(string),
		},
	}
}

func (this *IndexedOrderBook) ToMap() map[string]any {
	return map[string]any{
		"asks":      this.Asks.GetDataCopy(),
		"bids":      this.Bids.GetDataCopy(),
		"timestamp": int64OrNil(this.Timestamp),
		"datetime":  this.Datetime,
		"nonce":     this.Nonce,
		"symbol":    strOrNil(this.Symbol),
	}
}

func (this *WsOrderBook) Copy() OrderBookInterface {
	snapshot := make(map[string]any)
	if this.Outcome != nil {
		snapshot["outcome"] = this.Outcome
		snapshot["outcomeId"] = this.OutcomeId
		snapshot["market"] = this.Market
	} else {
		snapshot["symbol"] = this.Symbol
	}

	// Determine the concrete order-book variant from the side types, because
	// this method's receiver is *WsOrderBook; a *WsOrderBook is never a
	// *CountedOrderBook or *IndexedOrderBook, so interface{}(this).(*X) can
	// never succeed.
	var copy OrderBookInterface
	switch this.Asks.(type) {
	case *CountedOrderBookSide:
		copy = NewCountedOrderBook(snapshot, this.Asks.GetValue("Depth", nil))
	case *IndexedOrderBookSide:
		copy = NewIndexedOrderBook(snapshot, this.Asks.GetValue("Depth", nil))
	default:
		copy = NewWsOrderBook(snapshot, this.Asks.GetValue("Depth", nil))
	}

	var ob *WsOrderBook
	switch typed := copy.(type) {
	case *CountedOrderBook:
		ob = typed.WsOrderBook
	case *IndexedOrderBook:
		ob = typed.WsOrderBook
	case *WsOrderBook:
		ob = typed
	}

	// CopySide acquires each side's read lock internally for the whole
	// duration of the copy, so no concurrent StoreArray/Limit write (which
	// takes the write lock) can race with the map/slice reads here.
	ob.Asks = this.Asks.CopySide()
	ob.Bids = this.Bids.CopySide()
	ob.Nonce = this.Nonce
	ob.Timestamp = this.Timestamp
	ob.Datetime = this.Datetime
	return copy
}

func (this *WsOrderBook) GetNonce() any {
	return this.Nonce
}
func (this *CountedOrderBook) Limit() any {
	return this.WsOrderBook.Limit()
}
func (this *CountedOrderBook) Update(snapshot any) any {
	return this.WsOrderBook.Update(snapshot)
}
func (this *CountedOrderBook) Reset(optionalArgs ...any) any {
	return this.WsOrderBook.Reset(optionalArgs...)
}
func (this *CountedOrderBook) GetCache() *any {
	return this.WsOrderBook.GetCache()
}
func (this *CountedOrderBook) SetCache(cache any) {
	this.WsOrderBook.SetCache(cache)
}
func (this *CountedOrderBook) GetValue(key string, defaultValue any) any {
	return this.WsOrderBook.GetValue(key, defaultValue)
}
func (this *IndexedOrderBook) Limit() any {
	return this.WsOrderBook.Limit()
}
func (this *IndexedOrderBook) Update(snapshot any) any {
	return this.WsOrderBook.Update(snapshot)
}
func (this *IndexedOrderBook) Reset(optionalArgs ...any) any {
	return this.WsOrderBook.Reset(optionalArgs...)
}
func (this *IndexedOrderBook) GetCache() *any {
	return this.WsOrderBook.GetCache()
}
func (this *IndexedOrderBook) SetCache(cache any) {
	this.WsOrderBook.SetCache(cache)
}
func (this *IndexedOrderBook) GetValue(key string, defaultValue any) any {
	return this.WsOrderBook.GetValue(key, defaultValue)
}
