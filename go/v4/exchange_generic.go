package ccxt

import (
	"fmt"
	"reflect"
	"sort"
	"strconv"
	"sync"
)

func (this *Exchange) SortBy(array interface{}, value1 interface{}, desc2 ...interface{}) []interface{} {
	var desc bool
	var defaultValue interface{} = "a"
	if len(desc2) > 0 {
		desc = desc2[0].(bool)
	}
	list := array.([]interface{})

	if str, ok := value1.(string); ok {
		sort.Slice(list, func(i, j int) bool {
			a := list[i].(map[string]interface{})[str]
			b := list[j].(map[string]interface{})[str]
			return fmt.Sprintf("%v", a) < fmt.Sprintf("%v", b)
		})
		if desc {
			for i := len(list)/2 - 1; i >= 0; i-- {
				opp := len(list) - 1 - i
				list[i], list[opp] = list[opp], list[i]
			}
		}
		return list
	} else {
		value := value1.(int)
		sort.Slice(list, func(i, j int) bool {
			var a, b interface{}
			if reflect.TypeOf(list[i]).Kind() == reflect.Slice {
				a = list[i].([]interface{})[value]
			} else {
				a = defaultValue
			}
			if reflect.TypeOf(list[j]).Kind() == reflect.Slice {
				b = list[j].([]interface{})[value]
			} else {
				b = defaultValue
			}
			// return fmt.Sprintf("%v", a) < fmt.Sprintf("%v", b)
			switch aVal := a.(type) {
			case int:
				if bVal, ok := b.(int); ok {
					return aVal < bVal
				}
			case float64:
				if bVal, ok := b.(float64); ok {
					return aVal < bVal
				}
			case string:
				if bVal, ok := b.(string); ok {
					return aVal < bVal
				}
			}

			// Fallback to string comparison
			return fmt.Sprintf("%v", a) < fmt.Sprintf("%v", b)
		})
		if desc {
			// for i := len(list)/2 - 1; i >= 0; i-- {
			// 	opp := len(list) - 1 - i
			// 	list[i], list[opp] = list[opp], list[i]
			// }
			for i := 0; i < len(list)/2; i++ {
				opp := len(list) - 1 - i
				list[i], list[opp] = list[opp], list[i]
			}
		}
		return list
	}
}

func (this *Exchange) SortBy2(array interface{}, key1 interface{}, key2 interface{}, desc2 ...interface{}) []interface{} {
	var desc bool
	if len(desc2) > 0 {
		desc = desc2[0].(bool)
	}
	list := array.([]interface{})

	if str, ok := key1.(string); ok {
		key2Str, _ := key2.(string)
		sort.Slice(list, func(i, j int) bool {
			a1 := list[i].(map[string]interface{})[str]
			a2 := list[i].(map[string]interface{})[key2Str]
			b1 := list[j].(map[string]interface{})[str]
			b2 := list[j].(map[string]interface{})[key2Str]
			if a1 == b1 {
				return fmt.Sprintf("%v", a2) < fmt.Sprintf("%v", b2)
			}
			return fmt.Sprintf("%v", a1) < fmt.Sprintf("%v", b1)
		})
		if desc {
			for i := len(list)/2 - 1; i >= 0; i-- {
				opp := len(list) - 1 - i
				list[i], list[opp] = list[opp], list[i]
			}
		}
		return list
	}
	return nil
}

// func (this *Exchange) FilterBy(aa interface{}, key interface{}, value interface{}) []interface{} {
// 	var targetA []interface{}
// 	if aaArr, ok := aa.([]interface{}); ok {
// 		targetA = aaArr
// 	} else {
// 		for _, v := range aa.(map[string]interface{}) {
// 			targetA = append(targetA, v)
// 		}
// 	}
// 	var outList []interface{}
// 	for _, elem := range targetA {
// 		if elem.(map[string]interface{})[key.(string)] == value {
// 			outList = append(outList, elem)
// 		}
// 	}
// 	return outList
// }

func (this *Exchange) FilterBy(aa interface{}, key interface{}, value interface{}) []interface{} {
	var targetA []interface{}

	switch v := aa.(type) {
	case []interface{}:
		targetA = v
	case map[string]interface{}:
		for _, item := range v {
			targetA = append(targetA, item)
		}
	case *sync.Map:
		v.Range(func(_, val interface{}) bool {
			targetA = append(targetA, val)
			return true
		})
	default:
		// unsupported type
		return nil
	}

	var outList []interface{}
	for _, elem := range targetA {
		if m, ok := elem.(map[string]interface{}); ok {
			if m[key.(string)] == value {
				outList = append(outList, m)
			}
		}
	}
	return outList
}

