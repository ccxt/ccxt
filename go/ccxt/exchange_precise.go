package ccxt

import (
	"math/big"
)

//
// Go Port of the precision object used by ccxt
//

type PreciseStruct struct {
	Decimals int
	Integer  big.Int
}

// todo: add a test for this and test it !!!

var Precise PreciseStruct // for static functions

func NewPrecise(number interface{}) *PreciseStruct {
	this := &PreciseStruct{}
	return this
}

func (this *PreciseStruct) ToString(v ...interface{}) string {

	// this.Reduce()
	// sign := ""
	// var abs big.Int
	// if this.Integer.Cmp(big.NewInt(0)) == -1 {
	// 	sign = "-"
	// 	abs.Mul(&this.Integer, big.NewInt(-1))
	// } else {
	// 	sign = ""
	// 	abs = this.Integer
	// }

	// integerArray := abs.String()
	// for i := len(integerArray); i < int(this.Decimals.ToInt()); i++ {
	// 	integerArray = "0" + integerArray
	// }
	// index := len(integerArray) - int(this.Decimals.ToInt())
	// item := ""
	// if index == 0 {
	// 	// if we are adding to the front
	// 	item = "0."
	// } else if IsTrue(OpLw(this.Decimals, MkInteger(0))) {
	// 	for i := 0; i < int(-this.Decimals.ToInt()); i++ {
	// 		item += "0"
	// 	}
	// } else if IsTrue(OpEq(this.Decimals, MkInteger(0))) {
	// 	item = ""
	// } else {
	// 	item = "."
	// }
	// integerArray = integerArray[:index] + item + integerArray[index:]
	// return MkString(sign + integerArray)
	return ""
}

func (this *PreciseStruct) Mul(other *PreciseStruct) *PreciseStruct {
	// integerResult := big.NewInt(0).Mul(&this.Integer, &other.Integer)
	return &PreciseStruct{}
}

func (this *PreciseStruct) Div(other *PreciseStruct, v ...*interface{}) *PreciseStruct {
	// precision := MkInteger(18)
	// if len(v) >= 1 {
	// 	precision = v[0]
	// }
	// distance := OpSub(precision, OpAdd(this.Decimals, other.Decimals))
	// numerator := &big.Int{}
	// if IsTrue(OpEq(distance, MkInteger(0))) {
	// 	numerator = &this.Integer
	// } else if IsTrue(OpLw(distance, MkInteger(0))) {
	// 	exponent := math.Pow(10, float64(-distance.ToInt()))
	// 	numerator = big.NewInt(0).Div(&this.Integer, big.NewInt(int64(exponent)))
	// } else {
	// 	exponent := math.Pow(10, float64(distance.ToInt()))
	// 	numerator = big.NewInt(0).Mul(&this.Integer, big.NewInt(int64(exponent)))
	// }
	// result := big.NewInt(0).Div(numerator, &other.Integer)
	return &PreciseStruct{}
}

func (this *PreciseStruct) Add(other *PreciseStruct) *PreciseStruct {
	// if IsTrue(OpEq(this.Decimals, other.Decimals)) {
	// 	integerResult := big.NewInt(0).Add(&this.Integer, &other.Integer)
	// 	return &PreciseStruct{Integer: *integerResult, Decimals: this.Decimals}
	// } else {
	// 	var smaller *PreciseStruct
	// 	var bigger *PreciseStruct
	// 	if IsTrue(OpGt(this.Decimals, other.Decimals)) {
	// 		smaller = other
	// 		bigger = this
	// 	} else {
	// 		smaller = this
	// 		bigger = other
	// 	}
	// 	exponent := OpSub(bigger.Decimals, smaller.Decimals)
	// 	normalised := big.NewInt(0).Mul(&smaller.Integer, big.NewInt(int64(math.Pow(10, float64(exponent.ToInt())))))
	// 	result := big.NewInt(0).Add(normalised, &bigger.Integer)
	return &PreciseStruct{}

}

/*func (this *PreciseStruct) Mod(other* PreciseStruct) *PreciseStruct {

	const rationizerNumerator = Math.max (-this.decimals + other.decimals, 0)
	const numerator = this.integer * (base ** BigInt (rationizerNumerator)) // pow
	const rationizerDenominator = Math.max (-other.decimals + this.decimals, 0)
	const denominator = other.integer * (base ** BigInt (rationizerDenominator))
	const result = numerator % denominator
	return new Precise (result, rationizerDenominator + other.decimals)

	return nil; // todo
}*/

