package util

import (
	"bytes"
	"fmt"
	"strconv"
)

const (
	Round = iota
	Truncate
)

const (
	DecimalPlaces = iota
	SignificantDigits
)

const (
	NoPadding = iota
	PadWithZero
)

func NumberToString(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
}

func DecimalToPrecision(f float64, roundingMode int, numPrecisionDigits int, countingMode int, paddingMode int) (string, error) {
	if numPrecisionDigits < 0 {
		return "", fmt.Errorf("negative precision not supported")
	}

	var str = NumberToString(f)
	var isNegative = str[0] == '-'
	var strStart, strEnd = 0, len(str)
	if isNegative {
		strStart = 1
	}

	var hasDot bool
	for i := 0; i < strEnd; i++ {
		if str[i] == '.' {
			hasDot = true
			break
		}
	}

	var sz = strEnd - strStart + 1
	if hasDot {
		sz -= 1
	}
	var chars = make([]byte, sz)
	chars[0] = '0'

	var afterDot, digitsStart, digitsEnd = len(chars), -1, -1

	for i, j := 1, strStart; j < strEnd; i, j = i+1, j+1 {
		c := str[j]
		if c == '.' {
			afterDot = i
			i--
		} else if c < '0' || c > '9' {
			return "", fmt.Errorf("bad input: %d", c)
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

	var precisionStart = digitsStart
	if countingMode == DecimalPlaces {
		precisionStart = afterDot
	}
	var precisionEnd = precisionStart + numPrecisionDigits
	digitsEnd = -1

	for i, memo := len(chars)-1, false; i >= 0; i-- {
		c := chars[i]
		if i != 0 {
			if memo {
				c += 1
			}
			if i >= precisionStart+numPrecisionDigits {
				if roundingMode == Round && c >= '5' && !(c == '5' && memo) {
					c = '9' + 1
				} else {
					c = '0'
				}
			}
			if c > '9' {
				c = '0'
				memo = true
			} else {
				memo = false
			}
		} else if memo {
			c = '1'
		}
		chars[i] = c

		if c != '0' {
			digitsStart = i
			if digitsEnd < 0 {
				digitsEnd = i + 1
			}
		}
	}

	if countingMode == SignificantDigits {
		precisionStart = digitsStart
		precisionEnd = precisionStart + numPrecisionDigits
	}

	var readStart = digitsStart
	if digitsStart >= afterDot {
		readStart = afterDot - 1
	}
	var readEnd = digitsEnd
	if digitsEnd < afterDot {
		readEnd = afterDot
	}

	var nSign = 0
	if f < 0 {
		nSign = 1
	}
	var nBeforeDot = nSign + afterDot - readStart
	var nAfterDot = readEnd - afterDot
	if nAfterDot < 0 {
		nAfterDot = 0
	}
	var actualLength = readEnd - readStart
	var desiredLength = precisionEnd - readStart
	if paddingMode == NoPadding {
		desiredLength = actualLength
	}
	var pad = desiredLength - actualLength
	if pad < 0 {
		pad = 0
	}
	var padStart = nBeforeDot + 1 + nAfterDot
	var padEnd = padStart + pad
	var isInteger = (nAfterDot + pad) == 0

	sz = nBeforeDot + nAfterDot + pad
	if !isInteger {
		sz++
	}

	var out = make([]byte, sz)
	if f < 0 {
		out[0] = '-'
	}
	for i, j := nSign, readStart; i < nBeforeDot; i, j = i+1, j+1 {
		out[i] = chars[j]
	}
	if !isInteger {
		out[nBeforeDot] = '.'
	}
	for i, j := nBeforeDot+1, afterDot; i < padStart; i, j = i+1, j+1 {
		out[i] = chars[j]
	}
	for i := padStart; i < padEnd; i++ {
		out[i] = '0'
	}

	return string(bytes.Trim(out, "\x00")), nil
}
