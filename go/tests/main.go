package main

import (
	"fmt"
	"tests/base"
)

func main() {
	RUN_BASE_TETS := base.GetCliArgValue("--baseTests")

	if RUN_BASE_TETS {
		base.BaseTestsInit()
		fmt.Println("Base tests passed!")
		return
	}
	tests := base.NewTestMainClass()

	argvExchange := base.GetCliPositionalArg(0)
	argvSymbol := base.GetCliPositionalArg(1)
	argvMethod := base.GetCliPositionalArg(2)

	exchangesList := []string{
		"ace",
		"alpaca",
		"ascendex",
		"bequant",
		"bigone",
		"binance",
		"binancecoinm",
		"binanceus",
		"binanceusdm",
		"bingx",
		"bit2c",
		"bitbank",
		"bitbns",
		"bitcoincom",
		"bitfinex",
		"bitfinex2",
		"bitflyer",
		"bitget",
		"bithumb",
		"bitmart",
		"bitmex",
		"bitopro",
		"bitpanda",
		"bitrue",
		"bitso",
		"bitstamp",
		"bitteam",
		"bitvavo",
		"bl3p",
		"blockchaincom",
		"blofin",
		"btcalpha",
		"btcbox",
		"btcmarkets",
		"btcturk",
		"bybit",
		"cex",
		"coinbase",
		"coinbaseadvanced",
		"coinbaseexchange",
		"coinbaseinternational",
		"coincatch",
		"coincheck",
		"coinex",
		"coinlist",
		"coinmate",
		"coinmetro",
		"coinone",
		"coinsph",
		"coinspot",
		"cryptocom",
		"currencycom",
		"delta",
		"deribit",
		"digifinex",
		"exmo",
		"fmfwio",
		"gate",
		"gateio",
		"gemini",
		"hashkey",
		"hitbtc",
		"hollaex",
		"htx",
		"huobi",
		"huobijp",
		"hyperliquid",
		"idex",
		"independentreserve",
		"indodax",
		"kraken",
		"krakenfutures",
		"kucoin",
		"kucoinfutures",
		"kuna",
		"latoken",
		"lbank",
		"luno",
		"lykke",
		"mercado",
		"mexc",
		"ndax",
		"novadax",
		"oceanex",
		"okcoin",
		"okx",
		"onetrading",
		"oxfun",
		"p2b",
		"paradex",
		"paymium",
		"phemex",
		"poloniex",
		"poloniexfutures",
		"probit",
		"timex",
		"tokocrypto",
		"tradeogre",
		"upbit",
		"vertex",
		"wavesexchange",
		"wazirx",
		"whitebit",
		"woo",
		"woofipro",
		"xt",
		"yobit",
		"zaif",
		"zonda",
	}
	_ = exchangesList

	// for _, exchange := range exchangesList {
	// 	argvExchange = exchange
	// 	res := <-tests.Init(argvExchange, argvSymbol, argvMethod)
	// 	base.PanicOnError(res)
	// }
	argvExchange = "binance"
	// // argvSymbol = "Option closed orders"
	res := <-tests.Init(argvExchange, argvSymbol, argvMethod)
	base.PanicOnError(res)

	// var exchange ccxt.IExchange = ccxt.NewBinance()
	// _ = exchange

}
