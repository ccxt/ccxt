package base

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"reflect"
	"runtime"
	"strings"

	ccxt "github.com/ccxt/ccxt/go/v4"
	ccxtPro "github.com/ccxt/ccxt/go/v4/pro"
)

const (
	LANG                 = "GO"
	EXT                  = "go"
	NEW_LINE             = "\n"
	PROXY_TEST_FILE_NAME = ""
	IS_SYNCHRONOUS       = false
	ROOT_DIR             = "/../"
	// TEST_METHODS         = map[string]any{}
)

func AuthenticationError(v ...any) error {
	return ccxt.AuthenticationError(v)
}

func ExchangeError(v ...any) error {
	return ccxt.ExchangeError(v)
}

func NotSupported(v ...any) error {
	return ccxt.NotSupported(v)
}

func OnMaintenance(v ...any) error {
	return ccxt.OnMaintenance(v)
}

func ExchangeNotAvailable(v ...any) error {
	return ccxt.ExchangeNotAvailable(v)
}

func OperationFailed(v ...any) error {
	return ccxt.OperationFailed(v)
}

func InvalidProxySettings(v ...any) error {
	return ccxt.InvalidProxySettings(v)
}

func ArgumentsRequired(v ...any) error {
	return ccxt.ArgumentsRequired(v)
}

func InvalidNonce(v ...any) error {
	return ccxt.InvalidNonce(v)
}

func Error(v ...any) error {
	return ccxt.NewError(v)
}

func NetworkError(v ...any) error {
	return ccxt.NetworkError(v)
}

func SetFetchResponse(exchange ccxt.ICoreExchange, response any) ccxt.ICoreExchange {
	exchange.SetFetchResponse(response)
	return exchange
}

func GetCliArgValue(arg any) bool {
	argStr := fmt.Sprintf("%v", arg) // Convert the argument to its string representation
	for _, v := range os.Args {
		if v == argStr {
			return true
		}
	}
	return false
}