func (this *PreciseStruct) Sub(other *PreciseStruct) *PreciseStruct {
	negative := &PreciseStruct{Integer: *big.NewInt(0).Mul(&other.Integer, big.NewInt(-1)), Decimals: other.Decimals}
	return this.Add(negative)
}

func (this *PreciseStruct) Abs() *PreciseStruct {
	if this.Integer.Cmp(big.NewInt(0)) == -1 {
		return &PreciseStruct{Integer: *big.NewInt(0).Mul(&this.Integer, big.NewInt(-1)), Decimals: this.Decimals}
	} else {
		return &PreciseStruct{Integer: this.Integer, Decimals: this.Decimals}
	}
}

func (this *PreciseStruct) Neg() *PreciseStruct {
	return &PreciseStruct{Integer: *big.NewInt(0).Mul(&this.Integer, big.NewInt(-1)), Decimals: this.Decimals}
}

func (this *PreciseStruct) Reduce() *PreciseStruct {
	// str := this.Integer.String()
	// start := len(str) - 1
	// if start == 0 {
	// 	if str == "0" {
	// 		this.Decimals = MkInteger(0)
	// 	}
	// 	return this
	// }
	// i := start
	// for ; i >= 0; i-- {
	// 	if str[i] != '0' {
	// 		break
	// 	}
	// }
	// difference := start - i
	// if difference == 0 {
	// 	return this
	// }
	// this.Decimals = MkInteger(int64(-difference))
	// this.Integer.SetString(str[:i+1], 10)
	return this
}

func (this *PreciseStruct) Equals(other *PreciseStruct) bool {
	// this.Reduce()
	// other.Reduce()
	// return MkBool(this.Integer.Cmp(&other.Integer) == 0 && IsTrue(OpEq(this.Decimals, other.Decimals)))
	return false
}

func (p *PreciseStruct) StringMul(v1 interface{}, v2 interface{}) string {
	//		if (v1.Type == Undefined) || (v2.Type == Undefined) {
	//			return MkUndefined()
	//		}
	//		return (NewPrecise(v1)).Mul(NewPrecise(v2)).ToString()
	//	}
	return ""
}

// func (p *PreciseStruct) StringDiv(v1 *Variant, v2 *Variant, v ...*Variant) *Variant {
// 	if (v1.Type == Undefined) || (v2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(v1)).Div(NewPrecise(v2), v...).ToString()
// }

// func (p *PreciseStruct) StringAdd(v1 *Variant, v2 *Variant) *Variant {
// 	if (v1.Type == Undefined) || (v2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(v1)).Add(NewPrecise(v2)).ToString()
// }

// func (p *PreciseStruct) StringSub(v1 *Variant, v2 *Variant) *Variant {
// 	if (v1.Type == Undefined) || (v2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(v1)).Sub(NewPrecise(v2)).ToString()
// }

// func (p *PreciseStruct) StringAbs(v1 *Variant) *Variant {
// 	if v1.Type == Undefined {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(v1)).Abs().ToString()
// }

// func (p *PreciseStruct) StringNeg(v1 *Variant) *Variant {
// 	if v1.Type == Undefined {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(v1)).Neg().ToString()
// }

// /*func (p *PreciseStruct) StringMod(v1 *Variant, v2 *Variant) *Variant {
// 	if (v1.Type == Undefined) || (v2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise (v1)).Mod (NewPrecise (v2)).ToString()
// }*/

// func (p *PreciseStruct) StringEquals(v1 *Variant, v2 *Variant) *Variant {
// 	if (v1.Type == Undefined) || (v2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(v1)).Equals(NewPrecise(v2)).ToString()
// }

// func (this *ExchangeBase) DecimalToPrecision(goArgs ...*Variant) *Variant {
// 	x := GoGetArg(goArgs, 0, MkUndefined())
// 	roundingMode := GoGetArg(goArgs, 1, MkUndefined())
// 	numPrecisionDigits := GoGetArg(goArgs, 2, MkUndefined())
// 	countingMode := GoGetArg(goArgs, 3, DECIMAL_PLACES)
// 	paddingMode := GoGetArg(goArgs, 4, NO_PADDING)

