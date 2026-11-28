package base

import (
	"encoding/json"
	"fmt"
	"math"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

// snapshotOrderBook serves reads of a live orderbook from one consistent
// frozen view so that assertions in generated test code never see data a ws
// goroutine is concurrently mutating, and never mix two moments across keys.
// In js, python and php the runtime cannot mutate the book during a
// synchronous assertion, Go can, so the test lane snapshots at this boundary.
// The snapshot struct replicates the ccxt orderbook structure field for
// field, asks, bids, timestamp, datetime, nonce, symbol and the prediction
// identity, filled from one ToMap call. Cached briefly
// per book, so one assertion cycle sees one moment and the next watch loop
// iteration gets a fresh view.
type bookSnapshot struct {
	Asks      [][]interface{}
	Bids      [][]interface{}
	Timestamp interface{}
	Datetime  interface{}
	Nonce     interface{}
	Symbol    interface{}
	// prediction identity, nil on regular books
	Outcome   interface{}
	OutcomeId interface{}
	Market    interface{}
}

type bookSnapshotEntry struct {
	snap bookSnapshot
	at   time.Time
}

func newBookSnapshot(book ccxt.OrderBookInterface) bookSnapshot {
	// one ToMap call captures the whole book, both sides copied lock
	// correct back to back together with the scalars
	m := book.ToMap()
	asks, _ := m["asks"].([][]interface{})
	bids, _ := m["bids"].([][]interface{})
	return bookSnapshot{
		Asks:      asks,
		Bids:      bids,
		Timestamp: m["timestamp"],
		Datetime:  m["datetime"],
		Nonce:     m["nonce"],
		Symbol:    m["symbol"],
		Outcome:   m["outcome"],
		OutcomeId: m["outcomeId"],
		Market:    m["market"],
	}
}

var bookSnapshotMutex sync.Mutex
var bookSnapshots = map[interface{}]bookSnapshotEntry{}

// one assertion cycle over a book completes well within the ttl, while
// consecutive watch loop iterations are network spaced and get a fresh view
const bookSnapshotTtl = 50 * time.Millisecond
const bookSnapshotPrune = time.Second

func snapshotOrderBook(collection interface{}, key interface{}, value interface{}) interface{} {
	book, isBook := collection.(ccxt.OrderBookInterface)
	if !isBook {
		return value
	}
	k, isString := key.(string)
	if !isString {
		return value
	}
	now := time.Now()
	bookSnapshotMutex.Lock()
	defer bookSnapshotMutex.Unlock()
	for cached, entry := range bookSnapshots {
		if now.Sub(entry.at) > bookSnapshotPrune {
			delete(bookSnapshots, cached)
		}
	}
	entry, found := bookSnapshots[collection]
	if !found || now.Sub(entry.at) > bookSnapshotTtl {
		entry = bookSnapshotEntry{snap: newBookSnapshot(book), at: now}
		bookSnapshots[collection] = entry
	}
	switch k {
	case "asks":
		return entry.snap.Asks
	case "bids":
		return entry.snap.Bids
	case "timestamp":
		return entry.snap.Timestamp
	case "datetime":
		return entry.snap.Datetime
	case "nonce":
		return entry.snap.Nonce
	case "symbol":
		return entry.snap.Symbol
	case "outcome":
		return entry.snap.Outcome
	case "outcomeId":
		return entry.snap.OutcomeId
	case "market":
		return entry.snap.Market
	}
	return value
}

func SafeValue(obj interface{}, key interface{}, defaultValue interface{}) interface{} {
	return snapshotOrderBook(obj, key, ccxt.SafeValue(obj, key, defaultValue))
}

func Add(a interface{}, b interface{}) interface{} {
	return ccxt.Add(a, b)
}

func IsTrue(a interface{}) bool {
	return EvalTruthy(a)
}

func EvalTruthy(val interface{}) bool {
	val = ccxt.DerefScalar(val)
	if val == nil {
		return false
	}
	switch v := val.(type) {
	case int:
		return v != 0
	case int32:
		return v != 0
	case int64:
		return v != 0
	case uint:
		return v != 0
	case uint32:
		return v != 0
	case uint64:
		return v != 0
	case float32:
		return v != 0 && v == v
	case float64:
		return v != 0 && v == v
	case string:
		return v != ""
	case bool:
		return v
	case []any:
		return len(v) > 0
	case map[string]any:
		return len(v) > 0
	case []string:
		return len(v) > 0
	case []int64:
		return len(v) > 0
	case []float64:
		return len(v) > 0
	case []bool:
		return len(v) > 0
	case []int:
		return len(v) > 0
	default:
		return true
	}
}

func IsInteger(value interface{}) bool {
	return ccxt.IsInteger(value)
}

func GetValue(collection interface{}, key interface{}) interface{} {
	return snapshotOrderBook(collection, key, ccxt.GetValue(collection, key))
}

func Multiply(a, b interface{}) interface{} {
	a = ccxt.DerefScalar(a)
	b = ccxt.DerefScalar(b)
	if a == nil || b == nil {
		return nil
	}
	aVal := reflect.ValueOf(a)
	bVal := reflect.ValueOf(b)
	if !aVal.IsValid() || !bVal.IsValid() || !aVal.Type().ConvertibleTo(bVal.Type()) {
		return nil
	}
	aValConverted := aVal.Convert(bVal.Type())
	switch bVal.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return aValConverted.Int() * bVal.Int()
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return aValConverted.Uint() * bVal.Uint()
	case reflect.Float32, reflect.Float64:
		res := ccxt.ToFloat64(a) * ccxt.ToFloat64(b)
		if ccxt.IsInteger(res) {
			return ccxt.ParseInt(res)
		}
		return res
	default:
		return nil
	}
}

