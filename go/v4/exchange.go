package ccxt

import (
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	neturl "net/url"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Exchange struct {
	MarketsMutex *sync.Mutex
	// cachedCurrenciesMutex  sync.Mutex
	loadMu                 sync.Mutex
	marketsLoading         bool
	marketsLoaded          bool
	loadMarketsSubscribers []chan interface{}
	Itf                    interface{}
	DerivedExchange        IDerivedExchange
	methodCache            sync.Map
	cacheLoaded            bool
	Version                string
	Id                     string
	Name                   string
	Options                *sync.Map
	Has                    map[string]interface{}
	Api                    map[string]interface{}
	TransformedApi         map[string]interface{}
	Markets                *sync.Map
	Markets_by_id          *sync.Map
	Currencies_by_id       *sync.Map
	Currencies             *sync.Map
	RequiredCredentials    map[string]interface{}
	HttpExceptions         map[string]interface{}
	MarketsById            *sync.Map
	Timeframes             map[string]interface{}
	Features               map[string]interface{}
	Exceptions             map[string]interface{}
	Precision              map[string]interface{}
	Urls                   interface{}
	UserAgents             map[string]interface{}
	Timeout                int64
	MAX_VALUE              float64
	RateLimit              float64
	TokenBucket            map[string]interface{}
	Throttler              Throttler
	NewUpdates             bool
	Alias                  bool
	Verbose                bool
	UserAgent              string
	EnableRateLimit        bool
	Url                    string
	Hostname               string
	BaseCurrencies         *sync.Map
	QuoteCurrencies        *sync.Map
	ReloadingMarkets       bool
	MarketsLoading         bool
	Symbols                []string
	Codes                  []string
	Ids                    []string
	CommonCurrencies       map[string]interface{}
	PrecisionMode          int
	Limits                 map[string]interface{}
	Fees                   map[string]interface{}
	CurrenciesById         *sync.Map
	ReduceFees             bool

	AccountsById interface{}
	Accounts     interface{}

	// timestamps
	LastRestRequestTimestamp int64
	LastRequestHeaders       interface{}
	Last_request_headers     interface{}
	Last_http_response       interface{}
	LastRequestBody          interface{}
	Last_request_body        interface{}
	Last_request_url         interface{}
	LastRequestUrl           interface{}
	Headers                  interface{}
	ReturnResponseHeaders    bool

	// type check this
	Number interface{}
	// keys
	Secret        string
	ApiKey        string
	Password      string
	Uid           string
	AccountId     string
	Token         string
	Login         string
	PrivateKey    string
	WalletAddress string

	httpClient *http.Client

	HttpProxy            interface{}
	HttpsProxy           interface{}
	Http_proxy           interface{}
	Https_proxy          interface{}
	Proxy                interface{}
	ProxyUrl             interface{}
	ProxyUrlCallback     interface{}
	Proxy_url            interface{}
	Proxy_url_callback   interface{}
	SocksProxy           interface{}
	Socks_proxy          interface{}
	SocksProxyCallback   interface{}
	Socks_proxy_callback interface{}

	HttpsProxyCallback   interface{}
	Https_proxy_callback interface{}

	HttpProxyCallback   interface{}
	Http_proxy_callback interface{}
	SocksroxyCallback   interface{}

	WsSocksProxy   string
	Ws_socks_proxy string

	WssProxy  string
	Wss_proxy string

	WsProxy  string
	Ws_proxy string

	SubstituteCommonCurrencyCodes bool

	Twofa interface{}

	// WS
	Ohlcvs     interface{}
	Trades     interface{}
	Tickers    interface{}
	Orders     interface{}
	MyTrades   interface{}
	Orderbooks interface{}
	Liquidations interface{}
	FundingRates interface{}
	Bidsasks interface{}
	TriggerOrders interface{}
	Transactions interface{}
	MyLiquidations interface{}

	PaddingMode int

	MinFundingAddressLength int
	MaxEntriesPerRequest    int

	// tests only
	FetchResponse interface{}

	IsSandboxModeEnabled bool

	// ws
	WsClients		map[string]*Client	 // one websocket client per URL
	WsClientsMu 	sync.Mutex
	Balance    		interface{}
	Positions 		interface{}
	Clients 		map[string]*WSClient
    newUpdates 		bool
    streaming 		map[string]interface{}

}

const (
	DECIMAL_PLACES     int = 2
	SIGNIFICANT_DIGITS int = 3
	TICK_SIZE          int = 4
)

const TRUNCATE int = 0

const (
	NO_PADDING        = 5
	PAD_WITH_ZERO int = 6
)

// var ROUND int = 0

func (this *Exchange) InitParent(userConfig map[string]interface{}, exchangeConfig map[string]interface{}, itf interface{}) {
	// this = &Exchange{}
	if this.Options == nil {
		this.Options = &sync.Map{} // by default sync.map is nil
	}
	if this.MarketsMutex == nil {
		this.MarketsMutex = &sync.Mutex{}
	}
	describeValues := this.Describe()
	if userConfig == nil {
		userConfig = map[string]interface{}{}
	}

	extendedProperties := this.DeepExtend(describeValues, exchangeConfig)
	extendedProperties = this.DeepExtend(extendedProperties, userConfig)
	this.Itf = itf
	// this.id = SafeString(extendedProperties, "id", "").(string)
	// this.Id = this.id333
	// this.itf = itf

	// warmup itf cache

	this.initializeProperties(extendedProperties)
	
	// Initialize WebSocket data structures
	this.Trades = make(map[string]interface{})
	this.Tickers = make(map[string]interface{})
	this.Orderbooks = make(map[string]interface{})
	this.Ohlcvs = make(map[string]interface{})
	this.Orders = make(map[string]interface{})
	this.MyTrades = make(map[string]interface{})
	this.Transactions = make(map[string]interface{})
	this.Liquidations = make(map[string]interface{})
	this.MyLiquidations = make(map[string]interface{})
	// beforeNs := time.Now().UnixNano()
	// this.WarmUpCache(this.Itf)
	// afterNs := time.Now().UnixNano()
	// fmt.Println("Warmup cache took: ", afterNs-beforeNs)

	this.AfterConstruct()

	this.transformApiNew(this.Api)
	transport := &http.Transport{}

	this.httpClient = &http.Client{
		Timeout:   30 * time.Second,
		Transport: transport,
	}

	if IsTrue(IsTrue(this.SafeBool(userConfig, "sandbox")) || IsTrue(this.SafeBool(userConfig, "testnet"))) {
		this.SetSandboxMode(true)
	}

	// fmt.Println(this.TransformedApi)
}

func (this *Exchange) Init(userConfig map[string]interface{}) {
	if this.Options == nil {
		this.Options = &sync.Map{} // by default sync.map is nil
	}

	if this.MarketsMutex == nil {
		this.MarketsMutex = &sync.Mutex{}
	}
	// to do
}

func NewExchange() IExchange {
	exchange := &Exchange{}
	exchange.Init(map[string]interface{}{})
	return exchange
}

func (this *Exchange) WarmUpCache() {
	// itf fields
	if this.cacheLoaded {
		return
	}
	this.cacheLoaded = true
	itf := this.Itf
	baseValue := reflect.ValueOf(itf)
	baseType := baseValue.Type()

	for i := 0; i < baseType.NumMethod(); i++ {
		method := baseType.Method(i)
		name := method.Name
		cacheKey := fmt.Sprintf("%s", name)

		methodValue := baseValue.MethodByName(name)
		methodType := method.Type
		numIn := methodType.NumIn()
		isVariadic := methodType.IsVariadic()

		cacheValue := map[string]interface{}{
			"method":      method,
			"methodValue": methodValue,
			"methodType":  methodType,
			"numIn":       numIn,
			"isVariadic":  isVariadic,
		}

		this.methodCache.Store(cacheKey, cacheValue)
	}
}

func (this *Exchange) InitThrottler() {
	this.Throttler = NewThrottler(this.TokenBucket)
}

/*
*
  - @method
  - @name Exchange#loadMarkets
  - @description Loads and prepares the markets for trading.
  - @param {boolean} param.reload - If true, the markets will be reloaded from the exchange.
  - @param {object} params - Additional exchange-specific parameters for the request.
  - @throws An error if the markets cannot be loaded or prepared.
*/
func (this *Exchange) LoadMarkets(params ...interface{}) <-chan interface{} {
	reload := GetArg(params, 0, false).(bool)
	this.loadMu.Lock()

	if this.marketsLoaded && !reload {
		out := make(chan interface{}, 1)
		out <- this.Markets
		close(out)
		this.loadMu.Unlock()
		return out
	}

	ch := make(chan interface{}, 1)
	this.loadMarketsSubscribers = append(this.loadMarketsSubscribers, ch)

	if !this.marketsLoading || reload {
		this.marketsLoading = true
		markets := <-this.LoadMarketsHelper(params...)
		this.marketsLoaded = true
		this.marketsLoading = false
		for _, ch := range this.loadMarketsSubscribers {
			ch <- markets
			close(ch)
		}
		this.loadMarketsSubscribers = nil
	}

	this.loadMu.Unlock()
	return ch
}

func (this *Exchange) LoadMarketsHelper(params ...interface{}) <-chan interface{} {
	ch := make(chan interface{})

	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				ch <- "panic:" + ToString(r)
			}
		}()
		reload := GetArg(params, 0, false).(bool)
		params := GetArg(params, 1, map[string]interface{}{})
		this.WarmUpCache()
		if !reload {
			if this.Markets != nil {
				if this.Markets_by_id == nil {
					// Only lock when writing
					this.MarketsMutex.Lock()
					result := this.SetMarkets(this.Markets, nil)
					this.MarketsMutex.Unlock()
					ch <- result
					return
				}
				ch <- this.Markets
				return
			}
		}

		var currencies interface{} = nil
		hasFetchCurrencies := this.Has["fetchCurrencies"]
		if IsBool(hasFetchCurrencies) && IsTrue(hasFetchCurrencies) {
			currencies = <-this.DerivedExchange.FetchCurrencies(params)
			// this.cachedCurrenciesMutex.Lock()
			// this.Options["cachedCurrencies"] = currencies
			this.Options.Store("cachedCurrencies", currencies)
			// this.cachedCurrenciesMutex.Unlock()
		}

		markets := <-this.DerivedExchange.FetchMarkets(params)
		PanicOnError(markets)

		// this.cachedCurrenciesMutex.Lock()
		// delete(this.Options, "cachedCurrencies")
		// this.Options.Del
		this.Options.Delete("cachedCurrencies")
		// this.cachedCurrenciesMutex.Unlock()

		// Lock only for writing
		this.MarketsMutex.Lock()
		result := this.SetMarkets(markets, currencies)
		this.MarketsMutex.Unlock()

		ch <- result
	}()
	return ch
}

