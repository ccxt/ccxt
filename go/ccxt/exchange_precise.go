package ccxt

import (
	"fmt"
	"math"
	"math/big"
	"strconv"
	"strings"
)

type PreciseStruct struct {
	Decimals   interface{}
	integer    *big.Int
	baseNumber int64
}

var Precise = &PreciseStruct{}

func NewPrecise(number2 interface{}, dec2 ...interface{}) *PreciseStruct {
	var dec int
	if len(dec2) > 0 {
		dec = int(ParseInt(dec2[0]))
	} else {
		dec = math.MinInt32
	}

	number := fmt.Sprintf("%v", number2)
	p := &PreciseStruct{
		baseNumber: 10,
	}

	if dec == math.MinInt32 {
		modified := 0
		numberLowerCase := strings.ToLower(number)
		if strings.Contains(numberLowerCase, "e") {
			parts := strings.Split(numberLowerCase, "e")
			number = parts[0]
			modified, _ = strconv.Atoi(parts[1])
		}
		decimalIndex := strings.Index(number, ".")
		var newDecimals int
		if decimalIndex > -1 {
			newDecimals = len(number) - decimalIndex - 1
		} else {
			newDecimals = 0
		}
		p.Decimals = newDecimals
		integerString := strings.Replace(number, ".", "", -1)
		p.integer = new(big.Int)
		p.integer.SetString(integerString, 10)
		p.Decimals = newDecimals - modified
	} else {
		p.integer = new(big.Int)
		p.integer.SetString(number, 10)
		p.Decimals = dec
	}

	return p
}

func (p *PreciseStruct) Mul(other *PreciseStruct) *PreciseStruct {
	integer := new(big.Int).Mul(p.integer, other.integer)
	decimals := p.Decimals.(int) + other.Decimals.(int)
	return NewPrecise(integer.String(), decimals)
}

func (p *PreciseStruct) Div(other *PreciseStruct, precision2 ...interface{}) *PreciseStruct {
	precision := int64(18)
	if len(precision2) > 0 {
		precision = ParseInt(precision2[0])
	}
	distance := precision - ParseInt(p.Decimals) + ParseInt(other.Decimals)
	var numerator *big.Int

	if distance == 0 {
		numerator = p.integer
	} else if distance < 0 {
		exponent := new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(-distance)), nil)
		numerator = new(big.Int).Div(p.integer, exponent)
	} else {
		exponent := new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(distance)), nil)
		numerator = new(big.Int).Mul(p.integer, exponent)
	}
	result := new(big.Int).Div(numerator, other.integer)
	return NewPrecise(result.String(), precision)
}

func (p *PreciseStruct) Add(other *PreciseStruct) *PreciseStruct {
	if p.Decimals == other.Decimals {
		integerResult := new(big.Int).Add(p.integer, other.integer)
		return NewPrecise(integerResult.String(), p.Decimals.(int))
	} else {
		var smaller, bigger *PreciseStruct
		if p.Decimals.(int) < other.Decimals.(int) {
			smaller = p
			bigger = other
		} else {
			smaller = other
			bigger = p
		}
		exponent := bigger.Decimals.(int) - smaller.Decimals.(int)
		normalized := new(big.Int).Mul(smaller.integer, new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(exponent)), nil))
		result := new(big.Int).Add(normalized, bigger.integer)
		return NewPrecise(result.String(), bigger.Decimals.(int))
	}
}

func (p *PreciseStruct) Mod(other *PreciseStruct) *PreciseStruct {
	rationizerNumerator := int(math.Max(float64(-p.Decimals.(int)+other.Decimals.(int)), 0))
	numerator := new(big.Int).Mul(p.integer, new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(rationizerNumerator)), nil))
	rationizerDenominator := int(math.Max(float64(-other.Decimals.(int)+p.Decimals.(int)), 0))
	denominator := new(big.Int).Mul(other.integer, new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(rationizerDenominator)), nil))
	result := new(big.Int).Mod(numerator, denominator)
	return NewPrecise(result.String(), rationizerDenominator+other.Decimals.(int))
}

func (p *PreciseStruct) Sub(other *PreciseStruct) *PreciseStruct {
	negative := NewPrecise(new(big.Int).Neg(other.integer).String(), other.Decimals.(int))
	return p.Add(negative)
}

func (p *PreciseStruct) Or(other *PreciseStruct) *PreciseStruct {
	integer := new(big.Int).Or(p.integer, other.integer)
	decimals := p.Decimals.(int) + other.Decimals.(int)
	return NewPrecise(integer.String(), decimals)
}

func (p *PreciseStruct) Neg() *PreciseStruct {
	return NewPrecise(new(big.Int).Neg(p.integer).String(), p.Decimals.(int))
}

