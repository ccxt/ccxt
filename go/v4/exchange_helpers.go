package ccxt

import (
	"encoding/json"
	"fmt"
	"math"
	"reflect"
	"runtime"
	"runtime/debug"
	"strconv"
	"strings"
	"sync"
)

// These helpers lock nothing: every map they touch is goroutine-local or owned by one
// goroutine (the markets book owner or the ws dispatch loop), and no writer anywhere
// takes a helper lock, so a read-side mutex was never a synchronization edge.

func Add(a any, b any) any {
	a = derefScalar(a)
	b = derefScalar(b)
	if (a == nil) || (b == nil) {
		return nil
	}
	switch aType := a.(type) {
	case int:
		if bType, ok := b.(int); ok {
			return aType + bType // Add as integers
		}
		aFloat := ToFloat64(a)
		bFloat := ToFloat64(b)

		res := aFloat + bFloat

		if IsInteger(res) {
			return ParseInt(res)
		}
		return res
	case int64:
		if bType, ok := b.(int64); ok {
			return aType + bType // Add as integers
		}
		aFloat := ToFloat64(a)
		bFloat := ToFloat64(b)

		res := aFloat + bFloat

		if IsInteger(res) {
			return ParseInt(res)
		}
		return res

	case float64:
		bType := ToFloat64(b)
		if bType == math.NaN() {
			return nil
		}
		res := aType + bType
		if IsInteger(res) {
			return ParseInt(res)
		}
		return res
	case string:
		if bType, ok := b.(string); ok {
			return aType + bType // Concatenate as strings
		}
	}

	return nil
}

func IsInteger(value any) bool {
	value = derefScalar(value)
	switch v := value.(type) {
	case int, int8, int16, int32, int64:
		return true
	case uint, uint8, uint16, uint32, uint64:
		return true
	case float32, float64:
		// Check if the float has no fractional part
		return v == math.Trunc(derefScalar(v).(float64))
	default:
		// // Handle other numeric types, including when value is a pointer to an int type
		// val := reflect.ValueOf(value)
		// if val.Kind() == reflect.Ptr {
		// 	elem := val.Elem()
		// 	if elem.IsValid() && elem.Kind() >= reflect.Int && elem.Kind() <= reflect.Float64 {
		// 		return float64(elem.Float()) == math.Trunc(elem.Float())
		// 	}
		// }
		return false
	}
}

// GetValue returns a plain value: the container may store typed pointers emitted
// by the Safe* accessors, and callers compare/type-switch on the result.
func GetValue(collection any, key any) any {
	return derefScalar(getValue(collection, key))
}

// MapTyped converts a boxed dictionary into a plain map: a map passes through, anything
// else (including nil) reads as a nil map, exactly what the boxed value answered through
// GetValue/ObjectKeys/InOp. The printer emits it for a local whose TypeScript type proves
// the box holds the market dictionary.
func MapTyped(v any) map[string]any {
	v = derefScalar(v)
	if v == nil {
		return nil
	}
	if asMap, ok := v.(map[string]any); ok {
		return asMap
	}
	return nil
}

// MarketTyped is MapTyped for market rows: every top-level value reads exactly as GetValue
// would return it (no typed pointer, no typed-nil container), so `row["k"]` equals
// GetValue(row, "k"). A row still holding such a value is copied, never written in place.
func MarketTyped(v any) map[string]any {
	row := MapTyped(v)
	var plain map[string]any
	for key, value := range row {
		if marketValueIsPlain(value) {
			continue
		}
		if plain == nil {
			plain = make(map[string]any, len(row))
			for k, e := range row {
				plain[k] = e
			}
		}
		plain[key] = derefScalar(value)
	}
	if plain != nil {
		return plain
	}
	return row
}

// CurrencyTyped is MarketTyped for currency rows: SafeCurrencyStructure returns its fresh row through
// it, and Currency()/SafeCurrency() wrap their result, so `row["k"]` equals GetValue(row, "k").
func CurrencyTyped(v any) map[string]any {
	return MarketTyped(v)
}

func marketValueIsPlain(v any) bool {
	switch p := v.(type) {
	case *string, *int64, *float64, *bool, *int, *[]string, *[]any, *map[string]any, *any:
		return false
	case map[string]any:
		return p != nil
	case []any:
		return p != nil
	case []string:
		return p != nil
	}
	return true
}

// ListTyped is MapTyped's slice twin: []any passes through, []string is boxed element-wise,
// and absent (nil) answers a nil slice.
func ListTyped(v any) []any {
	v = derefScalar(v)
	if v == nil {
		return nil
	}
	if asSlice, ok := v.([]any); ok {
		return asSlice
	}
	if asStrings, ok := v.([]string); ok {
		out := make([]any, len(asStrings))
		for i, item := range asStrings {
			out[i] = item
		}
		return out
	}
	return nil
}

func getValue(collection any, key any) any {
	collection = derefScalar(collection)
	key = derefScalar(key)

	if collection == nil || key == nil {
		return nil
	}

	keyNum := -1
	keyStr, isStr := derefScalar(key).(string)
	if !isStr {
		keyNum64 := ParseInt(key)
		if keyNum64 == math.MinInt64 {
			return nil
		}
		keyNum = int(keyNum64)
	}

	switch v := collection.(type) {
	case map[string]any:
		if !isStr {
			return nil
		}
		val, ok := v[keyStr]
		if ok {
			return val
		}
	case map[string]*Future:
		if future, ok := v[keyStr]; isStr && ok && future != nil {
			return future
		}
	case map[string]map[string]any:
		// the ohlcv book is two-level: a symbol key answers its timeframe map
		if !isStr {
			return nil
		}
		val, ok := v[keyStr]
		if ok {
			return val
		}
	case []any:
		if keyNum >= 0 && keyNum < len(v) {
			return v[keyNum]
		}
	case []string:
		if keyNum >= 0 && keyNum < len(v) {
			return v[keyNum]
		}
	case []int64:
		if keyNum >= 0 && keyNum < len(v) {
			return v[keyNum]
		}
	case []float64:
		if keyNum >= 0 && keyNum < len(v) {
			return v[keyNum]
		}
	case []bool:
		if keyNum >= 0 && keyNum < len(v) {
			return v[keyNum]
		}
	case []int:
		if keyNum >= 0 && keyNum < len(v) {
			return v[keyNum]
		}
	case string:
		if keyNum >= 0 && keyNum < len(v) {
			return string(v[keyNum])
		}
	case map[string]map[string]*ArrayCacheByTimestamp:
		if keyStr != "" {
			if innerMap, ok := v[keyStr]; ok {
				return innerMap
			}
		}
	case map[string]*ArrayCacheByTimestamp:
		if keyStr != "" {
			if val, ok := v[keyStr]; ok {
				return val
			}
		}
	case map[string]*ArrayCache:
		if keyStr != "" {
			if val, ok := v[keyStr]; ok {
				return val
			}
		}
	case map[string]*ArrayCacheBySymbolBySide:
		if keyStr != "" {
			if val, ok := v[keyStr]; ok {
				return val
			}
		}
	default:
		// In typescript OrderBookSide extends Array, so some work arounds are made so that the expected behaviour is achieved in the transpiled code
		if obs, ok := collection.(IOrderBookSide); ok {
			return (obs.GetData())[keyNum]
		}
		// the ws caches extend Array in typescript too, so the transpiled code
		// indexes them positionally (cache[0]); without this the struct-reflect
		// fallback below panics on the non-string key
		if cache, ok := collection.(IArrayCache); ok {
			data := cache.ToArray()
			if keyNum >= 0 && keyNum < len(data) {
				return data[keyNum]
			}
			return nil
		}
	}

	// this is needed in checkRequiredCredentials or alike
	reflectValue := reflect.ValueOf(collection)

	if reflectValue.Kind() == reflect.Ptr {
		reflectValue = reflectValue.Elem()
	}
	if reflectValue.Kind() == reflect.Struct {
		stringKey := derefScalar(key).(string)
		stringKeyCapitalized := Capitalize(stringKey)
		field := reflectValue.FieldByName(stringKey)

		fieldCapitalized := reflectValue.FieldByName(stringKeyCapitalized)
		if fieldCapitalized.IsValid() {
			return fieldCapitalized.Interface()
		}

		if field.IsValid() {
			return field.Interface()
		}

		return nil
	}

	switch reflectValue.Kind() {
	case reflect.Slice, reflect.Array:
		// Handle slice or array: key should be an integer index.
		index2 := ParseInt(key)
		if index2 == math.MinInt64 {
			return nil // Key is not an int, invalid index
		}
		index := int(index2)
		if index < 0 || index >= reflectValue.Len() {
			return nil // Index out of bounds
		}
		return reflectValue.Index(index).Interface()

	case reflect.Map:
		// Handle map: key needs to be appropriate for the map
		keyStr, ok := key.(string)
		if !ok {
			return nil // Key is not a string, invalid key
		}
		reflectKeyValue := reflect.ValueOf(keyStr)
		if reflectValue.MapIndex(reflectKeyValue).IsValid() {
			return reflectValue.MapIndex(reflectKeyValue).Interface()
		}
		return nil

	default:
		// Type not supported
		return nil
	}
}

