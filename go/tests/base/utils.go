package base

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"reflect"
	"strings"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

const (
	LANG                 = "GO"
	EXT                  = "go"
	NEW_LINE             = "\n"
	PROXY_TEST_FILE_NAME = ""
	IS_SYNCHRONOUS       = false
	ROOT_DIR             = "/../"
	// TEST_METHODS         = map[string]interface{}{}
)

func AuthenticationError(v ...interface{}) error {
	return ccxt.AuthenticationError(v)
}

func ExchangeError(v ...interface{}) error {
	return ccxt.ExchangeError(v)
}

func NotSupported(v ...interface{}) error {
	return ccxt.NotSupported(v)
}

func OnMaintenance(v ...interface{}) error {
	return ccxt.OnMaintenance(v)
}

func ExchangeNotAvailable(v ...interface{}) error {
	return ccxt.ExchangeNotAvailable(v)
}

func OperationFailed(v ...interface{}) error {
	return ccxt.OperationFailed(v)
}

func InvalidProxySettings(v ...interface{}) error {
	return ccxt.InvalidProxySettings(v)
}

func SetFetchResponse(exchange ccxt.IExchange, response interface{}) ccxt.IExchange {
	exchange.SetFetchResponse(response)
	return exchange
}

func GetCliArgValue(arg interface{}) bool {
	argStr := fmt.Sprintf("%v", arg) // Convert the argument to its string representation
	for _, v := range os.Args {
		if v == argStr {
			return true
		}
	}
	return false
}

func GetCliPositionalArg(index int) interface{} {
	index++
	var filteredArgs []string
	for _, arg := range os.Args {
		if !strings.HasPrefix(arg, "--") {
			filteredArgs = append(filteredArgs, arg)
		}
	}
	if len(filteredArgs) > index {
		return filteredArgs[index]
	}
	return nil
}

// func JsonParse(elem string) interface{} {
// 	var result interface{}
// 	err := json.Unmarshal([]byte(elem), &result)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	return result
// }

func ConvertAscii(input interface{}) interface{} {
	return input
}

func GetTestName(str string) string {
	return str
}

// dump function to print passed arguments
func Dump(args ...interface{}) {
	fmt.Println(args...)
}

// jsonParse function to parse a JSON string
// func JsonParse(elem interface{}) interface{} {
// 	var result interface{}
// 	switch e := elem.(type) {
// 	case string:
// 		err := json.Unmarshal([]byte(e), &result)
// 		if err != nil {
// 			log.Fatal(err)
// 		}
// 	default:
// 		log.Fatal("jsonParse expects a string")
// 	}
// 	return result
// }

// // jsonStringify function to convert an object to JSON string
// func JsonStringify(elem interface{}) string {
// 	bytes, err := json.Marshal(elem)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	return string(bytes)
// }

// convertAscii function (stub)
// func ConvertAscii(input interface{}) interface{} {
// 	return input
// }

// // getTestName function to return the input as is
// func GetTestName(str interface{}) interface{} {
// 	return str
// }

// ioFileExists function to check if a file exists
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

// ioFileRead function to read a file and optionally decode its content
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

// ioDirRead function to read directory contents
func IoDirRead(path interface{}) interface{} {
	switch p := path.(type) {
	case string:
		files, err := ioutil.ReadDir(p)
		if err != nil {
			log.Fatal(err)
		}

		var fileNames []string
		for _, file := range files {
			fileNames = append(fileNames, file.Name())
		}
		return fileNames
	default:
		log.Fatal("ioDirRead expects a string")
		return nil
	}
}

// callMethodSync function (empty in JS)
func CallMethodSync(testFiles2 interface{}, methodName2 interface{}, exchange interface{}, skippedProperties interface{}, args interface{}) interface{} {
	// Empty in Go, just returning
	return nil
}

// func CallMethod(testFiles2 interface{}, methodName2 interface{}, exchange interface{}, skippedProperties interface{}, args2 interface{}) <-chan interface{} {
// 	testFiles := testFiles2.(map[string]interface{})
// 	methodName := methodName2.(string)
// 	args := args2.([]interface{})
// 	method := reflect.ValueOf(testFiles[methodName])
// 	in := make([]reflect.Value, len(args))
// 	for i, arg := range args {
// 		in[i] = reflect.ValueOf(arg)
// 	}
// 	method.Call(in)
// 	return nil
// }

