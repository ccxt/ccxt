package ccxt

import (
	"encoding/json"
	"reflect"
	"regexp"
	"sort"
	"sync"
)

func (this *Exchange) Ordered(a interface{}) interface{} {
	if reflect.TypeOf(a).Kind() == reflect.Map {
		return this.Keysort(a)
	}
	return a
}

// keysort sorts the keys of a map and returns a new map with the sorted keys.
// func (this *Exchange) Keysort(parameters2 interface{}) map[string]interface{} {
// 	parameters := parameters2.(map[string]interface{})
// 	keys := make([]string, 0, len(parameters))
// 	for k := range parameters {
// 		keys = append(keys, k)
// 	}
// 	sort.Strings(keys)

// 	outDict := make(map[string]interface{})
// 	for _, key := range keys {
// 		outDict[key] = parameters[key]
// 	}
// 	return outDict
// }

func (this *Exchange) Keysort(parameters2 interface{}) map[string]interface{} {
	var tempMap map[string]interface{}

	switch v := parameters2.(type) {
	case map[string]interface{}:
		tempMap = v

	case *sync.Map:
		tempMap = make(map[string]interface{})
		v.Range(func(k, val interface{}) bool {
			keyStr, ok := k.(string)
			if ok {
				tempMap[keyStr] = val
			}
			return true
		})

	default:
		// Unsupported type; return empty map
		return map[string]interface{}{}
	}

	keys := make([]string, 0, len(tempMap))
	for k := range tempMap {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	outDict := make(map[string]interface{}, len(keys))
	for _, key := range keys {
		outDict[key] = tempMap[key]
	}
	return outDict
}

func (this *Exchange) Sort(input interface{}) []string {
	var list []string

	switch v := input.(type) {
	case []string:
		list = append([]string{}, v...) // Copy to avoid modifying the original
	case []interface{}:
		for _, item := range v {
			if str, ok := item.(string); ok {
				list = append(list, str)
			}
		}
	default:
		// Unsupported type
		return []string{}
	}

	sort.Strings(list)
	return list
}

// omit removes specified keys from a map.
// func (this *Exchange) Omit(a interface{}, parameters ...interface{}) interface{} {
// 	if len(parameters) == 1 {
// 		// maybe we got []interface{} as the only variadic argument, handle it
// 		if reflect.TypeOf(parameters[0]).Kind() == reflect.Slice {
// 			return this.OmitN(a, parameters[0].([]interface{}))
// 		}
// 	}
// 	keys := make([]interface{}, len(parameters))
// 	for i, parameter := range parameters {
// 		keys[i] = parameter
// 	}
// 	return this.OmitMap(a, keys)
// }

func (this *Exchange) Omit(a interface{}, parameters ...interface{}) interface{} {
	if len(parameters) == 1 {
		// Handle single argument which could be a slice of various types
		switch keys := parameters[0].(type) {
		case []interface{}:
			return this.OmitN(a, keys)
		case []string:
			// Convert []string to []interface{}
			interfaceKeys := make([]interface{}, len(keys))
			for i, key := range keys {
				interfaceKeys[i] = key
			}
			return this.OmitN(a, interfaceKeys)
		}
	}

	// Handle variadic parameters as individual keys
	keys := make([]interface{}, len(parameters))
	copy(keys, parameters)
	return this.OmitMap(a, keys)
}

// omitMap removes specified keys from a map.
func (this *Exchange) OmitMap(aa interface{}, k interface{}) interface{} {
	// if reflect.TypeOf(aa).Kind() == reflect.Slice {
	// 	return aa
	// 	//  if ok {
	// 	// 	 return res
	// 	//  }
	// 	//  return
	// }

	switch aa.(type) {
	case []interface{}, []string, []bool, []int, []int64, []float64, []map[string]interface{}:
		return aa
	}

	// Handle case where aa is not a map (e.g., string, nil, etc.)
	if aa == nil {
		return aa
	}

	// Try to convert to map, if it fails, return the original value
	a, ok := aa.(map[string]interface{})
	if !ok {
		// If it's not a map, return the original value
		return aa
	}

	var keys []interface{}
	switch k.(type) {
	case string:
		// keys = []string{k.(string)}
	case []interface{}:
		for _, v := range k.([]interface{}) {
			keys = append(keys, v.(string))
		}
	}

	outDict := make(map[string]interface{})
	for key, value := range a {
		if !this.Contains(keys, key) {
			outDict[key] = value
		}
	}
	return outDict
}

// omitN removes specified keys from a map.
func (this *Exchange) OmitN(aa interface{}, keys []interface{}) interface{} {
	outDict := make(map[string]interface{})
	a, ok := aa.(map[string]interface{})
	if ok {
		for key, value := range a {
			if !this.Contains(keys, key) {
				outDict[key] = value
			}
		}
		return outDict
	}
	return aa
}

// contains checks if a slice contains a specific element.
func (this *Exchange) Contains(slice []interface{}, elem string) bool {
	for _, s := range slice {
		if s.(string) == elem {
			return true
		}
	}
	return false
}

// toArray converts a map to a slice of its values.
// func (this *Exchange) ToArray(a interface{}) []interface{} {
// 	if a == nil {
// 		return nil
// 	}

// 	if reflect.TypeOf(a).Kind() == reflect.Slice {
// 		return a.([]interface{})
// 	}

// 	if reflect.TypeOf(a).Kind() == reflect.Map {
// 		b := a.(map[string]interface{})
// 		outList := make([]interface{}, 0, len(b))
// 		for _, value := range b {
// 			outList = append(outList, value)
// 		}
// 		return outList
// 	}

// 	return nil
// }

func (this *Exchange) ToArray(a interface{}) []interface{} {
	if a == nil {
		return nil
	}

	// Check if `a` is a slice of `[]interface{}`
	if slice, ok := a.([]interface{}); ok {
		return slice
	}

	// Check if `a` implements IArrayCache interface (handles all cache types)
	if cache, ok := a.(IArrayCache); ok {
		return cache.ToArray()
	}

	// Check if `a` is a map of `map[string]interface{}`
	if m, ok := a.(map[string]interface{}); ok {
		outList := make([]interface{}, 0, len(m))
		for _, value := range m {
			outList = append(outList, value)
		}
		return outList
	} else if m, ok := a.(*sync.Map); ok {
		outList := make([]interface{}, 0)
		m.Range(func(key, value interface{}) bool {
			outList = append(outList, value)
			return true
		})
		return outList
	}

	// Unsupported type
	return nil
}

// arrayConcat concatenates two slices.
func (this *Exchange) ArrayConcat(aa, bb interface{}) interface{} {
	if reflect.TypeOf(aa).Kind() == reflect.Slice && reflect.TypeOf(bb).Kind() == reflect.Slice {
		a := aa.([]interface{})
		b := bb.([]interface{})
		outList := make([]interface{}, len(a)+len(b))
		copy(outList, a)
		copy(outList[len(a):], b)
		return outList
	}

	if reflect.TypeOf(aa).Kind() == reflect.Slice && reflect.TypeOf(bb).Kind() == reflect.Slice {
		a := aa.([]interface{})
		b := bb.([]interface{})
		outList := make([]interface{}, len(a)+len(b))
		copy(outList, a)
		copy(outList[len(a):], b)
		return outList
	}
	return nil
}

// aggregate is a stub function that returns an empty slice.
// func (this *Exchange) Aggregate(bidasks interface{}) []interface{} {
// 	var outList []interface{}
// 	return outList
// }

func (this *Exchange) Aggregate(bidasks interface{}) []interface{} {
	result := make(map[float64]float64)

	for _, pair := range bidasks.([][]interface{}) {
		if len(pair) >= 2 {
			price := ToFloat64(pair[0])
			volume := ToFloat64(pair[1])
			result[price] += volume
		}
	}

	// Convert map back to [][]interface{}
	res := make([]interface{}, 0, len(result))
	for price, volume := range result {
		res = append(res, []interface{}{price, volume})
	}

	return res
}

func (this *Exchange) ExtractParams(str2 interface{}) []interface{} {
	str := str2.(string)
	// Compile the regular expression
	regex := regexp.MustCompile(`\{([^\}]+)\}`)

	// Find all matches
	matches := regex.FindAllStringSubmatch(str, -1)

	// Create a list to store the extracted parameters
	outList := make([]interface{}, 0, len(matches))

	// Iterate over the matches and add the captured groups to the list
	for _, match := range matches {
		if len(match) > 1 {
			outList = append(outList, match[1])
		}
	}

	return outList
}

func Json(obj interface{}) string {
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
