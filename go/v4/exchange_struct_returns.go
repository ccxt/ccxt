package ccxt

import "reflect"

// Runtime side of the struct-typed row builders (build/go-struct-returns.ts): the generated
// ParseTicker/SafeTicker/... return a struct, every untyped caller boxes it back with <T>ToMap.
// The structs carry exactly the keys declared in ts/src/base/types.ts; Info is the raw response.

// RowDict is the box coercion every <T>FromMap builder takes over from its call sites: a
// dictionary (even a nil one) passes through, anything else is not a dictionary. It answers
// what the site's coercion switch answered before.
func RowDict(data any) (map[string]any, bool) {
	if m, ok := data.(map[string]any); ok {
		return m, true
	}
	return nil, false
}

// TickerFromMap builds a Ticker from a unified ticker map.
func TickerFromMap(data any) Ticker {
	m, ok := RowDict(data)
	if !ok {
		return Ticker{}
	}
	return NewTicker(m)
}

// TickerToMap is the map shape every untyped caller expects.
func TickerToMap(t Ticker) map[string]any {
	return StructToMap(t)
}

// TradeFromMap builds a Trade from a unified trade map (a non-dict `fee` reads as absent).
func TradeFromMap(data any) Trade {
	m, ok := RowDict(data)
	if !ok {
		return Trade{}
	}
	return NewTrade(withDictFee(m))
}

// TradeToMap is the map shape every untyped caller expects.
func TradeToMap(t Trade) map[string]any {
	return StructToMap(t)
}

// OrderFromMap builds an Order from a unified order map. NewOrder asserts `fee` is a dict and
// `trades` a list of maps, so a non-dict fee reads as absent and trades are built here.
func OrderFromMap(data any) Order {
	m, ok := RowDict(data)
	if !ok {
		return Order{}
	}
	view := copyMap(withDictFee(m))
	delete(view, "trades")
	o := NewOrder(view)
	if list, isList := m["trades"].([]any); isList {
		o.Trades = make([]Trade, 0, len(list))
		for _, t := range list {
			if _, isDict := t.(map[string]any); isDict {
				o.Trades = append(o.Trades, TradeFromMap(t))
			}
		}
	}
	return o
}

// OrderToMap is the map shape every untyped caller expects.
func OrderToMap(o Order) map[string]any {
	return StructToMap(o)
}

// PositionFromMap builds a Position from a unified position map.
func PositionFromMap(data any) Position {
	m, ok := RowDict(data)
	if !ok {
		return Position{}
	}
	return NewPosition(m)
}

// PositionToMap is the map shape every untyped caller expects. The Go port holds the Int
// timestamps as *float64 (build/typeEmitters/go.ts TYPE_OVERRIDES), so they are handed back
// as the int64 the parsers produced.
func PositionToMap(p Position) map[string]any {
	m := StructToMap(p)
	for _, k := range []string{"timestamp", "lastUpdateTimestamp"} {
		if f, isFloat := m[k].(float64); isFloat && f == float64(int64(f)) {
			m[k] = int64(f)
		}
	}
	return m
}

// TransactionFromMap builds a Transaction from a unified transaction map (a non-dict `fee` reads as absent).
func TransactionFromMap(data any) Transaction {
	m, ok := RowDict(data)
	if !ok {
		return Transaction{}
	}
	return NewTransaction(m)
}

// TransactionToMap is the map shape every untyped caller expects (TxId is keyed `txid`).
func TransactionToMap(t Transaction) map[string]any {
	m := StructToMap(t)
	m["txid"] = m["txId"]
	delete(m, "txId")
	return m
}

// LedgerEntryFromMap builds a LedgerEntry from a unified ledger entry map.
func LedgerEntryFromMap(data any) LedgerEntry {
	m, ok := RowDict(data)
	if !ok {
		return LedgerEntry{}
	}
	return NewLedgerEntry(withDictFee(m))
}

// LedgerEntryToMap is the map shape every untyped caller expects.
func LedgerEntryToMap(l LedgerEntry) map[string]any {
	return StructToMap(l)
}

// DepositAddressFromMap builds a DepositAddress from a unified deposit-address map.
func DepositAddressFromMap(data any) DepositAddress {
	m, ok := RowDict(data)
	if !ok {
		return DepositAddress{}
	}
	return NewDepositAddress(m)
}

// DepositAddressToMap is the map shape every untyped caller expects.
func DepositAddressToMap(d DepositAddress) map[string]any {
	return StructToMap(d)
}

// TransferEntryFromMap builds a TransferEntry from a unified transfer map.
func TransferEntryFromMap(data any) TransferEntry {
	m, ok := RowDict(data)
	if !ok {
		return TransferEntry{}
	}
	return NewTransferEntry(m)
}

// TransferEntryToMap is the map shape every untyped caller expects.
func TransferEntryToMap(t TransferEntry) map[string]any {
	return StructToMap(t)
}

// FundingRateFromMap builds a FundingRate from a unified funding-rate map.
func FundingRateFromMap(data any) FundingRate {
	m, ok := RowDict(data)
	if !ok {
		return FundingRate{}
	}
	return NewFundingRate(m)
}

// FundingRateToMap is the map shape every untyped caller expects.
func FundingRateToMap(f FundingRate) map[string]any {
	return StructToMap(f)
}

// OpenInterestFromMap builds an OpenInterest from a unified open-interest map.
func OpenInterestFromMap(data any) OpenInterest {
	m, ok := RowDict(data)
	if !ok {
		return OpenInterest{}
	}
	return NewOpenInterest(m)
}

// OpenInterestToMap is the map shape every untyped caller expects.
func OpenInterestToMap(o OpenInterest) map[string]any {
	return StructToMap(o)
}

// TradingFeeInterfaceFromMap builds a TradingFeeInterface from a unified trading-fee map; Info is
// the raw response only (NewTradingFeeInterface keeps the whole map there).
func TradingFeeInterfaceFromMap(data any) TradingFeeInterface {
	m, ok := RowDict(data)
	if !ok {
		return TradingFeeInterface{}
	}
	f := NewTradingFeeInterface(m)
	f.Info = GetInfo(m)
	return f
}

