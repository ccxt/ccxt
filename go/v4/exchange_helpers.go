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
	"time"
)

// serialize writes in AddElementToObject to avoid concurrent map writes in hot WS paths
var addElementMu sync.Mutex

func UnWrapType(value any) any {
	// converts from wrapped types to basic types
	// like OrderBook, Ticker, Trade, etc to map[string]any or []any
	// also if value is a string, it panics with that string (error message)
	if value == nil {
		return nil
	}
	switch v := value.(type) {
	case OrderBookInterface:
		return v.ToMap()
	case ArrayCacheByTimestamp:
		return v.ToArray()
	case ArrayCache:
		return v.ToArray()
	case string:
		panic(v)
	default:
		return value
	}
}

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

func IsTrue(a any) bool {
	return EvalTruthy(a)
}

// EvalTruthy determines if a single interface value is truthy.
func EvalTruthy(val any) bool {
	val = derefScalar(val)
	if val == nil {
		return false
	}

	// Check types of val

	switch v := val.(type) {
	case int, int32, int64, uint, uint32, uint64:
		return v != 0
	case float32, float64:
		return v != 0.0
	case string:
		return v != ""
	case bool:
		return v // bool is already truthy or falsy
	case []any:
		return len(v) > 0
	case map[string]any:
		return len(v) > 0
	case *sync.Map:
		if v == nil {
			return false
		}
		hasAny := false
		v.Range(func(_, _ any) bool {
			hasAny = true
			return false // stop after the first item
		})
		return hasAny
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
		// Use reflection for other complex types (slices, maps, pointers, etc.)
		// valType := reflect.TypeOf(val)
		// switch valType.Kind() {
		// case reflect.Slice, reflect.Map, reflect.Ptr, reflect.Chan, reflect.Func:
		// 	return !reflect.ValueOf(val).IsNil()
		// }
	}

	// return true // Consider non-nil complex types as truthy
}

// func IsInteger(value any) bool {
// 	switch value.(type) {
// 	case int, int8, int16, int32, int64:
// 		return true
// 	case uint, uint8, uint16, uint32, uint64:
// 		return true
// 	default:
// 		return false
// 	}
// }

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