// 	if IsTrue(OpEq2(countingMode, TICK_SIZE)) {
// 		if IsTrue(OpLwEq(numPrecisionDigits, MkInteger(0))) {
// 			panic(NewError(MkString("TICK_SIZE cant be used with negative or zero numPrecisionDigits")))
// 		}
// 	}
// 	if IsTrue(OpLw(numPrecisionDigits, MkInteger(0))) {
// 		toNearest := Math.Pow(MkInteger(10), OpNeg(numPrecisionDigits))
// 		if IsTrue(OpEq2(roundingMode, ROUND)) {
// 			return OpMulti(toNearest, this.DecimalToPrecision(OpDiv(x, toNearest), roundingMode, MkInteger(0), countingMode, paddingMode)).ToString()
// 		}
// 		if IsTrue(OpEq2(roundingMode, TRUNCATE)) {
// 			return OpSub(x, OpMod(x, toNearest)).ToString()
// 		}
// 	}

// 	/*  handle tick size */
// 	if IsTrue(OpEq2(countingMode, TICK_SIZE)) {
// 		precisionDigitsString := this.DecimalToPrecision(numPrecisionDigits, ROUND, MkInteger(22), DECIMAL_PLACES, NO_PADDING)
// 		newNumPrecisionDigits := this.PrecisionFromString(precisionDigitsString)
// 		missing := OpMod(x, numPrecisionDigits)
// 		missing = parseFloat(this.DecimalToPrecision(missing, ROUND, MkInteger(8), DECIMAL_PLACES, NO_PADDING))
// 		fpError := this.DecimalToPrecision(OpDiv(missing, numPrecisionDigits), ROUND, Math.Max(newNumPrecisionDigits, MkInteger(8)), DECIMAL_PLACES, NO_PADDING)
// 		if IsTrue(OpNotEq2(this.PrecisionFromString(fpError), MkInteger(0))) {
// 			if IsTrue(OpEq2(roundingMode, ROUND)) {
// 				if IsTrue(OpGt(x, MkInteger(0))) {
// 					if IsTrue(OpGtEq(missing, OpDiv(numPrecisionDigits, MkInteger(2)))) {
// 						x = OpSub(x, OpAdd(missing, numPrecisionDigits))
// 					} else {
// 						x = OpSub(x, missing)
// 					}
// 				} else {
// 					if IsTrue(OpGtEq(missing, OpDiv(numPrecisionDigits, MkInteger(2)))) {
// 						x = OpSub(parseFloat(x), missing)
// 					} else {
// 						x = OpSub(parseFloat(x), OpSub(missing, numPrecisionDigits))
// 					}
// 				}
// 			} else {
// 				if IsTrue(OpEq2(roundingMode, TRUNCATE)) {
// 					x = OpSub(x, missing)
// 				}
// 			}
// 		}
// 		return this.DecimalToPrecision(x, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, paddingMode)
// 	}

// 	/*  Convert to a string (if needed), skip leading minus sign (if any)   */
// 	str := this.NumberToString(x)
// 	isNegative := OpEq2(*(str).At(MkInteger(0)), MkString("-"))
// 	strStart := OpTrinary(isNegative, MkInteger(1), MkInteger(0))
// 	strEnd := OpCopy(str.Length)

// 	/*  Find the dot position in the source buffer   */
// 	strDot := MkInteger(0)
// 	for ; IsTrue(OpLw(strDot, strEnd)); OpIncr(&strDot) {
// 		if IsTrue(OpEq2(*(str).At(strDot), MkString("."))) {
// 			break
// 		}
// 	}
// 	hasDot := OpLw(strDot, str.Length)

// 	/*  Char code constants         */
// 	MINUS := MkInteger(45)
// 	DOT := MkInteger(46)
// 	ZERO := MkInteger(48)
// 	ONE := OpAdd(ZERO, MkInteger(1))
// 	FIVE := OpAdd(ZERO, MkInteger(5))
// 	NINE := OpAdd(ZERO, MkInteger(9))

// 	/*  For -123.4567 the `chars` array will hold 01234567 (leading zero is reserved for rounding cases when 099 ? 100)    */
// 	chars_len := OpAdd(OpSub(strEnd, strStart), OpTrinary(hasDot, MkInteger(0), MkInteger(1)))
// 	chars := make([]byte, chars_len.ToInt())
// 	chars[0] = byte(ZERO.ToInt())

// 	/*  Validate & copy digits, determine certain locations in the resulting buffer  */
// 	afterDot := OpCopy(chars_len)
// 	digitsStart := OpNeg(MkInteger(1))
// 	digitsEnd := OpNeg(MkInteger(1))

