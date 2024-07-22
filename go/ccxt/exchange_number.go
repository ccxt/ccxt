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
	// ROUND              = 1
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

func (this *Exchange) NumberToString(x interface{}) string {
	switch v := x.(type) {
	case nil:
		return ""
	case float64, float32, int, int64, int32:
		str := fmt.Sprintf("%v", v)
		if math.Abs(v.(float64)) < 1.0 {
			parts := strings.Split(str, "e-")
			if len(parts) == 2 {
				n := strings.Replace(parts[0], ".", "", -1)
				e, _ := strconv.Atoi(parts[1])
				neg := str[0] == '-'
				if e != 0 {
					return fmt.Sprintf("%s0.%s%s", map[bool]string{true: "-", false: ""}[neg], strings.Repeat("0", e-1), n)
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

var truncateRegExpCache = make(map[int]*regexp.Regexp)

func (this *Exchange) truncateToString(num interface{}, precision int) string {
	numStr := this.NumberToString(num)
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

func (this *Exchange) precisionFromString(str2 interface{}) int {
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

func (this *Exchange) decimalToPrecision(value interface{}, roundingMode interface{}, numPrecisionDigits interface{}, args ...interface{}) string {
	countingMode := GetArg(args, 1, nil)
	paddingMode := GetArg(args, 2, nil)
	return this._decimalToPrecision(value, roundingMode, numPrecisionDigits, countingMode, paddingMode)
}

func (this *Exchange) _decimalToPrecision(x interface{}, roundingMode interface{}, numPrecisionDigits2 interface{}, countingMode2 interface{}, paddingMode2 interface{}) string {
	countingMode := countingMode2.(int)
	paddingMode := paddingMode2.(int)
	numPrecisionDigits := numPrecisionDigits2.(int)
	if countingMode == TICK_SIZE {
		// if numPrecisionDigitsStr, ok := strconv.Itoa(numPrecisionDigits); ok {
		// 	numPrecisionDigits, _ = strconv.ParseFloat(numPrecisionDigitsStr, 64)
		// }
		if numPrecisionDigits <= 0 {
			return ""
		}
	}
	if numPrecisionDigits < 0 {
		toNearest := math.Pow(10, float64(-numPrecisionDigits))
		if roundingMode == ROUND {
			return this.decimalToPrecision(x.(float64)/toNearest*toNearest, roundingMode, 0, countingMode, paddingMode)
		}
		if roundingMode == TRUNCATE {
			return fmt.Sprintf("%v", x.(float64)-math.Mod(x.(float64), toNearest))
		}
	}

	str := this.NumberToString(x)
	isNegative := str[0] == '-'
	strStart := 0
	if isNegative {
		strStart = 1
	}
	strEnd := len(str)
	var strDot int
	// hasDot := false
	for strDot = 0; strDot < strEnd; strDot++ {
		if str[strDot] == '.' {
			// hasDot = true
			break
		}
	}

	chars := make([]uint8, strEnd-strStart)
	chars[0] = '0'

	afterDot := len(chars)
	digitsStart, digitsEnd := -1, -1
	for i, j := 1, strStart; j < strEnd; j, i = j+1, i+1 {
		c := str[j]
		if c == '.' {
			afterDot = i
			i--
		} else {
			chars[i] = c
			if c != '0' && digitsStart < 0 {
				digitsStart = i
			}
		}
	}
	if digitsStart < 0 {
		digitsStart = 1
	}

	precisionStart := afterDot
	if countingMode == SIGNIFICANT_DIGITS {
		precisionStart = digitsStart
	}
	precisionEnd := precisionStart + numPrecisionDigits
	digitsEnd = -1

	allZeros := true
	signNeeded := isNegative
	for i, memo := len(chars)-1, 0; i >= 0; i-- {
		c := chars[i]
		if i != 0 {
			c += uint8(memo)
			if i >= (precisionStart + numPrecisionDigits) {
				ceil := (roundingMode == ROUND) && (c >= '5') && !(c == '5' && memo != 0)
				if ceil {
					c = '0'
				} else {
					c = '0'
				}
			}
			if c > '9' {
				c = '0'
				memo = 1
			} else {
				memo = 0
			}
		} else if memo != 0 {
			c = '1'
		}
		chars[i] = c
		if c != '0' {
			allZeros = false
			digitsStart = i
			if digitsEnd < 0 {
				digitsEnd = i + 1
			}
		}
	}

	if countingMode == SIGNIFICANT_DIGITS {
		precisionStart = digitsStart
		precisionEnd = precisionStart + numPrecisionDigits
	}
	if allZeros {
		signNeeded = false
	}

	readStart := afterDot - 1
	if digitsStart < afterDot || !allZeros {
		readStart = digitsStart
	}
	readEnd := afterDot
	if digitsEnd >= afterDot {
		readEnd = digitsEnd
	}

	nSign := 0
	if signNeeded {
		nSign = 1
	}
	nBeforeDot := nSign + (afterDot - readStart)
	nAfterDot := readEnd - afterDot
	actualLength := readEnd - readStart
	desiredLength := actualLength
	if paddingMode != NO_PADDING {
		desiredLength = precisionEnd - readStart
	}
	pad := desiredLength - actualLength
	// padStart := nBeforeDot + 1 + nAfterDot
	// padEnd := padStart + pad
	isInteger := nAfterDot+pad == 0

	out := make([]uint8, nBeforeDot)
	if !isInteger {
		out = append(out, '.')
	}
	out = append(out, chars[readStart:readEnd]...)
	for i := 0; i < pad; i++ {
		out = append(out, '0')
	}
	if signNeeded {
		return fmt.Sprintf("-%s", string(out))
	}
	return string(out)
}

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
