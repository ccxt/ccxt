package ccxt

import (
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"time"
)

// const (
// 	ROUND_DOWN = 0
// 	ROUND_UP   = 1
// )

// Function to replace parameters in the path
func (this *Exchange) ImplodeParams(path interface{}, parameter interface{}) interface{} {
	pathStr, ok := path.(string)
	if !ok {
		return path
	}

	paramValue := reflect.ValueOf(parameter)
	if paramValue.Kind() != reflect.Map {
		return path
	}

	// Iterate over the map keys and replace placeholders in the path
	for _, key := range paramValue.MapKeys() {
		value := paramValue.MapIndex(key)
		if value.IsNil() {
			continue
		}

		valueStr := ""
		valueInterface := value.Interface()
		if IsNumber(valueInterface) {
			valueStr = NumberToString(valueInterface)
		} else {
			valueStr = fmt.Sprintf("%v", value)
		}
		if value.Kind() != reflect.Slice {
			placeholder := "{" + key.String() + "}"
			pathStr = strings.ReplaceAll(pathStr, placeholder, valueStr)
		}
	}
	return pathStr
}

func ParseTimeframe(timeframe2 interface{}) int64 {
	timeframe := timeframe2.(string)

	if len(timeframe) < 2 {
		return 0
	}

	// Split the timeframe into amount and unit
	amountStr := timeframe[:len(timeframe)-1]
	unit := timeframe[len(timeframe)-1:]

	// Convert the amount to a float
	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		return 0
	}

	// Define the unit scale
	var scale int64
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
		return 0
	}

	// Return the calculated timeframe in seconds
	return int64(amount * float64(scale))
}

func (this *Exchange) RoundTimeframe(timeframe interface{}, timestamp interface{}, direction ...interface{}) interface{} {
	// Default direction is ROUND_DOWN
	roundDirection := ROUND_DOWN
	if len(direction) > 0 {
		if dir, ok := direction[0].(int); ok {
			roundDirection = dir
		}
	}

	// Convert timeframe to milliseconds
	ms := ParseTimeframe(timeframe) * 1000

	// Convert timestamp to int64
	var ts int64
	switch t := timestamp.(type) {
	case int64:
		ts = t
	case int:
		ts = int64(t)
	case float64:
		ts = int64(t)
	case time.Time:
		ts = t.UnixNano() / int64(time.Millisecond)
	default:
		return nil
	}

	// Calculate offset and round timestamp
	offset := ts % ms
	roundedTs := ts - offset
	if roundDirection == ROUND_UP {
		roundedTs += ms
	}

	return roundedTs
}
