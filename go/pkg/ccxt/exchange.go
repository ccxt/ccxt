package ccxt

import (
	"encoding/json"
	"fmt"
	"net/url"
	"sort"
)

// Exchange is a common interface of methods
type Exchange interface {
	// FetchTickers(symbols []string, params map[string]interface{}) (map[string]Ticker, error)
	// FetchTicker(symbol string, params map[string]interface{}) (Ticker, error)
	// FetchOHLCV(symbol, tf string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]OHLCV, error)
	// FetchOrderBook(symbol string, limit *int, params map[string]interface{}) (OrderBook, error)
	// FetchL2OrderBook(symbol string, limit *int, params map[string]interface{}) (OrderBook, error)
	// FetchTrades(symbol string, since *util.JSONTime, params map[string]interface{}) ([]Trade, error)
	// FetchOrder(id string, symbol *string, params map[string]interface{}) (Order, error)
	// FetchOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error)
	// FetchOpenOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error)
	// FetchClosedOrders(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Order, error)
	// FetchMyTrades(symbol *string, since *util.JSONTime, limit *int, params map[string]interface{}) ([]Trade, error)
	// FetchBalance(params map[string]interface{}) (Balances, error)
	FetchCurrencies() (map[string]Currency, error)
	FetchMarkets(params *url.Values) ([]Market, error)

	// CreateOrder(symbol, t, side string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	// CancelOrder(id string, symbol *string, params map[string]interface{}) error

	GetInfo() ExchangeInfo
	GetMarkets() map[string]Market
	SetMarkets(map[string]Market)
	GetMarketsByID() map[string]Market
	SetMarketsByID(map[string]Market)
	GetCurrencies() map[string]Currency
	SetCurrencies(map[string]Currency)
	GetCurrenciesByID() map[string]Currency
	SetCurrenciesByID(map[string]Currency)
	SetSymbols([]string)
	SetIDs([]string)
	// GetOrders() []Order
	// LoadMarkets(reload bool, params *url.Values) (map[string]Market, error)
	// GetMarket(symbol string) (Market, error)
	// CreateLimitBuyOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	// CreateLimitSellOrder(symbol string, amount float64, price *float64, params map[string]interface{}) (Order, error)
	// CreateMarketBuyOrder(symbol string, amount float64, params map[string]interface{}) (Order, error)
	// CreateMarketSellOrder(symbol string, amount float64, params map[string]interface{}) (Order, error)
}

// Exchanges returns the available exchanges
func Exchanges() []string {
	available := []string{"bitmex"}
	return available
}

// Info on the exchange
func Info(x Exchange) {
	var info interface{}
	info = x
	msg, err := json.MarshalIndent(info, "", "  ")
	if err != nil {
		fmt.Printf("Error JSONMarshal: %v", err)
	}
	fmt.Println(string(msg))
}

// LoadMarkets from the exchange that are active and available
func LoadMarkets(x Exchange, reload bool, params *url.Values) (map[string]Market, error) {
	if !reload && x.GetMarkets() != nil {
		return x.GetMarkets(), nil
	}
	var currencies map[string]Currency
	var err error
	if x.GetInfo().Has.FetchCurrencies {
		currencies, err = x.FetchCurrencies()
		if err != nil {
			return nil, err
		}
	}
	markets, err := x.FetchMarkets(params)
	if err != nil {
		return nil, err
	}
	return setMarkets(x, markets, currencies), nil
}

func getCurrencyUsedOnOpenOrders(currency string) float64 {
	// TODO: implement getCurrencyUsedOnOpenOrders()
	return 0.0
}

