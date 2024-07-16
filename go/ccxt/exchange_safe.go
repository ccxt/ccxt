package ccxt

import (
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
)

// ConvertToDictionaryOfStringObject converts a potential dictionary to a map[string]interface{}
func ConvertToDictionaryOfStringObject(potentialDictionary interface{}) (map[string]interface{}, error) {
	dictValue := reflect.ValueOf(potentialDictionary)
	if dictValue.Kind() == reflect.Map && dictValue.Type().Key().Kind() == reflect.String {
		result := make(map[string]interface{})
		for _, key := range dictValue.MapKeys() {
			result[key.String()] = dictValue.MapIndex(key).Interface()
		}
		return result, nil
	}
	return nil, errors.New("the provided object is not a dictionary")
}

// SafeValueN retrieves a value from a nested structure
func SafeValueN(obj interface{}, keys []interface{}, defaultValue interface{}) interface{} {
	if obj == nil {
		return defaultValue
	}

	// Convert array to slice if needed
	if reflect.TypeOf(obj).Kind() == reflect.Array {
		obj = reflect.ValueOf(obj).Slice(0, reflect.ValueOf(obj).Len()).Interface()
	}

	switch reflect.TypeOf(obj).Kind() {
	case reflect.Map:
		if dict, err := ConvertToDictionaryOfStringObject(obj); err == nil {
			for _, key := range keys {
				if key == nil {
					continue
				}
				keyStr := fmt.Sprintf("%v", key)
				if value, found := dict[keyStr]; found {
					return value
				}
			}
		}
	case reflect.Slice:
		if list, ok := obj.([]interface{}); ok {
			for _, key := range keys {
				if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
					if keyInt >= 0 && keyInt < len(list) {
						return list[keyInt]
					}
				}
			}
		}
	}

	return defaultValue
}

// SafeStringN retrieves a string value from a nested structure
func SafeStringN(obj interface{}, keys []interface{}, defaultValue interface{}) string {
	value := SafeValueN(obj, keys, defaultValue)
	if value == nil {
		return defaultValue.(string)
	}

	switch v := value.(type) {
	case string:
		return v
	case float32, float64, int, int32, int64:
		return fmt.Sprintf("%v", v)
	default:
		return defaultValue.(string)
	}
}

// SafeFloatN retrieves a float64 value from a nested structure
func SafeFloatN(obj interface{}, keys []interface{}, defaultValue interface{}) float64 {
	value := SafeValueN(obj, keys, defaultValue)
	if value == nil {
		return defaultValue.(float64)
	}

	switch v := value.(type) {
	case float64:
		return v
	case float32:
		return float64(v)
	case int:
		return float64(v)
	case int32:
		return float64(v)
	case int64:
		return float64(v)
	case string:
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			return f
		}
	default:
		return defaultValue.(float64)
	}

	return defaultValue.(float64)
}

// SafeIntegerN retrieves an int64 value from a nested structure
func SafeIntegerN(obj interface{}, keys []interface{}, defaultValue interface{}) int64 {
	value := SafeValueN(obj, keys, defaultValue)
	if value == nil {
		return defaultValue.(int64)
	}

	switch v := value.(type) {
	case int64:
		return v
	case int:
		return int64(v)
	case float64:
		return int64(v)
	case float32:
		return int64(v)
	case string:
		if i, err := strconv.ParseInt(v, 10, 64); err == nil {
			return i
		}
	default:
		return defaultValue.(int64)
	}

	return defaultValue.(int64)
}

// SafeValue retrieves a value from a nested structure
func SafeValue(obj interface{}, key interface{}, defaultValue interface{}) interface{} {
	return SafeValueN(obj, []interface{}{key}, defaultValue)
}

// SafeString retrieves a string value from a nested structure
func SafeString(obj interface{}, key interface{}, defaultValue interface{}) string {
	return SafeStringN(obj, []interface{}{key}, defaultValue)
}

func SafeString2(obj interface{}, key interface{}, key2 interface{}, defaultValue interface{}) string {
	return SafeStringN(obj, []interface{}{key, key2}, defaultValue)
}

// SafeFloat retrieves a float64 value from a nested structure
func SafeFloat(obj interface{}, key interface{}, defaultValue interface{}) float64 {
	return SafeFloatN(obj, []interface{}{key}, defaultValue)
}

// SafeInteger retrieves an int64 value from a nested structure
func SafeInteger(obj interface{}, key interface{}, defaultValue interface{}) int64 {
	return SafeIntegerN(obj, []interface{}{key}, defaultValue)
}

func SafeInteger2(obj interface{}, key interface{}, key2 interface{}, defaultValue interface{}) int64 {
	return SafeIntegerN(obj, []interface{}{key, key2}, defaultValue)
}

// SafeTimestampN retrieves a timestamp value from a nested structure
func SafeTimestampN(obj interface{}, keys []interface{}, defaultValue interface{}) int64 {
	result := SafeValueN(obj, keys, defaultValue)
	if result == nil {
		return defaultValue.(int64)
	}
	if resultStr, ok := result.(string); ok && strings.Contains(resultStr, ".") {
		if f, err := strconv.ParseFloat(resultStr, 64); err == nil {
			return int64(f * 1000)
		}
	} else if resultFloat, ok := result.(float64); ok && strings.Contains(fmt.Sprintf("%f", resultFloat), ".") {
		return int64(resultFloat * 1000)
	}
	return SafeIntegerN(obj, keys, defaultValue) * 1000
}

// SafeTimestamp retrieves a timestamp value from a nested structure
func SafeTimestamp(obj interface{}, key interface{}, defaultValue interface{}) int64 {
	return SafeTimestampN(obj, []interface{}{key}, defaultValue)
}

