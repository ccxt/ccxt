package ccxt

import (
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"
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

var precisionConstants = map[string]int{
	"ROUND":              ROUND,
	"TRUNCATE":           TRUNCATE,
	"ROUND_UP":           ROUND_UP,
	"ROUND_DOWN":         ROUND_DOWN,
	"DECIMAL_PLACES":     DECIMAL_PLACES,
	"SIGNIFICANT_DIGITS": SIGNIFICANT_DIGITS,
	"TICK_SIZE":          TICK_SIZE,
	"NO_PADDING":         NO_PADDING,
	"PAD_WITH_ZERO":      PAD_WITH_ZERO,
}

func (this *Exchange) NumberToString(x interface{}) interface{} {
	res := NumberToString(x)
	if res == "" {
		return nil
	}
	return res
}

func NumberToString(x interface{}) string {
	switch v := x.(type) {
	case nil:
		return ""
	case float64, float32, int, int64, int32:
		str := fmt.Sprintf("%v", v)
		val := ToFloat64(v)

		// Handle very large numbers (positive exponents)
		if math.Abs(val) >= 1.0 {
			parts := strings.Split(str, "e")
			if len(parts) == 2 {
				// Convert the exponent into an integer
				exponent, _ := strconv.Atoi(parts[1])
				// Split the mantissa into integer and fractional parts
				mantissaParts := strings.Split(parts[0], ".")
				integerPart := mantissaParts[0]
				fractionalPart := ""
				if len(mantissaParts) > 1 {
					fractionalPart = mantissaParts[1]
				}

				// Adjust the number of zeros based on the exponent
				if exponent >= 0 {
					totalDigits := integerPart + fractionalPart
					if exponent >= len(fractionalPart) {
						zerosToAdd := exponent - len(fractionalPart)
						return totalDigits + strings.Repeat("0", zerosToAdd)
					} else {
						return totalDigits[:len(integerPart)+exponent] + "." + totalDigits[len(integerPart)+exponent:]
					}
				}
			}
		}

		// Handle numbers with negative exponents (fractions)
		if math.Abs(val) < 1.0 {
			parts := strings.Split(str, "e-")
			if len(parts) == 2 {
				n := strings.Replace(parts[0], ".", "", -1)
				e, _ := strconv.Atoi(parts[1])
				neg := str[0] == '-'
				if e != 0 {
					// Format the result with leading zeros
					return fmt.Sprintf("%s0.%s%s", map[bool]string{true: "-", false: ""}[neg], strings.Repeat("0", e-1), strings.Replace(n, "-", "", 1))
				}
			}
		}

		// If no scientific notation, return the original string
		return str
	default:
		return fmt.Sprintf("%v", x)
	}
}

func (this *Exchange) NumberToString2(x interface{}) string {
	switch v := x.(type) {
	case nil:
		return ""
	case float64, float32, int, int64, int32:
		str := fmt.Sprintf("%v", v)
		if math.Abs(ToFloat64((v))) < 1.0 {
			parts := strings.Split(str, "e-")
			if len(parts) == 2 {
				n := strings.Replace(parts[0], ".", "", -1)
				e, _ := strconv.Atoi(parts[1])
				neg := str[0] == '-'
				if e != 0 {
					// Fix: Remove the extra "-" sign in the result
					return fmt.Sprintf("%s0.%s%s", map[bool]string{true: "-", false: ""}[neg], strings.Repeat("0", e-1), strings.Replace(n, "-", "", 1))
				}
			}
		} else {
			parts := strings.Split(str, "e")
			if len(parts) == 2 {
				e, _ := strconv.Atoi(parts[1])
				m := strings.Split(parts[0], ".")
				if len(m) > 1 {
					e -= len(m[1])
				}
				return fmt.Sprintf("%s%s%s", m[0], m[1], strings.Repeat("0", e))
			}
		}
		return str
	default:
		return fmt.Sprintf("%v", x)
	}
}

// func (this *Exchange) NumberToString(x interface{}) string {
// 	switch v := x.(type) {
// 	case nil:
// 		return ""
// 	case float64, float32, int, int64, int32:
// 		str := fmt.Sprintf("%v", v)
// 		if math.Abs(ToFloat64((v))) < 1.0 {
// 			parts := strings.Split(str, "e-")
// 			if len(parts) == 2 {
// 				n := strings.Replace(parts[0], ".", "", -1)
// 				e, _ := strconv.Atoi(parts[1])
// 				neg := str[0] == '-'
// 				if e != 0 {
// 					return fmt.Sprintf("%s0.%s%s", map[bool]string{true: "-", false: ""}[neg], strings.Repeat("0", e-1), n)
// 				}
// 			}
// 		} else {
// 			parts := strings.Split(str, "e")
// 			if len(parts) == 2 {
// 				e, _ := strconv.Atoi(parts[1])
// 				m := strings.Split(parts[0], ".")
// 				if len(m) > 1 {
// 					e -= len(m[1])
// 				}
// 				return fmt.Sprintf("%s%s%s", m[0], m[1], strings.Repeat("0", e))
// 			}
// 		}
// 		return str
// 	default:
// 		return fmt.Sprintf("%v", x)
// 	}
// }

var truncateRegExpCache = make(map[int]*regexp.Regexp)

func (this *Exchange) truncateToString(num interface{}, precision int) string {
	numStr := NumberToString(num)
	if precision > 0 {
		re, exists := truncateRegExpCache[precision]
		if !exists {
			re = regexp.MustCompile(fmt.Sprintf(`([-]*\d+\.\d{%d})(\d)`, precision))
			truncateRegExpCache[precision] = re
		}
		match := re.FindStringSubmatch(numStr)
		if len(match) > 1 {
			return match[1]
		}
	}
	intNum, _ := strconv.Atoi(numStr)
	return strconv.Itoa(intNum)
}

func (this *Exchange) truncate(num interface{}, precision int) float64 {
	result, _ := strconv.ParseFloat(this.truncateToString(num, precision), 64)
	return result
}

func (this *Exchange) PrecisionFromString(str2 interface{}) int {
	str := str2.(string)
	if strings.ContainsAny(str, "eE") {
		numStr := regexp.MustCompile(`\d\.?\d*[eE]`).ReplaceAllString(str, "")
		precision, _ := strconv.Atoi(numStr)
		return -precision
	}
	split := regexp.MustCompile(`0+$`).ReplaceAllString(str, "")
	parts := strings.Split(split, ".")
	if len(parts) > 1 {
		return len(parts[1])
	}
	return 0
}

func getDecimalPlaces(number float64) int {
	str := fmt.Sprintf("%f", number)
	parts := strings.Split(str, ".")
	if len(parts) == 2 {
		// Count the number of decimal places by looking at the fractional part
		return len(strings.TrimRight(parts[1], "0"))
	}
	return 0
}

func roundToDecimalPlaces(num float64, decimalPlaces int) float64 {
	shift := math.Pow(10, float64(decimalPlaces))
	return math.Round(num*shift) / shift
}

func (this *Exchange) DecimalToPrecision(value interface{}, roundingMode interface{}, numPrecisionDigits interface{}, args ...interface{}) interface{} {
	countingMode := GetArg(args, 0, nil)
	paddingMode := GetArg(args, 1, nil)
	return this._decimalToPrecision(value, roundingMode, numPrecisionDigits, countingMode, paddingMode)
}

func (this *Exchange) _decimalToPrecision(x interface{}, roundingMode2, numPrecisionDigits2 interface{}, countmode2, paddingMode interface{}) string {
	if countmode2 == nil {
		countmode2 = DECIMAL_PLACES
	}
	if paddingMode == nil {
		paddingMode = NO_PADDING
	}
	countMode := int(ParseInt(countmode2))
	roundingMode := int(ParseInt(roundingMode2))
	numPrecisionDigits := ToFloat64(numPrecisionDigits2)

	if countMode == TICK_SIZE && numPrecisionDigits < 0 {
		// return "", errors.New("TICK_SIZE can't be used with negative or zero numPrecisionDigits")
		panic("TICK_SIZE can't be used with negative or zero numPrecisionDigits")
	}

	parsedX := ToFloat64(x)
	if numPrecisionDigits < 0 {
		toNearest := math.Pow(10, math.Abs(numPrecisionDigits))
		if roundingMode == ROUND {
			res := this._decimalToPrecision(parsedX/toNearest, roundingMode, 0, countmode2, paddingMode)
			floatRes, _ := strconv.ParseFloat(res, 64)
			resultFloat := toNearest * floatRes
			resultStr := ""
			if resultFloat == math.Trunc(resultFloat) {
				resultStr = fmt.Sprintf("%d", int(resultFloat)) // Output: 10
			} else {
				// Float value, print with decimals
				resultStr = fmt.Sprintf("%f", resultFloat)
			}
			return resultStr
		}
		if roundingMode == TRUNCATE {
			decimalPlaces := getDecimalPlaces(parsedX)
			modResult := roundToDecimalPlaces(math.Mod(parsedX, toNearest), decimalPlaces) // tricky go does not have fixed point types out of the box
			truncVal := parsedX - modResult
			truncValStr := ""
			if truncVal == math.Trunc(truncVal) {
				truncValStr = fmt.Sprintf("%d", int(truncVal)) // Output: 10
			} else {
				// Float value, print with decimals
				truncValStr = fmt.Sprintf("%f", truncVal)
			}
			return truncValStr
		}
	}

	// Handle tick size
	if countMode == TICK_SIZE {
		precisionDigitsString := this._decimalToPrecision(numPrecisionDigits, ROUND, 22, DECIMAL_PLACES, NO_PADDING)
		newNumPrecisionDigits := this.PrecisionFromString(precisionDigitsString)
		missing := math.Mod(parsedX, numPrecisionDigits)
		missingRes := this._decimalToPrecision(missing, ROUND, 8, DECIMAL_PLACES, NO_PADDING)
		missingFloat, _ := strconv.ParseFloat(missingRes, 64)
		missing = missingFloat
		fpError := missing / numPrecisionDigits
		fpErrorStr := this._decimalToPrecision(fpError, ROUND, math.Max(float64(newNumPrecisionDigits), 8), DECIMAL_PLACES, NO_PADDING)
		fpErrorResult := this.PrecisionFromString(fpErrorStr)
		if fpErrorResult != 0 {
			if roundingMode == ROUND {
				if parsedX > 0 {
					if missing >= numPrecisionDigits/2 {
						parsedX = parsedX - missing + numPrecisionDigits
					} else {
						parsedX = parsedX - missing
					}
				} else {
					if missing >= numPrecisionDigits/2 {
						parsedX = parsedX - missing
					} else {
						parsedX = parsedX - missing - numPrecisionDigits
					}
				}
			} else if roundingMode == TRUNCATE {
				parsedX = parsedX - missing
			}
		}
		return this._decimalToPrecision(parsedX, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, paddingMode)
	}

	// Convert to a string (if needed), skip leading minus sign (if any)
	str := NumberToString(x)
	isNegative := str[0] == '-'
	strStart := 0
	if isNegative {
		strStart = 1
	}
	strEnd := len(str)

	// Find the dot position in the source buffer
	strDot := strings.Index(str, ".")
	hasDot := strDot != -1

	// Char code constants
	MINUS := byte('-')
	DOT := byte('.')
	ZERO := byte('0')
	ONE := byte('1')
	FIVE := byte('5')
	NINE := byte('9')

	// For -123.4567 the `chars` array will hold 01234567 (leading zero is reserved for rounding cases when 099 → 100)
	arraySize := strEnd - strStart
	if !hasDot {
		arraySize++
	}
	chars := make([]byte, arraySize)
	chars[0] = ZERO

	// Validate & copy digits, determine certain locations in the resulting buffer
	afterDot := arraySize
	digitsStart := -1
	digitsEnd := -1
	for i, j := 1, strStart; j < strEnd; i, j = i+1, j+1 {
		value := str[j]
		if value == DOT {
			afterDot = i
			i--
		} else if value < ZERO || value > NINE {
			panic("invalid number(contains an illegal character")
		} else {
			chars[i] = value
			if value != ZERO && digitsStart < 0 {
				digitsStart = i
			}
		}
	}

	if digitsStart < 0 {
		digitsStart = 1
	}

	precisionStart := digitsStart
	if countMode == DECIMAL_PLACES {
		// precisionStart = afterDot + 1
		precisionStart = afterDot
	}

	precisionEnd := precisionStart + int(numPrecisionDigits)

	// Reset the last significant digit index, as it will change during the rounding/truncation.
	digitsEnd = -1

	allZeros := true
	signNeeded := isNegative

	for i, memo := len(chars)-1, 0; i >= 0; i-- {
		c := chars[i]
		if i != 0 {
			c += byte(memo)
			if i >= precisionStart+int(numPrecisionDigits) {
				ceil := roundingMode == ROUND && c >= FIVE && !(c == FIVE && memo == 1)
				if ceil {
					c = NINE + 1
				} else {
					c = ZERO
				}
			}
			if c > NINE {
				c = ZERO
				memo = 1
			} else {
				memo = 0
			}
		} else if memo == 1 {
			c = ONE
		}
		chars[i] = c
		if c != ZERO {
			allZeros = false
			digitsStart = i
			if digitsEnd < 0 {
				digitsEnd = i + 1
			}
		}
	}

	if countMode == SIGNIFICANT_DIGITS {
		precisionStart = digitsStart
		precisionEnd = precisionStart + int(numPrecisionDigits)
	}
	if allZeros {
		signNeeded = false
	}

	readStart := digitsStart
	if (digitsStart >= afterDot) || allZeros {
		readStart = afterDot - 1
	}
	readEnd := digitsEnd
	if digitsEnd < afterDot {
		readEnd = afterDot
	}

	nSign := 0
	if signNeeded {
		nSign = 1
	}
	nBeforeDot := nSign + afterDot - readStart
	nAfterDot := int(math.Max(float64(readEnd-afterDot), 0))
	actualLength := readEnd - readStart
	desiredLength := actualLength
	if paddingMode.(int) != NO_PADDING {
		desiredLength = precisionEnd - readStart
	}
	pad := int(math.Max(float64(desiredLength-actualLength), 0))
	padStart := nBeforeDot + 1 + nAfterDot
	padEnd := padStart + pad
	isInteger := nAfterDot+pad == 0

	offsetInt := 0
	if isInteger {
		offsetInt = 0
	} else {
		offsetInt = 1
	}
	outArray := make([]byte, nBeforeDot+(offsetInt)+nAfterDot+pad)

	// ------------------------------------------------------------------------------------------ // ---------------------
	if signNeeded {
		outArray[0] = MINUS // -     minus sign
	}
	for i, j := nSign, readStart; i < nBeforeDot; i, j = i+1, j+1 {
		outArray[i] = chars[j] // 123   before dot
	}
	if !isInteger {
		outArray[nBeforeDot] = DOT // .     dot
	}
	for i, j := nBeforeDot+1, afterDot; i < padStart; i, j = i+1, j+1 {
		outArray[i] = chars[j] // 456   after dot
	}
	for i := padStart; i < padEnd; i++ {
		outArray[i] = ZERO // 000   padding
	}

	return string(outArray)
}

// func (this *Exchange) _decimalToPrecision(x interface{}, roundingMode interface{}, numPrecisionDigits2 interface{}, countingMode2 interface{}, paddingMode2 interface{}) string {
// 	countingMode := countingMode2.(int)
// 	paddingMode := paddingMode2.(int)
// 	numPrecisionDigits := numPrecisionDigits2
// 	floatNumPrecisionDigits := numPrecisionDigits.(float64)
// 	if countingMode == TICK_SIZE {
// 		// if numPrecisionDigitsStr, ok := strconv.Itoa(numPrecisionDigits); ok {
// 		// 	numPrecisionDigits, _ = strconv.ParseFloat(numPrecisionDigitsStr, 64)
// 		// }
// 		if numPrecisionDigits.(float64) <= 0 {
// 			return ""
// 		}
// 	}
// 	if floatNumPrecisionDigits < 0 {
// 		toNearest := math.Pow(10, float64(-floatNumPrecisionDigits))
// 		if roundingMode == ROUND {
// 			return this.DecimalToPrecision(x.(float64)/toNearest*toNearest, roundingMode, 0, countingMode, paddingMode)
// 		}
// 		if roundingMode == TRUNCATE {
// 			return fmt.Sprintf("%v", x.(float64)-math.Mod(x.(float64), toNearest))
// 		}
// 	}

// 	str := this.NumberToString(x)
// 	isNegative := str[0] == '-'
// 	strStart := 0
// 	if isNegative {
// 		strStart = 1
// 	}
// 	strEnd := len(str)
// 	var strDot int
// 	// hasDot := false
// 	for strDot = 0; strDot < strEnd; strDot++ {
// 		if str[strDot] == '.' {
// 			// hasDot = true
// 			break
// 		}
// 	}

// 	chars := make([]uint8, strEnd-strStart)
// 	chars[0] = '0'

// 	afterDot := len(chars)
// 	digitsStart, digitsEnd := -1, -1
// 	for i, j := 1, strStart; j < strEnd; j, i = j+1, i+1 {
// 		c := str[j]
// 		if c == '.' {
// 			afterDot = i
// 			i--
// 		} else {
// 			chars[i] = c
// 			if c != '0' && digitsStart < 0 {
// 				digitsStart = i
// 			}
// 		}
// 	}
// 	if digitsStart < 0 {
// 		digitsStart = 1
// 	}

// 	precisionStart := afterDot
// 	if countingMode == SIGNIFICANT_DIGITS {
// 		precisionStart = digitsStart
// 	}
// 	precisionEnd := precisionStart + numPrecisionDigits
// 	digitsEnd = -1

// 	allZeros := true
// 	signNeeded := isNegative
// 	for i, memo := len(chars)-1, 0; i >= 0; i-- {
// 		c := chars[i]
// 		if i != 0 {
// 			c += uint8(memo)
// 			if i >= (precisionStart + numPrecisionDigits) {
// 				ceil := (roundingMode == ROUND) && (c >= '5') && !(c == '5' && memo != 0)
// 				if ceil {
// 					c = '0'
// 				} else {
// 					c = '0'
// 				}
// 			}
// 			if c > '9' {
// 				c = '0'
// 				memo = 1
// 			} else {
// 				memo = 0
// 			}
// 		} else if memo != 0 {
// 			c = '1'
// 		}
// 		chars[i] = c
// 		if c != '0' {
// 			allZeros = false
// 			digitsStart = i
// 			if digitsEnd < 0 {
// 				digitsEnd = i + 1
// 			}
// 		}
// 	}

// 	if countingMode == SIGNIFICANT_DIGITS {
// 		precisionStart = digitsStart
// 		precisionEnd = precisionStart + numPrecisionDigits
// 	}
// 	if allZeros {
// 		signNeeded = false
// 	}

// 	readStart := afterDot - 1
// 	if digitsStart < afterDot || !allZeros {
// 		readStart = digitsStart
// 	}
// 	readEnd := afterDot
// 	if digitsEnd >= afterDot {
// 		readEnd = digitsEnd
// 	}

// 	nSign := 0
// 	if signNeeded {
// 		nSign = 1
// 	}
// 	nBeforeDot := nSign + (afterDot - readStart)
// 	nAfterDot := readEnd - afterDot
// 	actualLength := readEnd - readStart
// 	desiredLength := actualLength
// 	if paddingMode != NO_PADDING {
// 		desiredLength = precisionEnd - readStart
// 	}
// 	pad := desiredLength - actualLength
// 	// padStart := nBeforeDot + 1 + nAfterDot
// 	// padEnd := padStart + pad
// 	isInteger := nAfterDot+pad == 0

// 	out := make([]uint8, nBeforeDot)
// 	if !isInteger {
// 		out = append(out, '.')
// 	}
// 	out = append(out, chars[readStart:readEnd]...)
// 	for i := 0; i < pad; i++ {
// 		out = append(out, '0')
// 	}
// 	if signNeeded {
// 		return fmt.Sprintf("-%s", string(out))
// 	}
// 	return string(out)
// }

// func (this *Exchange) omitZero(stringNumber string) string {
// 	if stringNumber == "" {
// 		return ""
// 	}
// 	num, err := strconv.ParseFloat(stringNumber, 64)
// 	if err != nil || num == 0 {
// 		return ""
// 	}
// 	return stringNumber
// }
