package ccxt

import (
	"encoding/json"
	"fmt"
	"math"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"
)

func Add(a interface{}, b interface{}) interface{} {
	switch aType := a.(type) {
	case int:
		if bType, ok := b.(int); ok {
			return aType + bType // Add as integers
		}
	case float64:
		if bType, ok := b.(float64); ok {
			return aType + bType // Add as floats
		}
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
	default:
		// Use reflection for other complex types (slices, maps, pointers, etc.)
		valType := reflect.TypeOf(val)
		switch valType.Kind() {
		case reflect.Slice, reflect.Map, reflect.Ptr, reflect.Chan, reflect.Func:
			return !reflect.ValueOf(val).IsNil()
		}
	}

	return true // Consider non-nil complex types as truthy
}

func IsInteger(value interface{}) bool {
	switch value.(type) {
	case int, int8, int16, int32, int64:
		return true
	case uint, uint8, uint16, uint32, uint64:
		return true
	default:
		return false
	}
}

func GetValue(collection interface{}, key interface{}) interface{} {

	if collection == nil {
		return nil
	}
	if key == nil {
		return nil
	}
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
		index, ok := key.(int)
		if !ok {
			return nil // Key is not an int, invalid index
		}
		if index < 0 || index >= reflectValue.Len() {
			return nil // Index out of bounds
		}
		return reflectValue.Index(index).Interface()

	case reflect.Map:
		// Handle map: key needs to be appropriate for the map
		reflectKeyValue := reflect.ValueOf(key)
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
		return aValConverted.Float() * bVal.Float()
	default:
		return nil
	}
}

func Divide(a, b interface{}) interface{} {
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
		if bVal.Float() == 0.0 {
			return nil // Avoid division by zero
		}
		return aValConverted.Float() / bVal.Float()
	default:
		return nil
	}
}

func Subtract(a, b interface{}) interface{} {
	aVal := reflect.ValueOf(a)
	bVal := reflect.ValueOf(b)

	if !aVal.IsValid() || !bVal.IsValid() || !aVal.Type().ConvertibleTo(bVal.Type()) {
		return nil
	}

	aValConverted := aVal.Convert(bVal.Type())

	switch bVal.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return aValConverted.Int() - bVal.Int()
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return aValConverted.Uint() - bVal.Uint()
	case reflect.Float32, reflect.Float64:
		return aValConverted.Float() - bVal.Float()
	default:
		return nil
	}
}

type Dict map[string]interface{}

// GetArrayLength returns the length of various array or slice types or string length.
func GetArrayLength(value interface{}) int {
	if value == nil {
		return 0
	}

	val := reflect.ValueOf(value)

	switch val.Kind() {
	case reflect.Slice, reflect.Array:
		return val.Len()
	case reflect.String:
		return val.Len()
	case reflect.Map:
		// Specific check for a map type similar to List<dict> in C#
		if _, ok := value.(Dict); ok {
			return len(value.(Dict))
		}
	}

	return 0
}

func IsGreaterThan(a, b interface{}) bool {
	if a != nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}

	aVal, bVal, ok := NormalizeAndConvert(a, b)
	if !ok {
		return false
	}

	switch aVal.Kind() {
	case reflect.Int, reflect.Int64:
		return aVal.Int() > bVal.Int()
	case reflect.Float64:
		return aVal.Float() > bVal.Float()
	case reflect.String:
		return aVal.String() > bVal.String()
	default:
		return false
	}
}

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

	aVal, bVal, ok := NormalizeAndConvert(a, b)
	if !ok || bVal.Float() == 0 {
		return nil
	}

	return float64(int(aVal.Float()) % int(bVal.Float()))
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

	aVal, bVal, ok := NormalizeAndConvert(a, b)
	if !ok {
		return false
	}

	switch aVal.Kind() {
	case reflect.Int, reflect.Int64:
		return aVal.Int() == bVal.Int()
	case reflect.Float64:
		return aVal.Float() == bVal.Float()
	case reflect.String:
		return aVal.String() == bVal.String()
	default:
		return false
	}
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
	var result float64
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
		result = 0 // Convert string to float64, example implementation
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

func AppendToArray(slicePtr *interface{}, element interface{}) {
	array := (*slicePtr).([]interface{})
	*slicePtr = append(array, element)
}