type Dict map[string]any

// GetArrayLength returns the length of various array or slice types or string length.
func GetArrayLength(value any) int {
	value = derefScalar(value)
	if value == nil {
		return 0
	}

	switch v := value.(type) {
	case [][]any: // TODO: double/triple arrays of all the types
		return len(v)
	case []any:
		return len(v)
	case []string:
		return len(v)
	case []int64:
		return len(v)
	case []float64:
		return len(v)
	case []bool:
		return len(v)
	case []int:
		return len(v)
	case []map[string]any:
		return len(v)
	case string:
		return len(v) // should we do it here?
	case IOrderBookSide:
		return v.Len()
	case IArrayCache:
		return len(v.ToArray())
	case any:
		if array, ok := value.([]any); ok {
			return len(array)
		}
		// handle interface {}(*interface {}) *[]interface {}
		if arrayPtr, ok := value.(*[]any); ok {
			return len(*arrayPtr)
		}

		if interfacePtr, ok := value.(*any); ok {
			if array, ok := (*interfacePtr).([]any); ok {
				return len(array)
			}
			if arrayPtr, ok := (*interfacePtr).(*[]any); ok {
				return len(*arrayPtr)
			}
		}
	default:
		// In typescript OrderBookSide extends Array, so some work arounds are made so that the expected behaviour is achieved in the transpiled code
		if obs, ok := value.(IOrderBookSide); ok {
			return obs.Len()
		}
		// Check for IArrayCache in default case
		if cache, ok := value.(IArrayCache); ok {
			return len(cache.ToArray())
		}
	}

	// val := reflect.ValueOf(value)

	// switch val.Kind() {
	// case reflect.Slice, reflect.Array:
	// 	return val.Len()
	// case reflect.String:
	// 	return val.Len()
	// case reflect.Map:
	// 	// Specific check for a map type similar to List<dict> in C#
	// 	if _, ok := value.(Dict); ok {
	// 		return len(value.(Dict))
	// 	}
	// }

	return 0
}

// aVal, bVal, ok := NormalizeAndConvert(a, b)
// if !ok {
// 	return false
// }

// switch aVal.Kind() {
// case reflect.Int, reflect.Int64:
// 	return aVal.Int() > bVal.Int()
// case reflect.Float64:
// 	return aVal.Float() > bVal.Float()
// case reflect.String:
// 	return aVal.String() > bVal.String()
// default:
// 	return false
// }
// }

// IsEqual checks for equality of a and b with dynamic type support
func IsEqual(a, b any) bool {
	a = derefScalar(a)
	b = derefScalar(b)
	if a == nil && b == nil {
		return true
	}

	if (a == true && b == false) || (a == false && b == true) {
		return false
	}

	if (a == true && b == true) || (a == false && b == false) {
		return true
	}

	// // aVal, bVal, ok := NormalizeAndConvert(a, b)
	// if !ok {
	// 	return false
	// }

	switch aVal := a.(type) {
	case int:
		switch bVal := b.(type) {
		case int:
			return aVal == bVal
		case int64:
			return int64(aVal) == bVal
		case float64:
			return float64(aVal) == bVal
		}
	case uint8:
		switch bVal := b.(type) {
		case uint8:
			return aVal == bVal
		case int64:
			return int64(aVal) == bVal
		case float64:
			return float64(aVal) == bVal
		}
	case int64:
		switch bVal := b.(type) {
		case int:
			return aVal == int64(bVal)
		case int64:
			return aVal == bVal
		case float64:
			return float64(aVal) == bVal
		}
	case float64:
		switch bVal := b.(type) {
		case int:
			return aVal == float64(bVal)
		case int64:
			return aVal == float64(bVal)
		case float64:
			return aVal == bVal
		}
	case string:
		if bVal, ok := b.(string); ok {
			return aVal == bVal
		}
	}

	if a == nil || b == nil {
		return false
	}

	// If types don't match or aren't handled, return false
	return false

	// switch aVal.Kind() {
	// case reflect.Int, reflect.Int64:
	// 	return aVal.Int() == bVal.Int()
	// case reflect.Float64:
	// 	return aVal.Float() == bVal.Float()
	// case reflect.String:
	// 	return aVal.String() == bVal.String()
	// default:
	// 	return false
	// }
}

func ToFloat64(v any) float64 {
	v = derefScalar(v)
	var result float64 = math.NaN()
	val := reflect.ValueOf(v)
	switch val.Kind() {
	case reflect.Int, reflect.Int64:
		result = float64(val.Int())
	case reflect.Float64:
		result = val.Float()
	case reflect.String:
		result, err := strconv.ParseFloat(val.String(), 64)
		if err == nil {
			return result
		}
		// result could be changed
		result = math.NaN()
	}
	return result
}

// func AppendToArray(slicePtr *any, element any) {
// 	array := (*slicePtr).([]any)
// 	*slicePtr = append(array, element)
// }

func AppendToArray(slicePtr *any, element any) {
	// // Check if slicePtr is nil, which indicates we received a function return value
	// // In this case, we need to handle it differently
	// if slicePtr == nil {
	// 	// This shouldn't happen with proper usage, but we'll handle it gracefully
	// 	return
	// }

	switch array := (*slicePtr).(type) {
	case []any:
		*slicePtr = append(array, element)
	case []string:
		if strElement, ok := element.(string); ok {
			*slicePtr = append(array, strElement)
		} else {
			// Handle the case where the element is not a string if needed
			// fmt.Println("Error: element is not a string")
		}
	case any:
		if array, ok := array.([]any); ok {
			*slicePtr = append(array, element)
		}
	default:
		// In typescript OrderBookSide extends Array, so some work arounds are made so that the expected behaviour is achieved in the transpiled code
		if obs, ok := (*slicePtr).(IOrderBookSide); ok {
			*slicePtr = append(obs.GetData(), element.([]any))
		}
		// fmt.Println("Error: Unsupported slice type")
	}
}

