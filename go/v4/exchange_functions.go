package ccxt

import (
	"encoding/json"
	"fmt"
	"reflect"
	"regexp"
	"sort"
	"sync"
)

// keysort sorts the keys of a map and returns a new map with the sorted keys.
// func (this *Exchange) Keysort(parameters2 any) map[string]any {
// 	parameters := parameters2.(map[string]any)
// 	keys := make([]string, 0, len(parameters))
// 	for k := range parameters {
// 		keys = append(keys, k)
// 	}
// 	sort.Strings(keys)

// 	outDict := make(map[string]any)
// 	for _, key := range keys {
// 		outDict[key] = parameters[key]
// 	}
// 	return outDict
// }

func (this *Exchange) Keysort(parameters2 any) map[string]any {
	var tempMap map[string]any

	switch v := parameters2.(type) {
	case map[string]any:
		tempMap = v

	case *sync.Map:
		tempMap = make(map[string]any)
		v.Range(func(k, val any) bool {
			keyStr, ok := k.(string)
			if ok {
				tempMap[keyStr] = val
			}
			return true
		})

	default:
		// Unsupported type; return empty map
		return map[string]any{}
	}

	keys := make([]string, 0, len(tempMap))
	for k := range tempMap {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	outDict := make(map[string]any, len(keys))
	for _, key := range keys {
		outDict[key] = tempMap[key]
	}
	return outDict
}

func (this *Exchange) Sort(input any) []any {
	var list []any

	switch v := input.(type) {
	case []string:
		for _, item := range v {
			list = append(list, item)
		}
	case []any:
		list = append([]any{}, v...)
	default:
		return []any{}
	}

	sort.Slice(list, func(i, j int) bool {
		ai, aok := toFloat64(list[i])
		bi, bok := toFloat64(list[j])
		if aok && bok {
			return ai < bi
		}
		return fmt.Sprintf("%v", list[i]) < fmt.Sprintf("%v", list[j])
	})
	return list
}

func toFloat64(v any) (float64, bool) {
	switch n := v.(type) {
	case int:
		return float64(n), true
	case int32:
		return float64(n), true
	case int64:
		return float64(n), true
	case float32:
		return float64(n), true
	case float64:
		return n, true
	}
	return 0, false
}

// omit removes specified keys from a map.
// func (this *Exchange) Omit(a any, parameters ...any) any {
// 	if len(parameters) == 1 {
// 		// maybe we got []any as the only variadic argument, handle it
// 		if reflect.TypeOf(parameters[0]).Kind() == reflect.Slice {
// 			return this.OmitN(a, parameters[0].([]any))
// 		}
// 	}
// 	keys := make([]any, len(parameters))
// 	for i, parameter := range parameters {
// 		keys[i] = parameter
// 	}
// 	return this.OmitMap(a, keys)
// }

func (this *Exchange) Omit(a any, parameters ...any) any {
	if len(parameters) == 1 {
		// Handle single argument which could be a slice of various types
		switch keys := parameters[0].(type) {
		case []any:
			return this.OmitN(a, keys)
		case []string:
			// Convert []string to []any
			interfaceKeys := make([]any, len(keys))
			for i, key := range keys {
				interfaceKeys[i] = key
			}
			return this.OmitN(a, interfaceKeys)
		}
	}

	// Handle variadic parameters as individual keys
	keys := make([]any, len(parameters))
	copy(keys, parameters)
	return this.OmitMap(a, keys)
}

// omitMap removes specified keys from a map.
func (this *Exchange) OmitMap(aa any, k any) any {
	// if reflect.TypeOf(aa).Kind() == reflect.Slice {
	// 	return aa
	// 	//  if ok {
	// 	// 	 return res
	// 	//  }
	// 	//  return
	// }

	switch aa.(type) {
	case []any, []string, []bool, []int, []int64, []float64, []map[string]any:
		return aa
	}

	// Handle case where aa is not a map (e.g., string, nil, etc.)
	if aa == nil {
		return aa
	}

	// Try to convert to map, if it fails, return the original value
	a, ok := aa.(map[string]any)
	if !ok {
		// If it's not a map, return the original value
		return aa
	}

	var keys []any
	switch k.(type) {
	case string:
		// keys = []string{k.(string)}
	case []any:
		for _, v := range k.([]any) {
			keys = append(keys, v.(string))
		}
	}

	outDict := make(map[string]any)
	for key, value := range a {
		if !this.Contains(keys, key) {
			outDict[key] = value
		}
	}
	return outDict
}

// omitN removes specified keys from a map.
func (this *Exchange) OmitN(aa any, keys []any) any {
	outDict := make(map[string]any)
	a, ok := aa.(map[string]any)
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
func (this *Exchange) Contains(slice []any, elem string) bool {
	for _, s := range slice {
		if s.(string) == elem {
			return true
		}
	}
	return false
}

// toArray converts a map to a slice of its values.
// func (this *Exchange) ToArray(a any) []any {
// 	if a == nil {
// 		return nil
// 	}

// 	if reflect.TypeOf(a).Kind() == reflect.Slice {
// 		return a.([]any)
// 	}

// 	if reflect.TypeOf(a).Kind() == reflect.Map {
// 		b := a.(map[string]any)
// 		outList := make([]any, 0, len(b))
// 		for _, value := range b {
// 			outList = append(outList, value)
// 		}
// 		return outList
// 	}

// 	return nil
// }

func (this *Exchange) ToArray(a any) []any {
	if a == nil {
		return nil
	}

	// Check if `a` is a slice of `[]any`
	if slice, ok := a.([]any); ok {
		return slice
	}

	// Check if `a` implements IArrayCache interface (handles all cache types)
	if cache, ok := a.(IArrayCache); ok {
		return cache.ToArray()
	}

	// Check if `a` is a map of `map[string]any`
	if m, ok := a.(map[string]any); ok {
		outList := make([]any, 0, len(m))
		for _, value := range m {
			outList = append(outList, value)
		}
		return outList
	} else if m, ok := a.(*sync.Map); ok {
		outList := make([]any, 0)
		m.Range(func(key, value any) bool {
			outList = append(outList, value)
			return true
		})
		return outList
	}

	// Unsupported type
	return nil
}

// arrayConcat concatenates two slices.
func (this *Exchange) ArrayConcat(aa, bb any) any {
	if reflect.TypeOf(aa).Kind() == reflect.Slice && reflect.TypeOf(bb).Kind() == reflect.Slice {
		a := aa.([]any)
		b := bb.([]any)
		outList := make([]any, len(a)+len(b))
		copy(outList, a)
		copy(outList[len(a):], b)
		return outList
	}

	if reflect.TypeOf(aa).Kind() == reflect.Slice && reflect.TypeOf(bb).Kind() == reflect.Slice {
		a := aa.([]any)
		b := bb.([]any)
		outList := make([]any, len(a)+len(b))
		copy(outList, a)
		copy(outList[len(a):], b)
		return outList
	}
	return nil
}

// aggregate is a stub function that returns an empty slice.
// func (this *Exchange) Aggregate(bidasks any) []any {
// 	var outList []any
// 	return outList
// }

func (this *Exchange) Aggregate(bidasks any) []any {
	result := make(map[float64]float64)

	for _, pair := range bidasks.([][]any) {
		if len(pair) >= 2 {
			price := ToFloat64(pair[0])
			volume := ToFloat64(pair[1])
			result[price] += volume
		}
	}

	// Convert map back to [][]any
	res := make([]any, 0, len(result))
	for price, volume := range result {
		res = append(res, []any{price, volume})
	}

	return res
}

func (this *Exchange) ExtractParams(str2 any) []any {
	str := str2.(string)
	// Compile the regular expression
	regex := regexp.MustCompile(`\{([^\}]+)\}`)

	// Find all matches
	matches := regex.FindAllStringSubmatch(str, -1)

	// Create a list to store the extracted parameters
	outList := make([]any, 0, len(matches))

	// Iterate over the matches and add the captured groups to the list
	for _, match := range matches {
		if len(match) > 1 {
			outList = append(outList, match[1])
		}
	}

	return outList
}

func Json(obj any) string {
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