// 	i := MkInteger(1)
// 	j := OpCopy(strStart)
// 	for IsTrue(OpLw(j, strEnd)) {
// 		c := MkInteger(int64(str.ToStr()[j.ToInt()]))
// 		if IsTrue(OpEq2(c, DOT)) {
// 			afterDot = OpDecr(&i)
// 		} else {
// 			if IsTrue(OpOr(OpLw(c, ZERO), OpGt(c, NINE))) {
// 				panic(NewError(MkString("${str}: invalid number (contains an illegal character '${str[i - 1]}')")))
// 			} else {
// 				chars[i.ToInt()] = byte(c.ToInt())
// 				if IsTrue(OpAnd(OpNotEq2(c, ZERO), OpLw(digitsStart, MkInteger(0)))) {
// 					digitsStart = OpCopy(i)
// 				}
// 			}
// 		}
// 		OpIncr(&j)
// 		OpIncr(&i)
// 	}

// 	if IsTrue(OpLw(digitsStart, MkInteger(0))) {
// 		digitsStart = MkInteger(1)
// 	}

// 	/*  Determine the range to cut  */
// 	precisionStart := OpTrinary(OpEq2(countingMode, DECIMAL_PLACES), afterDot, digitsStart)
// 	precisionEnd := OpAdd(precisionStart, numPrecisionDigits)

// 	/*  Reset the last significant digit index, as it will change during the rounding/truncation.   */
// 	digitsEnd = OpNeg(MkInteger(1))

// 	/*  Perform rounding/truncation per digit, from digitsEnd to digitsStart, by using the following
// 	    algorithm (rounding 999 ? 1000, as an example):

// 	        step  =          i=3      i=2      i=1      i=0

// 	        chars =         0999     0999     0900     1000
// 	        memo  =         ---0     --1-     -1--     0---                     */
// 	allZeros := OpCopy(MkBool(true))
// 	signNeeded := OpCopy(isNegative)

// 	i = OpSub(chars_len, MkInteger(1))
// 	_ = i
// 	memo := MkInteger(0)
// 	for ; IsTrue(OpGtEq(i, MkInteger(0))); OpDecr(&i) {

// 		c := MkInteger(int64(chars[i.ToInt()]))
// 		_ = c

// 		if IsTrue(OpNotEq2(i, MkInteger(0))) {
// 			OpAddAssign(&c, memo)
// 			if IsTrue(OpGtEq(i, OpAdd(precisionStart, numPrecisionDigits))) {
// 				ceil := OpAnd(OpEq2(roundingMode, ROUND), OpAnd(OpGtEq(c, FIVE), OpNot(OpAnd(OpEq2(c, FIVE), memo))))
// 				_ = ceil
// 				c = OpTrinary(ceil, OpAdd(NINE, MkInteger(1)), ZERO)
// 			}
// 			if IsTrue(OpGt(c, NINE)) {
// 				c = OpCopy(ZERO)
// 				memo = MkInteger(1)
// 			} else {
// 				memo = MkInteger(0)
// 			}
// 		} else {
// 			if IsTrue(memo) {
// 				c = OpCopy(ONE)
// 			}
// 		}

// 		chars[i.ToInt()] = byte(c.ToInt())

// 		if IsTrue(OpNotEq2(c, ZERO)) {
// 			allZeros = OpCopy(MkBool(false))
// 			digitsStart = OpCopy(i)
// 			digitsEnd = OpTrinary(OpLw(digitsEnd, MkInteger(0)), OpAdd(i, MkInteger(1)), digitsEnd)
// 		}
// 	}

// 	/*  Update the precision range, as `digitsStart` may have changed... & the need for a negative sign if it is only 0    */
// 	if IsTrue(OpEq2(countingMode, SIGNIFICANT_DIGITS)) {
// 		precisionStart = OpCopy(digitsStart)
// 		precisionEnd = OpAdd(precisionStart, numPrecisionDigits)
// 	}
// 	if IsTrue(allZeros) {
// 		signNeeded = OpCopy(MkBool(false))
// 	}

// 	/*  Determine the input character range     */
// 	readStart := OpTrinary(OpOr(OpGtEq(digitsStart, afterDot), allZeros), OpSub(afterDot, MkInteger(1)), digitsStart)
// 	readEnd := OpTrinary(OpLw(digitsEnd, afterDot), afterDot, digitsEnd)