func Divide(a, b interface{}) interface{} {
	a = ccxt.DerefScalar(a)
	b = ccxt.DerefScalar(b)
	if a == nil || b == nil {
		return nil
	}
	aVal := reflect.ValueOf(a)
	bVal := reflect.ValueOf(b)
	if !aVal.IsValid() || !bVal.IsValid() || !aVal.Type().ConvertibleTo(bVal.Type()) {
		return nil
	}
	switch bVal.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64,
		reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64,
		reflect.Float32, reflect.Float64:
		aFloat := aVal.Convert(reflect.TypeOf(float64(0))).Float()
		bFloat := bVal.Convert(reflect.TypeOf(float64(0))).Float()
		if bFloat == 0.0 {
			return nil
		}
		res := aFloat / bFloat
		if ccxt.IsInteger(res) {
			return ccxt.ParseInt(res)
		}
		return res
	default:
		return nil
	}
}

func Subtract(a, b interface{}) interface{} {
	a = ccxt.DerefScalar(a)
	b = ccxt.DerefScalar(b)
	if a == nil || b == nil {
		return nil
	}
	res := ccxt.ToFloat64(a) - ccxt.ToFloat64(b)
	if ccxt.IsInteger(res) {
		return ccxt.ParseInt(res)
	}
	return res
}

func GetArrayLength(value interface{}) int {
	return ccxt.GetArrayLength(value)
}

func IsGreaterThan(a, b interface{}) bool {
	a = ccxt.DerefScalar(a)
	b = ccxt.DerefScalar(b)
	if a != nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}
	switch aVal := a.(type) {
	case int:
		switch bVal := b.(type) {
		case int:
			return aVal > bVal
		case int64:
			return int64(aVal) > bVal
		case float64:
			return float64(aVal) > bVal
		}
	case int64:
		switch bVal := b.(type) {
		case int:
			return aVal > int64(bVal)
		case int64:
			return aVal > bVal
		case float64:
			return float64(aVal) > bVal
		}
	case float64:
		switch bVal := b.(type) {
		case int:
			return aVal > float64(bVal)
		case int64:
			return aVal > float64(bVal)
		case float64:
			return aVal > bVal
		}
	}
	return false
}

func IsLessThan(a, b interface{}) bool {
	return !IsGreaterThan(a, b) && !ccxt.IsEqual(a, b)
}

func IsGreaterThanOrEqual(a, b interface{}) bool {
	return IsGreaterThan(a, b) || ccxt.IsEqual(a, b)
}

func IsLessThanOrEqual(a, b interface{}) bool {
	return IsLessThan(a, b) || ccxt.IsEqual(a, b)
}

func IsEqual(a, b interface{}) bool {
	return ccxt.IsEqual(a, b)
}

// the printer's bounds-checked element read wraps its result in DerefScalar() (the go/v4
// helper of that name); this package keeps the emitted code free of the `ccxt.` qualifier
// through its local set of wrappers
func DerefScalar(v any) any {
	return ccxt.DerefScalar(v)
}

func ToFloat64(v interface{}) float64 {
	return ccxt.ToFloat64(v)
}

func AppendToArray(slicePtr *interface{}, element interface{}) {
	ccxt.AppendToArray(slicePtr, element)
}

func AddElementToObject(arrayOrDict interface{}, stringOrInt interface{}, value interface{}) {
	ccxt.AddElementToObject(arrayOrDict, stringOrInt, value)
}

func InOp(dict interface{}, key interface{}) bool {
	return ccxt.InOp(dict, key)
}

func GetIndexOf(str interface{}, target interface{}) int {
	return ccxt.GetIndexOf(str, target)
}

