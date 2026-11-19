package ccxt

import (
	"fmt"
	"math"
	"math/big"
	"strconv"
	"strings"
)

type PreciseStruct struct {
	Decimals   int
	integer    *big.Int
	baseNumber int64
}

var Precise = &PreciseStruct{}

func NewPrecise(number2 any, dec2 ...any) *PreciseStruct {
	var dec int
	if len(dec2) > 0 {
		dec = int(ParseInt(dec2[0]))
	} else {
		dec = math.MinInt32
	}

	// a maybe-undefined operand may arrive as a pointer; format the pointed-at value
	number2 = derefScalar(number2)
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
	decimals := p.Decimals + other.Decimals
	return NewPrecise(integer.String(), decimals)
}

func (p *PreciseStruct) Div(other *PreciseStruct, precision2 ...any) *PreciseStruct {
	precision := int64(18)
	if len(precision2) > 0 {
		precision = ParseInt(precision2[0])
	}
	distance := precision - int64(p.Decimals) + int64(other.Decimals)
	var numerator *big.Int

	if distance == 0 {
		numerator = p.integer
	} else if distance < 0 {
		exponent := new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(-distance)), nil)
		// Quo truncates toward zero, matching JS BigInt division (big.Int.Div is Euclidean and rounds toward -inf for negatives)
		numerator = new(big.Int).Quo(p.integer, exponent)
	} else {
		exponent := new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(distance)), nil)
		numerator = new(big.Int).Mul(p.integer, exponent)
	}
	result := new(big.Int).Quo(numerator, other.integer)
	return NewPrecise(result.String(), precision)
}

func (p *PreciseStruct) Add(other *PreciseStruct) *PreciseStruct {
	if p.Decimals == other.Decimals {
		integerResult := new(big.Int).Add(p.integer, other.integer)
		return NewPrecise(integerResult.String(), p.Decimals)
	} else {
		var smaller, bigger *PreciseStruct
		if p.Decimals < other.Decimals {
			smaller = p
			bigger = other
		} else {
			smaller = other
			bigger = p
		}
		exponent := bigger.Decimals - smaller.Decimals
		normalized := new(big.Int).Mul(smaller.integer, new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(exponent)), nil))
		result := new(big.Int).Add(normalized, bigger.integer)
		return NewPrecise(result.String(), bigger.Decimals)
	}
}

func (p *PreciseStruct) Mod(other *PreciseStruct) *PreciseStruct {
	rationizerNumerator := int(math.Max(float64(-p.Decimals+other.Decimals), 0))
	numerator := new(big.Int).Mul(p.integer, new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(rationizerNumerator)), nil))
	rationizerDenominator := int(math.Max(float64(-other.Decimals+p.Decimals), 0))
	denominator := new(big.Int).Mul(other.integer, new(big.Int).Exp(big.NewInt(p.baseNumber), big.NewInt(int64(rationizerDenominator)), nil))
	result := new(big.Int).Mod(numerator, denominator)
	return NewPrecise(result.String(), rationizerDenominator+other.Decimals)
}

func (p *PreciseStruct) Sub(other *PreciseStruct) *PreciseStruct {
	negative := NewPrecise(new(big.Int).Neg(other.integer).String(), other.Decimals)
	return p.Add(negative)
}

func (p *PreciseStruct) Or(other *PreciseStruct) *PreciseStruct {
	integer := new(big.Int).Or(p.integer, other.integer)
	decimals := p.Decimals + other.Decimals
	return NewPrecise(integer.String(), decimals)
}

func (p *PreciseStruct) Neg() *PreciseStruct {
	return NewPrecise(new(big.Int).Neg(p.integer).String(), p.Decimals)
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
	return NewPrecise(result.String(), p.Decimals)
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
	difference := int64(start - i)
	if difference == 0 {
		return p
	}
	p.Decimals -= int(difference)
	p.integer = new(big.Int)
	p.integer.SetString(str[:i+1], 10)
	return p
}

