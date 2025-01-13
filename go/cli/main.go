package main

import (
	"ccxt/go/ccxt"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"
	"time"
)

var Red = "\033[31m"
var Green = "\033[32m"
var Yellow = "\033[33m"
var Blue = "\033[34m"
var Reset = "\033[0m"

const (
	ROOT_DIR = "/../../"
)

var verbose = false
var noKeys = false
var timeIt = false

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

	before := time.Now().UnixMilli()

	res := <-instance.CallInternal(method, parameters...)

	after := time.Now().UnixMilli()

	PrettyPrintData(res)

	fmt.Println("Execution time: ", Yellow, after-before, "ms", Reset)

}
