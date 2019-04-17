package ccxt

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/ccxt/ccxt/go/internal/util"
)

// ExchangeConfig for main configuration
// Timeout takes json value in milliseconds
type ExchangeConfig struct {
	APIKey          string        `json:"apiKey"`
	Secret          string        `json:"secret"`
	Timeout         time.Duration `json:"timeout"`
	EnableRateLimit bool          `json:"enableRateLimit"`
	Test            bool          `json:"test"`
}

// ExchangeInfo for the exchange
type ExchangeInfo struct {
	ID                               string            `json:"id"`
	Name                             string            `json:"name"`
	Countries                        StringSlice       `json:"countries"`
	Version                          string            `json:"version"`
	EnableRateLimit                  bool              `json:"enableRateLimit"`
	RateLimit                        int               `json:"rateLimit"`
	Has                              HasDescription    `json:"has"`
	URLs                             URLs              `json:"urls"`
	API                              APIs              `json:"api"`
	Timeframes                       map[string]string `json:"timeframes"`
	Fees                             Fees              `json:"fees"`
	UserAgents                       map[string]string `json:"userAgents"`
	Header                           http.Header       `json:"header"`
	Proxy                            string            `json:"proxy"`
	Origin                           string            `json:"origin"`
	Verbose                          bool              `json:"verbose"`
	Limits                           Limits            `json:"limits"`
	Precision                        Precision         `json:"precision"`
	Exceptions                       Exceptions        `json:"exceptions"`
	DontGetUsedBalanceFromStaleCache bool              `json:"dontGetUsedBalanceFromStaleCache"`
}

// APIs public and private methods
type APIs struct {
	Public  APIMethods `json:"public"`
	Private APIMethods `json:"private"`
}

// APIMethods get/post/put/delete urls
type APIMethods struct {
	Get    map[string]string `json:"get"`
	Post   map[string]string `json:"post"`
	Put    map[string]string `json:"put"`
	Delete map[string]string `json:"delete"`
}

// URLs for exchange
type URLs struct {
	WWW  string      `json:"www"`
	Test string      `json:"test"`
	API  string      `json:"api"`
	Logo StringSlice `json:"logo"`
	Doc  StringSlice `json:"doc"`
	Fees StringSlice `json:"fees"`
}

// Exceptions takes exact/broad errors and classifies
// them to general errors
type Exceptions struct {
	Exact Exception `json:"exact"`
	Broad Exception `json:"broad"`
}

// Exception takes the string and applies the error method
type Exception map[string]error

// UnmarshalJSON accepts strings and links to the appropaite error method:
func (e Exception) UnmarshalJSON(b []byte) error {
	var errTypes map[string]string
	err := json.Unmarshal(b, &errTypes)
	if err != nil {
		return err
	}
	for msg, errType := range errTypes {
		if e == nil {
			e = make(map[string]error)
		}
		e[msg] = TypedError(errType, msg)
	}
	return nil
}

// HasDescription for exchange functionality
type HasDescription struct {
	CancelAllOrders      bool `json:"cancelAllOrders"`
	CancelOrder          bool `json:"cancelOrder"`
	CancelOrders         bool `json:"cancelOrders"`
	CORS                 bool `json:"CORS"`
	CreateDepositAddress bool `json:"createDepositAddress"`
	CreateLimitOrder     bool `json:"createLimitOrder"`
	CreateMarketOrder    bool `json:"createMarketOrder"`
	CreateOrder          bool `json:"createOrder"`
	Deposit              bool `json:"deposit"`
	EditOrder            bool `json:"editOrder"`
	FetchBalance         bool `json:"fetchBalance"`
	FetchBidsAsks        bool `json:"fetchBidsAsks"`
	FetchClosedOrders    bool `json:"fetchClosedOrders"`
	FetchCurrencies      bool `json:"fetchCurrencies"`
	FetchDepositAddress  bool `json:"fetchDepositAddress"`
	FetchDeposits        bool `json:"fetchDeposits"`
	FetchFundingFees     bool `json:"fetchFundingFees"`
	FetchL2OrderBook     bool `json:"fetchL2OrderBook"`
	FetchLedger          bool `json:"fetchLedger"`
	FetchMarkets         bool `json:"fetchMarkets"`
	FetchMyTrades        bool `json:"fetchMyTrades"`
	FetchOHLCV           bool `json:"fetchOHLCV"`
	FetchOpenOrders      bool `json:"fetchOpenOrders"`
	FetchOrder           bool `json:"fetchOrder"`
	FetchOrderBook       bool `json:"fetchOrderBook"`
	FetchOrderBooks      bool `json:"fetchOrderBooks"`
	FetchOrders          bool `json:"fetchOrders"`
	FetchTicker          bool `json:"fetchTicker"`
	FetchTickers         bool `json:"fetchTickers"`
	FetchTrades          bool `json:"fetchTrades"`
	FetchTradingFee      bool `json:"fetchTradingFee"`
	FetchTradingFees     bool `json:"fetchTradingFees"`
	FetchTradingLimits   bool `json:"fetchTradingLimits"`
	FetchTransactions    bool `json:"fetchTransactions"`
	FetchWithdrawals     bool `json:"fetchWithdrawals"`
	PrivateAPI           bool `json:"privateAPI"`
	PublicAPI            bool `json:"publicAPI"`
	Withdraw             bool `json:"withdraw"`
}

