package ccxt

func (this *Exchange) SafeString(v interface{}, key interface{}, a ...interface{}) string {
	return this.SafeString2(v, key, nil, a...)
}

func (this *Exchange) SafeString2(v interface{}, key1 interface{}, key2 interface{}, a ...interface{}) string {
	val := v.GetRef(key1)
	if val == nil || (*val).Type == Undefined && key2 != nil {
		val = v.GetRef(key2)
	}
	if val != nil && (*val).Type != Undefined {
		return (*val).ToString()
	}
	if len(a) >= 1 {
		return OpCopy(a[0])
	}
	return MkUndefined()
}

func (this *Exchange) SafeStringLower(v interface{}, key interface{}, a ...interface{}) interface{} {
	return this.SafeStringLower2(v, key, nil, a...)
}

func (this *Exchange) SafeStringLower2(v interface{}, key1 interface{}, key2 interface{}, a ...interface{}) interface{} {
	val := v.GetRef(key1)
	if val == nil || (*val).Type == Undefined && key2 != nil {
		val = v.GetRef(key2)
	}
	if val != nil && (*val).Type != Undefined {
		return (*val).ToLowerCase()
	}
	if len(a) >= 1 {
		return OpCopy(a[0])
	}
	return MkUndefined()
}

func (this *Exchange) SafeStringUpper(v interface{}, key interface{}, a ...interface{}) interface{} {
	return this.SafeStringUpper2(v, key, nil, a...)
}

func (this *Exchange) SafeStringUpper2(v interface{}, key1 interface{}, key2 interface{}, a ...interface{}) interface{} {
	val := v.GetRef(key1)
	if val == nil || (*val).Type == Undefined && key2 != nil {
		val = v.GetRef(key2)
	}
	if val != nil && (*val).Type != Undefined {
		return (*val).ToUpperCase()
	}
	if len(a) >= 1 {
		return OpCopy(a[0])
	}
	return MkUndefined()
}

func (this *Exchange) SafeInteger(v interface{}, key interface{}, a ...interface{}) interface{} {
	return this.SafeInteger2(v, key, nil, a...)
}

func (this *Exchange) SafeInteger2(v interface{}, key1 interface{}, key2 interface{}, a ...interface{}) interface{} {
	val := v.GetRef(key1)
	if val == nil || (*val).Type == Undefined && key2 != nil {
		val = v.GetRef(key2)
	}
	if val != nil && (*val).Type != Undefined {
		i, err := (*val).ToSafeInt()
		if err == nil {
			return MkInteger(i)
		}
	}
	if len(a) >= 1 {
		return OpCopy(a[0])
	}
	return MkUndefined()
}

func (this *Exchange) SafeNumber(v interface{}, key interface{}, a ...interface{}) interface{} {
	return this.SafeNumber2(v, key, nil, a...)
}

func (this *Exchange) SafeNumber2(v interface{}, key1 interface{}, key2 interface{}, a ...interface{}) interface{} {
	val := v.GetRef(key1)
	if val == nil || (*val).Type == Undefined && key2 != nil {
		val = v.GetRef(key2)
	}
	if val != nil && (*val).Type != Undefined {
		f, err := (*val).ToSafeFloat()
		if err == nil {
			return MkNumber(f)
		}
	}
	if len(a) >= 1 {
		return OpCopy(a[0])
	}
	return MkUndefined()
}

func (this *Exchange) ParseNumber(v interface{}, a ...interface{}) interface{} {
	f, err := (*v).ToSafeFloat()
	if err == nil {
		return MkNumber(f)
	}
	if len(a) >= 1 {
		return OpCopy(a[0])
	}
	return MkUndefined()
}

func (this *Exchange) ParseSafeNumber(goArgs ...interface{}) interface{} {
	// transpiled function
	value := GoGetArg(goArgs, 0, MkUndefined())
	if IsTrue(OpEq2(value, MkUndefined())) {
		return value
	}
	value = value.Replace(MkString(","), MkString(""))
	parts := value.Split(MkString(" "))
	return this.SafeNumber(parts, MkInteger(0))
}

func (this *Exchange) SafeFloat(v interface{}, key interface{}, a ...interface{}) interface{} {
	return this.SafeNumber(v, key, a...)
}

func (this *Exchange) SafeFloat2(v interface{}, key1 interface{}, key2 interface{}, a ...interface{}) interface{} {
	return this.SafeNumber2(v, key1, key2, a...)
}

func (this *Exchange) SafeValue(v interface{}, key interface{}, a ...interface{}) interface{} {
	return this.SafeValue2(v, key, nil, a...)
}

func (this *Exchange) SafeValue2(v interface{}, key1 interface{}, key2 interface{}, a ...interface{}) interface{} {
	val := v.GetRef(key1)
	if val == nil || (*val).Type == Undefined && key2 != nil {
		val = v.GetRef(key2)
	}
	if val != nil && (*val).Type != Undefined {
		return *val
	}
	if len(a) >= 1 {
		return OpCopy(a[0])
	}
	return MkUndefined()
}

func (this *Exchange) SafeTimestamp(v interface{}, key interface{}, a ...interface{}) interface{} {
	return this.SafeTimestamp2(v, key, nil, a...)
}

func (this *Exchange) SafeTimestamp2(v interface{}, key1 interface{}, key2 interface{}, a ...interface{}) interface{} {
	return this.SafeIntegerProduct2(v, key1, key2, MkInteger(1000), a...)
}

func (this *Exchange) SafeIntegerProduct(v interface{}, key interface{}, factor interface{}, a ...interface{}) interface{} {
	return this.SafeIntegerProduct2(v, key, nil, factor, a...)
}

func (this *Exchange) SafeIntegerProduct2(v interface{}, key1 interface{}, key2 interface{}, factor interface{}, a ...interface{}) interface{} {
	val := v.GetRef(key1)
	if val == nil && key2 != nil {
		val = v.GetRef(key2)
	}
	if val == nil || (*val).Type == Undefined {
		i, err := v.ToSafeInt()
		if err == nil {
			return MkInteger(i * factor.ToInt())
		}
	}
	if len(a) >= 1 {
		return OpCopy(a[0])
	}
	return MkUndefined()
}