func (p *PreciseStruct) Equals(other *PreciseStruct) bool {
	p.Reduce()
	other.Reduce()
	return p.integer.Cmp(other.integer) == 0 && p.Decimals == other.Decimals
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
	intDecimals := p.Decimals
	padSize := intDecimals
	if padSize < 0 {
		padSize = 0
	}
	integerArray := strings.Split(fmt.Sprintf("%0*s", padSize, absParsed), "")
	index := len(integerArray) - intDecimals
	item := ""
	if index == 0 {
		item = "0."
	} else if intDecimals < 0 {
		item = strings.Repeat("0", -intDecimals)
	} else if intDecimals == 0 {
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

func StringMul(string1, string2 any) *string {
	string1, string2 = derefScalar(string1), derefScalar(string2)
	if string1 == nil || string2 == nil {
		return nil
	}
	res := NewPrecise(derefScalar(string1).(string)).Mul(NewPrecise(derefScalar(string2).(string))).String()
	return &res
}

func StringDiv(string1, string2 any, precision ...any) *string {
	string1, string2 = derefScalar(string1), derefScalar(string2)
	if string1 == nil || string2 == nil {
		return nil
	}
	string2Precise := NewPrecise(derefScalar(string2).(string))
	if string2Precise.integer.Cmp(big.NewInt(0)) == 0 {
		return nil
	}
	stringDiv := NewPrecise(derefScalar(string1).(string)).Div(string2Precise, precision...)
	res := stringDiv.String()
	return &res
}

func StringSub(string1, string2 any) *string {
	string1, string2 = derefScalar(string1), derefScalar(string2)
	if string1 == nil || string2 == nil {
		return nil
	}
	res := NewPrecise(derefScalar(string1).(string)).Sub(NewPrecise(derefScalar(string2).(string))).String()
	return &res
}

// func (this *PreciseStruct) stringSub(string1, string2 any) string {
// 	return StringSub(string1, string2)
// }

func StringAdd(string1, string2 any) *string {
	string1, string2 = derefScalar(string1), derefScalar(string2)
	if string1 == nil || string2 == nil {
		return nil
	}
	res := NewPrecise(derefScalar(string1).(string)).Add(NewPrecise(derefScalar(string2).(string))).String()
	return &res
}

func StringOr(string1, string2 any) *string {
	string1, string2 = derefScalar(string1), derefScalar(string2)
	if string1 == nil || string2 == nil {
		return nil
	}
	res := NewPrecise(derefScalar(string1).(string)).Or(NewPrecise(derefScalar(string2).(string))).String()
	return &res
}

func StringGt(a, b any) bool {
	a, b = derefScalar(a), derefScalar(b)
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(derefScalar(a).(string)).Gt(NewPrecise(derefScalar(b).(string)))
}

func StringEq(a, b any) bool {
	a, b = derefScalar(a), derefScalar(b)
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(derefScalar(a).(string)).Equals(NewPrecise(derefScalar(b).(string)))
}

func StringMax(a, b any) *string {
	a, b = derefScalar(a), derefScalar(b)
	if a == nil || b == nil {
		return nil
	}
	res := NewPrecise(derefScalar(a).(string)).Max(NewPrecise(derefScalar(b).(string))).String()
	return &res
}

func StringEquals(a, b any) bool {
	a, b = derefScalar(a), derefScalar(b)
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(derefScalar(a).(string)).Equals(NewPrecise(derefScalar(b).(string)))
}

func StringMin(string1, string2 any) *string {
	string1, string2 = derefScalar(string1), derefScalar(string2)
	if string1 == nil || string2 == nil {
		return nil
	}
	res := NewPrecise(derefScalar(string1).(string)).Min(NewPrecise(derefScalar(string2).(string))).String()
	return &res
}

func StringLt(a, b any) bool {
	a, b = derefScalar(a), derefScalar(b)
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(derefScalar(a).(string)).Lt(NewPrecise(derefScalar(b).(string)))
}

func StringAbs(a any) *string {
	a = derefScalar(a)
	if a == nil {
		return nil
	}
	res := NewPrecise(derefScalar(a).(string)).Abs().String()
	return &res
}

func StringNeg(a any) *string {
	a = derefScalar(a)
	if a == nil {
		return nil
	}
	res := NewPrecise(derefScalar(a).(string)).Neg().String()
	return &res
}

func StringLe(a, b any) bool {
	a, b = derefScalar(a), derefScalar(b)
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(derefScalar(a).(string)).Le(NewPrecise(derefScalar(b).(string)))
}

func StringGe(a, b any) bool {
	a, b = derefScalar(a), derefScalar(b)
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(derefScalar(a).(string)).Ge(NewPrecise(derefScalar(b).(string)))
}

func StringMod(a, b any) *string {
	a, b = derefScalar(a), derefScalar(b)
	if a == nil || b == nil {
		return nil
	}
	res := NewPrecise(derefScalar(a).(string)).Mod(NewPrecise(derefScalar(b).(string))).String()
	return &res
}

func (p *PreciseStruct) ToString() string {
	p.Reduce()
	// mirrors ts/src/base/Precise.ts toString: pad with zeros only when every digit is fractional
	digits := p.integer.String()
	sign := ""
	if strings.HasPrefix(digits, "-") {
		sign = "-"
		digits = digits[1:]
	}
	decimals := p.Decimals
	if decimals <= 0 {
		return sign + digits + strings.Repeat("0", -decimals)
	}
	if len(digits) <= decimals {
		return sign + "0." + strings.Repeat("0", decimals-len(digits)) + digits
	}
	index := len(digits) - decimals
	return sign + digits[:index] + "." + digits[index:]
}

// wrappers

func (e *PreciseStruct) StringMul(string1, string2 any) *string {
	return StringMul(derefScalar(string1), derefScalar(string2))
}

func (e *PreciseStruct) StringDiv(string1, string2 any, precision ...any) *string {
	return StringDiv(derefScalar(string1), derefScalar(string2), precision...)
}

func (e *PreciseStruct) StringSub(string1, string2 any) *string {
	return StringSub(derefScalar(string1), derefScalar(string2))
}

func (e *PreciseStruct) StringAdd(string1, string2 any) *string {
	return StringAdd(derefScalar(string1), derefScalar(string2))
}

func (e *PreciseStruct) StringOr(string1, string2 any) *string {
	return StringOr(derefScalar(string1), derefScalar(string2))
}

func (e *PreciseStruct) StringGt(a, b any) bool {
	return StringGt(derefScalar(a), derefScalar(b))
}

func (e *PreciseStruct) StringEq(a, b any) bool {
	return StringEq(derefScalar(a), derefScalar(b))
}

func (e *PreciseStruct) StringMax(a, b any) *string {
	return StringMax(derefScalar(a), derefScalar(b))
}

func (e *PreciseStruct) StringEquals(a, b any) bool {
	return StringEquals(derefScalar(a), derefScalar(b))
}

func (e *PreciseStruct) StringMin(string1, string2 any) *string {
	return StringMin(derefScalar(string1), derefScalar(string2))
}

func (e *PreciseStruct) StringLt(a, b any) bool {
	return StringLt(derefScalar(a), derefScalar(b))
}

func (e *PreciseStruct) StringAbs(a any) *string {
	return StringAbs(derefScalar(a))
}

func (e *PreciseStruct) StringNeg(a any) *string {
	return StringNeg(derefScalar(a))
}

func (e *PreciseStruct) StringLe(a, b any) bool {
	return StringLe(derefScalar(a), derefScalar(b))
}

func (e *PreciseStruct) StringGe(a, b any) bool {
	return StringGe(derefScalar(a), derefScalar(b))
}

func (e *PreciseStruct) StringMod(a, b any) *string {
	return StringMod(derefScalar(a), derefScalar(b))
}