// without reflection
func AddElementToObject(arrayOrDict any, stringOrInt any, value any) {
	stringOrInt = derefScalar(stringOrInt)
	isUndefined := value == nil
	value = derefScalar(value)

	switch obj := arrayOrDict.(type) {
	case []string:
		if index, ok := stringOrInt.(int); ok {
			if index >= 0 && index < len(obj) {
				obj[index] = fmt.Sprintf("%v", value)
				// return nil
			} else {
				// return fmt.Errorf("index out of range")
			}
		} else {
			// return fmt.Errorf("invalid key type for slice: expected int")
		}
	case []int:
		if index, ok := stringOrInt.(int); ok {
			if index >= 0 && index < len(obj) {
				if v, ok := value.(int); ok {
					obj[index] = v
					// return nil
				} else {
					// return fmt.Errorf("value type mismatch for slice of int")
				}
			} else {
				// return fmt.Errorf("index out of range")
			}
		} else {
			// return fmt.Errorf("invalid key type for slice: expected int")
		}
	case []any:
		if index, ok := stringOrInt.(int); ok {
			if index >= 0 && index < len(obj) {
				obj[index] = value
				// return nil
			} else {
				// return fmt.Errorf("index out of range")
			}
		} else {
			// return fmt.Errorf("invalid key type for slice: expected int")
		}
	case []int64:
		if index, ok := stringOrInt.(int); ok {
			if index >= 0 && index < len(obj) {
				if v, ok := value.(int64); ok {
					obj[index] = v
					// return nil
				} else {
					// return fmt.Errorf("value type mismatch for slice of int64")
				}
			} else {
				// return fmt.Errorf("index out of range")
			}
		} else {
			// return fmt.Errorf("invalid key type for slice: expected int")
		}
	case []float64:
		if index, ok := stringOrInt.(int); ok {
			if index >= 0 && index < len(obj) {
				if v, ok := value.(float64); ok {
					obj[index] = v
					// return nil
				} else {
					// return fmt.Errorf("value type mismatch for slice of float64")
				}
			} else {
				// return fmt.Errorf("index out of range")
			}
		} else {
			// return fmt.Errorf("invalid key type for slice: expected int")
		}
	case map[string]any:
		if obj == nil {
			return // a typed-nil map is absent: a no-op, like untyped nil
		}
		if key, ok := stringOrInt.(string); ok {
			obj[key] = value
			// return nil
		} else {
			// return fmt.Errorf("invalid key type for map: expected string")
		}
	case map[string]map[string]any:
		// the ohlcv book is two-level: a symbol key holds its timeframe map
		if obj == nil {
			return // a typed-nil map is absent: a no-op, like untyped nil
		}
		book, ok := value.(map[string]any)
		if !ok {
			return // a book slot only takes a book, like the helper's unsupported-type no-op
		}
		if key, ok := stringOrInt.(string); ok {
			obj[key] = book
		}
	case map[string]map[string]*ArrayCacheByTimestamp:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(map[string]*ArrayCacheByTimestamp); ok {
				obj[key] = v
			} else if _, ok := value.(map[string]any); ok {
				// assume we want a new map[string]*ArrayCacheByTimestamp
				cache := make(map[string]*ArrayCacheByTimestamp)
				obj[key] = cache
			} else {
				// return fmt.Errorf("value type mismatch for map[string]map[string]*ArrayCacheByTimestamp")
			}
		}
	case map[string]*ArrayCacheByTimestamp:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(*ArrayCacheByTimestamp); ok {
				obj[key] = v
			} else {
				// return fmt.Errorf("value type mismatch for map[string]*ArrayCacheByTimestamp")
			}
		}
	case map[string]*ArrayCache:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(*ArrayCache); ok {
				obj[key] = v
			} else {
				// return fmt.Errorf("value type mismatch for map[string]*ArrayCache")
			}
		}
	case map[string]*ArrayCacheBySymbolById:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(*ArrayCacheBySymbolById); ok {
				obj[key] = v
			} else {
				// return fmt.Errorf("value type mismatch for map[string]*ArrayCacheBySymbolById")
			}
		}
	case map[string]*ArrayCacheBySymbolBySide:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(*ArrayCacheBySymbolBySide); ok {
				obj[key] = v
			} else {
				// return fmt.Errorf("value type mismatch for map[string]*ArrayCacheBySymbolBySide")
			}
		}
	default:
		// Handle OrderBookInterface types using type assertion
		if orderbook, ok := arrayOrDict.(OrderBookInterface); ok {
			// Use reflection to dynamically set the field
			val := reflect.ValueOf(orderbook)
			// If it's an interface, get the underlying value
			if val.Kind() == reflect.Interface {
				val = val.Elem()
			}
			// If it's a pointer, get the element
			if val.Kind() == reflect.Ptr {
				val = val.Elem()
			}
			field := val.FieldByName(Capitalize(derefScalar(stringOrInt).(string))) // do remove reflection here??
			if field.IsValid() && field.CanSet() {
				if value != nil {
					// Convert value to the correct type
					valueVal := reflect.ValueOf(value)
					fieldType := field.Type()
					if fieldType.Kind() == reflect.Ptr && !valueVal.Type().ConvertibleTo(fieldType) && valueVal.Type().ConvertibleTo(fieldType.Elem()) {
						// scalar into a pointer field, e.g. int64 -> OrderBook.Timestamp *int64
						ptr := reflect.New(fieldType.Elem())
						ptr.Elem().Set(valueVal.Convert(fieldType.Elem()))
						field.Set(ptr)
					} else if valueVal.Type().ConvertibleTo(fieldType) {
						field.Set(valueVal.Convert(fieldType))
					}
				} else if isUndefined {
					// a literal undefined clears the field; a typed-nil Safe* result stays a no-op
					field.Set(reflect.Zero(field.Type()))
				}
			}
		}
		// return fmt.Errorf("unsupported type: %T", arrayOrDict)
	}
}

func InOp(dict any, key any) bool {
	dict = derefScalar(dict)
	key = derefScalar(key)

	if dict == nil {
		return false
	}
	if key == nil {
		return false
	}

	if IsNumber(key) {
		return false
	}

	switch v := dict.(type) {
	case map[string]any:
		_, ok := v[key.(string)]
		if ok {
			return true
		}
	case map[string]map[string]any:
		// the ohlcv book is two-level: presence of the symbol key answers the book
		_, ok := v[key.(string)]
		if ok {
			return true
		}
	case map[string]*Future:
		_, ok := v[key.(string)]
		if ok {
			return true
		}
	case map[string]*WSClient:
		_, ok := v[key.(string)]
		if ok {
			return true
		}
	case OrderBookInterface:
		// WsOrderBook is a typed struct, not a map - without this case every key-presence
		// check on ws orderbooks is false and shared structure tests fail with
		// "key is missing from structure", see the java twin
		// https://github.com/ccxt/ccxt/pull/29596
		if keyStr, ok := key.(string); ok {
			switch keyStr {
			case "asks", "bids", "timestamp", "datetime", "nonce":
				return true
			case "outcome", "outcomeId", "market":
				return v.GetValue("outcome", nil) != nil
			case "symbol":
				return v.GetValue("outcome", nil) == nil
			}
		}
	case map[string]map[string]*ArrayCacheByTimestamp:
		if keyStr, ok2 := derefScalar(key).(string); ok2 {
			_, ok3 := v[keyStr]
			if ok3 {
				return true
			}
		}
	case map[string]*ArrayCacheByTimestamp:
		if keyStr, ok2 := derefScalar(key).(string); ok2 {
			_, ok3 := v[keyStr]
			if ok3 {
				return true
			}
		}
	case map[string]*ArrayCache:
		if keyStr, ok2 := derefScalar(key).(string); ok2 {
			_, ok3 := v[keyStr]
			if ok3 {
				return true
			}
		}
	case map[string]*ArrayCacheBySymbolBySide:
		if keyStr, ok2 := derefScalar(key).(string); ok2 {
			_, ok3 := v[keyStr]
			if ok3 {
				return true
			}
		}
	}

	return false
	// dictVal := reflect.ValueOf(dict)

	// // Ensure that the provided dict is a map
	// if dictVal.Kind() != reflect.Map {
	// 	return false
	// }

	// keyVal := reflect.ValueOf(key)

	// // Check if the map has the provided key todo:debug here
	// if dictVal.MapIndex(keyVal).IsValid() {
	// 	return true
	// }
	// return false
}

func GetIndexOf(str any, target any) int {
	str = derefScalar(str)
	target = derefScalar(target)
	switch v := str.(type) {
	case []string:
		t, ok := target.(string)
		if !ok {
			return -1
		}
		for i, s := range v {
			if s == t {
				return i
			}
		}
	case []int:
		t, ok := target.(int)
		if !ok {
			return -1
		}
		for i, n := range v {
			if n == t {
				return i
			}
		}
	case string:
		t, ok := target.(string)
		if !ok {
			return -1
		}
		return strings.Index(v, t)
	}

	return -1
}

// IsString checks if the input is a string
func IsString(v any) bool {
	v = derefScalar(v)
	if v == nil {
		return false
	}
	_, ok := v.(string)
	return ok
}

// IsFunction checks if the input is a function
func IsFunction(v any) bool {
	v = derefScalar(v)
	if v == nil {
		return false
	}
	return reflect.TypeOf(v).Kind() == reflect.Func
}

func IsNumber(v any) bool {
	v = derefScalar(v)
	if v == nil {
		return false
	}
	switch v.(type) {
	case int, int8, int16, int32, int64:
		return true
	case uint, uint8, uint16, uint32, uint64:
		return true
	case float32, float64:
		return true
	default:
		return false
	}
}

// IsInt checks if the input is an integer
// func IsInt(v any) bool {
// 	switch v.(type) {
// 	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
// 		return true
// 	default:
// 		return false
// 	}
// }

// StartsWith checks if the string starts with the specified prefix
func StartsWith(v any, prefix any) bool {
	v = derefScalar(v)
	prefix = derefScalar(prefix)
	if str, ok := v.(string); ok {
		prefixStr := ToString(prefix)
		return strings.HasPrefix(str, prefixStr)
	}
	return false
}

