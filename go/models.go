package ccxt

import (
	"encoding/json"
	"fmt"
	"github.com/ccxt/ccxt/go/util"
	"net/http"
	"time"
)

type ExchangeInfo struct {
	ID              string
	Name            string
	Countries       StringSlice
	EnableRateLimit bool
	RateLimit       int
	Has             map[string]bool
	URLs            URLs
	API             map[string]map[string][]string
	Timeframes      map[string]interface{}
	Fees            Fees
	UserAgents      map[string]string
	Header          http.Header
	Proxy           string
	Origin          string
	Verbose         bool
	Limits          Limits
	Precision       Precision
}

type URLs struct {
	API  APIURLs
	Logo StringSlice
	WWW  StringSlice
	Doc  StringSlice
	Fees StringSlice
}

type StringSlice []string

// UnmarshalJSON accepts both forms for StringSlice:
//   - ["s1", "s2"...]
//   - "s"
// For the latter, ss will hold a slice of one element "s"
// todo: unify to array form ?
func (ss *StringSlice) UnmarshalJSON(b []byte) (err error) {
	// try slice unmarshal
	var slice []string
	err = json.Unmarshal(b, &slice)
	if err == nil {
		*ss = slice
		return nil
	}
	// try string unmarshal
	var s string
	err2 := json.Unmarshal(b, &s)
	if err2 == nil {
		*ss = append(*ss, s)
		return nil
	}
	// return original error
	return err
}

type APIURLs struct {
	Public, Private string
}

// UnmarshalJSON accepts both forms for APIURLs:
//   - {"public": "urlpub", "private": "urlpriv"} or
//   - "url"
// For the latter, "url" is assigned to both a.Private and a.Public
// todo: unify to struct form ?
func (a *APIURLs) UnmarshalJSON(b []byte) (err error) {
	// default struct unmarshal to compatible type
	type t APIURLs
	err = json.Unmarshal(b, (*t)(a))
	if err == nil {
		return nil
	}
	// string unmarshal
	var s string
	err2 := json.Unmarshal(b, &s)
	if err2 == nil {
		a.Private = s
		a.Public = s
		return nil
	}
	// return original error
	return err
}

type Fees struct {
	Trading TradingFees
	Funding FundingFees
}

type TradingFees struct {
	TierBased  bool
	Percentage bool
	Maker      float64
	Taker      float64
	Tiers      TradingFeesTiers
}

type TradingFeesTiers struct {
	Taker [][2]float64
	Maker [][2]float64
}

type FundingFees struct {
	TierBased  bool
	Percentage bool
	Deposit    map[string]float64
	Withdraw   map[string]float64
}

type Account struct {
	Free,
	Used,
	Total float64
}

type Balance struct {
	Free,
	Used,
	Total float64
}

type Balances struct {
	Currencies map[string]Balance
	Free       map[string]float64
	Used       map[string]float64
	Total      map[string]float64
	Info       interface{}
}

// UnmarshalJSON retreives unified values from "free", "used" and "total",
// then generates Currencies map from these 3 maps.
func (b *Balances) UnmarshalJSON(s []byte) (err error) {
	// default json unmarshal
	type t Balances
	if err = json.Unmarshal(s, (*t)(b)); err != nil {
		return err
	}

	b.Currencies = make(map[string]Balance, len(b.Total))
	for k := range b.Total {
		b.Currencies[k] = Balance{
			Total: b.Total[k],
			Free:  b.Free[k],
			Used:  b.Used[k],
		}
	}
	return nil
}

// FilterZeroes remove Balances entries which equal to 0
func (b *Balances) FilterZeros() {
	for k, v := range b.Currencies {
		if v.Total == 0.0 && v.Used == 0.0 && v.Free == 0.0 {
			delete(b.Total, k)
			delete(b.Used, k)
			delete(b.Free, k)
			delete(b.Currencies, k)
		}
	}
}

type Order struct {
	ID        string
	Timestamp util.JSONTime
	Datetime  string
	Symbol    string
	Status    string
	Type      string
	Side      string
	Price     float64
	Cost      float64
	Amount    float64
	Filled    float64
	Remaining float64
	Fee       float64
	Info      interface{}
}

func (o Order) String() string {
	return fmt.Sprintf("%s %f %s @%f (filled: %f)",
		o.Side, o.Amount, o.Symbol, o.Price, o.Filled)
}

type OrderBook struct {
	Asks      []BookEntry
	Bids      []BookEntry
	Timestamp time.Time
	Datetime  string
	Nonce     int
}

type BookEntry struct {
	Price, Amount float64
}

// UnmarshalJSON accepts both forms for BookEntry:
//   - []float64 of size 2 or
//   - default BookEntry struct
func (o *BookEntry) UnmarshalJSON(b []byte) (err error) {
	// []float64 unmarshal
	var f []float64
	err = json.Unmarshal(b, &f)
	if err == nil {
		if len(f) != 2 {
			return fmt.Errorf("UnmarshalJSON: expected 2 floats for BookEntry, got %d", len(f))
		}
		o.Price, o.Amount = f[0], f[1]
		return nil
	}
	// default struct unmarshal to compatible type
	type t BookEntry
	err2 := json.Unmarshal(b, (*t)(o))
	if err2 == nil {
		return nil
	}
	return err
}

type Trade struct {
	ID        string
	Symbol    string
	Amount    float64
	Price     float64
	Timestamp util.JSONTime
	Datetime  string
	Order     string
	Type      string
	Side      string
	Info      interface{}
}

type Ticker struct {
	Symbol      string
	Ask         float64
	Bid         float64
	High        float64
	Low         float64
	Average     float64
	BaseVolume  float64
	QuoteVolume float64
	Change      float64
	Open        float64
	Close       float64
	First       float64
	Last        float64
	Percentage  float64
	VWAP        float64
	Timestamp   util.JSONTime
	Datetime    string
	Info        interface{}
}

type Currency struct {
	ID   string
	Code string
}

type DepositAddress struct {
	Currency string
	Address  string
	Status   string
	Info     interface{}
}

type OHLCV struct {
	Timestamp     util.JSONTime
	O, H, L, C, V float64
}

// UnmarshalJSON accepts both forms for OHLCV:
//   - default struct or
//   - []float64 of size 6
func (o *OHLCV) UnmarshalJSON(b []byte) (err error) {
	// default struct unmarshal to compatible type
	type t OHLCV
	err = json.Unmarshal(b, (*t)(o))
	if err == nil {
		return nil
	}
	// []float64 unmarshal
	var f []float64
	err2 := json.Unmarshal(b, &f)
	if err2 != nil {
		return err2 // return float64 unmarshal error as it's the expected form
	}
	if len(f) != 6 {
		return fmt.Errorf("UnmarshalJSON: expected 6 floats for OHLCV, got %d", len(f))
	}

	err2 = json.Unmarshal([]byte(fmt.Sprintf("%f", f[0])), &o.Timestamp)
	if err2 != nil {
		return fmt.Errorf("UnmarshalJSON: couldn't unmarshal timestamp: %s", err2)
	}
	o.O, o.H, o.L, o.C, o.V = f[1], f[2], f[3], f[4], f[5]
	return nil
}
