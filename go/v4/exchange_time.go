package ccxt

import (
	"math"
	"reflect"
	"strings"
	"time"
)

// milliseconds returns the current time in milliseconds since the Unix epoch.
func (this *Exchange) Milliseconds() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}

func (this *Exchange) Seconds() int64 {
	return this.Milliseconds() / 1000
}

// microseconds returns the current time in microseconds since the Unix epoch.
func (this *Exchange) Microseconds() int64 {
	return time.Now().UnixNano() / int64(time.Microsecond)
}

// parseDate parses a date string and returns the timestamp in milliseconds since the Unix epoch.
// func (this *Exchange) ParseDate(datetime2 interface{}) interface{} {
// 	if datetime2 == nil || reflect.TypeOf(datetime2).Kind() != reflect.String {
// 		return nil
// 	}
// 	datetime := datetime2.(string)
// 	var timestamp int64
// 	t, err := time.Parse(time.RFC3339, datetime)
// 	if err != nil {
// 		return nil
// 	}
// 	timestamp = t.UnixNano() / int64(time.Millisecond)
// 	return timestamp
// }

func (this *Exchange) ParseDate(datetime2 interface{}) interface{} {
	if datetime2 == nil || reflect.TypeOf(datetime2).Kind() != reflect.String {
		return nil
	}
	datetime := datetime2.(string)
	var timestamp int64
	// Layouts for the two formats you want to support
	layouts := []string{
		"2006-01-02 15:04:05", // Layout for "1986-04-26 00:00:00"
		time.RFC3339,          // Layout for "1986-04-26T01:23:47.000Z"
	}

	var err error
	var t time.Time
	for _, layout := range layouts {
		t, err = time.Parse(layout, datetime)
		if err == nil {
			break
		}
	}

	// If parsing fails for all layouts, return nil
	if err != nil {
		return nil
	}

	// Convert the parsed time to milliseconds
	timestamp = t.UnixNano() / int64(time.Millisecond)
	return timestamp
}

// Iso8601 converts a timestamp to an ISO 8601 formatted string.
func Iso8601(ts2 interface{}) interface{} {
	if ts2 == nil {
		return nil
	}

	// if IsNumber(ts) {
	ts := ParseInt(ts2)

	if ts == math.MinInt64 {
		return nil
	}
	// }
	// startdatetime, err := strconv.ParseInt(fmt.Sprintf("%v", ts), 10, 64)
	// if err != nil || startdatetime < 0 {
	// 	return nil
	// }
	startdatetime := ts

	if startdatetime < 0 {
		return nil
	}

	// Convert timestamp to time and set to UTC
	date := time.Unix(0, startdatetime*int64(time.Millisecond)).UTC()
	return date.Format("2006-01-02T15:04:05.000Z")
}

// iso8601 is a wrapper for Iso8601.
func (this *Exchange) Iso8601(ts interface{}) interface{} {
	return Iso8601(ts)
}

// // ymdhms converts a timestamp to a formatted date string "yyyy-MM-dd HH:mm:ss".
// func (this *Exchange) Ymdhms(ts interface{}, args ...interface{}) string {
// 	infix := GetArg(args, 0, nil)
// 	if infix == nil {
// 		infix = " "
// 	}
// 	if ts == nil {
// 		return ""
// 	}
// 	startdatetime := ts.(int64)
// 	date := time.Unix(0, startdatetime*int64(time.Millisecond))
// 	return date.Format("2006-01-02" + infix.(string) + "15:04:05")
// }

func (this *Exchange) Ymdhms(ts interface{}, args ...interface{}) string {
	infix := GetArg(args, 0, nil)
	if infix == nil {
		infix = " "
	}
	if ts == nil {
		return ""
	}
	startdatetime := ts.(int64)
	date := time.Unix(0, startdatetime*int64(time.Millisecond)).UTC()
	return date.Format("2006-01-02" + infix.(string) + "15:04:05")
}

// yyyymmdd converts a timestamp to a formatted date string "yyyy-MM-dd".
func (this *Exchange) Yyyymmdd(ts interface{}, args ...interface{}) string {
	infix := GetArg(args, 0, nil)
	if infix == nil {
		infix = "-"
	}
	if ts == nil {
		return ""
	}
	startdatetime := ts.(int64)
	date := time.Unix(0, startdatetime*int64(time.Millisecond))
	return date.Format("2006" + infix.(string) + "01" + infix.(string) + "02")
}