func (this *Exchange) Extend(aa interface{}, bb ...interface{}) map[string]interface{} {
	return ExtendMap(aa, bb...)
}

// func ExtendMap(aa interface{}, bb ...interface{}) map[string]interface{} {
// 	a := aa.(map[string]interface{})
// 	outDict := make(map[string]interface{})
// 	for key, value := range a {
// 		outDict[key] = value
// 	}
// 	if len(bb) > 0 {
// 		b, ok := bb[0].(map[string]interface{})
// 		if ok {
// 			for key, value := range b {
// 				outDict[key] = value
// 			}
// 		}
// 	}
// 	return outDict
// }

func ExtendMap(aa interface{}, bb ...interface{}) map[string]interface{} {
	outDict := make(map[string]interface{})

	// Handle first map (aa)
	switch a := aa.(type) {
	case map[string]interface{}:
		for key, value := range a {
			outDict[key] = value
		}
	case *sync.Map:
		a.Range(func(key, value interface{}) bool {
			if strKey, ok := key.(string); ok {
				outDict[strKey] = value
			}
			return true
		})
	}

	// Handle optional second map (bb[0])
	if len(bb) > 0 {
		switch b := bb[0].(type) {
		case map[string]interface{}:
			for key, value := range b {
				outDict[key] = value
			}
		case *sync.Map:
			b.Range(func(key, value interface{}) bool {
				if strKey, ok := key.(string); ok {
					outDict[strKey] = value
				}
				return true
			})
		}
	}

	return outDict
}

func (this *Exchange) DeepExtend2(objs ...interface{}) interface{} {
	outDict := make(map[string]interface{})
	for _, obj := range objs {
		if obj == nil {
			obj = make(map[string]interface{})
		}
		if reflect.TypeOf(obj).Kind() == reflect.Map {
			for key, value := range obj.(map[string]interface{}) {
				if value != nil && reflect.TypeOf(value).Kind() == reflect.Map {
					if _, exists := outDict[key]; exists {
						outDict[key] = this.DeepExtend2(outDict[key], value)
					} else {
						outDict[key] = this.DeepExtend2(value)
					}
				} else {
					outDict[key] = value
				}
			}
		} else {
			outDict = obj.(map[string]interface{})
		}
	}
	return outDict
}

// func (this *Exchange) DeepExtend(objs ...interface{}) map[string]interface{} {
// 	var outObj interface{}
// 	for _, x := range objs {
// 		if x == nil {
// 			continue
// 		}
// 		if reflect.TypeOf(x).Kind() == reflect.Map {
// 			if outObj == nil || reflect.TypeOf(outObj).Kind() != reflect.Map {
// 				outObj = make(map[string]interface{})
// 			}
// 			dictX := x.(map[string]interface{})
// 			for k, _ := range dictX {
// 				arg1 := outObj.(map[string]interface{})[k]
// 				arg2 := dictX[k]
// 				if arg1 != nil && arg2 != nil && reflect.TypeOf(arg1).Kind() == reflect.Map && reflect.TypeOf(arg2).Kind() == reflect.Map {
// 					outObj.(map[string]interface{})[k] = this.DeepExtend(arg1, arg2)
// 				} else {
// 					if arg2 != nil {
// 						outObj.(map[string]interface{})[k] = arg2
// 					} else {
// 						outObj.(map[string]interface{})[k] = arg1
// 					}
// 				}
// 			}
// 		} else {
// 			outObj = x
// 		}
// 	}
// 	return outObj.(map[string]interface{})
// }