func AddElementToObject(arrayOrDict interface{}, stringOrInt interface{}, value interface{}) {
	val := reflect.ValueOf(arrayOrDict)
	key := reflect.ValueOf(stringOrInt)
	valueVal := reflect.ValueOf(value)

	switch val.Kind() {
	case reflect.Slice:
		if key.Kind() != reflect.Int {
			// return fmt.Errorf("index must be an integer for slices")
		}
		index := int(key.Int())
		if index < 0 || index >= val.Len() {
			// return fmt.Errorf("index out of range")
		}
		val.Index(index).Set(valueVal)
	case reflect.Map:
		if !key.Type().AssignableTo(val.Type().Key()) {
			// return fmt.Errorf("key type %s does not match map key type %s", key.Type(), val.Type().Key())
		}
		// if !valueVal.Type().AssignableTo(val.Type().Elem()) {
		// 	// return fmt.Errorf("value type %s does not match map value type %s", valueVal.Type(), val.Type().Elem())
		// }
		val.SetMapIndex(key, valueVal)
	default:
		// return fmt.Errorf("unsupported type: %s", val.Kind())
	}
	// return nil
}

func InOp(dict interface{}, key interface{}) bool {

	if dict == nil {
		return false
	}
	if key == nil {
		return false
	}
	dictVal := reflect.ValueOf(dict)

	// Ensure that the provided dict is a map
	if dictVal.Kind() != reflect.Map {
		return false
	}

	keyVal := reflect.ValueOf(key)

	// Check if the map has the provided key todo:debug here
	if dictVal.MapIndex(keyVal).IsValid() {
		return true
	}
	return false
}

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
	_, ok := v.(bool)
	return ok
}

// IsDictionary checks if the input is a map (dictionary in Python)
func IsDictionary(v interface{}) bool {
	return reflect.TypeOf(v).Kind() == reflect.Map
}

// IsString checks if the input is a string
func IsString(v interface{}) bool {
	_, ok := v.(string)
	return ok
}

// IsInt checks if the input is an integer
func IsInt(v interface{}) bool {
	_, ok := v.(int)
	return ok
}

// IsFunction checks if the input is a function
func IsFunction(v interface{}) bool {
	return reflect.TypeOf(v).Kind() == reflect.Func
}

