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

// static bounded lookup table for 10^n, n in [0, 128] — order-independent,
// never invalidated, uniform O(1) cost for any input (falls back to
// exponentiation for exponents beyond the table). Entries are only ever
// used as read-only operation operands, never as receivers, so they are
// never mutated.
var precisePow10Table = func() []*big.Int {
	table := make([]*big.Int, 129)
	table[0] = big.NewInt(1)
	ten := big.NewInt(10)
	for i := 1; i <= 128; i++ {
		table[i] = new(big.Int).Mul(table[i-1], ten)
	}
	return table
}()

func precisePow10(exponent int64) *big.Int {
	if exponent >= 0 && exponent < int64(len(precisePow10Table)) {
		return precisePow10Table[exponent]
	}
	return new(big.Int).Exp(big.NewInt(preciseBaseNumber), big.NewInt(exponent), nil)
}

const preciseBaseNumber = 10

// internal constructor from an already-computed integer — arithmetic
// methods use this to avoid formatting the result to a decimal string and
// re-parsing it through the public constructor
func newPrecise(integer *big.Int, decimals int) *PreciseStruct {
	return &PreciseStruct{
		Decimals:   decimals,
		integer:    integer,
		baseNumber: preciseBaseNumber,
	}
}

func NewPrecise(number2 any, dec2 ...any) *PreciseStruct {
	var dec int
	if len(dec2) > 0 {
		dec = int(ParseInt(dec2[0]))
	} else {
		dec = math.MinInt32
	}
	// fmt.Sprintf is only needed for non-string inputs, which are rare
	var number string
	if s, ok := number2.(string); ok {
		number = s
	} else {
		number = fmt.Sprintf("%v", number2)
	}
	p := &PreciseStruct{
		baseNumber: preciseBaseNumber,
	}
	p.integer = new(big.Int)
	if dec == math.MinInt32 {
		// scientific notation is rare — only lower and split when an
		// exponent marker is actually present
		modified := 0
		if strings.IndexByte(number, 'e') > -1 || strings.IndexByte(number, 'E') > -1 {
			numberLowerCase := strings.ToLower(number)
			parts := strings.Split(numberLowerCase, "e")
			number = parts[0]
			modified, _ = strconv.Atoi(parts[1])
		}
		decimalIndex := strings.Index(number, ".")
		var newDecimals int
		if decimalIndex > -1 {
			newDecimals = len(number) - decimalIndex - 1
		}
		// strip every dot, not just the first — slicing around the first dot
		// only would leave residual dots on malformed multi-dot input, and
		// SetString would then silently parse just the leading digit prefix
		integerString := strings.Replace(number, ".", "", -1)
		p.integer.SetString(integerString, 10)
		p.Decimals = newDecimals - modified
	} else {
		p.integer.SetString(number, 10)
		p.Decimals = dec
	}
	return p
}

func (p *PreciseStruct) Mul(other *PreciseStruct) *PreciseStruct {
	integer := new(big.Int).Mul(p.integer, other.integer)
	return newPrecise(integer, p.Decimals.(int)+other.Decimals.(int))
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
		exponent := precisePow10(-distance)
		// Quo truncates toward zero, matching JS BigInt division (big.Int.Div is Euclidean and rounds toward -inf for negatives)
		numerator = new(big.Int).Quo(p.integer, exponent)
	} else {
		exponent := precisePow10(distance)
		numerator = new(big.Int).Mul(p.integer, exponent)
	}
	result := new(big.Int).Quo(numerator, other.integer)
	return newPrecise(result, int(precision))
}

func (p *PreciseStruct) Add(other *PreciseStruct) *PreciseStruct {
	if p.Decimals == other.Decimals {
		integerResult := new(big.Int).Add(p.integer, other.integer)
		return newPrecise(integerResult, p.Decimals.(int))
	}
	var smaller, bigger *PreciseStruct
	if p.Decimals.(int) < other.Decimals.(int) {
		smaller = p
		bigger = other
	} else {
		smaller = other
		bigger = p
	}
	exponent := int64(bigger.Decimals.(int) - smaller.Decimals.(int))
	normalized := new(big.Int).Mul(smaller.integer, precisePow10(exponent))
	result := new(big.Int).Add(normalized, bigger.integer)
	return newPrecise(result, bigger.Decimals.(int))
}

func (p *PreciseStruct) Mod(other *PreciseStruct) *PreciseStruct {
	pDecimals := p.Decimals.(int)
	otherDecimals := other.Decimals.(int)
	rationizerNumerator := otherDecimals - pDecimals
	if rationizerNumerator < 0 {
		rationizerNumerator = 0
	}
	numerator := new(big.Int).Mul(p.integer, precisePow10(int64(rationizerNumerator)))
	rationizerDenominator := pDecimals - otherDecimals
	if rationizerDenominator < 0 {
		rationizerDenominator = 0
	}
	denominator := new(big.Int).Mul(other.integer, precisePow10(int64(rationizerDenominator)))
	result := new(big.Int).Mod(numerator, denominator)
	return newPrecise(result, rationizerDenominator+otherDecimals)
}

