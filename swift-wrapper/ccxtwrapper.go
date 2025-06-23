// wrapper.go  – DROP IN AS–IS
package ccxt

import (
	"C"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	// "strings"
	ccxt "github.com/ccxt/ccxt/go/v4"
)

type CCXTGoExchange struct {
	exchange ccxt.IExchange
}

func NewExchange(exchangeName string, configJson string) *CCXTGoExchange {
	// First, remove the outer quotes if they exist
	configJson = strings.Trim(configJson, "\"")

	// Convert JavaScript object syntax to valid JSON:
	// 1. Replace single quotes with double quotes
	configJson = strings.ReplaceAll(configJson, "'", "\"")
	// 2. Add double quotes to unquoted keys
	configJson = regexp.MustCompile(`(\w+):`).ReplaceAllString(configJson, "\"$1\":")

	var config map[string]interface{}
	if err := json.Unmarshal([]byte(configJson), &config); err != nil {
		fmt.Printf("Go: Failed to parse configJson: %v\nInput was: %s\nProcessed to: %s\n", err, configJson, configJson)
		return nil
	}

	inst, ok := ccxt.DynamicallyCreateInstance(exchangeName, config)
	if !ok {
		return nil
	}

	return &CCXTGoExchange{exchange: inst}
}

func ParseJSON(input string) []byte {
	var intermediate string
	if err := json.Unmarshal([]byte(input), &intermediate); err == nil {
		// Input was a double-quoted JSON string — unwrap it
		input = intermediate
	}

	var anything interface{}
	if err := json.Unmarshal([]byte(input), &anything); err != nil {
		// Return a consistent error message as JSON
		errorObj := map[string]string{"error": "Invalid JSON"}
		b, _ := json.Marshal(errorObj)
		return b
	}

	b, _ := json.Marshal(anything)
	return b
}

// ------------------------------------------------------------------------

// ########################################################################
// ########################################################################
// ########################################################################
// ########################################################################
// ########                        ########                        ########
// ########                        ########                        ########
// ########                        ########                        ########
// ########                        ########                        ########
// ########        ########################        ########################
// ########        ########################        ########################
// ########        ########################        ########################
// ########        ########################        ########################
// ########                        ########                        ########
// ########                        ########                        ########
// ########                        ########                        ########
// ########                        ########                        ########
// ########################################################################
// ########################################################################
// ########################################################################
// ########################################################################
// ########        ########        ########                        ########
// ########        ########        ########                        ########
// ########        ########        ########                        ########
// ########        ########        ########                        ########
// ################        ########################        ################
// ################        ########################        ################
// ################        ########################        ################
// ################        ########################        ################
// ########        ########        ################        ################
// ########        ########        ################        ################
// ########        ########        ################        ################
// ########        ########        ################        ################
// ########################################################################
// ########################################################################
// ########################################################################
// ########################################################################

// ------------------------------------------------------------------------
// METHODS BELOW THIS LINE ARE TRANSPILED
