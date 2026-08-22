package ccxt

import (
	"fmt"
	"math"
	"math/big"
	"strconv"
	"strings"
)

type PreciseStruct struct {
	Decimals   any
	integer    *big.Int
	baseNumber int64
}

var Precise = &PreciseStruct{}

// pow10Table caches small powers of ten so Add/Sub/Mul/Div/Mod/comparisons
// don't repeatedly pay for big.Int.Exp on the same handful of exponents
// (decimal-count differences are almost always small). Populated once at
// package init and never mutated afterwards, so concurrent reads are safe.
var pow10Table [128]*big.Int

func init() {
	ten := big.NewInt(10)
	val := big.NewInt(1)
	pow10Table[0] = val
	for i := 1; i < len(pow10Table); i++ {
		val = new(big.Int).Mul(val, ten)
		pow10Table[i] = val
	}
}

func pow10(n int) *big.Int {
	if n >= 0 && n < len(pow10Table) {
		return pow10Table[n]
	}
	if n < 0 {
		n = 0
	}
	return new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(n)), nil)
}

func intMax(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// newPreciseFromBigInt builds a result directly from an already-computed
// big.Int and decimal count, skipping the string round-trip (fmt.Sprintf +
// re-parsing) that NewPrecise needs for raw string input. Every arithmetic
// method below already holds a fresh *big.Int, so this is the hot path.
func newPreciseFromBigInt(integer *big.Int, decimals int) *PreciseStruct {
	return &PreciseStruct{
		integer:    integer,
		Decimals:   decimals,
		baseNumber: 10,
	}
}

func NewPrecise(number2 any, dec2 ...any) *PreciseStruct {
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
	return newPreciseFromBigInt(integer, decimals)
}

func (p *PreciseStruct) Div(other *PreciseStruct, precision2 ...any) *PreciseStruct {
	precision := int64(18)
	if len(precision2) > 0 {
		precision = ParseInt(precision2[0])
	}
	distance := precision - ParseInt(p.Decimals) + ParseInt(other.Decimals)
	var numerator *big.Int

	if distance == 0 {
		numerator = p.integer
	} else if distance < 0 {
		// Quo truncates toward zero, matching JS BigInt division (big.Int.Div is Euclidean and rounds toward -inf for negatives)
		numerator = new(big.Int).Quo(p.integer, pow10(int(-distance)))
	} else {
		numerator = new(big.Int).Mul(p.integer, pow10(int(distance)))
	}
	result := new(big.Int).Quo(numerator, other.integer)
	return newPreciseFromBigInt(result, int(precision))
}

func (p *PreciseStruct) Add(other *PreciseStruct) *PreciseStruct {
	pDecimals := p.Decimals.(int)
	oDecimals := other.Decimals.(int)
	if pDecimals == oDecimals {
		integerResult := new(big.Int).Add(p.integer, other.integer)
		return newPreciseFromBigInt(integerResult, pDecimals)
	}
	var smaller, bigger *PreciseStruct
	if pDecimals < oDecimals {
		smaller = p
		bigger = other
	} else {
		smaller = other
		bigger = p
	}
	exponent := bigger.Decimals.(int) - smaller.Decimals.(int)
	normalized := new(big.Int).Mul(smaller.integer, pow10(exponent))
	result := new(big.Int).Add(normalized, bigger.integer)
	return newPreciseFromBigInt(result, bigger.Decimals.(int))
}

func (p *PreciseStruct) Mod(other *PreciseStruct) *PreciseStruct {
	pDecimals := p.Decimals.(int)
	oDecimals := other.Decimals.(int)
	rationizerNumerator := intMax(oDecimals-pDecimals, 0)
	numerator := new(big.Int).Mul(p.integer, pow10(rationizerNumerator))
	rationizerDenominator := intMax(pDecimals-oDecimals, 0)
	denominator := new(big.Int).Mul(other.integer, pow10(rationizerDenominator))
	result := new(big.Int).Mod(numerator, denominator)
	return newPreciseFromBigInt(result, rationizerDenominator+oDecimals)
}

func (p *PreciseStruct) Sub(other *PreciseStruct) *PreciseStruct {
	negative := newPreciseFromBigInt(new(big.Int).Neg(other.integer), other.Decimals.(int))
	return p.Add(negative)
}

func (p *PreciseStruct) Or(other *PreciseStruct) *PreciseStruct {
	integer := new(big.Int).Or(p.integer, other.integer)
	decimals := p.Decimals.(int) + other.Decimals.(int)
	return newPreciseFromBigInt(integer, decimals)
}

func (p *PreciseStruct) Neg() *PreciseStruct {
	return newPreciseFromBigInt(new(big.Int).Neg(p.integer), p.Decimals.(int))
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

// alignedCompare scales the operand with fewer decimals up to match the
// other's scale and compares the resulting integers directly, avoiding the
// full Sub()+NewPrecise() allocation the naive comparison used to do.
func alignedCompare(p, other *PreciseStruct) int {
	pDecimals := p.Decimals.(int)
	oDecimals := other.Decimals.(int)
	if pDecimals == oDecimals {
		return p.integer.Cmp(other.integer)
	}
	if pDecimals < oDecimals {
		scaled := new(big.Int).Mul(p.integer, pow10(oDecimals-pDecimals))
		return scaled.Cmp(other.integer)
	}
	scaled := new(big.Int).Mul(other.integer, pow10(pDecimals-oDecimals))
	return p.integer.Cmp(scaled)
}

func (p *PreciseStruct) Gt(other *PreciseStruct) bool {
	return alignedCompare(p, other) > 0
}

func (p *PreciseStruct) Ge(other *PreciseStruct) bool {
	return alignedCompare(p, other) >= 0
}

func (p *PreciseStruct) Lt(other *PreciseStruct) bool {
	return alignedCompare(p, other) < 0
}

func (p *PreciseStruct) Le(other *PreciseStruct) bool {
	return alignedCompare(p, other) <= 0
}

func (p *PreciseStruct) Abs() *PreciseStruct {
	result := new(big.Int).Abs(p.integer)
	return newPreciseFromBigInt(result, p.Decimals.(int))
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
	p.Decimals = int(ParseInt(p.Decimals)) - difference // TODO: loss of precision by converting to int, should be int64
	p.integer = new(big.Int).Quo(p.integer, pow10(difference))
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
	integer := p.integer
	if integer.Sign() < 0 {
		sign = "-"
		integer = new(big.Int).Abs(integer)
	}
	absParsed := integer.String()
	var intDecimals int
	switch v := p.Decimals.(type) {
	case int:
		intDecimals = v
	case int64:
		intDecimals = int(v) // TODO: loss of precsion by converting to int, should be int64
	}
	if intDecimals > 0 && len(absParsed) < intDecimals {
		absParsed = strings.Repeat("0", intDecimals-len(absParsed)) + absParsed
	}
	if intDecimals <= 0 {
		if intDecimals < 0 {
			return sign + absParsed + strings.Repeat("0", -intDecimals)
		}
		return sign + absParsed
	}
	index := len(absParsed) - intDecimals
	if index == 0 {
		return sign + "0." + absParsed
	}
	return sign + absParsed[:index] + "." + absParsed[index:]
}

func StringMul(string1, string2 any) any {
	if string1 == nil || string2 == nil {
		return nil
	}
	return NewPrecise(string1.(string)).Mul(NewPrecise(string2.(string))).String()
}

func StringDiv(string1, string2 any, precision ...any) any {
	if string1 == nil || string2 == nil {
		return nil
	}
	string2Precise := NewPrecise(string2.(string))
	if string2Precise.integer.Cmp(big.NewInt(0)) == 0 {
		return nil
	}
	stringDiv := NewPrecise(string1.(string)).Div(string2Precise, precision...)
	return stringDiv.String()
}

func StringSub(string1, string2 any) any {
	if string1 == nil || string2 == nil {
		return nil
	}
	return NewPrecise(string1.(string)).Sub(NewPrecise(string2.(string))).String()
}

// func (this *PreciseStruct) stringSub(string1, string2 any) string {
// 	return StringSub(string1, string2)
// }

func StringAdd(string1, string2 any) any {
	if string1 == nil || string2 == nil {
		return nil
	}
	return NewPrecise(string1.(string)).Add(NewPrecise(string2.(string))).String()
}

func StringOr(string1, string2 any) any {
	if string1 == nil || string2 == nil {
		return nil
	}
	return NewPrecise(string1.(string)).Or(NewPrecise(string2.(string))).String()
}

func StringGt(a, b any) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Gt(NewPrecise(b.(string)))
}

func StringEq(a, b any) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Equals(NewPrecise(b.(string)))
}

