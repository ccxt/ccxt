package ccxt

import (
	"sync"
)

type ExchangeMarketMaps struct {
	MarketsMutex        *sync.Mutex
	Markets             *sync.Map
	Markets_by_id       *sync.Map
	Currencies_by_id    *sync.Map
	Currencies          *sync.Map
	MarketsById         *sync.Map
	BaseCurrencies      *sync.Map
	QuoteCurrencies     *sync.Map
	CurrenciesById      *sync.Map
	Has                 map[string]interface{}
	Api                 map[string]interface{}
	TransformedApi      map[string]interface{}
	RequiredCredentials map[string]interface{}
	HttpExceptions      map[string]interface{}
	Timeframes          map[string]interface{}
	Features            map[string]interface{}
	Exceptions          map[string]interface{}
	Precision           map[string]interface{}
	UserAgents          map[string]interface{}
	TokenBucket         map[string]interface{}
	Symbols             []string
	Codes               []string
	Ids                 []string
	CommonCurrencies    map[string]interface{}
	Limits              map[string]interface{}
	Fees                map[string]interface{}
}

func (this *Exchange) GetMarketMaps() ExchangeMarketMaps {
	if this.marketsLoaded == false {
		this.LoadMarkets()
	}

	return ExchangeMarketMaps{
		MarketsMutex:        this.MarketsMutex,
		Markets:             this.Markets,
		Markets_by_id:       this.Markets_by_id,
		Currencies_by_id:    this.Currencies_by_id,
		Currencies:          this.Currencies,
		MarketsById:         this.MarketsById,
		BaseCurrencies:      this.BaseCurrencies,
		QuoteCurrencies:     this.QuoteCurrencies,
		CurrenciesById:      this.CurrenciesById,
		TransformedApi:      this.TransformedApi,
		Has:                 this.Has,
		Api:                 this.Api,
		RequiredCredentials: this.RequiredCredentials,
		HttpExceptions:      this.HttpExceptions,
		Timeframes:          this.Timeframes,
		Features:            this.Features,
		Exceptions:          this.Exceptions,
		Precision:           this.Precision,
		UserAgents:          this.UserAgents,
		TokenBucket:         this.TokenBucket,
		Symbols:             this.Symbols,
		Codes:               this.Codes,
		Ids:                 this.Ids,
		CommonCurrencies:    this.CommonCurrencies,
		Limits:              this.Limits,
		Fees:                this.Fees,
	}
}

func (this *Exchange) SetMarketMaps(m ExchangeMarketMaps) {
	this.MarketsMutex = m.MarketsMutex
	this.Markets = m.Markets
	this.Markets_by_id = m.Markets_by_id
	this.Currencies_by_id = m.Currencies_by_id
	this.Currencies = m.Currencies
	this.MarketsById = m.MarketsById
	this.BaseCurrencies = m.BaseCurrencies
	this.QuoteCurrencies = m.QuoteCurrencies
	this.CurrenciesById = m.CurrenciesById
	this.marketsLoaded = true
	this.TransformedApi = m.TransformedApi
	this.Has = m.Has
	this.Api = m.Api
	this.RequiredCredentials = m.RequiredCredentials
	this.HttpExceptions = m.HttpExceptions
	this.Timeframes = m.Timeframes
	this.Features = m.Features
	this.Exceptions = m.Exceptions
	this.Precision = m.Precision
	this.UserAgents = m.UserAgents
	this.TokenBucket = m.TokenBucket
	this.Symbols = m.Symbols
	this.Codes = m.Codes
	this.Ids = m.Ids
	this.CommonCurrencies = m.CommonCurrencies
	this.Limits = m.Limits
	this.Fees = m.Fees
}