// EndsWith checks if the string ends with the specified suffix
func EndsWith(v any, suffix any) bool {
	v = derefScalar(v)
	suffix = derefScalar(suffix)
	if str, ok := v.(string); ok {
		suffixStr := ToString(suffix)
		return strings.HasSuffix(str, suffixStr)
	}
	return false
}

// StringArg converts a dynamically passed required string argument; nil or any
// other type panics (ArgumentsRequired) instead of coercing
func StringArg(v any) string {
	switch value := v.(type) {
	case string:
		return value
	case *string:
		if value != nil {
			return *value
		}
	}
	panic(ArgumentsRequired(fmt.Sprintf("expected a string argument, got %T: %v", v, v)))
}

// BoolArg converts a dynamically passed required boolean argument; nil or any other type
// panics (ArgumentsRequired) instead of coercing
func BoolArg(v any) bool {
	switch value := v.(type) {
	case bool:
		return value
	case *bool:
		if value != nil {
			return *value
		}
	}
	panic(ArgumentsRequired(fmt.Sprintf("expected a boolean argument, got %T: %v", v, v)))
}

// Int64Arg converts a dynamically passed required integer argument; nil, a fraction or any
// other type panics (ArgumentsRequired) instead of coercing
func Int64Arg(v any) int64 {
	switch value := derefScalar(v).(type) {
	case int:
		return int64(value)
	case int32:
		return int64(value)
	case int64:
		return value
	case float64:
		if (value == math.Trunc(value)) && (math.Abs(value) < 9.2e18) {
			return int64(value)
		}
	}
	panic(ArgumentsRequired(fmt.Sprintf("expected an integer argument, got %T: %v", v, v)))
}

func ToString(v any) string {
	v = derefScalar(v)
	switch v := v.(type) {
	case string:
		return v
	case int, int8, int16, int32, int64:
		return fmt.Sprintf("%d", v)
	case uint, uint8, uint16, uint32, uint64:
		return fmt.Sprintf("%d", v)
	case float32, float64:
		convertedValue := ToFloat64(v)
		if convertedValue == math.Trunc(convertedValue) {
			return fmt.Sprintf("%d", int(convertedValue))
		}
		return fmt.Sprintf("%f", v)
	case bool:
		return fmt.Sprintf("%t", v)
	default:
		// Handle maps, slices, and functions using reflection
		val := reflect.ValueOf(v)
		switch val.Kind() {
		case reflect.Map:
			result := "{"
			for _, key := range val.MapKeys() {
				result += fmt.Sprintf("%v: %v, ", ToString(key.Interface()), ToString(val.MapIndex(key).Interface()))
			}
			if len(result) > 1 {
				result = result[:len(result)-2] // Remove trailing comma and space
			}
			result += "}"
			return result
		case reflect.Slice, reflect.Array:
			result := "["
			for i := 0; i < val.Len(); i++ {
				result += fmt.Sprintf("%v, ", ToString(val.Index(i).Interface()))
			}
			if len(result) > 1 {
				result = result[:len(result)-2] // Remove trailing comma and space
			}
			result += "]"
			return result
		case reflect.Func:
			return fmt.Sprintf("Function: %v", val.Type().String())
		default:
			return fmt.Sprintf("%v", v)
		}
	}
}

func Join(slice any, sep any) string {
	slice = derefScalar(slice)
	sep = derefScalar(sep)
	sepStr := ToString(sep)
	var strSlice []string

	switch v := slice.(type) {
	case []string:
		strSlice = v
	case []any:
		strSlice = joinElemStrings(v)
	default:
		return ""
	}

	return strings.Join(strSlice, sepStr)
}

// joinElemStrings is Join's per-element conversion of a []any (nil for a nil slice)
func joinElemStrings(v []any) []string {
	var strSlice []string
	for _, elem := range v {
		strSlice = append(strSlice, ToString(elem))
	}
	return strSlice
}

// joinListValue is the []string Join reads from a list box: nil only where the box itself is nil,
// the joined elements of a []any / []string, and an empty slice for every kind Join prints as ""
func joinListValue(value any) []string {
	if value == nil {
		return nil
	}
	switch v := derefScalar(value).(type) {
	case []string:
		if v == nil {
			return []string{}
		}
		return v
	case []any:
		if s := joinElemStrings(v); s != nil {
			return s
		}
	}
	return []string{}
}

// Split splits a string into a slice of substrings separated by a separator
func Split(str any, sep any) []string {
	str = derefScalar(str)
	sep = derefScalar(sep)
	strVal, ok := str.(string)
	if !ok {
		return nil
	}

	sepStr := ToString(sep)
	return strings.Split(strVal, sepStr)
}

// ObjectKeys returns the keys of a map as a slice of strings
func ObjectKeys(v any) []string {
	v = derefScalar(v)

	if v == nil {
		return nil
	}

	if mapObject, ok := v.(map[string]any); ok {
		keys := make([]string, 0, len(mapObject))
		for key := range mapObject {
			keys = append(keys, key)
		}
		return keys
	}
	if futures, ok := v.(map[string]*Future); ok {
		keys := make([]string, 0, len(futures))
		for key := range futures {
			keys = append(keys, key)
		}
		return keys
	}
	return nil
	// val := reflect.ValueOf(v)
	// if val.Kind() != reflect.Map {
	// 	return nil
	// }

	// keys := val.MapKeys()
	// strKeys := make([]string, len(keys))
	// for i, key := range keys {
	// 	strKeys[i] = ToString(key.Interface())
	// }
	// return strKeys
}

func JsonParse(jsonStr2 any) any {
	jsonStr2 = derefScalar(jsonStr2)
	jsonStr := derefScalar(jsonStr2).(string)
	var result any
	err := json.Unmarshal([]byte(jsonStr), &result)
	if err != nil {
		return nil
	}
	return result
}

func IsArray(v any) bool {
	v = derefScalar(v)
	if v == nil {
		return false
	}
	switch v.(type) {
	case []any, [][]any:
		return true
	case IOrderBookSide:
		// js parity: orderbook sides are Array subclasses, so isArray is true;
		// GetArrayLength and SafeValue already special-case IOrderBookSide, this
		// predicate was the missing piece failing every ws orderbook structure
		// assert in the Go test lane
		return true
	case []map[string]any, ListCache:
		return true
	case []string, []bool:
		return true
	case []int, []int8, []int16, []int32, []int64, []float32, []float64, []uint, []uint8, []uint16, []uint32, []uint64:
		return true
	default:
		return false
		// kind := reflect.TypeOf(v).Kind()
		// return kind == reflect.Slice || kind == reflect.Array
	}
}

// Helper function to cast any to []any
func castToSlice(slice any) ([]any, bool) {
	val := reflect.ValueOf(slice)
	if val.Kind() != reflect.Slice {
		return nil, false
	}

	sliceVal := make([]any, val.Len())
	for i := 0; i < val.Len(); i++ {
		sliceVal[i] = val.Index(i).Interface()
	}
	return sliceVal, true
}

// derefScalar reproduces untyped-nil semantics for a maybe-undefined value that
// travels as a pointer: a nil pointer becomes untyped nil (absent), a non-nil one
// becomes the value it points at. Pointer types that are values in their own right
// (*PreciseStruct, *ArrayCache, ...) are returned untouched.
// DerefScalar is the exported form of derefScalar, used by transpiled code that
// stores a Safe* result in an `any` local and then compares it inline.
func DerefScalar(v any) any {
	return derefScalar(v)
}

func derefScalar(v any) any {
	switch p := v.(type) {
	case *string:
		if p == nil {
			return nil
		}
		return *p
	case *int64:
		if p == nil {
			return nil
		}
		return *p
	case *float64:
		if p == nil {
			return nil
		}
		return *p
	case *bool:
		if p == nil {
			return nil
		}
		return *p
	case *int:
		if p == nil {
			return nil
		}
		return *p
	case *[]string:
		if p == nil {
			return nil
		}
		return *p
	case *[]any:
		if p == nil {
			return nil
		}
		return *p
	case *map[string]any:
		if p == nil {
			return nil
		}
		return *p
	case *any:
		if p == nil {
			return nil
		}
		return derefScalar(*p)
	case map[string]any:
		// a typed-nil container local boxed into `any` reads as absent, like untyped nil
		if p == nil {
			return nil
		}
	case []any:
		if p == nil {
			return nil
		}
	case []string:
		if p == nil {
			return nil
		}
	}
	return v
}

