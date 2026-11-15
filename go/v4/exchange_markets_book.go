package ccxt

// The market and currency tables (Markets, Markets_by_id, Currencies, Currencies_by_id) are plain
// map fields of BaseExchange. A published map is never written in place: a writer builds a whole
// new map and assigns the field, so a reader that already holds the old map sees it unchanged.
// SetMarkets / SetCurrencies assign whole tables; the Add*Entry methods below copy, add one entry
// and assign. No lock and no owner goroutine: see the race note in the fold report.

func tableWithEntry(source map[string]any, key any, value any) map[string]any {
	text, ok := derefScalar(key).(string)
	if !ok {
		return source // AddElementToObject writes string keys only
	}
	copied := make(map[string]any, len(source)+1)
	for k, v := range source {
		copied[k] = v
	}
	copied[text] = derefScalar(value)
	return copied
}

func (this *BaseExchange) AddMarketsEntry(key any, value any) {
	this.Markets = tableWithEntry(this.Markets, key, value)
}

func (this *BaseExchange) AddMarketsByIdEntry(key any, value any) {
	this.Markets_by_id = tableWithEntry(this.Markets_by_id, key, value)
}

func (this *BaseExchange) AddCurrenciesEntry(key any, value any) {
	this.Currencies = tableWithEntry(this.Currencies, key, value)
}

func (this *BaseExchange) AddCurrenciesByIdEntry(key any, value any) {
	this.Currencies_by_id = tableWithEntry(this.Currencies_by_id, key, value)
}
