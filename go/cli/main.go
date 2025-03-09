package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand/v2"
	"os"
	"strings"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

var Red = "\033[31m"
var Green = "\033[32m"
var Yellow = "\033[33m"
var Blue = "\033[34m"
var Reset = "\033[0m"

const (
	ROOT_DIR = "/../"
)

var rateLimit = true
var verbose = false
var noKeys = false
var timeIt = false

func getRandomKeyFromList(list []string) string {
	randomIndex := rand.IntN(len(list) - 1)
	return list[randomIndex]
}

func benchmarks() {
	exchange := ccxt.NewBinanceCore()
	exchange.Init(nil)

	dir := GetRootDir()

	baseDir := dir + "/go/cli"

	marketsFile := baseDir + "/bench/markets.json"
	marketsContent := IoFileRead(marketsFile, true)

	tickersFile := baseDir + "/bench/tickers.json"
	ohlcvFile := baseDir + "/bench/ohlcv.json"
	orderBookFile := baseDir + "/bench/orderbook.json"
	tradesFile := baseDir + "/bench/trades.json"

	tickersContent := IoFileRead(tickersFile, true)
	ohlcvContent := IoFileRead(ohlcvFile, true)
	orderBookContent := IoFileRead(orderBookFile, true)
	tradesContent := IoFileRead(tradesFile, true)

	exchange.Markets = marketsContent.(map[string]interface{})

	beforeTickerNs := time.Now().UnixNano()
	_ = exchange.ParseTickers(tickersContent)
	afterTickerNs := time.Now().UnixNano()
	_ = exchange.ParseOHLCV(ohlcvContent)
	afterOHLCV := time.Now().UnixNano()
	ob := exchange.ParseOrderBook(orderBookContent, "BTC/USDT")
	afterOrderBook := time.Now().UnixNano()
	_ = exchange.ParseTrades(tradesContent)
	afterTrades := time.Now().UnixNano()

	tickerNs := afterTickerNs - beforeTickerNs
	ohlcvNs := afterOHLCV - afterTickerNs
	orderBookNs := afterOrderBook - afterOHLCV
	tradesNs := afterTrades - afterOrderBook
	fmt.Println("|--------------------------------------------|")
	fmt.Println("| [2000+] parseTickers:   ", tickerNs, "ns ", tickerNs/1000000, "ms")
	fmt.Println("| [500]   parseOHLCV:     ", afterOHLCV-afterTickerNs, "ns ", ohlcvNs/1000000, "ms")
	fmt.Println("| [5000]  parseOrderBook: ", afterOrderBook-afterOHLCV, "ns ", orderBookNs/1000000, "ms")
	fmt.Println("| [1000]  parseTrades:    ", afterTrades-afterOrderBook, "ns ", tradesNs/1000000, "ms")
	fmt.Println("|--------------------------------------------|")

	testMap := map[string]interface{}{
		"first":  1,
		"second": "2",
		"third":  3.0,
	}

	testMapKeys := []string{"first", "second", "third"}

	toExtendMap := map[string]interface{}{
		"fourth": 4,
		"first":  2,
		"third": map[string]interface{}{
			"nested": 3,
		},
	}

	testArr := []interface{}{
		1,
		"2",
		3.0,
	}

	// safeNumber on a map
	var safeNumberRes int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = exchange.SafeNumber(testMap, getRandomKeyFromList(testMapKeys))
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		safeNumberRes += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  safeNumber on a map:     ", safeNumberRes, "ns")
	fmt.Println("|  safeNumber on a map avg: ", safeNumberRes/1000, "ns")

	var safeNumberResArr int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = exchange.SafeNumber(testArr, 0)
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		safeNumberResArr += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  safeNumber on an array:     ", safeNumberResArr, "ns")
	fmt.Println("|  safeNumber on an array avg: ", safeNumberResArr/1000, "ns")
	fmt.Println("|--------------------------------------------|")

	var safeIntegerRes int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = exchange.SafeInteger(testMap, getRandomKeyFromList(testMapKeys))
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		safeIntegerRes += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  safeInteger on a map:     ", safeIntegerRes, "ns")
	fmt.Println("|  safeInteger on a map avg: ", safeIntegerRes/1000, "ns")
	fmt.Println("|--------------------------------------------|")

	var safeIntegerResArr int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = exchange.SafeInteger(testArr, 0)
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		safeIntegerResArr += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  safeInteger on an array:     ", safeIntegerResArr, "ns")
	fmt.Println("|  safeInteger on an array avg: ", safeIntegerResArr/1000, "ns")
	fmt.Println("|--------------------------------------------|")

	var safeStringRes int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = exchange.SafeString(testMap, getRandomKeyFromList(testMapKeys))
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		safeStringRes += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  safeString on a map:     ", safeStringRes, "ns")
	fmt.Println("|  safeString on a map avg: ", safeStringRes/1000, "ns")
	fmt.Println("|--------------------------------------------|")

	var safeStringResArr int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = exchange.SafeString(testArr, 0)
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		safeStringResArr += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  safeString on an array:     ", safeStringResArr, "ns")
	fmt.Println("|  safeString on an array avg: ", safeStringResArr/1000, "ns")
	fmt.Println("|--------------------------------------------|")

	var deepExtendRes int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = exchange.DeepExtend(testMap, toExtendMap)
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		deepExtendRes += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  deepExtend on a map:     ", deepExtendRes, "ns")
	fmt.Println("|  deepExtend on a map avg: ", deepExtendRes/1000, "ns")
	fmt.Println("|--------------------------------------------|")

	var inOpRes int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = ccxt.InOp("first", testMap)
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		inOpRes += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  inOp on a map:     ", inOpRes, "ns")
	fmt.Println("|  inOp on a map avg: ", inOpRes/1000, "ns")
	fmt.Println("|--------------------------------------------|")

	var getValueRes int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = ccxt.GetValue(testMap, getRandomKeyFromList(testMapKeys))
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		getValueRes += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  getValue on a map:     ", getValueRes, "ns")
	fmt.Println("|  getValue on a map avg: ", getValueRes/1000, "ns")
	fmt.Println("|--------------------------------------------|")

	var getValueArrRes int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = ccxt.GetValue(testArr, 0)
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		getValueArrRes += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  getValue on an array:     ", getValueArrRes, "ns")
	fmt.Println("|  getValue on an array avg: ", getValueArrRes/1000, "ns")
	fmt.Println("|--------------------------------------------|")

	obBids := ccxt.GetValue(ob, "bids")
	var sortByRes int64 = 0
	for i := 0; i < 1000; i++ {
		beforeNs := time.Now().UnixNano()
		_ = exchange.SortBy(obBids, 0)
		afterNs := time.Now().UnixNano()
		took := afterNs - beforeNs
		sortByRes += took
	}

	fmt.Println("|--------------------------------------------|")
	fmt.Println("|  sortBy on an array:     ", sortByRes, "ns")
	fmt.Println("|  sortBy on an array avg: ", sortByRes/1000, "ns")
	fmt.Println("|  sortBy on an array avg: ", sortByRes/1000/1000000, "ms")
	fmt.Println("|--------------------------------------------|")
}

