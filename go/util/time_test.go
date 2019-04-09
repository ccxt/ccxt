package util

import (
	"bytes"
	"encoding/json"
	"testing"
	"time"
)

var (
	dref    = time.Time{}.AddDate(2016, 8, 3).Add(time.Hour * 14)
	formats = map[string][]byte{
		"dISO8601":      []byte("\"2017-09-04T14:00:00+00:00\""),
		"dUnixSec":      []byte("1504533600"),
		"dUnixMs":       []byte("1504533600000"),
		"dUnixMsString": []byte("\"1504533600000\""),
		"dUnixSecDotMs": []byte("1504533600.000"),
	}
	marshalled = formats["dUnixMs"]
)

func TestJSONTime_Marshal(t *testing.T) {
	v, err := json.Marshal(JSONTime(dref))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(v, marshalled) {
		t.Errorf("%s != %s", v, marshalled)
	}
}

func TestJSONTime_Unmarshal(t *testing.T) {
	var jtime JSONTime
	for format, value := range formats {
		err := json.Unmarshal(value, &jtime)
		if err != nil {
			t.Errorf("%s: %s - %s", format, value, err)
			continue
		}
		if !time.Time(jtime).Equal(dref) {
			t.Errorf("%s: %s - %s (expected: %s)", format, value, jtime, dref)
		}
	}
}