func (this *Exchange) DeepExtend(objs ...interface{}) map[string]interface{} {
	var outObj interface{}

	// Helper function to convert *sync.Map to map[string]interface{}
	convertSyncMap := func(sm *sync.Map) map[string]interface{} {
		m := make(map[string]interface{})
		if sm == nil {
			return m
		}
		sm.Range(func(key, value interface{}) bool {
			if ks, ok := key.(string); ok {
				m[ks] = value
			}
			return true
		})
		return m
	}

	for _, x := range objs {
		if x == nil {
			continue
		}

		var dictX map[string]interface{}

		switch v := x.(type) {
		case map[string]interface{}:
			dictX = v
		case *sync.Map:
			dictX = convertSyncMap(v)
		default:
			outObj = x
			continue
		}

		if outObj == nil {
			outObj = make(map[string]interface{})
		}
		if _, ok := outObj.(map[string]interface{}); !ok {
			outObj = make(map[string]interface{})
		}

		for k, v2 := range dictX {
			v1 := outObj.(map[string]interface{})[k]
			if v1 != nil && v2 != nil &&
				(reflect.TypeOf(v1).Kind() == reflect.Map || reflect.TypeOf(v1) == reflect.TypeOf(&sync.Map{})) &&
				(reflect.TypeOf(v2).Kind() == reflect.Map || reflect.TypeOf(v2) == reflect.TypeOf(&sync.Map{})) {

				// Recursively merge
				outObj.(map[string]interface{})[k] = this.DeepExtend(v1, v2)
			} else {
				// if v2 != nil {
				// 	outObj.(map[string]interface{})[k] = v2
				// } else {
				// 	outObj.(map[string]interface{})[k] = v1
				// }
				outObj.(map[string]interface{})[k] = v2 // always take v2
			}
		}
	}

	return outObj.(map[string]interface{})
}

// func (this *Exchange) DeepExtend(objs ...interface{}) map[string]interface{} {
// 	var outObj map[string]interface{}

// 	for _, x := range objs {
// 		if x == nil {
// 			continue
// 		}

// 		dictX, ok := x.(map[string]interface{})
// 		if !ok {
// 			continue
// 		}

// 		if outObj == nil {
// 			outObj = make(map[string]interface{})
// 		}

// 		for k, v := range dictX {
// 			if existingVal, exists := outObj[k]; exists {
// 				if existingMap, ok1 := existingVal.(map[string]interface{}); ok1 {
// 					if vMap, ok2 := v.(map[string]interface{}); ok2 {
// 						// Recursively merge maps
// 						outObj[k] = this.DeepExtend(existingMap, vMap)
// 						continue
// 					}
// 				}
// 			}
// 			// Directly assign the value if no deep merging is needed
// 			outObj[k] = v
// 		}
// 	}

// 	return outObj
// }

// func (this *Exchange) DeepExtend(objs ...interface{}) map[string]interface{} {
// 	var outObj interface{}
// 	for _, x := range objs {
// 		if x == nil {
// 			continue
// 		}
// 		// if xMap, ok := x.(map[string]interface{}); ok {
// 		if xMap, ok := x.(map[string]interface{}); ok {
// 			if outObj == nil {
// 				outObj = make(map[string]interface{})
// 			} else if _, ok := x.(map[string]interface{}); !ok {
// 				//  || reflect.TypeOf(outObj).Kind() != reflect.Map
// 				outObj = make(map[string]interface{})
// 			}
// 			dictX := xMap
// 			for k, _ := range dictX {
// 				arg1 := outObj.(map[string]interface{})[k]
// 				arg2 := dictX[k]
// 				if arg1 != nil && arg2 != nil {
// 					_, arg1IsMap := arg1.(map[string]interface{})
// 					_, arg2IsMap := arg2.(map[string]interface{})
// 					if arg1IsMap && arg2IsMap {
// 						outObj.(map[string]interface{})[k] = this.DeepExtend(arg1, arg2)
// 					}
// 				} else {
// 					if arg2 != nil {
// 						outObj.(map[string]interface{})[k] = arg2
// 					} else {
// 						outObj.(map[string]interface{})[k] = arg1
// 					}
// 				}
// 			}
// 		} else {
// 			outObj = x
// 		}
// 	}
// 	return outObj.(map[string]interface{})
// }

