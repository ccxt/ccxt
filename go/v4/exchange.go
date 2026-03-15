package ccxt

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	j "encoding/json"
	"errors"
	"fmt"
	"math"
	random2 "math/rand"
	"net/http"
	"net/url"
	"reflect"
	"regexp"
	"runtime/debug"
	"strconv"
	"strings"
	"sync"
	"time"

	pb "github.com/ccxt/ccxt/go/v4/protoc"
	"golang.org/x/net/proxy"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

type Exchange struct {
	MarketsMutex *sync.Mutex
	// cachedCurrenciesMutex  sync.Mutex
	loadMu                 sync.Mutex
	marketsLoading         bool
	marketsLoaded          bool
	loadMarketsSubscribers []chan any
	Itf                    any
	DerivedExchange        IDerivedExchange
	methodCache            sync.Map
	cacheLoaded            bool
	Version                string
	Id                     string
	Name                   string
	Options                *sync.Map
	Has                    map[string]any
	Api                    map[string]any
	TransformedApi         map[string]any
	Markets                *sync.Map
	Markets_by_id          *sync.Map
	Currencies_by_id       *sync.Map
	Currencies             *sync.Map
	RequiredCredentials    map[string]any
	HttpExceptions         map[string]any
	MarketsById            *sync.Map
	Timeframes             map[string]any
	Features               map[string]any
	Exceptions             map[string]any
	Precision              map[string]any
	Urls                   any
	UserAgents             map[string]any
	Timeout                int64
	MAX_VALUE              float64
	RateLimit              float64
	RollingWindowSize      float64 // set to 0.0 to use leaky bucket rate limiter
	RateLimiterAlgorithm   string
	TokenBucket            map[string]any
	Throttler              *Throttler
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
	CommonCurrencies       map[string]any
	PrecisionMode          int
	Limits                 map[string]any
	Fees                   map[string]any
	CurrenciesById         *sync.Map
	ReduceFees             bool

	AccountsById any
	Accounts     any

	// timestamps
	LastRestRequestTimestamp int64
	LastRequestHeaders       any
	Last_request_headers     any
	Last_response_headers    any
	LastResponseHeaders      any
	Last_http_response       any
	LastRequestBody          any
	Last_request_body        any
	Last_request_url         any
	LastRequestUrl           string
	Headers                  any
	ReturnResponseHeaders    bool

	// type check this
	Number any
	// keys
	Secret        string
	ApiKey        string
	Password      string
	Uid           string
	AccountId     string
	Token         any
	Login         string
	PrivateKey    string
	WalletAddress string

	httpClient *http.Client

	HttpProxy            any
	HttpsProxy           any
	Http_proxy           any
	Https_proxy          any
	Proxy                any
	ProxyUrl             any
	ProxyUrlCallback     any
	Proxy_url            any
	Proxy_url_callback   any
	SocksProxy           any
	Socks_proxy          any
	SocksProxyCallback   any
	Socks_proxy_callback any

	HttpsProxyCallback   any
	Https_proxy_callback any

	HttpProxyCallback   any
	Http_proxy_callback any
	SocksroxyCallback   any

	WsSocksProxy   string
	Ws_socks_proxy string

	WssProxy  string
	Wss_proxy string

	WsProxy  string
	Ws_proxy string

	HttpProxyAgentModule         any // or any if you don't have a type yet
	HttpsProxyAgentModule        any
	SocksProxyAgentModule        any
	SocksProxyAgentModuleChecked bool
	ProxyDictionaries            map[string]any
	ProxiesModulesLoading        chan struct{} // or something to represent a Promise/future

	SubstituteCommonCurrencyCodes bool

	Twofa string

	// WS - updated to use thread-safe sync.Map (except cache objects)
	Ohlcvs         any // map[string]map[string]*ArrayCacheByTimestamp
	Trades         any // map[string]*ArrayCache
	Tickers        *sync.Map
	Orders         any // *ArrayCache  // cache object, not a map
	MyTrades       any // *ArrayCache  // cache object, not a map
	Orderbooks     *sync.Map
	Liquidations   any // *ArrayCacheBySymbolBySide
	FundingRates   any
	Bidsasks       *sync.Map
	TriggerOrders  any // *ArrayCache
	Transactions   *sync.Map
	MyLiquidations any // *ArrayCacheBySymbolBySide

	PaddingMode int

	MinFundingAddressLength int
	MaxEntriesPerRequest    int

	// tests only
	FetchResponse any

	IsSandboxModeEnabled bool

	// ws
	WsClients   map[string]any // one websocket client per URL
	WsClientsMu sync.Mutex
	Balance     any
	Positions   any
	Clients     map[string]any
	newUpdates  bool
	streaming   map[string]any

	// id lock
	idMutex sync.Mutex
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

func (this *Exchange) InitParent(userConfig map[string]any, exchangeConfig map[string]any, itf any) {
	// this = &Exchange{}
	if this.Options == nil {
		this.Options = &sync.Map{} // by default sync.map is nil
	}
	if this.MarketsMutex == nil {
		this.MarketsMutex = &sync.Mutex{}
	}
	describeValues := this.Describe()
	if userConfig == nil {
		userConfig = map[string]any{}
	}

	extendedProperties := this.DeepExtend(describeValues, exchangeConfig)
	extendedProperties = this.DeepExtend(extendedProperties, userConfig)
	this.Itf = itf
	// this.id = SafeString(extendedProperties, "id", "").(string)
	// this.Id = this.id333
	// this.itf = itf

	// warmup itf cache

	limit := 10000
	// Initialize WebSocket data structures with thread-safe sync.Map
	// this.Trades = make(map[string]*ArrayCache)
	this.Trades = &sync.Map{}
	this.Tickers = &sync.Map{}
	this.Orderbooks = &sync.Map{}
	// this.Ohlcvs = make(map[string]map[string]*ArrayCacheByTimestamp)
	this.Ohlcvs = &sync.Map{}
	this.Orders = NewArrayCache(limit)
	this.TriggerOrders = NewArrayCache(limit)
	this.MyTrades = NewArrayCache(limit)
	this.Transactions = &sync.Map{}
	this.Liquidations = &sync.Map{}
	this.MyLiquidations = &sync.Map{}
	this.Clients = make(map[string]any)
	// this.Balance = make(map[string]any)
	this.Balance = &sync.Map{}

	// beforeNs := time.Now().UnixNano()
	// this.WarmUpCache(this.Itf)
	// afterNs := time.Now().UnixNano()
	// fmt.Println("Warmup cache took: ", afterNs-beforeNs)

	this.Currencies = &sync.Map{}
	// this.FundingRates = make(map[string]any)
	this.FundingRates = &sync.Map{}
	this.Bidsasks = &sync.Map{}
	this.ProxyDictionaries = make(map[string]any)
	this.AccountsById = make(map[string]any)
	this.Accounts = make([]any, 0)

	this.initializeProperties(extendedProperties)
	this.AfterConstruct()

	this.streaming = this.SafeDict(extendedProperties, "streaming", map[string]any{}).(map[string]any)
	this.transformApiNew(this.Api)
	transport := &http.Transport{}

	this.httpClient = &http.Client{
		Timeout:   30 * time.Second,
		Transport: transport,
	}
}

func (this *Exchange) Init(userConfig map[string]any) {
	if this.Options == nil {
		this.Options = &sync.Map{} // by default sync.map is nil
	}

	if this.MarketsMutex == nil {
		this.MarketsMutex = &sync.Mutex{}
	}
	// to do
}

func NewExchange() ICoreExchange {
	exchange := &Exchange{}
	exchange.Init(map[string]any{})
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

		cacheValue := map[string]any{
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
func (this *Exchange) LoadMarkets(params ...any) <-chan any {
	reload := GetArg(params, 0, false).(bool)
	this.loadMu.Lock()

	if this.marketsLoaded && !reload {
		out := make(chan any, 1)
		out <- this.Markets
		close(out)
		this.loadMu.Unlock()
		return out
	}

	ch := make(chan any, 1)
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

func (this *Exchange) LoadMarketsHelper(params ...any) <-chan any {
	ch := make(chan any)

	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				stack := debug.Stack()
				panicMsg := fmt.Sprintf("panic: %v\nStack trace:\n%s", r, stack)
				ch <- panicMsg
			}
		}()
		reload := GetArg(params, 0, false).(bool)
		params := GetArg(params, 1, map[string]any{})
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

		var currencies any = nil
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

func (this *Exchange) Throttle(cost any) <-chan any {
	// to do
	ch := make(chan any)
	go func() {
		defer close(ch)
		task := <-this.Throttler.Throttle(cost)
		ch <- task
	}()
	return ch
}

func (this *Exchange) FetchMarkets(optionalArgs ...any) <-chan any {
	ch := make(chan any)
	go func() any {
		// defer close(ch)
		// markets := <-this.callInternal("fetchMarkets", optionalArgs)
		// return markets
		return this.Markets
	}()
	return ch
}

func (this *Exchange) FetchCurrencies(optionalArgs ...any) <-chan any {
	ch := make(chan any)
	go func() any {
		defer close(ch)
		// markets := <-this.callInternal("fetchCurrencies", optionalArgs)
		// return markets
		return this.Currencies
	}()
	return ch
}

func (this *Exchange) Sleep(milliseconds any) <-chan bool {
	var duration time.Duration

	// Type assertion to handle various types for milliseconds
	ch := make(chan bool)
	go func() any {
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
		ch <- true
		return true
	}()
	return ch
}

func (this *Exchange) Log(args ...any) {
	// convert to str and print
	fmt.Println(args...)
}

func (this *Exchange) callEndpoint(endpoint2 any, parameters any) <-chan any {
	ch := make(chan any)

	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				stack := debug.Stack()
				panicMsg := fmt.Sprintf("panic: %v\nStack trace:\n%s", r, stack)
				ch <- panicMsg
			}
		}()

		endpoint := endpoint2.(string)
		if val, ok := this.TransformedApi[endpoint]; ok {
			endPointData := val.(map[string]any)
			// endPointData := this.TransformedApi[endpoint].(map[string]any)
			method := endPointData["method"].(string)
			path := endPointData["path"].(string)
			api := endPointData["api"]
			var cost float64 = 1
			if valCost, ok := endPointData["cost"]; ok {
				cost = valCost.(float64)
			}
			res := <-this.Fetch2(path, api, method, parameters, map[string]any{}, nil, map[string]any{"cost": cost})
			PanicOnError(res)
			ch <- res
		} else {
			ch <- nil
		}
	}()
	return ch
}