func IsBool(v interface{}) bool {
	v = ccxt.DerefScalar(v)
	if v == nil {
		return false
	}
	_, ok := v.(bool)
	return ok
}

func IsString(v interface{}) bool {
	return ccxt.IsString(v)
}

func IsNumber(v interface{}) bool {
	return ccxt.IsNumber(v)
}

func ToLower(v interface{}) string {
	switch s := v.(type) {
	case string:
		return strings.ToLower(s)
	case *string:
		if s != nil {
			return strings.ToLower(*s)
		}
	}
	return ""
}

func ToUpper(v interface{}) string {
	v = ccxt.DerefScalar(v)
	if str, ok := v.(string); ok {
		return strings.ToUpper(str)
	}
	return ""
}

func IsInt(v interface{}) bool {
	v = ccxt.DerefScalar(v)
	if v == nil {
		return false
	}
	switch v.(type) {
	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
		return true
	default:
		return false
	}
}

func StartsWith(v interface{}, prefix interface{}) bool {
	s, ok := v.(string)
	if !ok {
		if p, pok := v.(*string); pok && p != nil {
			s = *p
			ok = true
		}
	}
	if !ok {
		return false
	}
	return strings.HasPrefix(s, ccxt.ToString(prefix))
}

func EndsWith(v interface{}, suffix interface{}) bool {
	s, ok := v.(string)
	if !ok {
		if p, pok := v.(*string); pok && p != nil {
			s = *p
			ok = true
		}
	}
	if !ok {
		return false
	}
	return strings.HasSuffix(s, ccxt.ToString(suffix))
}

func Contains(v interface{}, substr interface{}) bool {
	s, ok := v.(string)
	if !ok {
		if p, pok := v.(*string); pok && p != nil {
			s = *p
			ok = true
		}
	}
	if !ok {
		return false
	}
	return strings.Contains(s, ccxt.ToString(substr))
}

func StringArg(v interface{}) string {
	return ccxt.StringArg(v)
}

func Float64Arg(v interface{}) float64 {
	switch value := ccxt.DerefScalar(v).(type) {
	case float64:
		return value
	case float32:
		return float64(value)
	case int:
		return float64(value)
	case int32:
		return float64(value)
	case int64:
		return float64(value)
	}
	panic(ccxt.ArgumentsRequired(fmt.Sprintf("expected a number argument, got %T: %v", v, v)))
}

func ToString(v interface{}) string {
	return ccxt.ToString(v)
}

func Join(slice interface{}, sep interface{}) string {
	return ccxt.Join(slice, sep)
}

func Split(str interface{}, sep interface{}) []string {
	return ccxt.Split(str, sep)
}

func ObjectKeys(v interface{}) []string {
	return ccxt.ObjectKeys(v)
}

func ObjectValues(v interface{}) []interface{} {
	if mapObject, ok := v.(map[string]interface{}); ok {
		values := make([]interface{}, 0, len(mapObject))
		for _, value := range mapObject {
			values = append(values, value)
		}
		return values
	}
	return nil
}

func JsonParse(jsonStr2 interface{}) interface{} {
	return ccxt.JsonParse(jsonStr2)
}

func IsArray(v interface{}) bool {
	return ccxt.IsArray(v)
}

func Replace(input interface{}, old interface{}, new interface{}) string {
	input = ccxt.DerefScalar(input)
	return strings.ReplaceAll(ccxt.ToString(input), ccxt.ToString(old), ccxt.ToString(new))
}

func DateNow() string {
	return time.Now().Format(time.RFC3339)
}

func GetLength(v interface{}) int {
	v = ccxt.DerefScalar(v)
	val := reflect.ValueOf(v)
	switch val.Kind() {
	case reflect.String:
		return len(val.String())
	case reflect.Array, reflect.Slice:
		return val.Len()
	default:
		return 0
	}
}

func GetArg(v []interface{}, index int, def interface{}) interface{} {
	return ccxt.GetArg(v, index, def)
}

func MapTyped(v any) map[string]any {
	return ccxt.MapTyped(v)
}

func SafeStringPtr(v any) *string {
	return ccxt.SafeStringPtr(v)
}

func TupleSlice[T any](value T, params map[string]any) []any {
	return ccxt.TupleSlice(value, params)
}

func SafeBoolPtr(v any) *bool {
	return ccxt.SafeBoolPtr(v)
}

func ListTyped(v any) []any {
	return ccxt.ListTyped(v)
}

func GetArgMap(args []any, index int, def map[string]any) map[string]any {
	return ccxt.GetArgMap(args, index, def)
}

