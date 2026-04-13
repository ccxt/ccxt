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

func (e *Exchange) base16ToBinary(str interface{}) []byte {
	hexStr := str.(string)
	bytes, err := hex.DecodeString(hexStr)
	if err != nil {
		return nil
	}
	return bytes
}

func (e *Exchange) Base16ToBinary(str interface{}) []byte {
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

func (e *Exchange) remove0xPrefix(str interface{}) string {
	s := str.(string)
	if strings.HasPrefix(s, "0x") {
		return s[2:]
	}
	return s
}

func (e *Exchange) Remove0xPrefix(str interface{}) string {
	return e.remove0xPrefix(str)
}

func (e *Exchange) stringToBase64(pt interface{}) string {
	return stringToBase64(pt)
}

func (e *Exchange) StringToBase64(pt interface{}) string {
	return stringToBase64(pt)
}

func stringToBase64(pt interface{}) string {
	plainText := pt.(string)
	return base64.StdEncoding.EncodeToString([]byte(plainText))
}

func (e *Exchange) base64ToBinary(pt interface{}) []byte {
	return base64ToBinary(pt)
}

func (e *Exchange) Base64ToBinary(pt interface{}) []byte {
	return base64ToBinary(pt)
}

func base64ToBinary(pt interface{}) []byte {
	plainText := pt.(string)
	bytes, err := base64.StdEncoding.DecodeString(plainText)
	if err != nil {
		return nil
	}
	return bytes
}

const bitcoinAlphabetStr = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

var bitcoinAlphabetBytes = []byte(bitcoinAlphabetStr)

var base58DecodeTable = func() [256]int {
	var d [256]int
	for i := range d {
		d[i] = -1
	}
	// bitcoin alphabet only
	for i, b := range bitcoinAlphabetBytes {
		d[b] = i
	}
	return d
}()

func (e *Exchange) base58ToBinary(input string) ([]byte, error) {
	// there is no utf symbols in bitcoin alphabet
	capacity := len(input)*733/1000 + 1 // log(58) / log(256)
	output := make([]byte, capacity)
	outputReverseEnd := capacity - 1
	// prefix zeros
	zero58Byte := bitcoinAlphabetBytes[0]
	prefixZeroes := 0
	skipZeros := false
	var carry, outputIdx int
	var target rune

	for _, target = range input {
		// collect prefix zeros
		if !skipZeros {
			if target == rune(zero58Byte) {
				prefixZeroes++
				continue
			} else {
				skipZeros = true
			}
		}
		if target < 0 || target > 255 {
			return nil, fmt.Errorf("Invalid base58 string. Only ASCII symbols supported.")
		}
		val := base58DecodeTable[byte(target)]
		if val < 0 {
			return nil, fmt.Errorf("Invalid base58 string. Only ASCII symbols supported.")
		}
		carry = int(val)
		outputIdx = capacity - 1

		for ; outputIdx > outputReverseEnd || carry != 0; outputIdx-- {
			carry += 58 * int(output[outputIdx])
			output[outputIdx] = byte(uint32(carry) & 0xff)
			carry >>= 8
		}
		outputReverseEnd = outputIdx
	}

	retBytes := make([]byte, prefixZeroes+(capacity-1-outputReverseEnd))
	copy(retBytes[prefixZeroes:], output[outputReverseEnd+1:])
	return retBytes, nil
}

// An error can be returned, but that would not conform to the unified interface.
func (e *Exchange) Base58ToBinary(pt interface{}) []byte {
	plainText := pt.(string)
	// base58.Decode() only Bitcoin Aplhabet
	b, err := e.base58ToBinary(plainText)
	if err != nil {
		// panic(fmt.Errorf("Base58ToBinary: %w", err)) // should panic?
		return nil
	}
	return b
}

// func (e *Exchange) BinaryConcat(a, b interface{}) []byte {
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

func (e *Exchange) BinaryConcat(parts ...interface{}) []byte {
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

func (e *Exchange) binaryConcatArray(a interface{}) string {
	// return a.(string) // stub
	return ""
}

func (e *Exchange) BinaryConcatArray(a interface{}) string {
	return e.binaryConcatArray(a)
}

func (e *Exchange) numberToBE(n, padding interface{}) string {
	// return n.(string) // stub
	return ""
}

func (e *Exchange) NumberToBE(n, padding interface{}) string {
	return e.numberToBE(n, padding)
}

func BinaryToHex(buff []byte) string {
	return strings.ToLower(hex.EncodeToString(buff))
}

func (e *Exchange) BinaryToBase16(buff2 interface{}) string {
	buff := buff2.([]byte)
	return BinaryToHex(buff)
}

func binaryToBase58(input []byte) string {
	if len(input) == 0 {
		return ""
	}
	inputLength := len(input)
	prefixZeroes := 0
	for prefixZeroes < inputLength && input[prefixZeroes] == 0 {
		prefixZeroes++
	}

	capacity := (inputLength-prefixZeroes)*138/100 + 1 // log256 / log58
	output := make([]byte, capacity)
	outputReverseEnd := capacity - 1
	var carry uint32
	var outputIdx int

	for _, inputByte := range input[prefixZeroes:] {
		carry = uint32(inputByte)
		outputIdx = capacity - 1
		for ; outputIdx > outputReverseEnd || carry != 0; outputIdx-- {
			carry += (uint32(output[outputIdx]) << 8) // XX << 8 same as: 256 * XX
			output[outputIdx] = byte(carry % 58)
			carry /= 58
		}
		outputReverseEnd = outputIdx
	}

	retLen := prefixZeroes + (capacity - 1 - outputReverseEnd)
	ret := make([]byte, retLen)
	for i := 0; i < prefixZeroes; i++ {
		ret[i] = bitcoinAlphabetBytes[0]
	}
	for i, n := range output[outputReverseEnd+1:] {
		ret[prefixZeroes+i] = bitcoinAlphabetBytes[n]
	}
	return string(ret)
}

func (e *Exchange) BinaryToBase58(buff2 interface{}) string {
	buff := buff2.([]byte)
	// base58.Encode() only Bitcoin Aplhabet
	return binaryToBase58(buff)
}

func (e *Exchange) BinaryToBase64(buff2 interface{}) string {
	buff := buff2.([]byte)
	return base64.StdEncoding.EncodeToString(buff)
}

func (e *Exchange) StringToBinary(buff string) []byte {
	return []byte(buff)
}

func (e *Exchange) BinaryToString(buff interface{}) string {
	return string(buff.([]byte))
}

func (e *Exchange) Encode(data interface{}) string {
	return data.(string) // stub
}

func Encode(data interface{}) string {
	return data.(string) // stub
}

func (e *Exchange) Decode(data interface{}) string {
	return data.(string) // stub
}

// func (e *Exchange) IntToBase16(number interface{}) string {
// 	n := number.(int64)
// 	return fmt.Sprintf("%x", n)
// }

func (e *Exchange) IntToBase16(number interface{}) string {
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
func (e *Exchange) packb(data interface{}) interface{} {
	return nil
}

func (e *Exchange) Rawencode(params ...interface{}) string {
	parameters := params[0].(map[string]interface{})
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

func (e *Exchange) UrlencodeWithArrayRepeat(parameters2 interface{}) string {
	parameters := parameters2.(map[string]interface{})
	var outList []string
	for key, value := range parameters {
		if values, ok := value.([]interface{}); ok {
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

func (e *Exchange) UrlencodeNested(parameters2 interface{}) string {
	var outList []string

	// Define recursive function
	var recurse func(interface{}, string)
	recurse = func(params interface{}, prefix string) {
		switch v := params.(type) {
		case map[string]interface{}:
			keys := make([]string, 0, len(v))
			for k := range v {
				keys = append(keys, k)
			}
			sort.Strings(keys)
			for _, k := range keys {
				var newPrefix string
				if prefix == "" {
					newPrefix = k
				} else {
					newPrefix = fmt.Sprintf("%s[%s]", prefix, k)
				}
				recurse(v[k], newPrefix)
			}
		case map[string]string: // support map[string]string as well
			keys := make([]string, 0, len(v))
			for k := range v {
				keys = append(keys, k)
			}
			sort.Strings(keys)
			for _, k := range keys {
				var newPrefix string
				if prefix == "" {
					newPrefix = k
				} else {
					newPrefix = fmt.Sprintf("%s[%s]", prefix, k)
				}
				recurse(v[k], newPrefix)
			}
		case []interface{}:
			for i, val := range v {
				var newPrefix string
				if prefix == "" {
					newPrefix = fmt.Sprintf("%d", i)
				} else {
					newPrefix = fmt.Sprintf("%s[%d]", prefix, i)
				}
				recurse(val, newPrefix)
			}
		default:
			valStr := ToString(v)

			if boolVal, ok := v.(bool); ok {
				valStr = fmt.Sprintf("%v", boolVal)
				valStr = strings.ToLower(valStr)
			}

			encodedKey := url.QueryEscape(prefix)
			encodedKey = strings.ReplaceAll(encodedKey, "%5B", "[")
			encodedKey = strings.ReplaceAll(encodedKey, "%5D", "]")
			encodedKey = strings.ReplaceAll(encodedKey, "+", "%20")

			encodedVal := url.QueryEscape(valStr)
			encodedVal = strings.ReplaceAll(encodedVal, "+", "%20")

			outList = append(outList, fmt.Sprintf("%s=%s", encodedKey, encodedVal))
		}
	}

	recurse(parameters2, "")
	return strings.Join(outList, "&")
}

// without sorting
// func (e *Exchange) Urlencode(params ...interface{}) string {
// 	parameters := params[0].(map[string]interface{})
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

func (e *Exchange) Urlencode(params ...interface{}) string {
	parameters := params[0].(map[string]interface{})
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

func (e *Exchange) EncodeURIComponent(str interface{}) string {
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

func (e *Exchange) UrlencodeBase64(s interface{}) string {
	return Base64urlencode(s)
}

func Base64urlencode(s interface{}) string {
	var str string
	if stringVal, ok := s.(string); ok {
		str = stringToBase64(stringVal)
	} else {
		str = base64.StdEncoding.EncodeToString(s.([]byte))
	}
	return strings.TrimRight(strings.ReplaceAll(strings.ReplaceAll(str, "+", "-"), "/", "_"), "=")
}

func (e *Exchange) stringToCharsArray(str interface{}) interface{} {
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