func (p *PreciseStruct) Sub(other *PreciseStruct) *PreciseStruct {
	// inlined addition of the negation, avoiding an intermediate instance
	if p.Decimals == other.Decimals {
		result := new(big.Int).Sub(p.integer, other.integer)
		return newPrecise(result, p.Decimals.(int))
	}
	var smallerInteger, biggerInteger *big.Int
	var smallerDecimals, biggerDecimals int
	var pIsBigger bool
	if p.Decimals.(int) > other.Decimals.(int) {
		smallerInteger = other.integer
		smallerDecimals = other.Decimals.(int)
		biggerInteger = p.integer
		biggerDecimals = p.Decimals.(int)
		pIsBigger = true
	} else {
		smallerInteger = p.integer
		smallerDecimals = p.Decimals.(int)
		biggerInteger = other.integer
		biggerDecimals = other.Decimals.(int)
	}
	normalized := new(big.Int).Mul(smallerInteger, precisePow10(int64(biggerDecimals-smallerDecimals)))
	var result *big.Int
	if pIsBigger {
		result = new(big.Int).Sub(biggerInteger, normalized)
	} else {
		result = new(big.Int).Sub(normalized, biggerInteger)
	}
	return newPrecise(result, biggerDecimals)
}

func (p *PreciseStruct) Or(other *PreciseStruct) *PreciseStruct {
	integer := new(big.Int).Or(p.integer, other.integer)
	return newPrecise(integer, p.Decimals.(int)+other.Decimals.(int))
}

func (p *PreciseStruct) Neg() *PreciseStruct {
	return newPrecise(new(big.Int).Neg(p.integer), p.Decimals.(int))
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

// aligned comparison without intermediate instance allocation: aligns the
// operand with fewer decimals by multiplying its integer by 10^difference,
// then compares the scaled integers
func (p *PreciseStruct) cmp(other *PreciseStruct) int {
	pDecimals := p.Decimals.(int)
	otherDecimals := other.Decimals.(int)
	if pDecimals == otherDecimals {
		return p.integer.Cmp(other.integer)
	}
	if pDecimals > otherDecimals {
		scaled := new(big.Int).Mul(other.integer, precisePow10(int64(pDecimals-otherDecimals)))
		return p.integer.Cmp(scaled)
	}
	scaled := new(big.Int).Mul(p.integer, precisePow10(int64(otherDecimals-pDecimals)))
	return scaled.Cmp(other.integer)
}

func (p *PreciseStruct) Gt(other *PreciseStruct) bool {
	return p.cmp(other) > 0
}

func (p *PreciseStruct) Ge(other *PreciseStruct) bool {
	return p.cmp(other) >= 0
}

func (p *PreciseStruct) Lt(other *PreciseStruct) bool {
	return p.cmp(other) < 0
}

func (p *PreciseStruct) Le(other *PreciseStruct) bool {
	return p.cmp(other) <= 0
}

func (p *PreciseStruct) Abs() *PreciseStruct {
	return newPrecise(new(big.Int).Abs(p.integer), p.Decimals.(int))
}

// internal: strips trailing zero digits from the integer representation
// and returns the reduced digit string (sign included) so String() and
// ToString() avoid a second integer-to-string conversion
func (p *PreciseStruct) reduceDigits() string {
	str := p.integer.String()
	if str == "0" {
		p.Decimals = 0
		return str
	}
	i := len(str) - 1
	for ; i >= 0; i-- {
		if str[i] != '0' {
			break
		}
	}
	difference := len(str) - 1 - i
	if difference == 0 {
		return str
	}
	p.Decimals = int(ParseInt(p.Decimals) - int64(difference))
	// SetString reuses the receiver's storage instead of allocating a new big.Int
	p.integer.SetString(str[:i+1], 10)
	return str[:i+1]
}

// reduces the representation in place, returns the instance so calls can
// be chained (NewPrecise("10.00").Reduce().String())
func (p *PreciseStruct) Reduce() *PreciseStruct {
	p.reduceDigits()
	return p
}

func (p *PreciseStruct) Equals(other *PreciseStruct) bool {
	p.Reduce()
	other.Reduce()
	return p.integer.Cmp(other.integer) == 0 && p.Decimals.(int) == other.Decimals.(int)
}

// formats a reduced unsigned digit string with the given decimals count:
// decimals <= 0 appends -decimals zeros, otherwise inserts the decimal
// point (padding with a leading "0." when there are fewer digits than
// decimals)
func formatPreciseDigits(sign, digits string, intDecimals int) string {
	if intDecimals <= 0 {
		return sign + digits + strings.Repeat("0", -intDecimals)
	}
	length := len(digits)
	if length > intDecimals {
		index := length - intDecimals
		return sign + digits[:index] + "." + digits[index:]
	}
	return sign + "0." + strings.Repeat("0", intDecimals-length) + digits
}

func (p *PreciseStruct) String() string {
	digits := p.reduceDigits()
	sign := ""
	if digits[0] == '-' {
		sign = "-"
		digits = digits[1:]
	}
	intDecimals := 0
	switch v := p.Decimals.(type) {
	case int:
		intDecimals = v
	case int64:
		intDecimals = int(v) // TODO: loss of precision by converting to int, should be int64
	}
	return formatPreciseDigits(sign, digits, intDecimals)
}

func (p *PreciseStruct) ToString() string {
	digits := p.reduceDigits()
	sign := ""
	if digits[0] == '-' {
		sign = "-"
		digits = digits[1:]
	}
	intPDecimals := int(ParseInt(p.Decimals))
	if intPDecimals > 0 {
		// historical behavior of this method: pads the digits with
		// `decimals` leading zeros, then inserts the decimal point after
		// the original digit count ("123" with 2 decimals renders as
		// "001.23") — preserved because transpiled exchange code calls it
		padded := strings.Repeat("0", intPDecimals) + digits
		index := len(digits)
		return sign + padded[:index] + "." + padded[index:]
	}
	return formatPreciseDigits(sign, digits, intPDecimals)
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
	if string2Precise.integer.Sign() == 0 {
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