func (p *PreciseStruct) Min(other *PreciseStruct) *PreciseStruct {
	if p.Lt(other) {
		return p
	}
	return other
}

func (p *PreciseStruct) Max(other *PreciseStruct) *PreciseStruct {
	if p.Gt(other) {
		return p
	}
	return other
}

func (p *PreciseStruct) Gt(other *PreciseStruct) bool {
	sum := p.Sub(other)
	return sum.integer.Cmp(big.NewInt(0)) > 0
}

func (p *PreciseStruct) Ge(other *PreciseStruct) bool {
	sum := p.Sub(other)
	return sum.integer.Cmp(big.NewInt(0)) >= 0
}

func (p *PreciseStruct) Lt(other *PreciseStruct) bool {
	return other.Gt(p)
}

func (p *PreciseStruct) Le(other *PreciseStruct) bool {
	return other.Ge(p)
}

func (p *PreciseStruct) Abs() *PreciseStruct {
	var result *big.Int
	if p.integer.Cmp(big.NewInt(0)) < 0 {
		result = new(big.Int).Mul(p.integer, big.NewInt(-1))
	} else {
		result = p.integer
	}
	return NewPrecise(result.String(), p.Decimals.(int))
}

func (p *PreciseStruct) Reduce() *PreciseStruct {
	str := p.integer.String()
	start := len(str) - 1
	if start == 0 {
		if str == "0" {
			p.Decimals = 0
		}
		return p
	}
	i := start
	for ; i >= 0; i-- {
		if str[i] != '0' {
			break
		}
	}
	difference := start - i
	if difference == 0 {
		return p
	}
	p.Decimals = int(ParseInt(p.Decimals)) - difference
	p.integer = new(big.Int)
	p.integer.SetString(str[:i+1], 10)
	return p
}

func (p *PreciseStruct) Equals(other *PreciseStruct) bool {
	p.Reduce()
	other.Reduce()
	return p.integer.Cmp(other.integer) == 0 && p.Decimals.(int) == other.Decimals.(int)
}

func (p *PreciseStruct) String() string {
	p.Reduce()
	sign := ""
	var abs *big.Int
	if p.integer.Cmp(big.NewInt(0)) < 0 {
		sign = "-"
		abs = new(big.Int).Mul(p.integer, big.NewInt(-1))
	} else {
		abs = p.integer
	}
	absParsed := abs.String()
	padSize := p.Decimals.(int)
	if padSize < 0 {
		padSize = 0
	}
	integerArray := strings.Split(fmt.Sprintf("%0*s", padSize, absParsed), "")
	index := len(integerArray) - p.Decimals.(int)
	item := ""
	if index == 0 {
		item = "0."
	} else if p.Decimals.(int) < 0 {
		item = strings.Repeat("0", -p.Decimals.(int))
	} else if p.Decimals.(int) == 0 {
		item = ""
	} else {
		item = "."
	}
	arrayIndex := index
	if arrayIndex > len(integerArray) {
		arrayIndex = len(integerArray)
	}
	integerArray = append(integerArray[:arrayIndex], append([]string{item}, integerArray[arrayIndex:]...)...)
	return sign + strings.Join(integerArray, "")
}

func StringMul(string1, string2 interface{}) string {
	if string1 == nil || string2 == nil {
		return ""
	}
	return NewPrecise(string1.(string)).Mul(NewPrecise(string2.(string))).String()
}

func StringDiv(string1, string2 interface{}, precision ...interface{}) string {
	if string1 == nil || string2 == nil {
		return ""
	}
	string2Precise := NewPrecise(string2.(string))
	if string2Precise.integer.Cmp(big.NewInt(0)) == 0 {
		return ""
	}
	stringDiv := NewPrecise(string1.(string)).Div(string2Precise, precision...)
	return stringDiv.String()
}

func StringSub(string1, string2 interface{}) string {
	if string1 == nil || string2 == nil {
		return ""
	}
	return NewPrecise(string1.(string)).Sub(NewPrecise(string2.(string))).String()
}

// func (this *PreciseStruct) stringSub(string1, string2 interface{}) string {
// 	return StringSub(string1, string2)
// }

func StringAdd(string1, string2 interface{}) string {
	if string1 == nil && string2 == nil {
		return ""
	}
	if string1 == nil {
		return string2.(string)
	}
	if string2 == nil {
		return string1.(string)
	}
	return NewPrecise(string1.(string)).Add(NewPrecise(string2.(string))).String()
}

func StringOr(string1, string2 interface{}) string {
	if string1 == nil || string2 == nil {
		return ""
	}
	return NewPrecise(string1.(string)).Or(NewPrecise(string2.(string))).String()
}

func StringGt(a, b interface{}) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Gt(NewPrecise(b.(string)))
}

func StringEq(a, b interface{}) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Equals(NewPrecise(b.(string)))
}

