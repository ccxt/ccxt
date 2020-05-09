package bitmex

// AUTOMATICALLY GENERATED, BUT NEEDS TO BE MODIFIED:
import (
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/ccxt/ccxt/go/pkg/ccxt"
)

// Exchange struct
type Exchange struct {
	Client         *http.Client
	Info           ccxt.ExchangeInfo
	Config         ccxt.ExchangeConfig
	Markets        map[string]ccxt.Market
	MarketsByID    map[string]ccxt.Market
	IDs            []string
	Symbols        []string
	Currencies     map[string]ccxt.Currency
	CurrenciesByID map[string]ccxt.Currency
}

// Init Exchange
func Init(conf ccxt.ExchangeConfig) (*Exchange, error) {
	var info ccxt.ExchangeInfo
	configFile := "/Users/stefan/Github/ccxt/templates/internal/app/bitmex/bitmex.json"
	f, err := os.Open(configFile)
	defer f.Close()
	if err != nil {
		return nil, err
	}
	json.NewDecoder(f).Decode(&info)
	timeout := 10 * time.Second
	if conf.Timeout > 0 {
		timeout = conf.Timeout * time.Millisecond
	}
	client := &http.Client{Timeout: timeout}
	exchange := Exchange{
		Config: conf,
		Client: client,
		Info:   info,
	}
	return &exchange, nil
}

// FetchCurrencies returns ccxt.Currency
func (x *Exchange) FetchCurrencies() (map[string]ccxt.Currency, error) {
	currencies := x.Currencies
	return currencies, nil
}

// GetInfo returns ccxt.ExchangeInfo
func (x *Exchange) GetInfo() ccxt.ExchangeInfo {
	return x.Info
}

// GetMarkets returns []ccxt.Market
func (x *Exchange) GetMarkets() map[string]ccxt.Market {
	return x.Markets
}

// SetMarkets sets to Markets key
func (x *Exchange) SetMarkets(markets map[string]ccxt.Market) {
	x.Markets = markets
}

// GetCurrencies returns []ccxt.Currency
func (x *Exchange) GetCurrencies() map[string]ccxt.Currency {
	return x.Currencies
}

// SetCurrencies sets to Currencies key
func (x *Exchange) SetCurrencies(currencies map[string]ccxt.Currency) {
	x.Currencies = currencies
}

// SetSymbols sets to Symbols key
func (x *Exchange) SetSymbols(slice []string) {
	x.Symbols = slice
}

// SetIDs sets to Symbols key
func (x *Exchange) SetIDs(slice []string) {
	x.IDs = slice
}

// GetMarketsByID returns map[string]ccxt.Market
func (x *Exchange) GetMarketsByID() map[string]ccxt.Market {
	return x.MarketsByID
}

// SetMarketsByID sets to MarketsByID key
func (x *Exchange) SetMarketsByID(markets map[string]ccxt.Market) {
	x.MarketsByID = markets
}

// GetCurrenciesByID returns map[string]ccxt.Currency
func (x *Exchange) GetCurrenciesByID() map[string]ccxt.Currency {
	return x.CurrenciesByID
}

// SetCurrenciesByID sets to CurrenciesByID key
func (x *Exchange) SetCurrenciesByID(currencies map[string]ccxt.Currency) {
	x.CurrenciesByID = currencies
}