// MapTyped converts a boxed dictionary into a plain map: a map passes through, a
// *sync.Map is converted, anything else (including nil) reads as a nil map, exactly
// what the boxed value answered through GetValue/ObjectKeys/InOp. The printer emits it
// for a local whose TypeScript type proves the box holds the market dictionary.
func MapTyped(v any) map[string]any {
	v = derefScalar(v)
	if v == nil {
		return nil
	}
	if asMap, ok := v.(map[string]any); ok {
		return asMap
	}
	if asSyncMap, ok := v.(*sync.Map); ok {
		return SafeMapToMap(asSyncMap)
	}
	return nil
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

// BoxAbsent re-boxes a typed container for an `any` channel: a nil map/slice becomes untyped nil.
func BoxAbsent(v any) any {
	switch c := v.(type) {
	case map[string]any:
		if c == nil {
			return nil
		}
	case []any:
		if c == nil {
			return nil
		}
	}
	return v
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
		// serialize map reads to avoid races with concurrent writes
		addElementMu.Lock()
		val, ok := v[keyStr]
		addElementMu.Unlock()
		if ok {
			return val
		}
	case *sync.Map:
		if v == nil {
			return nil
		}
		if !isStr {
			return nil
		}
		val, ok := v.Load(keyStr)
		if ok {
			return val
		} else {
			return nil
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

func Multiply(a, b any) any {
	a = derefScalar(a)
	b = derefScalar(b)

	if (a == nil) || (b == nil) {
		return nil
	}

	aVal := reflect.ValueOf(a)
	bVal := reflect.ValueOf(b)

	// Ensure both values are numeric
	if !aVal.IsValid() || !bVal.IsValid() || !aVal.Type().ConvertibleTo(bVal.Type()) {
		return nil
	}

	// Convert a to the type of b to simplify multiplication
	aValConverted := aVal.Convert(bVal.Type())

	// Perform multiplication based on the kind of b
	switch bVal.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return aValConverted.Int() * bVal.Int()
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return aValConverted.Uint() * bVal.Uint()
	case reflect.Float32, reflect.Float64:
		aFloat := ToFloat64(a)
		bFloat := ToFloat64(b)
		res := aFloat * bFloat
		if IsInteger(res) {
			return ParseInt(res)
		}
		return res
	default:
		return nil
	}
}

func Divide(a, b any) any {
	a = derefScalar(a)
	b = derefScalar(b)

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
		if bVal.Int() == 0 {
			return nil // Avoid division by zero
		}
		return aValConverted.Int() / bVal.Int()
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		if bVal.Uint() == 0 {
			return nil // Avoid division by zero
		}
		return aValConverted.Uint() / bVal.Uint()
	case reflect.Float32, reflect.Float64:
		aFloat := ToFloat64(a)
		bFloat := ToFloat64(b)
		if bFloat == 0.0 {
			return nil // Avoid division by zero
		}
		res := aFloat / bFloat
		if IsInteger(res) {
			return ParseInt(res)
		}
		return res
	default:
		return nil
	}
}

func Subtract(a, b any) any {
	a = derefScalar(a)
	b = derefScalar(b)

	if a == nil || b == nil {
		return nil
	}

	// aVal := reflect.ValueOf(a)
	// bVal := reflect.ValueOf(b)

	aFloat := ToFloat64(a)
	bFloat := ToFloat64(b)
	res := aFloat - bFloat
	if IsInteger(res) {
		return ParseInt(res)
	}
	return res

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

func IsGreaterThan(a, b any) bool {
	a = derefScalar(a)
	b = derefScalar(b)
	if a != nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}

	// Handle int, int64, float64 comparisons
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

	// If types cannot be compared, return false
	return false
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

// IsLessThan checks if a is less than b
func IsLessThan(a, b any) bool {
	return !IsGreaterThan(a, b) && !IsEqual(a, b)
}

// IsGreaterThanOrEqual checks if a is greater than or equal to b
func IsGreaterThanOrEqual(a, b any) bool {
	return IsGreaterThan(a, b) || IsEqual(a, b)
}

// IsLessThanOrEqual checks if a is less than or equal to b
func IsLessThanOrEqual(a, b any) bool {
	return IsLessThan(a, b) || IsEqual(a, b)
}

// Mod performs a modulus operation on a and b
func Mod(a, b any) any {
	a = derefScalar(a)
	b = derefScalar(b)
	if a == nil || b == nil {
		return nil
	}

	aFloat := ToFloat64(a)
	bFloat := ToFloat64(b)

	if aFloat == math.NaN() || bFloat == math.NaN() {
		return nil
	}
	res := math.Mod(aFloat, bFloat)
	if IsInteger(res) {
		return ParseInt(res)
	}
	return res
	// aVal, bVal, ok := NormalizeAndConvert(a, b)
	// if !ok || bVal.Float() == 0 {
	// 	return nil
	// }

	// return float64(int(aVal.Float()) % int(bVal.Float()))
}

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
	case *sync.Map:
		if aVal == nil {
			return true
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

// NormalizeAndConvert normalizes and attempts to convert a and b to a common type
func NormalizeAndConvert(a, b any) (reflect.Value, reflect.Value, bool) {
	aVal := reflect.ValueOf(a)
	bVal := reflect.ValueOf(b)

	if aVal.Kind() != bVal.Kind() {
		if aVal.Kind() < bVal.Kind() {
			aVal = reflect.ValueOf(ToFloat64(a))
			bVal = reflect.ValueOf(ToFloat64(b))
		} else {
			bVal = reflect.ValueOf(ToFloat64(b))
			aVal = reflect.ValueOf(ToFloat64(a))
		}
	}

	return aVal, bVal, true
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

func Increment(a any) any {
	a = derefScalar(a)
	switch v := a.(type) {
	case int:
		return v + 1
	case int64:
		return v + 1
	case float64:
		return v + 1.0
	case string:
		return v + "1"
	default:
		return nil
	}
}

// Decrement decreases the numeric value by 1.
func Decrement(a any) any {
	a = derefScalar(a)
	switch v := a.(type) {
	case int:
		return v - 1
	case int64:
		return v - 1
	case float64:
		return v - 1.0
	default:
		return nil
	}
}

// Negate negates the numeric value.
func Negate(a any) any {
	a = derefScalar(a)
	switch v := a.(type) {
	case int:
		return -v
	case int64:
		return -v
	case float64:
		return -v
	default:
		return nil
	}
}

// UnaryPlus returns the numeric value unchanged.
func UnaryPlus(a any) any {
	a = derefScalar(a)
	switch v := a.(type) {
	case int:
		return +v
	case int64:
		return +v
	case float64:
		return +v
	default:
		return nil
	}
}

// PlusEqual adds the value of `value` to `a`, handling some basic types.
func PlusEqual(a, value any) any {
	a = derefScalar(a)
	value = derefScalar(value)
	aVal := reflect.ValueOf(a)
	valueVal := reflect.ValueOf(value)

	if aVal.Kind() != valueVal.Kind() {
		return nil // type mismatch
	}

	switch aVal.Kind() {
	case reflect.Int, reflect.Int64:
		return aVal.Int() + valueVal.Int()
	case reflect.Float64:
		return aVal.Float() + valueVal.Float()
	case reflect.String:
		return aVal.String() + valueVal.String()
	default:
		return nil
	}
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
		if key, ok := stringOrInt.(string); ok {
			addElementMu.Lock()
			obj[key] = value
			addElementMu.Unlock()
			// return nil
		} else {
			// return fmt.Errorf("invalid key type for map: expected string")
		}
	case *sync.Map:
		if key, ok := stringOrInt.(string); ok {
			obj.Store(key, value)
			// return nil
		} else {
			// return fmt.Errorf("invalid key type for sync.Map: expected string")
		}
	case map[string]map[string]*ArrayCacheByTimestamp:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(map[string]*ArrayCacheByTimestamp); ok {
				addElementMu.Lock()
				obj[key] = v
				addElementMu.Unlock()
			} else if _, ok := value.(map[string]any); ok {
				// assume we want a new map[string]*ArrayCacheByTimestamp
				cache := make(map[string]*ArrayCacheByTimestamp)
				addElementMu.Lock()
				obj[key] = cache
				addElementMu.Unlock()
			} else {
				// return fmt.Errorf("value type mismatch for map[string]map[string]*ArrayCacheByTimestamp")
			}
		}
	case map[string]*ArrayCacheByTimestamp:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(*ArrayCacheByTimestamp); ok {
				addElementMu.Lock()
				obj[key] = v
				addElementMu.Unlock()
			} else {
				// return fmt.Errorf("value type mismatch for map[string]*ArrayCacheByTimestamp")
			}
		}
	case map[string]*ArrayCache:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(*ArrayCache); ok {
				addElementMu.Lock()
				obj[key] = v
				addElementMu.Unlock()
			} else {
				// return fmt.Errorf("value type mismatch for map[string]*ArrayCache")
			}
		}
	case map[string]*ArrayCacheBySymbolById:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(*ArrayCacheBySymbolById); ok {
				addElementMu.Lock()
				obj[key] = v
				addElementMu.Unlock()
			} else {
				// return fmt.Errorf("value type mismatch for map[string]*ArrayCacheBySymbolById")
			}
		}
	case map[string]*ArrayCacheBySymbolBySide:
		if key, ok := stringOrInt.(string); ok {
			if v, ok := value.(*ArrayCacheBySymbolBySide); ok {
				addElementMu.Lock()
				obj[key] = v
				addElementMu.Unlock()
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
		// serialize map read to avoid concurrent read/write with AddElementToObject
		addElementMu.Lock()
		_, ok := v[key.(string)]
		addElementMu.Unlock()
		if ok {
			return true
		}
	case *sync.Map:
		if v == nil {
			return false
		}
		if keyStr, ok := key.(string); ok {
			if _, ok := v.Load(keyStr); ok {
				return true
			}
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
			addElementMu.Lock()
			_, ok3 := v[keyStr]
			addElementMu.Unlock()
			if ok3 {
				return true
			}
		}
	case map[string]*ArrayCacheByTimestamp:
		if keyStr, ok2 := derefScalar(key).(string); ok2 {
			addElementMu.Lock()
			_, ok3 := v[keyStr]
			addElementMu.Unlock()
			if ok3 {
				return true
			}
		}
	case map[string]*ArrayCache:
		if keyStr, ok2 := derefScalar(key).(string); ok2 {
			addElementMu.Lock()
			_, ok3 := v[keyStr]
			addElementMu.Unlock()
			if ok3 {
				return true
			}
		}
	case map[string]*ArrayCacheBySymbolBySide:
		if keyStr, ok2 := derefScalar(key).(string); ok2 {
			addElementMu.Lock()
			_, ok3 := v[keyStr]
			addElementMu.Unlock()
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

// IsBool checks if the input is a boolean
func IsBool(v any) bool {
	v = derefScalar(v)
	if v == nil {
		return false
	}
	_, ok := v.(bool)
	return ok
}

// IsDictionary checks if the input is a map (dictionary in Python)
func IsDictionary(v any) bool {
	v = derefScalar(v)
	if v == nil {
		return false
	}
	switch v.(type) {
	case map[string]any:
		return true
	case *sync.Map:
		return true
	case Dict:
		return true
	case map[any]any:
		return true
	case OrderBookInterface:
		// live ws orderbooks are dictionaries in every other runtime — js
		// objects, python dicts, java WsOrderBook extends AbstractMap
		// (https://github.com/ccxt/ccxt/pull/29594), C# OrderBook implements
		// IDictionary — and the shared structure test asserts
		// isDictionary(entry) on them; the native go check introduced in
		// https://github.com/ccxt/ccxt/pull/29704 must agree or every ws
		// orderbook live test fails with "entry is not a dict"
		return true
	default:
		return false
	}
	// return reflect.TypeOf(v).Kind() == reflect.Map
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

// IsInt checks if the input is an integer
func IsInt(v any) bool {
	v = derefScalar(v)
	if v == nil {
		return false
	}
	switch v.(type) {
	case int, int8, int16, int32, int64:
		return true
	case uint, uint8, uint16, uint32, uint64:
		return true
	default:
		return false
	}
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

func IsObject(v any) bool {
	v = derefScalar(v)
	if v == nil {
		return false
	}
	kind := reflect.TypeOf(v).Kind()
	switch kind {
	case reflect.Chan, reflect.Func, reflect.Interface, // reflect.Array,  reflect.Slice
		reflect.Map, reflect.Ptr, reflect.Struct, reflect.UnsafePointer:
		return true
	default:
		return false
	}
}

func ToLower(v any) string {
	v = derefScalar(v)
	if str, ok := v.(string); ok {
		return strings.ToLower(str)
	}
	return ""
}

// ToUpper converts a string to uppercase
func ToUpper(v any) string {
	v = derefScalar(v)
	if str, ok := v.(string); ok {
		return strings.ToUpper(str)
	}
	return ""
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

// MathFloor returns the largest integer less than or equal to the given number
func MathFloor(v any) float64 {
	v = derefScalar(v)
	if num, ok := v.(float64); ok {
		return math.Floor(num)
	}
	if num, ok := v.(int); ok {
		return math.Floor(float64(num))
	}
	if num, ok := v.(int64); ok {
		return math.Floor(float64(num))
	}
	return 0
}

// MathCeil returns the smallest integer greater than or equal to the given number
func MathCeil(v any) float64 {
	v = derefScalar(v)
	if num, ok := v.(float64); ok {
		return math.Ceil(num)
	}
	if num, ok := v.(int); ok {
		return math.Ceil(float64(num))
	}
	if num, ok := v.(int64); ok {
		return math.Ceil(float64(num))
	}
	return 0
}

// MathRound returns the nearest integer, rounding half away from zero
func MathRound(v any) float64 {
	v = derefScalar(v)
	if num, ok := v.(float64); ok {
		return math.Round(num)
	}
	if num, ok := v.(int); ok {
		return math.Round(float64(num))
	}
	if num, ok := v.(int64); ok {
		return math.Round(float64(num))
	}
	return 0
}

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

// IndexOf returns the index of the first occurrence of a substring
func IndexOf(v any, substr any) int {
	v = derefScalar(v)
	substr = derefScalar(substr)
	if str, ok := v.(string); ok {
		substrStr := ToString(substr)
		return strings.Index(str, substrStr)
	}
	return -1
}

// Trim removes leading and trailing whitespace from a string
func Trim(v any) string {
	v = derefScalar(v)
	if str, ok := v.(string); ok {
		return strings.TrimSpace(str)
	}
	return ""
}

// Contains checks if the string contains the specified substring
func Contains(v any, substr any) bool {
	v = derefScalar(v)
	substr = derefScalar(substr)
	if str, ok := v.(string); ok {
		substrStr := ToString(substr)
		return strings.Contains(str, substrStr)
	}
	return false
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
		for _, elem := range v {
			strSlice = append(strSlice, ToString(elem))
		}
	default:
		return ""
	}

	return strings.Join(strSlice, sepStr)
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
	} else if syncMap, ok := v.(*sync.Map); ok {
		keys := []string{}
		if syncMap == nil {
			return keys
		}
		syncMap.Range(func(k, _ any) bool {
			if keyStr, ok := k.(string); ok {
				keys = append(keys, keyStr)
			}
			return true
		})
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

// ObjectValues returns the values of a map as a slice of any
func ObjectValues(v any) []any {
	v = derefScalar(v)
	if v == nil {
		return nil
	}
	// return values
	if mapObject, ok := v.(map[string]any); ok {
		values := make([]any, 0, len(mapObject))
		for _, value := range mapObject {
			values = append(values, value)
		}
		return values
	} else if syncMap, ok := v.(*sync.Map); ok {
		values := []any{}
		if syncMap == nil {
			return values
		}
		syncMap.Range(func(_, value any) bool {
			values = append(values, value)
			return true
		})
		return values
	}
	return nil
	// val := ref
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
	case []map[string]any:
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

func Shift(slice any) (any, any) {
	sliceVal, ok := castToSlice(slice)
	if !ok || len(sliceVal) == 0 {
		return slice, nil
	}
	return sliceVal[1:], sliceVal[0]
}

// Reverse reverses the elements of a slice in place
func Reverse(slice any) {
	sliceVal, ok := castToSlice(slice)
	if !ok {
		panic("provided value is not a slice")
	}

	// Reverse the elements in place
	for i, j := 0, len(sliceVal)-1; i < j; i, j = i+1, j-1 {
		sliceVal[i], sliceVal[j] = sliceVal[j], sliceVal[i]
	}

	// Copy the reversed values back into the original slice
	// Since Go is a pass-by-value language, we need to reflect to modify the original slice in place
	v := reflect.ValueOf(slice)
	for i := 0; i < v.Len(); i++ {
		v.Index(i).Set(reflect.ValueOf(sliceVal[i]))
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

func Replace(input any, old any, new any) string {
	input = derefScalar(input)
	str := ToString(input)
	oldStr := ToString(old)
	newStr := ToString(new)
	return strings.ReplaceAll(str, oldStr, newStr)
}

// PadEnd pads the input string on the right with padStr until it reaches the specified length
func PadEnd(input any, length2 any, padStr any) string {
	length := int(ParseInt(length2))
	str := ToString(input)
	pad := ToString(padStr)
	for len(str) < length {
		str += pad
	}
	return str[:length]
}

// PadStart pads the input string on the left with padStr until it reaches the specified length
func PadStart(input any, length2 any, padStr any) string {
	length := int(ParseInt(length2))
	str := ToString(input)
	pad := ToString(padStr)
	for len(str) < length {
		str = pad + str
	}
	return str[len(str)-length:]
}

// DateNow returns the current date and time as a string
func DateNow() string {
	return time.Now().Format(time.RFC3339)
}

func GetLength(v any) int {
	v = derefScalar(v)
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

func IsNil(x any) bool {
	x = derefScalar(x)
	// https://blog.devtrovert.com/p/go-secret-interface-nil-is-not-nil
	if x == nil {
		return true
	}
	return false

	// switch val := x.(type){
	// case any:
	// 	return val == nil
	// case

	// }

	// value := reflect.ValueOf(x)
	// kind := value.Kind()

	// switch kind {
	// case reflect.Chan, reflect.Func, reflect.Map, reflect.Ptr, reflect.UnsafePointer, reflect.Interface, reflect.Slice:
	// 	return value.IsNil()
	// default:
	// 	return false
	// }
}

// derefScalar reproduces untyped-nil semantics for a maybe-undefined value that
// travels as a pointer: a nil pointer becomes untyped nil (absent), a non-nil one
// becomes the value it points at. Pointer types that are values in their own right
// (*sync.Map, *PreciseStruct, *ArrayCache, ...) are returned untouched.
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
	// dynamic callers pass a []any of strings
	if list, isList := val.([]any); isList {
		res := make([]string, 0, len(list))
		for _, item := range list {
			str, isStr := item.(string)
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

// GetArgMapSlice returns the []map[string]any the caller passed, or def when absent.
func GetArgMapSlice(args []any, index int, def []map[string]any) []map[string]any {
	val, ok := goArgValue(args, index)
	if !ok {
		return def
	}
	if res, isMaps := val.([]map[string]any); isMaps {
		return res
	}
	goArgPanic("GetArgMapSlice", index, val)
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

// GetArgFloat64 returns the number the caller passed, or def when the argument is absent.
func GetArgFloat64(args []any, index int, def float64) float64 {
	val, ok := goArgValue(args, index)
	if !ok {
		return def
	}
	switch res := val.(type) {
	case float64:
		return res
	case float32:
		return float64(res)
	case int64:
		return float64(res)
	case int:
		return float64(res)
	case int32:
		return float64(res)
	case uint:
		return float64(res)
	case uint32:
		return float64(res)
	case uint64:
		return float64(res)
	}
	goArgPanic("GetArgFloat64", index, val)
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

// Float64PtrTyped stores a numeric result boxed in `any` (ParseNumber) into a *float64 local;
// absent stays a nil pointer.
func Float64PtrTyped(v any) *float64 {
	return toFloat64Ptr(v)
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

func Ternary(cond bool, whenTrue any, whenFalse any) any {
	// forward the selected branch as a plain value, so a pointer-carried operand
	// does not leak past the ternary into ToString/Split/comparison sites
	if cond {
		return derefScalar(whenTrue)
	}
	return derefScalar(whenFalse)
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

	valueType := reflect.TypeOf(value)
	typeType := reflect.TypeOf(typ)

	// Compare the two types
	return valueType == typeType
}

func Slice(str2 any, idx1 any, idx2 any) string {
	str2 = derefScalar(str2)
	idx1 = derefScalar(idx1)
	idx2 = derefScalar(idx2)
	if str2 == nil {
		return ""
	}
	str := derefScalar(str2).(string)
	var start int64 = -1
	if idx1 != nil {
		start = ParseInt(idx1)
	}
	var lenStr int64 = int64(len(str))
	if idx2 == nil {
		if start < 0 {
			innerStart := lenStr + start
			if innerStart < 0 {
				innerStart = 0
			}
			return str[innerStart:]
		}
		return str[start:]
	} else {
		end := ParseInt(idx2)
		if start < 0 {
			start = lenStr + start
		}
		if end < 0 {
			end = lenStr + end
		}
		if end > lenStr {
			end = lenStr
		}
		return str[start:end]
	}
}

type Task func() any

func PromiseAll(tasksInterface any) <-chan any {
	return promiseAll(tasksInterface)
}

func promiseAll(tasksInterface any) <-chan any {
	ch := make(chan any)
	panicChan := make(chan any, 1) // Separate channel for panics
	var once sync.Once             // Ensure only one message is sent to ch

	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)

		// Ensure tasksInterface is a slice of channels (<-chan any)
		tasks, ok := tasksInterface.([]any)
		if !ok {
			ch <- nil // Return nil if the input is not a slice of interfaces
			return
		}

		results := make([]any, len(tasks))
		var wg sync.WaitGroup
		var resultsLock sync.Mutex

		wg.Add(len(tasks))

		for i, task := range tasks {
			go func(i int, task any) {
				defer wg.Done()

				// Capture panic and send to panicChan directly
				defer func() {
					if r := recover(); r != nil {
						if r != "break" {
							once.Do(func() { ch <- "panic:" + ToString(r) })
						}
					}
				}()

				// Await the task. A task is normally a `<-chan any` -- either a core
				// called directly, or `Spawn(...).Await()` for a call that was started
				// concurrently. A bare `*Future` (a Spawn result that was not awaited)
				// is accepted too: without this case it fell into the default below and
				// was silently recorded as nil, losing the value with no error.
				var result any
				switch typedTask := task.(type) {
				case <-chan any:
					result = <-typedTask
				case chan any:
					result = <-typedTask
				case *Future:
					result = <-typedTask.Await()
				default:
					// not awaitable: keep the historical nil rather than panicking
					result = nil
				}
				resultsLock.Lock()
				results[i] = result
				resultsLock.Unlock()
			}(i, task)
		}

		// Wait for all tasks to complete
		wg.Wait()
		close(panicChan)

		// If no panics occurred, send the results
		once.Do(func() { ch <- results })
	}()

	return ch
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

func MathMin(a, b any) any {
	return mathMin(a, b)
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

func MathPow(base any, exp any) float64 {
	base64 := ToFloat64(base)
	exp64 := ToFloat64(exp)
	return math.Pow(base64, exp64)
}

func MathAbs(v any) float64 {
	v = derefScalar(v)
	switch n := v.(type) {
	case float64:
		return math.Abs(n)
	case float32:
		return math.Abs(float64(n))
	case int:
		return math.Abs(float64(n))
	case int64:
		return math.Abs(float64(n))
	case int32:
		return math.Abs(float64(n))
	case int16:
		return math.Abs(float64(n))
	case int8:
		return math.Abs(float64(n))
	case uint, uint64, uint32, uint16, uint8:
		return float64(reflect.ValueOf(n).Uint()) // no need for Abs on unsigned values
	default:
		return 0
	}
}

func MathMax(a, b any) any {
	return mathMax(a, b)
}

// mathMax returns the maximum of two values of the same type.
// It supports int, float64, and string types.
func mathMax(a, b any) any {
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

	if af > bf {
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

func OpNeg(value any) any {
	value = derefScalar(value)
	val := reflect.ValueOf(value)

	switch val.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return -val.Int()
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		return nil // Cannot negate unsigned integers, return nil
	case reflect.Float32, reflect.Float64:
		return -val.Float()
	case reflect.Complex64, reflect.Complex128:
		return -val.Complex()
	default:
		return nil // Unsupported type, return nil
	}
}

func JsonStringify(obj any) string {
	obj = derefScalar(obj)
	if obj == nil {
		return ""
	}

	// Check if the object is an error (Go's equivalent of an exception)
	if err, ok := obj.(error); ok {
		// Create an anonymous struct with the error type name
		errorObj := struct {
			Name string `json:"name"`
		}{
			Name: reflect.TypeOf(err).Name(),
		}
		// Serialize the error object to JSON
		jsonData, _ := json.Marshal(errorObj)
		return string(jsonData)
	}

	// Serialize the object to JSON
	jsonData, _ := json.Marshal(obj)
	return string(jsonData)
}

func ToFixed(number any, decimals any) float64 {
	// Assert that the number is a float64 or convert it
	num := ToFloat64(number)

	// Assert that the decimals is an int or convert it
	dec := ParseInt(decimals)
	// Calculate the rounding multiplier
	multiplier := math.Pow(10, float64(dec))
	return math.Round(num*multiplier) / multiplier
}

func Remove(dict any, key any) {
	// Attempt to cast the key to string first
	keyStr, ok := derefScalar(key).(string)
	if !ok {
		// Panic if the key is not a string
		panic("provided key is not a string")
	}
	switch v := dict.(type) {
	case ArrayCache, *ArrayCache, ArrayCacheByTimestamp, *ArrayCacheByTimestamp, ArrayCacheBySymbolById, *ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, *ArrayCacheBySymbolBySide:
		v.(interface{ Remove(string) }).Remove(keyStr)
		return
	case map[string]*ArrayCache:
		if _, exists := v[keyStr]; !exists {
			panic(fmt.Sprintf("key '%s' does not exist in the map", keyStr))
		}
		if cache := v[keyStr]; cache != nil {
			cache.Remove(keyStr)
		}
		delete(v, keyStr)
		return
	case map[string]*ArrayCacheByTimestamp:
		if _, exists := v[keyStr]; !exists {
			panic(fmt.Sprintf("key '%s' does not exist in the map", keyStr))
		}
		if cache := v[keyStr]; cache != nil {
			cache.Remove(keyStr)
		}
		delete(v, keyStr)
		return
	case map[string]*ArrayCacheBySymbolById:
		if _, exists := v[keyStr]; !exists {
			panic(fmt.Sprintf("key '%s' does not exist in the map", keyStr))
		}
		if cache := v[keyStr]; cache != nil {
			cache.Remove(keyStr)
		}
		delete(v, keyStr)
		return
	case map[string]*ArrayCacheBySymbolBySide:
		if _, exists := v[keyStr]; !exists {
			panic(fmt.Sprintf("key '%s' does not exist in the map", keyStr))
		}
		if cache := v[keyStr]; cache != nil {
			cache.Remove(keyStr)
		}
		delete(v, keyStr)
		return
	case *sync.Map:
		// the javascript delete statement is a no-op on a missing key and
		// never throws, mirror that semantic instead of panicking, concurrent
		// transpiled deletes of the same key raced here and panicked the loser
		v.Delete(keyStr)
		return
	case map[string]any:
		// the javascript delete statement is a no-op on a missing key
		delete(v, keyStr)
		return
	default:
		panic(fmt.Sprintf("exchange_helpers.Remove: provided value type is %T", v))
	}
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

// delegates to the package-level predicate, which returns a bool
func (this *BaseExchange) IsDictionary(value any) bool {
	return IsDictionary(value)
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

func CallInternalMethod(methodCache *sync.Map, itf any, name2 string, args ...any) <-chan any {
	name := Capitalize(name2)
	// baseValue := reflect.ValueOf(itf)
	// baseType := baseValue.Type()
	// if !this.cacheLoaded {
	// 	this.cacheLoaded = true
	// 	this.WarmUpCache()
	// }
	ch := make(chan any)
	go func() {

		// Error handling
		defer func() {
			if r := recover(); r != nil {
				ch <- fmt.Sprintf("panic:%v:%v:%v", getCallerName(), name2, r)
				close(ch)
			}
		}()

		// dynamic callers name the unified method (fetchTicker). Its channel form is the
		// Async-suffixed trampoline; the plain name is the typed sync method (or a plain
		// sync helper when no trampoline exists), so the trampoline is looked up first.
		cacheKey := fmt.Sprintf("%s", name)
		cachedMethod, found := methodCache.Load(cacheKey + asyncMethodSuffix)
		if !found {
			cachedMethod, found = methodCache.Load(cacheKey)
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
			if k < len(args) {
				if args[k] == nil {
					paramType := methodType.In(k + 1) // Account for receiver not being part of args
					in = append(in, reflect.Zero(paramType))
				} else {
					in = append(in, reflect.ValueOf(args[k]))
				}
			} else {
				paramType := methodType.In(k + 1) // Account for receiver not being part of args
				in = append(in, reflect.Zero(paramType))
			}
		}

		if isVariadic && len(args) >= numIn-1 {
			variadicType := methodType.In(numIn - 1).Elem() // Get the type of the variadic argument
			for k := numIn - 1; k < len(args); k++ {
				if args[k] == nil {
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
					if boxed, isBoxed := out.(interface{ Boxed() any }); isBoxed {
						out = boxed.Boxed()
					}
					ch <- out // pass the value to the output channel
				}
				close(ch) // close the output channel after all values are received
			}()
			return
		} else if len(res) > 0 {
			ch <- res[0].Interface()
		} else {
			ch <- nil
		}

		// ch <- nil // nught be causing a mem leak
		close(ch)
	}()
	return ch
}

// PanicOnError re-panics when msg carries a failure, and otherwise returns msg so a typed
// receive can convert it in the same frame.
func PanicOnError(msg any) any {
	caller := getCallerName()
	checked := msg
	if boxed, ok := msg.(interface{ Boxed() any }); ok {
		// typed endpoint results are checked on their untyped payload
		checked = boxed.Boxed()
	}
	switch v := checked.(type) {
	case string:
		if strings.HasPrefix(v, "panic:") {
			stack := debug.Stack()[:300]
			panicMsg := fmt.Sprintf("panic:%v:%v\nStack trace:\n%s", caller, v, stack)
			panic(panicMsg)
		}
	case []any:
		for _, item := range v {
			if str, ok := item.(string); ok && strings.HasPrefix(str, "panic:") {
				stack := debug.Stack()[:300]
				panicMsg := fmt.Sprintf("%s\nStack trace:\n%s", str, stack)
				panic(panicMsg)
			} else if nestedSlice, ok := item.([]any); ok {
				// Handle nested []any cases recursively
				PanicOnError(nestedSlice)
			}
		}
	case *Error:
		stack := debug.Stack()[:300]
		panicMsg := fmt.Sprintf("ccxt.Error:%v:%v\nStack trace:\n%s", caller, v, stack)
		panic(panicMsg)
	case error:
		stack := debug.Stack()[:300]
		panicMsg := fmt.Sprintf("error:%v:%v\nStack trace:\n%s", caller, v, stack)
		panic(panicMsg)
	default:
		return msg
	}
	return msg
}

// PanicMessage renders a recovered value into the same "panic:<msg>\nStack trace:\n<stack>"
// string that ReturnPanicError pushes into an async core's channel, so that IsError,
// CreateReturnError and PanicOnError recognise it downstream.
//
// It exists for recover sites that own a *Future instead of a `chan any` (Spawn), where the
// blocking `ch <- panicMsg` of ReturnPanicError is not applicable. ReturnPanicError is left
// byte-for-byte untouched on purpose: legacy unbuffered cores rely on that send blocking.
// Keep the two formatters in sync.
func PanicMessage(r any) string {
	stack := debug.Stack()
	strErr := ToString(r)
	if !strings.HasPrefix(strErr, "panic:") {
		return fmt.Sprintf("panic:%s\nStack trace:\n%s", strErr, stack)
	}
	return fmt.Sprintf("%s\nStack trace:\n%s", strErr, stack)
}

func ReturnPanicError(ch chan any) {
	// https://stackoverflow.com/questions/72651899/why-golang-can-not-recover-from-a-panic-in-a-function-called-by-the-defer-functi
	if r := recover(); r != nil {
		if r != "break" {
			stack := debug.Stack()
			strErr := ToString(r)
			var panicMsg string
			if !strings.HasPrefix(strErr, "panic:") {
				panicMsg = fmt.Sprintf("panic:%s\nStack trace:\n%s", strErr, stack)
			} else {
				panicMsg = fmt.Sprintf("%s\nStack trace:\n%s", strErr, stack)
			}
			ch <- panicMsg
		}
	}
}

// AsyncResult is one received async-core value converted to T; Err is set (and Value zero) on failure.
type AsyncResult[T any] struct {
	Value T
	Err   error
}

// AwaitResult receives once from an async core; on success conv builds the typed Value.
func AwaitResult[T any](conv func(any) T, ch <-chan any) AsyncResult[T] {
	v := <-ch
	if IsError(v) {
		return AsyncResult[T]{Err: CreateReturnError(v)}
	}
	return AsyncResult[T]{Value: conv(v)}
}

// AssertAs is the checked type assertion as a converter value.
func AssertAs[T any](v any) T {
	return v.(T)
}

// Untyped is the identity converter for results whose declared type is any.
func Untyped(v any) any {
	return v
}

// EndpointResult carries one implicit-API response: Raw is exactly what Fetch2Async
// delivered (the response or a "panic:..." string), Value its typed view (zero on shape mismatch).
type EndpointResult[T any] struct {
	Value T
	Raw   any
}

// Boxed returns the untyped response for reflective and forwarding consumers.
func (r EndpointResult[T]) Boxed() any {
	return r.Raw
}

func endpointValue[T any](raw any) T {
	var out T
	if s, ok := raw.(string); ok && strings.HasPrefix(s, "panic:") {
		return out
	}
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

// Fetch2Result relays the single Fetch2Async value unchanged in Raw, adding its typed view.
func Fetch2Result[T any](this interface {
	Fetch2Async(path any, optionalArgs ...any) <-chan any
}, path any, optionalArgs ...any) <-chan EndpointResult[T] {
	out := make(chan EndpointResult[T], 1)
	in := this.Fetch2Async(path, optionalArgs...)
	go func() {
		defer close(out)
		defer ReturnPanicErrorT(out)
		raw, ok := <-in
		if !ok {
			return
		}
		out <- EndpointResult[T]{Value: endpointValue[T](raw), Raw: raw}
	}()
	return out
}

// EndpointRaw adapts a typed endpoint channel to the boxed channel PromiseAll and any-typed holders expect.
func EndpointRaw[T any](in <-chan EndpointResult[T]) <-chan any {
	out := make(chan any, 1)
	go func() {
		defer close(out)
		if r, ok := <-in; ok {
			out <- r.Raw
		}
	}()
	return out
}

// ReturnPanicErrorT is ReturnPanicError for an EndpointResult channel; keep the two formatters in sync.
func ReturnPanicErrorT[T any](ch chan EndpointResult[T]) {
	if r := recover(); r != nil {
		if r != "break" {
			stack := debug.Stack()
			strErr := ToString(r)
			var panicMsg string
			if !strings.HasPrefix(strErr, "panic:") {
				panicMsg = fmt.Sprintf("panic:%s\nStack trace:\n%s", strErr, stack)
			} else {
				panicMsg = fmt.Sprintf("%s\nStack trace:\n%s", strErr, stack)
			}
			ch <- EndpointResult[T]{Raw: panicMsg}
		}
	}
}

func GetCallerName() string {
	return getCallerName()
}

func getCallerName() string {
	// Skip 2 levels to get the name of the caller of the function that called this one
	pc, _, _, ok := runtime.Caller(3)
	if !ok {
		return "Unknown"
	}

	fn := runtime.FuncForPC(pc)
	if fn == nil {
		return "Unknown"
	}

	return fn.Name()
}

func Print(v any) {
	fmt.Println(v)
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

// the printed element read of a destructured binding, as a bool: the same box the untyped
// `GetValue` read, folded to def when it is absent, nil or not a bool. `x == true` answered
// exactly that for the untyped box.
func GetValueBool(v any, index int, def bool) bool {
	val := GetValue(v, index)
	if b, ok := val.(bool); ok {
		return b
	}
	return def
}
