package bitmex

// AUTOMATICALLY GENERATED, BUT NEEDS TO BE MODIFIED:
import (
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/ccxt/ccxt/go/internal/app/bitmex/models"
	"github.com/ccxt/ccxt/go/pkg/ccxt"
)

// Exchange struct
type Exchange struct {
	Client         *http.Client
	Info           ccxt.ExchangeInfo
	Config         ccxt.ExchangeConfig
	Markets        []ccxt.Market
	MarketsByID    map[string]ccxt.Market
	IDs            []string
	Symbols        []string
	Currencies     []ccxt.Currency
	CurrenciesByID map[string]ccxt.Currency
}

// Init Exchange
func Init(conf ccxt.ExchangeConfig) (*Exchange, error) {
	var info ccxt.ExchangeInfo
	configFile := "/Users/stefan/Github/ccxt/go/internal/app/bitmex/bitmex.json"
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
func (x *Exchange) FetchCurrencies() ([]ccxt.Currency, error) {
	currencies := x.Currencies
	return currencies, nil
}

// GetInfo returns ccxt.ExchangeInfo
func (x *Exchange) GetInfo() ccxt.ExchangeInfo {
	return x.Info
}

// GetMarkets returns []ccxt.Market
func (x *Exchange) GetMarkets() []ccxt.Market {
	return x.Markets
}

// GetCurrencies returns []ccxt.Currency
func (x *Exchange) GetCurrencies() []ccxt.Currency {
	return x.Currencies
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

// SetMarkets from exchange
func (x *Exchange) SetMarkets(markets []ccxt.Market, currencies []ccxt.Currency) []ccxt.Market {
	x.Markets = markets
	x.Symbols = make([]string, len(markets))
	x.IDs = make([]string, len(markets))
	if x.MarketsByID == nil {
		x.MarketsByID = make(map[string]ccxt.Market, len(markets))
	}
	for i, market := range markets {
		x.MarketsByID[market.ID] = market
		x.Symbols[i] = market.Symbol
		x.IDs[i] = market.ID
	}
	if currencies != nil {
		x.Currencies = currencies
	} else {
		// TODO: currencies
	}
	if x.CurrenciesByID == nil {
		x.CurrenciesByID = make(map[string]ccxt.Currency, len(currencies))
	}
	for _, currency := range currencies {
		x.CurrenciesByID[currency.ID] = currency
	}
	return x.Markets
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
	var response interface{}
	response, err = x.PrivateGetUserMargin(params)
	if err != nil {
		return account, err
	}
	// info := response.(map[string]interface{})
	margin := response.([]models.Margin)
	result := map[string]ccxt.Balance{}
	// balance := margin.(models.Margin)
	for _, balance := range margin {
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
	return ccxt.ParseBalance(x, result, response), nil
}
