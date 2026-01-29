package ccxt

import (
	"bytes"
	"compress/flate"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
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

func UnWrapType(value interface{}) interface{} {
	// converts from wrapped types to basic types
	// like OrderBook, Ticker, Trade, etc to map[string]interface{} or []interface{}
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

func Add(a interface{}, b interface{}) interface{} {
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

func IsTrue(a interface{}) bool {
	return EvalTruthy(a)
}

// EvalTruthy determines if a single interface value is truthy.
func EvalTruthy(val interface{}) bool {
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
	case []interface{}:
		return len(v) > 0
	case map[string]interface{}:
		return len(v) > 0
	case *sync.Map:
		if v == nil {
			return false
		}
		hasAny := false
		v.Range(func(_, _ interface{}) bool {
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

// func IsInteger(value interface{}) bool {
// 	switch value.(type) {
// 	case int, int8, int16, int32, int64:
// 		return true
// 	case uint, uint8, uint16, uint32, uint64:
// 		return true
// 	default:
// 		return false
// 	}
// }

func IsInteger(value interface{}) bool {
	switch v := value.(type) {
	case int, int8, int16, int32, int64:
		return true
	case uint, uint8, uint16, uint32, uint64:
		return true
	case float32, float64:
		// Check if the float has no fractional part
		return v == math.Trunc(v.(float64))
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

// func GetValue(collection interface{}, key interface{}) interface{} {

// 	if collection == nil {
// 		return nil
// 	}
// 	if key == nil {
// 		return nil
// 	}

// 	keyNum := -1
// 	keyStr, ok := key.(string)
// 	if !ok {
// 		keyNum64 := ParseInt(key)
// 		if keyNum64 == math.MinInt64 {
// 			return nil
// 		}
// 		keyNum = int(keyNum64)
// 	}

// 	_, isMap := collection.(map[string]interface{})

// 	if isMap || keyNum != -1 {
// 		switch v := collection.(type) {
// 		case map[string]interface{}:
// 			if !ok {
// 				return nil
// 			}
// 			if val, ok := v[keyStr]; ok {
// 				return val
// 			}
// 			return nil
// 		case []interface{}:
// 			if keyNum >= len(v) {
// 				return nil
// 			}
// 			return v[keyNum]
// 		case []string:
// 			if keyNum >= len(v) {
// 				return nil
// 			}
// 			return v[keyNum]
// 		case []int64:
// 			if keyNum >= len(v) {
// 				return nil
// 			}
// 			return v[keyNum]
// 		case []float64:
// 			if keyNum >= len(v) {
// 				return nil
// 			}
// 			return v[keyNum]
// 		case []bool:
// 			if keyNum >= len(v) {
// 				return nil
// 			}
// 			return v[keyNum]
// 		case []int:
// 			if keyNum >= len(v) {
// 				return nil
// 			}
// 			return v[keyNum]
// 		case string:
// 			if keyNum >= len(v) {
// 				return nil
// 			}
// 			return string(v[keyNum])
// 		}
// 	}

// 	// this is needed in checkRequiredCredentials or alike
// 	reflectValue := reflect.ValueOf(collection)

// 	if reflectValue.Kind() == reflect.Ptr {
// 		reflectValue = reflectValue.Elem()
// 	}
// 	if reflectValue.Kind() == reflect.Struct {
// 		stringKey := key.(string)
// 		stringKeyCapitalized := Capitalize(stringKey)
// 		field := reflectValue.FieldByName(stringKey)

// 		fieldCapitalized := reflectValue.FieldByName(stringKeyCapitalized)
// 		if fieldCapitalized.IsValid() {
// 			return fieldCapitalized.Interface()
// 		}

// 		if field.IsValid() {
// 			return field.Interface()
// 		}

// 		return nil
// 	}

// 	switch reflectValue.Kind() {
// 	case reflect.Slice, reflect.Array:
// 		// Handle slice or array: key should be an integer index.
// 		index2 := ParseInt(key)
// 		if index2 == math.MinInt64 {
// 			return nil // Key is not an int, invalid index
// 		}
// 		index := int(index2)
// 		if index < 0 || index >= reflectValue.Len() {
// 			return nil // Index out of bounds
// 		}
// 		return reflectValue.Index(index).Interface()

// 	case reflect.Map:
// 		// Handle map: key needs to be appropriate for the map
// 		keyStr, ok := key.(string)
// 		if !ok {
// 			return nil // Key is not a string, invalid key
// 		}
// 		reflectKeyValue := reflect.ValueOf(keyStr)
// 		if reflectValue.MapIndex(reflectKeyValue).IsValid() {
// 			return reflectValue.MapIndex(reflectKeyValue).Interface()
// 		}
// 		return nil

// 	default:
// 		// Type not supported
// 		return nil
// 	}
// }

func GetValue(collection interface{}, key interface{}) interface{} {

	if collection == nil || key == nil {
		return nil
	}

	keyNum := -1
	keyStr, isStr := key.(string)
	if !isStr {
		keyNum64 := ParseInt(key)
		if keyNum64 == math.MinInt64 {
			return nil
		}
		keyNum = int(keyNum64)
	}

	switch v := collection.(type) {
	case map[string]interface{}:
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
	case []interface{}:
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
	}

	// this is needed in checkRequiredCredentials or alike
	reflectValue := reflect.ValueOf(collection)

	if reflectValue.Kind() == reflect.Ptr {
		reflectValue = reflectValue.Elem()
	}
	if reflectValue.Kind() == reflect.Struct {
		stringKey := key.(string)
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

func Multiply(a, b interface{}) interface{} {

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

func Divide(a, b interface{}) interface{} {

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

func Subtract(a, b interface{}) interface{} {

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

	// if !aVal.IsValid() || !bVal.IsValid() || !aVal.Type().ConvertibleTo(bVal.Type()) {
	// 	return nil
	// }

	// aValConverted := aVal.Convert(bVal.Type())

	// switch bVal.Kind() {
	// case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
	// 	return aValConverted.Int() - bVal.Int()
	// case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
	// 	return aValConverted.Uint() - bVal.Uint()
	// case reflect.Float32, reflect.Float64:
	// 	aFloat := ToFloat64(a)
	// 	bFloat := ToFloat64(b)
	// 	res := aFloat - bFloat
	// 	if IsInteger(res) {
	// 		return ParseInt(res)
	// 	}
	// 	return res
	// default:
	// 	return nil
	// }
}

type Dict map[string]interface{}

// GetArrayLength returns the length of various array or slice types or string length.
func GetArrayLength(value interface{}) int {
	if value == nil {
		return 0
	}

	switch v := value.(type) {
	case [][]interface{}: // TODO: double/triple arrays of all the types
		return len(v)
	case []interface{}:
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
	case []map[string]interface{}:
		return len(v)
	case string:
		return len(v) // should we do it here?
	case IOrderBookSide:
		return v.Len()
	case IArrayCache:
		return len(v.ToArray())
	case interface{}:
		if array, ok := value.([]interface{}); ok {
			return len(array)
		}
		// handle interface {}(*interface {}) *[]interface {}
		if arrayPtr, ok := value.(*[]interface{}); ok {
			return len(*arrayPtr)
		}

		if interfacePtr, ok := value.(*interface{}); ok {
			if array, ok := (*interfacePtr).([]interface{}); ok {
				return len(array)
			}
			if arrayPtr, ok := (*interfacePtr).(*[]interface{}); ok {
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

func IsGreaterThan(a, b interface{}) bool {
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
func IsLessThan(a, b interface{}) bool {
	return !IsGreaterThan(a, b) && !IsEqual(a, b)
}

// IsGreaterThanOrEqual checks if a is greater than or equal to b
func IsGreaterThanOrEqual(a, b interface{}) bool {
	return IsGreaterThan(a, b) || IsEqual(a, b)
}

// IsLessThanOrEqual checks if a is less than or equal to b
func IsLessThanOrEqual(a, b interface{}) bool {
	return IsLessThan(a, b) || IsEqual(a, b)
}

// Mod performs a modulus operation on a and b
func Mod(a, b interface{}) interface{} {
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
func IsEqual(a, b interface{}) bool {
	if a == nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
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
func NormalizeAndConvert(a, b interface{}) (reflect.Value, reflect.Value, bool) {
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

func ToFloat64(v interface{}) float64 {
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

func Increment(a interface{}) interface{} {
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
func Decrement(a interface{}) interface{} {
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
func Negate(a interface{}) interface{} {
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
func UnaryPlus(a interface{}) interface{} {
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
func PlusEqual(a, value interface{}) interface{} {
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

// func AppendToArray(slicePtr *interface{}, element interface{}) {
// 	array := (*slicePtr).([]interface{})
// 	*slicePtr = append(array, element)
// }

func AppendToArray(slicePtr *interface{}, element interface{}) {
	// // Check if slicePtr is nil, which indicates we received a function return value
	// // In this case, we need to handle it differently
	// if slicePtr == nil {
	// 	// This shouldn't happen with proper usage, but we'll handle it gracefully
	// 	return
	// }

	switch array := (*slicePtr).(type) {
	case []interface{}:
		*slicePtr = append(array, element)
	case []string:
		if strElement, ok := element.(string); ok {
			*slicePtr = append(array, strElement)
		} else {
			// Handle the case where the element is not a string if needed
			// fmt.Println("Error: element is not a string")
		}
	case interface{}:
		if array, ok := array.([]interface{}); ok {
			*slicePtr = append(array, element)
		}
	default:
		// In typescript OrderBookSide extends Array, so some work arounds are made so that the expected behaviour is achieved in the transpiled code
		if obs, ok := (*slicePtr).(IOrderBookSide); ok {
			*slicePtr = append(obs.GetData(), element.([]interface{}))
		}
		// fmt.Println("Error: Unsupported slice type")
	}
}

// without reflection
func AddElementToObject(arrayOrDict interface{}, stringOrInt interface{}, value interface{}) {

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
	case []interface{}:
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
	case map[string]interface{}:
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
			} else if _, ok := value.(map[string]interface{}); ok {
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
			field := val.FieldByName(Capitalize(stringOrInt.(string))) // do remove reflection here??
			if field.IsValid() && field.CanSet() {
				if value != nil {
					// Convert value to the correct type
					valueVal := reflect.ValueOf(value)
					if valueVal.Type().ConvertibleTo(field.Type()) {
						field.Set(valueVal.Convert(field.Type()))
					}
				}
			}
		}
		// return fmt.Errorf("unsupported type: %T", arrayOrDict)
	}
}

// func AddElementToObject(arrayOrDict interface{}, stringOrInt interface{}, value interface{}) {
// 	val := reflect.ValueOf(arrayOrDict)
// 	key := reflect.ValueOf(stringOrInt)
// 	valueVal := reflect.ValueOf(value)

// 	switch val.Kind() {
// 	case reflect.Slice:
// 		if key.Kind() != reflect.Int {
// 			// return fmt.Errorf("index must be an integer for slices")
// 		}
// 		index := int(key.Int())
// 		if index < 0 || index >= val.Len() {
// 			// return fmt.Errorf("index out of range")
// 		}
// 		val.Index(index).Set(valueVal)
// 	case reflect.Map:
// 		if !key.Type().AssignableTo(val.Type().Key()) {
// 			// return fmt.Errorf("key type %s does not match map key type %s", key.Type(), val.Type().Key())
// 		}
// 		// if !valueVal.Type().AssignableTo(val.Type().Elem()) {
// 		// 	// return fmt.Errorf("value type %s does not match map value type %s", valueVal.Type(), val.Type().Elem())
// 		// }
// 		// fmt.Println("key", key.Interface())
// 		// fmt.Println("value", valueVal.Interface())
// 		if !valueVal.IsValid() {
// 			val.SetMapIndex(key, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
// 		} else {
// 			val.SetMapIndex(key, valueVal)
// 		}
// 	default:
// 		// return fmt.Errorf("unsupported type: %s", val.Kind())
// 	}
// 	// return nil
// }

func InOp(dict interface{}, key interface{}) bool {

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
	case map[string]interface{}:
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
	case map[string]map[string]*ArrayCacheByTimestamp:
		if keyStr, ok2 := key.(string); ok2 {
			addElementMu.Lock()
			_, ok3 := v[keyStr]
			addElementMu.Unlock()
			if ok3 {
				return true
			}
		}
	case map[string]*ArrayCacheByTimestamp:
		if keyStr, ok2 := key.(string); ok2 {
			addElementMu.Lock()
			_, ok3 := v[keyStr]
			addElementMu.Unlock()
			if ok3 {
				return true
			}
		}
	case map[string]*ArrayCache:
		if keyStr, ok2 := key.(string); ok2 {
			addElementMu.Lock()
			_, ok3 := v[keyStr]
			addElementMu.Unlock()
			if ok3 {
				return true
			}
		}
	case map[string]*ArrayCacheBySymbolBySide:
		if keyStr, ok2 := key.(string); ok2 {
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

// func InOp(dict interface{}, key interface{}) bool {

// 	if dict == nil {
// 		return false
// 	}
// 	if key == nil {
// 		return false
// 	}

// 	if IsNumber(key) {
// 		return false
// 	}

// 	switch v := dict.(type) {
// 	case map[string]interface{}:
// 		if _, ok := v[key.(string)]; ok {
// 			return true
// 		}
// 	}

// 	return false
// 	// dictVal := reflect.ValueOf(dict)

// 	// // Ensure that the provided dict is a map
// 	// if dictVal.Kind() != reflect.Map {
// 	// 	return false
// 	// }

// 	// keyVal := reflect.ValueOf(key)

// 	// // Check if the map has the provided key todo:debug here
// 	// if dictVal.MapIndex(keyVal).IsValid() {
// 	// 	return true
// 	// }
// 	// return false
// }

func GetIndexOf(str interface{}, target interface{}) int {
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
func IsBool(v interface{}) bool {
	if v == nil {
		return false
	}
	_, ok := v.(bool)
	return ok
}

// IsDictionary checks if the input is a map (dictionary in Python)
func IsDictionary(v interface{}) bool {
	if v == nil {
		return false
	}
	switch v.(type) {
	case map[string]interface{}:
		return true
	case *sync.Map:
		return true
	case Dict:
		return true
	case map[interface{}]interface{}:
		return true
	default:
		return false
	}
	// return reflect.TypeOf(v).Kind() == reflect.Map
}

// IsString checks if the input is a string
func IsString(v interface{}) bool {
	if v == nil {
		return false
	}
	_, ok := v.(string)
	return ok
}

// IsInt checks if the input is an integer
func IsInt(v interface{}) bool {
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
func IsFunction(v interface{}) bool {
	if v == nil {
		return false
	}
	return reflect.TypeOf(v).Kind() == reflect.Func
}

func IsNumber(v interface{}) bool {
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

func IsObject(v interface{}) bool {
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

func ToLower(v interface{}) string {
	if str, ok := v.(string); ok {
		return strings.ToLower(str)
	}
	return ""
}

// ToUpper converts a string to uppercase
func ToUpper(v interface{}) string {
	if str, ok := v.(string); ok {
		return strings.ToUpper(str)
	}
	return ""
}

// IsInt checks if the input is an integer
// func IsInt(v interface{}) bool {
// 	switch v.(type) {
// 	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
// 		return true
// 	default:
// 		return false
// 	}
// }

// MathFloor returns the largest integer less than or equal to the given number
func MathFloor(v interface{}) float64 {
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
func MathCeil(v interface{}) float64 {
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
func MathRound(v interface{}) float64 {
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
func StartsWith(v interface{}, prefix interface{}) bool {
	if str, ok := v.(string); ok {
		prefixStr := ToString(prefix)
		return strings.HasPrefix(str, prefixStr)
	}
	return false
}

// EndsWith checks if the string ends with the specified suffix
func EndsWith(v interface{}, suffix interface{}) bool {
	if str, ok := v.(string); ok {
		suffixStr := ToString(suffix)
		return strings.HasSuffix(str, suffixStr)
	}
	return false
}

// IndexOf returns the index of the first occurrence of a substring
func IndexOf(v interface{}, substr interface{}) int {
	if str, ok := v.(string); ok {
		substrStr := ToString(substr)
		return strings.Index(str, substrStr)
	}
	return -1
}

// Trim removes leading and trailing whitespace from a string
func Trim(v interface{}) string {
	if str, ok := v.(string); ok {
		return strings.TrimSpace(str)
	}
	return ""
}

// Contains checks if the string contains the specified substring
func Contains(v interface{}, substr interface{}) bool {
	if str, ok := v.(string); ok {
		substrStr := ToString(substr)
		return strings.Contains(str, substrStr)
	}
	return false
}

func ToString(v interface{}) string {
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

func Join(slice interface{}, sep interface{}) string {
	sepStr := ToString(sep)
	var strSlice []string

	switch v := slice.(type) {
	case []string:
		strSlice = v
	case []interface{}:
		for _, elem := range v {
			strSlice = append(strSlice, ToString(elem))
		}
	default:
		return ""
	}

	return strings.Join(strSlice, sepStr)
}

// Split splits a string into a slice of substrings separated by a separator
func Split(str interface{}, sep interface{}) []string {
	strVal, ok := str.(string)
	if !ok {
		return nil
	}

	sepStr := ToString(sep)
	return strings.Split(strVal, sepStr)
}

// ObjectKeys returns the keys of a map as a slice of strings
func ObjectKeys(v interface{}) []string {

	if v == nil {
		return nil
	}

	if mapObject, ok := v.(map[string]interface{}); ok {
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
		syncMap.Range(func(k, _ interface{}) bool {
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

// ObjectValues returns the values of a map as a slice of interface{}
func ObjectValues(v interface{}) []interface{} {
	if v == nil {
		return nil
	}
	// return values
	if mapObject, ok := v.(map[string]interface{}); ok {
		values := make([]interface{}, 0, len(mapObject))
		for _, value := range mapObject {
			values = append(values, value)
		}
		return values
	} else if syncMap, ok := v.(*sync.Map); ok {
		values := []interface{}{}
		if syncMap == nil {
			return values
		}
		syncMap.Range(func(_, value interface{}) bool {
			values = append(values, value)
			return true
		})
		return values
	}
	return nil
	// val := ref
}

func JsonParse(jsonStr2 interface{}) interface{} {
	jsonStr := jsonStr2.(string)
	var result interface{}
	err := json.Unmarshal([]byte(jsonStr), &result)
	if err != nil {
		return nil
	}
	return result
}

func IsArray(v interface{}) bool {
	if v == nil {
		return false
	}
	switch v.(type) {
	case []interface{}, [][]interface{}:
		return true
	case []map[string]interface{}:
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

func Shift(slice interface{}) (interface{}, interface{}) {
	sliceVal, ok := castToSlice(slice)
	if !ok || len(sliceVal) == 0 {
		return slice, nil
	}
	return sliceVal[1:], sliceVal[0]
}

// Reverse reverses the elements of a slice in place
func Reverse(slice interface{}) {
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

// Pop removes the last element from a slice and returns the new slice and the removed element
func Pop(slice interface{}) (interface{}, interface{}) {
	sliceVal, ok := castToSlice(slice)
	if !ok || len(sliceVal) == 0 {
		return slice, nil
	}
	return sliceVal[:len(sliceVal)-1], sliceVal[len(sliceVal)-1]
}

func CastToSlice(slice interface{}) ([]interface{}, bool) {
	return castToSlice(slice)
}

// Helper function to cast interface{} to []interface{}
func castToSlice(slice interface{}) ([]interface{}, bool) {
	val := reflect.ValueOf(slice)
	if val.Kind() != reflect.Slice {
		return nil, false
	}

	sliceVal := make([]interface{}, val.Len())
	for i := 0; i < val.Len(); i++ {
		sliceVal[i] = val.Index(i).Interface()
	}
	return sliceVal, true
}

func Replace(input interface{}, old interface{}, new interface{}) string {
	str := ToString(input)
	oldStr := ToString(old)
	newStr := ToString(new)
	return strings.ReplaceAll(str, oldStr, newStr)
}

// PadEnd pads the input string on the right with padStr until it reaches the specified length
func PadEnd(input interface{}, length2 interface{}, padStr interface{}) string {
	length := int(ParseInt(length2))
	str := ToString(input)
	pad := ToString(padStr)
	for len(str) < length {
		str += pad
	}
	return str[:length]
}

// PadStart pads the input string on the left with padStr until it reaches the specified length
func PadStart(input interface{}, length2 interface{}, padStr interface{}) string {
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

func GetLength(v interface{}) int {
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

func IsNil(x interface{}) bool {
	// https://blog.devtrovert.com/p/go-secret-interface-nil-is-not-nil
	if x == nil {
		return true
	}
	return false

	// switch val := x.(type){
	// case interface{}:
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

func GetArg(v []interface{}, index int, def interface{}) interface{} {
	if len(v) <= index {
		return def
	}
	val := v[index]

	if val == nil {
		return def
	}

	if res, ok := val.([]interface{}); ok { // this is not working well with safeList(x, 'key', []) but works for fetchTrade(s, options interface{}...)
		// if len(res) == 0 {
		// 	return def
		// }
		if res == nil {
			return def
		}
	}

	// do we need this??
	// if IsNil(val) { // check  https://blog.devtrovert.com/p/go-secret-interface-nil-is-not-nil
	// 	return def
	// }

	return val
}

func Ternary(cond bool, whenTrue interface{}, whenFalse interface{}) interface{} {
	if cond {
		return whenTrue
	}
	return whenFalse
}

func IsInstance(value interface{}, typ interface{}) bool {
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

func Slice(str2 interface{}, idx1 interface{}, idx2 interface{}) string {
	if str2 == nil {
		return ""
	}
	str := str2.(string)
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

type Task func() interface{}

func PromiseAll(tasksInterface interface{}) <-chan interface{} {
	return promiseAll(tasksInterface)
}

func promiseAll(tasksInterface interface{}) <-chan interface{} {
	ch := make(chan interface{})
	panicChan := make(chan interface{}, 1) // Separate channel for panics
	var once sync.Once                     // Ensure only one message is sent to ch

	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)

		// Ensure tasksInterface is a slice of channels (<-chan interface{})
		tasks, ok := tasksInterface.([]interface{})
		if !ok {
			ch <- nil // Return nil if the input is not a slice of interfaces
			return
		}

		results := make([]interface{}, len(tasks))
		var wg sync.WaitGroup
		var resultsLock sync.Mutex

		wg.Add(len(tasks))

		for i, task := range tasks {
			go func(i int, task interface{}) {
				defer wg.Done()

				// Capture panic and send to panicChan directly
				defer func() {
					if r := recover(); r != nil {
						if r != "break" {
							once.Do(func() { ch <- "panic:" + ToString(r) })
						}
					}
				}()

				// Assert the task is a channel
				if chanTask, ok := task.(<-chan interface{}); ok {
					// Receive the result from the channel
					result := <-chanTask
					resultsLock.Lock()
					results[i] = result
					resultsLock.Unlock()
				} else {
					// If the task is not a channel, set the result to nil
					resultsLock.Lock()
					results[i] = nil
					resultsLock.Unlock()
				}
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

// func promiseAll(tasksInterface interface{}) <-chan interface{} {
// 	ch := make(chan interface{})
// 	panicChan := make(chan interface{}, 1) // Separate channel for panics

// 	go func() {
// 		defer close(ch)

// 		// Ensure tasksInterface is a slice of channels (<-chan interface{})
// 		tasks, ok := tasksInterface.([]interface{})
// 		if !ok {
// 			ch <- nil // Return nil if the input is not a slice of interfaces
// 			return
// 		}

// 		results := make([]interface{}, len(tasks))
// 		var wg sync.WaitGroup
// 		wg.Add(len(tasks))

// 		for i, task := range tasks {
// 			go func(i int, task interface{}) {
// 				defer wg.Done()
// 				defer ReturnPanicError(panicChan)

// 				// Assert the task is a channel
// 				if chanTask, ok := task.(<-chan interface{}); ok {
// 					// Receive the result from the channel
// 					results[i] = <-chanTask
// 				} else {
// 					// If the task is not a channel, set the result to nil
// 					results[i] = nil
// 				}
// 			}(i, task)
// 		}

// 		// Wait for all tasks to complete
// 		wg.Wait()
// 		close(panicChan)

// 		// Check if any panics occurred and report the first one
// 		select {
// 		case panicMsg := <-panicChan:
// 			ch <- panicMsg // Send the panic message
// 		default:
// 			ch <- results // No panics, send results
// 		}
// 	}()

// 	return ch
// }

// func promiseAll(tasksInterface interface{}) <-chan interface{} {
// 	ch := make(chan interface{})

// 	go func() {
// 		defer close(ch)
// 		defer func() {
// 			if r := recover(); r != nil {
// 				if r != "break" {
// 					ch <- "panic:" + ToString(r)
// 				}
// 			}
// 		}()

// 		// Ensure tasksInterface is a slice of channels (<-chan interface{})
// 		tasks, ok := tasksInterface.([]interface{})
// 		if !ok {
// 			ch <- nil // Return nil if the input is not a slice of interfaces
// 			return
// 		}

// 		results := make([]interface{}, len(tasks))
// 		var wg sync.WaitGroup
// 		wg.Add(len(tasks))

// 		// A separate channel to capture panics
// 		panicChan := make(chan string, len(tasks))

// 		for i, task := range tasks {
// 			go func(i int, task interface{}) {
// 				defer wg.Done()
// 				defer func() {
// 					if r := recover(); r != nil {
// 						if r != "break" {
// 							panicChan <- "panic:" + ToString(r)
// 						}
// 					}
// 				}()

// 				// Assert the task is a channel
// 				if chanTask, ok := task.(<-chan interface{}); ok {
// 					// Receive the result from the channel
// 					results[i] = <-chanTask
// 				} else {
// 					// If the task is not a channel, set the result to nil
// 					results[i] = nil
// 				}
// 			}(i, task)
// 		}

// 		// Wait for all tasks to complete
// 		wg.Wait()
// 		close(panicChan)

// 		// Check if any panics occurred and report the first one
// 		select {
// 		case panicMsg := <-panicChan:
// 			ch <- panicMsg // Send the panic message
// 		default:
// 			ch <- results // No panics, send results
// 		}
// 	}()

// 	return ch
// }

// func promiseAll(tasksInterface interface{}) <-chan interface{} {
// 	ch := make(chan interface{})

// 	go func() {
// 		defer close(ch)
// 		defer func() {
// 			if r := recover(); r != nil {
// 				if r != "break" {
// 					ch <- "panic:" + ToString(r)
// 				}
// 			}
// 		}()
// 		// Ensure tasksInterface is a slice of channels (<-chan interface{})
// 		tasks, ok := tasksInterface.([]interface{})
// 		if !ok {
// 			ch <- nil // Return nil if the input is not a slice of interfaces
// 			return
// 		}

// 		results := make([]interface{}, len(tasks))
// 		var wg sync.WaitGroup
// 		wg.Add(len(tasks))

// 		for i, task := range tasks {
// 			go func(i int, task interface{}) {
// 				defer wg.Done()
// 				defer func() {
// 					if r := recover(); r != nil {
// 						if r != "break" {
// 							ch <- "panic:" + ToString(r)
// 						}
// 					}
// 				}()

// 				// Assert the task is a channel
// 				if chanTask, ok := task.(<-chan interface{}); ok {
// 					// Receive the result from the channel
// 					results[i] = <-chanTask
// 				} else {
// 					// If the task is not a channel, set the result to nil
// 					results[i] = nil
// 				}
// 			}(i, task)
// 		}

// 		// Wait for all tasks to complete
// 		wg.Wait()

// 		// Once all tasks are done, send the results
// 		ch <- results
// 	}()

// 	return ch
// }

func ParseInt(number interface{}) int64 {
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

func MathMin(a, b interface{}) interface{} {
	return mathMin(a, b)
}

func mathMin(a, b interface{}) interface{} {

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

	// switch a := a.(type) {
	// case int:
	// 	b := b.(int)
	// 	if a < b {
	// 		return a
	// 	}
	// 	return b
	// case float64:
	// 	b := b.(float64)
	// 	if a < b {
	// 		return a
	// 	}
	// 	return b
	// case string:
	// 	b := b.(string)
	// 	if a < b {
	// 		return a
	// 	}
	// 	return b
	// default:
	// 	return nil
	// }
}

func MathPow(base interface{}, exp interface{}) float64 {
	base64 := ToFloat64(base)
	exp64 := ToFloat64(exp)
	return math.Pow(base64, exp64)
}

func MathAbs(v interface{}) float64 {
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

func MathMax(a, b interface{}) interface{} {
	return mathMax(a, b)
}

// mathMax returns the maximum of two values of the same type.
// It supports int, float64, and string types.
func mathMax(a, b interface{}) interface{} {

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

// parseInt tries to convert various types of input to an int
// func parseInt(input interface{}) interface{} {
// 	switch v := input.(type) {
// 	case int:
// 		return v
// 	case int8:
// 		return int(v)
// 	case int16:
// 		return int(v)
// 	case int32:
// 		return int(v)
// 	case int64:
// 		return int(v)
// 	case uint:
// 		return int(v)
// 	case uint8:
// 		return int(v)
// 	case uint16:
// 		return int(v)
// 	case uint32:
// 		return int(v)
// 	case uint64:
// 		return int(v)
// 	case float32:
// 		return int(v)
// 	case float64:
// 		return int(v)
// 	case string:
// 		if result, err := strconv.Atoi(v); err == nil {
// 			return result
// 		}
// 		return nil
// 	default:
// 		return nil
// 	}
// }

// parseFloat tries to convert various types of input to a float64
func ParseFloat(input interface{}) interface{} {
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

func ParseJSON(input interface{}) interface{} {
	jsonString, ok := input.(string)
	if !ok {
		return nil
	}

	// // var result interface{}

	// if jsonString[0] == '[' {
	// 	var arrayResult []map[string]interface{}
	// 	err := json.Unmarshal([]byte(jsonString), &arrayResult)
	// 	if err != nil {
	// 		return nil
	// 	}
	// 	return arrayResult
	// }

	// var mapResult map[string]interface{}
	// err := json.Unmarshal([]byte(jsonString), &mapResult)
	// if err != nil {
	// 	return nil
	// }
	// return mapResult

	var result interface{}

	decoder := json.NewDecoder(strings.NewReader(jsonString))
	decoder.UseNumber() // Ensures large numbers are handled correctly

	err := decoder.Decode(&result)
	if err != nil {
		return nil
	}
	return normalizeNumbers(result)
}

func normalizeNumbers(data interface{}) interface{} {
	switch v := data.(type) {
	case map[string]interface{}:
		for key, val := range v {
			v[key] = normalizeNumbers(val)
		}
		return v
	case []interface{}:
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

func throwDynamicException(exceptionType interface{}, message interface{}) {
	ThrowDynamicException(exceptionType, message)
}

func ThrowDynamicException(exceptionType interface{}, message interface{}) {
	functionError := exceptionType.(func(...interface{}) error)
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

func OpNeg(value interface{}) interface{} {
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

func JsonStringify(obj interface{}) string {
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

func ToFixed(number interface{}, decimals interface{}) float64 {
	// Assert that the number is a float64 or convert it
	num := ToFloat64(number)

	// Assert that the decimals is an int or convert it
	dec := ParseInt(decimals)
	// Calculate the rounding multiplier
	multiplier := math.Pow(10, float64(dec))
	return math.Round(num*multiplier) / multiplier
}

func Remove(dict interface{}, key interface{}) {
	// Attempt to cast the key to string first
	keyStr, ok := key.(string)
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
		// Check if the key exists in sync.Map
		if _, exists := v.Load(keyStr); !exists {
			panic(fmt.Sprintf("key '%s' does not exist in the sync.Map", keyStr))
		}
		// Remove the key from the sync.Map
		v.Delete(keyStr)
		return
	case map[string]interface{}:
		if _, exists := v[keyStr]; !exists {
			panic(fmt.Sprintf("key '%s' does not exist in the map", keyStr))
		}
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

func SetDefaults(p interface{}) {
	setDefaults(p)
}

func setDefaults(p interface{}) {
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

// func CallInternalMethod(itf interface{}, name2 string, args ...interface{}) <-chan interface{} {
// 	name := Capitalize(name2)
// 	baseValue := reflect.ValueOf(itf)
// 	baseType := baseValue.Type()

// 	ch := make(chan interface{})
// 	go func() {

// 		// Error handling
// 		defer func() {
// 			if r := recover(); r != nil {
// 				ch <- fmt.Sprintf("panic:%v:%v:%v", getCallerName(), name2, r)
// 				close(ch)
// 			}
// 		}()

// 		for i := 0; i < baseType.NumMethod(); i++ {
// 			method := baseType.Method(i)
// 			if name == method.Name {
// 				methodValue := baseValue.MethodByName(name)
// 				methodType := method.Type
// 				numIn := methodType.NumIn()
// 				isVariadic := methodType.IsVariadic()

// 				var in []reflect.Value

// 				// Handle fixed arguments for both regular and variadic functions
// 				for k := 0; k < numIn-1; k++ {
// 					if k < len(args) {
// 						if args[k] == nil {
// 							in = append(in, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
// 						} else {
// 							in = append(in, reflect.ValueOf(args[k]))
// 						}
// 					} else {
// 						// paramType := methodType.In(k)
// 						in = append(in, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
// 						// in = append(in, reflect.Zero(paramType))
// 					}
// 				}

// 				// Properly handle the variadic arguments
// 				if isVariadic {
// 					variadicArgs := []reflect.Value{}
// 					// variadicType := methodType.In(numIn - 1).Elem() // Get the type of the variadic argument
// 					for k := numIn - 1; k < len(args); k++ {
// 						if args[k] == nil {
// 							variadicArgs = append(variadicArgs, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
// 						} else {
// 							variadicArgs = append(variadicArgs, reflect.ValueOf(args[k]))
// 						}
// 					}
// 					in = append(in, variadicArgs...)
// 				} else if len(args) >= numIn-1 {
// 					// Handle non-variadic arguments beyond fixed ones
// 					for k := numIn - 1; k < len(args); k++ {
// 						if args[k] == nil {
// 							// paramType := methodType.In(k)
// 							in = append(in, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
// 						} else {
// 							in = append(in, reflect.ValueOf(args[k]))
// 						}
// 					}
// 				}

// 				// Call the method with the constructed arguments
// 				res := methodValue.Call(in)

// 				// Handle the result
// 				if len(res) > 0 && res[0].Kind() == reflect.Chan {
// 					resultChan := res[0]
// 					go func() {
// 						for {
// 							val, ok := resultChan.Recv()
// 							if !ok {
// 								break // result channel is closed
// 							}
// 							ch <- val.Interface() // pass the value to the output channel
// 						}
// 						close(ch) // close the output channel after all values are received
// 					}()
// 					return
// 				} else if len(res) > 0 {
// 					ch <- res[0].Interface()
// 				} else {
// 					ch <- nil
// 				}
// 				close(ch)
// 				return
// 			}
// 		}

// 		// If no method is found, return nil
// 		ch <- nil
// 		close(ch)
// 	}()
// 	return ch
// }

// var methodCache = sync.Map{}

// func CallInternalMethodCache(itf interface{}, name2 string, args ...interface{}) <-chan interface{} {
// 	name := Capitalize(name2)
// 	baseValue := reflect.ValueOf(itf)
// 	baseType := baseValue.Type()

// 	// Cache key to avoid redundant reflection
// 	cacheKey := fmt.Sprintf("%T.%s", itf, name)
// 	cachedMethod, found := methodCache.Load(cacheKey)

// 	ch := make(chan interface{})

// 	go func() {
// 		defer func() {
// 			if r := recover(); r != nil {
// 				ch <- fmt.Sprintf("panic:%v:%v:%v", getCallerName(), name2, r)
// 			}
// 			close(ch)
// 		}()

// 		var method reflect.Method
// 		if found {
// 			method = cachedMethod.(reflect.Method)
// 		} else {
// 			for i := 0; i < baseType.NumMethod(); i++ {
// 				if baseType.Method(i).Name == name {
// 					method = baseType.Method(i)
// 					methodCache.Store(cacheKey, method)
// 					break
// 				}
// 			}
// 			if method.Name == "" {
// 				ch <- nil
// 				return
// 			}
// 		}

// 		methodValue := baseValue.MethodByName(name)
// 		methodType := method.Type
// 		numIn := methodType.NumIn()
// 		// isVariadic := methodType.IsVariadic()

// 		in := make([]reflect.Value, 0, numIn)

// 		// Handle arguments
// 		for k := 0; k < numIn; k++ {
// 			if k < len(args) {
// 				if args[k] == nil {
// 					in = append(in, reflect.Zero(methodType.In(k)))
// 				} else {
// 					in = append(in, reflect.ValueOf(args[k]))
// 				}
// 			} else {
// 				in = append(in, reflect.Zero(methodType.In(k)))
// 			}
// 		}

// 		// Call method
// 		res := methodValue.Call(in)

// 		// Return result
// 		if len(res) > 0 {
// 			ch <- res[0].Interface()
// 		} else {
// 			ch <- nil
// 		}
// 	}()

// 	return ch
// }

// original imp
func CallInternalMethod3(itf interface{}, name2 string, args ...interface{}) <-chan interface{} {
	name := Capitalize(name2)
	baseValue := reflect.ValueOf(itf)
	baseType := baseValue.Type()

	ch := make(chan interface{})
	go func() {

		// Error handling
		defer func() {
			if r := recover(); r != nil {
				ch <- fmt.Sprintf("panic:%v:%v:%v", getCallerName(), name2, r)
				close(ch)
			}
		}()

		for i := 0; i < baseType.NumMethod(); i++ {
			method := baseType.Method(i)
			if name == method.Name {
				methodValue := baseValue.MethodByName(name)
				methodType := method.Type
				numIn := methodType.NumIn()
				isVariadic := methodType.IsVariadic()

				var in []reflect.Value

				// Handle fixed arguments for both regular and variadic functions
				for k := 0; k < numIn-1; k++ {
					if k < len(args) {
						if args[k] == nil {
							in = append(in, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
						} else {
							in = append(in, reflect.ValueOf(args[k]))
						}
					} else {
						// paramType := methodType.In(k)
						in = append(in, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
						// in = append(in, reflect.Zero(paramType))
					}
				}

				// Properly handle the variadic arguments
				if isVariadic {
					variadicArgs := []reflect.Value{}
					// variadicType := methodType.In(numIn - 1).Elem() // Get the type of the variadic argument
					for k := numIn - 1; k < len(args); k++ {
						if args[k] == nil {
							variadicArgs = append(variadicArgs, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
						} else {
							variadicArgs = append(variadicArgs, reflect.ValueOf(args[k]))
						}
					}
					in = append(in, variadicArgs...)
				} else if len(args) >= numIn-1 {
					// Handle non-variadic arguments beyond fixed ones
					for k := numIn - 1; k < len(args); k++ {
						if args[k] == nil {
							// paramType := methodType.In(k)
							in = append(in, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
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
							ch <- val.Interface() // pass the value to the output channel
						}
						close(ch) // close the output channel after all values are received
					}()
					return
				} else if len(res) > 0 {
					ch <- res[0].Interface()
				} else {
					ch <- nil
				}
				close(ch)
				return
			}
		}

		// If no method is found, return nil
		ch <- nil
		close(ch)
	}()
	return ch
}

func CallInternalMethod(methodCache *sync.Map, itf interface{}, name2 string, args ...interface{}) <-chan interface{} {
	name := Capitalize(name2)
	// baseValue := reflect.ValueOf(itf)
	// baseType := baseValue.Type()
	// if !this.cacheLoaded {
	// 	this.cacheLoaded = true
	// 	this.WarmUpCache()
	// }
	ch := make(chan interface{})
	go func() {

		// Error handling
		defer func() {
			if r := recover(); r != nil {
				ch <- fmt.Sprintf("panic:%v:%v:%v", getCallerName(), name2, r)
				close(ch)
			}
		}()

		cacheKey := fmt.Sprintf("%s", name)
		cachedMethod, found := methodCache.Load(cacheKey)

		if !found {
			panic(name + " :method not found")
		}

		cachedMap := cachedMethod.(map[string]interface{})

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
		numIn := cachedMap["numIn"].(int)
		isVariadic := cachedMap["isVariadic"].(bool)

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
					ch <- val.Interface() // pass the value to the output channel
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

// func CallInternalMethod(itf interface{}, name2 string, args ...interface{}) <-chan interface{} {
// 	name := Capitalize(name2)
// 	baseValue := reflect.ValueOf(itf)
// 	baseType := baseValue.Type()

// 	ch := make(chan interface{})
// 	go func() {

// 		// Error handling
// 		defer func() {
// 			if r := recover(); r != nil {
// 				ch <- fmt.Sprintf("panic:%v:%v:%v", getCallerName(), name2, r)
// 				close(ch)
// 			}
// 		}()

// 		for i := 0; i < baseType.NumMethod(); i++ {
// 			method := baseType.Method(i)
// 			if name == method.Name {
// 				methodValue := baseValue.MethodByName(name)
// 				methodType := method.Type
// 				numIn := methodType.NumIn()
// 				isVariadic := methodType.IsVariadic()

// 				var in []reflect.Value
// 				// Fixed argument handling for both regular and variadic functions
// 				for k := 0; k < numIn-1; k++ {
// 					if k < len(args) {
// 						if args[k] == nil {
// 							paramType := methodType.In(k)
// 							in = append(in, reflect.Zero(paramType))
// 						} else {
// 							in = append(in, reflect.ValueOf(args[k]))
// 						}
// 					} else {
// 						paramType := methodType.In(k)
// 						in = append(in, reflect.Zero(paramType))
// 					}
// 				}

// 				// Handle the variadic arguments
// 				if isVariadic && len(args) >= numIn-1 {
// 					variadicType := methodType.In(numIn - 1).Elem() // Get the type of the variadic argument
// 					for k := numIn - 1; k < len(args); k++ {
// 						if args[k] == nil {
// 							in = append(in, reflect.Zero(variadicType))
// 						} else {
// 							in = append(in, reflect.ValueOf(args[k]))
// 						}
// 					}
// 				} else if len(args) >= numIn-1 {
// 					// Handle non-variadic arguments beyond fixed ones
// 					for k := numIn - 1; k < len(args); k++ {
// 						if args[k] == nil {
// 							paramType := methodType.In(k)
// 							in = append(in, reflect.Zero(paramType))
// 						} else {
// 							in = append(in, reflect.ValueOf(args[k]))
// 						}
// 					}
// 				}

// 				// Call the method with the constructed arguments
// 				res := methodValue.Call(in)

// 				// Handle the result
// 				if len(res) > 0 && res[0].Kind() == reflect.Chan {
// 					resultChan := res[0]
// 					go func() {
// 						for {
// 							val, ok := resultChan.Recv()
// 							if !ok {
// 								break // result channel is closed
// 							}
// 							ch <- val.Interface() // pass the value to the output channel
// 						}
// 						close(ch) // close the output channel after all values are received
// 					}()
// 					return
// 				} else if len(res) > 0 {
// 					ch <- res[0].Interface()
// 				} else {
// 					ch <- nil
// 				}
// 				close(ch)
// 				return
// 			}
// 		}

// 		// If no method is found, return nil
// 		ch <- nil
// 		close(ch)
// 	}()
// 	return ch
// }

// original version not working for createExpiredEtc..
// func CallInternalMethod(itf interface{}, name2 string, args ...interface{}) <-chan interface{} {
// 	name := Capitalize(name2)
// 	baseType := reflect.TypeOf(itf)

// 	ch := make(chan interface{})
// 	go func() {

// 		// error handling
// 		defer func() {
// 			if r := recover(); r != nil {
// 				// panic(r)
// 				ch <- fmt.Sprintf("panic:%v:%v:%v", getCallerName(), name2, r)
// 			}
// 		}()

// 		for i := 0; i < baseType.NumMethod(); i++ {
// 			method := baseType.Method(i)
// 			if name == method.Name {
// 				methodType := method.Type
// 				numIn := methodType.NumIn()
// 				isVariadic := methodType.IsVariadic()

// 				var in []reflect.Value
// 				if isVariadic {
// 					// Handle fixed arguments
// 					for k := 0; k < numIn-1; k++ {
// 						if k < len(args) {
// 							if args[k] == nil {
// 								in = append(in, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
// 							} else {
// 								in = append(in, reflect.ValueOf(args[k]))
// 							}
// 						} else {
// 							// paramType := methodType.In(k)
// 							// in = append(in, reflect.Zero(paramType))
// 							in = append(in, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
// 						}
// 					}

// 					// Handle variadic arguments
// 					// variadicType := methodType.In(numIn - 1).Elem()
// 					for k := numIn - 1; k < len(args); k++ {
// 						if args[k] == nil {
// 							in = append(in, reflect.Zero(reflect.TypeOf((*interface{})(nil)).Elem()))
// 						} else {
// 							in = append(in, reflect.ValueOf(args[k]))
// 						}
// 					}
// 				} else {
// 					for k := 0; k < numIn; k++ {
// 						if k < len(args) {
// 							if args[k] == nil {
// 								paramType := methodType.In(k)
// 								in = append(in, reflect.Zero(paramType))
// 							} else {
// 								in = append(in, reflect.ValueOf(args[k]))
// 							}
// 						} else {
// 							paramType := methodType.In(k)
// 							in = append(in, reflect.Zero(paramType))
// 						}
// 					}
// 				}

// 				// Call the method
// 				res := reflect.ValueOf(itf).MethodByName(name).Call(in)

// 				// Check if the result is a channel
// 				if len(res) > 0 && res[0].Kind() == reflect.Chan {
// 					resultChan := res[0]
// 					// Read values from the returned channel and pass them to ch
// 					go func() {
// 						for {
// 							val, ok := resultChan.Recv()
// 							if !ok {
// 								break // result channel is closed
// 							}
// 							valInt := val.Interface()
// 							ch <- valInt // pass the value to the output channel
// 						}
// 						close(ch) // close the output channel after all values are received
// 					}()
// 					// // Don't close `ch` yet, as it will be closed after the resultChan is read
// 					return
// 				} else if len(res) > 0 {
// 					// Directly return the first result if it's not a channel
// 					val := res[0].Interface()
// 					ch <- val
// 				} else {
// 					// Return nil if no results
// 					ch <- nil
// 				}
// 				close(ch)
// 				return
// 			}
// 		}
// 		// If no method is found, return nil
// 		ch <- nil
// 		close(ch)
// 	}()
// 	return ch
// }

func PanicOnError(msg interface{}) {
	caller := getCallerName()
	switch v := msg.(type) {
	case string:
		if strings.HasPrefix(v, "panic:") {
			stack := debug.Stack()[:300]
			panicMsg := fmt.Sprintf("panic:%v:%v\nStack trace:\n%s", caller, msg, stack)
			panic(panicMsg)
		}
	case []interface{}:
		for _, item := range v {
			if str, ok := item.(string); ok && strings.HasPrefix(str, "panic:") {
				stack := debug.Stack()[:300]
				panicMsg := fmt.Sprintf("%s\nStack trace:\n%s", str, stack)
				panic(panicMsg)
			} else if nestedSlice, ok := item.([]interface{}); ok {
				// Handle nested []interface{} cases recursively
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
		return
	}
}

func ReturnPanicError(ch chan interface{}) {
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

func Print(v interface{}) {
	fmt.Println(v)
}

func HandleDelta(bookside interface{}, delta interface{}) interface{} {
	if bookside == nil {
		return nil
	}

	// Cast bookside to *OrderBookSide
	orderbookSide, ok := bookside.(*OrderBookSide)
	if !ok {
		return bookside
	}

	// Cast delta to []interface{}
	deltaSlice, ok := delta.([]interface{})
	if !ok || len(deltaSlice) < 2 {
		return bookside
	}

	// Extract price and size from delta
	price := ToFloat64(deltaSlice[0])
	size := ToFloat64(deltaSlice[1])

	// Create a new entry [price, size]
	entry := []interface{}{price, size}

	// Store the entry in the OrderBookSide
	orderbookSide.StoreArray(entry)

	return orderbookSide
}

func HandleDeltas(bookside interface{}, deltas interface{}) interface{} {
	// Cast deltas to []interface{}
	deltasSlice, ok := deltas.([]interface{})
	if !ok {
		return bookside
	}

	// Process each delta
	for _, delta := range deltasSlice {
		bookside = HandleDelta(bookside, delta)
	}

	return bookside
}

func GunzipSync(data []byte) ([]byte, error) {
	r, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	defer r.Close()
	return io.ReadAll(r)
}

func InflateSync(data []byte) ([]byte, error) {
	r := flate.NewReader(bytes.NewReader(data))
	defer r.Close()
	return io.ReadAll(r)
}