func CallMethod(testFiles2 interface{}, methodName2 interface{}, exchange interface{}, skippedProperties interface{}, args2 interface{}) <-chan interface{} {
	// Create the return channel
	ch := make(chan interface{}, 1)

	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)

		testFiles := testFiles2.(map[string]interface{})
		methodName := methodName2.(string)

		// Assert args2 to []interface{}, or default to an empty slice if nil
		var args []interface{}
		if args2 != nil {
			args = args2.([]interface{})
		} else {
			args = []interface{}{}
		}

		// Retrieve the function from testFiles
		method, exists := testFiles[methodName]
		if !exists {
			ch <- fmt.Errorf("panic:method %s not found in testFiles", methodName)
			return
		}

		// Convert the method to a reflect.Value
		methodVal := reflect.ValueOf(method)
		if methodVal.Kind() != reflect.Func {
			// Return an error if the item is not a function
			ch <- fmt.Errorf("%s is not a function", methodName)
			return
		}

		// Prepare the input arguments, starting with exchange and skippedProperties
		in := []reflect.Value{reflect.ValueOf(exchange), reflect.ValueOf(skippedProperties)}
		for _, arg := range args {
			in = append(in, reflect.ValueOf(arg))
		}

		// Check if the number of arguments matches the function's requirements
		if methodVal.Type().NumIn() != len(in) {
			ch <- fmt.Errorf("panic:method %s requires %d arguments, but %d were provided", methodName, methodVal.Type().NumIn(), len(in))
			return
		}

		// Call the method and capture the results
		res := methodVal.Call(in)

		if len(res) > 0 && res[0].Kind() == reflect.Chan {
			resultChan := res[0]
			for {
				val, ok := resultChan.Recv()
				if !ok {
					break // result channel is closed
				}
				ch <- val.Interface() // pass the value to the output channel
			}
			// close(ch) // close the output channel after all values are received
			return
		} else if len(res) > 0 {
			ch <- res[0].Interface()
		} else {
			ch <- nil
		}
	}()

	return ch
}

// func CallMethod(testFiles2 interface{}, methodName2 interface{}, exchange interface{}, skippedProperties interface{}, args2 interface{}) <-chan interface{} {
// 	// Cast parameters to their expected types
// 	ch := make(chan interface{})
// 	go func() {
// 		defer close(ch)
// 		defer ReturnPanicError(ch)
// 		testFiles := testFiles2.(map[string]interface{})
// 		methodName := methodName2.(string)

// 		// Assert args2 to []interface{}, or default to an empty slice if nil
// 		var args []interface{}
// 		if args2 != nil {
// 			args = args2.([]interface{})
// 		} else {
// 			args = []interface{}{}
// 		}

// 		// Retrieve the function from testFiles
// 		method, exists := testFiles[methodName]
// 		if !exists {
// 			ch <- fmt.Errorf("panic:method %s not found in testFiles", methodName)
// 		}

// 		// Convert the method to a reflect.Value
// 		methodVal := reflect.ValueOf(method)
// 		if methodVal.Kind() != reflect.Func {
// 			// Return an error if the item is not a function
// 			ch <- fmt.Errorf("%s is not a function", methodName)
// 		}

// 		// Prepare the input arguments, starting with exchange and skippedProperties
// 		in := []reflect.Value{reflect.ValueOf(exchange), reflect.ValueOf(skippedProperties)}
// 		for _, arg := range args {
// 			in = append(in, reflect.ValueOf(arg))
// 		}

// 		// Check if the number of arguments matches the function's requirements
// 		if methodVal.Type().NumIn() != len(in) {
// 			ch <- fmt.Errorf("panic:method %s requires %d arguments, but %d were provided", methodName, methodVal.Type().NumIn(), len(in))
// 		}

// 		// Call the method and capture the results
// 		result := methodVal.Call(in)

// 		// Create a channel to return the single result
// 		if len(result) > 0 {
// 			// Send the first result if available
// 			ch <- result[0].Interface()
// 		} else {
// 			// Send nil if no result is returned
// 			ch <- nil
// 		}
// 	}()

// 	return ch
// }

// callExchangeMethodDynamically function to call exchange methods dynamically
func CallExchangeMethodDynamically(exchange interface{}, methodName2 interface{}, args2 interface{}) <-chan interface{} {
	arg := args2.([]interface{})
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
		exchangeType := exchange.(ccxt.IExchange)
		exchangeType.WarmUpCache()
		res := <-CallInternalMethod(exchangeType.GetCache(), exchange, methodName2.(string), arg...)
		PanicOnError(res)
		ch <- res
	}()
	return ch
}

// callExchangeMethodDynamicallySync function that throws an error
func CallExchangeMethodDynamicallySync(exchange interface{}, methodName2 interface{}, args interface{}) error {
	return fmt.Errorf("this function shouldn't be called, only async functions apply here")
}

// callOverridenMethod function to call an overridden method dynamically
func CallOverridenMethod(exchange interface{}, methodName string, args []interface{}) interface{} {
	// return callExchangeMethodDynamically(exchange, methodName, args)
	return nil
}

// exceptionMessage function to generate a formatted error message
func ExceptionMessage(exc interface{}) string {
	// switch e := exc.(type) {
	// case error:
	// 	return fmt.Sprintf("[%T] %s", e, e.Error())
	// default:
	// 	return "[Unknown Error] No error message available"
	// }
	return fmt.Sprintf("%v", exc)
}