func StringMax(a, b interface{}) string {
	if a == nil || b == nil {
		return ""
	}
	return NewPrecise(a.(string)).Max(NewPrecise(b.(string))).String()
}

func StringEquals(a, b interface{}) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Equals(NewPrecise(b.(string)))
}

func StringMin(string1, string2 interface{}) string {
	if string1 == nil || string2 == nil {
		return ""
	}
	return NewPrecise(string1.(string)).Min(NewPrecise(string2.(string))).String()
}

func StringLt(a, b interface{}) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Lt(NewPrecise(b.(string)))
}

func StringAbs(a interface{}) string {
	if a == nil {
		return ""
	}
	return NewPrecise(a.(string)).Abs().String()
}

func StringNeg(a interface{}) string {
	if a == nil {
		return ""
	}
	return NewPrecise(a.(string)).Neg().String()
}

func StringLe(a, b interface{}) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Le(NewPrecise(b.(string)))
}

func StringGe(a, b interface{}) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Ge(NewPrecise(b.(string)))
}

func StringMod(a, b interface{}) string {
	if a == nil || b == nil {
		return ""
	}
	return NewPrecise(a.(string)).Mod(NewPrecise(b.(string))).String()
}

func (p *PreciseStruct) ToString() string {
	p.Reduce() // Call the reduce method if any

	// Determine the sign and absolute value
	var sign string
	abs := new(big.Int)
	if p.integer.Sign() < 0 {
		sign = "-"
		abs.Neg(p.integer) // Negate the integer to get the absolute value
	} else {
		sign = ""
		abs.Set(p.integer) // Copy the positive value of the integer
	}

	intPDecimals := ParseInt(p.Decimals)

	// Convert the absolute value to a string
	// integerStr := fmt.Sprintf("%0*d", intPDecimals+ParseInt(len(abs.String())), abs)
	// integerArray := strings.Split(integerStr, "")
	// // Calculate the index to insert the decimal point
	var item string

	absParsed := abs.String()
	padSize := 0
	if intPDecimals > 0 {
		padSize = int(intPDecimals)
	}
	absParsed = fmt.Sprintf("%0*s", len(absParsed)+padSize, absParsed)
	integerArray := strings.Split(absParsed, "")
	// index := len(integerArray) - intPDecimals
	index := ParseInt(len(integerArray)) - intPDecimals

	// Handle cases based on the value of decimals
	if index == 0 {
		item = "0."
	} else if intPDecimals < 0 {
		item = strings.Repeat("0", -int(intPDecimals))
	} else if intPDecimals == 0 {
		item = ""
	} else {
		item = "."
	}

	arrayIndex := index
	arrayLength := ParseInt(len(integerArray))
	if index > arrayLength {
		arrayIndex = arrayLength
	}
	integerArray = append(integerArray[:arrayIndex], append([]string{item}, integerArray[arrayIndex:]...)...)
	return sign + strings.Join(integerArray, "")
}

// wrappers

func (e *PreciseStruct) StringMul(string1, string2 interface{}) string {
	return StringMul(string1, string2)
}

func (e *PreciseStruct) StringDiv(string1, string2 interface{}, precision ...interface{}) string {
	return StringDiv(string1, string2, precision...)
}

func (e *PreciseStruct) StringSub(string1, string2 interface{}) string {
	return StringSub(string1, string2)
}

func (e *PreciseStruct) StringAdd(string1, string2 interface{}) string {
	return StringAdd(string1, string2)
}

func (e *PreciseStruct) StringOr(string1, string2 interface{}) string {
	return StringOr(string1, string2)
}

func (e *PreciseStruct) StringGt(a, b interface{}) bool {
	return StringGt(a, b)
}

func (e *PreciseStruct) StringEq(a, b interface{}) bool {
	return StringEq(a, b)
}

func (e *PreciseStruct) StringMax(a, b interface{}) string {
	return StringMax(a, b)
}

func (e *PreciseStruct) StringEquals(a, b interface{}) bool {
	return StringEquals(a, b)
}

func (e *PreciseStruct) StringMin(string1, string2 interface{}) string {
	return StringMin(string1, string2)
}

func (e *PreciseStruct) StringLt(a, b interface{}) bool {
	return StringLt(a, b)
}

func (e *PreciseStruct) StringAbs(a interface{}) string {
	return StringAbs(a)
}

func (e *PreciseStruct) StringNeg(a interface{}) string {
	return StringNeg(a)
}

func (e *PreciseStruct) StringLe(a, b interface{}) bool {
	return StringLe(a, b)
}

func (e *PreciseStruct) StringGe(a, b interface{}) bool {
	return StringGe(a, b)
}

func (e *PreciseStruct) StringMod(a, b interface{}) string {
	return StringMod(a, b)
}
