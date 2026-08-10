package base

import (
	"fmt"
	"reflect"
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
	at        time.Time
}

func newBookSnapshot(book ccxt.OrderBookInterface, at time.Time) bookSnapshot {
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
		at:        at,
	}
}

var bookSnapshotMutex sync.Mutex
var bookSnapshots = map[interface{}]bookSnapshot{}

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
	for cached, snap := range bookSnapshots {
		if now.Sub(snap.at) > bookSnapshotPrune {
			delete(bookSnapshots, cached)
		}
	}
	snap, found := bookSnapshots[collection]
	if !found || now.Sub(snap.at) > bookSnapshotTtl {
		snap = newBookSnapshot(book, now)
		bookSnapshots[collection] = snap
	}
	switch k {
	case "asks":
		return snap.Asks
	case "bids":
		return snap.Bids
	case "timestamp":
		return snap.Timestamp
	case "datetime":
		return snap.Datetime
	case "nonce":
		return snap.Nonce
	case "symbol":
		return snap.Symbol
	case "outcome":
		return snap.Outcome
	case "outcomeId":
		return snap.OutcomeId
	case "market":
		return snap.Market
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
	return ccxt.IsTrue(a)
}

func EvalTruthy(val interface{}) bool {
	return ccxt.EvalTruthy(val)
}

func IsInteger(value interface{}) bool {
	return ccxt.IsInteger(value)
}

func GetValue(collection interface{}, key interface{}) interface{} {
	return snapshotOrderBook(collection, key, ccxt.GetValue(collection, key))
}

func Multiply(a, b interface{}) interface{} {
	return ccxt.Multiply(a, b)
}

func Divide(a, b interface{}) interface{} {
	return ccxt.Divide(a, b)
}

func Subtract(a, b interface{}) interface{} {
	return ccxt.Subtract(a, b)
}

func GetArrayLength(value interface{}) int {
	return ccxt.GetArrayLength(value)
}

func IsGreaterThan(a, b interface{}) bool {
	return ccxt.IsGreaterThan(a, b)
}

func IsLessThan(a, b interface{}) bool {
	return ccxt.IsLessThan(a, b)
}

func IsGreaterThanOrEqual(a, b interface{}) bool {
	return ccxt.IsGreaterThanOrEqual(a, b)
}

func IsLessThanOrEqual(a, b interface{}) bool {
	return ccxt.IsLessThanOrEqual(a, b)
}

func Mod(a, b interface{}) interface{} {
	return ccxt.Mod(a, b)
}

func IsEqual(a, b interface{}) bool {
	return ccxt.IsEqual(a, b)
}

func NormalizeAndConvert(a, b interface{}) (reflect.Value, reflect.Value, bool) {
	return ccxt.NormalizeAndConvert(a, b)
}

func ToFloat64(v interface{}) float64 {
	return ccxt.ToFloat64(v)
}

func Increment(a interface{}) interface{} {
	return ccxt.Increment(a)
}

func Decrement(a interface{}) interface{} {
	return ccxt.Decrement(a)
}

func Negate(a interface{}) interface{} {
	return ccxt.Negate(a)
}

func UnaryPlus(a interface{}) interface{} {
	return ccxt.UnaryPlus(a)
}

func PlusEqual(a, value interface{}) interface{} {
	return ccxt.PlusEqual(a, value)
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
	return ccxt.IsBool(v)
}

func IsDictionary(v interface{}) bool {
	return ccxt.IsDictionary(v)
}

func IsString(v interface{}) bool {
	return ccxt.IsString(v)
}

func IsFunction(v interface{}) bool {
	return ccxt.IsFunction(v)
}

func IsNumber(v interface{}) bool {
	return ccxt.IsNumber(v)
}

func IsObject(v interface{}) bool {
	return ccxt.IsObject(v)
}

func ToLower(v interface{}) string {
	return ccxt.ToLower(v)
}

func ToUpper(v interface{}) string {
	return ccxt.ToUpper(v)
}

func IsInt(v interface{}) bool {
	return ccxt.IsInt(v)
}

func MathFloor(v interface{}) float64 {
	return ccxt.MathFloor(v)
}

