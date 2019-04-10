package bitmex

import (
	"encoding/json"
	"testing"
)

func debug(v interface{}) string {
	if msg, err := json.MarshalIndent(v, "", "  "); err != nil {
		panic(err)
	} else {
		return string(msg)
	}
}

func TestInfo(t *testing.T) {
	ex := BitmexExchange{}
	info, _ := ex.Info()
	if info.ID != "bitmex2" {
		t.Errorf("did not load exchange correctly: \n%+v", debug(info))
	}
}