func contains(arr []interface{}, item interface{}) bool {
	for _, a := range arr {
		if a == item {
			return true
		}
	}
	return false
}

func containsStr(arr []string, item string) bool {
	for _, a := range arr {
		if a == item {
			return true
		}
	}
	return false
}

func JsonParse(jsonStr2 interface{}) interface{} {
	jsonStr := jsonStr2.(string)
	var result interface{}
	err := json.Unmarshal([]byte(jsonStr), &result)
	if err != nil {
		return nil
	}
	return result
}

func GetRootDir() string {
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}
	if strings.HasSuffix(dir, "/ccxt") {
		return dir + "/"
	}
	res := dir + ROOT_DIR
	return res
}

func IoFileRead(path interface{}, decode ...interface{}) interface{} {
	var shouldDecode bool
	if len(decode) > 0 {
		shouldDecode = decode[0].(bool)
	}

	switch p := path.(type) {
	case string:
		content, err := ioutil.ReadFile(p)
		if err != nil {
			log.Fatal(err)
		}

		if shouldDecode {
			var result interface{}
			err := json.Unmarshal(content, &result)
			if err != nil {
				log.Fatal(err)
			}
			return result
		}
		resStr := string(content)
		jsonObject := JsonParse(resStr)
		return jsonObject
	default:
		log.Fatal("ioFileRead expects a string for the path")
		return nil
	}
}