func GetArg(v []any, index int, def any) any {
	if len(v) <= index {
		return def
	}
	val := v[index]

	if val == nil {
		return def
	}

	// Generated wrappers bind their optional arguments straight from the typed option
	// struct field (e.g. `var since *int64 = opts.Since`), so what arrives here is a
	// POINTER, not the plain value. A typed nil pointer boxed in `any` is not `== nil`,
	// so the check above cannot see it — unwrap explicitly and reproduce untyped-nil
	// semantics: nil pointer -> def, non-nil pointer -> the dereferenced value.
	if val = derefScalar(val); val == nil {
		return def
	}

	if res, ok := val.([]any); ok { // this is not working well with safeList(x, 'key', []) but works for fetchTrade(s, options any...)
		// if len(res) == 0 {
		// 	return def
		// }
		if res == nil {
			return def
		}
	}

	// Generated wrappers bind `symbols` as a typed `[]string`, and a nil `[]string` boxed
	// into `any` is not `== nil`, so the check at the top of this function cannot see it.
	// Unwrap it to an untyped nil so that a caller passing nil means "argument absent",
	// matching `undefined` in the TypeScript source these bodies are ported from.
	// Only nil is collapsed, never a non-nil empty slice: the empty-vs-absent decision
	// belongs to MarketSymbols/allowEmpty, which must still panic with ArgumentsRequired
	// for `allowEmpty: false` callers rather than silently substituting the default.
	if res, ok := val.([]string); ok {
		if res == nil {
			return def
		}
	}
	// a nil map box is an absent optional argument, like a nil slice
	if res, ok := val.(map[string]any); ok && res == nil {
		return def
	}

	// do we need this??
	// if IsNil(val) { // check  https://blog.devtrovert.com/p/go-secret-interface-nil-is-not-nil
	// 	return def
	// }

	return val
}

// Typed twins of GetArg: omitted, nil or a nil *T box -> def; a T (or *T) box -> the value.
// Unlike GetArg, any other box panics at the bind site, since no generated caller passes one.
func goArgValue(args []any, index int) (any, bool) {
	if len(args) <= index {
		return nil, false
	}
	val := args[index]
	if val == nil {
		return nil, false
	}
	// GetArg's derefScalar step: a generated wrapper boxes the typed option field
	// (`opts.Since *int64`), a nil pointer means "argument absent"
	val = derefScalar(val)
	if val == nil {
		return nil, false
	}
	// GetArg also reads a nil []any / []string box as absent (dynamic calls pass one)
	if res, isList := val.([]any); isList && res == nil {
		return nil, false
	}
	if res, isStrings := val.([]string); isStrings && res == nil {
		return nil, false
	}
	if res, isMap := val.(map[string]any); isMap && res == nil {
		return nil, false
	}
	return val, true
}

// goArgIsEmptyList reports the empty []any / []string box a reflective call passes for omitted
// variadics; only scalar twins use it, since no scalar parameter takes a list.
func goArgIsEmptyList(val any) bool {
	if res, isList := val.([]any); isList {
		return len(res) == 0
	}
	if res, isStrings := val.([]string); isStrings {
		return len(res) == 0
	}
	return false
}

// goArgPanic reports an optionalArgs box a typed twin cannot carry.
func goArgPanic(twin string, index int, box any) {
	panic(ExchangeError(twin + "(): optionalArgs[" + ToString(index) + "] is " + fmt.Sprintf("%T", box) + ", which is not the declared type of this parameter"))
}

// GetArgMap returns the dictionary the caller passed, or def when the argument is absent.
func GetArgMap(args []any, index int, def map[string]any) map[string]any {
	val, ok := goArgValue(args, index)
	if !ok {
		return def
	}
	if res, isMap := val.(map[string]any); isMap {
		return res
	}
	goArgPanic("GetArgMap", index, val)
	return def
}

// GetArgAnySlice returns the list the caller passed, or def when the argument is absent.
func GetArgAnySlice(args []any, index int, def []any) []any {
	val, ok := goArgValue(args, index)
	if !ok {
		return def
	}
	if res, isList := val.([]any); isList {
		return res
	}
	goArgPanic("GetArgAnySlice", index, val)
	return def
}

// GetArgStringSlice returns the []string the caller passed, or def when the argument is absent.
func GetArgStringSlice(args []any, index int, def []string) []string {
	val, ok := goArgValue(args, index)
	if !ok {
		return def
	}
	if res, isStrs := val.([]string); isStrs {
		return res
	}
	// dynamic callers pass a []any of strings or non-nil *string (typed SafeString results)
	if list, isList := val.([]any); isList {
		res := make([]string, 0, len(list))
		for _, item := range list {
			str, isStr := derefScalar(item).(string)
			if !isStr {
				goArgPanic("GetArgStringSlice", index, val)
			}
			res = append(res, str)
		}
		return res
	}
	goArgPanic("GetArgStringSlice", index, val)
	return def
}

// GetArgString returns the string the caller passed, or def when the argument is absent.
func GetArgString(args []any, index int, def string) string {
	val, ok := goArgValue(args, index)
	if !ok {
		return def
	}
	if res, isStr := val.(string); isStr {
		return res
	}
	goArgPanic("GetArgString", index, val)
	return def
}

// GetArgBool returns the bool the caller passed, or def when the argument is absent.
func GetArgBool(args []any, index int, def bool) bool {
	val, ok := goArgValue(args, index)
	if !ok {
		return def
	}
	if res, isBool := val.(bool); isBool {
		return res
	}
	goArgPanic("GetArgBool", index, val)
	return def
}

// GetArgInt64 returns the integer the caller passed, or def when the argument is absent.
// The numeric widening keeps the argument classes the dynamic GetArg accepts for a `number`
// parameter (`int` from an untyped Go literal, `float64` from a JS-shaped caller) readable.
func GetArgInt64(args []any, index int, def int64) int64 {
	val, ok := goArgValue(args, index)
	if !ok {
		return def
	}
	switch res := val.(type) {
	case int64:
		return res
	case int:
		return int64(res)
	case int32:
		return int64(res)
	case int16:
		return int64(res)
	case int8:
		return int64(res)
	case uint:
		return int64(res)
	case uint32:
		return int64(res)
	case uint64:
		return int64(res)
	case float64:
		return int64(res)
	case float32:
		return int64(res)
	}
	goArgPanic("GetArgInt64", index, val)
	return def
}

// GetArgStringPtr returns the caller's pointer (or a fresh one over the caller's value), so the
// local keeps the "absent is nil" representation the façade's `Timeframe *string` field uses.
func GetArgStringPtr(args []any, index int, def *string) *string {
	if len(args) <= index {
		return def
	}
	val := args[index]
	if (val == nil) || goArgIsEmptyList(val) {
		return def
	}
	if res, isPtr := val.(*string); isPtr {
		if res == nil {
			return def
		}
		return res
	}
	// A typed nil pointer is an omitted argument.
	if val = derefScalar(val); val == nil {
		return def
	} else {
		if res, isStr := val.(string); isStr {
			return &res
		}
	}
	goArgPanic("GetArgStringPtr", index, args[index])
	return def
}

// GetArgInt64Ptr is GetArgStringPtr for an integer parameter (`since` / `limit`).
func GetArgInt64Ptr(args []any, index int, def *int64) *int64 {
	if len(args) <= index {
		return def
	}
	val := args[index]
	if (val == nil) || goArgIsEmptyList(val) {
		return def
	}
	if res, isPtr := val.(*int64); isPtr {
		if res == nil {
			return def
		}
		return res
	}
	// A typed nil pointer is an omitted argument.
	if val = derefScalar(val); val == nil {
		return def
	} else {
		switch res := val.(type) {
		case int64:
			return &res
		case int:
			num := int64(res)
			return &num
		case int32:
			num := int64(res)
			return &num
		case uint:
			num := int64(res)
			return &num
		case uint32:
			num := int64(res)
			return &num
		case uint64:
			num := int64(res)
			return &num
		case float64:
			num := int64(res)
			return &num
		case float32:
			num := int64(res)
			return &num
		}
	}
	goArgPanic("GetArgInt64Ptr", index, args[index])
	return def
}