func (this *Exchange) ConvertToBigInt(data any) any {
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

func NewError(errType any, message ...any) error {
	typeErr := ToString(errType)
	msg := ""
	stack := ""
	if len(message) > 0 {
		msg = ToString(message[0])
		msgParts := strings.Split(msg, "]\nStack:")
		msg = msgParts[0]
		if len(message) > 1 {
			stack = ToString(message[1])
		}
	}
	return &Error{Type: ErrorType(string(typeErr)), Message: msg, Stack: stack}
}

func Exception(v ...any) error {
	return NewError("Exception", v...)
}

func IsError(res any) bool {
	resStr, ok := res.(string)
	if ok {
		return strings.HasPrefix(resStr, "panic:")
	}
	return false
}

func CreateReturnError(res any) error {
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

func ToSafeFloat(v any) (float64, error) {
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
func (this *Exchange) Json(object any) any {
	jsonBytes, err := j.Marshal(object)
	if err != nil {
		return nil
	}
	return string(jsonBytes)
}

func (this *Exchange) ParseNumber(v any, a ...any) any {
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

func (this *Exchange) ValueIsDefined(v any) bool {
	if v == nil {
		return false
	}
	if str, ok := v.(string); ok {
		return str != ""
	}
	return true
}

// func (this *Exchange) CreateSafeDictionary() any {
// 	return map[string]any{}
// }

func (this *Exchange) ConvertToSafeDictionary(data any) any {
	return data
}

func (this *Exchange) callDynamically(name2 any, args ...any) <-chan any {
	return this.callInternal(name2.(string), args...)
}

func (this *Exchange) CallDynamically(name2 any, args ...any) <-chan any {
	return this.callInternal(name2.(string), args...)
}

// clone creates a deep copy of the input object. It supports arrays, slices, and maps.
func (this *Exchange) Clone(object any) any {
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
	ToArray() []any
}

func (this *Exchange) ArraySlice(array any, first any, second ...any) any {
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
	isArrayCache := reflect.TypeOf(array).Implements(reflect.TypeOf((*IArrayCache)(nil)).Elem())

	if len(second) == 0 {
		if firstInt < 0 {
			index := length + firstInt
			if index < 0 {
				index = 0
			}
			if isArrayCache {
				return reflect.ValueOf(array).Interface().(IArrayCache).ToArray()[index:]
			}
			return this.sliceToInterface(parsedArray.Slice(index, length))
		}
		if isArrayCache {
			return reflect.ValueOf(array).Interface().(IArrayCache).ToArray()[firstInt:]
		}
		return this.sliceToInterface(parsedArray.Slice(firstInt, length))
	}

	secondInt := reflect.ValueOf(second[0]).Convert(reflect.TypeOf(0)).Interface().(int)
	if isArrayCache {
		return reflect.ValueOf(array).Interface().(IArrayCache).ToArray()[firstInt:secondInt]
	}
	return this.sliceToInterface(parsedArray.Slice(firstInt, secondInt))
}

func (this *Exchange) sliceToInterface(value reflect.Value) []any {
	length := value.Len()
	result := make([]any, length)
	for i := 0; i < length; i++ {
		result[i] = value.Index(i).Interface()
	}
	return result
}

// Example ArrayCache implementation for testing
type exampleArrayCache struct {
	data []any
}

func (e *exampleArrayCache) ToArray() []any {
	return e.data
}

func (this *Exchange) ParseTimeframe(timeframe any) any {
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

func Totp(secret any) string {
	return ""
}

func (this *Exchange) ParseJson(input any) any {
	return ParseJSON(input)
}

// type Dict map[string]any

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
			if dictValue, ok := value.(map[string]any); ok {
				for endpoint := range dictValue {
					endpoints = append(endpoints, endpoint)
				}
			} else {
				if listValue, ok := value.([]any); ok {
					for _, item := range listValue {
						if s, ok := item.(string); ok {
							endpoints = append(endpoints, s)
						}
					}
				}
			}

			for _, endpoint := range endpoints {
				cost := 1.0
				if dictValue, ok := value.(map[string]any); ok {
					if config, ok := dictValue[endpoint]; ok {
						if dictConfig, ok := config.(map[string]any); ok {
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

				apiObj := any(paths)
				if len(paths) == 1 {
					apiObj = paths[0]
				}

				this.TransformedApi[path] = map[string]any{
					"method": strings.ToUpper(key),
					"path":   endpoint,
					"api":    apiObj,
					"cost":   cost,
				}
			}
		} else {
			if nestedDict, ok := value.(map[string]any); ok {
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

// func (this *Exchange) callInternal(name2 string, args ...any) any {
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

func (this *Exchange) FixStringifiedJsonMembers(a any) string {
	aStr := a.(string)
	aStr = strings.ReplaceAll(aStr, "\\", "")
	aStr = strings.ReplaceAll(aStr, "\"{", "{")
	aStr = strings.ReplaceAll(aStr, "}\"", "}")
	return aStr
}

func (this *Exchange) IsEmpty(a any) bool {
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

func (this *Exchange) CallInternal(name2 string, args ...any) <-chan any {
	return this.callInternal(name2, args...)
}

func (this *Exchange) callInternal(name2 string, args ...any) <-chan any {
	ch := make(chan any)
	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				if r != "break" {
					stack := debug.Stack()
					panicMsg := fmt.Sprintf("panic: %v\nStack trace:\n%s", r, stack)
					ch <- panicMsg
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

func (this *Exchange) BinaryLength(binary any) int {
	return this.binaryLength(binary)
}

func (this *Exchange) binaryLength(binary any) int {
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

func (this *Exchange) RandomBytes(length any) string {
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

func (this *Exchange) IsJsonEncodedObject(str any) bool {
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

func (this *Exchange) StringToCharsArray(value any) []string {
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
	if this.Markets == nil {
		panic("Markets not loaded, please call LoadMarkets() first")
	}
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
	this.Markets.Range(func(key, value any) bool {
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
	this.Currencies.Range(func(key, value any) bool {
		currencies = append(currencies, NewCurrency(value))
		return true
	})
	return currencies
}

func (this *Exchange) SetProperty(obj any, property any, defaultValue any) {
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

func (this *Exchange) ExceptionMessage(exc any, includeStack ...any) any {
	include := true
	if len(includeStack) > 0 {
		include = includeStack[0].(bool)
	}

	var message string

	if include {
		message = fmt.Sprintf("[%T] %+v", exc, exc)
	} else {
		message = fmt.Sprintf("[%T] %v", exc, exc)
	}

	length := len(message)
	if length > 100000 {
		length = 100000
	}

	return message[:length]
}

func (this *Exchange) GetProperty(obj any, property any) any {
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
		// Return the field value as an any
		return field.Interface()
	} else {
		// fmt.Printf("Field '%s' is either invalid or cannot be accessed\n", propName)
		return nil
	}
}

func (this *Exchange) Unique(obj any) []any {
	var list []any

	switch v := obj.(type) {
	case []string:
		for _, item := range v {
			list = append(list, item)
		}
	case []any:
		list = v
	default:
		return []any{}
	}

	uniqueMap := make(map[any]bool)
	uniqueList := []any{}
	for _, item := range list {
		if !uniqueMap[item] {
			uniqueMap[item] = true
			uniqueList = append(uniqueList, item)
		}
	}
	return uniqueList
}

// func (this *Exchange) callInternal(name2 string, args ...any) any {
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
// 			return res[0].Interface().(any)
// 		}
// 	}
// 	return nil
// }

func (this *Exchange) RetrieveStarkAccount(sig any, account any, hash any) any {
	return nil // to do
}

func (this *Exchange) StarknetEncodeStructuredData(a any, b any, c any, d any) any {
	return nil // to do
}

func (this *Exchange) StarknetSign(a any, b any) any {
	return nil // to do
}

func (this *Exchange) GetZKContractSignatureObj(seed any, params any) <-chan any {
	ch := make(chan any)

	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				stack := debug.Stack()
				panicMsg := fmt.Sprintf("panic: %v\nStack trace:\n%s", r, stack)
				ch <- panicMsg
			}
		}()

		ch <- "panic:" + "Apex currently does not support create order in Go language"
	}()
	return ch
}

func (this *Exchange) GetZKTransferSignatureObj(seed any, params any) <-chan any {
	ch := make(chan any)

	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				stack := debug.Stack()
				panicMsg := fmt.Sprintf("panic: %v\nStack trace:\n%s", r, stack)
				ch <- panicMsg
			}
		}()

		ch <- "panic:" + "Apex currently does not support transfer asset in Go language"
	}()
	return ch
}

func (this *Exchange) LoadDydxProtos() <-chan any {
	ch := make(chan any)

	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				ch <- "panic:" + ToString(r)
			}
		}()

		ch <- "panic:" + "Dydx currently does not support transfer asset in Go language"
	}()
	return ch
}

func (this *Exchange) ToDydxLong(numStr any) any {
	return nil
}

func (this *Exchange) RetrieveDydxCredentials(entropy any) any {
	return nil
}

func (this *Exchange) EncodeDydxTxForSimulation(
	message any,
	memo any,
	sequence any,
	publicKey any) any {
	return nil
}

func (this *Exchange) EncodeDydxTxForSigning(
	message any,
	memo any,
	chainId any,
	account any,
	authenticators any,
	fee any) any {
	return nil
}

func (this *Exchange) EncodeDydxTxRaw(signDoc any, signature any) any {
	return nil
}

func (this *Exchange) ExtendExchangeOptions(options2 any) {
	options := options2.(map[string]any)
	extended := this.Extend(this.SafeMapToMap(this.Options), options)
	this.Options = this.MapToSafeMap(extended)
}

// func (this *Exchange) Init(userConfig map[string]any) {
// }

func (this *Exchange) RandNumber(size any) int64 {
	// Try casting any to int
	intSize, ok := size.(int)
	if !ok {
		fmt.Println("Invalid size type; expected int")
		return 0
	}

	random2.Seed(time.Now().UnixNano())
	number := ""

	for i := 0; i < intSize; i++ {
		digit := random2.Intn(10) // Random digit 0-9
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
		proxyURLParsed, _ := url.Parse(proxyUrlStr)
		proxyTransport.Proxy = http.ProxyURL(proxyURLParsed)

		this.httpClient.Transport = proxyTransport
	}
}

func (this *Exchange) callEndpointAsync(endpointName string, args ...any) <-chan any {
	parameters := GetArg(args, 0, nil)
	ch := make(chan any)
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
func (this *Exchange) Watch(args ...any) <-chan any {

	url, _ := args[0].(string)
	messageHash, _ := args[1].(string)
	var message any
	var subscribeHash any
	var subscription any

	if len(args) >= 3 {
		message = args[2]
	}
	if len(args) >= 4 {
		subscribeHash = args[3]
	} else {
		subscribeHash = messageHash
	}
	if len(args) >= 5 {
		subscription = args[4]
	}

	client := this.Client(url)
	// todo: calculate the backoff using the clients cache
	backoffDelay := 0
	//
	//  watchOrderBook ---- future ----+---------------+----→ user
	//                                 |               |
	//                                 ↓               ↑
	//                                 |               |
	//                              connect ......→ resolve
	//                                 |               |
	//                                 ↓               ↑
	//                                 |               |
	//                             subscribe -----→ receive
	//
	if subscribeHash == nil {
		client.FuturesMu.RLock()
		// Use read lock when checking for existing futures
		if fut, ok := client.Futures[messageHash]; ok {
			client.FuturesMu.RUnlock()
			return fut.(*Future).Await()
		}
		client.FuturesMu.RUnlock()
	}
	future := client.NewFuture(messageHash)
	// read and write subscription, this is done before connecting the client
	// to avoid race conditions when other parts of the code read or write to the client.subscriptions
	client.SubscriptionsMu.Lock()
	clientSubscription := SafeValue(client.Subscriptions, subscribeHash, nil)
	if clientSubscription == nil {
		if subscription != nil {
			client.Subscriptions[subscribeHash.(string)] = subscription
		} else {
			// client.Subscriptions[subscribeHash.(string)] = make(chan any)
			client.Subscriptions[subscribeHash.(string)] = true
		}
	}
	client.SubscriptionsMu.Unlock()
	// we intentionally do not use await here to avoid unhandled exceptions
	// the policy is to make sure that 100% of promises are resolved or rejected
	// either with a call to client.resolve or client.reject with
	//  a proper exception class instance
	client.ConnectMu.Lock()
	connected, err := client.Connect(backoffDelay)
	client.ConnectMu.Unlock()
	if err != nil {
		client.SubscriptionsMu.Lock()
		delete(client.Subscriptions, subscribeHash.(string))
		future.Reject(err)
		client.SubscriptionsMu.Unlock()
		return future.Await()
	}
	// the following is executed only if the catch-clause does not
	// catch any connection-level exceptions from the client
	// (connection established successfully)
	if clientSubscription == nil {
		go func() {
			result := <-connected.Await()
			if err, ok := result.(error); ok {
				delete(client.Subscriptions, subscribeHash.(string))
				future.Reject(err)
				return
			}
			options := SafeValue(this.Options, "ws", make(map[string]any))
			cost := SafeValue(options, "cost", 1)
			if message != nil {
				if this.EnableRateLimit && client.Throttle != nil {
					// add cost here |
					//               |
					//               V
					if throttleFunc, ok := client.Throttle.(func(any) error); ok {
						if err := throttleFunc(cost); err != nil {
							client.OnError(err)
							return
						}
					}
				}
				sendFutureChannel := <-client.Send(message)
				if err, ok := sendFutureChannel.(error); ok {
					client.OnError(err)
					client.SubscriptionsMu.Lock()
					delete(client.Subscriptions, subscribeHash.(string))
					client.SubscriptionsMu.Unlock()
				}
			}
		}()
	}
	return future.Await()
}

// ------------------- WS helper wrappers (parity with TS) ------------------

// OrderBook returns a new mutable order-book using our Go implementation.
func (this *Exchange) OrderBook(optionalArgs ...any) *WsOrderBook {
	snapshot := GetArg(optionalArgs, 0, map[string]any{})
	depth := GetArg(optionalArgs, 1, math.MaxInt32)
	orderBook := NewWsOrderBook(snapshot, depth)
	return orderBook
}

// IndexedOrderBook and CountedOrderBook share the same implementation for now.
func (this *Exchange) IndexedOrderBook(optionalArgs ...any) *IndexedOrderBook {
	snapshot := GetArg(optionalArgs, 0, map[string]any{})
	depth := GetArg(optionalArgs, 1, 9007199254740991)
	orderBook := NewIndexedOrderBook(snapshot, depth)
	return orderBook
}

func (this *Exchange) CountedOrderBook(optionalArgs ...any) *CountedOrderBook {
	snapshot := GetArg(optionalArgs, 0, map[string]any{})
	depth := GetArg(optionalArgs, 1, 9007199254740991)
	orderBook := NewCountedOrderBook(snapshot, depth)
	return orderBook
}

// func (this *Exchange) setOwner(cli *WSClient) {
// 	if this.DerivedExchange != nil {
// 		cli.Owner = this.DerivedExchange.(*Exchange)
// 	} else {
// 		cli.Owner = this
// 	}
// }

func (this *Exchange) SetProxyAgents(httpProxy any, httpsProxy any, socksProxy any) (any, error) {
	var transport *http.Transport

	// Handle HTTP proxy
	if httpProxy != "" {
		proxyURL, err := url.Parse(httpProxy.(string))
		if err != nil {
			return nil, BadRequest(this.Id + " invalid HTTP proxy URL: " + err.Error())
		}
		transport = &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		}
	} else if httpsProxy != "" {
		// Handle HTTPS proxy
		proxyURL, err := url.Parse(httpsProxy.(string))
		if err != nil {
			return nil, BadRequest(this.Id + " invalid HTTPS proxy URL: " + err.Error())
		}
		transport = &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		}
	} else if socksProxy != "" {
		// Handle SOCKS proxy
		proxyURL, err := url.Parse(socksProxy.(string))
		if err != nil {
			return nil, BadRequest(this.Id + " invalid SOCKS proxy URL: " + err.Error())
		}

		// Create SOCKS5 dialer
		dialer, err := proxy.SOCKS5("tcp", proxyURL.Host, nil, proxy.Direct)
		if err != nil {
			return nil, BadRequest(this.Id + " failed to create SOCKS5 dialer: " + err.Error())
		}

		transport = &http.Transport{
			Dial: dialer.Dial,
		}
	}

	return transport, nil
}

func (this *Exchange) GetHttpAgentIfNeeded(url string) (any, error) {
	// if isNode { // TODO: implement this
	if len(url) >= 5 && url[:5] == "ws://" {
		if this.HttpProxy == nil {
			return nil, NotSupported(this.Id + " to use proxy with non-ssl ws:// urls, at first run `await exchange.loadHttpProxyAgent()` method")
		}
		return this.HttpProxy, nil
	}
	// }
	return nil, nil // no agent needed
}

func (this *Exchange) Ping(client any) any {
	return nil
}

func (this *Exchange) HandleMessage(client any, message any) {
	// stub to override
}

func (this *Exchange) OnConnected(client any, message any) {
	// for user hooks
	// fmt.Println('Connected to', client.url)
}

func (this *Exchange) OnError(client any, err any) {
	this.WsClientsMu.Lock()
	if c, ok := this.Clients[client.(ClientInterface).GetUrl()]; ok && c.(ClientInterface).GetError() != nil {
		delete(this.Clients, client.(ClientInterface).GetUrl())
	}
	this.WsClientsMu.Unlock()
	client.(ClientInterface).SetError(fmt.Errorf("%v", err))
}

func (this *Exchange) OnClose(client any, err any) {
	if client.(*Client).Error != nil {
		// connection closed due to an error, do nothing
	} else {
		this.WsClientsMu.Lock()
		delete(this.Clients, client.(*Client).Url)
		this.WsClientsMu.Unlock()
	}
}

// Client returns (and caches) a *WSClient for the given WS URL.
func (this *Exchange) Client(url any) *WSClient {
	// TODO: what to do with errors
	this.WsClientsMu.Lock()
	defer this.WsClientsMu.Unlock()
	if client, ok := this.Clients[url.(string)]; ok {
		return client.(*WSClient)
	}
	// TODO: add options to NewWSClient
	wsOptions := SafeValue(this.Options, "ws", map[string]any{})
	// proxy agents
	proxies := this.CheckWsProxySettings()
	var httpProxy, httpsProxy, socksProxy string
	if proxySlice, ok := proxies.([]any); ok {
		httpProxy, _ = proxySlice[0].(string)
		httpsProxy, _ = proxySlice[1].(string)
		socksProxy, _ = proxySlice[2].(string)
	}

	chosenAgent, err := this.SetProxyAgents(httpProxy, httpsProxy, socksProxy)
	if err != nil {
		return nil //, err
	}
	httpProxyAgent, err := this.GetHttpAgentIfNeeded(url.(string))
	if err != nil {
		return nil //, err
	}
	var finalAgent any
	if chosenAgent != nil {
		finalAgent = chosenAgent
	} else if httpProxyAgent != nil {
		finalAgent = httpProxyAgent
	}

	options := DeepExtend(
		this.streaming,
		map[string]any{
			"Log":      this.Log,
			"Ping":     this.DerivedExchange.Ping,
			"Verbose":  this.Verbose,
			"Throttle": NewThrottler(this.TokenBucket),
			"Options": map[string]any{
				"Agent": finalAgent,
			},
			"DecompressBinary": this.SafeBool(this.Options, "decompressBinary", true),
		},
		wsOptions,
	)
	var proxyUrl string = this.getWsProxy()
	client := NewWSClient(url.(string), this.DerivedExchange.HandleMessage, this.DerivedExchange.OnError, this.DerivedExchange.OnClose, this.DerivedExchange.OnConnected, proxyUrl, options)

	this.Clients[url.(string)] = client
	return client
}

func (this *Exchange) getWsProxy() string {
	proxies := this.CheckWsProxySettings()
	var proxyUrl string
	if proxySlice, ok := proxies.([]any); ok {
		httpProxy, _ := proxySlice[0].(string)
		httpsProxy, _ := proxySlice[1].(string)
		socksProxy, _ := proxySlice[2].(string)
		if httpProxy != "" {
			proxyUrl = httpProxy
		} else if httpsProxy != "" {
			proxyUrl = httpsProxy
		} else if socksProxy != "" {
			proxyUrl = socksProxy
		}
	}
	return proxyUrl
}

func (this *Exchange) WatchMultiple(args ...any) <-chan any {
	url, _ := args[0].(string)
	var messageHashes []string

	// Handle both []string and []any for messageHashes
	if hashes, ok := args[1].([]string); ok {
		messageHashes = hashes
	} else if hashesInterface, ok := args[1].([]any); ok {
		// Convert []any to []string
		messageHashes = make([]string, len(hashesInterface))
		for i, hash := range hashesInterface {
			if str, ok := hash.(string); ok {
				messageHashes[i] = str
			}
		}
	}
	var message any
	var subscribeHashes any
	var subscription any

	if len(args) >= 3 {
		message = args[2]
	}
	if len(args) >= 4 {
		subscribeHashes = args[3]
	} else {
		subscribeHashes = messageHashes
	}
	if len(args) >= 5 {
		subscription = args[4]
	}

	client := this.Client(url)
	// todo: calculate the backoff using the clients cache
	backoffDelay := 0
	//
	//  watchOrderBook ---- future ----+---------------+----→ user
	//                                 |               |
	//                                 ↓               ↑
	//                                 |               |
	//                              connect ......→ resolve
	//                                 |               |
	//                                 ↓               ↑
	//                                 |               |
	//                             subscribe -----→ receive
	//
	futures := make([]*Future, len(messageHashes))
	for i, messageHash := range messageHashes {
		futures[i] = client.NewFuture(messageHash)
	}
	future := FutureRace(futures)
	// read and write subscription, this is done before connecting the client
	// to avoid race conditions when other parts of the code read or write to the client.subscriptions
	missingSubscriptions := []string{}
	client.SubscriptionsMu.Lock()
	if subscribeHashes != nil {
		// Handle both []string and []any for subscribeHashes
		var subscribeHashesList []any
		if hashes, ok := subscribeHashes.([]string); ok {
			subscribeHashesList = make([]any, len(hashes))
			for i, hash := range hashes {
				subscribeHashesList[i] = hash
			}
		} else if hashes, ok := subscribeHashes.([]any); ok {
			subscribeHashesList = hashes
		}

		for _, subscribeHash := range subscribeHashesList {
			if hashStr, ok := subscribeHash.(string); ok {
				if _, exists := client.Subscriptions[hashStr]; !exists {
					missingSubscriptions = append(missingSubscriptions, hashStr)
					if subscription != nil {
						client.Subscriptions[hashStr] = subscription
					} else {
						client.Subscriptions[hashStr] = make(chan any)
					}
				}
			}
		}
	}
	client.SubscriptionsMu.Unlock()
	// we intentionally do not use await here to avoid unhandled exceptions
	// the policy is to make sure that 100% of promises are resolved or rejected
	// either with a call to client.resolve or client.reject with
	//  a proper exception class instance
	client.ConnectMu.Lock()
	connected, err := client.Connect(backoffDelay)
	client.ConnectMu.Unlock()
	if err != nil {
		future.Reject(err)
		for _, h := range missingSubscriptions {
			client.SubscriptionsMu.Lock()
			delete(client.Subscriptions, h)
			client.SubscriptionsMu.Unlock()
		}
		return future.Await()
	}
	// the following is executed only if the catch-clause does not
	// catch any connection-level exceptions from the client
	// (connection established successfully)
	if subscribeHashes == nil || len(missingSubscriptions) > 0 {
		go func() {
			result := <-connected.Await()
			if err, ok := result.(error); ok {
				for _, subscribeHash := range missingSubscriptions {
					delete(client.Subscriptions, subscribeHash)
				}
				future.Reject(err)
				return
			}
			options := SafeValue(this.Options, "ws", make(map[string]any))
			cost := SafeValue(options, "cost", 1)
			if message != nil {
				if this.EnableRateLimit && client.Throttle != nil {
					// add cost here |
					//               |
					//               V
					if throttleFunc, ok := client.Throttle.(func(any) error); ok {
						if err := throttleFunc(cost); err != nil {
							client.OnError(err)
						}
					}
				}
				sendFutureChannel := <-client.Send(message)
				if err, ok := sendFutureChannel.(error); ok {
					client.SubscriptionsMu.Lock()
					for _, subscribeHash := range missingSubscriptions {
						delete(client.Subscriptions, subscribeHash)
					}
					client.SubscriptionsMu.Unlock()
					future.Reject(err)
				}
			}
		}()
	}
	return future.Await()
}

// func (this *Exchange) Spawn(method any, args ...any) <-chan any {
// 	future := NewFuture()

// 	go func() {
// 		response := <-(CallDynamically(method, args...).(<-chan any))
// 		if err, ok := response.(error); ok {
// 			future.Reject(err)
// 		} else {
// 			future.Resolve(response)
// 		}
// 	}()
// 	return future.Await()
// }

func (this *Exchange) Spawn(method any, args ...any) *Future {
	future := NewFuture()

	go func() {
		response := <-(CallDynamically(method, args...).(<-chan any))
		if err, ok := response.(error); ok {
			future.Reject(err)
		} else {
			future.Resolve(response)
		}
	}()
	return future
}

func (this *Exchange) Delay(timeout any, method any, args ...any) {
	var timeoutMs int64
	switch v := timeout.(type) {
	case int:
		timeoutMs = int64(v)
	case int64:
		timeoutMs = v
	default:
		panic(fmt.Sprintf("timeout must be int or int64, got %T", timeout))
	}
	time.AfterFunc(time.Duration(timeoutMs)*time.Millisecond, func() {
		this.Spawn(method, args...)
	})
}

func (this *Exchange) LoadOrderBook(client any, messageHash any, symbol any, optionalArgs ...any) <-chan any {
	limit := GetArg(optionalArgs, 0, nil)
	params := GetArg(optionalArgs, 1, map[string]any{})
	maxRetries := this.HandleOption("watchOrderBook", "snapshotMaxRetries", 3)
	tries := 0
	if stored, exists := this.Orderbooks.Load(symbol.(string)); exists {
		orderBookInterface := stored.(OrderBookInterface)
		for tries < maxRetries.(int) {
			orderBook := <-this.FetchRestOrderBookSafe(symbol, limit, params)
			cache := (*orderBookInterface.GetCache()).([]any)
			index := ToFloat64(this.DerivedExchange.GetCacheIndex(orderBook, cache))
			if index >= 0 {
				// Call Reset method on stored orderbook
				orderBookInterface.Reset(orderBook)
				this.DerivedExchange.HandleDeltas(stored, cache[int(index):])
				orderBookInterface.SetCache(map[string]any{})
				// this.SetProperty(cache, "length", 0)
				client.(*Client).Resolve(stored, messageHash)
				return nil
			}
			tries++
		}
		errorMsg := fmt.Sprintf("%s nonce is behind the cache after %v tries.", this.Id, maxRetries)
		client.(*Client).Reject(ExchangeError(errorMsg), messageHash)
		delete(this.Clients, client.(*Client).Url)
	} else {
		client.(*Client).Reject(ExchangeError(this.Id+" loadOrderBook() orderbook is not initiated"), messageHash)
		return nil
	}
	// TODO: don't know where this fits
	// catch (e) {
	// 	client.reject (e, messageHash);
	// 	await this.loadOrderBook (client, messageHash, symbol, limit, params);
	// }
	return nil
}

func (this *Exchange) Close() []error {
	this.WsClientsMu.Lock()
	clients := make([]*WSClient, 0, len(this.Clients))
	for _, c := range this.Clients {
		clients = append(clients, c.(*WSClient))
	}
	this.Clients = make(map[string]any)
	this.WsClientsMu.Unlock()
	errs := make([]error, 0)
	for _, c := range clients {
		if future := c.Close(); future != nil {
			if errVal, ok := (<-future.Await()).(error); ok {
				errs = append(errs, errVal)
			}

			userClosedError := ExchangeClosedByUser()
			c.OnError(userClosedError)
		}
	}
	return errs
}

// ---------------- Connection lifecycle helpers ----------------

func CallDynamically(fn any, args ...any) any {
	v := reflect.ValueOf(fn)
	in := make([]reflect.Value, len(args))
	for i, a := range args {
		r := reflect.ValueOf(a)
		if !r.IsValid() {
			r = reflect.Zero(reflect.TypeOf((*any)(nil)).Elem())
		}
		in[i] = r
	}
	out := v.Call(in)
	if len(out) > 0 {
		return out[0].Interface()
	}
	return nil
}

func (this *Exchange) Crc32(str any, signed2 bool) int64 {
	// signed := false
	// if len(signed2) > 0 {
	// 	if b, ok := signed2[0].(bool); ok {
	// 		signed = b
	// 	}
	// }
	return Crc32(str.(string), signed2)
}

func (this *Exchange) IsBinaryMessage(message any) bool {
	if _, ok := message.([]byte); ok {
		return true
	}
	return false
}

func (this *Exchange) DecodeProtoMsg(message any) any {
	var msg pb.PushDataV3ApiWrapper
	if err := proto.Unmarshal(message.([]byte), &msg); err != nil {
		panic(fmt.Sprintf("failed to unmarshal proto message: %v", err))
	}
	jsonBytes, _ := protojson.Marshal(&msg)
	var v any
	_ = json.Unmarshal(jsonBytes, &v)
	return v
}

func (this *Exchange) Uuid5(namespace any, name any) string {
	return ""
}

func (this *Exchange) LockId() bool {
	this.idMutex.Lock()
	return true
}

func (this *Exchange) UnlockId() bool {
	this.idMutex.Unlock()
	return true
}