// getRootException function (stub)
func GetRootException(exc interface{}) interface{} {
	return exc
}

// exitScript function to exit the program
func ExitScript(code interface{}) {
	switch c := code.(type) {
	case int:
		os.Exit(c)
	default:
		os.Exit(0) // default exit code
	}
}

// getExchangeProp function to retrieve a property from exchange
func GetExchangeProp(exchange2 interface{}, prop2 interface{}, defaultValue ...interface{}) interface{} {
	exchange := exchange2.(ccxt.IExchange)
	res := exchange.GetProperty(exchange, prop2)
	if res != nil {
		return res
	}
	if len(defaultValue) > 0 {
		return defaultValue[0]
	}
	return nil
}

// setExchangeProp function to set a property on exchange
func SetExchangeProp(exchange2 interface{}, prop2 interface{}, value interface{}) {
	exchange := exchange2.(ccxt.IExchange)
	exchange.SetProperty(exchange, value, value)
}

// unCamelCase function (basic stub)
func UnCamelCase(str string) string {
	return str // Implement actual unCamelCase logic here
}

// initExchange function to initialize an exchange (stub)
func InitExchange(exchangeId interface{}, options ...interface{}) ccxt.IExchange {
	var exchangeOptions interface{} = nil
	if len(options) > 0 {
		exchangeOptions = options[0]
	}
	if exchangeOptions == nil {
		exchangeOptions = make(map[string]interface{})
	}
	instance, success := ccxt.DynamicallyCreateInstance(exchangeId.(string), exchangeOptions.(map[string]interface{}))
	if success == false {
		return nil
	}
	globalSettings := SafeValue(options, 0, map[string]interface{}{}).(map[string]interface{})
	globalOptions := SafeValue(globalSettings, "options", map[string]interface{}{}).(map[string]interface{})
	instance.ExtendExchangeOptions(globalOptions)
	return instance
}

// importTestFile function (stub for importing test files)
func ImportTestFile(filePath interface{}) interface{} {
	// In Go, dynamic import is not straightforward
	return nil
}

// getTestFilesSync function (empty in JS)
func GetTestFilesSync(properties interface{}, ws interface{}) interface{} {
	// Empty in Go, just returning
	return nil
}

// // getTestFiles function to dynamically retrieve test files (stub)
// func GetTestFiles(properties interface{}, ws interface{}) <-chan interface{} {
// 	// Dynamically get test files logic (stub)
// 	return nil
// }

func GetTestFiles(properties2 interface{}, ws bool) <-chan map[string]interface{} {
	properties := properties2.([]string)
	_ = properties
	_ = ws

	ch := make(chan map[string]interface{})
	go func() {

		defer close(ch)

		// for _, key := range properties {
		// 	var testFilePath string
		// 	if !ws {
		// 		testFilePath = filepath.Join(ROOT_DIR, "go/tests/base/test."+key+".go")
		// 	} else {
		// 		// testFilePath = filepath.Join(ROOT_DIR, "cs/tests/Generated/Exchange/Ws/test."+key+".cs")
		// 	}

		// 	if IoFileExists(testFilePath) {
		// 		methodName := "Test" + strings.Title(key) // Go equivalent to key.Substring(0, 1).ToUpper() + key.Substring(1)
		// 		method := reflect.ValueOf(base).MethodByName(methodName)
		// 		// method := reflect.ValueOf(&TestMethods{}).MethodByName(methodName)
		// 		// if method.IsValid() {
		// 		// 	testFiles[key] = method.Interface()
		// 		// }
		// 	}
		// }

		ch <- FunctionsMap
	}()
	return ch
}

func IsNullValue(value interface{}) bool {
	return value == nil
}

func Close(exchange interface{}) <-chan bool {
	ch := make(chan bool)
	close(ch)
	return ch
}

func IsSync() bool {
	return false
}

func GetLang() string {
	return LANG
}

func GetExt() string {
	return EXT
}

func GetRootDir() string {
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}
	if strings.HasSuffix(dir, "/ccxt") {
		return dir + "/"
	}
	if strings.HasSuffix(dir, "/tests") {
		return dir + ROOT_DIR + ROOT_DIR
	}

	res := dir + ROOT_DIR
	// baseDir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
	// res := baseDir + ROOT_DIR
	// Print("Base dir: " + res)
	return res
}

func splitEnv(env string) [2]string {
	var pair [2]string
	for i := range env {
		if env[i] == '=' {
			pair[0] = env[:i]
			pair[1] = env[i+1:]
			break
		}
	}
	return pair
}

func GetEnvVars() map[string]string {
	envMap := make(map[string]string)
	for _, env := range os.Environ() {
		pair := splitEnv(env)
		envMap[pair[0]] = pair[1]
	}
	return envMap
}