func IoFileExists(path interface{}) bool {
	switch p := path.(type) {
	case string:
		_, err := os.Stat(p)
		return !os.IsNotExist(err)
	default:
		log.Fatal("ioFileExists expects a string")
		return false
	}
}

func InitOptions(instance ccxt.IExchange, flags []string) {
	if containsStr(flags, "--verbose") {
		// instance.SetVerbose(true)
		verbose = true
	}

	if containsStr(flags, "--no-keys") {
		noKeys = true
	}

	if containsStr(flags, "--sandbox") {
		instance.SetSandboxMode(true)
	}

	if containsStr(flags, "--time") {
		timeIt = true
	}

	if containsStr(flags, "--rate") {
		rateLimit = false
	}

}

func PrettyPrintData(data interface{}) {
	if prettyOutput, err := json.MarshalIndent(data, "", "  "); err == nil {
		fmt.Println(Blue + string(prettyOutput) + Reset)
	} else {
	}
}

func SetCredential(instance ccxt.IExchange, key string, value string) {
	switch key {
	case "apiKey":
		instance.SetApiKey(value)
	case "secret":
		instance.SetSecret(value)
	case "uid":
		instance.SetUid(value)
	case "password":
		instance.SetPassword(value)
	case "walletAddress":
		instance.SetWalletAddress(value)
	case "privateKey":
		instance.SetPrivateKey(value)
	}
}

func SetCredentials(instance ccxt.IExchange) {
	credentials := instance.GetRequiredCredentials()

	for key, value := range credentials {
		valBool := value.(bool)
		if valBool {
			parsedKey := strings.ToUpper(instance.GetId()) + "_" + strings.ToUpper(key)

			res := os.Getenv(parsedKey)
			if res != "" {
				SetCredential(instance, key, res)
			}
		}
	}
}

func main() {

	if containsStr(os.Args, "--bench") {
		benchmarks()
		return
	}

	args := os.Args
	if len(args) < 3 {
		panic("Exchange name and method required: Example: go run main.go binance fetchTicker \"BTC/USDT\"")
	}

	exchangeName := args[1]
	method := args[2]

	fmt.Println("Exchange name: ", Green+exchangeName+Reset)
	fmt.Println("Method: ", Green+method+Reset)

	exchangeFile := GetRootDir() + "exchanges.json"

	if !IoFileExists(exchangeFile) {
		panic(Red + "exchanges.json file not found" + Reset)
	}

	exchangeIds := IoFileRead(exchangeFile, true)
	exchangeIdsMap := exchangeIds.(map[string]interface{})
	exchangeIdsList := exchangeIdsMap["ids"].([]interface{})

	if !contains(exchangeIdsList, exchangeName) {
		panic(Red + "Exchange not found in exchanges.json" + Reset)
	}

	var flags []string
	for _, arg := range args[2:] {
		if strings.HasPrefix(arg, "--") {
			flags = append(flags, arg)
		}
	}

	var parameters []interface{}
	for _, arg := range args[3:] {
		if !strings.HasPrefix(arg, "--") {
			// parameters = append(parameters, arg)
			if strings.HasPrefix(arg, "{") {
				parameters = append(parameters, JsonParse(arg))
			} else if strings.HasPrefix(arg, "[") {
				parameters = append(parameters, JsonParse(arg))
			} else if arg == "null" {
				parameters = append(parameters, nil)
			} else if arg == "true" {
				parameters = append(parameters, true)
			} else if arg == "false" {
				parameters = append(parameters, false)
			} else {
				parameters = append(parameters, arg)
			}
		}
	}

	instance, suc := ccxt.DynamicallyCreateInstance(exchangeName, nil)

	if !suc {
		panic(suc)
	}

	InitOptions(instance, flags)

	if !noKeys {
		SetCredentials(instance)
	}

	<-instance.LoadMarkets()

	if verbose {
		instance.SetVerbose(true)
	}

	if !rateLimit {
		instance.SetRateLimit(false)
	}

	before := time.Now().UnixMilli()

	res := <-instance.CallInternal(method, parameters...)

	after := time.Now().UnixMilli()

	PrettyPrintData(res)

	fmt.Println("Execution time: ", Yellow, after-before, "ms", Reset)

}
