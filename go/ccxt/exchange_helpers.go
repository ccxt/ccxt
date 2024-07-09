package ccxt

import (
	"reflect"
	"strings"
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

func IsTrue(a interface{}, b interface{}) bool {
	return EvalTruthy(a) && EvalTruthy(b)
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
	reflectValue := reflect.ValueOf(collection)

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

func AppendToArray(array interface{}, value interface{}) interface{} {
	// Use reflection to work with the array dynamically
	arrVal := reflect.ValueOf(array)

	// Check if the input is actually a slice
	if arrVal.Kind() != reflect.Slice {
		return nil
	}

	// Use reflection to append the value to the slice
	valueVal := reflect.ValueOf(value)
	resultVal := reflect.Append(arrVal, valueVal)

	// Return the new slice as interface{}
	return resultVal.Interface()
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
		if !valueVal.Type().AssignableTo(val.Type().Elem()) {
			// return fmt.Errorf("value type %s does not match map value type %s", valueVal.Type(), val.Type().Elem())
		}
		val.SetMapIndex(key, valueVal)
	default:
		// return fmt.Errorf("unsupported type: %s", val.Kind())
	}
	// return nil
}

func InOp(dict interface{}, key interface{}) bool {
	dictVal := reflect.ValueOf(dict)

	// Ensure that the provided dict is a map
	if dictVal.Kind() != reflect.Map {
		return false
	}

	keyVal := reflect.ValueOf(key)

	// Check if the map has the provided key
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