// TradingFeeInterfaceToMap is the map shape every untyped caller expects.
func TradingFeeInterfaceToMap(f TradingFeeInterface) map[string]any {
	return StructToMap(f)
}

// LeverageFromMap builds a Leverage from a unified leverage map.
func LeverageFromMap(data any) Leverage {
	m, ok := RowDict(data)
	if !ok {
		return Leverage{}
	}
	return NewLeverage(m)
}

// LeverageToMap is the map shape every untyped caller expects.
func LeverageToMap(l Leverage) map[string]any {
	return StructToMap(l)
}

// MarginModeFromMap builds a MarginMode from a unified marginMode map.
func MarginModeFromMap(data any) MarginMode {
	m, ok := RowDict(data)
	if !ok {
		return MarginMode{}
	}
	return NewMarginMode(m)
}

// MarginModeToMap is the map shape every untyped caller expects.
func MarginModeToMap(m MarginMode) map[string]any {
	return StructToMap(m)
}

// GreeksFromMap builds a Greeks from a unified greeks map.
func GreeksFromMap(data any) Greeks {
	m, ok := RowDict(data)
	if !ok {
		return Greeks{}
	}
	return NewGreeks(m)
}

// GreeksToMap is the map shape every untyped caller expects.
func GreeksToMap(g Greeks) map[string]any {
	return StructToMap(g)
}

// OptionFromMap builds a Option from a unified option map.
func OptionFromMap(data any) Option {
	m, ok := RowDict(data)
	if !ok {
		return Option{}
	}
	return NewOption(m)
}

// OptionToMap is the map shape every untyped caller expects.
func OptionToMap(o Option) map[string]any {
	return StructToMap(o)
}

// ConversionFromMap builds a Conversion from a unified conversion map.
func ConversionFromMap(data any) Conversion {
	m, ok := RowDict(data)
	if !ok {
		return Conversion{}
	}
	return NewConversion(m)
}

// ConversionToMap is the map shape every untyped caller expects.
func ConversionToMap(c Conversion) map[string]any {
	return StructToMap(c)
}

// Map-of-struct channels (W29, build/go-chan3.ts goChan3StructPass with a `map[string]T` table value):
// a string-keyed dict of unified rows (fetchTickers, fetchFundingRates, ...) carried as map[string]T.
// Only dict-valued entries are rows (a top-level `info` or other scalar is not), as in NewTickers.

// StructDictFromMap builds the typed dict of a unified dict of rows.
func StructDictFromMap[T any](data any, from func(any) T) map[string]T {
	m, ok := RowDict(data)
	if !ok {
		return nil
	}
	out := make(map[string]T, len(m))
	for k, v := range m {
		if _, isDict := v.(map[string]any); isDict && k != "info" {
			out[k] = from(v)
		}
	}
	return out
}

// StructDictToMap is the map shape every untyped caller expects (nil for a nil dict).
func StructDictToMap[T any](d map[string]T, to func(T) map[string]any) map[string]any {
	if d == nil {
		return nil
	}
	out := make(map[string]any, len(d))
	for k, v := range d {
		out[k] = to(v)
	}
	return out
}

func TickerMapFromMap(data any) map[string]Ticker       { return StructDictFromMap(data, TickerFromMap) }
func TickerMapToMap(d map[string]Ticker) map[string]any { return StructDictToMap(d, TickerToMap) }
func FundingRateMapFromMap(data any) map[string]FundingRate {
	return StructDictFromMap(data, FundingRateFromMap)
}
func FundingRateMapToMap(d map[string]FundingRate) map[string]any {
	return StructDictToMap(d, FundingRateToMap)
}
func OpenInterestMapFromMap(data any) map[string]OpenInterest {
	return StructDictFromMap(data, OpenInterestFromMap)
}
func OpenInterestMapToMap(d map[string]OpenInterest) map[string]any {
	return StructDictToMap(d, OpenInterestToMap)
}
func TradingFeeInterfaceMapFromMap(data any) map[string]TradingFeeInterface {
	return StructDictFromMap(data, TradingFeeInterfaceFromMap)
}
func TradingFeeInterfaceMapToMap(d map[string]TradingFeeInterface) map[string]any {
	return StructDictToMap(d, TradingFeeInterfaceToMap)
}
func LeverageMapFromMap(data any) map[string]Leverage {
	return StructDictFromMap(data, LeverageFromMap)
}
func LeverageMapToMap(d map[string]Leverage) map[string]any {
	return StructDictToMap(d, LeverageToMap)
}
func MarginModeMapFromMap(data any) map[string]MarginMode {
	return StructDictFromMap(data, MarginModeFromMap)
}
func MarginModeMapToMap(d map[string]MarginMode) map[string]any {
	return StructDictToMap(d, MarginModeToMap)
}

func ADLFromMap(data any) ADL {
	m, ok := RowDict(data)
	if !ok {
		return ADL{}
	}
	return NewADL(m)
}
func ADLToMap(v ADL) map[string]any { return StructToMap(v) }

func CrossBorrowRateFromMap(data any) CrossBorrowRate {
	m, ok := RowDict(data)
	if !ok {
		return CrossBorrowRate{}
	}
	return NewCrossBorrowRate(m)
}
func CrossBorrowRateToMap(v CrossBorrowRate) map[string]any { return StructToMap(v) }

func IsolatedBorrowRateFromMap(data any) IsolatedBorrowRate {
	m, ok := RowDict(data)
	if !ok {
		return IsolatedBorrowRate{}
	}
	return NewIsolatedBorrowRate(m)
}
func IsolatedBorrowRateToMap(v IsolatedBorrowRate) map[string]any { return StructToMap(v) }

func LastPriceFromMap(data any) LastPrice {
	m, ok := RowDict(data)
	if !ok {
		return LastPrice{}
	}
	return NewLastPrice(m)
}