func (this *Exchange) Throttle(cost interface{}) <-chan interface{} {
	// to do
	ch := make(chan interface{})
	go func() {
		defer close(ch)
		task := <-this.Throttler.Throttle(cost)
		ch <- task
	}()
	return ch
}

func (this *Exchange) FetchMarkets(optionalArgs ...interface{}) <-chan interface{} {
	ch := make(chan interface{})
	go func() interface{} {
		// defer close(ch)
		// markets := <-this.callInternal("fetchMarkets", optionalArgs)
		// return markets
		return this.Markets
	}()
	return ch
}

func (this *Exchange) FetchCurrencies(optionalArgs ...interface{}) <-chan interface{} {
	ch := make(chan interface{})
	go func() interface{} {
		defer close(ch)
		// markets := <-this.callInternal("fetchCurrencies", optionalArgs)
		// return markets
		return this.Currencies
	}()
	return ch
}

func (this *Exchange) Sleep(milliseconds interface{}) <-chan bool {
	var duration time.Duration

	// Type assertion to handle various types for milliseconds
	ch := make(chan bool)
	go func() interface{} {
		switch v := milliseconds.(type) {
		case int:
			duration = time.Duration(v) * time.Millisecond
		case float64:
			duration = time.Duration(v * float64(time.Millisecond))
		case time.Duration:
			// If already a time.Duration, use it directly
			duration = v
		default:
			return false
		}

		// Sleep for the specified duration
		time.Sleep(duration)
		return true
	}()
	return ch
}

func Unique(obj interface{}) []string {
	// Type assertion to check if obj is of type []string
	strList, ok := obj.([]string)
	if !ok {
		return nil
	}

	// Use a map to ensure uniqueness
	uniqueMap := make(map[string]struct{})
	var result []string

	for _, str := range strList {
		// Check if the string is already in the map
		if _, exists := uniqueMap[str]; !exists {
			uniqueMap[str] = struct{}{}
			result = append(result, str)
		}
	}

	return result
}

func (this *Exchange) Log(args ...interface{}) {
	// convert to str and print
	fmt.Println(args)
}

func (this *Exchange) callEndpoint(endpoint2 interface{}, parameters interface{}) <-chan interface{} {
	ch := make(chan interface{})

	go func() {
		defer close(ch)

		defer func() {
			if r := recover(); r != nil {
				ch <- "panic:" + ToString(r)
			}
		}()

		endpoint := endpoint2.(string)
		if val, ok := this.TransformedApi[endpoint]; ok {
			endPointData := val.(map[string]interface{})
			// endPointData := this.TransformedApi[endpoint].(map[string]interface{})
			method := endPointData["method"].(string)
			path := endPointData["path"].(string)
			api := endPointData["api"]
			var cost float64 = 1
			if valCost, ok := endPointData["cost"]; ok {
				cost = valCost.(float64)
			}
			res := <-this.Fetch2(path, api, method, parameters, map[string]interface{}{}, nil, map[string]interface{}{"cost": cost})
			PanicOnError(res)
			ch <- res
		} else {
			ch <- nil
		}
	}()
	return ch
}

