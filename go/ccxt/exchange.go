package ccxt

import (
	j "encoding/json"
	"errors"
	"fmt"
	"reflect"
	"regexp"
	"strconv"
	"strings"
)

type Exchange struct {
	version             string
	Version             string
	id                  string
	Id                  string
	name                string
	options             map[string]interface{}
	Options             map[string]interface{}
	has                 map[string]interface{}
	Has                 map[string]interface{}
	Api                 map[string]interface{}
	TransformedApi      map[string]interface{}
	markets             map[string]interface{}
	currencies          map[string]interface{}
	requiredCredentials map[string]interface{}
	markets_by_id       map[string]interface{}
	timeframes          map[string]interface{}
	exceptions          map[string]interface{}
	precision           map[string]interface{}
	urls                interface{}
	userAgents          map[string]interface{}
	timeout             int64
	rateLimit           float64
	newUpdates          bool
	alias               bool
	verbose             bool
	Verbose             bool
	userAgent           string
	enableRateLimit     bool
	url                 string
	hostname            string
	baseCurrencies      map[string]interface{}
	quoteCurrencies     map[string]interface{}
	reloadingMarkets    bool
	marketsLoading      bool
	symbols             []string
	codes               []string
	ids                 []string
	commonCurrencies    map[string]interface{}
	precisionMode       int
	limits              map[string]interface{}
	fees                map[string]interface{}
	currencies_by_id    map[string]interface{}
	reduceFees          bool

	accountsById interface{}
	accounts     interface{}

	// timestamps
	lastRestRequestTimestamp int64
	last_request_headers     interface{}
	last_request_body        interface{}
	last_request_url         interface{}

	// type check this
	number interface{}
	// keys
	secret        string
	apiKey        string
	password      string
	uid           string
	accountId     string
	token         string
	login         string
	privateKey    string
	walletAddress string

	httpProxy            string
	httpsProxy           string
	http_proxy           string
	https_proxy          string
	proxy                string
	proxyUrl             string
	proxyUrlCallback     interface{}
	proxy_url            string
	proxy_url_callback   interface{}
	socksProxy           string
	socks_proxy          string
	socks_proxy_callback interface{}

	httpsProxyCallback   interface{}
	https_proxy_callback interface{}

	httpProxyCallback   interface{}
	http_proxy_callback interface{}
	socksProxyCallback  interface{}

	wsSocksProxy   string
	ws_socks_proxy string

	wssProxy  string
	wss_proxy string

	ws_proxy string
	wsProxy  string

	substituteCommonCurrencyCodes bool

	twofa interface{}

	paddingMode int
}

var DECIMAL_PLACES int = 0
var SIGNIFICANT_DIGITS int = 1
var TICK_SIZE int = 2

var TRUNCATE int = 1

var NO_PADDING = 0
var PAD_WITH_ZERO int = 1

var ROUND int = 0

func (this *Exchange) Init(userConfig map[string]interface{}, exchangeConfig map[string]interface{}) {
	// this = &Exchange{}
	// var properties = this.describe()
	var extendedProperties = this.deepExtend(exchangeConfig, userConfig)

	// this.id = SafeString(extendedProperties, "id", "").(string)
	// this.Id = this.id
	this.initializeProperties(extendedProperties)

	this.transformApiNew(this.Api)

	fmt.Println(this.TransformedApi)
}

func (this *Exchange) loadMarkets(params ...interface{}) {
	// to do
	// this.safeBool()
}

func (this *Exchange) throttle(cost interface{}) {
	// to do
}

func (this *Exchange) log(args ...interface{}) {
	// convert to str and print
	fmt.Println(args)
}

func (this *Exchange) callEndpoint(endpoint2 interface{}, parameters interface{}) interface{} {
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
		res := this.fetch2(path, api, method, parameters, map[string]interface{}{}, nil, map[string]interface{}{"cost": cost})
		return res
	}
	return nil
}