func LongShortRatioFromMap(data any) LongShortRatio {
	m, ok := RowDict(data)
	if !ok {
		return LongShortRatio{}
	}
	return NewLongShortRatio(m)
}
func LongShortRatioToMap(v LongShortRatio) map[string]any { return StructToMap(v) }

func MarginModificationFromMap(data any) MarginModification {
	m, ok := RowDict(data)
	if !ok {
		return MarginModification{}
	}
	return NewMarginModification(m)
}
func MarginModificationToMap(v MarginModification) map[string]any { return StructToMap(v) }

func LiquidationFromMap(data any) Liquidation {
	m, ok := RowDict(data)
	if !ok {
		return Liquidation{}
	}
	return NewLiquidation(m)
}
func LiquidationToMap(v Liquidation) map[string]any { return StructToMap(v) }

func BorrowInterestFromMap(data any) BorrowInterest {
	m, ok := RowDict(data)
	if !ok {
		return BorrowInterest{}
	}
	return NewBorrowInterest(m)
}
func BorrowInterestToMap(v BorrowInterest) map[string]any { return StructToMap(v) }

func FundingHistoryFromMap(data any) FundingHistory {
	m, ok := RowDict(data)
	if !ok {
		return FundingHistory{}
	}
	return NewFundingHistory(m)
}
func FundingHistoryToMap(v FundingHistory) map[string]any { return StructToMap(v) }

func FundingRateHistoryFromMap(data any) FundingRateHistory {
	m, ok := RowDict(data)
	if !ok {
		return FundingRateHistory{}
	}
	return NewFundingRateHistory(m)
}
func FundingRateHistoryToMap(v FundingRateHistory) map[string]any { return StructToMap(v) }

func LeverageTierFromMap(data any) LeverageTier {
	m, ok := RowDict(data)
	if !ok {
		return LeverageTier{}
	}
	return NewLeverageTier(m)
}
func LeverageTierToMap(v LeverageTier) map[string]any { return StructToMap(v) }

func IsolatedBorrowRateMapFromMap(data any) map[string]IsolatedBorrowRate {
	return StructDictFromMap(data, IsolatedBorrowRateFromMap)
}
func IsolatedBorrowRateMapToMap(d map[string]IsolatedBorrowRate) map[string]any {
	return StructDictToMap(d, IsolatedBorrowRateToMap)
}
func LastPriceMapFromMap(data any) map[string]LastPrice {
	return StructDictFromMap(data, LastPriceFromMap)
}

func copyMap(m map[string]any) map[string]any {
	out := make(map[string]any, len(m))
	for k, v := range m {
		out[k] = v
	}
	return out
}

func withDictFee(m map[string]any) map[string]any {
	if _, isDict := m["fee"].(map[string]any); isDict || m["fee"] == nil {
		return m
	}
	view := copyMap(m)
	delete(view, "fee")
	return view
}

// OHLCVFromList builds an OHLCV from a parsed [ts, o, h, l, c, v] row (nil elements read as 0);
// the row itself is kept so OHLCVToList returns it unchanged.
func OHLCVFromList(data any) OHLCV {
	o := OHLCV{row: data}
	if row, ok := data.([]any); ok {
		if ts := SafeInt64Typed(row, 0); ts != nil {
			o.Timestamp = *ts
		}
		for i, dst := range []*float64{&o.Open, &o.High, &o.Low, &o.Close, &o.Volume} {
			if f := SafeFloatTyped(row, i+1); f != nil {
				*dst = *f
			}
		}
	}
	return o
}

// OHLCVToList is the inverse of OHLCVFromList.
func OHLCVToList(o OHLCV) any {
	if o.row != nil {
		return o.row
	}
	return []any{o.Timestamp, o.Open, o.High, o.Low, o.Close, o.Volume}
}

// StructToMap turns a unified struct into its ccxt map: exported fields under their lowerCamel
// key, pointers dereferenced, nested structs (and slices of them) as maps, and a nested struct
// with every field nil (an absent Fee) as nil.
func StructToMap(s any) map[string]any {
	v := reflect.ValueOf(s)
	if v.Kind() == reflect.Ptr {
		if v.IsNil() {
			return nil
		}
		v = v.Elem()
	}
	if v.Kind() != reflect.Struct {
		if m, ok := s.(map[string]any); ok {
			return m
		}
		return nil
	}
	t := v.Type()
	m := make(map[string]any, t.NumField())
	for i := 0; i < t.NumField(); i++ {
		if f := t.Field(i); f.IsExported() {
			m[lowerFirst(f.Name)] = structValueToAny(v.Field(i))
		}
	}
	if l, isLimits := v.Interface().(Limits); isLimits && l.Market == nil {
		delete(m, "market")
	}
	return m
}

func structValueToAny(fv reflect.Value) any {
	switch fv.Kind() {
	case reflect.Ptr, reflect.Interface:
		if fv.IsNil() {
			return nil
		}
		return structValueToAny(fv.Elem())
	case reflect.Map:
		if fv.IsNil() {
			return nil
		}
		if fv.Type().Elem().Kind() == reflect.Struct {
			out := make(map[string]any, fv.Len())
			for _, k := range fv.MapKeys() {
				out[k.String()] = StructToMap(fv.MapIndex(k).Interface())
			}
			return out
		}
	case reflect.Struct:
		if fv.Type() == reflect.TypeOf(Fee{}) && structIsVacant(fv) {
			return nil
		}
		return StructToMap(fv.Interface())
	case reflect.Slice:
		if fv.IsNil() {
			return nil
		}
		if fv.Type().Elem().Kind() == reflect.Struct {
			out := make([]any, fv.Len())
			for i := 0; i < fv.Len(); i++ {
				out[i] = StructToMap(fv.Index(i).Interface())
			}
			return out
		}
		if fv.Type().Elem().Kind() == reflect.String {
			out := make([]any, fv.Len())
			for i := 0; i < fv.Len(); i++ {
				out[i] = fv.Index(i).String()
			}
			return out
		}
	}
	return fv.Interface()
}