func (this *Exchange) ConvertToBigInt(data interface{}) interface{} {
	return ParseInt(data)
}

func (this *Exchange) CreateSafeDictionary() *sync.Map {
	// Create a new sync.Map to hold the safe dictionary
	return &sync.Map{}
}

// error related functions

type ErrorType string

type Error struct {
	Type    ErrorType
	Message string
	Stack   string
}

func (e *Error) Error() string {
	return fmt.Sprintf("[ccxtError]::[%s]::[%s]\nStack:\n%s", e.Type, e.Message, e.Stack)
}

func NewError(errType interface{}, message ...interface{}) error {
	typeErr := ToString(errType)
	msg := ""
	stack := ""
	if len(message) > 0 {
		msg = ToString(message[0])
		if len(message) > 1 {
			stack = ToString(message[1])
		}
	}
	return &Error{Type: ErrorType(string(typeErr)), Message: msg, Stack: stack}
}

func Exception(v ...interface{}) error {
	return NewError("Exception", v...)
}

func IsError(res interface{}) bool {
	resStr, ok := res.(string)
	if ok {
		return strings.HasPrefix(resStr, "panic:")
	}
	return false
}

func CreateReturnError(res interface{}) error {
	resStr := res.(string)
	resStr = strings.ReplaceAll(resStr, "panic:", "")
	if strings.Contains(resStr, "ccxtError") {
		// resStr = strings.ReplaceAll(resStr, "ccxtError", "")
		splitted := strings.Split(resStr, "::")
		s1 := splitted[1]
		s2 := splitted[2]
		exceptionName := s1[1 : len(s1)-1]
		message := s2[1 : len(s2)-1]
		return CreateError(exceptionName, message, res)

	}
	return Exception(resStr)
}

// emd of error related functions

func ToSafeFloat(v interface{}) (float64, error) {
	switch v := v.(type) {
	case float64:
		return v, nil
	case float32:
		return float64(v), nil
	case int:
		return float64(v), nil
	case int64:
		return float64(v), nil
	case string:
		return strconv.ParseFloat(v, 64)
	default:
		return 0, errors.New("cannot convert to float")
	}
}

// json converts an object to a JSON string
func (this *Exchange) Json(object interface{}) interface{} {
	jsonBytes, err := json.Marshal(object)
	if err != nil {
		return nil
	}
	return string(jsonBytes)
}

func (this *Exchange) ParseNumber(v interface{}, a ...interface{}) interface{} {
	if (v == nil) || (v == "") {
		// return default value if exists
		if len(a) > 0 {
			return a[0]
		}
		return nil
	}
	f, err := ToSafeFloat(v)
	if err == nil {
		return f
	}
	return nil
}

func (this *Exchange) ValueIsDefined(v interface{}) bool {
	return v != nil
}

// func (this *Exchange) CreateSafeDictionary() interface{} {
// 	return map[string]interface{}{}
// }

func (this *Exchange) ConvertToSafeDictionary(data interface{}) interface{} {
	return data
}

func (this *Exchange) callDynamically(name2 interface{}, args ...interface{}) <-chan interface{} {
	return this.callInternal(name2.(string), args...)
}

// clone creates a deep copy of the input object. It supports arrays, slices, and maps.
func (this *Exchange) Clone(object interface{}) interface{} {
	return this.DeepCopy(reflect.ValueOf(object)).Interface()
}

func (this *Exchange) DeepCopy(value reflect.Value) reflect.Value {
	switch value.Kind() {
	case reflect.Array, reflect.Slice:
		// Create a new slice/array of the same type and length
		copy := reflect.MakeSlice(value.Type(), value.Len(), value.Cap())
		for i := 0; i < value.Len(); i++ {
			copy.Index(i).Set(this.DeepCopy(value.Index(i)))
		}
		return copy
	case reflect.Map:
		// Create a new map of the same type
		copy := reflect.MakeMap(value.Type())
		for _, key := range value.MapKeys() {
			copy.SetMapIndex(key, this.DeepCopy(value.MapIndex(key)))
		}
		return copy
	default:
		// For other types, just return the value
		return reflect.ValueOf(value.Interface())
	}
}

type IArrayCache interface {
	ToArray() []interface{}
}

func (this *Exchange) ArraySlice(array interface{}, first interface{}, second ...interface{}) interface{} {
	// If the incoming object implements IArrayCache convert it first.
	if cache, ok := array.(IArrayCache); ok {
		return this.ArraySlice(cache.ToArray(), first, second...)
	}

	firstInt := reflect.ValueOf(first).Convert(reflect.TypeOf(0)).Interface().(int)
	parsedArray := reflect.ValueOf(array)
	
	if parsedArray.Kind() != reflect.Slice {
		return nil
	}

	length := parsedArray.Len()

	if len(second) == 0 {
		if firstInt < 0 {
			// Negative index, slice from end
			start := length + firstInt
			if start < 0 {
				start = 0
			}
			result := parsedArray.Slice(start, length).Interface()
			return result
		} else {
			// Positive index, slice from start
			if firstInt >= length {
				return reflect.MakeSlice(parsedArray.Type(), 0, 0).Interface()
			}
			result := parsedArray.Slice(firstInt, length).Interface()
			return result
		}
	} else {
		// Both first and second parameters provided
		secondInt := reflect.ValueOf(second[0]).Convert(reflect.TypeOf(0)).Interface().(int)
		
		start := firstInt
		end := secondInt
		
		if start < 0 {
			start = length + start
		}
		if end < 0 {
			end = length + end
		}
		
		if start < 0 {
			start = 0
		}
		if end > length {
			end = length
		}
		if start > end {
			start = end
		}
		
		result := parsedArray.Slice(start, end).Interface()
		return result
	}
}

func (this *Exchange) sliceToInterface(value reflect.Value) []interface{} {
	length := value.Len()
	result := make([]interface{}, length)
	for i := 0; i < length; i++ {
		result[i] = value.Index(i).Interface()
	}
	return result
}

// Example ArrayCache implementation for testing
type exampleArrayCache struct {
	data []interface{}
}

func (e *exampleArrayCache) ToArray() []interface{} {
	return e.data
}