func MathCeil(v interface{}) float64 {
	return ccxt.MathCeil(v)
}

func MathRound(v interface{}) float64 {
	return ccxt.MathRound(v)
}

func StartsWith(v interface{}, prefix interface{}) bool {
	return ccxt.StartsWith(v, prefix)
}

func EndsWith(v interface{}, suffix interface{}) bool {
	return ccxt.EndsWith(v, suffix)
}

func IndexOf(v interface{}, substr interface{}) int {
	return ccxt.IndexOf(v, substr)
}

func Trim(v interface{}) string {
	return ccxt.Trim(v)
}

func Contains(v interface{}, substr interface{}) bool {
	return ccxt.Contains(v, substr)
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
	return ccxt.ObjectValues(v)
}

func JsonParse(jsonStr2 interface{}) interface{} {
	return ccxt.JsonParse(jsonStr2)
}

func IsArray(v interface{}) bool {
	return ccxt.IsArray(v)
}

func Shift(slice interface{}) (interface{}, interface{}) {
	return ccxt.Shift(slice)
}

func Reverse(slice interface{}) {
	ccxt.Reverse(slice)
}

func Replace(input interface{}, old interface{}, new interface{}) string {
	return ccxt.Replace(input, old, new)
}

func PadEnd(input interface{}, length int, padStr interface{}) string {
	return ccxt.PadEnd(input, length, padStr)
}

func PadStart(input interface{}, length int, padStr interface{}) string {
	return ccxt.PadStart(input, length, padStr)
}

func DateNow() string {
	return ccxt.DateNow()
}

func GetLength(v interface{}) int {
	return ccxt.GetLength(v)
}

func GetArg(v []interface{}, index int, def interface{}) interface{} {
	return ccxt.GetArg(v, index, def)
}

func Ternary(cond bool, whenTrue interface{}, whenFalse interface{}) interface{} {
	return ccxt.Ternary(cond, whenTrue, whenFalse)
}

func IsInstance(value interface{}, typ interface{}) bool {
	return ccxt.IsInstance(value, typ)
}

func Slice(str2 interface{}, idx1 interface{}, idx2 interface{}) string {
	return ccxt.Slice(str2, idx1, idx2)
}

func promiseAll(tasksInterface interface{}) <-chan interface{} {
	return ccxt.PromiseAll(tasksInterface)
}

func ParseInt(number interface{}) int64 {
	return ccxt.ParseInt(number)
}

func mathMin(a, b interface{}) interface{} {
	return ccxt.MathMin(a, b)
}

func mathMax(a, b interface{}) interface{} {
	return ccxt.MathMax(a, b)
}

func mathAbs(a interface{}) interface{} {
	return ccxt.MathAbs(a)
}

func parseInt(input interface{}) interface{} {
	return ccxt.ParseInt(input)
}

func ParseFloat(input interface{}) interface{} {
	return ccxt.ParseFloat(input)
}

func ParseJSON(input interface{}) interface{} {
	return ccxt.ParseJSON(input)
}

func OpNeg(value interface{}) interface{} {
	return ccxt.OpNeg(value)
}

func JsonStringify(obj interface{}) string {
	return ccxt.JsonStringify(obj)
}

func Remove(dict interface{}, key interface{}) {
	ccxt.Remove(dict, key)
}

func Capitalize(s string) string {
	return ccxt.Capitalize(s)
}

func CallInternalMethod(cache *sync.Map, itf interface{}, name2 string, args ...interface{}) <-chan interface{} {
	return ccxt.CallInternalMethod(cache, itf, name2, args...)
}

func PanicOnError(msg interface{}) {
	// Print("Inside panic onError: " + ToString(msg))
	ccxt.PanicOnError(msg)
}

func getCallerName() string {
	return ccxt.GetCallerName()
}

func setDefaults(p interface{}) {
	ccxt.SetDefaults(p)
}

func Print(v ...interface{}) {
	fmt.Println(v...)
}

func ReturnPanicError(ch chan interface{}) {
	ccxt.ReturnPanicError(ch)
}

func callDynamically(name2 interface{}, args ...interface{}) <-chan interface{} {
	panic("not implemented")
}