// setMarkets sets Markets, MarketsByID, Symbols, SymbolsByIDs, IDs,
// Currencies, CurrenciesByIDs into the Exchange struct
func setMarkets(x Exchange, markets []Market, currencies map[string]Currency) map[string]Market {
	symbols := make([]string, len(markets))
	IDs := make([]string, len(markets))
	marketsBySymbol := x.GetMarkets()
	if len(marketsBySymbol) == 0 {
		marketsBySymbol = make(map[string]Market, len(markets))
	}
	marketsByID := x.GetMarketsByID()
	if len(marketsByID) == 0 {
		marketsByID = make(map[string]Market, len(markets))
	}
	baseCurrencies := make([]Currency, 0)
	quoteCurrencies := make([]Currency, 0)
	for i, market := range markets {
		marketsBySymbol[market.Symbol] = market
		marketsByID[market.ID] = market
		symbols[i] = market.Symbol
		IDs[i] = market.ID
		// currency logic
		baseCurrency := new(Currency)
		if market.Base != "" {
			baseCurrency.ID = market.BaseID
			if baseCurrency.ID == "" {
				baseCurrency.ID = market.Base
			}
			baseCurrency.NumericID = market.BaseNumericID
			baseCurrency.Code = market.Base
			switch {
			case market.Precision.Base != 0:
				baseCurrency.Precision = market.Precision.Base
			case market.Precision.Amount != 0:
				baseCurrency.Precision = market.Precision.Amount
			default:
				baseCurrency.Precision = 8
			}
		}
		baseCurrencies = append(baseCurrencies, *baseCurrency)
		quoteCurrency := new(Currency)
		if market.Quote != "" {
			quoteCurrency.ID = market.QuoteID
			if baseCurrency.ID == "" {
				quoteCurrency.ID = market.Quote
			}
			quoteCurrency.NumericID = market.QuoteNumericID
			quoteCurrency.Code = market.Quote
			switch {
			case market.Precision.Base != 0:
				quoteCurrency.Precision = market.Precision.Base
			case market.Precision.Amount != 0:
				quoteCurrency.Precision = market.Precision.Amount
			default:
				quoteCurrency.Precision = 8
			}
		}
		quoteCurrencies = append(quoteCurrencies, *quoteCurrency)
	}
	allCurrencies := append(baseCurrencies, quoteCurrencies...)
	groupedCurrencies := make(map[string][]Currency)
	for _, currency := range allCurrencies {
		groupedCurrencies[currency.Code] = append(groupedCurrencies[currency.Code], currency)
	}
	sortedCurrencies := make(map[string]Currency)
	for code, currencies := range groupedCurrencies {
		for _, currency := range currencies {
			if sortedCurrencies[code].ID == "" {
				sortedCurrencies[code] = currency
			}
			if sortedCurrencies[code].Precision < currency.Precision {
				sortedCurrencies[code] = currency
			}
		}
	}

	sort.Strings(symbols)
	sort.Strings(IDs)
	x.SetSymbols(symbols)
	x.SetIDs(IDs)
	x.SetMarkets(marketsBySymbol)
	x.SetMarketsByID(marketsByID)
	if len(currencies) == 0 {
		xCurrencies := x.GetCurrencies()
		if xCurrencies == nil {
			xCurrencies = make(map[string]Currency)
		}
		for code, currency := range sortedCurrencies {
			xCurrencies[code] = currency
		}
		x.SetCurrencies(xCurrencies)
	} else {
		x.SetCurrencies(sortedCurrencies)
	}
	currenciesByID := x.GetCurrenciesByID()
	if len(currenciesByID) == 0 {
		currenciesByID = make(map[string]Currency, len(currencies))
	}
	for _, currency := range sortedCurrencies {
		currenciesByID[currency.ID] = currency
	}
	x.SetCurrenciesByID(currenciesByID)
	return x.GetMarkets()
}

// ParseBalance into the correct struct
func ParseBalance(x Exchange, balances map[string]Balance, raw map[string]interface{}) Account {
	account := Account{
		Free:  make(map[string]float64),
		Used:  make(map[string]float64),
		Total: make(map[string]float64),
	}
	for currency, balance := range balances {
		if balance.Free == 0 && balance.Used == 0 {
			// exchange reports only 'free' balance -> try to derive 'used' funds from open orders cache
			if _, ok := raw["open_orders"]; ok && x.GetInfo().DontGetUsedBalanceFromStaleCache {
				// liqui exchange reports number of open orders with balance response
				// use it to validate the cache
				exchangeOrdersCount := raw["open_orders"]
				// TODO: implement this.orders here
				cachedOrdersCount := 0
				if exchangeOrdersCount == cachedOrdersCount {
					balance.Used = getCurrencyUsedOnOpenOrders(currency)
					balance.Total = balance.Used + balance.Free
				}
			} else {
				balance.Used = getCurrencyUsedOnOpenOrders(currency)
				balance.Total = balance.Used + balance.Free
			}
		}
		account.Free[currency] = balance.Free
		account.Used[currency] = balance.Used
		account.Total[currency] = balance.Total
	}
	return account
}