// func (this *Exchange) DeepExtend(objs ...interface{}) map[string]interface{} {
// 	var outObj interface{}
// 	for _, x := range objs {
// 		if x == nil {
// 			continue
// 		}
// 		// if xMap, ok := x.(map[string]interface{}); ok {
// 		if xMap, ok := x.(map[string]interface{}); ok {
// 			if outObj == nil {
// 				outObj = make(map[string]interface{})
// 			} else if _, ok := x.(map[string]interface{}); !ok  {
// 				//  || reflect.TypeOf(outObj).Kind() != reflect.Map
// 				outObj = make(map[string]interface{})
// 			}
// 			dictX := xMap
// 			for k, _ := range dictX {
// 				arg1 := outObj.(map[string]interface{})[k]
// 				arg2 := dictX[k]
// 				if arg1 != nil && arg2 != nil {
// 					_, arg1IsMap := arg1.(map[string]interface{})
// 					_, arg2IsMap := arg2.(map[string]interface{})
// 					if arg1IsMap && arg2IsMap {
// 						outObj.(map[string]interface{})[k] = this.DeepExtend(arg1, arg2)
// 					}
// 				} else {
// 					if arg2 != nil {
// 						outObj.(map[string]interface{})[k] = arg2
// 					} else {
// 						outObj.(map[string]interface{})[k] = arg1
// 					}
// 				}
// 			}
// 		} else {
// 			outObj = x
// 		}
// 	}
// 	return outObj.(map[string]interface{})
// }

// func (this *Exchange) InArray(elem interface{}, list2 interface{}) bool {
// 	if list2 == nil {
// 		return false
// 	}
// 	if reflect.TypeOf(list2).Kind() == reflect.Slice {
// 		list := list2.([]interface{})
// 		for _, v := range list {
// 			if v == elem {
// 				return true
// 			}
// 		}
// 	}
// 	return false
// }

func (this *Exchange) InArray(elem interface{}, list interface{}) bool {
	// Ensure the list is not nil and is of a slice type
	if list == nil || reflect.TypeOf(list).Kind() != reflect.Slice {
		return false
	}

	// Use reflection to iterate over the slice
	listValue := reflect.ValueOf(list)
	for i := 0; i < listValue.Len(); i++ {
		listElem := listValue.Index(i).Interface()

		// Handle number comparison
		switch e := elem.(type) {
		case int, int8, int16, int32, int64, float32, float64:
			switch l := listElem.(type) {
			case int, int8, int16, int32, int64, float32, float64:
				// Convert both to float64 for comparison
				if ToFloat64(e) == ToFloat64(l) {
					return true
				}
			}
		default:
			// For non-numeric values, use DeepEqual
			if reflect.DeepEqual(listElem, elem) {
				return true
			}
		}
	}

	return false
}

// func (this *Exchange) InArray(elem interface{}, list interface{}) bool {
// 	// Ensure the list is not nil and is of a slice type
// 	if list == nil || reflect.TypeOf(list).Kind() != reflect.Slice {
// 		return false
// 	}

// 	// Use reflection to iterate over the slice
// 	listValue := reflect.ValueOf(list)
// 	for i := 0; i < listValue.Len(); i++ {
// 		if reflect.DeepEqual(listValue.Index(i).Interface(), elem) {
// 			return true
// 		}
// 	}

// 	return false
// }

func (this *Exchange) IsArray(a interface{}) bool {
	// return reflect.TypeOf(a).Kind() == reflect.Slice
	switch a.(type) {
	case []interface{}:
		return true
	case []string:
		return true
	case []int:
		return true
	case []int64:
		return true
	case []float64:
		return true
	case []map[string]interface{}:
		return true
	}
	return false
}

func (this *Exchange) IndexBy(a interface{}, key interface{}) map[string]interface{} {
	outDict := make(map[string]interface{})
	var targetX []interface{}

	// Check if `a` is a slice of `[]interface{}` or a map
	if aArr, ok := a.([]interface{}); ok {
		targetX = aArr
	} else if aMap, ok := a.(map[string]interface{}); ok {
		for _, v := range aMap {
			targetX = append(targetX, v)
		}
	} else if syncMap, ok := a.(*sync.Map); ok {
		syncMap.Range(func(_, v interface{}) bool {
			targetX = append(targetX, v)
			return true
		})
	} else {
		return outDict // Unsupported type
	}

	// Process the slice `targetX`
	for _, elem := range targetX {
		switch v := elem.(type) {
		case map[string]interface{}:
			// Handle map entries
			if val, ok := v[ToString(key)]; ok {
				outDict[ToString(val)] = v
			}
		case *sync.Map:
			// Handle *sync.Map entries
			v.Range(func(k, val interface{}) bool {
				if _, ok := k.(string); ok {
					if valMap, ok := val.(map[string]interface{}); ok {
						if keyStr, ok := valMap[ToString(key)].(string); ok {
							outDict[keyStr] = valMap
						}
					}
				}
				return true
			})
		case []interface{}:
			// Handle slices of []interface{}
			if idx, ok := key.(int); ok && idx >= 0 && idx < len(v) {
				if keyStr, ok := v[idx].(string); ok {
					outDict[keyStr] = v
				}
			}
		case []string:
			// Handle slices of []string
			if idx, ok := key.(int); ok && idx >= 0 && idx < len(v) {
				outDict[v[idx]] = v
			}
		case []int:
			// Handle slices of []int
			if idx, ok := key.(int); ok && idx >= 0 && idx < len(v) {
				outDict[fmt.Sprintf("%d", v[idx])] = v
			}
		}
	}

	return outDict
}