// StringSlice a custom type for handling variable JSON
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

// APIURLs for different types of urls
type APIURLs struct {
	Public  string `json:"public"`
	Private string `json:"private"`
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

// Fees for using the exchange
type Fees struct {
	Trading TradingFees `json:"trading"`
	Funding FundingFees `json:"funding"`
}

// TradingFees on the exchange
type TradingFees struct {
	TierBased  bool             `json:"tierBased"`
	Percentage bool             `json:"percentage"`
	Maker      float64          `json:"maker"`
	Taker      float64          `json:"taker"`
	Tiers      TradingFeesTiers `json:"tiers"`
}

// TradingFeesTiers on the exchange
type TradingFeesTiers struct {
	Taker [][2]float64 `json:"taker"`
	Maker [][2]float64 `json:"maker"`
}

// FundingFees for using the exchange
type FundingFees struct {
	TierBased  bool               `json:"tierBased"`
	Percentage bool               `json:"percentage"`
	Deposit    map[string]float64 `json:"deposit"`
	Withdraw   map[string]float64 `json:"withdraw"`
}

// Account details
type Account struct {
	Free  map[string]float64 `json:"free"`
	Used  map[string]float64 `json:"used"`
	Total map[string]float64 `json:"total"`
}

// Balance details
type Balance struct {
	Free  float64 `json:"free"`
	Used  float64 `json:"used"`
	Total float64 `json:"total"`
}

// Balances details
type Balances struct {
	Currencies map[string]Balance `json:"currencies"`
	Free       map[string]float64 `json:"free"`
	Used       map[string]float64 `json:"used"`
	Total      map[string]float64 `json:"total"`
	Info       interface{}        `json:"info"`
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

// FilterZeros remove Balances entries which equal to 0
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

// Order structure
type Order struct {
	ID        string        `json:"id"`
	Timestamp util.JSONTime `json:"timestamp"`
	Datetime  string        `json:"datetime"`
	Symbol    string        `json:"symbol"`
	Status    string        `json:"status"`
	Type      string        `json:"type"`
	Side      string        `json:"side"`
	Price     float64       `json:"price"`
	Cost      float64       `json:"cost"`
	Amount    float64       `json:"amount"`
	Filled    float64       `json:"filled"`
	Remaining float64       `json:"remaining"`
	Fee       float64       `json:"fee"`
	Info      interface{}   `json:"info"`
}

func (o Order) String() string {
	return fmt.Sprintf("%s %f %s @%f (filled: %f)",
		o.Side, o.Amount, o.Symbol, o.Price, o.Filled)
}

// OrderBook struct
type OrderBook struct {
	Asks      []BookEntry `json:"asks"`
	Bids      []BookEntry `json:"bids"`
	Timestamp time.Time   `json:"timestamp"`
	Datetime  string      `json:"datetime"`
	Nonce     int         `json:"nonce"`
}

// BookEntry struct
type BookEntry struct {
	Price  float64 `json:"price"`
	Amount float64 `json:"amount"`
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

// Trade struct
type Trade struct {
	ID        string        `json:"id"`
	Symbol    string        `json:"symbol"`
	Amount    float64       `json:"amount"`
	Price     float64       `json:"price"`
	Timestamp util.JSONTime `json:"timestamp"`
	Datetime  string        `json:"datetime"`
	Order     string        `json:"order"`
	Type      string        `json:"type"`
	Side      string        `json:"side"`
	Info      interface{}   `json:"info"`
}

// Ticker struct
type Ticker struct {
	Symbol      string        `json:"symbol"`
	Ask         float64       `json:"ask"`
	Bid         float64       `json:"bid"`
	High        float64       `json:"high"`
	Low         float64       `json:"low"`
	Average     float64       `json:"average"`
	BaseVolume  float64       `json:"baseVolume"`
	QuoteVolume float64       `json:"quoteVolume"`
	Change      float64       `json:"change"`
	Open        float64       `json:"open"`
	Close       float64       `json:"close"`
	First       float64       `json:"first"`
	Last        float64       `json:"last"`
	Percentage  float64       `json:"percentage"`
	VWAP        float64       `json:"vwap"`
	Timestamp   util.JSONTime `json:"timestamp"`
	Datetime    string        `json:"datetime"`
	Info        interface{}   `json:"info"`
}

// Currency struct
type Currency struct {
	ID        string `json:"id"`
	Code      string `json:"code"`
	NumericID string `json:"numericId"`
	Precision int    `json:"precision"`
}

// DepositAddress struct
type DepositAddress struct {
	Currency string      `json:"currency"`
	Address  string      `json:"address"`
	Status   string      `json:"status"`
	Info     interface{} `json:"info"`
}

// OHLCV open, high, low, close, volume
type OHLCV struct {
	Timestamp util.JSONTime `json:"timestamp"`
	O         float64       `json:"o"`
	H         float64       `json:"h"`
	L         float64       `json:"l"`
	C         float64       `json:"c"`
	V         float64       `json:"v"`
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