func structIsVacant(v reflect.Value) bool {
	for i := 0; i < v.NumField(); i++ {
		switch f := v.Field(i); f.Kind() {
		case reflect.Ptr, reflect.Interface, reflect.Map, reflect.Slice:
			if !f.IsNil() {
				return false
			}
		default:
			return false
		}
	}
	return true
}

func lowerFirst(s string) string {
	if s == "" {
		return s
	}
	b := []byte(s)
	if b[0] >= 'A' && b[0] <= 'Z' {
		b[0] += 'a' - 'A'
	}
	return string(b)
}

// NewOHLCVForSymbolsMap converts a watchOHLCVForSymbols result (symbol -> timeframe -> candles,
// built by createOHLCVObject as nested map[string]any) into the typed wrapper shape.
func NewOHLCVForSymbolsMap(data any) map[string]map[string][]OHLCV {
	bySymbol, ok := RowDict(data)
	if !ok {
		return nil
	}
	result := map[string]map[string][]OHLCV{}
	for symbol, frames := range bySymbol {
		byFrame, ok := frames.(map[string]any)
		if !ok {
			continue
		}
		typed := map[string][]OHLCV{}
		for timeframe, candles := range byFrame {
			if candles != nil {
				typed[timeframe] = OHLCVsFromList(candles)
			}
		}
		result[symbol] = typed
	}
	return result
}

// OHLCVForSymbolsMapFromMap builds a nested symbol->timeframe->[]OHLCV map from a watchOHLCVForSymbols result.
func OHLCVForSymbolsMapFromMap(data any) map[string]map[string][]OHLCV {
	return NewOHLCVForSymbolsMap(data)
}

// OHLCVForSymbolsMapToMap converts a nested symbol->timeframe->[]OHLCV map back to map[string]any.
func OHLCVForSymbolsMapToMap(v map[string]map[string][]OHLCV) map[string]any {
	if v == nil {
		return nil
	}
	result := make(map[string]any, len(v))
	for symbol, byFrame := range v {
		frames := make(map[string]any, len(byFrame))
		for timeframe, candles := range byFrame {
			frames[timeframe] = OHLCVsToList(candles)
		}
		result[symbol] = frames
	}
	return result
}

// Struct channels (build/go-chan3.ts goChan3StructPass): a core typed AsyncResult[T] for a unified
// struct T sends the zero T where the map core sent nil. Readers that hand the value on untyped use
// these so "absent" keeps reading as untyped nil.

// StructAbsent reports whether v is the zero T (the absent result of a struct channel).
func StructAbsent[T any](v T) bool {
	return reflect.ValueOf(&v).Elem().IsZero()
}

// StructResultMap is the map shape of a struct channel value: nil for the zero T.
func StructResultMap[T any](v T, toMap func(T) map[string]any) map[string]any {
	if StructAbsent(v) {
		return nil
	}
	return toMap(v)
}

// StructBox is the untyped box of a struct channel value: untyped nil for the zero T.
func StructBox[T any](v T, toMap func(T) map[string]any) any {
	if StructAbsent(v) {
		return nil
	}
	return toMap(v)
}

// WatchResolved converts an untyped Future-resolved value (from Watch/WatchMultiple/client.Future)
// to the target channel element type T.
func WatchResolved[T any](v any) T {
	var zero T
	if v == nil {
		return zero
	}
	if typed, ok := v.(T); ok {
		return typed
	}
	switch any(zero).(type) {
	case []any:
		if c, ok := v.(IArrayCache); ok {
			return any(c.ToArray()).(T)
		}
	case map[string]any:
	case bool:
		return any(IsTrue(v)).(T)
	case *string:
		if s, ok := v.(string); ok {
			return any(&s).(T)
		}
		return zero
	}
	panic(ExchangeError("resolved value does not match target channel type"))
}

// Watch wraps a core's Watch call and resolves its channel element to T.
func Watch[T any](ex interface {
	Watch(args ...any) <-chan AsyncResult[any]
}, args ...any) <-chan AsyncResult[T] {
	ch := make(chan AsyncResult[T], 1)
	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)
		r := <-ex.Watch(args...)
		if r.Err != nil {
			panic(r.Err)
		}
		ch <- AsyncResult[T]{Value: WatchResolved[T](r.Value)}
	}()
	return ch
}

// WatchMultiple wraps a core's WatchMultiple call and resolves its channel element to T.
func WatchMultiple[T any](ex interface {
	WatchMultiple(args ...any) <-chan AsyncResult[any]
}, args ...any) <-chan AsyncResult[T] {
	ch := make(chan AsyncResult[T], 1)
	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)
		r := <-ex.WatchMultiple(args...)
		if r.Err != nil {
			panic(r.Err)
		}
		ch <- AsyncResult[T]{Value: WatchResolved[T](r.Value)}
	}()
	return ch
}

// List-of-struct channels (build/go-chan3.ts goChan3StructListPass, W28): a core typed AsyncResult[[]T]
// sends the parsed rows as []T; readers that hand the value on untyped read it back with <Ts>ToList, the
// exact []any (nil for nil) the AsyncResult[[]any] core sent; reflective readers get the typed []T.

// StructListFromList builds a []T from a parsed list (an ArrayCache reads as its rows; nil stays nil).
func StructListFromList[T any](data any, from func(any) T) []T {
	rows := listValueToTypedSlice(data)
	if rows == nil {
		return nil
	}
	out := make([]T, 0, len(rows))
	for _, row := range rows {
		if typed, isTyped := row.(T); isTyped {
			out = append(out, typed)
		} else if row != nil {
			out = append(out, from(row))
		}
	}
	return out
}

// StructListToList is the []any shape every untyped caller expects (nil for a nil slice).
func StructListToList[T any, R any](v []T, to func(T) R) []any {
	if v == nil {
		return nil
	}
	out := make([]any, len(v))
	for i, row := range v {
		out[i] = to(row)
	}
	return out
}

// StructListBox is the untyped box of a list-of-struct channel value: untyped nil for a nil slice.
func StructListBox[T any, R any](v []T, to func(T) R) any {
	if v == nil {
		return nil
	}
	return StructListToList(v, to)
}

