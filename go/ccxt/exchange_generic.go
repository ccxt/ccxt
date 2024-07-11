package ccxt

import (
	"fmt"
	"reflect"
	"sort"
)

func (this *Exchange) sortBy(array interface{}, value1 interface{}, desc2 ...interface{}) []interface{} {
	var desc bool
	var defaultValue interface{} = ""
	if len(desc2) > 0 {
		desc = desc2[0].(bool)
	}
	list := array.([]interface{})

	if reflect.TypeOf(value1).Kind() == reflect.String {
		sort.Slice(list, func(i, j int) bool {
			a := list[i].(map[string]interface{})[value1.(string)]
			b := list[j].(map[string]interface{})[value1.(string)]
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
			return fmt.Sprintf("%v", a) < fmt.Sprintf("%v", b)
		})
		if desc {
			for i := len(list)/2 - 1; i >= 0; i-- {
				opp := len(list) - 1 - i
				list[i], list[opp] = list[opp], list[i]
			}
		}
		return list
	}
}

func (this *Exchange) sortBy2(array interface{}, key1 interface{}, key2 interface{}, desc2 ...interface{}) []interface{} {
	var desc bool
	if len(desc2) > 0 {
		desc = desc2[0].(bool)
	}
	list := array.([]interface{})

	if reflect.TypeOf(key1).Kind() == reflect.String {
		sort.Slice(list, func(i, j int) bool {
			a1 := list[i].(map[string]interface{})[key1.(string)]
			a2 := list[i].(map[string]interface{})[key2.(string)]
			b1 := list[j].(map[string]interface{})[key1.(string)]
			b2 := list[j].(map[string]interface{})[key2.(string)]
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

func (this *Exchange) filterBy(aa interface{}, key interface{}, value interface{}) []interface{} {
	var targetA []interface{}
	if reflect.TypeOf(aa).Kind() == reflect.Slice {
		targetA = aa.([]interface{})
	} else {
		for _, v := range aa.(map[string]interface{}) {
			targetA = append(targetA, v)
		}
	}
	var outList []interface{}
	for _, elem := range targetA {
		if elem.(map[string]interface{})[key.(string)] == value {
			outList = append(outList, elem)
		}
	}
	return outList
}

func (this *Exchange) extend(aa interface{}, bb ...interface{}) map[string]interface{} {
	return extendMap(aa, bb...)
}

func extendMap(aa interface{}, bb ...interface{}) map[string]interface{} {
	a := aa.(map[string]interface{})
	outDict := make(map[string]interface{})
	for key, value := range a {
		outDict[key] = value
	}
	if len(bb) > 0 {
		b := bb[0].(map[string]interface{})
		for key, value := range b {
			outDict[key] = value
		}
	}
	return outDict
}

func (this *Exchange) deepExtend2(objs ...interface{}) interface{} {
	outDict := make(map[string]interface{})
	for _, obj := range objs {
		if obj == nil {
			obj = make(map[string]interface{})
		}
		if reflect.TypeOf(obj).Kind() == reflect.Map {
			for key, value := range obj.(map[string]interface{}) {
				if value != nil && reflect.TypeOf(value).Kind() == reflect.Map {
					if _, exists := outDict[key]; exists {
						outDict[key] = this.deepExtend2(outDict[key], value)
					} else {
						outDict[key] = this.deepExtend2(value)
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

func (this *Exchange) deepExtend(objs ...interface{}) map[string]interface{} {
	var outObj interface{}
	for _, x := range objs {
		if x == nil {
			continue
		}
		if reflect.TypeOf(x).Kind() == reflect.Map {
			if outObj == nil || reflect.TypeOf(outObj).Kind() != reflect.Map {
				outObj = make(map[string]interface{})
			}
			dictX := x.(map[string]interface{})
			for k, v := range dictX {
				arg1 := outObj.(map[string]interface{})[k]
				arg2 := dictX[k]
				if reflect.TypeOf(arg1).Kind() == reflect.Map && reflect.TypeOf(arg2).Kind() == reflect.Map {
					outObj.(map[string]interface{})[k] = this.deepExtend(arg1, arg2)
				} else {
					if arg2 != nil {
						outObj.(map[string]interface{})[k] = arg2
					} else {
						outObj.(map[string]interface{})[k] = arg1
					}
				}
			}
		} else {
			outObj = x
		}
	}
	return outObj.(map[string]interface{})
}

func (this *Exchange) inArray(elem interface{}, list2 interface{}) bool {
	if list2 == nil {
		return false
	}
	if reflect.TypeOf(list2).Kind() == reflect.Slice {
		list := list2.([]interface{})
		for _, v := range list {
			if v == elem {
				return true
			}
		}
	}
	return false
}

func (this *Exchange) isArray(a interface{}) bool {
	return reflect.TypeOf(a).Kind() == reflect.Slice
}

func (this *Exchange) indexBy(a interface{}, key2 interface{}) map[string]interface{} {
	outDict := make(map[string]interface{})
	var targetX []interface{}
	if reflect.TypeOf(a).Kind() == reflect.Slice {
		targetX = a.([]interface{})
	} else {
		for _, v := range a.(map[string]interface{}) {
			targetX = append(targetX, v)
		}
	}
	for _, elem := range targetX {
		if reflect.TypeOf(elem).Kind() == reflect.Map {
			elem2 := elem.(map[string]interface{})
			if val, ok := elem2[key2.(string)]; ok {
				outDict[val.(string)] = elem2
			}
		} else if reflect.TypeOf(elem).Kind() == reflect.Slice {
			index := key2.(int)
			elem2 := elem.([]interface{})
			if len(elem2) > index {
				outDict[elem2[index].(string)] = elem2
			}
		}
	}
	return outDict
}

func (this *Exchange) groupBy(trades interface{}, key2 interface{}) map[string]interface{} {
	key := key2.(string)
	outDict := make(map[string]interface{})
	list := trades.([]interface{})
	for _, elem := range list {
		elemDict := elem.(map[string]interface{})
		if val, ok := elemDict[key]; ok {
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

func (this *Exchange) omitZero(value interface{}) interface{} {
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
		parsed := reflect.ValueOf(v).Float()
		if parsed == 0 {
			return nil
		}
	}
	return value
}

func (this *Exchange) sum(args ...interface{}) interface{} {
	res := 0.0
	for _, arg := range args {
		res = this.sumValues(res, arg)
	}
	return res
}

func (this *Exchange) sumValues(a, b interface{}) float64 {
	af := reflect.ValueOf(a).Float()
	bf := reflect.ValueOf(b).Float()
	return af + bf
}