// Int64PtrTyped stores an integer write (literal, mathMin/mathMax result, *int64) into a *int64
// local; absent stays a nil pointer.
func Int64PtrTyped(v any) *int64 {
	res := GetArgInt64Ptr([]any{v}, 0, nil)
	if res == nil {
		return nil
	}
	num := *res
	return &num
}

// GetArgFloat64Ptr is GetArgStringPtr for a `number` parameter (`price`, `amount`).
func GetArgFloat64Ptr(args []any, index int, def *float64) *float64 {
	if len(args) <= index {
		return def
	}
	val := args[index]
	if (val == nil) || goArgIsEmptyList(val) {
		return def
	}
	if res, isPtr := val.(*float64); isPtr {
		if res == nil {
			return def
		}
		return res
	}
	// A typed nil pointer is an omitted argument.
	if val = derefScalar(val); val == nil {
		return def
	} else {
		switch res := val.(type) {
		case float64:
			return &res
		case float32:
			num := float64(res)
			return &num
		case int64:
			num := float64(res)
			return &num
		case int:
			num := float64(res)
			return &num
		case int32:
			num := float64(res)
			return &num
		case uint:
			num := float64(res)
			return &num
		case uint32:
			num := float64(res)
			return &num
		case uint64:
			num := float64(res)
			return &num
		}
	}
	goArgPanic("GetArgFloat64Ptr", index, args[index])
	return def
}

// GetArgBoolPtr is GetArgStringPtr for a boolean parameter.
func GetArgBoolPtr(args []any, index int, def *bool) *bool {
	if len(args) <= index {
		return def
	}
	val := args[index]
	if (val == nil) || goArgIsEmptyList(val) {
		return def
	}
	if res, isPtr := val.(*bool); isPtr {
		if res == nil {
			return def
		}
		return res
	}
	// A typed nil pointer is an omitted argument.
	if val = derefScalar(val); val == nil {
		return def
	} else {
		if res, isBool := val.(bool); isBool {
			return &res
		}
	}
	goArgPanic("GetArgBoolPtr", index, args[index])
	return def
}

func IsInstance(value any, typ any) bool {
	// Get the reflect.Type of the value and the type

	if s, ok := value.(string); ok {
		isError := strings.HasPrefix(s, "panic")
		if isError {
			value := reflect.ValueOf(typ)
			funcName := ""
			if value.Kind() == reflect.Func {
				funcName = runtime.FuncForPC(value.Pointer()).Name()
				// Extract only the function name by removing the package path
				parts := strings.Split(funcName, ".")
				funcName = parts[len(parts)-1]
			}
			return strings.Contains(s, funcName)
		}
	}

	if ccxtErr, ok := value.(*Error); ok && ccxtErr != nil {
		return errorTypeIs(ccxtErr.Type, errorFuncName(typ))
	}

	valueType := reflect.TypeOf(value)
	typeType := reflect.TypeOf(typ)

	// Compare the two types
	return valueType == typeType
}

// errorFuncName is the last segment of an error constructor's name ("" for non-funcs).
func errorFuncName(typ any) string {
	value := reflect.ValueOf(typ)
	if value.Kind() != reflect.Func {
		return ""
	}
	parts := strings.Split(runtime.FuncForPC(value.Pointer()).Name(), ".")
	return parts[len(parts)-1]
}

// errorTypeIs reports whether typ is name or descends from it via ErrorParents.
func errorTypeIs(typ ErrorType, name string) bool {
	if name == "" {
		return false
	}
	if name == "BaseError" {
		return true
	}
	for current, seen := typ, 0; seen <= len(ErrorParents); seen++ {
		if string(current) == name {
			return true
		}
		parent, ok := ErrorParents[current]
		if !ok {
			return false
		}
		current = parent
	}
	return false
}

type Task func() any

func PromiseAll(tasksInterface any) <-chan AsyncResult[[]any] {
	return promiseAll(tasksInterface)
}

// promiseAll awaits every task; the first failing task by index fails the whole call.
func promiseAll(tasksInterface any) <-chan AsyncResult[[]any] {
	ch := make(chan AsyncResult[[]any])

	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)

		tasks, ok := tasksInterface.([]any)
		if !ok {
			ch <- AsyncResult[[]any]{} // not a slice of tasks: nil, as before
			return
		}

		results := make([]any, len(tasks))
		failures := make([]error, len(tasks))
		var wg sync.WaitGroup
		wg.Add(len(tasks))

		for i, task := range tasks {
			go func(i int, task any) {
				defer wg.Done()
				defer func() {
					if r := recover(); r != nil && r != "break" {
						failures[i] = RecoveredError(r)
					}
				}()
				results[i], failures[i] = awaitOutcome(task)
			}(i, task)
		}

		wg.Wait()
		for _, err := range failures {
			if err != nil {
				ch <- AsyncResult[[]any]{Err: err}
				return
			}
		}
		ch <- AsyncResult[[]any]{Value: results}
	}()

	return ch
}

// UntypedOutcome is one async result as reflective consumers see it: its value as any and its failure.
type UntypedOutcome interface {
	Untyped() any
	Failure() error
}

// TypedOutcome is an async result carrying a T: AsyncResult[T] and EndpointResult[T].
type TypedOutcome[T any] interface {
	Typed() T
	Failure() error
}

// PromiseAllTyped awaits same-T typed channels; the first failing task by index fails the whole call.
func PromiseAllTyped[T any, R TypedOutcome[T]](tasks ...<-chan R) <-chan AsyncResult[[]T] {
	ch := make(chan AsyncResult[[]T], 1)
	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)
		results := make([]T, len(tasks))
		failures := make([]error, len(tasks))
		var wg sync.WaitGroup
		wg.Add(len(tasks))
		for i, task := range tasks {
			go func(i int, task <-chan R) {
				defer wg.Done()
				defer func() {
					if r := recover(); r != nil && r != "break" {
						failures[i] = RecoveredError(r)
					}
				}()
				if r, ok := <-task; ok {
					results[i], failures[i] = r.Typed(), r.Failure()
				}
			}(i, task)
		}
		wg.Wait()
		for _, err := range failures {
			if err != nil {
				ch <- AsyncResult[[]T]{Err: err}
				return
			}
		}
		ch <- AsyncResult[[]T]{Value: results}
	}()
	return ch
}

var untypedOutcomeType = reflect.TypeOf((*UntypedOutcome)(nil)).Elem()

// awaitOutcome receives one result from an async core channel or a *Future; anything else reads nil.
func awaitOutcome(task any) (any, error) {
	switch typedTask := task.(type) {
	case <-chan AsyncResult[any]:
		r := <-typedTask
		return r.Value, r.Err
	case chan AsyncResult[any]:
		r := <-typedTask
		return r.Value, r.Err
	case *Future:
		r := <-typedTask.Await()
		return r.Value, r.Err
	case AsyncResult[any]:
		// an already-received task (`<-core()` inside the list literal) keeps its error
		return typedTask.Value, typedTask.Err
	}
	if outcome, ok := receiveOutcome(task); ok && outcome != nil {
		// promiseAll results are read by untyped (TS-shaped) code — SafeList, ArrayConcat — which
		// does not recognise typed struct lists such as []MarketInterface, so box them as []any
		return DynamicValue(outcome.Untyped()), outcome.Failure()
	}
	return nil, nil
}

// receiveOutcome receives once from a channel whose element implements UntypedOutcome;
// ok is false when task is not such a channel, outcome is nil when it was closed empty.
func receiveOutcome(task any) (UntypedOutcome, bool) {
	rv := reflect.ValueOf(task)
	if !rv.IsValid() || rv.Kind() != reflect.Chan || rv.IsNil() || rv.Type().ChanDir()&reflect.RecvDir == 0 || !rv.Type().Elem().Implements(untypedOutcomeType) {
		return nil, false
	}
	v, received := rv.Recv()
	if !received {
		return nil, true
	}
	return v.Interface().(UntypedOutcome), true
}

func ParseInt(number any) int64 {
	number = derefScalar(number)
	switch v := number.(type) {
	case int:
		return int64(v)
	case int8:
		return int64(v)
	case int16:
		return int64(v)
	case int32:
		return int64(v)
	case int64:
		return v
	case uint:
		return int64(v)
	case uint8:
		return int64(v)
	case uint16:
		return int64(v)
	case uint32:
		return int64(v)
	// case uint64:
	// 	if v <= uint64(^int64(0)) {
	// 		return int64(v)
	// 	}
	case float32:
		return int64(v)
	case float64:
		return int64(v)
	case string:
		if i, err := strconv.ParseInt(v, 10, 64); err == nil {
			return i
		}
	}
	return math.MinInt64 // Default value if conversion is not possible
}