func (this *Exchange) ParseTimeframe(timeframe interface{}) interface{} {
	str, ok := timeframe.(string)
	if !ok {
		return nil
	}

	if len(str) < 2 {
		return nil
	}

	amount, err := strconv.Atoi(str[:len(str)-1])
	if err != nil {
		return nil
	}

	unit := str[len(str)-1:]
	scale := 0
	switch unit {
	case "y":
		scale = 60 * 60 * 24 * 365
	case "M":
		scale = 60 * 60 * 24 * 30
	case "w":
		scale = 60 * 60 * 24 * 7
	case "d":
		scale = 60 * 60 * 24
	case "h":
		scale = 60 * 60
	case "m":
		scale = 60
	case "s":
		scale = 1
	default:
		return nil
	}

	result := amount * scale
	return result
}

func Totp(secret interface{}) string {
	return ""
}

func (this *Exchange) ParseJson(input interface{}) interface{} {
	return ParseJSON(input)
}

// type Dict map[string]interface{}

func (this *Exchange) transformApiNew(api Dict, paths ...string) {
	if api == nil {
		return
	}

	if paths == nil {
		paths = []string{}
	}

	for key, value := range api {
		if isHttpMethod(key) {
			var endpoints []string
			if dictValue, ok := value.(map[string]interface{}); ok {
				for endpoint := range dictValue {
					endpoints = append(endpoints, endpoint)
				}
			} else {
				if listValue, ok := value.([]interface{}); ok {
					for _, item := range listValue {
						if s, ok := item.(string); ok {
							endpoints = append(endpoints, s)
						}
					}
				}
			}

			for _, endpoint := range endpoints {
				cost := 1.0
				if dictValue, ok := value.(map[string]interface{}); ok {
					if config, ok := dictValue[endpoint]; ok {
						if dictConfig, ok := config.(map[string]interface{}); ok {
							if rl, success := dictConfig["cost"]; success {
								if rlFloat, ok := rl.(float64); ok {
									cost = rlFloat
								} else if rlString, ok := rl.(string); ok {
									cost = parseCost(rlString)
								}
							}
						} else if config != nil {
							cost = parseCost(fmt.Sprintf("%v", config))
						}
					}
				}

				pattern := `[^a-zA-Z0-9]`
				rgx := regexp.MustCompile(pattern)
				result := rgx.Split(endpoint, -1)

				pathParts := append(paths, key)
				for _, part := range result {
					if len(part) > 0 {
						pathParts = append(pathParts, part)
					}
				}

				for i, part := range pathParts {
					pathParts[i] = strings.Title(part)
				}
				path := strings.Join(pathParts, "")
				if len(path) > 0 {
					path = strings.ToLower(string(path[0])) + path[1:]
				}

				apiObj := interface{}(paths)
				if len(paths) == 1 {
					apiObj = paths[0]
				}

				this.TransformedApi[path] = map[string]interface{}{
					"method": strings.ToUpper(key),
					"path":   endpoint,
					"api":    apiObj,
					"cost":   cost,
				}
			}
		} else {
			if nestedDict, ok := value.(map[string]interface{}); ok {
				this.transformApiNew(nestedDict, append(paths, key)...)
			}
		}
	}
}

func isHttpMethod(key string) bool {
	// Add your implementation of HTTP method check
	httpMethods := []string{"GET", "POST", "PUT", "DELETE", "PATCH"}
	for _, method := range httpMethods {
		if strings.EqualFold(method, key) {
			return true
		}
	}
	return false
}

func parseCost(costStr string) float64 {
	// Add your implementation for parsing cost
	var cost float64
	fmt.Sscanf(costStr, "%f", &cost)
	return cost
}

// func (this *Exchange) callInternal(name2 string, args ...interface{}) interface{} {
// 	name := strings.Title(strings.ToLower(name2))
// 	baseType := reflect.TypeOf(this.Itf)

// 	for i := 0; i < baseType.NumMethod(); i++ {
// 		method := baseType.Method(i)
// 		if name == method.Name {
// 			methodType := method.Type
// 			numIn := methodType.NumIn()
// 			isVariadic := methodType.IsVariadic()

// 			in := make([]reflect.Value, numIn)
// 			argCount := len(args)

// 			for k := 0; k < numIn; k++ {
// 				if k < argCount {
// 					param := args[k]
// 					if param == nil {
// 						// Get the type of the k-th parameter
// 						paramType := methodType.In(k)
// 						// Create a zero value of the parameter type (which will be `nil` for pointers, slices, maps, etc.)
// 						in[k] = reflect.Zero(paramType)
// 					} else {
// 						in[k] = reflect.ValueOf(param)
// 					}
// 				} else {
// 					paramType := methodType.In(k)
// 					in[k] = reflect.Zero(paramType)
// 				}
// 			}

// 			if isVariadic && argCount >= numIn-1 {
// 				variadicArgs := make([]reflect.Value, argCount-(numIn-1))
// 				for k := numIn - 1; k < argCount; k++ {
// 					param := args[k]
// 					if param == nil {
// 						paramType := methodType.In(numIn - 1).Elem()
// 						variadicArgs[k-(numIn-1)] = reflect.Zero(paramType)
// 					} else {
// 						variadicArgs[k-(numIn-1)] = reflect.ValueOf(param)
// 					}
// 				}
// 				in[numIn-1] = reflect.ValueOf(variadicArgs)
// 			}

// 			res := reflect.ValueOf(this.Itf).MethodByName(name).Call(in)
// 			return res[0].Interface()
// 		}
// 	}
// 	return nil
// }

func (this *Exchange) CheckRequiredDependencies() {
	// to do
}

func (this *Exchange) FixStringifiedJsonMembers(a interface{}) string {
	aStr := a.(string)
	aStr = strings.ReplaceAll(aStr, "\\", "")
	aStr = strings.ReplaceAll(aStr, "\"{", "{")
	aStr = strings.ReplaceAll(aStr, "}\"", "}")
	return aStr
}

func (this *Exchange) IsEmpty(a interface{}) bool {
	if a == nil {
		return true
	}

	v := reflect.ValueOf(a)

	switch v.Kind() {
	case reflect.String:
		return v.Len() == 0
	case reflect.Slice, reflect.Array:
		return v.Len() == 0
	case reflect.Map:
		return v.Len() == 0
	default:
		return false
	}
}

func (this *Exchange) CallInternal(name2 string, args ...interface{}) <-chan interface{} {
	return this.callInternal(name2, args...)
}

func (this *Exchange) callInternal(name2 string, args ...interface{}) <-chan interface{} {
	ch := make(chan interface{})
	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				if r != "break" {
					ch <- "panic:" + ToString(r)
				}
			}
		}()

		this.WarmUpCache()

		res := <-CallInternalMethod(&this.methodCache, this.Itf, name2, args...)
		ch <- res
	}()
	// res := <-CallInternalMethod(this.Itf, name2, args...)
	// return res
	return ch
}