// StructListsToLists converts a PromiseAllTyped result of list-of-struct channels to [][]any.
func StructListsToLists[T any, R any](v [][]T, to func(T) R) [][]any {
	if v == nil {
		return nil
	}
	out := make([][]any, len(v))
	for i, rows := range v {
		out[i] = StructListToList(rows, to)
	}
	return out
}

// TradesFromList builds a []Trade from a parsed trade list.
func TradesFromList(data any) []Trade { return StructListFromList(data, TradeFromMap) }

// TradesToList is the []any shape every untyped caller expects.
func TradesToList(v []Trade) []any { return StructListToList(v, TradeToMap) }

// OrdersFromList builds an []Order from a parsed order list.
func OrdersFromList(data any) []Order { return StructListFromList(data, OrderFromMap) }

// OrdersToList is the []any shape every untyped caller expects.
func OrdersToList(v []Order) []any { return StructListToList(v, OrderToMap) }

// OHLCVsFromList builds an []OHLCV from parsed candle rows.
func OHLCVsFromList(data any) []OHLCV { return StructListFromList(data, OHLCVFromList) }

// OHLCVsToList is the []any shape every untyped caller expects (each candle its original row).
func OHLCVsToList(v []OHLCV) []any { return StructListToList(v, OHLCVToList) }

// PositionsFromList builds a []Position from a parsed position list.
func PositionsFromList(data any) []Position { return StructListFromList(data, PositionFromMap) }

// PositionsToList is the []any shape every untyped caller expects.
func PositionsToList(v []Position) []any { return StructListToList(v, PositionToMap) }

// TransactionsFromList builds a []Transaction from a parsed transaction list.
func TransactionsFromList(data any) []Transaction {
	return StructListFromList(data, TransactionFromMap)
}

// TransactionsToList is the []any shape every untyped caller expects.
func TransactionsToList(v []Transaction) []any { return StructListToList(v, TransactionToMap) }

// LedgerEntriesFromList builds a []LedgerEntry from a parsed ledger.
func LedgerEntriesFromList(data any) []LedgerEntry {
	return StructListFromList(data, LedgerEntryFromMap)
}

// LedgerEntriesToList is the []any shape every untyped caller expects.
func LedgerEntriesToList(v []LedgerEntry) []any { return StructListToList(v, LedgerEntryToMap) }

func DepositAddressesFromList(data any) []DepositAddress {
	return StructListFromList(data, DepositAddressFromMap)
}
func DepositAddressesToList(v []DepositAddress) []any {
	return StructListToList(v, DepositAddressToMap)
}
func TransferEntriesFromList(data any) []TransferEntry {
	return StructListFromList(data, TransferEntryFromMap)
}
func TransferEntriesToList(v []TransferEntry) []any {
	return StructListToList(v, TransferEntryToMap)
}
func OpenInterestsFromList(data any) []OpenInterest {
	return StructListFromList(data, OpenInterestFromMap)
}
func OpenInterestsToList(v []OpenInterest) []any {
	return StructListToList(v, OpenInterestToMap)
}
func ConversionsFromList(data any) []Conversion {
	return StructListFromList(data, ConversionFromMap)
}
func ConversionsToList(v []Conversion) []any {
	return StructListToList(v, ConversionToMap)
}
func LiquidationsFromList(data any) []Liquidation {
	return StructListFromList(data, LiquidationFromMap)
}
func LiquidationsToList(v []Liquidation) []any {
	return StructListToList(v, LiquidationToMap)
}
func BorrowInterestsFromList(data any) []BorrowInterest {
	return StructListFromList(data, BorrowInterestFromMap)
}
func BorrowInterestsToList(v []BorrowInterest) []any {
	return StructListToList(v, BorrowInterestToMap)
}
func FundingHistoriesFromList(data any) []FundingHistory {
	return StructListFromList(data, FundingHistoryFromMap)
}
func FundingHistoriesToList(v []FundingHistory) []any {
	return StructListToList(v, FundingHistoryToMap)
}
func FundingRateHistoriesFromList(data any) []FundingRateHistory {
	return StructListFromList(data, FundingRateHistoryFromMap)
}
func FundingRateHistoriesToList(v []FundingRateHistory) []any {
	return StructListToList(v, FundingRateHistoryToMap)
}
func LeverageTiersFromList(data any) []LeverageTier {
	return StructListFromList(data, LeverageTierFromMap)
}
func LeverageTiersToList(v []LeverageTier) []any {
	return StructListToList(v, LeverageTierToMap)
}
func MarginModificationsFromList(data any) []MarginModification {
	return StructListFromList(data, MarginModificationFromMap)
}
func MarginModificationsToList(v []MarginModification) []any {
	return StructListToList(v, MarginModificationToMap)
}
func LongShortRatiosFromList(data any) []LongShortRatio {
	return StructListFromList(data, LongShortRatioFromMap)
}
func LongShortRatiosToList(v []LongShortRatio) []any {
	return StructListToList(v, LongShortRatioToMap)
}
func ADLsFromList(data any) []ADL {
	return StructListFromList(data, ADLFromMap)
}
func ADLsToList(v []ADL) []any {
	return StructListToList(v, ADLToMap)
}
func AccountsFromList(data any) []Account {
	return StructListFromList(data, AccountFromMap)
}
func AccountsToList(v []Account) []any {
	return StructListToList(v, AccountToMap)
}

func StatusFromMap(data any) Status {
	m, ok := RowDict(data)
	if !ok {
		return Status{}
	}
	return NewStatus(m)
}
func StatusToMap(v Status) map[string]any { return StructToMap(v) }

func PositionModeInfoFromMap(data any) PositionModeInfo {
	m, ok := RowDict(data)
	if !ok {
		return PositionModeInfo{}
	}
	return NewPositionModeInfo(m)
}

func AccountFromMap(data any) Account {
	m, ok := RowDict(data)
	if !ok {
		return Account{}
	}
	return NewAccount(m)
}
func AccountToMap(v Account) map[string]any { return StructToMap(v) }