// yymmdd converts a timestamp to a formatted date string "yy-MM-dd".
func (this *Exchange) Yymmdd(ts interface{}, args ...interface{}) string {
	infix := GetArg(args, 0, nil)
	if infix == nil {
		infix = "-"
	}
	if ts == nil {
		return ""
	}
	startdatetime := ts.(int64)
	date := time.Unix(0, startdatetime*int64(time.Millisecond))
	return date.Format("06" + infix.(string) + "01" + infix.(string) + "02")
}

// ymd converts a timestamp to a formatted date string "yyyy-MM-dd".
func (this *Exchange) Ymd(ts interface{}, args ...interface{}) string {
	infix := GetArg(args, 1, nil)
	if infix == nil {
		infix = "-"
	}
	if ts == nil {
		return ""
	}
	startdatetime := ts.(int64)
	date := time.Unix(0, startdatetime*int64(time.Millisecond))
	return date.Format("2006" + infix.(string) + "01" + infix.(string) + "02")
}

// parse8601 parses an ISO 8601 date string and returns the timestamp in milliseconds since the Unix epoch.
// func (this *Exchange) Parse8601(datetime2 interface{}) interface{} {
// 	if datetime2 == nil || reflect.TypeOf(datetime2).Kind() != reflect.String {
// 		return nil
// 	}
// 	datetime := datetime2.(string)
// 	if strings.Contains(datetime, "+0") {
// 		parts := strings.Split(datetime, "+")
// 		datetime = parts[0]
// 	}
// 	// Try to parse the datetime string as RFC3339 and convert to UTC
// 	t, err := time.Parse(time.RFC3339, datetime)
// 	if err != nil {
// 		return nil
// 	}
// 	// Ensure the time is in UTC
// 	t = t.UTC()
// 	timestamp := t.UnixNano() / int64(time.Millisecond)
// 	return timestamp
// }

// func (this *Exchange) Parse8601(datetime2 interface{}) interface{} {
// 	if datetime2 == nil || reflect.TypeOf(datetime2).Kind() != reflect.String {
// 		return nil
// 	}
// 	datetime := datetime2.(string)
// 	if strings.Contains(datetime, "+0") {
// 		parts := strings.Split(datetime, "+")
// 		datetime = parts[0]
// 	}

// 	// First, try to parse using RFC3339 format
// 	t, err := time.Parse(time.RFC3339, datetime)
// 	if err != nil {
// 		// If RFC3339 parsing fails, try the custom layout
// 		layout := "2006-01-02 15:04:05.999"
// 		t, err = time.Parse(layout, datetime)
// 		if err != nil {
// 			return nil // Return nil if both parsing attempts fail
// 		}
// 	}

// 	// Ensure the time is in UTC
// 	t = t.UTC()
// 	timestamp := t.UnixNano() / int64(time.Millisecond)
// 	return timestamp
// }

func (this *Exchange) Parse8601(datetime2 interface{}) interface{} {
	if datetime2 == nil || reflect.TypeOf(datetime2).Kind() != reflect.String {
		return nil
	}
	datetime := datetime2.(string)
	if strings.Contains(datetime, "+0") {
		parts := strings.Split(datetime, "+")
		datetime = parts[0]
	}

	// First, try to parse using RFC3339 format
	t, err := time.Parse(time.RFC3339, datetime)
	if err != nil {
		// Try parsing without timezone (e.g., "2024-07-18T04:10:33.389")
		layoutWithoutTimezone := "2006-01-02T15:04:05.999"
		t, err = time.Parse(layoutWithoutTimezone, datetime)
		if err != nil {
			// If that fails, try the custom layout with space separator (e.g., "2024-07-17 16:00:43.928")
			layoutWithSpace := "2006-01-02 15:04:05.999"
			t, err = time.Parse(layoutWithSpace, datetime)
			if err != nil {
				return nil // Return nil if all parsing attempts fail
			}
		}
	}

	// Ensure the time is in UTC
	t = t.UTC()
	timestamp := t.UnixNano() / int64(time.Millisecond)
	return timestamp
}
