package ccxt

import (
	// "errors"
	"fmt"
	// "reflect"
	"strconv"
	"strings"
)

// // ConvertToDictionaryOfStringObject converts a potential dictionary to a map[string]interface{}
// func ConvertToDictionaryOfStringObject(potentialDictionary interface{}) (map[string]interface{}, error) {
// 	dictValue := reflect.ValueOf(potentialDictionary)
// 	if dictValue.Kind() == reflect.Map && dictValue.Type().Key().Kind() == reflect.String {
// 		result := make(map[string]interface{})
// 		for _, key := range dictValue.MapKeys() {
// 			result[key.String()] = dictValue.MapIndex(key).Interface()
// 		}
// 		return result, nil
// 	}
// 	return nil, errors.New("the provided object is not a dictionary")
// }

// SafeValueN retrieves a value from a nested structure
// func SafeValueN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{} {
// 	var defVal interface{} = nil
// 	if len(defaultValue) > 0 {
// 		defVal = defaultValue[0]
// 	}
// 	if obj == nil {
// 		return defVal
// 	}

// 	objType := reflect.TypeOf(obj).Kind()

// 	// Convert array to slice if needed
// 	if objType == reflect.Array {
// 		obj = reflect.ValueOf(obj).Slice(0, reflect.ValueOf(obj).Len()).Interface()
// 	}

// 	switch objType {
// 	case reflect.Map:
// 		if dict, err := ConvertToDictionaryOfStringObject(obj); err == nil {
// 			for _, key := range keys {
// 				if key == nil {
// 					continue
// 				}
// 				keyStr := fmt.Sprintf("%v", key)
// 				if value, found := dict[keyStr]; found {
// 					if value != nil && value != "" {
// 						return value
// 					}
// 				}
// 			}
// 		}
// 	case reflect.Slice:
// 		if list, ok := obj.([]interface{}); ok {
// 			for _, key := range keys {
// 				if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
// 					if keyInt >= 0 && keyInt < len(list) {
// 						return list[keyInt]
// 					}
// 				}
// 			}
// 		}

// 		if list, ok := obj.([]string); ok {
// 			for _, key := range keys {
// 				if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
// 					if keyInt >= 0 && keyInt < len(list) {
// 						return list[keyInt]
// 					}
// 				}
// 			}
// 		}

// 		if list, ok := obj.([]int64); ok {
// 			for _, key := range keys {
// 				if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
// 					if keyInt >= 0 && keyInt < len(list) {
// 						return list[keyInt]
// 					}
// 				}
// 			}
// 		}

// 		if list, ok := obj.([]int32); ok {
// 			for _, key := range keys {
// 				if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
// 					if keyInt >= 0 && keyInt < len(list) {
// 						return list[keyInt]
// 					}
// 				}
// 			}
// 		}

// 		if list, ok := obj.([]float64); ok {
// 			for _, key := range keys {
// 				if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
// 					if keyInt >= 0 && keyInt < len(list) {
// 						return list[keyInt]
// 					}
// 				}
// 			}
// 		}
// 	}

// 	return defVal
// }

func getValueFromList(list interface{}, keys []interface{}, defVal interface{}) interface{} {
	switch l := list.(type) {
	case []interface{}:
		for _, key := range keys {
			if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
				if keyInt >= 0 && keyInt < len(l) {
					return l[keyInt]
				}
			}
		}
	case []string:
		for _, key := range keys {
			if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
				if keyInt >= 0 && keyInt < len(l) {
					return l[keyInt]
				}
			}
		}
	case []int:
		for _, key := range keys {
			if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
				if keyInt >= 0 && keyInt < len(l) {
					return l[keyInt]
				}
			}
		}
	case []int32:
		for _, key := range keys {
			if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
				if keyInt >= 0 && keyInt < len(l) {
					return l[keyInt]
				}
			}
		}
	case []int64:
		for _, key := range keys {
			if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
				if keyInt >= 0 && keyInt < len(l) {
					return l[keyInt]
				}
			}
		}
	case []float64:
		for _, key := range keys {
			if keyInt, err := strconv.Atoi(fmt.Sprintf("%v", key)); err == nil {
				if keyInt >= 0 && keyInt < len(l) {
					return l[keyInt]
				}
			}
		}
	}
	return defVal
}


func SafeValueN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	if obj == nil {
		return defVal
	}

	// Handle maps
	if dict, ok := obj.(map[string]interface{}); ok {
		for _, key := range keys {
			if key == nil {
				continue
			}
			keyStr := fmt.Sprintf("%v", key)
			if value, found := dict[keyStr]; found {
				if value != nil && value != "" {
					return value
				}
			}
		}
		return defVal
	}

	// Handle slices
	switch list := obj.(type) {
	case []interface{}:
		return getValueFromList(list, keys, defVal)
	case []string:
		return getValueFromList(list, keys, defVal)
	case []int:
		return getValueFromList(list, keys, defVal)
	case []int32:
		return getValueFromList(list, keys, defVal)
	case []int64:
		return getValueFromList(list, keys, defVal)
	case []float64:
		return getValueFromList(list, keys, defVal)
	default:
		return defVal
	}
}

