package ccxt

import (
	"bytes"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/url"
	"sort"
	"strings"
)

func (e *Exchange) base16ToBinary(str any) []byte {
	hexStr := str.(string)
	bytes, err := hex.DecodeString(hexStr)
	if err != nil {
		return nil
	}
	return bytes
}

func (e *Exchange) Base16ToBinary(str any) []byte {
	return e.base16ToBinary(str)
}

func convertHexStringToByteArray(hexString string) ([]byte, error) {
	if len(hexString)%2 != 0 {
		return nil, fmt.Errorf("the hex string must have an even number of characters")
	}

	bytes := make([]byte, len(hexString)/2)
	for i := 0; i < len(hexString); i += 2 {
		hexSubstring := hexString[i : i+2]
		byteValue, err := hex.DecodeString(hexSubstring)
		if err != nil {
			return nil, err
		}
		bytes[i/2] = byteValue[0]
	}

	return bytes, nil
}

func (e *Exchange) remove0xPrefix(str any) string {
	s := str.(string)
	if strings.HasPrefix(s, "0x") {
		return s[2:]
	}
	return s
}

func (e *Exchange) Remove0xPrefix(str any) string {
	return e.remove0xPrefix(str)
}

func (e *Exchange) stringToBase64(pt any) string {
	return stringToBase64(pt)
}

func (e *Exchange) StringToBase64(pt any) string {
	return stringToBase64(pt)
}

func stringToBase64(pt any) string {
	plainText := pt.(string)
	return base64.StdEncoding.EncodeToString([]byte(plainText))
}

func (e *Exchange) base64ToBinary(pt any) []byte {
	return base64ToBinary(pt)
}

func (e *Exchange) Base64ToBinary(pt any) []byte {
	return base64ToBinary(pt)
}

func base64ToBinary(pt any) []byte {
	plainText := pt.(string)
	bytes, err := base64.StdEncoding.DecodeString(plainText)
	if err != nil {
		return nil
	}
	return bytes
}

// You'll need a base58 library to implement this part
func (e *Exchange) base58ToBinary(pt any) []byte {
	// return Base58.Decode(pt.(string))
	return nil
}

func (e *Exchange) Base58ToBinary(pt any) []byte {
	return e.base58ToBinary(pt)
}

// func (e *Exchange) BinaryConcat(a, b any) []byte {
// 	var first, second []byte
// 	if s, ok := a.(string); ok {
// 		first = []byte(s)
// 	} else {
// 		first = a.([]byte)
// 	}
// 	if s, ok := b.(string); ok {
// 		second = []byte(s)
// 	} else {
// 		second = b.([]byte)
// 	}
// 	return append(first, second...)
// }

func (e *Exchange) BinaryConcat(parts ...any) []byte {
	var result []byte
	for _, part := range parts {
		switch v := part.(type) {
		case string:
			result = append(result, []byte(v)...)
		case []byte:
			result = append(result, v...)
		default:
			panic("BinaryConcat: unsupported type, only string and []byte are allowed")
		}
	}
	return result
}

func (e *Exchange) binaryConcatArray(a any) string {
	// return a.(string) // stub
	return ""
}

func (e *Exchange) BinaryConcatArray(a any) string {
	return e.binaryConcatArray(a)
}

func (e *Exchange) numberToBE(n, padding any) string {
	// return n.(string) // stub
	return ""
}

func (e *Exchange) NumberToBE(n, padding any) string {
	return e.numberToBE(n, padding)
}

func BinaryToHex(buff []byte) string {
	return strings.ToLower(hex.EncodeToString(buff))
}

func (e *Exchange) BinaryToBase16(buff2 any) string {
	buff := buff2.([]byte)
	return BinaryToHex(buff)
}

func (e *Exchange) BinaryToBase58(buff2 any) string {
	buff := buff2.([]byte)
	return BinaryToHex(buff)
}

func (e *Exchange) BinaryToBase64(buff2 any) string {
	buff := buff2.([]byte)
	return base64.StdEncoding.EncodeToString(buff)
}

func (e *Exchange) StringToBinary(buff string) []byte {
	return []byte(buff)
}

func (e *Exchange) Encode(data any) string {
	return data.(string) // stub
}

func Encode(data any) string {
	return data.(string) // stub
}

func (e *Exchange) Decode(data any) string {
	return data.(string) // stub
}

// func (e *Exchange) IntToBase16(number any) string {
// 	n := number.(int64)
// 	return fmt.Sprintf("%x", n)
// }

func (e *Exchange) IntToBase16(number any) string {
	switch v := number.(type) {
	case int:
		return fmt.Sprintf("%x", int64(v))
	case int64:
		return fmt.Sprintf("%x", v)
	case uint:
		return fmt.Sprintf("%x", uint64(v))
	case uint64:
		return fmt.Sprintf("%x", v)
	default:
		return "" // return empty string for unsupported types
	}
}

// This function requires implementation of a message packer
func (e *Exchange) packb(data any) any {
	return nil
}