// SafeTimestamp2 retrieves a timestamp value from a nested structure with two keys
func SafeTimestamp2(obj interface{}, key1, key2 interface{}, defaultValue interface{}) int64 {
	return SafeTimestampN(obj, []interface{}{key1, key2}, defaultValue)
}

// SafeIntegerProductN retrieves a multiplied integer value from a nested structure
func SafeIntegerProductN(obj interface{}, keys []interface{}, multiplier interface{}, defaultValue interface{}) int64 {
	if multiplier == nil {
		multiplier = 1
	}
	result := SafeValueN(obj, keys, defaultValue)
	if result == nil {
		return defaultValue.(int64)
	}
	multiplierFloat, _ := strconv.ParseFloat(fmt.Sprintf("%v", multiplier), 64)
	resultFloat, _ := strconv.ParseFloat(fmt.Sprintf("%v", result), 64)
	return int64(resultFloat * multiplierFloat)
}

// SafeIntegerProduct retrieves a multiplied integer value from a nested structure
func SafeIntegerProduct(obj interface{}, key interface{}, multiplier interface{}, defaultValue interface{}) int64 {
	return SafeIntegerProductN(obj, []interface{}{key}, multiplier, defaultValue)
}

// SafeIntegerProduct2 retrieves a multiplied integer value from a nested structure with two keys
func SafeIntegerProduct2(obj interface{}, key1, key2 interface{}, multiplier interface{}, defaultValue interface{}) int64 {
	return SafeIntegerProductN(obj, []interface{}{key1, key2}, multiplier, defaultValue)
}

// SafeBool retrieves a boolean value from a nested structure
func SafeBool(obj interface{}, key interface{}, defaultValue bool) bool {
	value := SafeValueN(obj, []interface{}{key}, defaultValue)
	if value == nil {
		return defaultValue
	}

	if v, ok := value.(bool); ok {
		return v
	}

	return defaultValue
}

// private wrappers

func (this *Exchange) safeString(obj interface{}, key interface{}, defaultValue ...interface{}) string {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeString(obj, key, defVal)
}

func (this *Exchange) safeStringUpper(obj interface{}, key interface{}, defaultValue ...interface{}) string {
	// return strings.ToUpper(this.safeString(obj, key, defaultValue...))
	res := this.safeString(obj, key, defaultValue...)
	if res != "" {
		return strings.ToUpper(res)
	}
	return "" // check this return type
}

func (this *Exchange) safeStringLower(obj interface{}, key interface{}, defaultValue ...interface{}) string {
	// return strings.ToUpper(this.safeString(obj, key, defaultValue...))
	res := this.safeString(obj, key, defaultValue...)
	if res != "" {
		return strings.ToLower(res)
	}
	return "" // check this return type
}

func (this *Exchange) safeString2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) string {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeString2(obj, key, key2, defVal)
}

func (this *Exchange) safeStringN(obj interface{}, keys2 interface{}, defaultValue ...interface{}) string {
	keys := keys2.([]interface{})
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeStringN(obj, keys, defVal)
}

func (this *Exchange) safeFloat(obj interface{}, key interface{}, defaultValue ...interface{}) float64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeFloat(obj, key, defVal)
}

func (this *Exchange) safeFloatN(obj interface{}, keys []interface{}, defaultValue ...interface{}) float64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeFloatN(obj, keys, defVal)
}

func (this *Exchange) safeInteger(obj interface{}, key interface{}, defaultValue ...interface{}) int64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeInteger(obj, key, defVal)
}

func (this *Exchange) safeInteger2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) int64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeInteger2(obj, key, key2, defVal)
}

func (this *Exchange) safeIntegerN(obj interface{}, keys []interface{}, defaultValue ...interface{}) int64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeIntegerN(obj, keys, defVal)
}

func (this *Exchange) safeValue(obj interface{}, key interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeValue(obj, key, defVal)
}

func (this *Exchange) safeValue2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{} {
	return SafeValueN(obj, []interface{}{key, key2}, defaultValue)
}

func (this *Exchange) safeValueN(obj interface{}, keys interface{}, defaultValue ...interface{}) interface{} {
	keysArray := keys.([]interface{})
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeValueN(obj, keysArray, defVal)
}

func (this *Exchange) safeTimestamp(obj interface{}, key interface{}, defaultValue ...interface{}) int64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeTimestamp(obj, key, defVal)
}

func (this *Exchange) safeTimestamp2(obj interface{}, key1, key2 interface{}, defaultValue ...interface{}) int64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeTimestamp2(obj, key1, key2, defVal)
}

func (this *Exchange) safeTimestampN(obj interface{}, keys []interface{}, defaultValue ...interface{}) int64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeTimestampN(obj, keys, defVal)
}

func (this *Exchange) safeIntegerProduct(obj interface{}, key interface{}, multiplier interface{}, defaultValue ...interface{}) int64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeIntegerProduct(obj, key, multiplier, defVal)
}

func (this *Exchange) safeIntegerProduct2(obj interface{}, key1, key2 interface{}, multiplier interface{}, defaultValue ...interface{}) int64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeIntegerProduct2(obj, key1, key2, multiplier, defVal)
}

func (this *Exchange) safeIntegerProductN(obj interface{}, keys []interface{}, multiplier interface{}, defaultValue ...interface{}) int64 {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeIntegerProductN(obj, keys, multiplier, defVal)
}

// func (this *Exchange) safeBool(obj interface{}, key interface{}, defaultValue ...bool) bool {
// 	defVal := false
// 	if len(defaultValue) > 0 {
// 		defVal = defaultValue[0]
// 	}
// 	return SafeBool(obj, key, defVal)
// }

// func (this *Exchange) safeBool(obj interface{}, key interface{}, defaultValue bool) bool {
// 	return SafeBool(obj, key, defaultValue)
// }