func DepositWithdrawFeeFromMap(data any) DepositWithdrawFee {
	m, ok := RowDict(data)
	if !ok {
		return DepositWithdrawFee{}
	}
	res := NewDepositWithdrawFee(m)
	res.Info = m["info"]
	return res
}
func DepositWithdrawFeeToMap(v DepositWithdrawFee) map[string]any {
	var withdraw any = map[string]any{"fee": nil, "percentage": nil}
	if v.Withdraw != nil {
		withdraw = StructToMap(*v.Withdraw)
	}
	var deposit any = map[string]any{"fee": nil, "percentage": nil}
	if v.Deposit != nil {
		deposit = StructToMap(*v.Deposit)
	}
	networks := make(map[string]any, len(v.Networks))
	for k, n := range v.Networks {
		var netWithdraw any = map[string]any{"fee": nil, "percentage": nil}
		if n.Withdraw != nil {
			netWithdraw = StructToMap(*n.Withdraw)
		}
		var netDeposit any = map[string]any{"fee": nil, "percentage": nil}
		if n.Deposit != nil {
			netDeposit = StructToMap(*n.Deposit)
		}
		networks[k] = map[string]any{
			"withdraw": netWithdraw,
			"deposit":  netDeposit,
		}
	}
	return map[string]any{
		"info":     v.Info,
		"withdraw": withdraw,
		"deposit":  deposit,
		"networks": networks,
	}
}
func DepositWithdrawFeeMapFromMap(data any) map[string]DepositWithdrawFee {
	return StructDictFromMap(data, DepositWithdrawFeeFromMap)
}
func DepositWithdrawFeeMapToMap(d map[string]DepositWithdrawFee) map[string]any {
	return StructDictToMap(d, DepositWithdrawFeeToMap)
}
func DepositAddressMapFromMap(data any) map[string]DepositAddress {
	return StructDictFromMap(data, DepositAddressFromMap)
}
func DepositAddressMapToMap(d map[string]DepositAddress) map[string]any {
	return StructDictToMap(d, DepositAddressToMap)
}
func CrossBorrowRateMapFromMap(data any) map[string]CrossBorrowRate {
	return StructDictFromMap(data, CrossBorrowRateFromMap)
}
func CrossBorrowRateMapToMap(d map[string]CrossBorrowRate) map[string]any {
	return StructDictToMap(d, CrossBorrowRateToMap)
}
func GreeksMapFromMap(data any) map[string]Greeks {
	return StructDictFromMap(data, GreeksFromMap)
}
func OptionMapFromMap(data any) map[string]Option {
	return StructDictFromMap(data, OptionFromMap)
}

func OrderBookFromMap(data any) OrderBook {
	m, ok := RowDict(data)
	if !ok {
		return OrderBook{}
	}
	return NewOrderBook(m)
}
func OrderBookToMap(ob OrderBook) map[string]any {
	m := StructToMap(ob)
	for _, side := range []string{"bids", "asks"} {
		rows := ob.Bids
		if side == "asks" {
			rows = ob.Asks
		}
		list := make([]any, len(rows))
		for i, row := range rows {
			entry := make([]any, len(row))
			for j, v := range row {
				entry[j] = v
			}
			list[i] = entry
		}
		m[side] = list
	}
	return m
}
func OrderBookMapFromMap(data any) map[string]OrderBook {
	return StructDictFromMap(data, OrderBookFromMap)
}
func OrderBookMapToMap(d map[string]OrderBook) map[string]any {
	return StructDictToMap(d, OrderBookToMap)
}

func OrderBookL3FromMap(data any) OrderBookL3 {
	m, ok := RowDict(data)
	if !ok {
		return OrderBookL3{}
	}
	return NewOrderBookL3(m)
}
func OrderBookL3ToMap(ob OrderBookL3) map[string]any {
	m := StructToMap(ob)
	for _, side := range []string{"bids", "asks"} {
		rows := ob.Bids
		if side == "asks" {
			rows = ob.Asks
		}
		list := make([]any, len(rows))
		for i, row := range rows {
			list[i] = []any{derefScalar(row.Price), derefScalar(row.Amount), derefScalar(row.OrderId)}
		}
		m[side] = list
	}
	return m
}

func MarginLoanFromMap(data any) MarginLoan {
	m, ok := RowDict(data)
	if !ok {
		return MarginLoan{}
	}
	return NewMarginLoan(m)
}

func BalanceFromMap(data any) Balance {
	m, ok := RowDict(data)
	if !ok {
		return Balance{}
	}
	return NewBalance(m)
}
func BalanceToMap(v Balance) map[string]any {
	return StructToMap(v)
}

func floatPtrMapToAny(in map[string]*float64) map[string]any {
	out := make(map[string]any, len(in))
	for k, v := range in {
		out[k] = derefScalar(v)
	}
	return out
}

func BalancesFromMap(data any) Balances {
	m, ok := RowDict(data)
	if !ok {
		return Balances{}
	}
	return NewBalances(m)
}
func BalancesToMap(b Balances) map[string]any {
	m := map[string]any{
		"info":      b.Info,
		"timestamp": derefScalar(b.Timestamp),
		"datetime":  derefScalar(b.Datetime),
		"free":      floatPtrMapToAny(b.Free),
		"used":      floatPtrMapToAny(b.Used),
		"total":     floatPtrMapToAny(b.Total),
	}
	if b.Debt != nil {
		m["debt"] = floatPtrMapToAny(b.Debt)
	}
	for code, bal := range b.Balances {
		m[code] = BalanceToMap(bal)
	}
	return m
}

func LeverageTiersFromMap(data any) LeverageTiers {
	m, ok := RowDict(data)
	if !ok {
		return LeverageTiers{}
	}
	return NewLeverageTiers(m)
}
func LeverageTiersToMap(lt LeverageTiers) map[string]any {
	m := make(map[string]any, len(lt.Tiers)+1)
	if lt.Info != nil {
		m["info"] = lt.Info
	}
	for sym, rows := range lt.Tiers {
		m[sym] = LeverageTiersToList(rows)
	}
	return m
}