func (this *Exchange) BinaryLength(binary interface{}) int {
	return this.binaryLength(binary)
}

func (this *Exchange) binaryLength(binary interface{}) int {
	var length int

	// Handle different types for the length parameter
	switch v := binary.(type) {
	case []byte:
		length = len(v)
	case string:
		length = len(v)
	default:
		panic(fmt.Sprintf("unsupported binary: %v", reflect.TypeOf(binary)))
	}

	return length
}

func (this *Exchange) RandomBytes(length interface{}) string {
	var byteLength int

	// Handle different types for the length parameter
	switch v := length.(type) {
	case int:
		byteLength = v
	case int32:
		byteLength = int(v)
	case int64:
		byteLength = int(v)
	case float32:
		byteLength = int(v)
	case float64:
		byteLength = int(v)
	default:
		panic(fmt.Sprintf("unsupported length type: %v", reflect.TypeOf(length)))
	}

	if byteLength <= 0 {
		panic("length must be greater than 0")
	}

	x := make([]byte, byteLength)
	_, err := rand.Read(x)
	if err != nil {
		panic(fmt.Sprintf("failed to generate random bytes: %v", err))
	}

	return hex.EncodeToString(x)
}

func (this *Exchange) IsJsonEncodedObject(str interface{}) bool {
	// Attempt to assert the input to a string type
	str2, ok := str.(string)
	if !ok {
		return false
	}

	// Check if the string starts with "{" or "["
	if strings.HasPrefix(str2, "{") || strings.HasPrefix(str2, "[") {
		return true
	}
	return false
}

func (this *Exchange) StringToCharsArray(value interface{}) []string {
	// Attempt to assert the input to a string type
	str, ok := value.(string)
	if !ok {
		panic(fmt.Sprintf("unsupported type: %v, expected string", reflect.TypeOf(value)))
	}

	// Initialize a slice to hold the characters
	chars := make([]string, len(str))

	// Loop through each character in the string and add it to the slice
	for i, char := range str {
		chars[i] = string(char)
	}

	return chars
}

func (this *Exchange) GetMarket(symbol string) MarketInterface {
	// market := this.Markets[symbol]
	market, ok := this.Markets.Load(symbol)
	if !ok {
		return NewMarketInterface(nil)
	}
	return NewMarketInterface(market)
}

func (this *Exchange) GetMarketsList() []MarketInterface {
	var markets []MarketInterface
	// for _, market := range this.Markets {
	// 	markets = append(markets, NewMarketInterface(market))
	// }
	this.Markets.Range(func(key, value interface{}) bool {
		markets = append(markets, NewMarketInterface(value))
		return true

	})
	return markets
}

func (this *Exchange) GetCurrency(currencyId string) Currency {
	// market := this.Currencies[currency]
	currency, ok := this.Currencies.Load(currencyId)
	if !ok {
		return NewCurrency(nil)
	}
	return NewCurrency(currency)
}

func (this *Exchange) GetCurrenciesList() []Currency {
	var currencies []Currency
	// for _, currency := range this.Currencies {
	// 	currencies = append(currencies, NewCurrency(currency))
	// }
	// }
	this.Currencies.Range(func(key, value interface{}) bool {
		currencies = append(currencies, NewCurrency(value))
		return true
	})
	return currencies
}

func (this *Exchange) SetProperty(obj interface{}, property interface{}, defaultValue interface{}) {
	// Convert property to string
	propName, ok := property.(string)
	if !ok {
		// fmt.Println("Property should be a string")
		return
	}

	// Get the reflection object for the obj
	val := reflect.ValueOf(obj).Elem()

	// Get the field by name
	field := val.FieldByName(propName)

	// Check if the field exists and is settable
	if field.IsValid() && field.CanSet() {
		// Set the field with the default value, casting it to the right type
		field.Set(reflect.ValueOf(defaultValue))
	} else {
		// fmt.Printf("Field '%s' is either invalid or cannot be set\n", propName)
	}
}

func (this *Exchange) GetProperty(obj interface{}, property interface{}) interface{} {
	// Convert property to string
	propName, ok := property.(string)
	if !ok {
		// fmt.Println("Property should be a string")
		return nil
	}

	// Get the reflection object for the obj
	val := reflect.ValueOf(obj).Elem()

	// Get the field by name
	field := val.FieldByName(propName)

	// Check if the field exists and can be accessed
	if field.IsValid() && field.CanInterface() {
		// Return the field value as an interface{}
		return field.Interface()
	} else {
		// fmt.Printf("Field '%s' is either invalid or cannot be accessed\n", propName)
		return nil
	}
}

func (this *Exchange) Unique(obj interface{}) []string {
	// Type assertion to check if obj is a slice of strings
	if list, ok := obj.([]string); ok {
		// Create a map to track unique strings
		uniqueMap := make(map[string]bool)
		var uniqueList []string

		// Iterate over the list and add only unique elements
		for _, item := range list {
			if !uniqueMap[item] {
				uniqueMap[item] = true
				uniqueList = append(uniqueList, item)
			}
		}

		return uniqueList
	}

	// If obj is not a []string, return an empty slice
	return []string{}
}

// func (this *Exchange) callInternal(name2 string, args ...interface{}) interface{} {
// 	name := strings.Title(strings.ToLower(name2))
// 	baseType := reflect.TypeOf(this.Itf)

// 	// baseValue := reflect.ValueOf(this.Itf)
// 	// method3 := baseValue.MethodByName(name)
// 	// fmt.Println(method3.Interface())
// 	// method2, err := baseType.MethodByName(name)

// 	// if !err {
// 	// 	fmt.Println((method2))
// 	// }

// 	for i := 0; i < baseType.NumMethod(); i++ {
// 		method := baseType.Method(i)
// 		if name == method.Name {
// 			// methodType := method.Type
// 			in := make([]reflect.Value, len(args))
// 			for k, param := range args {
// 				val := reflect.ValueOf(param)
// 				if !val.IsValid() {
// 					//fmt.Println(val)
// 					//panic("value is invalid")
// 					// paramType := val.Type()
// 					// in[k] = reflect.Zero(paramType)
// 					val = reflect.Zero(nil)
// 				}
// 				in[k] = val
// 			}
// 			var res []reflect.Value
// 			/*temp := reflect.ValueOf(this.Itf).MethodByName(name)
// 			x1 := reflect.ValueOf(temp).FieldByName("flag").Uint()*/
// 			res = reflect.ValueOf(this.Itf).MethodByName(name).Call(in)
// 			return res[0].Interface().(interface{})
// 		}
// 	}
// 	return nil
// }