func mathMin(a, b any) any {
	a = derefScalar(a)
	b = derefScalar(b)

	if a == nil || b == nil {
		return nil
	}

	af := ToFloat64(a)
	bf := ToFloat64(b)

	if af == math.NaN() || bf == math.NaN() {
		return nil
	}

	if af < bf {
		return af
	}

	return bf

}

func ParseFloat(input any) any {
	input = derefScalar(input)
	switch v := input.(type) {
	case float32:
		return float64(v)
	case float64:
		return v
	case int:
		return float64(v)
	case int8:
		return float64(v)
	case int16:
		return float64(v)
	case int32:
		return float64(v)
	case int64:
		return float64(v)
	case uint:
		return float64(v)
	case uint8:
		return float64(v)
	case uint16:
		return float64(v)
	case uint32:
		return float64(v)
	case uint64:
		return float64(v)
	case string:
		if result, err := strconv.ParseFloat(v, 64); err == nil {
			return result
		}
		return nil
	default:
		return nil
	}
}

func ParseJSON(input any) any {
	input = derefScalar(input) // generated callers pass *string from the typed Safe* accessors
	jsonString, ok := input.(string)
	if !ok {
		return nil
	}

	// // var result any

	// if jsonString[0] == '[' {
	// 	var arrayResult []map[string]any
	// 	err := json.Unmarshal([]byte(jsonString), &arrayResult)
	// 	if err != nil {
	// 		return nil
	// 	}
	// 	return arrayResult
	// }

	// var mapResult map[string]any
	// err := json.Unmarshal([]byte(jsonString), &mapResult)
	// if err != nil {
	// 	return nil
	// }
	// return mapResult

	var result any

	decoder := json.NewDecoder(strings.NewReader(jsonString))
	decoder.UseNumber() // Ensures large numbers are handled correctly

	err := decoder.Decode(&result)
	if err != nil {
		return nil
	}
	return normalizeNumbers(result)
}

func normalizeNumbers(data any) any {
	switch v := data.(type) {
	case map[string]any:
		for key, val := range v {
			v[key] = normalizeNumbers(val)
		}
		return v
	case []any:
		for i, val := range v {
			v[i] = normalizeNumbers(val)
		}
		return v
	case json.Number:
		numStr := v.String()
		if i, err := strconv.ParseInt(numStr, 10, 64); err == nil {
			return i
		}
		if f, err := strconv.ParseFloat(numStr, 64); err == nil {
			if strconv.FormatFloat(f, 'g', -1, 64) == numStr {
				return f
			}
		}
		return numStr
	default:
		return v
	}
}

func ThrowDynamicException(exceptionType any, message any) {
	functionError := exceptionType.(func(...any) error)
	errorMsg := functionError(message)
	panic(errorMsg)
	// to do implement
	// // exceptionTypeStr, ok := exceptionType.(string)
	// if !ok {
	// 	panic("exceptionType must be a string representing the error type")

	// // messageStr, ok := message.(string)
	// // if !ok {
	// // 	panic("message must be a string")
	// // }

	// // constructor, exists := customErrors[exceptionTypeStr]
	// // if !exists {
	// // 	panic(errors.New("unknown error type: " + exceptionTypeStr))
	// // }

	// // err := constructor(messageStr)
	// // panic(err)
}

func Capitalize(s string) string {
	if len(s) == 0 {
		return s
	}
	// Convert the first letter to uppercase
	firstLetter := strings.ToUpper(string(s[0]))
	// Combine the uppercase first letter with the rest of the string
	return firstLetter + s[1:]
}

// IsDictionary checks if the input is a map or live ws orderbook.
func (this *BaseExchange) IsDictionary(value any) bool {
	v := derefScalar(value)
	if v == nil {
		return false
	}
	switch v.(type) {
	case map[string]any, Dict, map[any]any, OrderBookInterface:
		return true
	default:
		return false
	}
}

func SetDefaults(p any) {
	setDefaults(p)
}

// NewMapArray converts a generated-code result (usually a []any of map[string]any
// entries) into a typed []map[string]any; used by the typed wrappers
func NewMapArray(res any) []map[string]any {
	if res == nil {
		return nil
	}
	if typed, ok := res.([]map[string]any); ok {
		return typed
	}
	list, ok := res.([]any)
	if !ok {
		return nil
	}
	out := make([]map[string]any, len(list))
	for i, item := range list {
		if m, ok := item.(map[string]any); ok {
			out[i] = m
		}
	}
	return out
}

func setDefaults(p any) {
	// Get the value of the pointer to struct
	val := reflect.ValueOf(p).Elem()
	typ := val.Type()

	// Iterate over the fields of the struct using reflection
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
				// Add other types as necessary
			}
		}
	}
}

// suffix carried by every transpiled channel-returning (async) method; the plain
// name is the typed sync method. Mirrors GO_ASYNC_SUFFIX in build/goTranspiler.ts.
const asyncMethodSuffix = "Async"

func CallInternalMethod(methods map[string]any, itf any, name2 string, args ...any) <-chan AsyncResult[any] {
	name := Capitalize(name2)
	// baseValue := reflect.ValueOf(itf)
	// baseType := baseValue.Type()
	// if !this.cacheLoaded {
	// 	this.cacheLoaded = true
	// 	this.WarmUpCache()
	// }
	ch := make(chan AsyncResult[any])
	go func() {

		// Error handling
		defer func() {
			if r := recover(); r != nil {
				ch <- AsyncResult[any]{Err: RecoveredError(r)}
				close(ch)
			}
		}()

		// dynamic callers name the unified method (fetchTicker). Its channel form is the
		// Async-suffixed trampoline; the plain name is the typed sync method (or a plain
		// sync helper when no trampoline exists), so the trampoline is looked up first.
		cacheKey := fmt.Sprintf("%s", name)
		cachedMethod, found := methods[cacheKey+asyncMethodSuffix]
		if !found {
			cachedMethod, found = methods[cacheKey]
		}

		if !found {
			panic(name + " :method not found")
		}

		cachedMap := cachedMethod.(map[string]any)

		// var method reflect.Method
		// for i := 0; i < baseType.NumMethod(); i++ {
		// 	method = baseType.Method(i)
		// 	if name == method.Name {
		// 		break
		// 	}
		// }

		// method := cachedMap["method"].(reflect.Method)
		methodValue := cachedMap["methodValue"].(reflect.Value)
		methodType := cachedMap["methodType"].(reflect.Type)
		numIn := derefScalar(cachedMap["numIn"]).(int)
		isVariadic := derefScalar(cachedMap["isVariadic"]).(bool)

		var in []reflect.Value
		// Fixed argument handling for both regular and variadic functions
		for k := 0; k < numIn-1; k++ {
			paramType := methodType.In(k + 1) // Account for receiver not being part of args
			if paramType.Kind() == reflect.String {
				// a required string parameter: no zero-value default, a wrong type panics
				var arg any = nil
				if k < len(args) {
					arg = args[k]
				}
				in = append(in, reflect.ValueOf(StringArg(arg)).Convert(paramType))
			} else if paramType.Kind() == reflect.Bool {
				// a required boolean parameter: no zero-value default, a wrong type panics
				var arg any = nil
				if k < len(args) {
					arg = args[k]
				}
				in = append(in, reflect.ValueOf(BoolArg(arg)).Convert(paramType))
			} else if paramType.Kind() == reflect.Int64 {
				// a required int parameter: decoded JSON numbers arrive as float64, nil panics
				var arg any = nil
				if k < len(args) {
					arg = args[k]
				}
				in = append(in, reflect.ValueOf(Int64Arg(arg)).Convert(paramType))
			} else if paramType.Kind() == reflect.Float64 && k < len(args) && args[k] != nil {
				// a required float parameter: an int literal or a numeric string arrives boxed
				in = append(in, reflect.ValueOf(ToFloat64(args[k])).Convert(paramType))
			} else if paramType.Kind() == reflect.Float64 {
				// a required number parameter: a missing or nil argument panics
				var arg any = nil
				if k < len(args) {
					arg = args[k]
				}
				panic(ArgumentsRequired(fmt.Sprintf("expected a number argument, got %T: %v", arg, arg)))
			} else if k < len(args) && args[k] != nil && derefScalar(args[k]) != nil {
				argValue := reflect.ValueOf(args[k])
				if paramType.Kind() == reflect.Slice && argValue.Kind() == reflect.Slice && argValue.Type() != paramType && argValue.Type().Elem().Kind() == reflect.Interface {
					// decoded JSON lists arrive as []any: rebuild them as the typed slice the method declares
					typed := reflect.MakeSlice(paramType, argValue.Len(), argValue.Len())
					for j := 0; j < argValue.Len(); j++ {
						item := argValue.Index(j).Elem()
						if item.IsValid() && item.Type().ConvertibleTo(paramType.Elem()) {
							typed.Index(j).Set(item.Convert(paramType.Elem()))
						}
					}
					argValue = typed
				}
				in = append(in, argValue)
			} else {
				in = append(in, reflect.Zero(paramType))
			}
		}

		if isVariadic && len(args) >= numIn-1 {
			variadicType := methodType.In(numIn - 1).Elem() // Get the type of the variadic argument
			for k := numIn - 1; k < len(args); k++ {
				if args[k] == nil || derefScalar(args[k]) == nil {
					in = append(in, reflect.Zero(variadicType))
				} else {
					in = append(in, reflect.ValueOf(args[k]))
				}
			}
		}

		// Call the method with the constructed arguments
		res := methodValue.Call(in)

		// Handle the result
		if len(res) > 0 && res[0].Kind() == reflect.Chan {
			resultChan := res[0]
			go func() {
				for {
					val, ok := resultChan.Recv()
					if !ok {
						break // result channel is closed
					}
					out := val.Interface()
					if outcome, isOutcome := out.(UntypedOutcome); isOutcome {
						ch <- AsyncResult[any]{Value: DynamicValue(outcome.Untyped()), Err: outcome.Failure()}
					} else {
						ch <- AsyncResult[any]{Value: out}
					}
				}
				close(ch) // close the output channel after all values are received
			}()
			return
		} else if len(res) > 0 {
			ch <- AsyncResult[any]{Value: res[0].Interface()}
		} else {
			ch <- AsyncResult[any]{}
		}

		// ch <- nil // nught be causing a mem leak
		close(ch)
	}()
	return ch
}

