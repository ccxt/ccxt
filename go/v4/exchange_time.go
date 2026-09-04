package ccxt

import (
	"math"
	"reflect"
	"regexp"
	"strings"
	"time"
)

// milliseconds returns the current time in milliseconds since the Unix epoch.
func (this *BaseExchange) Milliseconds() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}

func (this *BaseExchange) Seconds() int64 {
	return this.Milliseconds() / 1000
}

// SetLastRestRequestTimestamp guards the write with a mutex because concurrent
// requests would otherwise data-race on LastRestRequestTimestamp. This is a
// hand-written Go override (blacklisted in goTranspiler.ts) of the transpiled
// setLastRestRequestTimestamp method in ts/src/base/Exchange.ts.
func (this *BaseExchange) SetLastRestRequestTimestamp() {
	this.lastMu.Lock()
	this.LastRestRequestTimestamp = this.Milliseconds()
	this.lastMu.Unlock()
}

// SetLastRequest guards the writes with a mutex because concurrent requests would
// otherwise data-race on these bookkeeping fields. This is a hand-written Go
// override (blacklisted in goTranspiler.ts) of the transpiled setLastRequest
// method in ts/src/base/Exchange.ts.
func (this *BaseExchange) SetLastRequest(request any) {
	this.lastMu.Lock()
	this.Last_request_headers = GetValue(request, "headers")
	this.Last_request_body = GetValue(request, "body")
	this.Last_request_url = GetValue(request, "url")
	this.lastMu.Unlock()
}

// microseconds returns the current time in microseconds since the Unix epoch.
func (this *BaseExchange) Microseconds() int64 {
	return time.Now().UnixNano() / int64(time.Microsecond)
}

// parseDate parses a date string and returns the timestamp in milliseconds since the Unix epoch.
// func (this *BaseExchange) ParseDate(datetime2 any) any {
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

func (this *BaseExchange) ParseDate(datetime2 any) any {
	// SafeString now yields *string, so the kind check must run on the
	// dereferenced value or every pointer-carried datetime returns nil
	datetime2 = derefScalar(datetime2)
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

// iso8601PlainIntegerRegex matches a string consisting only of ASCII digits,
// mirroring the /^[0-9]+$/ guard used by the other language implementations.
var iso8601PlainIntegerRegex = regexp.MustCompile("^[0-9]+$")

// Iso8601 converts a timestamp to an ISO 8601 formatted string.
func Iso8601(ts2 any) any {
	if ts2 == nil {
		return nil
	}
	// reject the values the other language implementations reject before the
	// numeric conversion: non-numeric strings (e.g. "123abc" or ""), NaN/±Inf and
	// out-of-range float magnitudes. int64(NaN)/int64(±Inf) is implementation
	// -defined in Go, so guarding here keeps the result identical across archs.
	// A plain-integer string like "1755432123456" still falls through to ParseInt.
	switch v := ts2.(type) {
	case string:
		if !iso8601PlainIntegerRegex.MatchString(v) {
			return nil
		}
	case float64:
		if math.IsNaN(v) || math.IsInf(v, 0) || v < 0 || v > 8640000000000000 {
			return nil
		}
	case float32:
		f := float64(v)
		if math.IsNaN(f) || math.IsInf(f, 0) || f < 0 || f > 8640000000000000 {
			return nil
		}
	}

	ts := ParseInt(ts2)

	if ts == math.MinInt64 {
		return nil
	}
	// negative values and anything past 8.64e15 ms are outside the supported range
	if ts < 0 || ts > 8640000000000000 {
		return nil
	}

	// split into whole seconds + leftover milliseconds so the nanosecond argument
	// of time.Unix never overflows int64 for large (year 9999) timestamps
	seconds := ts / 1000
	milliseconds := ts % 1000
	date := time.Unix(seconds, milliseconds*int64(time.Millisecond)).UTC()
	return date.Format("2006-01-02T15:04:05.000Z")
}

// iso8601 is a wrapper for Iso8601.
func (this *BaseExchange) Iso8601(ts any) any {
	return Iso8601(ts)
}

// // ymdhms converts a timestamp to a formatted date string "yyyy-MM-dd HH:mm:ss".
// func (this *BaseExchange) Ymdhms(ts any, args ...any) string {
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

func (this *BaseExchange) Ymdhms(ts any, args ...any) string {
	infix := GetArg(args, 0, nil)
	if infix == nil {
		infix = " "
	}
	if ts == nil {
		return ""
	}
	startdatetime := ParseInt(ts)
	date := time.Unix(0, startdatetime*int64(time.Millisecond)).UTC()
	return date.Format("2006-01-02" + derefScalar(infix).(string) + "15:04:05")
}

// yyyymmdd converts a timestamp to a formatted date string "yyyy-MM-dd".
func (this *BaseExchange) Yyyymmdd(ts any, args ...any) string {
	infix := GetArg(args, 0, nil)
	if infix == nil {
		infix = "-"
	}
	if ts == nil {
		return ""
	}
	startdatetime := ParseInt(ts)
	date := time.Unix(0, startdatetime*int64(time.Millisecond)).UTC()
	return date.Format("2006" + derefScalar(infix).(string) + "01" + derefScalar(infix).(string) + "02")
}

// yymmdd converts a timestamp to a formatted date string "yy-MM-dd".
func (this *BaseExchange) Yymmdd(ts any, args ...any) string {
	infix := GetArg(args, 0, nil)
	if infix == nil {
		infix = ""
	}
	if ts == nil {
		return ""
	}
	startdatetime := ParseInt(ts)
	date := time.Unix(0, startdatetime*int64(time.Millisecond)).UTC()
	return date.Format("06" + derefScalar(infix).(string) + "01" + derefScalar(infix).(string) + "02")
}

// ymd converts a timestamp to a formatted date string "yyyy-MM-dd".
func (this *BaseExchange) Ymd(ts any, args ...any) string {
	infix := GetArg(args, 1, nil)
	if infix == nil {
		infix = "-"
	}
	if ts == nil {
		return ""
	}
	startdatetime := ParseInt(ts)
	date := time.Unix(0, startdatetime*int64(time.Millisecond)).UTC()
	return date.Format("2006" + derefScalar(infix).(string) + "01" + derefScalar(infix).(string) + "02")
}

// parse8601 parses an ISO 8601 date string and returns the timestamp in milliseconds since the Unix epoch.
// func (this *BaseExchange) Parse8601(datetime2 any) any {
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

// func (this *BaseExchange) Parse8601(datetime2 any) any {
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

func (this *BaseExchange) Parse8601(datetime2 any) any {
	// SafeString now yields *string, so the kind check must run on the
	// dereferenced value or every pointer-carried datetime returns nil
	datetime2 = derefScalar(datetime2)
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
