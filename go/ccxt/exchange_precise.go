package ccxt

import (
	"fmt"
	"math"
	"math/big"
	"strconv"
	"strings"
)

type PreciseStruct struct {
	decimals   interface{}
	integer    *big.Int
	baseNumber int64
}

var Precise = &PreciseStruct{}

func NewPrecise(number2 interface{}, dec2 ...interface{}) *PreciseStruct {
	var dec int
	if len(dec2) > 0 {
		dec = int(dec2[0].(int32))
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
		p.decimals = newDecimals
		integerString := strings.Replace(number, ".", "", -1)
		p.integer = new(big.Int)
		p.integer.SetString(integerString, 10)
		p.decimals = newDecimals - modified
	} else {
		p.integer = new(big.Int)
		p.integer.SetString(number, 10)
		p.decimals = dec
	}

	return p
}

func (p *PreciseStruct) Mul(other *PreciseStruct) *PreciseStruct {
	integer := new(big.Int).Mul(p.integer, other.integer)
	decimals := p.decimals.(int) + other.decimals.(int)
	return NewPrecise(integer.String(), decimals)
}

func (p *PreciseStruct) Div(other *PreciseStruct, precision2 ...interface{}) *PreciseStruct {
	precision := 18
	if len(precision2) > 0 {
		precision = int(precision2[0].(int32))
	}
	distance := precision - p.decimals.(int) + other.decimals.(int)
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
	if p.decimals == other.decimals {
		integerResult := new(big.Int).Add(p.integer, other.integer)
		return NewPrecise(integerResult.String(), p.decimals.(int))
	} else {
		var smaller, bigger *PreciseStruct
		if p.decimals.(int) < other.decimals.(int) {
			smaller = p
			bigger = other
		} else {
			smaller = other
			bigger = p
		}
		exponent := bigger.decimals.(int) - smaller.decimals.(int)
		normalized := new(big.Int).Mul(smaller.integer, new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(exponent)), nil))
		result := new(big.Int).Add(normalized, bigger.integer)
		return NewPrecise(result.String(), bigger.decimals.(int))
	}
}

func (p *PreciseStruct) Mod(other *PreciseStruct) *PreciseStruct {
	rationizerNumerator := int(math.Max(float64(-p.decimals.(int)+other.decimals.(int)), 0))
	numerator := new(big.Int).Mul(p.integer, new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(rationizerNumerator)), nil))
	rationizerDenominator := int(math.Max(float64(-other.decimals.(int)+p.decimals.(int)), 0))
	denominator := new(big.Int).Mul(other.integer, new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(rationizerDenominator)), nil))
	result := new(big.Int).Mod(numerator, denominator)
	return NewPrecise(result.String(), rationizerDenominator+other.decimals.(int))
}

func (p *PreciseStruct) Sub(other *PreciseStruct) *PreciseStruct {
	negative := NewPrecise(new(big.Int).Neg(other.integer).String(), other.decimals.(int))
	return p.Add(negative)
}

func (p *PreciseStruct) Or(other *PreciseStruct) *PreciseStruct {
	integer := new(big.Int).Or(p.integer, other.integer)
	decimals := p.decimals.(int) + other.decimals.(int)
	return NewPrecise(integer.String(), decimals)
}

func (p *PreciseStruct) Neg() *PreciseStruct {
	return NewPrecise(new(big.Int).Neg(p.integer).String(), p.decimals.(int))
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
	return NewPrecise(result.String(), p.decimals.(int))
}

func (p *PreciseStruct) Reduce() *PreciseStruct {
	str := p.integer.String()
	start := len(str) - 1
	if start == 0 {
		if str == "0" {
			p.decimals = 0
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
	p.decimals = p.decimals.(int) - difference
	p.integer = new(big.Int)
	p.integer.SetString(str[:i+1], 10)
	return p
}

func (p *PreciseStruct) Equals(other *PreciseStruct) bool {
	p.Reduce()
	other.Reduce()
	return p.integer.Cmp(other.integer) == 0 && p.decimals.(int) == other.decimals.(int)
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
	padSize := p.decimals.(int)
	if padSize < 0 {
		padSize = 0
	}
	integerArray := strings.Split(fmt.Sprintf("%0*s", padSize, absParsed), "")
	index := len(integerArray) - p.decimals.(int)
	item := ""
	if index == 0 {
		item = "0."
	} else if p.decimals.(int) < 0 {
		item = strings.Repeat("0", -p.decimals.(int))
	} else if p.decimals.(int) == 0 {
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

// wrappers

func (e *PreciseStruct) stringMul(string1, string2 interface{}) string {
	return StringMul(string1, string2)
}

func (e *PreciseStruct) stringDiv(string1, string2 interface{}, precision ...interface{}) string {
	return StringDiv(string1, string2, precision...)
}

func (e *PreciseStruct) stringSub(string1, string2 interface{}) string {
	return StringSub(string1, string2)
}

func (e *PreciseStruct) stringAdd(string1, string2 interface{}) string {
	return StringAdd(string1, string2)
}

func (e *PreciseStruct) stringOr(string1, string2 interface{}) string {
	return StringOr(string1, string2)
}

func (e *PreciseStruct) stringGt(a, b interface{}) bool {
	return StringGt(a, b)
}

func (e *PreciseStruct) stringEq(a, b interface{}) bool {
	return StringEq(a, b)
}

func (e *PreciseStruct) stringMax(a, b interface{}) string {
	return StringMax(a, b)
}

func (e *PreciseStruct) stringEquals(a, b interface{}) bool {
	return StringEquals(a, b)
}

func (e *PreciseStruct) stringMin(string1, string2 interface{}) string {
	return StringMin(string1, string2)
}

func (e *PreciseStruct) stringLt(a, b interface{}) bool {
	return StringLt(a, b)
}

func (e *PreciseStruct) stringAbs(a interface{}) string {
	return StringAbs(a)
}

func (e *PreciseStruct) stringNeg(a interface{}) string {
	return StringNeg(a)
}

func (e *PreciseStruct) stringLe(a, b interface{}) bool {
	return StringLe(a, b)
}

func (e *PreciseStruct) stringGe(a, b interface{}) bool {
	return StringGe(a, b)
}

func (e *PreciseStruct) stringMod(a, b interface{}) string {
	return StringMod(a, b)
}
