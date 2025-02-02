package base

import (
	"fmt"
	"math"
	"reflect"

	"github.com/ccxt/ccxt/v4/go/ccxt"
)

const (
	// TRUNCATE           = 0
	ROUND      = 1
	ROUND_UP   = 2
	ROUND_DOWN = 3
	// DECIMAL_PLACES     = 2
	// SIGNIFICANT_DIGITS = 3
	// TICK_SIZE          = 4
	// NO_PADDING         = 5
	// PAD_WITH_ZERO      = 6
)

var DECIMAL_PLACES int = 2
var SIGNIFICANT_DIGITS int = 3
var TICK_SIZE int = 4
var TRUNCATE int = 0
var NO_PADDING = 5
var PAD_WITH_ZERO int = 6

func Assert(condition2 interface{}, message2 ...interface{}) {
	condition := true

	// Check if the condition is nil or not of type bool
	if condition2 == nil {
		condition = false
	} else {
		// Type assertion for bool
		if c, ok := condition2.(bool); ok {
			condition = c
		} else {
			var intCondition = ParseInt(condition2)
			var stringCondition = ToString(condition2)
			if intCondition != math.MinInt64 {
				condition = intCondition != 0
			} else if stringCondition != "" {
				condition = len(stringCondition) > 0
			} else {
				condition = false
			}
		}
	}

	// Convert the message to string
	message := ""
	if len(message2) > 0 {
		message = fmt.Sprint(message2...)
	}

	// If condition is false, throw an error with the message
	if !condition {
		errorMessage := "Assertion failed"
		if message != "" {
			errorMessage += ": " + message
		}
		panic(errorMessage)
	}
}

// func IsEqual(a, b interface{}) bool {
// 	return ccxt.IsEqual(a, b)
// }

// func GetValue(obj interface{}, key interface{}) interface{} {
// 	return ccxt.GetValue(obj, key)
// }

// func InOp(a, b interface{}) bool {
// 	return ccxt.InOp(a, b)
// }

// func IsTrue(a interface{}) bool {
// 	return ccxt.IsTrue(a)
// }

// func OpNeg(a interface{}) interface{} {
// 	return ccxt.OpNeg(a)
// }

// func ParseFloat(num interface{}) interface{} {
// 	return ccxt.ParseFloat(num)
// }

func Equals(a interface{}, b interface{}) bool {
	// Check if 'a' is a slice
	if reflect.TypeOf(a).Kind() == reflect.Slice {
		list1 := reflect.ValueOf(a)
		list2 := reflect.ValueOf(b)

		if list1.Len() != list2.Len() {
			return false
		}

		for i := 0; i < list1.Len(); i++ {
			item1 := list1.Index(i).Interface()
			item2 := list2.Index(i).Interface()
			// Recursive comparison
			if !Equals(item1, item2) {
				return false
			}
		}
		return true
	}

	// Check if 'a' is a map
	if reflect.TypeOf(a).Kind() == reflect.Map {
		map1 := reflect.ValueOf(a)
		map2 := reflect.ValueOf(b)

		if map1.Len() != map2.Len() {
			return false
		}

		for _, key := range map1.MapKeys() {
			value1 := map1.MapIndex(key).Interface()
			value2 := map2.MapIndex(key).Interface()
			// Check if the key exists in map2
			if !map2.MapIndex(key).IsValid() {
				return false
			}
			// Recursive comparison
			if !Equals(value1, value2) {
				return false
			}
		}
		return true
	}

	// Fallback comparison using reflect.DeepEqual for other types
	return reflect.DeepEqual(a, b)
}

// CRYPTO HELPERS

func Encode(data interface{}) string {
	return ccxt.Encode(data)
}

func Hash(request2 interface{}, hash func() string, digest2 interface{}) interface{} {
	return ccxt.Hash(request2, hash, digest2)
}

func Hmac(request2 interface{}, secret2 interface{}, algorithm2 func() string, digest string) interface{} {
	return ccxt.Hmac(request2, secret2, algorithm2, digest)
}

func sha256() string {
	return "sha256"
}

func md5() string {
	return "md5"
}

func sha1() string {
	return "sha1"
}

func secp256k1() string {
	return "secp256k1"
}

func Ecdsa(request2 interface{}, secret2 interface{}, algorithm2 func() string, digest func() string) interface{} {
	return ccxt.Ecdsa(request2, secret2, algorithm2, digest)
}

func Rsa(request2 interface{}, secret2 interface{}, algorithm2 func() string) interface{} {
	return ccxt.Rsa(request2, secret2, algorithm2)
}

func Jwt(request2 interface{}, secret2 interface{}, algorithm2 func() string, encode bool) interface{} {
	return ccxt.Jwt(request2, secret2, algorithm2, encode)
}

func Crc32(request2 interface{}, signed2 bool) interface{} {
	return ccxt.Crc32(request2.(string), signed2)
}

// func Join(interfaceArray interface{}, separator string) string {
// 	return ccxt.Join(interfaceArray, separator)
// }
