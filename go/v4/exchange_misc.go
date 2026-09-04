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
func (this *BaseExchange) ImplodeParams(path any, parameter any) any {
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

func ParseTimeframe(timeframe2 any) int64 {
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

func FloorDiv(value int64, divisor int64) int64 {
	quotient := value / divisor
	remainder := value % divisor
	if remainder != 0 && ((remainder > 0) != (divisor > 0)) {
		quotient -= 1
	}
	return quotient
}

func (this *BaseExchange) RoundTimeframe(timeframe any, timestamp any, direction ...any) any {
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
	if ms == 0 {
		return nil
	}
	frame := timeframe.(string)
	amount, err := strconv.Atoi(frame[:len(frame)-1])
	unit := frame[len(frame)-1:]
	if (unit == "w" || unit == "M" || unit == "y") && amount >= 1 && err == nil {
		date := time.UnixMilli(ts).UTC()
		var rounded time.Time
		if unit == "w" {
			daysSinceMonday := (int(date.Weekday()) + 6) % 7
			monday := time.Date(date.Year(), date.Month(), date.Day()-daysSinceMonday, 0, 0, 0, 0, time.UTC)
			epochMonday := time.Date(1970, time.January, 5, 0, 0, 0, 0, time.UTC)
			weeksSinceEpochMonday := FloorDiv(monday.Unix()-epochMonday.Unix(), 604800)
			roundedWeeks := FloorDiv(weeksSinceEpochMonday, int64(amount)) * int64(amount)
			rounded = epochMonday.AddDate(0, 0, int(roundedWeeks)*7)
			if roundDirection == ROUND_UP {
				rounded = rounded.AddDate(0, 0, amount*7)
			}
		} else if unit == "M" {
			monthsSinceYearZero := date.Year()*12 + int(date.Month()) - 1
			roundedMonths := FloorDiv(int64(monthsSinceYearZero), int64(amount)) * int64(amount)
			year := FloorDiv(roundedMonths, 12)
			month := time.Month(roundedMonths%12 + 1)
			rounded = time.Date(int(year), month, 1, 0, 0, 0, 0, time.UTC)
			if roundDirection == ROUND_UP {
				rounded = rounded.AddDate(0, amount, 0)
			}
		} else {
			year := FloorDiv(int64(date.Year()), int64(amount)) * int64(amount)
			rounded = time.Date(int(year), time.January, 1, 0, 0, 0, 0, time.UTC)
			if roundDirection == ROUND_UP {
				rounded = rounded.AddDate(amount, 0, 0)
			}
		}
		return rounded.UnixMilli()
	}

	// Calculate offset and round timestamp
	offset := ts % ms
	roundedTs := ts - offset
	if roundDirection == ROUND_UP {
		roundedTs += ms
	}

	return roundedTs
}