// FetchMarkets and insert into the Exchange
func (x *Exchange) FetchMarkets(params *url.Values) ([]ccxt.Market, error) {
	instruments, err := x.PublicGetInstrumentActiveAndIndices(params)
	if err != nil {
		return nil, err
	}
	result := make([]ccxt.Market, len(instruments))
	for i, market := range instruments {
		active := (market.State != "Unlisted")
		id := market.Symbol
		baseID := market.Underlying
		quoteID := market.QuoteCurrency
		baseQuote := baseID + quoteID
		base := baseID   // TODO: commonCurrencyCode()
		quote := quoteID // TODO: commonCurrencyCode()
		swap := (id == baseQuote)
		// 'positionCurrency' may be empty ("", as Bitmex currently returns for ETHUSD)
		// so let's take the quote currency first and then adjust if needed
		// TODO: safeString2()
		var positionID string
		if market.PositionCurrency != "" {
			positionID = market.PositionCurrency
		} else {
			positionID = market.QuoteCurrency
		}
		var oType string
		future := false
		prediction := false
		position := positionID
		symbol := id
		if swap {
			oType = "swap"
			symbol = base + "/" + quote
		} else if strings.Index(id, "B_") >= 0 {
			prediction = true
			oType = "prediction"
		} else {
			future = true
			oType = "future"
		}
		precision := ccxt.Precision{}
		// precision := map[string]float64{
		// 	"amount": 0,
		// 	"price":  0,
		// }
		lotSize := market.LotSize   // TODO: safeFloat()
		tickSize := market.TickSize // TODO: safeFloat()
		if lotSize > 0 {
			precision.Amount = int(lotSize) // TODO: precisionFromString( truncate_to_string(lotSize, 16))
		}
		if tickSize > 0 {
			precision.Price = int(tickSize) // TODO: precisionFromString( truncate_to_string(tickSize, 16))
		}
		limits := ccxt.Limits{
			Amount: ccxt.MinMax{},
			Price: ccxt.MinMax{
				Min: tickSize,
				Max: market.MaxPrice,
			},
			Cost: ccxt.MinMax{},
		}
		// limits := map[string]map[string]float64{
		// 	"amount": map[string]float64{
		// 		"min": 0,
		// 		"max": 0,
		// 	},
		// 	"price": map[string]float64{
		// 		"min": tickSize,
		// 		"max": market.MaxPrice, // TODO: safeFloat()
		// 	},
		// 	"cost": map[string]float64{
		// 		"min": 0,
		// 		"max": 0,
		// 	},
		// }
		limitsUpdate := ccxt.MinMax{
			Min: float64(lotSize),
			Max: float64(market.MaxOrderQty), // TODO: safeFloat()
		}
		if position == quote {
			limits.Cost = limitsUpdate
		} else {
			limits.Amount = limitsUpdate
		}

		result[i] = ccxt.Market{
			ID:         id,
			Symbol:     symbol,
			Base:       base,
			Quote:      quote,
			BaseID:     baseID,
			QuoteID:    quoteID,
			Active:     active,
			Precision:  precision,
			Limits:     limits,
			Taker:      market.TakerFee,
			Maker:      market.MakerFee,
			Type:       oType,
			Spot:       false,
			Swap:       swap,
			Future:     future,
			Prediction: prediction,
			Info:       market,
		}
	}
	return result, nil
}

// FetchBalance from exchange
func (x *Exchange) FetchBalance(params *url.Values) (ccxt.Account, error) {
	account := ccxt.Account{}
	_, err := ccxt.LoadMarkets(x, false, &url.Values{})
	if err != nil {
		return account, err
	}
	if params.Get("currency") == "" {
		params.Set("currency", "all")
	}
	margins, err := x.PrivateGetUserMargin(params)
	if err != nil {
		return account, err
	}
	var raw []map[string]interface{}
	tmp, err := json.Marshal(margins)
	if err != nil {
		return account, err
	}
	err = json.Unmarshal(tmp, &raw)
	if err != nil {
		return account, err
	}
	result := map[string]ccxt.Balance{}
	for _, balance := range margins {
		currencyID := balance.Currency
		currencyID = strings.ToUpper(currencyID)
		code := currencyID // TODO: commonCurrencyCode()
		wallet := ccxt.Balance{
			Free:  float64(balance.AvailableMargin),
			Used:  0.0,
			Total: float64(balance.MarginBalance),
		}
		if code == "BTC" {
			wallet.Free = wallet.Free * 0.00000001
			wallet.Total = wallet.Total * 0.00000001
		}
		wallet.Used = wallet.Total - wallet.Free
		result[code] = wallet
	}
	return ccxt.ParseBalance(x, result, raw[0]), nil
}
