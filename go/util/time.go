package util

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// JSONTime allows JSON marshalling from time.Time to string unix epoch,
// and unmarshalling the other way around.
type JSONTime time.Time

func (t JSONTime) MarshalJSON() ([]byte, error) {
	return []byte(strconv.FormatInt(time.Time(t).Unix()*1000, 10)), nil
}

func (t *JSONTime) UnmarshalJSON(s []byte) (err error) {
	r := strings.Replace(string(s), `"`, ``, -1)
	r = strings.Split(r, ".")[0]

	q, err := strconv.ParseInt(r, 10, 64)
	if err != nil {
		return err
	}
	*(*time.Time)(t) = time.Unix(q/1000, 0)
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