func (this *Exchange) RetrieveStarkAccount(sig interface{}, account interface{}, hash interface{}) interface{} {
	return nil // to do
}

func (this *Exchange) StarknetEncodeStructuredData(a interface{}, b interface{}, c interface{}, d interface{}) interface{} {
	return nil // to do
}

func (this *Exchange) StarknetSign(a interface{}, b interface{}) interface{} {
	return nil // to do
}

func (this *Exchange) GetZKContractSignatureObj(seed interface{}, params interface{}) <-chan interface{} {
	ch := make(chan interface{})

	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				ch <- "panic:" + ToString(r)
			}
		}()

		ch <- "panic:" + "Apex currently does not support create order in Go language"
	}()
	return ch
}

func (this *Exchange) GetZKTransferSignatureObj(seed interface{}, params interface{}) <-chan interface{} {
	ch := make(chan interface{})

	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				ch <- "panic:" + ToString(r)
			}
		}()

		ch <- "panic:" + "Apex currently does not support transfer asset in Go language"
	}()
	return ch
}

func (this *Exchange) ExtendExchangeOptions(options2 interface{}) {
	options := options2.(map[string]interface{})
	extended := this.Extend(this.SafeMapToMap(this.Options), options)
	this.Options = this.MapToSafeMap(extended)
}

// func (this *Exchange) Init(userConfig map[string]interface{}) {
// }

func (this *Exchange) RandNumber(size interface{}) int64 {
	// Try casting interface{} to int
	intSize, ok := size.(int)
	if !ok {
		fmt.Println("Invalid size type; expected int")
		return 0
	}

	rand.Seed(time.Now().UnixNano())
	number := ""

	for i := 0; i < intSize; i++ {
		digit := rand.Intn(10) // Random digit 0-9
		number += strconv.Itoa(digit)
	}

	result, err := strconv.ParseInt(number, 10, 64)
	if err != nil {
		fmt.Println("Error converting string to int64:", err)
		return 0
	}

	return result
}

func (this *Exchange) UpdateProxySettings() {
	proxyUrl := this.CheckProxyUrlSettings(nil, nil, nil, nil)
	proxies := this.CheckProxySettings(nil, "", nil, nil)
	httProxy := this.SafeString(proxies, 0)
	httpsProxy := this.SafeString(proxies, 1)
	socksProxy := this.SafeString(proxies, 2)

	hasHttProxyDefined := (httProxy != nil) || (httpsProxy != nil) || (socksProxy != nil)
	this.CheckConflictingProxies(hasHttProxyDefined, proxyUrl)

	if hasHttProxyDefined {
		proxyTransport := &http.Transport{
			// MaxIdleConns:       100,
			// IdleConnTimeout:    90 * time.Second,
			// DisableCompression: false,
			// DisableKeepAlives:  false,
		}

		proxyUrlStr := ""
		if httProxy != nil {
			proxyUrlStr = httProxy.(string)
		} else {
			proxyUrlStr = httpsProxy.(string)
		}
		proxyURLParsed, _ := neturl.Parse(proxyUrlStr)
		proxyTransport.Proxy = http.ProxyURL(proxyURLParsed)

		this.httpClient.Transport = proxyTransport
	}
}

func (this *Exchange) callEndpointAsync(endpointName string, args ...interface{}) <-chan interface{} {
	parameters := GetArg(args, 0, nil)
	ch := make(chan interface{})
	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				ch <- "panic:" + ToString(r)
			}
		}()
		ch <- (<-this.callEndpoint(endpointName, parameters))
		PanicOnError(ch)
	}()
	return ch
}
// returns a future (implemented as a channel) that will be resolved by client.Resolve(data, messageHash)
//
// Signature in the generated code varies (2-5 parameters), therefore the variadic form is used and parsed internally
//   - url (string) – WS endpoint
//   - messageHash (string)
//   - [message]      subscribe payload (optional)
//   - [subscribeHash] key for "subscriptions" map (optional)
//   - [subscription]  arbitrary value stored in subscriptions (optional)
func (this *Exchange) Watch(args ...interface{}) <-chan interface{} {
	if len(args) < 2 {
		// programmer error – return closed chan so callers don't hang
		ch := make(chan interface{})
		close(ch)
		return ch
	}

	url, _ := args[0].(string)
	messageHash, _ := args[1].(string)

	var message interface{}
	if len(args) >= 3 {
		message = args[2]
	}

	var subscription interface{}
	if len(args) >= 5 {
		subscription = args[4]
	}

	// avoid unused-lint; in future expand to store real subscription info
	_ = subscription

	// obtain/create client for URL
	this.WsClientsMu.Lock()
	if this.WsClients == nil {
		this.WsClients = make(map[string]*Client)
	}
	client, exists := this.WsClients[url]
	if !exists {
		// no custom headers yet
		cli, err := NewClient(url, nil)
		this.setOwner(cli)
		if err != nil {
			// Return a dummy client that will fail gracefully
			client = &Client{}
		} else {
			client = cli
		}
		this.WsClients[url] = client
	}
	this.WsClientsMu.Unlock()

	// send subscription message if necessary
	if message != nil {
		client.Send(message)
	}

	// create Future for this message hash
	fut := client.Future(messageHash)

	// return the channel from the future
	return fut.Await()
}

// ------------------- WS helper wrappers (parity with TS) ------------------

// OrderBook returns a new mutable order-book using our Go implementation.
func (this *Exchange) OrderBook(optionalArgs ...interface{}) *OrderBook {
	snapshot := GetArg(optionalArgs, 0, map[string]interface{}{})
	
	orderbook := NewOrderBook(snapshot)
	
	return &orderbook
}

// IndexedOrderBook and CountedOrderBook share the same implementation for now.
func (this *Exchange) IndexedOrderBook(args ...interface{}) *OrderBook {
	return this.OrderBook(args...)
}

func (this *Exchange) CountedOrderBook(optionalArgs ...interface{}) interface{} {
	snapshot := GetArg(optionalArgs, 0, map[string]interface{}{})
	
	orderbook := this.OrderBook(snapshot)
	
	if orderbook != nil {
		// Ensure cache is a map
		if orderbook.Cache == nil {
			orderbook.Cache = make(map[string]interface{})
		}
		
		// Convert slice cache to map if necessary
		if _, isSlice := orderbook.Cache.([]interface{}); isSlice {
			orderbook.Cache = make(map[string]interface{})
		}
		
		if cache, ok := orderbook.Cache.(map[string]interface{}); ok {
			// Create OrderBookSide objects for asks and bids
			asksOrderBookSide := NewOrderBookSide(false) // false = asks (ascending)
			bidsOrderBookSide := NewOrderBookSide(true)  // true = bids (descending)
			
			cache["asks"] = asksOrderBookSide
			cache["bids"] = bidsOrderBookSide
		}
	}
	
	return orderbook
}