func StringMax(a, b any) any {
	if a == nil || b == nil {
		return nil
	}
	return NewPrecise(a.(string)).Max(NewPrecise(b.(string))).String()
}

func StringEquals(a, b any) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Equals(NewPrecise(b.(string)))
}

func StringMin(string1, string2 any) any {
	if string1 == nil || string2 == nil {
		return nil
	}
	return NewPrecise(string1.(string)).Min(NewPrecise(string2.(string))).String()
}

func StringLt(a, b any) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Lt(NewPrecise(b.(string)))
}

func StringAbs(a any) any {
	if a == nil {
		return nil
	}
	return NewPrecise(a.(string)).Abs().String()
}

func StringNeg(a any) any {
	if a == nil {
		return nil
	}
	return NewPrecise(a.(string)).Neg().String()
}

func StringLe(a, b any) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Le(NewPrecise(b.(string)))
}

func StringGe(a, b any) bool {
	if a == nil || b == nil {
		return false
	}
	return NewPrecise(a.(string)).Ge(NewPrecise(b.(string)))
}

func StringMod(a, b any) any {
	if a == nil || b == nil {
		return nil
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

func (e *PreciseStruct) StringMul(string1, string2 any) any {
	return StringMul(string1, string2)
}

func (e *PreciseStruct) StringDiv(string1, string2 any, precision ...any) any {
	return StringDiv(string1, string2, precision...)
}

func (e *PreciseStruct) StringSub(string1, string2 any) any {
	return StringSub(string1, string2)
}

func (e *PreciseStruct) StringAdd(string1, string2 any) any {
	return StringAdd(string1, string2)
}

func (e *PreciseStruct) StringOr(string1, string2 any) any {
	return StringOr(string1, string2)
}

func (e *PreciseStruct) StringGt(a, b any) bool {
	return StringGt(a, b)
}

func (e *PreciseStruct) StringEq(a, b any) bool {
	return StringEq(a, b)
}

func (e *PreciseStruct) StringMax(a, b any) any {
	return StringMax(a, b)
}

func (e *PreciseStruct) StringEquals(a, b any) bool {
	return StringEquals(a, b)
}

func (e *PreciseStruct) StringMin(string1, string2 any) any {
	return StringMin(string1, string2)
}

func (e *PreciseStruct) StringLt(a, b any) bool {
	return StringLt(a, b)
}

func (e *PreciseStruct) StringAbs(a any) any {
	return StringAbs(a)
}

func (e *PreciseStruct) StringNeg(a any) any {
	return StringNeg(a)
}

func (e *PreciseStruct) StringLe(a, b any) bool {
	return StringLe(a, b)
}

func (e *PreciseStruct) StringGe(a, b any) bool {
	return StringGe(a, b)
}

func (e *PreciseStruct) StringMod(a, b any) any {
	return StringMod(a, b)
}