// SafeStringN retrieves a string value from a nested structure
func SafeStringN(obj interface{}, keys []interface{}, defaultValue interface{}) interface{} {
	value := SafeValueN(obj, keys, defaultValue)
	if value == nil {
		return defaultValue
	}

	switch v := value.(type) {
	case string:
		if v == "" {
			return defaultValue
		}
		return v
	case int:
		return strconv.Itoa(v)
	case int8, int16, int32, int64:
		return strconv.FormatInt(v.(int64), 10)
	case uint, uint8, uint16, uint32, uint64:
		return strconv.FormatUint(v.(uint64), 10)
	case float32:
		return strconv.FormatFloat(float64(v), 'f', -1, 32)
	case float64:
		return strconv.FormatFloat(v, 'f', -1, 64)
	default:
		return defaultValue
	}
}

func (this *Exchange) SafeStringUpperN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeStringUpperN(obj, keys, defVal)
}

func SafeStringUpperN(obj interface{}, keys []interface{}, defaultValue interface{}) interface{} {
	value := SafeStringN(obj, keys, defaultValue)
	if value == nil {
		return defaultValue
	}
	return strings.ToUpper(value.(string))
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
func SafeIntegerN(obj interface{}, keys []interface{}, defaultValue interface{}) interface{} {
	value := SafeValueN(obj, keys, defaultValue)
	if value == nil {
		return nil
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
		return defaultValue
	}

	return defaultValue
}

// SafeValue retrieves a value from a nested structure
func SafeValue(obj interface{}, key interface{}, defaultValue interface{}) interface{} {
	return SafeValueN(obj, []interface{}{key}, defaultValue)
}

// SafeString retrieves a string value from a nested structure
func SafeString(obj interface{}, key interface{}, defaultValue interface{}) interface{} {
	return SafeStringN(obj, []interface{}{key}, defaultValue)
}

func SafeString2(obj interface{}, key interface{}, key2 interface{}, defaultValue interface{}) interface{} {
	return SafeStringN(obj, []interface{}{key, key2}, defaultValue)
}

// SafeFloat retrieves a float64 value from a nested structure
func SafeFloat(obj interface{}, key interface{}, defaultValue interface{}) interface{} {
	return SafeFloatN(obj, []interface{}{key}, defaultValue)
}

func SafeFloat2(obj interface{}, key interface{}, key2 interface{}, defaultValue interface{}) interface{} {
	return SafeFloatN(obj, []interface{}{key, key2}, defaultValue)
}

// SafeInteger retrieves an int64 value from a nested structure
func SafeInteger(obj interface{}, key interface{}, defaultValue interface{}) interface{} {
	return SafeIntegerN(obj, []interface{}{key}, defaultValue)
}

func SafeInteger2(obj interface{}, key interface{}, key2 interface{}, defaultValue interface{}) interface{} {
	return SafeIntegerN(obj, []interface{}{key, key2}, defaultValue)
}

// SafeTimestampN retrieves a timestamp value from a nested structure
func SafeTimestampN(obj interface{}, keys []interface{}, defaultValue interface{}) interface{} {
	result := SafeValueN(obj, keys, defaultValue)
	if result == nil {
		return nil
	}
	if resultStr, ok := result.(string); ok && strings.Contains(resultStr, ".") {
		if f, err := strconv.ParseFloat(resultStr, 64); err == nil {
			return int64(f * 1000)
		}
	} else if resultFloat, ok := result.(float64); ok && strings.Contains(fmt.Sprintf("%f", resultFloat), ".") {
		return int64(resultFloat * 1000)
	}
	return SafeIntegerN(obj, keys, defaultValue).(int64) * 1000
}

// SafeTimestamp retrieves a timestamp value from a nested structure
func SafeTimestamp(obj interface{}, key interface{}, defaultValue interface{}) interface{} {
	return SafeTimestampN(obj, []interface{}{key}, defaultValue)
}

// SafeTimestamp2 retrieves a timestamp value from a nested structure with two keys
func SafeTimestamp2(obj interface{}, key1, key2 interface{}, defaultValue interface{}) interface{} {
	return SafeTimestampN(obj, []interface{}{key1, key2}, defaultValue)
}

// SafeIntegerProductN retrieves a multiplied integer value from a nested structure
func SafeIntegerProductN(obj interface{}, keys []interface{}, multiplier interface{}, defaultValue interface{}) interface{} {
	if multiplier == nil {
		multiplier = 1
	}
	result := SafeValueN(obj, keys, defaultValue)
	if result == nil {
		return defaultValue
	}
	multiplierFloat, _ := strconv.ParseFloat(fmt.Sprintf("%v", multiplier), 64)
	resultFloat, _ := strconv.ParseFloat(fmt.Sprintf("%v", result), 64)
	return int64(resultFloat * multiplierFloat)
}

// SafeIntegerProduct retrieves a multiplied integer value from a nested structure
func SafeIntegerProduct(obj interface{}, key interface{}, multiplier interface{}, defaultValue interface{}) interface{} {
	return SafeIntegerProductN(obj, []interface{}{key}, multiplier, defaultValue)
}

// SafeIntegerProduct2 retrieves a multiplied integer value from a nested structure with two keys
func SafeIntegerProduct2(obj interface{}, key1, key2 interface{}, multiplier interface{}, defaultValue interface{}) interface{} {
	return SafeIntegerProductN(obj, []interface{}{key1, key2}, multiplier, defaultValue)
}

// SafeBool retrieves a boolean value from a nested structure
func SafeBool(obj interface{}, key interface{}, defaultValue interface{}) interface{} {
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

func (this *Exchange) SafeString(obj interface{}, key interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeString(obj, key, defVal)
}

func (this *Exchange) SafeStringUpper(obj interface{}, key interface{}, defaultValue ...interface{}) interface{} {
	// return strings.ToUpper(this.safeString(obj, key, defaultValue...))
	res := this.SafeString(obj, key, defaultValue...)
	if res != nil {
		return strings.ToUpper(res.(string))
	}
	return nil // check this return type
}

func (this *Exchange) SafeStringLower(obj interface{}, key interface{}, defaultValue ...interface{}) interface{} {
	// return strings.ToUpper(this.safeString(obj, key, defaultValue...))
	res := this.SafeString(obj, key, defaultValue...)
	if res != "" && res != nil {
		return strings.ToLower(res.(string))
	}
	return nil // check this return type
}

func (this *Exchange) SafeStringLower2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{} {
	// return strings.ToUpper(this.safeString(obj, key, defaultValue...))
	res := this.SafeString2(obj, key, key2, defaultValue...)
	if res != "" && res != nil {
		return strings.ToLower(res.(string))
	}
	return nil // check this return type
}

func (this *Exchange) SafeStringUpper2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{} {
	// return strings.ToUpper(this.safeString(obj, key, defaultValue...))
	res := this.SafeString2(obj, key, key2, defaultValue...)
	if res != "" && res != nil {
		return strings.ToUpper(res.(string))
	}
	return nil // check this return type
}

func (this *Exchange) SafeString2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeString2(obj, key, key2, defVal)
}

func (this *Exchange) SafeStringN(obj interface{}, keys2 interface{}, defaultValue ...interface{}) interface{} {
	keys := keys2.([]interface{})
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeStringN(obj, keys, defVal)
}

func (this *Exchange) SafeStringLowerN(obj interface{}, keys2 interface{}, defaultValue ...interface{}) interface{} {
	keys := keys2.([]interface{})
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	res := SafeStringN(obj, keys, defVal)
	if res != "" && res != nil {
		return strings.ToLower(res.(string))
	}
	return defVal
}

func (this *Exchange) SafeFloat(obj interface{}, key interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeFloat(obj, key, defVal)
}

func (this *Exchange) SafeFloat2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeFloat2(obj, key, key2, defVal)
}