// 	/*  Compute various sub-ranges       */
// 	nSign := OpTrinary(signNeeded, MkInteger(1), MkInteger(0))
// 	nBeforeDot := OpAdd(nSign, OpSub(afterDot, readStart))
// 	nAfterDot := Math.Max(OpSub(readEnd, afterDot), MkInteger(0))
// 	actualLength := OpSub(readEnd, readStart)
// 	desiredLength := OpTrinary(OpEq2(paddingMode, NO_PADDING), actualLength, OpSub(precisionEnd, readStart))
// 	pad := Math.Max(OpSub(desiredLength, actualLength), MkInteger(0))
// 	padStart := OpAdd(nBeforeDot, OpAdd(MkInteger(1), nAfterDot))
// 	padEnd := OpAdd(padStart, pad)
// 	isInteger := OpEq2(OpAdd(nAfterDot, pad), MkInteger(0))

// 	/*  Fill the output buffer with characters    */
// 	out_len := OpAdd(nBeforeDot, OpAdd(OpTrinary(isInteger, MkInteger(0), MkInteger(1)), OpAdd(nAfterDot, pad)))
// 	out := make([]byte, out_len.ToInt())

// 	if IsTrue(signNeeded) {
// 		out[0] = byte(MINUS.ToInt())
// 	}
// 	i = OpCopy(nSign)
// 	j = OpCopy(readStart)
// 	for IsTrue(OpLw(i, nBeforeDot)) {
// 		out[i.ToInt()] = chars[j.ToInt()]
// 		OpIncr(&i)
// 		OpIncr(&j)
// 	}
// 	if IsTrue(OpNot(isInteger)) {
// 		out[nBeforeDot.ToInt()] = byte(DOT.ToInt())
// 	}
// 	i = OpAdd(nBeforeDot, MkInteger(1))
// 	j = OpCopy(afterDot)
// 	for IsTrue(OpLw(i, padStart)) {
// 		out[i.ToInt()] = chars[j.ToInt()]
// 		OpIncr(&i)
// 		OpIncr(&j)
// 	}
// 	for i = padStart; IsTrue(OpLw(i, padEnd)); OpIncr(&i) {
// 		out[i.ToInt()] = byte(ZERO.ToInt())
// 	}

// 	/*  Build a string from the output buffer     */
// 	return MkString(string(out))
// }

// func (p *PreciseStruct) Min(other *PreciseStruct) *PreciseStruct {
// 	if IsTrue(p.Lt(other)) {
// 		return p
// 	}
// 	return other
// }

// func (p *PreciseStruct) Max(other *PreciseStruct) *PreciseStruct {
// 	if IsTrue(p.Gt(other)) {
// 		return p
// 	}
// 	return other
// }

// func (p *PreciseStruct) Gt(other *PreciseStruct) *Variant {
// 	sum := p.Sub(other)
// 	return MkBool(sum.Integer.Cmp(big.NewInt(0)) > 0)
// }

// func (p *PreciseStruct) Ge(other *PreciseStruct) *Variant {
// 	sum := p.Sub(other)
// 	return MkBool(sum.Integer.Cmp(big.NewInt(0)) >= 0)
// }

// func (p *PreciseStruct) Lt(other *PreciseStruct) *Variant {
// 	return other.Gt(p)
// }

// func (p *PreciseStruct) Le(other *PreciseStruct) *Variant {
// 	return other.Ge(p)
// }

// func (p *PreciseStruct) stringMin(string1 *Variant, string2 *Variant) *Variant {
// 	if (string1.Type == Undefined) || (string2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(string1)).Min(NewPrecise(string2)).ToString()
// }

// func (p *PreciseStruct) stringMax(string1 *Variant, string2 *Variant) *Variant {
// 	if (string1.Type == Undefined) || (string2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(string1)).Max(NewPrecise(string2)).ToString()
// }

// func (p *PreciseStruct) StringGt(string1 *Variant, string2 *Variant) *Variant {
// 	if (string1.Type == Undefined) || (string2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(string1)).Gt(NewPrecise(string2))
// }

// func (p *PreciseStruct) StringGe(string1 *Variant, string2 *Variant) *Variant {
// 	if (string1.Type == Undefined) || (string2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(string1)).Ge(NewPrecise(string2))
// }

// func (p *PreciseStruct) StringLt(string1 *Variant, string2 *Variant) *Variant {
// 	if (string1.Type == Undefined) || (string2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(string1)).Lt(NewPrecise(string2))
// }

// func (p *PreciseStruct) StringLe(string1 *Variant, string2 *Variant) *Variant {
// 	if (string1.Type == Undefined) || (string2.Type == Undefined) {
// 		return MkUndefined()
// 	}
// 	return (NewPrecise(string1)).Le(NewPrecise(string2))
// }