func PredictionTickerFromMap(data any) PredictionTicker {
	m, ok := RowDict(data)
	if !ok {
		return PredictionTicker{}
	}
	return NewPredictionTicker(m)
}
func PredictionTickerMapFromMap(data any) map[string]PredictionTicker {
	return StructDictFromMap(data, PredictionTickerFromMap)
}

func PredictionOrderFromMap(data any) PredictionOrder {
	m, ok := RowDict(data)
	if !ok {
		return PredictionOrder{}
	}
	return NewPredictionOrder(m)
}
func PredictionOrderToMap(v PredictionOrder) map[string]any {
	return StructToMap(v)
}
func PredictionOrdersFromList(data any) []PredictionOrder {
	return StructListFromList(data, PredictionOrderFromMap)
}
func PredictionOrdersToList(s []PredictionOrder) []any {
	return StructListToList(s, PredictionOrderToMap)
}

func PredictionTradeFromMap(data any) PredictionTrade {
	m, ok := RowDict(data)
	if !ok {
		return PredictionTrade{}
	}
	return NewPredictionTrade(m)
}
func PredictionTradeToMap(v PredictionTrade) map[string]any {
	return StructToMap(v)
}
func PredictionTradesFromList(data any) []PredictionTrade {
	return StructListFromList(data, PredictionTradeFromMap)
}
func PredictionTradesToList(s []PredictionTrade) []any {
	return StructListToList(s, PredictionTradeToMap)
}

func PredictionPositionFromMap(data any) PredictionPosition {
	m, ok := RowDict(data)
	if !ok {
		return PredictionPosition{}
	}
	return NewPredictionPosition(m)
}
func PredictionPositionToMap(v PredictionPosition) map[string]any {
	return StructToMap(v)
}
func PredictionPositionsFromList(data any) []PredictionPosition {
	return StructListFromList(data, PredictionPositionFromMap)
}
func PredictionPositionsToList(s []PredictionPosition) []any {
	return StructListToList(s, PredictionPositionToMap)
}

func PredictionOrderBookFromMap(data any) PredictionOrderBook {
	m, ok := RowDict(data)
	if !ok {
		return PredictionOrderBook{}
	}
	return NewPredictionOrderBook(m)
}
func PredictionOrderBookToMap(ob PredictionOrderBook) map[string]any {
	m := StructToMap(ob)
	for _, side := range []string{"bids", "asks"} {
		rows := ob.Bids
		if side == "asks" {
			rows = ob.Asks
		}
		list := make([]any, len(rows))
		for i, row := range rows {
			entry := make([]any, len(row))
			for j, v := range row {
				entry[j] = v
			}
			list[i] = entry
		}
		m[side] = list
	}
	return m
}

func PredictionTradingFeeFromMap(data any) PredictionTradingFee {
	m, ok := RowDict(data)
	if !ok {
		return PredictionTradingFee{}
	}
	return NewPredictionTradingFee(m)
}

func PredictionOpenInterestFromMap(data any) PredictionOpenInterest {
	m, ok := RowDict(data)
	if !ok {
		return PredictionOpenInterest{}
	}
	return NewPredictionOpenInterest(m)
}

func PredictionEventFromMap(data any) PredictionEvent {
	m, ok := RowDict(data)
	if !ok {
		return PredictionEvent{}
	}
	return NewPredictionEvent(m)
}
func PredictionEventToMap(v PredictionEvent) map[string]any {
	return StructToMap(v)
}
func PredictionEventsFromList(data any) []PredictionEvent {
	return StructListFromList(data, PredictionEventFromMap)
}
func PredictionEventsToList(s []PredictionEvent) []any {
	return StructListToList(s, PredictionEventToMap)
}

func PredictionSettlementFromMap(data any) PredictionSettlement {
	m, ok := RowDict(data)
	if !ok {
		return PredictionSettlement{}
	}
	return NewPredictionSettlement(m)
}
func PredictionSettlementToMap(v PredictionSettlement) map[string]any {
	return StructToMap(v)
}
func PredictionSettlementsFromList(data any) []PredictionSettlement {
	return StructListFromList(data, PredictionSettlementFromMap)
}
func PredictionSettlementsToList(s []PredictionSettlement) []any {
	return StructListToList(s, PredictionSettlementToMap)
}

func PredictionOutcomeFromMap(data any) PredictionOutcome {
	m, ok := RowDict(data)
	if !ok {
		return PredictionOutcome{}
	}
	return NewPredictionOutcome(m)
}
func PredictionOutcomeToMap(v PredictionOutcome) map[string]any {
	return StructToMap(v)
}
func PredictionOutcomeMapFromMap(data any) map[string]PredictionOutcome {
	return StructDictFromMap(data, PredictionOutcomeFromMap)
}
func PredictionOutcomeMapToMap(d map[string]PredictionOutcome) map[string]any {
	return StructDictToMap(d, PredictionOutcomeToMap)
}
func PredictionEventMapFromMap(data any) map[string]PredictionEvent {
	return StructDictFromMap(data, PredictionEventFromMap)
}

func StructSliceToMaps[T any](v []T, to func(T) map[string]any) []map[string]any {
	if v == nil {
		return nil
	}
	out := make([]map[string]any, len(v))
	for i, row := range v {
		out[i] = StructResultMap(row, to)
	}
	return out
}

func MarketInterfaceFromMap(data any) MarketInterface {
	m, ok := RowDict(data)
	if !ok {
		return MarketInterface{}
	}
	return NewMarketInterface(m)
}
func MarketInterfaceToMap(mi MarketInterface) map[string]any {
	m := StructToMap(mi)
	m["base"] = m["baseCurrency"]
	m["quote"] = m["quoteCurrency"]
	delete(m, "baseCurrency")
	delete(m, "quoteCurrency")
	if mi.Quanto == nil {
		delete(m, "quanto")
	}
	return m
}
func MarketInterfacesFromList(data any) []MarketInterface {
	return StructListFromList(data, MarketInterfaceFromMap)
}
func MarketInterfacesToList(s []MarketInterface) []any {
	return StructListToList(s, MarketInterfaceToMap)
}