func (this *Exchange) setOwner(cli *Client) {
	if this.DerivedExchange != nil {
		cli.Owner = this.DerivedExchange
	} else {
		cli.Owner = this
	}
}

// Client returns (and caches) a *Client for the given WS URL.
func (this *Exchange) Client(url interface{}) *Client {
	this.WsClientsMu.Lock()
	defer this.WsClientsMu.Unlock()
	if this.WsClients == nil {
		this.WsClients = make(map[string]*Client)
	}
	if c, ok := this.WsClients[url.(string)]; ok {
		return c
	}
	cli, err := NewClient(url.(string), http.Header{})
	if err != nil {
		return nil
	}
	// set back-reference so client can dispatch messages
	this.setOwner(cli)
	// Throttling can be added later once implemented on Client
	this.WsClients[url.(string)] = cli
	return cli
}

// WatchMultiple awaits any of the messageHashes and returns the first future
// to resolve (similar to Future.race in TS)
func (this *Exchange) WatchMultiple(url interface{}, messageHashes interface{}, message interface{}, subscribeHashes interface{}, subscription interface{}) <-chan interface{} {
	client := this.Client(url.(string))
	if client == nil {
		// return empty closed channel if client is nil
		ch := make(chan interface{})
		close(ch)
		return ch
	}

	// Create a future per symbol, to return data for each symbol
	futures := make([]Future, len(messageHashes.([]interface{})))
	for i, h := range messageHashes.([]interface{}) {
		futures[i] = client.Future(h.(string))
	}

	missing := []string{}	// Track which subscription hashes we need to create (haven't seen before)
	if subscribeHashes != nil {
		for _, sh := range subscribeHashes.([]interface{}) {
			if _, ok := client.Subscriptions[sh.(string)]; !ok {	// Check if we already have a channel for this subscription hash
				if ch, ok := subscription.(chan interface{}); ok {
					// If caller provided a custom channel, use it
					client.Subscriptions[sh.(string)] = ch
				} else {
					// Otherwise create a new buffered channel for this subscription
					client.Subscriptions[sh.(string)] = make(chan interface{}, 1000)
				}
				missing = append(missing, sh.(string))	// Mark this subscription as new (we'll send subscribe message for it)
			}
		}
	}

	go func() {										// Start a goroutine to send subscribe message once connected
		<-client.Connected 							// blocks until websocket is connected
		if message != nil && len(missing) > 0 {  	// If we have a new subscription
			_ = client.Send(message)				// send a subscribe message to the exchange
		}
	}()

	// Return a channel that yields results from any resolved future (continuous streaming)
	out := make(chan interface{}, 1000)
	go func() {
		defer close(out)
		
		// build select cases for each future
		cases := make([]reflect.SelectCase, len(futures))
		for i, fut := range futures {
			cases[i] = reflect.SelectCase{Dir: reflect.SelectRecv, Chan: reflect.ValueOf(fut.Await())}
		}
		

		// Keep listening for results from any future (like TypeScript Future.race)
		for {
			chosen, val, ok := reflect.Select(cases)
			
			if !ok {
				// Channel closed, remove it from cases and continue with remaining
				if len(cases) <= 1 {
					break // No more active cases
				}
				// Remove the closed case
				cases = append(cases[:chosen], cases[chosen+1:]...)
				continue
			}

			result := val.Interface()
			
			// Debug the result content
			if cache, ok := result.(*ArrayCache); ok {
				arr := cache.ToArray()
				if len(arr) > 0 {
				}
			} else {
			}

			// Forward the result to output channel
			select {
			case out <- result:
			default:
				go func(res interface{}) {
					out <- res
				}(result)
			}
		}
		
	}()
	return out	// channel that will contain ongoing results from any resolved future
}

func (this *Exchange) Spawn(method interface{}, args ...interface{}) Future {
	fut := NewFuture()
	go func() {
		defer func() { if r := recover(); r != nil { fut.Reject(ToGetsLimit(r)) } }()
		v := reflect.ValueOf(method)
		in := make([]reflect.Value, len(args))
		for i, a := range args { in[i] = reflect.ValueOf(a) }
		out := v.Call(in)
		if len(out) == 0 {
			fut.Resolve(ToGetsLimit(nil))
			return
		}
		if ch, ok := out[0].Interface().(<-chan interface{}); ok {
			fut.Resolve(ToGetsLimit(<-ch))
		} else {
			fut.Resolve(ToGetsLimit(out[0].Interface()))
		}
	}()
	return fut
}

func (this *Exchange) Delay(timeout interface{}, method interface{}, args ...interface{}) {
	go func() {
		time.Sleep(time.Duration(timeout.(int)) * time.Millisecond)
		this.Spawn(method, args...)
	}()
}