func NewError(err interface{}, v ...interface{}) string {
	str := ToString(err)
	// for i := 0; i < len(v); i++ {
	// 	if i > 0 {
	// 		str = str.ToString() + " "
	// 	}
	// 	str += str + ToString(v[i])
	// } // to do check this out later
	return str
}

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
func (this *Exchange) json(object interface{}) interface{} {
	jsonBytes, err := j.Marshal(object)
	if err != nil {
		return nil
	}
	return string(jsonBytes)
}

func (this *Exchange) parseNumber(v interface{}, a ...interface{}) interface{} {
	f, err := ToSafeFloat(v)
	if err == nil {
		return f
	}
	return nil
}

func (this *Exchange) valueIsDefined(v interface{}) bool {
	return v != nil
}

func callDynamically(args ...interface{}) interface{} {
	// to do
	return nil
}

// clone creates a deep copy of the input object. It supports arrays, slices, and maps.
func (this *Exchange) clone(object interface{}) interface{} {
	return this.deepCopy(reflect.ValueOf(object)).Interface()
}

func (this *Exchange) deepCopy(value reflect.Value) reflect.Value {
	switch value.Kind() {
	case reflect.Array, reflect.Slice:
		// Create a new slice/array of the same type and length
		copy := reflect.MakeSlice(value.Type(), value.Len(), value.Cap())
		for i := 0; i < value.Len(); i++ {
			copy.Index(i).Set(this.deepCopy(value.Index(i)))
		}
		return copy
	case reflect.Map:
		// Create a new map of the same type
		copy := reflect.MakeMap(value.Type())
		for _, key := range value.MapKeys() {
			copy.SetMapIndex(key, this.deepCopy(value.MapIndex(key)))
		}
		return copy
	default:
		// For other types, just return the value
		return reflect.ValueOf(value.Interface())
	}
}

type ArrayCache interface {
	ToArray() []interface{}
}

func (this *Exchange) arraySlice(array interface{}, first interface{}, second ...interface{}) interface{} {
	firstInt := reflect.ValueOf(first).Convert(reflect.TypeOf(0)).Interface().(int)
	parsedArray := reflect.ValueOf(array)

	if parsedArray.Kind() != reflect.Slice {
		return nil
	}

	length := parsedArray.Len()
	isArrayCache := reflect.TypeOf(array).Implements(reflect.TypeOf((*ArrayCache)(nil)).Elem())

	if len(second) == 0 {
		if firstInt < 0 {
			index := length + firstInt
			if index < 0 {
				index = 0
			}
			if isArrayCache {
				return reflect.ValueOf(array).Interface().(ArrayCache).ToArray()[index:]
			}
			return this.sliceToInterface(parsedArray.Slice(index, length))
		}
		if isArrayCache {
			return reflect.ValueOf(array).Interface().(ArrayCache).ToArray()[firstInt:]
		}
		return this.sliceToInterface(parsedArray.Slice(firstInt, length))
	}

	secondInt := reflect.ValueOf(second[0]).Convert(reflect.TypeOf(0)).Interface().(int)
	if isArrayCache {
		return reflect.ValueOf(array).Interface().(ArrayCache).ToArray()[firstInt:secondInt]
	}
	return this.sliceToInterface(parsedArray.Slice(firstInt, secondInt))
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

func (this *Exchange) parseTimeframe(timeframe interface{}) *int {
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
	return &result
}

func (this *Exchange) checkAddress(add interface{}) bool {
	return true
}

func totp(secret interface{}) string {
	return ""
}

func (this *Exchange) parseJson(input interface{}) interface{} {
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
					pathParts[i] = strings.Title(strings.ToLower(part))
				}
				path := strings.Join(pathParts, "")
				if len(path) > 0 {
					path = strings.ToLower(string(path[0])) + path[1:]
				}

				apiObj := interface{}(paths)
				if len(paths) == 1 {
					apiObj = paths[0]
				}

				this.TransformedApi[path] = Dict{
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