func CurrencyFromMap(data any) Currency {
	m, ok := RowDict(data)
	if !ok {
		return Currency{}
	}
	return NewCurrency(m)
}
func CurrencyToMap(c Currency) map[string]any {
	return StructToMap(c)
}

func CurrenciesFromMap(data any) Currencies {
	m, ok := RowDict(data)
	if !ok {
		return Currencies{}
	}
	return NewCurrencies(m)
}
func CurrenciesToMap(cs Currencies) map[string]any {
	m := make(map[string]any, len(cs.Currencies)+1)
	if len(cs.Info) > 0 {
		m["info"] = cs.Info
	}
	for code, cur := range cs.Currencies {
		m[code] = CurrencyToMap(cur)
	}
	return m
}

func MapSliceFromList(data any) []map[string]any {
	if data == nil {
		return nil
	}
	return NewMapArray(data)
}
func MapSliceToList(s []map[string]any) []any {
	if s == nil {
		return nil
	}
	out := make([]any, len(s))
	for i, m := range s {
		out[i] = m
	}
	return out
}

func StringSliceFromList(data any) []string {
	if data == nil {
		return nil
	}
	return NewStringArray(data)
}
func StringSliceToList(s []string) []any {
	if s == nil {
		return nil
	}
	out := make([]any, len(s))
	for i, v := range s {
		out[i] = v
	}
	return out
}

// dynamicLists maps each list-of-struct channel element onto the []any of maps the untyped (TS-shaped) base code reads.
var dynamicLists = map[reflect.Type]func(any) any{
	reflect.TypeOf([]Trade(nil)):                func(v any) any { return TradesToList(v.([]Trade)) },
	reflect.TypeOf([]Order(nil)):                func(v any) any { return OrdersToList(v.([]Order)) },
	reflect.TypeOf([]OHLCV(nil)):                func(v any) any { return OHLCVsToList(v.([]OHLCV)) },
	reflect.TypeOf([]Position(nil)):             func(v any) any { return PositionsToList(v.([]Position)) },
	reflect.TypeOf([]Transaction(nil)):          func(v any) any { return TransactionsToList(v.([]Transaction)) },
	reflect.TypeOf([]LedgerEntry(nil)):          func(v any) any { return LedgerEntriesToList(v.([]LedgerEntry)) },
	reflect.TypeOf([]DepositAddress(nil)):       func(v any) any { return DepositAddressesToList(v.([]DepositAddress)) },
	reflect.TypeOf([]TransferEntry(nil)):        func(v any) any { return TransferEntriesToList(v.([]TransferEntry)) },
	reflect.TypeOf([]OpenInterest(nil)):         func(v any) any { return OpenInterestsToList(v.([]OpenInterest)) },
	reflect.TypeOf([]Conversion(nil)):           func(v any) any { return ConversionsToList(v.([]Conversion)) },
	reflect.TypeOf([]Liquidation(nil)):          func(v any) any { return LiquidationsToList(v.([]Liquidation)) },
	reflect.TypeOf([]BorrowInterest(nil)):       func(v any) any { return BorrowInterestsToList(v.([]BorrowInterest)) },
	reflect.TypeOf([]FundingHistory(nil)):       func(v any) any { return FundingHistoriesToList(v.([]FundingHistory)) },
	reflect.TypeOf([]FundingRateHistory(nil)):   func(v any) any { return FundingRateHistoriesToList(v.([]FundingRateHistory)) },
	reflect.TypeOf([]LeverageTier(nil)):         func(v any) any { return LeverageTiersToList(v.([]LeverageTier)) },
	reflect.TypeOf([]MarginModification(nil)):   func(v any) any { return MarginModificationsToList(v.([]MarginModification)) },
	reflect.TypeOf([]LongShortRatio(nil)):       func(v any) any { return LongShortRatiosToList(v.([]LongShortRatio)) },
	reflect.TypeOf([]ADL(nil)):                  func(v any) any { return ADLsToList(v.([]ADL)) },
	reflect.TypeOf([]Account(nil)):              func(v any) any { return AccountsToList(v.([]Account)) },
	reflect.TypeOf([]PredictionOrder(nil)):      func(v any) any { return PredictionOrdersToList(v.([]PredictionOrder)) },
	reflect.TypeOf([]PredictionTrade(nil)):      func(v any) any { return PredictionTradesToList(v.([]PredictionTrade)) },
	reflect.TypeOf([]PredictionPosition(nil)):   func(v any) any { return PredictionPositionsToList(v.([]PredictionPosition)) },
	reflect.TypeOf([]PredictionEvent(nil)):      func(v any) any { return PredictionEventsToList(v.([]PredictionEvent)) },
	reflect.TypeOf([]PredictionSettlement(nil)): func(v any) any { return PredictionSettlementsToList(v.([]PredictionSettlement)) },
	reflect.TypeOf([]MarketInterface(nil)):      func(v any) any { return MarketInterfacesToList(v.([]MarketInterface)) },
	reflect.TypeOf([]map[string]any(nil)):       func(v any) any { return MapSliceToList(v.([]map[string]any)) },
	reflect.TypeOf([]string(nil)):               func(v any) any { return StringSliceToList(v.([]string)) },
}

// DynamicValue is the TS-shaped view of a typed channel value for dynamic (by-name) callers:
// typed lists become []any of maps and a nil typed list or map becomes untyped nil.
func DynamicValue(v any) any {
	switch c := v.(type) {
	case map[string]any:
		if c == nil {
			return nil
		}
		return c
	case []any:
		if c == nil {
			return nil
		}
		return c
	}
	rv := reflect.ValueOf(v)
	if rv.IsValid() && rv.Kind() == reflect.Slice {
		if toList, ok := dynamicLists[rv.Type()]; ok {
			if rv.IsNil() {
				return nil
			}
			return toList(v)
		}
	}
	return v
}