func IsNumber(v interface{}) bool {
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
	kind := reflect.TypeOf(v).Kind()
	switch kind {
	case reflect.Array, reflect.Chan, reflect.Func, reflect.Interface,
		reflect.Map, reflect.Ptr, reflect.Slice, reflect.Struct, reflect.UnsafePointer:
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
	return 0
}

// MathCeil returns the smallest integer greater than or equal to the given number
func MathCeil(v interface{}) float64 {
	if num, ok := v.(float64); ok {
		return math.Ceil(num)
	}
	return 0
}

// MathRound returns the nearest integer, rounding half away from zero
func MathRound(v interface{}) float64 {
	if num, ok := v.(float64); ok {
		return math.Round(num)
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
		return fmt.Sprintf("%f", v)
	case bool:
		return fmt.Sprintf("%t", v)
	default:
		return fmt.Sprintf("%v", v)
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
	val := reflect.ValueOf(v)
	if val.Kind() != reflect.Map {
		return nil
	}

	keys := val.MapKeys()
	strKeys := make([]string, len(keys))
	for i, key := range keys {
		strKeys[i] = ToString(key.Interface())
	}
	return strKeys
}

// ObjectValues returns the values of a map as a slice of interface{}
func ObjectValues(v interface{}) []interface{} {
	val := reflect.ValueOf(v)
	if val.Kind() != reflect.Map {
		return nil
	}

	keys := val.MapKeys()
	values := make([]interface{}, len(keys))
	for i, key := range keys {
		values[i] = val.MapIndex(key).Interface()
	}
	return values
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
	kind := reflect.TypeOf(v).Kind()
	return kind == reflect.Slice || kind == reflect.Array
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
func PadEnd(input interface{}, length int, padStr interface{}) string {
	str := ToString(input)
	pad := ToString(padStr)
	for len(str) < length {
		str += pad
	}
	return str[:length]
}

// PadStart pads the input string on the left with padStr until it reaches the specified length
func PadStart(input interface{}, length int, padStr interface{}) string {
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

func GetArg(v []interface{}, index int, def interface{}) interface{} {
	if len(v) <= index {
		return def
	}
	val := v[index]

	if val == nil {
		return def
	}
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
	start := -1
	if idx1 != nil {
		start = idx1.(int)
	}
	if idx2 == nil {
		if start < 0 {
			innerStart := len(str) + start
			if innerStart < 0 {
				innerStart = 0
			}
			return str[innerStart:]
		}
		return str[start:]
	} else {
		end := idx2.(int)
		if start < 0 {
			start = len(str) + start
		}
		if end < 0 {
			end = len(str) + end
		}
		if end > len(str) {
			end = len(str)
		}
		return str[start:end]
	}
}

type Task func() interface{}

func promiseAll(tasksInterface interface{}) <-chan []interface{} {
	ch := make(chan []interface{})

	go func() {
		defer close(ch)

		// Ensure tasksInterface is a slice of channels (<-chan interface{})
		tasks, ok := tasksInterface.([]interface{})
		if !ok {
			ch <- nil // Return nil if the input is not a slice of interfaces
			return
		}

		results := make([]interface{}, len(tasks))
		var wg sync.WaitGroup
		wg.Add(len(tasks))

		for i, task := range tasks {
			go func(i int, task interface{}) {
				defer wg.Done()

				// Assert the task is a channel
				if chanTask, ok := task.(<-chan interface{}); ok {
					// Receive the result from the channel
					results[i] = <-chanTask
				} else {
					// If the task is not a channel, set the result to nil
					results[i] = nil
				}
			}(i, task)
		}

		// Wait for all tasks to complete
		wg.Wait()

		// Once all tasks are done, send the results
		ch <- results
	}()

	return ch
}
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
	return 0 // Default value if conversion is not possible
}

func mathMin(a, b interface{}) interface{} {
	switch a := a.(type) {
	case int:
		b := b.(int)
		if a < b {
			return a
		}
		return b
	case float64:
		b := b.(float64)
		if a < b {
			return a
		}
		return b
	case string:
		b := b.(string)
		if a < b {
			return a
		}
		return b
	default:
		return nil
	}
}

// mathMax returns the maximum of two values of the same type.
// It supports int, float64, and string types.
func mathMax(a, b interface{}) interface{} {
	switch a := a.(type) {
	case int:
		b := b.(int)
		if a > b {
			return a
		}
		return b
	case float64:
		b := b.(float64)
		if a > b {
			return a
		}
		return b
	case string:
		b := b.(string)
		if a > b {
			return a
		}
		return b
	default:
		return nil
	}
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
	jsonString := fmt.Sprintf("%v", input)
	// var result interface{}

	if jsonString[0] == '[' {
		var arrayResult []map[string]interface{}
		err := json.Unmarshal([]byte(jsonString), &arrayResult)
		if err != nil {
			return nil
		}
		return arrayResult
	}

	var mapResult map[string]interface{}
	err := json.Unmarshal([]byte(jsonString), &mapResult)
	if err != nil {
		return nil
	}
	return mapResult
}

func throwDynamicException(exceptionType interface{}, message interface{}) {
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

func toFixed(number interface{}, decimals interface{}) float64 {
	// Assert that the number is a float64 or convert it
	num := ToFloat64(number)

	// Assert that the decimals is an int or convert it
	dec := ParseInt(decimals)
	// Calculate the rounding multiplier
	multiplier := math.Pow(10, float64(dec))
	return math.Round(num*multiplier) / multiplier
}

func Remove(dict interface{}, key interface{}) {
	// Attempt to cast the dict to map[string]interface{}
	castedDict, ok := dict.(map[string]interface{})
	if !ok {
		// Panic if the cast fails
		panic("provided value is not a map[string]interface{}")
	}

	// Attempt to cast the key to string
	keyStr, ok := key.(string)
	if !ok {
		// Panic if the key is not a string
		panic("provided key is not a string")
	}

	// Check if the key exists, panic if it doesn't
	if _, exists := castedDict[keyStr]; !exists {
		panic(fmt.Sprintf("key '%s' does not exist in the map", keyStr))
	}

	// Remove the key from the map
	delete(castedDict, keyStr)
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
