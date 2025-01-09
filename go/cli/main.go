package main

import (
	"ccxt/go/ccxt"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"
)

const (
	ROOT_DIR = "/../../"
)

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
		instance.SetVerbose(true)
	}

	if containsStr(flags, "--sandbox") {
		instance.SetSandboxMode(true)
	}
}

func main() {

	args := os.Args
	if len(args) < 3 {
		panic("Exchange name and method required")
	}

	exchangeName := args[1]
	method := args[2]

	fmt.Println("Exchange name: ", exchangeName)
	fmt.Println("Method: ", method)

	exchangeFile := GetRootDir() + "exchanges.json"

	if !IoFileExists(exchangeFile) {
		panic("exchanges.json file not found")
	}

	exchangeIds := IoFileRead(exchangeFile, true)
	exchangeIdsMap := exchangeIds.(map[string]interface{})
	exchangeIdsList := exchangeIdsMap["ids"].([]interface{})

	if !contains(exchangeIdsList, exchangeName) {
		panic("Exchange not found in exchanges.json")
	}

	var flags []string
	for _, arg := range args[2:] {
		if strings.HasPrefix(arg, "--") {
			flags = append(flags, arg)
		}
	}

	var parameters []interface{}
	for _, arg := range args[2:] {
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

	<-instance.LoadMarkets()

	InitOptions(instance, flags)

	res := <-instance.CallInternal(method, parameters...)

	fmt.Println(res)

	// // second()
	// // third()
	// fmt.Println("Let's GO CCXT!")
	// bybit := ccxt.NewBybit()
	// bybit.Init(map[string]interface{}{})
	// // bybit.Verbose = true
	// bybit.SetSandboxMode(true)
	// start := time.Now()
	// log.Printf("will load markets")
	// <-bybit.LoadMarkets()
	// elapsed := time.Since(start)
	// // fmt.Println(res)
	// log.Printf("Loading markets took %s", elapsed)
	// fmt.Println(("num of markets:"), len(bybit.Markets))
	// // return
	// bybit.ApiKey = "luDbnc4jVrDF7F4HFM"
	// bybit.Secret = "AO2jICPaoERif6VBntB7WqOibqSLBkYrAEPx"
	// start = time.Now()
	// orderCh := bybit.CreateOrder("ADA/USDT:USDT", "limit", "buy", 20, 0.3)
	// // orderCh := bybit.FetchMyTrades("ADA/USDT:USDT", nil, nil, nil)
	// order := <-orderCh
	// elapsed = time.Since(start)
	// log.Printf("Creating order took %s", elapsed)
	// fmt.Println(bybit.Json(order))
}
