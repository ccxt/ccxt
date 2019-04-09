package util

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"
)

// JSONTime is a time.Time that is JSON marshalled to unix timestamp in ms.
// For unmarshalling JSONTime is flexible, it allows for unix timestamps in ms
// or seconds depending on int value, if that fails it tries to
// unmarshal as a time.Time.
type JSONTime time.Time

func (t JSONTime) T() time.Time {
	return time.Time(t)
}

func (t JSONTime) MarshalJSON() ([]byte, error) {
	return []byte(strconv.FormatInt(time.Time(t).UnixNano()/1e6, 10)), nil
}

func (t *JSONTime) UnmarshalJSON(s []byte) (err error) {
	r := strings.Replace(string(s), `"`, ``, -1)
	r = strings.Split(r, ".")[0]

	q, err := strconv.ParseInt(r, 10, 64)
	if err != nil {
		// attempt time.Time unmarshalling
		var tt time.Time
		err2 := json.Unmarshal(s, &tt)
		if err2 == nil {
			*(*time.Time)(t) = tt
			return nil
		}
		return fmt.Errorf("can't unmarshal \"%s\" to JSONTime: %s", s, err)
	}

	if q > 1e11 {
		// 1e11 is year 5138, we assume we're dealing with millisecs
		*(*time.Time)(t) = time.Unix(q/1000, (q%1000)*1e6)
	} else {
		// seconds timestamp
		*(*time.Time)(t) = time.Unix(q, 0)
	}
	return
}

func (t JSONTime) String() string {
	return time.Time(t).String()
}

func ParseTimeFrame(tf string) (d time.Duration, err error) {
	var amount float64
	var unit string
	_, err = fmt.Sscanf(tf, "%f%s", &amount, &unit)
	if err != nil {
		return
	}

	var scale time.Duration
	switch unit {
	case "y":
		scale = time.Hour * 24 * 365
	case "M":
		scale = time.Hour * 24 * 30
	case "w":
		scale = time.Hour * 24 * 7
	case "d":
		scale = time.Hour * 24
	case "h":
		scale = time.Hour
	default:
		scale = time.Minute
	}

	return time.Duration(scale.Nanoseconds() * int64(amount)), nil
}
