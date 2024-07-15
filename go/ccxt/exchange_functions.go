package ccxt

import (
	"reflect"
	"regexp"
	"sort"
)

// keysort sorts the keys of a map and returns a new map with the sorted keys.
func (this *Exchange) keysort(parameters2 interface{}) map[string]interface{} {
	parameters := parameters2.(map[string]interface{})
	keys := make([]string, 0, len(parameters))
	for k := range parameters {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	outDict := make(map[string]interface{})
	for _, key := range keys {
		outDict[key] = parameters[key]
	}
	return outDict
}

// omit removes specified keys from a map.
func (this *Exchange) omit(a interface{}, parameters ...interface{}) interface{} {
	keys := make([]interface{}, len(parameters))
	for i, parameter := range parameters {
		keys[i] = parameter
	}
	return this.omitMap(a, keys)
}

// omitMap removes specified keys from a map.
func (this *Exchange) omitMap(aa interface{}, k interface{}) map[string]interface{} {
	if reflect.TypeOf(aa).Kind() == reflect.Slice {
		return aa.(map[string]interface{})
	}

	var keys []string
	switch k.(type) {
	case string:
		keys = []string{k.(string)}
	case []interface{}:
		for _, v := range k.([]interface{}) {
			keys = append(keys, v.(string))
		}
	}

	a := aa.(map[string]interface{})
	outDict := make(map[string]interface{})
	for key, value := range a {
		if !this.contains(keys, key) {
			outDict[key] = value
		}
	}
	return outDict
}

// omitN removes specified keys from a map.
func (this *Exchange) omitN(aa interface{}, keys []interface{}) map[string]interface{} {
	a := aa.(map[string]interface{})
	outDict := make(map[string]interface{})
	for key, value := range a {
		if !this.contains(keys, key) {
			outDict[key] = value
		}
	}
	return outDict
}

// contains checks if a slice contains a specific element.
func (this *Exchange) contains(slice []interface{}, elem string) bool {
	for _, s := range slice {
		if s.(string) == elem {
			return true
		}
	}
	return false
}

// toArray converts a map to a slice of its values.
func (this *Exchange) toArray(a interface{}) []interface{} {
	if a == nil {
		return nil
	}

	if reflect.TypeOf(a).Kind() == reflect.Slice {
		return a.([]interface{})
	}

	if reflect.TypeOf(a).Kind() == reflect.Map {
		b := a.(map[string]interface{})
		outList := make([]interface{}, 0, len(b))
		for _, value := range b {
			outList = append(outList, value)
		}
		return outList
	}

	return nil
}

// arrayConcat concatenates two slices.
func (this *Exchange) arrayConcat(aa, bb interface{}) interface{} {
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
func (this *Exchange) aggregate(bidasks interface{}) []interface{} {
	var outList []interface{}
	return outList
}

func (this *Exchange) extractParams(str interface{}) {
	// Check if the input is a string
	inputStr, ok := str.(string)
	if !ok {
		panic("input must be a string")
	}

	// Define the regular expression to match parameters enclosed in curly braces
	regex := regexp.MustCompile(`\{([^\}]+)\}`)

	// Find all matches
	matches := regex.FindAllStringSubmatch(inputStr, -1)

	// Extract the parameters from the matches
	outList := make([]interface{}, 0, len(matches))
	for _, match := range matches {
		if len(match) > 1 {
			outList = append(outList, match[1])
		}
	}

	// Panic with the extracted parameters
	panic(outList)
}