func (this *Exchange) SafeFloatN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeFloatN(obj, keys, defVal)
}

func (this *Exchange) SafeInteger(obj interface{}, key interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeInteger(obj, key, defVal)
}

func (this *Exchange) SafeInteger2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeInteger2(obj, key, key2, defVal)
}

func (this *Exchange) SafeIntegerN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeIntegerN(obj, keys, defVal)
}

func (this *Exchange) SafeValue(obj interface{}, key interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeValue(obj, key, defVal)
}

func (this *Exchange) SafeValue2(obj interface{}, key interface{}, key2 interface{}, defaultValue ...interface{}) interface{} {
	return SafeValueN(obj, []interface{}{key, key2}, defaultValue...)
}

func (this *Exchange) SafeValueN(obj interface{}, keys interface{}, defaultValue ...interface{}) interface{} {
	keysArray := keys.([]interface{})
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeValueN(obj, keysArray, defVal)
}

func (this *Exchange) SafeTimestamp(obj interface{}, key interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeTimestamp(obj, key, defVal)
}

func (this *Exchange) SafeTimestamp2(obj interface{}, key1, key2 interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeTimestamp2(obj, key1, key2, defVal)
}

func (this *Exchange) SafeTimestampN(obj interface{}, keys []interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeTimestampN(obj, keys, defVal)
}

func (this *Exchange) SafeIntegerProduct(obj interface{}, key interface{}, multiplier interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeIntegerProduct(obj, key, multiplier, defVal)
}

func (this *Exchange) SafeIntegerProduct2(obj interface{}, key1, key2 interface{}, multiplier interface{}, defaultValue ...interface{}) interface{} {
	var defVal interface{} = nil
	if len(defaultValue) > 0 {
		defVal = defaultValue[0]
	}
	return SafeIntegerProduct2(obj, key1, key2, multiplier, defVal)
}

func (this *Exchange) SafeIntegerProductN(obj interface{}, keys []interface{}, multiplier interface{}, defaultValue ...interface{}) interface{} {
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
