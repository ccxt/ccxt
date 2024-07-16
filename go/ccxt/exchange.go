package ccxt

import (
	j "encoding/json"
	"errors"
	"fmt"
	"reflect"
	"strconv"
)

type Exchange struct {
	version             string
	id                  string
	options             map[string]interface{}
	has                 map[string]interface{}
	api                 map[string]interface{}
	transformedApi      map[string]interface{}
	markets             map[string]interface{}
	currencies          map[string]interface{}
	requiredCredentials map[string]interface{}
	markets_by_id       map[string]interface{}
	timeframes          map[string]interface{}
	exceptions          map[string]interface{}
	precision           map[string]interface{}
	urls                interface{}
	verbose             bool
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

func (this *Exchange) loadMarkets(params ...interface{}) {
	// to do
	// this.safeBool()
}

func (this *Exchange) describe() map[string]interface{} {
	return map[string]interface{}{
		"id":              nil,
		"name":            nil,
		"countries":       nil,
		"enableRateLimit": true,
		"rateLimit":       2000,
		"certified":       false,
		"pro":             false,
		"alias":           false,
		"dex":             false,
		"has": map[string]interface{}{
			"publicAPI":                              true,
			"privateAPI":                             true,
			"CORS":                                   nil,
			"sandbox":                                nil,
			"spot":                                   nil,
			"margin":                                 nil,
			"swap":                                   nil,
			"future":                                 nil,
			"option":                                 nil,
			"addMargin":                              nil,
			"borrowCrossMargin":                      nil,
			"borrowIsolatedMargin":                   nil,
			"borrowMargin":                           nil,
			"cancelAllOrders":                        nil,
			"cancelAllOrdersWs":                      nil,
			"cancelOrder":                            true,
			"cancelOrderWs":                          nil,
			"cancelOrders":                           nil,
			"cancelOrdersWs":                         nil,
			"closeAllPositions":                      nil,
			"closePosition":                          nil,
			"createDepositAddress":                   nil,
			"createLimitBuyOrder":                    nil,
			"createLimitBuyOrderWs":                  nil,
			"createLimitOrder":                       true,
			"createLimitOrderWs":                     nil,
			"createLimitSellOrder":                   nil,
			"createLimitSellOrderWs":                 nil,
			"createMarketBuyOrder":                   nil,
			"createMarketBuyOrderWs":                 nil,
			"createMarketBuyOrderWithCost":           nil,
			"createMarketBuyOrderWithCostWs":         nil,
			"createMarketOrder":                      true,
			"createMarketOrderWs":                    true,
			"createMarketOrderWithCost":              nil,
			"createMarketOrderWithCostWs":            nil,
			"createMarketSellOrder":                  nil,
			"createMarketSellOrderWs":                nil,
			"createMarketSellOrderWithCost":          nil,
			"createMarketSellOrderWithCostWs":        nil,
			"createOrder":                            true,
			"createOrderWs":                          nil,
			"createOrders":                           nil,
			"createOrderWithTakeProfitAndStopLoss":   nil,
			"createOrderWithTakeProfitAndStopLossWs": nil,
			"createPostOnlyOrder":                    nil,
			"createPostOnlyOrderWs":                  nil,
			"createReduceOnlyOrder":                  nil,
			"createReduceOnlyOrderWs":                nil,
			"createStopLimitOrder":                   nil,
			"createStopLimitOrderWs":                 nil,
			"createStopLossOrder":                    nil,
			"createStopLossOrderWs":                  nil,
			"createStopMarketOrder":                  nil,
			"createStopMarketOrderWs":                nil,
			"createStopOrder":                        nil,
			"createStopOrderWs":                      nil,
			"createTakeProfitOrder":                  nil,
			"createTakeProfitOrderWs":                nil,
			"createTrailingAmountOrder":              nil,
			"createTrailingAmountOrderWs":            nil,
			"createTrailingPercentOrder":             nil,
			"createTrailingPercentOrderWs":           nil,
			"createTriggerOrder":                     nil,
			"createTriggerOrderWs":                   nil,
			"deposit":                                nil,
			"editOrder":                              "emulated",
			"editOrderWs":                            nil,
			"fetchAccounts":                          nil,
			"fetchBalance":                           true,
			"fetchBalanceWs":                         nil,
			"fetchBidsAsks":                          nil,
			"fetchBorrowInterest":                    nil,
			"fetchBorrowRate":                        nil,
			"fetchBorrowRateHistories":               nil,
			"fetchBorrowRateHistory":                 nil,
			"fetchBorrowRates":                       nil,
			"fetchBorrowRatesPerSymbol":              nil,
			"fetchCanceledAndClosedOrders":           nil,
			"fetchCanceledOrders":                    nil,
			"fetchClosedOrder":                       nil,
			"fetchClosedOrders":                      nil,
			"fetchClosedOrdersWs":                    nil,
			"fetchConvertCurrencies":                 nil,
			"fetchConvertQuote":                      nil,
			"fetchConvertTrade":                      nil,
			"fetchConvertTradeHistory":               nil,
			"fetchCrossBorrowRate":                   nil,
			"fetchCrossBorrowRates":                  nil,
			"fetchCurrencies":                        "emulated",
			"fetchCurrenciesWs":                      "emulated",
			"fetchDeposit":                           nil,
			"fetchDepositAddress":                    nil,
			"fetchDepositAddresses":                  nil,
			"fetchDepositAddressesByNetwork":         nil,
			"fetchDeposits":                          nil,
			"fetchDepositsWithdrawals":               nil,
			"fetchDepositsWs":                        nil,
			"fetchDepositWithdrawFee":                nil,
			"fetchDepositWithdrawFees":               nil,
			"fetchFundingHistory":                    nil,
			"fetchFundingRate":                       nil,
			"fetchFundingRateHistory":                nil,
			"fetchFundingRates":                      nil,
			"fetchGreeks":                            nil,
			"fetchIndexOHLCV":                        nil,
			"fetchIsolatedBorrowRate":                nil,
			"fetchIsolatedBorrowRates":               nil,
			"fetchMarginAdjustmentHistory":           nil,
			"fetchIsolatedPositions":                 nil,
			"fetchL2OrderBook":                       true,
			"fetchL3OrderBook":                       nil,
			"fetchLastPrices":                        nil,
			"fetchLedger":                            nil,
			"fetchLedgerEntry":                       nil,
			"fetchLeverage":                          nil,
			"fetchLeverages":                         nil,
			"fetchLeverageTiers":                     nil,
			"fetchLiquidations":                      nil,
			"fetchMarginMode":                        nil,
			"fetchMarginModes":                       nil,
			"fetchMarketLeverageTiers":               nil,
			"fetchMarkets":                           true,
			"fetchMarketsWs":                         nil,
			"fetchMarkOHLCV":                         nil,
			"fetchMyLiquidations":                    nil,
			"fetchMySettlementHistory":               nil,
			"fetchMyTrades":                          nil,
			"fetchMyTradesWs":                        nil,
			"fetchOHLCV":                             nil,
			"fetchOHLCVWs":                           nil,
			"fetchOpenInterest":                      nil,
			"fetchOpenInterestHistory":               nil,
			"fetchOpenOrder":                         nil,
			"fetchOpenOrders":                        nil,
			"fetchOpenOrdersWs":                      nil,
			"fetchOption":                            nil,
			"fetchOptionChain":                       nil,
			"fetchOrder":                             nil,
			"fetchOrderBook":                         true,
			"fetchOrderBooks":                        nil,
			"fetchOrderBookWs":                       nil,
			"fetchOrders":                            nil,
			"fetchOrdersByStatus":                    nil,
			"fetchOrdersWs":                          nil,
			"fetchOrderTrades":                       nil,
			"fetchOrderWs":                           nil,
			"fetchPermissions":                       nil,
			"fetchPosition":                          nil,
			"fetchPositionHistory":                   nil,
			"fetchPositionsHistory":                  nil,
			"fetchPositionWs":                        nil,
			"fetchPositionMode":                      nil,
			"fetchPositions":                         nil,
			"fetchPositionsWs":                       nil,
			"fetchPositionsForSymbol":                nil,
			"fetchPositionsForSymbolWs":              nil,
			"fetchPositionsRisk":                     nil,
			"fetchPremiumIndexOHLCV":                 nil,
			"fetchSettlementHistory":                 nil,
			"fetchStatus":                            nil,
			"fetchTicker":                            true,
			"fetchTickerWs":                          nil,
			"fetchTickers":                           nil,
			"fetchTickersWs":                         nil,
			"fetchTime":                              nil,
			"fetchTrades":                            true,
			"fetchTradesWs":                          nil,
			"fetchTradingFee":                        nil,
			"fetchTradingFees":                       nil,
			"fetchTradingFeesWs":                     nil,
			"fetchTradingLimits":                     nil,
			"fetchTransactionFee":                    nil,
			"fetchTransactionFees":                   nil,
			"fetchTransactions":                      nil,
			"fetchTransfer":                          nil,
			"fetchTransfers":                         nil,
			"fetchUnderlyingAssets":                  nil,
			"fetchVolatilityHistory":                 nil,
			"fetchWithdrawAddresses":                 nil,
			"fetchWithdrawal":                        nil,
			"fetchWithdrawals":                       nil,
			"fetchWithdrawalsWs":                     nil,
			"fetchWithdrawalWhitelist":               nil,
			"reduceMargin":                           nil,
			"repayCrossMargin":                       nil,
			"repayIsolatedMargin":                    nil,
			"setLeverage":                            nil,
			"setMargin":                              nil,
			"setMarginMode":                          nil,
			"setPositionMode":                        nil,
			"signIn":                                 nil,
			"transfer":                               nil,
			"watchBalance":                           nil,
			"watchMyTrades":                          nil,
			"watchOHLCV":                             nil,
			"watchOHLCVForSymbols":                   nil,
			"watchOrderBook":                         nil,
			"watchOrderBookForSymbols":               nil,
			"watchOrders":                            nil,
			"watchOrdersForSymbols":                  nil,
			"watchPosition":                          nil,
			"watchPositions":                         nil,
			"watchStatus":                            nil,
			"watchTicker":                            nil,
			"watchTickers":                           nil,
			"watchTrades":                            nil,
			"watchTradesForSymbols":                  nil,
			"watchLiquidations":                      nil,
			"watchLiquidationsForSymbols":            nil,
			"watchMyLiquidations":                    nil,
			"watchMyLiquidationsForSymbols":          nil,
			"withdraw":                               nil,
			"ws":                                     nil,
		},
		"urls": map[string]interface{}{
			"logo": nil,
			"api":  nil,
			"www":  nil,
			"doc":  nil,
			"fees": nil,
		},
		"api": nil,
		"requiredCredentials": map[string]interface{}{
			"apiKey":        true,
			"secret":        true,
			"uid":           false,
			"accountId":     false,
			"login":         false,
			"password":      false,
			"twofa":         false,
			"privateKey":    false,
			"walletAddress": false,
			"token":         false,
		},
		"markets":    nil,
		"currencies": map[string]interface{}{},
		"timeframes": nil,
		"fees": map[string]interface{}{
			"trading": map[string]interface{}{
				"tierBased":  nil,
				"percentage": nil,
				"taker":      nil,
				"maker":      nil,
			},
			"funding": map[string]interface{}{
				"tierBased":  nil,
				"percentage": nil,
				"withdraw":   map[string]interface{}{},
				"deposit":    map[string]interface{}{},
			},
		},
		"status": map[string]interface{}{
			"status":  "ok",
			"updated": nil,
			"eta":     nil,
			"url":     nil,
		},
		"exceptions": nil,
		"httpExceptions": map[string]interface{}{
			"422": ExchangeError,
			"418": DDoSProtection,
			"429": RateLimitExceeded,
			"404": ExchangeNotAvailable,
			"409": ExchangeNotAvailable,
			"410": ExchangeNotAvailable,
			"451": ExchangeNotAvailable,
			"500": ExchangeNotAvailable,
			"501": ExchangeNotAvailable,
			"502": ExchangeNotAvailable,
			"520": ExchangeNotAvailable,
			"521": ExchangeNotAvailable,
			"522": ExchangeNotAvailable,
			"525": ExchangeNotAvailable,
			"526": ExchangeNotAvailable,
			"400": ExchangeNotAvailable,
			"403": ExchangeNotAvailable,
			"405": ExchangeNotAvailable,
			"503": ExchangeNotAvailable,
			"530": ExchangeNotAvailable,
			"408": RequestTimeout,
			"504": RequestTimeout,
			"401": AuthenticationError,
			"407": AuthenticationError,
			"511": AuthenticationError,
		},
		"commonCurrencies": map[string]interface{}{
			"XBT":   "BTC",
			"BCC":   "BCH",
			"BCHSV": "BSV",
		},
		"precisionMode": DECIMAL_PLACES,
		"paddingMode":   NO_PADDING,
		"limits": map[string]interface{}{
			"leverage": map[string]interface{}{
				"min": nil,
				"max": nil,
			},
			"amount": map[string]interface{}{
				"min": nil,
				"max": nil,
			},
			"price": map[string]interface{}{
				"min": nil,
				"max": nil,
			},
			"cost": map[string]interface{}{
				"min": nil,
				"max": nil,
			},
		},
	} // return
}

func (this *Exchange) throttle(cost interface{}) {
	// to do
}

func (this *Exchange) log(args ...interface{}) {
	// convert to str and print
	fmt.Println(args)
}

func (this *Exchange) call(method interface{}, parameters interface{}) interface{} {
	return nil // tbd
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