func GetCliPositionalArg(index int) any {
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

// func JsonParse(elem string) any {
// 	var result any
// 	err := json.Unmarshal([]byte(elem), &result)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	return result
// }

func ConvertAscii(input any) any {
	return input
}

func GetTestName(str string) string {
	return str
}

// dump function to print passed arguments
func Dump(args ...any) {
	fmt.Println(args...)
}

// jsonParse function to parse a JSON string
// func JsonParse(elem any) any {
// 	var result any
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
// func JsonStringify(elem any) string {
// 	bytes, err := json.Marshal(elem)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	return string(bytes)
// }

// convertAscii function (stub)
// func ConvertAscii(input any) any {
// 	return input
// }

// // getTestName function to return the input as is
// func GetTestName(str any) any {
// 	return str
// }

// ioFileExists function to check if a file exists
func IoFileExists(path any) bool {
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
func IoFileRead(path any, decode ...any) any {
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
			var result any
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
func IoDirRead(path any) any {
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
func CallMethodSync(testFiles2 any, methodName2 any, exchange any, skippedProperties any, args any) any {
	// Empty in Go, just returning
	return nil
}

// func CallMethod(testFiles2 any, methodName2 any, exchange any, skippedProperties any, args2 any) <-chan any {
// 	testFiles := testFiles2.(map[string]any)
// 	methodName := methodName2.(string)
// 	args := args2.([]any)
// 	method := reflect.ValueOf(testFiles[methodName])
// 	in := make([]reflect.Value, len(args))
// 	for i, arg := range args {
// 		in[i] = reflect.ValueOf(arg)
// 	}
// 	method.Call(in)
// 	return nil
// }

func CallMethod(testFiles2 any, methodName2 any, exchange any, skippedProperties any, args2 any) <-chan any {
	// Create the return channel
	ch := make(chan any, 1)

	go func() {
		defer close(ch)
		defer ReturnPanicError(ch)

		testFiles := testFiles2.(map[string]any)
		methodName := methodName2.(string)

		// Assert args2 to []any, or default to an empty slice if nil
		var args []any
		if args2 != nil {
			args = args2.([]any)
		} else {
			args = []any{}
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

// func CallMethod(testFiles2 any, methodName2 any, exchange any, skippedProperties any, args2 any) <-chan any {
// 	// Cast parameters to their expected types
// 	ch := make(chan any)
// 	go func() {
// 		defer close(ch)
// 		defer ReturnPanicError(ch)
// 		testFiles := testFiles2.(map[string]any)
// 		methodName := methodName2.(string)

// 		// Assert args2 to []any, or default to an empty slice if nil
// 		var args []any
// 		if args2 != nil {
// 			args = args2.([]any)
// 		} else {
// 			args = []any{}
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
func CallExchangeMethodDynamically(exchange any, methodName2 any, args2 any) <-chan any {
	arg := args2.([]any)
	ch := make(chan any)
	go func() {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				if r != "break" {
					ch <- "panic:" + ToString(r)
				}
			}
		}()
		exchangeType := exchange.(ccxt.ICoreExchange)
		exchangeType.WarmUpCache()
		res := <-CallInternalMethod(exchangeType.GetCache(), exchange, methodName2.(string), arg...)
		PanicOnError(res)
		ch <- res
	}()
	return ch
}

// callExchangeMethodDynamicallySync function that throws an error
func CallExchangeMethodDynamicallySync(exchange any, methodName2 any, args any) error {
	return fmt.Errorf("this function shouldn't be called, only async functions apply here")
}

// callOverridenMethod function to call an overridden method dynamically
func CallOverridenMethod(exchange any, methodName string, args []any) any {
	// return callExchangeMethodDynamically(exchange, methodName, args)
	return nil
}

// exceptionMessage function to generate a formatted error message
func ExceptionMessage(exc any) string {
	// switch e := exc.(type) {
	// case error:
	// 	return fmt.Sprintf("[%T] %s", e, e.Error())
	// default:
	// 	return "[Unknown Error] No error message available"
	// }
	return fmt.Sprintf("%v", exc)
}

// getRootException function (stub)
func GetRootException(exc any) any {
	return exc
}

// exitScript function to exit the program
func ExitScript(code any) {
	switch c := code.(type) {
	case int:
		os.Exit(c)
	default:
		os.Exit(0) // default exit code
	}
}

// getExchangeProp function to retrieve a property from exchange
func GetExchangeProp(exchange2 any, prop2 any, defaultValue ...any) any {
	exchange := exchange2.(ccxt.ICoreExchange)
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
func SetExchangeProp(exchange2 any, prop2 any, value any) {
	exchange := exchange2.(ccxt.ICoreExchange)
	exchange.SetProperty(exchange, value, value)
}

// unCamelCase function (basic stub)
func UnCamelCase(str string) string {
	return str // Implement actual unCamelCase logic here
}

// initExchange function to initialize an exchange (stub)
func InitExchange(exchangeId any, options ...any) ccxt.ICoreExchange {
	var exchangeOptions any = nil
	var ws bool = false
	if len(options) > 0 {
		exchangeOptions = options[0]
		ws = SafeValue(options, 1, false).(bool)
	}
	if exchangeOptions == nil {
		exchangeOptions = make(map[string]any)
	}
	var instance ccxt.ICoreExchange
	var success bool = true
	if ws {
		instance, success = ccxtPro.DynamicallyCreateInstance(exchangeId.(string), exchangeOptions.(map[string]any))
	} else {
		instance, success = ccxt.DynamicallyCreateInstance(exchangeId.(string), exchangeOptions.(map[string]any))
	}
	// instance, success := ccxt.DynamicallyCreateInstance(exchangeId.(string), exchangeOptions.(map[string]any))
	if !success {
		return nil
	}
	globalSettings := SafeValue(options, 0, map[string]any{}).(map[string]any)
	globalOptions := SafeValue(globalSettings, "options", map[string]any{}).(map[string]any)
	instance.ExtendExchangeOptions(globalOptions)
	return instance
}

// importTestFile function (stub for importing test files)
func ImportTestFile(filePath any) any {
	// In Go, dynamic import is not straightforward
	return nil
}

// getTestFilesSync function (empty in JS)
func GetTestFilesSync(properties any, ws any) any {
	// Empty in Go, just returning
	return nil
}

// // getTestFiles function to dynamically retrieve test files (stub)
// func GetTestFiles(properties any, ws any) <-chan any {
// 	// Dynamically get test files logic (stub)
// 	return nil
// }

func GetTestFiles(properties2 any, ws bool) <-chan map[string]any {
	properties := properties2.([]string)
	_ = properties
	_ = ws

	ch := make(chan map[string]any)
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
		if ws {
			ch <- WsFunctionsMap
		} else {
			ch <- FunctionsMap
		}
	}()
	return ch
}

func IsNullValue(value any) bool {
	return value == nil
}

func Close(exchange any) <-chan bool {
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

func IsWindows() bool { return runtime.GOOS == "windows" }
func IsLinux() bool   { return runtime.GOOS == "linux" }
func IsAmd64() bool   { return runtime.GOARCH == "amd64" }