// PanicOnError re-panics when msg carries a failure, and otherwise returns msg (an UntypedOutcome
// returns its value as any) so a typed receive can convert it in the same frame.
func PanicOnError(msg any) any {
	if outcome, ok := msg.(UntypedOutcome); ok {
		if err := outcome.Failure(); err != nil {
			panic(err)
		}
		return outcome.Untyped()
	}
	if err := failureOf(msg); err != nil {
		panic(err)
	}
	return msg
}

// failureOf is the error msg carries: an error value, a legacy "panic:" string, or the
// first such element (index order, nested []any included) of a []any; nil otherwise.
func failureOf(msg any) error {
	switch v := msg.(type) {
	case error:
		return v
	case string:
		if strings.HasPrefix(v, "panic:") {
			return RecoveredError(v)
		}
	case []any:
		for _, item := range v {
			if err := failureOf(item); err != nil {
				return err
			}
		}
	}
	return nil
}

// RecoveredError turns a recovered panic value into the error an async result carries:
// errors pass through unchanged, legacy "panic:" strings are parsed, anything else keeps its message.
func RecoveredError(r any) error {
	if err, ok := r.(error); ok {
		return err
	}
	if s, ok := r.(string); ok && IsError(s) {
		return CreateReturnError(s)
	}
	return NewError("Exception", ToString(r), string(debug.Stack()))
}

// ReturnPanicError is deferred by async cores: a panic becomes {Err}, "break" sends nothing.
func ReturnPanicError[T any](ch chan AsyncResult[T]) {
	// https://stackoverflow.com/questions/72651899/why-golang-can-not-recover-from-a-panic-in-a-function-called-by-the-defer-functi
	if r := recover(); r != nil {
		if r != "break" {
			ch <- AsyncResult[T]{Err: RecoveredError(r)}
		}
	}
}

// AsyncResult is one async-core outcome: Value on success, Err (Value zero) on failure.
type AsyncResult[T any] struct {
	Value T
	Err   error
}

// Untyped returns the carried value as any, unchanged (a nil typed map stays a typed nil).
func (r AsyncResult[T]) Untyped() any {
	return r.Value
}

// Failure returns the carried error, nil on success.
func (r AsyncResult[T]) Failure() error {
	return r.Err
}

// Typed returns the carried value.
func (r AsyncResult[T]) Typed() T {
	return r.Value
}

// MapPair is the async result of a (value, params) pair method: V the value, P the params.
type MapPair[T any] struct {
	V T
	P map[string]any
}

// EndpointResult carries one implicit-API response: Raw is exactly what Fetch2Async
// delivered, Value its typed view (zero on shape mismatch), Err the failure.
type EndpointResult[T any] struct {
	Value T
	Raw   any
	Err   error
}

// Untyped returns the raw response exactly as Fetch2Async delivered it.
func (r EndpointResult[T]) Untyped() any {
	return r.Raw
}

// Failure returns the carried error, nil on success.
func (r EndpointResult[T]) Failure() error {
	return r.Err
}

// Typed returns the typed view of the response.
func (r EndpointResult[T]) Typed() T {
	return r.Value
}

// Checked panics with the carried error, else returns the typed view.
func (r EndpointResult[T]) Checked() T {
	if r.Err != nil {
		panic(r.Err)
	}
	return r.Value
}

func endpointValue[T any](raw any) T {
	var out T
	switch p := any(&out).(type) {
	case *map[string]any:
		*p = MapTyped(raw)
	case *[]any:
		*p = ListTyped(raw)
	case *string:
		if s, ok := derefScalar(raw).(string); ok {
			*p = s
		}
	default:
		if v, ok := raw.(T); ok {
			out = v
		}
	}
	return out
}

// EndpointRaw adapts a typed endpoint channel to the boxed channel PromiseAll and any-typed holders expect.
func EndpointRaw[T any](in <-chan EndpointResult[T]) <-chan AsyncResult[any] {
	out := make(chan AsyncResult[any], 1)
	go func() {
		defer close(out)
		if r, ok := <-in; ok {
			out <- AsyncResult[any]{Value: r.Raw, Err: r.Err}
		}
	}()
	return out
}

// EndpointTyped is EndpointRaw's inverse: a runtime-dispatched endpoint (no baked path, so it
// cannot use Fetch2Result) still has a declared response shape, and the receiver reads it as
// that shape instead of converting the box at every call site.
func EndpointTyped[T any](in <-chan AsyncResult[any]) <-chan EndpointResult[T] {
	out := make(chan EndpointResult[T], 1)
	go func() {
		defer close(out)
		if r, ok := <-in; ok {
			out <- EndpointResult[T]{Value: endpointValue[T](r.Value), Raw: r.Value, Err: r.Err}
		}
	}()
	return out
}

// ReturnPanicErrorT is ReturnPanicError for an EndpointResult channel.
func ReturnPanicErrorT[T any](ch chan EndpointResult[T]) {
	if r := recover(); r != nil {
		if r != "break" {
			ch <- EndpointResult[T]{Err: RecoveredError(r)}
		}
	}
}

func HandleDelta(bookside any, delta any) any {
	if bookside == nil {
		return nil
	}

	// Cast bookside to *OrderBookSide
	orderbookSide, ok := bookside.(*OrderBookSide)
	if !ok {
		return bookside
	}

	// Cast delta to []any
	deltaSlice, ok := delta.([]any)
	if !ok || len(deltaSlice) < 2 {
		return bookside
	}

	// Extract price and size from delta
	price := ToFloat64(deltaSlice[0])
	size := ToFloat64(deltaSlice[1])

	// Create a new entry [price, size]
	entry := []any{price, size}

	// Store the entry in the OrderBookSide
	orderbookSide.StoreArray(entry)

	return orderbookSide
}

func HandleDeltas(bookside any, deltas any) any {
	// Cast deltas to []any
	deltasSlice, ok := deltas.([]any)
	if !ok {
		return bookside
	}

	// Process each delta
	for _, delta := range deltasSlice {
		bookside = HandleDelta(bookside, delta)
	}

	return bookside
}
