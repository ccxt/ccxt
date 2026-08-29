package ccxt

import (
	"fmt"
	"math"
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

func (this *BaseExchange) NumberToString(x any) any {
	res := NumberToString(x)
	if res == "" {
		return nil
	}
	return res
}

// zeroPad lets us append runs of '0' without allocating via strings.Repeat.
const zeroPad = "0000000000000000000000000000000000000000000000000000000000000000"

func writeZeros(b *strings.Builder, n int) {
	for n > 0 {
		chunk := n
		if chunk > len(zeroPad) {
			chunk = len(zeroPad)
		}
		b.WriteString(zeroPad[:chunk])
		n -= chunk
	}
}

func NumberToString(x any) string {
	switch v := x.(type) {
	case nil:
		return ""
	case string:
		// fmt.Sprintf("%v", string) is the identity; skip formatting entirely
		return v
	case float64:
		return float64ToString(v)
	case int:
		// %v never yields exponent notation for integers, so the exponent
		// expansion below was always a no-op for them
		return strconv.Itoa(v)
	case int64:
		return strconv.FormatInt(v, 10)
	case int32:
		return strconv.FormatInt(int64(v), 10)
	case float32:
		// Legacy behaviour preserved: ToFloat64 has no float32 case, so it
		// returned NaN and neither exponent branch below ever ran for float32.
		return strconv.FormatFloat(float64(v), 'g', -1, 32)
	default:
		return fmt.Sprintf("%v", x)
	}
}

// float64ToString renders a float64 exactly the way fmt.Sprintf("%v", f) does
// (shortest 'g' form), then expands scientific notation to plain decimals.
func float64ToString(val float64) string {
	str := strconv.FormatFloat(val, 'g', -1, 64)
	ei := strings.IndexByte(str, 'e')
	if ei < 0 {
		// fast path: nothing to expand (also covers NaN / ±Inf)
		return str
	}

	// Handle very large numbers (positive exponents)
	if math.Abs(val) >= 1.0 {
		exponent, err := strconv.Atoi(str[ei+1:])
		if err != nil || exponent < 0 {
			return str
		}
		mantissa := str[:ei]
		integerPart := mantissa
		fractionalPart := ""
		if di := strings.IndexByte(mantissa, '.'); di >= 0 {
			integerPart = mantissa[:di]
			fractionalPart = mantissa[di+1:]
		}
		var b strings.Builder
		if exponent >= len(fractionalPart) {
			b.Grow(len(integerPart) + exponent)
			b.WriteString(integerPart)
			b.WriteString(fractionalPart)
			writeZeros(&b, exponent-len(fractionalPart))
			return b.String()
		}
		b.Grow(len(integerPart) + len(fractionalPart) + 1)
		b.WriteString(integerPart)
		b.WriteString(fractionalPart[:exponent])
		b.WriteByte('.')
		b.WriteString(fractionalPart[exponent:])
		return b.String()
	}

	// Handle numbers with negative exponents (fractions)
	if str[ei+1] != '-' {
		return str
	}
	e, err := strconv.Atoi(str[ei+2:])
	if err != nil || e == 0 {
		return str
	}
	neg := str[0] == '-'
	mantissa := str[:ei]
	if neg {
		mantissa = mantissa[1:]
	}
	var b strings.Builder
	b.Grow(len(mantissa) + e + 3)
	if neg {
		b.WriteByte('-')
	}
	b.WriteString("0.")
	writeZeros(&b, e-1)
	for i := 0; i < len(mantissa); i++ { // mantissa digits, dot removed
		if mantissa[i] != '.' {
			b.WriteByte(mantissa[i])
		}
	}
	return b.String()
}

func (this *BaseExchange) NumberToString2(x any) string {
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

// func (this *BaseExchange) NumberToString(x any) string {
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

// matchTruncatePrefix emulates `^([-]*\d+\.\d{0,precision})` and returns the
// end index of the match, or -1 when it does not match. The character classes
// are disjoint, so the greedy scan needs no backtracking.
func matchTruncatePrefix(s string, precision int) int {
	i := 0
	n := len(s)
	for i < n && s[i] == '-' { // [-]*
		i++
	}
	start := i
	for i < n && s[i] >= '0' && s[i] <= '9' { // \d+
		i++
	}
	if i == start || i >= n || s[i] != '.' { // needs >=1 digit then a dot
		return -1
	}
	i++
	for k := 0; k < precision && i < n && s[i] >= '0' && s[i] <= '9'; k++ { // \d{0,precision}
		i++
	}
	return i
}

func (this *BaseExchange) truncateToString(num any, precision int) string {
	numStr := NumberToString(num)
	if precision > 0 {
		if end := matchTruncatePrefix(numStr, precision); end > 0 {
			return numStr[:end]
		}
	}
	// Fallback for precision <= 0 or no decimal point
	intPart := numStr
	if dot := strings.IndexByte(numStr, '.'); dot >= 0 {
		intPart = numStr[:dot]
	}
	intNum, _ := strconv.Atoi(intPart)
	return strconv.Itoa(intNum)
}

func (this *BaseExchange) truncate(num any, precision int) float64 {
	result, _ := strconv.ParseFloat(this.truncateToString(num, precision), 64)
	return result
}

// matchExponentPrefix emulates one match of `\d\.?\d*[eE]` anchored at i and
// returns the end index of the match, or -1 when there is no match at i.
func matchExponentPrefix(s string, i int) int {
	n := len(s)
	if s[i] < '0' || s[i] > '9' { // \d
		return -1
	}
	j := i + 1
	if j < n && s[j] == '.' { // \.? greedy; on failure \d* cannot match '.' anyway
		j++
	}
	for j < n && s[j] >= '0' && s[j] <= '9' { // \d* — digits and [eE] are disjoint,
		j++ // so the greedy run is the only candidate
	}
	if j < n && (s[j] == 'e' || s[j] == 'E') {
		return j + 1
	}
	return -1
}

func (this *BaseExchange) PrecisionFromString(str2 any) int {
	str := str2.(string)
	if strings.ContainsAny(str, "eE") {
		// equivalent to regexp `\d\.?\d*[eE]`.ReplaceAllString(str, "")
		var b strings.Builder
		last := 0
		for i := 0; i < len(str); {
			end := matchExponentPrefix(str, i)
			if end < 0 {
				i++
				continue
			}
			b.WriteString(str[last:i])
			last = end
			i = end
		}
		numStr := str
		if last != 0 {
			b.WriteString(str[last:])
			numStr = b.String()
		}
		precision, _ := strconv.Atoi(numStr)
		return -precision
	}
	// equivalent to regexp `0+$`.ReplaceAllString(str, "") — Go's `$` is
	// end-of-text here (no multiline flag), so TrimRight is exact.
	split := strings.TrimRight(str, "0")
	if dot := strings.IndexByte(split, '.'); dot >= 0 {
		frac := split[dot+1:]
		if next := strings.IndexByte(frac, '.'); next >= 0 {
			frac = frac[:next] // matches the old strings.Split(...)[1]
		}
		return len(frac)
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

func (this *BaseExchange) DecimalToPrecision(value any, roundingMode any, numPrecisionDigits any, args ...any) any {
	countingMode := GetArg(args, 0, nil)
	paddingMode := GetArg(args, 1, nil)
	return this._decimalToPrecision(value, roundingMode, numPrecisionDigits, countingMode, paddingMode)
}

func (this *BaseExchange) _decimalToPrecision(x any, roundingMode2, numPrecisionDigits2 any, countmode2, paddingMode any) string {
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

	if numPrecisionDigits < 0 {
		parsedX := ToFloat64(x)
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
		parsedX := ToFloat64(x)
		precisionDigitsString := this._decimalToPrecision(numPrecisionDigits, ROUND, 22, DECIMAL_PLACES, NO_PADDING)
		newNumPrecisionDigits := this.PrecisionFromString(precisionDigitsString)
		if roundingMode == TRUNCATE {
			xStr := NumberToString(x)
			truncatedX := this.truncateToString(xStr, int(math.Max(0, float64(newNumPrecisionDigits))))
			truncatedParsedX := ToFloat64(truncatedX)
			scale := math.Pow(10, math.Max(float64(newNumPrecisionDigits), 10))
			xScaled := math.Round(truncatedParsedX * scale)
			tickScaled := math.Round(numPrecisionDigits * scale)
			ticks := math.Trunc(xScaled / tickScaled)
			parsedX = (ticks * tickScaled) / scale

			if paddingMode == NO_PADDING {
				// Format with fixed precision
				formatted := strconv.FormatFloat(parsedX, 'f', newNumPrecisionDigits, 64)
				// Convert back to float to remove trailing zeros
				floatVal, _ := strconv.ParseFloat(formatted, 64)
				return strconv.FormatFloat(floatVal, 'f', -1, 64)
			}

			return this._decimalToPrecision(parsedX, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, paddingMode)
		}
		missing := math.Mod(parsedX, numPrecisionDigits)
		missingRes := this._decimalToPrecision(missing, ROUND, 8, DECIMAL_PLACES, NO_PADDING)
		missingFloat, _ := strconv.ParseFloat(missingRes, 64)
		missing = missingFloat
		fpError := missing / numPrecisionDigits
		fpErrorStr := this._decimalToPrecision(fpError, ROUND, math.Max(float64(newNumPrecisionDigits), 8), DECIMAL_PLACES, NO_PADDING)
		fpErrorResult := this.PrecisionFromString(fpErrorStr)
		if fpErrorResult != 0 {
			switch roundingMode {
			case ROUND:
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
			case TRUNCATE:
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

// func (this *BaseExchange) _decimalToPrecision(x any, roundingMode any, numPrecisionDigits2 any, countingMode2 any, paddingMode2 any) string {
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

// func (this *BaseExchange) omitZero(stringNumber string) string {
// 	if stringNumber == "" {
// 		return ""
// 	}
// 	num, err := strconv.ParseFloat(stringNumber, 64)
// 	if err != nil || num == 0 {
// 		return ""
// 	}
// 	return stringNumber
// }