func (e *Exchange) Rawencode(params ...any) string {
	parameters := params[0].(map[string]any)
	shouldSort := GetArg(params, 1, false).(bool)
	keys := make([]string, 0, len(parameters))
	for k := range parameters {
		keys = append(keys, k)
	}

	if shouldSort {
		sort.Strings(keys)
	}

	var outList []string
	for _, key := range keys {
		value := parameters[key]
		if boolVal, ok := value.(bool); ok {
			value = strings.ToLower(fmt.Sprintf("%v", boolVal))
		}
		if IsNumber(value) {
			value = NumberToString(value)
		}
		outList = append(outList, fmt.Sprintf("%s=%v", key, value))
	}
	return strings.Join(outList, "&")
}

func (e *Exchange) UrlencodeWithArrayRepeat(parameters2 any) string {
	parameters := parameters2.(map[string]any)
	var outList []string
	for key, value := range parameters {
		if values, ok := value.([]any); ok {
			for _, item := range values {
				outList = append(outList, fmt.Sprintf("%s=%v", key, item))
			}
		} else {
			if IsNumber(value) {
				value = NumberToString(value)
			}
			value = strings.ReplaceAll(value.(string), ",", "%2C")
			outList = append(outList, fmt.Sprintf("%s=%v", key, value))
		}
	}
	return strings.Join(outList, "&")
}

func (e *Exchange) UrlencodeNested(parameters2 any) string {
	parameters := parameters2.(map[string]any)
	queryString := url.Values{}
	for key, value := range parameters {
		if subDict, ok := value.(map[string]any); ok {
			for subKey, subValue := range subDict {
				finalValue := fmt.Sprintf("%v", subValue)
				// finalValue = strings.ReplaceAll(finalValue, " ", "%20")
				if boolVal, ok := subValue.(bool); ok {
					finalValue = strings.ToLower(fmt.Sprintf("%v", boolVal))
				}
				queryString.Add(fmt.Sprintf("%s[%s]", key, subKey), finalValue)
			}
		} else {
			valueStr := ToString(value)
			// valueStr = strings.ReplaceAll(valueStr, " ", "%20")
			queryString.Add(key, valueStr)
		}
	}
	res := queryString.Encode()
	res = strings.ReplaceAll(res, "+", "%20")
	return res
}

// without sorting
// func (e *Exchange) Urlencode(params ...any) string {
// 	parameters := params[0].(map[string]any)
// 	sort := GetArg(params, 1, false).(bool)
// 	var queryString []string
// 	for key, value := range parameters {
// 		encodedKey := url.QueryEscape(key)
// 		finalValue := ""
// 		if IsNumber(value) {
// 			finalValue = NumberToString(value)
// 		} else {
// 			finalValue = ToString(value)
// 		}
// 		if boolVal, ok := value.(bool); ok {
// 			finalValue = strings.ToLower(fmt.Sprintf("%v", boolVal))
// 		}
// 		if strings.ToLower(key) == "timestamp" {
// 			finalValue = strings.ToUpper(url.QueryEscape(finalValue))
// 		} else {
// 			finalValue = url.QueryEscape(finalValue)
// 		}
// 		queryString = append(queryString, fmt.Sprintf("%s=%s", encodedKey, finalValue))
// 	}
// 	return strings.Join(queryString, "&")
// }

func (e *Exchange) Urlencode(params ...any) string {
	parameters := params[0].(map[string]any)
	shouldSort := GetArg(params, 1, false).(bool)

	var keys []string
	for key := range parameters {
		keys = append(keys, key)
	}

	if shouldSort {
		sort.Strings(keys)
	}

	var queryString []string
	for _, key := range keys {
		value := parameters[key]
		encodedKey := url.QueryEscape(key)
		finalValue := ""

		if IsNumber(value) {
			finalValue = NumberToString(value)
		} else {
			finalValue = ToString(value)
		}
		if boolVal, ok := value.(bool); ok {
			finalValue = strings.ToLower(fmt.Sprintf("%v", boolVal))
		}
		if strings.ToLower(key) == "timestamp" {
			finalValue = strings.ToUpper(url.QueryEscape(finalValue))
		} else {
			finalValue = url.QueryEscape(finalValue)
		}
		queryString = append(queryString, fmt.Sprintf("%s=%s", encodedKey, finalValue))
	}

	return strings.Join(queryString, "&")
}

func (e *Exchange) EncodeURIComponent(str any) string {
	s := str.(string)
	var result bytes.Buffer
	unreserved := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~"
	for _, symbol := range s {
		if strings.ContainsRune(unreserved, symbol) {
			result.WriteRune(symbol)
		} else {
			result.WriteString(fmt.Sprintf("%%%02X", symbol))
		}
	}
	return result.String()
}

func (e *Exchange) UrlencodeBase64(s any) string {
	return Base64urlencode(s)
}

func Base64urlencode(s any) string {
	var str string
	if stringVal, ok := s.(string); ok {
		str = stringToBase64(stringVal)
	} else {
		str = base64.StdEncoding.EncodeToString(s.([]byte))
	}
	return strings.TrimRight(strings.ReplaceAll(strings.ReplaceAll(str, "+", "-"), "/", "_"), "=")
}

func (e *Exchange) stringToCharsArray(str any) any {
	// Convert the input to a string
	inputStr := fmt.Sprintf("%v", str)
	// Create a slice to hold the result
	res := make([]string, len(inputStr))
	// Iterate over each character in the string and add it to the result slice
	for i, ch := range inputStr {
		res[i] = string(ch)
	}
	return res
}
