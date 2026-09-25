package ccxt

// HandleMarketTypeAndParams is ts/src/base/Exchange.ts handleMarketTypeAndParams with its
// [string, Dict] tuple spelled as two Go results (the transpiled copy is dropped).
func (this *BaseExchange) HandleMarketTypeAndParams(methodName any, optionalArgs ...any) (*string, map[string]any) {
	market := GetArgMap(optionalArgs, 0, nil)
	params := GetArgMap(optionalArgs, 1, map[string]any{})
	defaultValue := GetArg(optionalArgs, 2, nil)
	// type from param
	if typeVar := this.SafeString2(params, "defaultType", "type"); typeVar != nil {
		return typeVar, MapTyped(this.Omit(params, []any{"defaultType", "type"}))
	}
	// type from market
	if market != nil {
		return SafeStringPtr(GetValue(market, "type")), params
	}
	// type from default-argument
	if !IsEqual(defaultValue, nil) {
		return SafeStringPtr(defaultValue), params
	}
	methodOptions := this.SafeDict(this.Options, methodName)
	if !IsEqual(methodOptions, nil) {
		if IsString(methodOptions) {
			return SafeStringPtr(methodOptions), params
		}
		if typeFromMethod := this.SafeString2(methodOptions, "defaultType", "type"); typeFromMethod != nil {
			return typeFromMethod, params
		}
	}
	return this.SafeString2(this.Options, "defaultType", "type", "spot"), params
}

// HandleSubTypeAndParams is ts/src/base/Exchange.ts handleSubTypeAndParams with its
// [SubType, Dict] tuple spelled as two Go results (the transpiled copy is dropped).
func (this *BaseExchange) HandleSubTypeAndParams(methodName any, optionalArgs ...any) (*string, map[string]any) {
	market := GetArg(optionalArgs, 0, nil)
	params := GetArgMap(optionalArgs, 1, map[string]any{})
	defaultValue := GetArg(optionalArgs, 2, nil)
	var subType *string = nil
	// if set in params, it takes precedence
	if subTypeInParams := this.SafeString2(params, "subType", "defaultSubType"); subTypeInParams != nil {
		if (*subTypeInParams == "linear") || (*subTypeInParams == "inverse") {
			subType = subTypeInParams
		}
		return subType, MapTyped(this.Omit(params, []any{"subType", "defaultSubType"}))
	}
	// at first, check from market object
	if market != nil {
		if GetValue(market, "linear") == true {
			subType = SafeStringPtr("linear")
		} else if GetValue(market, "inverse") == true {
			subType = SafeStringPtr("inverse")
		}
	}
	// if it was not defined in market object
	if subType == nil {
		values := this.HandleOptionAndParams(map[string]any{}, methodName, "subType", defaultValue)
		subType = this.CheckOptionString(methodName, "subType", GetValue(values, 0))
	}
	return subType, params
}

// TupleSlice boxes a (value, params) result pair into the [ value, params ] list a
// non-destructuring TS use of the tuple reads (element access, a kept tuple local).
func TupleSlice(value *string, params map[string]any) []any {
	return []any{value, params}
}

// HandleOptionStringAndParams is handleOptionAndParams read as a string: a present option
// of another type panics (CheckOptionString); the transpiled copy is dropped.
func (this *BaseExchange) HandleOptionStringAndParams(params any, methodName any, optionName any, optionalArgs ...any) (*string, map[string]any) {
	defaultValue := GetArgStringPtr(optionalArgs, 0, nil)
	values := this.HandleOptionAndParams(params, methodName, optionName, defaultValue)
	return this.CheckOptionString(methodName, optionName, GetValue(values, 0)), MapTyped(GetValue(values, 1))
}

