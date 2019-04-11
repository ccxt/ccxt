package main

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/ccxt/ccxt/go/pkg/ccxt"
)

func TestParseAPITemplate(t *testing.T) {
	var info ccxt.ExchangeInfo
	f, err := os.Open("test.json")
	if err != nil {
		panic(err)
	}
	defer f.Close()
	json.NewDecoder(f).Decode(&info)
	buildTest := false
	err = ParseAPITemplate(info, "", "tmpl_api", &buildTest)
	if err != nil {
		t.Fatal(err)
	}
	err = os.Remove("api.go")
	if err != nil {
		t.Fatal(err)
	}
}

func TestParseAPITestTemplate(t *testing.T) {
	var info ccxt.ExchangeInfo
	f, err := os.Open("test.json")
	if err != nil {
		panic(err)
	}
	defer f.Close()
	json.NewDecoder(f).Decode(&info)
	buildTest := true
	err = ParseAPITemplate(info, "", "tmpl_api", &buildTest)
	if err != nil {
		t.Fatal(err)
	}
	err = os.Remove("api_test.go")
	if err != nil {
		t.Fatal(err)
	}
}
