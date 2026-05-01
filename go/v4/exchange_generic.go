package ccxt

import (
	"fmt"
	"reflect"
	"sort"
	"strconv"
	"sync"
)

func (this *Exchange) SortBy(array any, value1 any, desc2 ...any) []any {
	var desc bool
	var defaultValue any = "a"
	if len(desc2) > 0 {
		desc = desc2[0].(bool)
	}
	list := array.([]any)

	if str, ok := value1.(string); ok {
		sort.Slice(list, func(i, j int) bool {
			a := list[i].(map[string]any)[str]
			b := list[j].(map[string]any)[str]
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
			var a, b any
			if reflect.TypeOf(list[i]).Kind() == reflect.Slice {
				a = list[i].([]any)[value]
			} else {
				a = defaultValue
			}
			if reflect.TypeOf(list[j]).Kind() == reflect.Slice {
				b = list[j].([]any)[value]
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

func (this *Exchange) SortBy2(array any, key1 any, key2 any, desc2 ...any) []any {
	var desc bool
	if len(desc2) > 0 {
		desc = desc2[0].(bool)
	}
	list := array.([]any)

	if str, ok := key1.(string); ok {
		key2Str, _ := key2.(string)
		sort.Slice(list, func(i, j int) bool {
			a1 := list[i].(map[string]any)[str]
			a2 := list[i].(map[string]any)[key2Str]
			b1 := list[j].(map[string]any)[str]
			b2 := list[j].(map[string]any)[key2Str]
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

// func (this *Exchange) FilterBy(aa any, key any, value any) []any {
// 	var targetA []any
// 	if aaArr, ok := aa.([]any); ok {
// 		targetA = aaArr
// 	} else {
// 		for _, v := range aa.(map[string]any) {
// 			targetA = append(targetA, v)
// 		}
// 	}
// 	var outList []any
// 	for _, elem := range targetA {
// 		if elem.(map[string]any)[key.(string)] == value {
// 			outList = append(outList, elem)
// 		}
// 	}
// 	return outList
// }

func (this *Exchange) FilterBy(aa any, key any, value any) []any {
	var targetA []any

	switch v := aa.(type) {
	case []any:
		targetA = v
	case map[string]any:
		for _, item := range v {
			targetA = append(targetA, item)
		}
	case *sync.Map:
		v.Range(func(_, val any) bool {
			targetA = append(targetA, val)
			return true
		})
	default:
		// unsupported type
		return nil
	}

	var outList []any
	for _, elem := range targetA {
		if m, ok := elem.(map[string]any); ok {
			if m[key.(string)] == value {
				outList = append(outList, m)
			}
		}
	}
	return outList
}

func (this *Exchange) Extend(aa any, bb ...any) map[string]any {
	return ExtendMap(aa, bb...)
}

// func ExtendMap(aa any, bb ...any) map[string]any {
// 	a := aa.(map[string]any)
// 	outDict := make(map[string]any)
// 	for key, value := range a {
// 		outDict[key] = value
// 	}
// 	if len(bb) > 0 {
// 		b, ok := bb[0].(map[string]any)
// 		if ok {
// 			for key, value := range b {
// 				outDict[key] = value
// 			}
// 		}
// 	}
// 	return outDict
// }

func ExtendMap(aa any, bb ...any) map[string]any {
	outDict := make(map[string]any)

	// Handle first map (aa)
	switch a := aa.(type) {
	case map[string]any:
		for key, value := range a {
			outDict[key] = value
		}
	case *sync.Map:
		a.Range(func(key, value any) bool {
			if strKey, ok := key.(string); ok {
				outDict[strKey] = value
			}
			return true
		})
	}

	// Handle optional second map (bb[0])
	if len(bb) > 0 {
		switch b := bb[0].(type) {
		case map[string]any:
			for key, value := range b {
				outDict[key] = value
			}
		case *sync.Map:
			b.Range(func(key, value any) bool {
				if strKey, ok := key.(string); ok {
					outDict[strKey] = value
				}
				return true
			})
		}
	}

	return outDict
}

func (this *Exchange) DeepExtend2(objs ...any) any {
	outDict := make(map[string]any)
	for _, obj := range objs {
		if obj == nil {
			obj = make(map[string]any)
		}
		if reflect.TypeOf(obj).Kind() == reflect.Map {
			for key, value := range obj.(map[string]any) {
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
			outDict = obj.(map[string]any)
		}
	}
	return outDict
}

// func (this *Exchange) DeepExtend(objs ...any) map[string]any {
// 	var outObj any
// 	for _, x := range objs {
// 		if x == nil {
// 			continue
// 		}
// 		if reflect.TypeOf(x).Kind() == reflect.Map {
// 			if outObj == nil || reflect.TypeOf(outObj).Kind() != reflect.Map {
// 				outObj = make(map[string]any)
// 			}
// 			dictX := x.(map[string]any)
// 			for k, _ := range dictX {
// 				arg1 := outObj.(map[string]any)[k]
// 				arg2 := dictX[k]
// 				if arg1 != nil && arg2 != nil && reflect.TypeOf(arg1).Kind() == reflect.Map && reflect.TypeOf(arg2).Kind() == reflect.Map {
// 					outObj.(map[string]any)[k] = this.DeepExtend(arg1, arg2)
// 				} else {
// 					if arg2 != nil {
// 						outObj.(map[string]any)[k] = arg2
// 					} else {
// 						outObj.(map[string]any)[k] = arg1
// 					}
// 				}
// 			}
// 		} else {
// 			outObj = x
// 		}
// 	}
// 	return outObj.(map[string]any)
// }

func (this *Exchange) DeepExtend(objs ...any) map[string]any {
	var outObj any

	// Helper function to convert *sync.Map to map[string]any
	convertSyncMap := func(sm *sync.Map) map[string]any {
		m := make(map[string]any)
		if sm == nil {
			return m
		}
		sm.Range(func(key, value any) bool {
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

		var dictX map[string]any

		switch v := x.(type) {
		case map[string]any:
			dictX = v
		case *sync.Map:
			dictX = convertSyncMap(v)
		default:
			outObj = x
			continue
		}

		if outObj == nil {
			outObj = make(map[string]any)
		}
		if _, ok := outObj.(map[string]any); !ok {
			outObj = make(map[string]any)
		}

		for k, v2 := range dictX {
			v1 := outObj.(map[string]any)[k]
			if v1 != nil && v2 != nil &&
				(reflect.TypeOf(v1).Kind() == reflect.Map || reflect.TypeOf(v1) == reflect.TypeOf(&sync.Map{})) &&
				(reflect.TypeOf(v2).Kind() == reflect.Map || reflect.TypeOf(v2) == reflect.TypeOf(&sync.Map{})) {

				// Recursively merge
				outObj.(map[string]any)[k] = this.DeepExtend(v1, v2)
			} else {
				// if v2 != nil {
				// 	outObj.(map[string]any)[k] = v2
				// } else {
				// 	outObj.(map[string]any)[k] = v1
				// }
				outObj.(map[string]any)[k] = v2 // always take v2
			}
		}
	}

	return outObj.(map[string]any)
}

// func (this *Exchange) DeepExtend(objs ...any) map[string]any {
// 	var outObj map[string]any

// 	for _, x := range objs {
// 		if x == nil {
// 			continue
// 		}

// 		dictX, ok := x.(map[string]any)
// 		if !ok {
// 			continue
// 		}

// 		if outObj == nil {
// 			outObj = make(map[string]any)
// 		}

// 		for k, v := range dictX {
// 			if existingVal, exists := outObj[k]; exists {
// 				if existingMap, ok1 := existingVal.(map[string]any); ok1 {
// 					if vMap, ok2 := v.(map[string]any); ok2 {
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

// func (this *Exchange) DeepExtend(objs ...any) map[string]any {
// 	var outObj any
// 	for _, x := range objs {
// 		if x == nil {
// 			continue
// 		}
// 		// if xMap, ok := x.(map[string]any); ok {
// 		if xMap, ok := x.(map[string]any); ok {
// 			if outObj == nil {
// 				outObj = make(map[string]any)
// 			} else if _, ok := x.(map[string]any); !ok {
// 				//  || reflect.TypeOf(outObj).Kind() != reflect.Map
// 				outObj = make(map[string]any)
// 			}
// 			dictX := xMap
// 			for k, _ := range dictX {
// 				arg1 := outObj.(map[string]any)[k]
// 				arg2 := dictX[k]
// 				if arg1 != nil && arg2 != nil {
// 					_, arg1IsMap := arg1.(map[string]any)
// 					_, arg2IsMap := arg2.(map[string]any)
// 					if arg1IsMap && arg2IsMap {
// 						outObj.(map[string]any)[k] = this.DeepExtend(arg1, arg2)
// 					}
// 				} else {
// 					if arg2 != nil {
// 						outObj.(map[string]any)[k] = arg2
// 					} else {
// 						outObj.(map[string]any)[k] = arg1
// 					}
// 				}
// 			}
// 		} else {
// 			outObj = x
// 		}
// 	}
// 	return outObj.(map[string]any)
// }

// func (this *Exchange) DeepExtend(objs ...any) map[string]any {
// 	var outObj any
// 	for _, x := range objs {
// 		if x == nil {
// 			continue
// 		}
// 		// if xMap, ok := x.(map[string]any); ok {
// 		if xMap, ok := x.(map[string]any); ok {
// 			if outObj == nil {
// 				outObj = make(map[string]any)
// 			} else if _, ok := x.(map[string]any); !ok  {
// 				//  || reflect.TypeOf(outObj).Kind() != reflect.Map
// 				outObj = make(map[string]any)
// 			}
// 			dictX := xMap
// 			for k, _ := range dictX {
// 				arg1 := outObj.(map[string]any)[k]
// 				arg2 := dictX[k]
// 				if arg1 != nil && arg2 != nil {
// 					_, arg1IsMap := arg1.(map[string]any)
// 					_, arg2IsMap := arg2.(map[string]any)
// 					if arg1IsMap && arg2IsMap {
// 						outObj.(map[string]any)[k] = this.DeepExtend(arg1, arg2)
// 					}
// 				} else {
// 					if arg2 != nil {
// 						outObj.(map[string]any)[k] = arg2
// 					} else {
// 						outObj.(map[string]any)[k] = arg1
// 					}
// 				}
// 			}
// 		} else {
// 			outObj = x
// 		}
// 	}
// 	return outObj.(map[string]any)
// }

// func (this *Exchange) InArray(elem any, list2 any) bool {
// 	if list2 == nil {
// 		return false
// 	}
// 	if reflect.TypeOf(list2).Kind() == reflect.Slice {
// 		list := list2.([]any)
// 		for _, v := range list {
// 			if v == elem {
// 				return true
// 			}
// 		}
// 	}
// 	return false
// }

func (this *Exchange) InArray(elem any, list any) bool {
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

// func (this *Exchange) InArray(elem any, list any) bool {
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

func (this *Exchange) IsArray(a any) bool {
	// return reflect.TypeOf(a).Kind() == reflect.Slice
	switch a.(type) {
	case []any:
		return true
	case []string:
		return true
	case []int:
		return true
	case []int64:
		return true
	case []float64:
		return true
	case []map[string]any:
		return true
	}
	return false
}

func (this *Exchange) IndexBy(a any, key any) map[string]any {
	outDict := make(map[string]any)
	var targetX []any

	// Check if `a` is a slice of `[]any` or a map
	if aArr, ok := a.([]any); ok {
		targetX = aArr
	} else if aMap, ok := a.(map[string]any); ok {
		for _, v := range aMap {
			targetX = append(targetX, v)
		}
	} else if syncMap, ok := a.(*sync.Map); ok {
		syncMap.Range(func(_, v any) bool {
			targetX = append(targetX, v)
			return true
		})
	} else {
		return outDict // Unsupported type
	}

	// Process the slice `targetX`
	for _, elem := range targetX {
		switch v := elem.(type) {
		case map[string]any:
			// Handle map entries
			if val, ok := v[ToString(key)]; ok {
				outDict[ToString(val)] = v
			}
		case *sync.Map:
			// Handle *sync.Map entries
			v.Range(func(k, val any) bool {
				if _, ok := k.(string); ok {
					if valMap, ok := val.(map[string]any); ok {
						if keyStr, ok := valMap[ToString(key)].(string); ok {
							outDict[keyStr] = valMap
						}
					}
				}
				return true
			})
		case []any:
			// Handle slices of []any
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

func (this *Exchange) IndexBySafe(a any, key any) *sync.Map {
	outDict := &sync.Map{}
	var targetX []any

	switch val := a.(type) {
	case []any:
		targetX = val

	case map[string]any:
		for _, v := range val {
			targetX = append(targetX, v)
		}

	case *sync.Map:
		val.Range(func(_, v any) bool {
			targetX = append(targetX, v)
			return true
		})

	default:
		return outDict // unsupported type
	}

	for _, elem := range targetX {
		switch v := elem.(type) {
		case map[string]any:
			if val, ok := v[ToString(key)]; ok {
				outDict.Store(ToString(val), v)
			}
		case []any:
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

// func (this *Exchange) IndexBy(a any, key2 any) map[string]any {
// 	outDict := make(map[string]any)
// 	var targetX []any
// 	if aArr, ok := a.([]any); ok {
// 		targetX = aArr
// 	} else {
// 		for _, v := range a.(map[string]any) {
// 			targetX = append(targetX, v)
// 		}
// 	}
// 	for _, elem := range targetX {
// 		if reflect.TypeOf(elem).Kind() == reflect.Map {
// 			elem2 := elem.(map[string]any)
// 			if val, ok := elem2[ToString(key2)]; ok {
// 				outDict[ToString(val)] = elem2
// 			}
// 		} else if reflect.TypeOf(elem).Kind() == reflect.Slice {
// 			index := key2.(int)
// 			elem2 := elem.([]any)
// 			if len(elem2) > index {
// 				outDict[elem2[index].(string)] = elem2
// 			}
// 		}
// 	}
// 	return outDict
// }

func (this *Exchange) GroupBy(trades any, key2 any) map[string]any {
	key := key2.(string)
	outDict := make(map[string]any)
	list := trades.([]any)
	for _, elem := range list {
		elemDict := elem.(map[string]any)
		if val, ok := elemDict[key]; ok {
			if val == nil {
				continue
			}
			elem2 := val.(string)
			if list2, exists := outDict[elem2]; exists {
				list2 = append(list2.([]any), elem)
				outDict[elem2] = list2
			} else {
				outDict[elem2] = []any{elem}
			}
		}
	}
	return outDict
}

func (this *Exchange) OmitZero(value any) any {
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

func (this *Exchange) Sum(args ...any) any {
	var res any = 0.0
	for _, arg := range args {
		res = this.sumValues(res, arg)
	}
	return res
}

func (this *Exchange) sumValues(a, b any) any {
	return Add(a, b)
}