func GetArgAnySlice(args []any, index int, def []any) []any {
	if len(args) > index && args[index] != nil {
		if res, ok := args[index].([]any); ok {
			return res
		}
	}
	return def
}

func GetArgStringSlice(args []any, index int, def []string) []string {
	return ccxt.GetArgStringSlice(args, index, def)
}

func GetArgString(args []any, index int, def string) string {
	return ccxt.GetArgString(args, index, def)
}

func GetArgBool(args []any, index int, def bool) bool {
	return ccxt.GetArgBool(args, index, def)
}

func GetArgInt64(args []any, index int, def int64) int64 {
	return ccxt.GetArgInt64(args, index, def)
}

func GetArgStringPtr(args []any, index int, def *string) *string {
	return ccxt.GetArgStringPtr(args, index, def)
}

func GetArgInt64Ptr(args []any, index int, def *int64) *int64 {
	return ccxt.GetArgInt64Ptr(args, index, def)
}

func Int64PtrTyped(v any) *int64 {
	return ccxt.Int64PtrTyped(v)
}

func GetArgFloat64Ptr(args []any, index int, def *float64) *float64 {
	return ccxt.GetArgFloat64Ptr(args, index, def)
}

func GetArgBoolPtr(args []any, index int, def *bool) *bool {
	return ccxt.GetArgBoolPtr(args, index, def)
}

func IsInstance(value interface{}, typ interface{}) bool {
	return ccxt.IsInstance(value, typ)
}

func promiseAll(tasksInterface interface{}) <-chan ccxt.AsyncResult[[]any] {
	return ccxt.PromiseAll(tasksInterface)
}

func PromiseAllTyped[T any, R ccxt.TypedOutcome[T]](tasks ...<-chan R) <-chan ccxt.AsyncResult[[]T] {
	return ccxt.PromiseAllTyped[T, R](tasks...)
}

func ParseInt(number interface{}) int64 {
	return ccxt.ParseInt(number)
}

func mathAbs(a interface{}) interface{} {
	return math.Abs(ccxt.ToFloat64(a))
}

func parseInt(input interface{}) interface{} {
	return ccxt.ParseInt(input)
}

func ParseJSON(input interface{}) interface{} {
	return ccxt.ParseJSON(input)
}

func OpNeg(value interface{}) interface{} {
	value = ccxt.DerefScalar(value)
	val := reflect.ValueOf(value)
	switch val.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return -val.Int()
	case reflect.Float32, reflect.Float64:
		return -val.Float()
	case reflect.Complex64, reflect.Complex128:
		return -val.Complex()
	default:
		return nil
	}
}

func JsonStringify(obj interface{}) string {
	obj = ccxt.DerefScalar(obj)
	if obj == nil {
		return ""
	}
	if err, ok := obj.(error); ok {
		errorObj := struct {
			Name string `json:"name"`
		}{
			Name: reflect.TypeOf(err).Name(),
		}
		jsonData, _ := json.Marshal(errorObj)
		return string(jsonData)
	}
	jsonData, _ := json.Marshal(obj)
	return string(jsonData)
}

func Capitalize(s string) string {
	return ccxt.Capitalize(s)
}

func CallInternalMethod(cache map[string]any, itf interface{}, name2 string, args ...interface{}) <-chan ccxt.AsyncResult[any] {
	return ccxt.CallInternalMethod(cache, itf, name2, args...)
}

func PanicOnError(msg interface{}) interface{} {
	return ccxt.PanicOnError(msg)
}

func setDefaults(p interface{}) {
	val := reflect.ValueOf(p).Elem()
	typ := val.Type()
	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldType := typ.Field(i)
		if value, ok := fieldType.Tag.Lookup("default"); ok {
			switch field.Kind() {
			case reflect.String:
				if field.String() == "" {
					field.SetString(value)
				}
			case reflect.Int:
				if field.Int() == 0 {
					if intValue, err := strconv.Atoi(value); err == nil {
						field.SetInt(int64(intValue))
					}
				}
			}
		}
	}
}

func Print(v ...interface{}) {
	fmt.Println(v...)
}

func ReturnPanicError[T any](ch chan ccxt.AsyncResult[T]) {
	// recover() only stops a panic when called directly by the deferred function,
	// so this cannot delegate to ccxt.ReturnPanicError
	if r := recover(); r != nil {
		if r != "break" {
			ch <- ccxt.AsyncResult[T]{Err: ccxt.RecoveredError(r)}
		}
	}
}

func callDynamically(name2 interface{}, args ...interface{}) <-chan ccxt.AsyncResult[any] {
	panic("not implemented")
}

// StructToMap normalises a unified struct (ccxt.Ticker, ...) into its map shape so the
// static asserts compare it like the stored json.
var StructToMap = ccxt.StructToMap