func (this *Exchange) LoadOrderBook(client interface{}, messageHash interface{}, symbol interface{}, optionalArgs ...interface{}) <-chan interface{} {
    ch := make(chan interface{})
    go func() {
        defer close(ch)

        // Type assertions & helpers
        cli, _ := client.(*Client)
        msgHashStr := fmt.Sprintf("%v", messageHash)
        symStr := fmt.Sprintf("%v", symbol)

        // Retrieve the stored local order-book for this symbol (created by the WS handler)
        var stored interface{}
        if obMap, ok := this.Orderbooks.(map[string]interface{}); ok {
            stored = obMap[symStr]
        }

        if stored == nil {
            if cli != nil {
                cli.Reject(ToGetsLimit(NewError("ExchangeError", this.Id+" loadOrderBook() orderbook is not initiated")), msgHashStr)
            }
            ch <- nil
            return
        }

        // Check if this is a CountedOrderBook that already has data in main arrays
        if obPtr, ok := stored.(*OrderBook); ok {
            if len(obPtr.Bids) > 0 || len(obPtr.Asks) > 0 {
                if cli != nil {
                    cli.Resolve(obPtr, msgHashStr)
                }
                ch <- obPtr
                return
            }
            
            // Check if this is a snapshot case - if we have cached data but empty main arrays,
            // this might be a snapshot that was stored in cache and needs to be processed
            if cacheMap, ok := obPtr.Cache.(map[string]interface{}); ok && len(cacheMap) > 0 {
                // Check if we have snapshot data in cache (indicated by datetime/timestamp)
                if cacheMap["datetime"] != nil || cacheMap["timestamp"] != nil {
                    
                    // Extract snapshot data from cache
                    var asks interface{}
                    var bids interface{}
                    if asksCache, ok := cacheMap["asks"]; ok {
                        asks = asksCache
                    }
                    if bidsCache, ok := cacheMap["bids"]; ok {
                        bids = bidsCache
                    }
                    
                    // For CountedOrderBook, the OrderBookSide objects are stored in cache
                    // We need to populate them and also update the main arrays for compatibility
                    if asksArray, ok := asks.([]interface{}); ok {
                        // Get the cached OrderBookSide for asks
                        if asksSideCache, exists := cacheMap["asks"]; exists {
                            if asksSide, ok := asksSideCache.(*OrderBookSide); ok {
                                // Clear existing levels and populate with snapshot data
                                asksSide.Levels = []PriceLevel{}
                                for _, ask := range asksArray {
                                    if askArray, ok := ask.([]interface{}); ok && len(askArray) >= 2 {
                                        price := askArray[0]
                                        amount := askArray[1]
                                        bidAsk := []interface{}{price, amount, askArray} // Include original for checksum
                                        asksSide.StoreArray(bidAsk)
                                    }
                                }
                                
                                // Also populate the main Asks array for compatibility
                                obPtr.Asks = make([][]float64, len(asksSide.Levels))
                                for i, level := range asksSide.Levels {
                                    obPtr.Asks[i] = []float64{level.Price, level.Amount}
                                }
                            }
                        }
                    }
                    
                    if bidsArray, ok := bids.([]interface{}); ok {
                        // Get the cached OrderBookSide for bids
                        if bidsSideCache, exists := cacheMap["bids"]; exists {
                            if bidsSide, ok := bidsSideCache.(*OrderBookSide); ok {
                                // Clear existing levels and populate with snapshot data
                                bidsSide.Levels = []PriceLevel{}
                                for _, bid := range bidsArray {
                                    if bidArray, ok := bid.([]interface{}); ok && len(bidArray) >= 2 {
                                        price := bidArray[0]
                                        amount := bidArray[1]
                                        bidAsk := []interface{}{price, amount, bidArray} // Include original for checksum
                                        bidsSide.StoreArray(bidAsk)
                                    }
                                }
                                
                                // Also populate the main Bids array for compatibility
                                obPtr.Bids = make([][]float64, len(bidsSide.Levels))
                                for i, level := range bidsSide.Levels {
                                    obPtr.Bids[i] = []float64{level.Price, level.Amount}
                                }
                            }
                        }
                    }
                    
                    // Set metadata with proper type assertions
                    if ts, ok := cacheMap["timestamp"]; ok {
                        if tsInt64, ok := ts.(int64); ok {
                            obPtr.Timestamp = &tsInt64
                        }
                    }
                    if dt, ok := cacheMap["datetime"]; ok {
                        if dtStr, ok := dt.(string); ok {
                            obPtr.Datetime = &dtStr
                        }
                    }
                    if obPtr.Symbol == nil {
                        obPtr.Symbol = &symStr
                    }
                     
                    // Clear the cache since we've processed the snapshot
                    obPtr.Cache = map[string]interface{}{}
                    
                    if cli != nil {
                        cli.Resolve(obPtr, msgHashStr)
                    }
                    ch <- obPtr
                    return
                }
            }
        }

        // Parse optional arguments
        var limit interface{}
        var params interface{}
        if len(optionalArgs) > 0 {
            limit = optionalArgs[0]
        }
        if len(optionalArgs) > 1 {
            params = optionalArgs[1]
        }
        if params == nil {
            params = map[string]interface{}{}
        }

        // Get retry settings
        var snapshotMaxRetries int = 3
        if retryOpt := this.HandleOption("watchOrderBook", "snapshotMaxRetries", 3); retryOpt != nil {
            if retryInt, ok := retryOpt.(int); ok {
                snapshotMaxRetries = retryInt
            }
        }

        var tries int = 0
        var maxRetries int = snapshotMaxRetries

        for tries < maxRetries {
            snapshot := <-this.FetchRestOrderBookSafe(symbol, limit, params)
            tries++

            if snapshot != nil {
                log.Printf("[DEBUG][LoadOrderBook] got snapshot for symbol=%s", symStr)
                // We got a snapshot – merge it with the cached deltas and resolve
                if obPtr, ok := stored.(*OrderBook); ok {
                    obPtr.Reset(snapshot)
                    // Apply any cached deltas collected before the snapshot arrived
                    if cacheArr, ok := obPtr.Cache.([]interface{}); ok && len(cacheArr) > 0 {
                        this.HandleDeltas(obPtr, cacheArr)
                    }
                    obPtr.Cache = []interface{}{}
                    log.Printf("[DEBUG][LoadOrderBook] snapshot merged symbol=%s bids=%d asks=%d", symStr, len(obPtr.Bids), len(obPtr.Asks))
                    if cli != nil {
                        cli.Resolve(obPtr, msgHashStr)
                    }
                    ch <- obPtr
                    return
                }
            }
        }

        // If we exit the loop, all retries failed – reject and drop the client
        if cli != nil {
            cli.Reject(ToGetsLimit(NewError("ExchangeError", "failed to load orderbook snapshot after retries")), msgHashStr)
        }
        ch <- nil
    }()
    return ch
}

// ---------------- Connection lifecycle helpers ----------------
func (this *Exchange) OnConnected(client interface{}, message interface{}) {}

func (this *Exchange) OnError(client interface{}, err interface{}) {
	if client == nil { return }
	this.WsClientsMu.Lock()
	delete(this.WsClients, client.(*Client).Url)
	this.WsClientsMu.Unlock()
	client.(*Client).Err = fmt.Errorf("%v", err)
}

func (this *Exchange) OnClose(client interface{}, err interface{}) {
	if client == nil { return }
	if client.(*Client).Err != nil { return }
	this.WsClientsMu.Lock()
	delete(this.WsClients, client.(*Client).Url)
	this.WsClientsMu.Unlock()
}

func (this *Exchange) Close() []error {
	this.WsClientsMu.Lock()
	clients := make([]*Client, 0, len(this.WsClients))
	for _, c := range this.WsClients { clients = append(clients, c) }
	this.WsClients = make(map[string]*Client)
	this.WsClientsMu.Unlock()
	errs := make([]error, 0)
	for _, c := range clients { if err := c.Close(); err != nil { errs = append(errs, err) } }
	return errs
}
// ---------------- Connection lifecycle helpers ----------------

func callDynamically(fn interface{}, args ...interface{}) interface{} {
    v := reflect.ValueOf(fn)
    in := make([]reflect.Value, len(args))
    for i, a := range args {
        in[i] = reflect.ValueOf(a)
    }
    out := v.Call(in)
    if len(out) > 0 {
        return out[0].Interface()
    }
    return nil
}

func (this *Exchange) Crc32(str interface{}, signed2 bool) int64 {
	// signed := false
	// if len(signed2) > 0 {
	// 	if b, ok := signed2[0].(bool); ok {
	// 		signed = b
	// 	}
	// }
	return Crc32(str.(string), signed2)
}


