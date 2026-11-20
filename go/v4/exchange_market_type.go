package ccxt

// HandleMarketTypeAndParams is ts/src/base/Exchange.ts handleMarketTypeAndParams with its
// [string, Dict] tuple spelled as two Go results (the transpiled copy is dropped).
func (this *BaseExchange) HandleMarketTypeAndParams(methodName any, optionalArgs ...any) (*string, map[string]any) {
	market := GetArgMap(optionalArgs, 0, nil)
	params := GetArgMap(optionalArgs, 1, map[string]any{})
	defaultValue := GetArg(optionalArgs, 2, nil)
	// type from param
	if typeVar := this.SafeString2(params, "defaultType", "type"); typeVar != nil {
		return typeVar, this.OmitDict(params, []any{"defaultType", "type"})
	}
	// type from market
	if market != nil {
		return SafeStringPtr(market["type"]), params
	}
	// type from default-argument
	if derefScalar(defaultValue) != nil {
		return SafeStringPtr(defaultValue), params
	}
	methodOptions := this.SafeDict(this.Options, methodName)
	if derefScalar(methodOptions) != nil {
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
	market := GetArgMap(optionalArgs, 0, nil)
	params := GetArgMap(optionalArgs, 1, map[string]any{})
	defaultValue := GetArg(optionalArgs, 2, nil)
	var subType *string = nil
	// if set in params, it takes precedence
	if subTypeInParams := this.SafeString2(params, "subType", "defaultSubType"); subTypeInParams != nil {
		if (*subTypeInParams == "linear") || (*subTypeInParams == "inverse") {
			subType = subTypeInParams
		}
		return subType, this.OmitDict(params, []any{"subType", "defaultSubType"})
	}
	// at first, check from market object
	if market != nil {
		if derefScalar(market["linear"]) == true {
			linearType := "linear"
			subType = &linearType
		} else if derefScalar(market["inverse"]) == true {
			inverseType := "inverse"
			subType = &inverseType
		}
	}
	// if it was not defined in market object
	if subType == nil {
		value, _ := this.HandleOptionAndParams(map[string]any{}, methodName, "subType", defaultValue)
		subType = this.CheckOptionString(methodName, "subType", value)
	}
	return subType, params
}

// TupleSlice boxes a (value, params) result pair into the [ value, params ] list a
// non-destructuring TS use of the tuple reads (element access, a kept tuple local).
func TupleSlice[T any](value T, params map[string]any) []any {
	return []any{value, params}
}

// HandleUntilOption is handleUntilOption with its [Dict, Dict] tuple spelled as two Go
// results: request (with the until key when given) and params without until/till.
func (this *BaseExchange) HandleUntilOption(key string, request map[string]any, params any, optionalArgs ...any) (map[string]any, map[string]any) {
	multiplier := GetArg(optionalArgs, 0, 1)
	until := this.SafeInteger2(params, "until", "till")
	if until == nil {
		return request, MapTyped(params)
	}
	request[key] = this.ParseToInt(Multiply(until, multiplier))
	return request, MapTyped(this.Omit(params, []any{"until", "till"}))
}

// HandleOptionAndParams is ts/src/base/Exchange.ts handleOptionAndParams with its [any, Dict]
// tuple spelled as two Go results: the option value as GetValue reads it and the params map
// (without the option keys, or without callerMethodName); the transpiled copy is dropped.
func (this *BaseExchange) HandleOptionAndParams(params any, methodName any, optionName any, optionalArgs ...any) (any, map[string]any) {
	value, rest := this.optionAndParams(params, methodName, optionName, GetArg(optionalArgs, 0, nil))
	return value, MapTyped(rest)
}

// optionAndParams keeps params as given (a list request body passes through the Nullable twins).
func (this *BaseExchange) optionAndParams(params any, methodName any, optionName any, defaultValue any) (any, any) {
	defaultOptionName := "default" + this.Capitalize(optionName)
	if value := this.SafeValue2(params, optionName, defaultOptionName); value != nil {
		return derefScalar(value), this.Omit(params, []any{optionName, defaultOptionName})
	}
	callerMethodName := this.SafeString(params, "callerMethodName", methodName)
	paramsCallerMethodName := params
	if callerMethodName != nil {
		paramsCallerMethodName = this.Omit(params, "callerMethodName")
	}
	value := this.SafeValue2(this.SafeValue(this.Options, callerMethodName), optionName, defaultOptionName)
	if IsEqual(value, nil) {
		value = this.SafeValue2(this.Options, optionName, defaultOptionName)
	}
	if IsEqual(value, nil) {
		value = defaultValue
	}
	return derefScalar(value), paramsCallerMethodName
}

// HandleOptionAndParams2 is HandleOptionAndParams over two option names.
func (this *BaseExchange) HandleOptionAndParams2(params any, methodName1 any, optionName1 any, optionName2 any, optionalArgs ...any) (any, map[string]any) {
	value, rest := this.optionAndParams2(params, methodName1, optionName1, optionName2, GetArg(optionalArgs, 0, nil))
	return value, MapTyped(rest)
}

func (this *BaseExchange) optionAndParams2(params any, methodName1 any, optionName1 any, optionName2 any, defaultValue any) (any, any) {
	value, paramsOption1 := this.optionAndParams(params, methodName1, optionName1, nil)
	if value != nil {
		return value, this.Omit(paramsOption1, optionName2)
	}
	return this.optionAndParams(paramsOption1, methodName1, optionName2, defaultValue)
}

// HandleOptionStringAndParams is handleOptionAndParams read as a string: a present option
// of another type panics (CheckOptionString); the transpiled copy is dropped.
func (this *BaseExchange) HandleOptionStringAndParams(params any, methodName any, optionName any, optionalArgs ...any) (*string, map[string]any) {
	defaultValue := GetArgStringPtr(optionalArgs, 0, nil)
	value, newParams := this.HandleOptionAndParams(params, methodName, optionName, defaultValue)
	return this.CheckOptionString(methodName, optionName, value), newParams
}

// HandleMarginModeAndParams reads the marginMode option as a string (a present option of
// another type panics in HandleOptionStringAndParams); the transpiled copy is dropped.
func (this *BaseExchange) HandleMarginModeAndParams(methodName any, optionalArgs ...any) (*string, map[string]any) {
	params := GetArgMap(optionalArgs, 0, map[string]any{})
	defaultValue := GetArgStringPtr(optionalArgs, 1, nil)
	return this.HandleOptionStringAndParams(params, methodName, "marginMode", defaultValue)
}

// HandleOptionBoolAndParams is the `defaultValue: boolean` overload: the option read as a bool
// (another type panics in CheckOptionBool), so the result is never absent.
func (this *BaseExchange) HandleOptionBoolAndParams(params any, methodName any, optionName any, defaultValue bool) (bool, map[string]any) {
	value, newParams := this.HandleOptionAndParams(params, methodName, optionName, defaultValue)
	return *this.CheckOptionBool(methodName, optionName, value), newParams
}

// HandleOptionBoolAndParamsNullable is the `defaultValue?: Bool` overload: the *bool is nil when absent.
func (this *BaseExchange) HandleOptionBoolAndParamsNullable(params any, methodName any, optionName any, optionalArgs ...any) (*bool, map[string]any) {
	defaultValue := GetArgBoolPtr(optionalArgs, 0, nil)
	value, newParams := this.HandleOptionAndParams(params, methodName, optionName, defaultValue)
	return this.CheckOptionBool(methodName, optionName, value), newParams
}

// HandleOptionBoolAndParams2 is HandleOptionBoolAndParams over two option names.
func (this *BaseExchange) HandleOptionBoolAndParams2(params any, methodName any, optionName1 any, optionName2 any, defaultValue bool) (bool, map[string]any) {
	value, newParams := this.HandleOptionAndParams2(params, methodName, optionName1, optionName2, defaultValue)
	return *this.CheckOptionBool(methodName, optionName1, value), newParams
}

// HandleOptionBoolAndParams2Nullable is HandleOptionBoolAndParamsNullable over two option names.
func (this *BaseExchange) HandleOptionBoolAndParams2Nullable(params any, methodName any, optionName1 any, optionName2 any, optionalArgs ...any) (*bool, map[string]any) {
	defaultValue := GetArgBoolPtr(optionalArgs, 0, nil)
	value, newParams := this.HandleOptionAndParams2(params, methodName, optionName1, optionName2, defaultValue)
	return this.CheckOptionBool(methodName, optionName1, value), newParams
}

// MarketCodes is ts/src/base/Exchange.ts marketCodes with its Strings result typed:
// absent input answers a nil slice, every element is the common currency code.
func (this *BaseExchange) MarketCodes(optionalArgs ...any) []any {
	codes := GetArgStringSlice(optionalArgs, 0, nil)
	if codes == nil {
		return nil
	}
	var result []any = []any{}
	for _, code := range codes {
		result = append(result, *this.CommonCurrencyCode(&code))
	}
	return result
}

// MarketSymbols is ts/src/base/Exchange.ts marketSymbols with its string[] result typed:
// absent input answers a nil slice, every element is the resolved market's symbol.
func (this *BaseExchange) MarketSymbols(optionalArgs ...any) []string {
	symbols := GetArgStringSlice(optionalArgs, 0, nil)
	typeVar := GetArgStringPtr(optionalArgs, 1, nil)
	allowEmpty := GetArgBool(optionalArgs, 2, true)
	sameTypeOnly := GetArgBool(optionalArgs, 3, false)
	sameSubTypeOnly := GetArgBool(optionalArgs, 4, false)
	if len(symbols) == 0 {
		if !allowEmpty {
			panic(ArgumentsRequired(this.Id + " empty list of symbols is not supported"))
		}
		return symbols
	}
	result := make([]string, 0, len(symbols))
	var marketType *string = nil
	var isLinearSubType *bool = nil
	for _, symbolIn := range symbols {
		market := this.DerivedExchange.Market(symbolIn)
		PanicOnError(market)
		if sameTypeOnly && (marketType != nil) {
			if derefScalar(market["type"]) != any(*marketType) {
				panic(BadRequest(Add(Add(this.Id+" symbols must be of the same type, either "+*marketType+" or ", market["type"]), ".")))
			}
		}
		if sameSubTypeOnly && (isLinearSubType != nil) {
			if derefScalar(market["linear"]) != any(*isLinearSubType) {
				panic(BadRequest(this.Id + " symbols must be of the same subType, either linear or inverse."))
			}
		}
		if (typeVar != nil) && derefScalar(market["type"]) != any(*typeVar) {
			panic(BadRequest(this.Id + " symbols must be of the same type " + *typeVar + ". If the type is incorrect you can change it in options or the params of the request"))
		}
		marketType = this.SafeString(market, "type")
		if derefScalar(market["spot"]) != true {
			isLinearSubType = this.SafeBool(market, "linear")
		}
		result = append(result, *this.SafeString(market, "symbol", symbolIn))
	}
	return result
}

// MarketIds is ts/src/base/Exchange.ts marketIds with its string[] result typed:
// absent input answers a nil slice, every element is the resolved market id (absent ids skipped).
func (this *BaseExchange) MarketIds(optionalArgs ...any) []string {
	symbols := GetArgStringSlice(optionalArgs, 0, nil)
	if symbols == nil {
		return nil
	}
	result := make([]string, 0, len(symbols))
	for _, symbol := range symbols {
		if id, isStr := derefScalar(this.MarketId(symbol)).(string); isStr {
			result = append(result, id)
		}
	}
	return result
}

// HandleMaxEntriesPerRequestAndParams: the option wins, then the argument, then 1000; slot 0 is
// the integer (nil only when CheckOptionInteger answers nil), slot 1 the params left over.
func (this *BaseExchange) HandleMaxEntriesPerRequestAndParams(method any, optionalArgs ...any) (any, map[string]any) {
	maxEntriesPerRequest := GetArgInt64Ptr(optionalArgs, 0, nil)
	params := GetArgMap(optionalArgs, 1, map[string]any{})
	var defaultValue int64 = 1000
	if maxEntriesPerRequest != nil {
		defaultValue = *maxEntriesPerRequest
	}
	value, rest := this.HandleOptionAndParams(params, method, "maxEntriesPerRequest", defaultValue)
	if resolved := this.CheckOptionInteger(method, "maxEntriesPerRequest", value); resolved != nil {
		return *resolved, rest
	}
	return nil, rest
}

// HandleOptionIntegerAndParams is the `defaultValue: number` overload: the option read as an integer
// (another type panics in CheckOptionInteger), so the result is never absent.
func (this *BaseExchange) HandleOptionIntegerAndParams(params any, methodName any, optionName any, defaultValue int64) (int64, map[string]any) {
	value, newParams := this.HandleOptionAndParams(params, methodName, optionName, defaultValue)
	return *this.CheckOptionInteger(methodName, optionName, value), newParams
}

// HandleOptionIntegerAndParamsNullable is the `defaultValue?: Int` overload: element 0 is a *int64, nil when absent.
func (this *BaseExchange) HandleOptionIntegerAndParamsNullable(params any, methodName any, optionName any, optionalArgs ...any) []any {
	defaultValue := GetArgInt64Ptr(optionalArgs, 0, nil)
	value, newParams := this.optionAndParams(params, methodName, optionName, defaultValue)
	return []any{this.CheckOptionInteger(methodName, optionName, value), newParams}
}

// HandleOptionIntegerAndParams2 is HandleOptionIntegerAndParams over two option names.
func (this *BaseExchange) HandleOptionIntegerAndParams2(params any, methodName any, optionName1 any, optionName2 any, defaultValue int64) (int64, map[string]any) {
	value, newParams := this.HandleOptionAndParams2(params, methodName, optionName1, optionName2, defaultValue)
	return *this.CheckOptionInteger(methodName, optionName1, value), newParams
}

// HandleOptionIntegerAndParams2Nullable is HandleOptionIntegerAndParamsNullable over two option names.
func (this *BaseExchange) HandleOptionIntegerAndParams2Nullable(params any, methodName any, optionName1 any, optionName2 any, optionalArgs ...any) []any {
	defaultValue := GetArgInt64Ptr(optionalArgs, 0, nil)
	value, newParams := this.optionAndParams2(params, methodName, optionName1, optionName2, defaultValue)
	return []any{this.CheckOptionInteger(methodName, optionName1, value), newParams}
}

// HandleOptionStringAndParams2 is HandleOptionStringAndParams over two option names.
func (this *BaseExchange) HandleOptionStringAndParams2(params any, methodName any, optionName1 any, optionName2 any, optionalArgs ...any) (*string, map[string]any) {
	defaultValue := GetArgStringPtr(optionalArgs, 0, nil)
	value, newParams := this.HandleOptionAndParams2(params, methodName, optionName1, optionName2, defaultValue)
	return this.CheckOptionString(methodName, optionName1, value), newParams
}

// HandleTriggerPricesAndParams is handleTriggerPricesAndParams with its [Str, Str, Str, Dict]
// tuple spelled as four Go results (the transpiled copy is dropped).
func (this *BaseExchange) HandleTriggerPricesAndParams(symbol any, params map[string]any, optionalArgs ...any) (*string, *string, *string, map[string]any) {
	omitParams := GetArgBool(optionalArgs, 0, true)
	keysToOmit := []any{}
	var prices [3]*string
	for i, keys := range [][]any{{"triggerPrice", "stopPrice"}, {"stopLossPrice"}, {"takeProfitPrice"}} {
		var price *string
		if len(keys) == 2 {
			price = this.SafeString2(params, keys[0], keys[1])
		} else {
			price = this.SafeString(params, keys[0])
		}
		if price == nil {
			continue
		}
		if omitParams {
			keysToOmit = append(keysToOmit, keys...)
		}
		prices[i] = this.PriceToPrecision(symbol, ParseFloat(price))
	}
	if len(keysToOmit) > 0 {
		return prices[0], prices[1], prices[2], this.OmitDict(params, keysToOmit)
	}
	return prices[0], prices[1], prices[2], params
}
