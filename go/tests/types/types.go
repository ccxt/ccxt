package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/ccxt/ccxt/v4"
)

const (
	// ROOT_DIR = "/../../"
	ROOT_DIR = "/../"
	BASE_DIR = "go/tests/types/static/"
)

var Red = "\033[31m"
var GreenC = "\033[32m"
var YellowC = "\033[33m"
var BlueC = "\033[34m"
var Reset = "\033[0m"

func Green(str string) {
	fmt.Println(GreenC + str + Reset)
}

func Yellow(str string) {
	fmt.Println(YellowC + str + Reset)
}

func Blue(str string) {
	fmt.Println(BlueC + str + Reset)
}

func Assert(cond bool) {
	if !cond {
		panic("Assertion failed")
	}
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
			panic(err)
		}

		if shouldDecode {
			var result interface{}
			err := json.Unmarshal(content, &result)
			if err != nil {
				panic(err)
			}
			return result
		}
		resStr := string(content)
		jsonObject := JsonParse(resStr)
		return jsonObject
	default:
		return nil
	}
}

func testOrderBook(exchange ccxt.Binance) {
	Blue("Testing OrderBook type")
	obFile := GetRootDir() + BASE_DIR + "orderbook.json"
	obFileContent := IoFileRead(obFile, true)

	parsedOb := exchange.ParseOrderBook(obFileContent, "BTC/USDT")
	typedOb := ccxt.NewOrderBook(parsedOb)
	Assert(*typedOb.Symbol == "BTC/USDT")
	Assert(len(typedOb.Asks) > 0)
	Assert(len(typedOb.Bids) > 0)
	Assert(typedOb.Asks[0][0] > 0)
	Assert(typedOb.Asks[0][1] > 0)
}

func testOHLCV(exchange ccxt.Binance) {
	Blue("Testing OHLCV type")
	ohlcvFile := GetRootDir() + BASE_DIR + "ohlcv.json"
	ohlcvContent := IoFileRead(ohlcvFile, true)

	parsed := exchange.ParseOHLCVs(ohlcvContent)
	typedOHLCV := ccxt.NewOHLCVArray(parsed)
	Assert(len(typedOHLCV) > 0)
	Assert(typedOHLCV[0].Close > 0)
	Assert(typedOHLCV[0].High > 0)
	Assert(typedOHLCV[0].Low > 0)
	Assert(typedOHLCV[0].Open > 0)
	Assert(typedOHLCV[0].Volume > 0)
	Assert(typedOHLCV[0].Timestamp > 0)
}

func testTrade(exchange ccxt.Binance) {
	Blue("Testing Trade type")
	file := GetRootDir() + BASE_DIR + "trades.json"
	content := IoFileRead(file, true)
	market := exchange.Markets["BTC/USDT"]
	parsed := exchange.ParseTrades(content, market)
	typed := ccxt.NewTradeArray(parsed)
	Assert(len(typed) > 0)
	Assert(*typed[0].Symbol == "BTC/USDT")
	Assert(*typed[0].Side != "")
	Assert(*typed[0].Price > 0)
	Assert(*typed[0].Amount > 0)
	Assert(len(typed[0].Info) > 0)

}

func testTicker(exchange ccxt.Binance) {
	Blue("Testing Ticker type")
	file := GetRootDir() + BASE_DIR + "tickers.json"
	content := IoFileRead(file, true)

	parsed := exchange.ParseTickers(content)
	typed := ccxt.NewTickers(parsed)
	ticker := typed.Tickers["BTC/USDT"]
	Assert(*ticker.Symbol == "BTC/USDT")
	Assert(*ticker.Datetime != "")
	Assert(*ticker.Timestamp > 0)
	Assert(*ticker.Close > 0)
	Assert(*ticker.Last > 0)
	Assert(len(ticker.Info) > 0)
}

func testOrder(exchange ccxt.Binance) {
	Blue("Testing Order type")
	file := GetRootDir() + BASE_DIR + "orders.json"
	content := IoFileRead(file, true)

	parsed := exchange.ParseOrders(content)
	typed := ccxt.NewOrderArray(parsed)
	Assert(len(typed) > 0)
	Assert(*typed[0].Id != "")
	Assert(*typed[0].Symbol != "")
	Assert(*typed[0].Side != "")
	Assert(*typed[0].Status != "")
	Assert(*typed[0].Price > 0)
	Assert(*typed[0].Amount > 0)
	Assert(len(typed[0].Info) > 0)
}

func testPosition(exchange ccxt.Binance) {
	Blue("Testing Position type")
	file := GetRootDir() + BASE_DIR + "positions.json"
	content := IoFileRead(file, true).([]interface{})

	// parsed := exchange.ParsePositions(content) // binance has multiple parsers :/
	parsedPositions := []interface{}{}
	for _, item := range content {
		parsed := exchange.ParsePositionRisk(item)
		parsedPositions = append(parsedPositions, parsed)
	}
	typed := ccxt.NewPositionArray(parsedPositions)
	Assert(len(typed) > 0)
	Assert(*typed[1].Symbol != "")
	Assert(*typed[1].Side != "")
	Assert(*typed[1].Contracts > 0)
	Assert(*typed[1].Timestamp > 0)
	Assert(*typed[1].Datetime != "")
	Assert(len(typed[0].Info) > 0)
}

func testBalance(exchange ccxt.Binance) {
	Blue("Testing Balance type")
	file := GetRootDir() + BASE_DIR + "balance.json"
	content := IoFileRead(file, true)

	parsed := exchange.ParseBalanceCustom(content, "linear", nil, false)
	typed := ccxt.NewBalances(parsed)
	freeUsdt := typed.Free["USDT"]
	usedUsdt := typed.Used["USDT"]
	Assert(*freeUsdt > 0)
	Assert(*usedUsdt > 0)
	Assert(*typed.Balances["USDT"].Free > 0)
	Assert(*typed.Balances["USDT"].Used > 0)
}

func initExchangeOffline() ccxt.Binance {
	exchange := ccxt.NewBinance(nil)
	marketsFile := GetRootDir() + "ts/src/test/static/markets/binance.json"
	marketsContent := IoFileRead(marketsFile, true)
	exchange.Markets = marketsContent.(map[string]interface{})
	<-exchange.LoadMarkets()
	return exchange
}

func main() {
	exchange := initExchangeOffline()

	testOrderBook(exchange)
	testOHLCV(exchange)
	testTrade(exchange)
	testTicker(exchange)
	testOrder(exchange)
	testPosition(exchange)
	testBalance(exchange)

	Green("All tests passed")
}