func (this *Exchange) IndexBySafe(a interface{}, key interface{}) *sync.Map {
	outDict := &sync.Map{}
	var targetX []interface{}

	switch val := a.(type) {
	case []interface{}:
		targetX = val

	case map[string]interface{}:
		for _, v := range val {
			targetX = append(targetX, v)
		}

	case *sync.Map:
		val.Range(func(_, v interface{}) bool {
			targetX = append(targetX, v)
			return true
		})

	default:
		return outDict // unsupported type
	}

	for _, elem := range targetX {
		switch v := elem.(type) {
		case map[string]interface{}:
			if val, ok := v[ToString(key)]; ok {
				outDict.Store(ToString(val), v)
			}
		case []interface{}:
			if idx, ok := key.(int); ok && idx >= 0 && idx < len(v) {
				if keyStr, ok := v[idx].(string); ok {
					outDict.Store(keyStr, v)
				}
			}
		case []string:
			if idx, ok := key.(int); ok && idx >= 0 && idx < len(v) {
				outDict.Store(v[idx], v)
			}
		case []int:
			if idx, ok := key.(int); ok && idx >= 0 && idx < len(v) {
				outDict.Store(fmt.Sprintf("%d", v[idx]), v)
			}
		}
	}

	return outDict
}

// func (this *Exchange) IndexBy(a interface{}, key2 interface{}) map[string]interface{} {
// 	outDict := make(map[string]interface{})
// 	var targetX []interface{}
// 	if aArr, ok := a.([]interface{}); ok {
// 		targetX = aArr
// 	} else {
// 		for _, v := range a.(map[string]interface{}) {
// 			targetX = append(targetX, v)
// 		}
// 	}
// 	for _, elem := range targetX {
// 		if reflect.TypeOf(elem).Kind() == reflect.Map {
// 			elem2 := elem.(map[string]interface{})
// 			if val, ok := elem2[ToString(key2)]; ok {
// 				outDict[ToString(val)] = elem2
// 			}
// 		} else if reflect.TypeOf(elem).Kind() == reflect.Slice {
// 			index := key2.(int)
// 			elem2 := elem.([]interface{})
// 			if len(elem2) > index {
// 				outDict[elem2[index].(string)] = elem2
// 			}
// 		}
// 	}
// 	return outDict
// }

func (this *Exchange) GroupBy(trades interface{}, key2 interface{}) map[string]interface{} {
	key := key2.(string)
	outDict := make(map[string]interface{})
	list := trades.([]interface{})
	for _, elem := range list {
		elemDict := elem.(map[string]interface{})
		if val, ok := elemDict[key]; ok {
			if val == nil {
				continue
			}
			elem2 := val.(string)
			if list2, exists := outDict[elem2]; exists {
				list2 = append(list2.([]interface{}), elem)
				outDict[elem2] = list2
			} else {
				outDict[elem2] = []interface{}{elem}
			}
		}
	}
	return outDict
}

func (this *Exchange) OmitZero(value interface{}) interface{} {
	switch v := value.(type) {
	case float64:
		if v == 0.0 {
			return nil
		}
	case int64:
		if v == 0 {
			return nil
		}
	case string:
		// Attempt to parse the string as a float64
		parsed, err := strconv.ParseFloat(v, 64)
		if err == nil {
			// If parsed value is zero, return nil
			if parsed == 0 {
				return nil
			}
		}
		// If parsing fails or value is non-zero, return the original string
	}
	return value
}

func (this *Exchange) Sum(args ...interface{}) interface{} {
	var res interface{} = 0.0
	for _, arg := range args {
		res = this.sumValues(res, arg)
	}
	return res
}

func (this *Exchange) sumValues(a, b interface{}) interface{} {
	return Add(a, b)
}
