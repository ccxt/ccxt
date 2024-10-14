package ccxt

import (
	"fmt"
	"reflect"
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

func parseTimeframe(timeframe interface{}) int64 {
	// This function should return the number of seconds corresponding to the given timeframe
	switch tf := timeframe.(type) {
	case string:
		switch tf {
		case "1m":
			return 60
		case "1h":
			return 3600
		case "1d":
			return 86400
		}
	}
	return 0
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
	ms := parseTimeframe(timeframe) * 1000

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
