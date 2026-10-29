package ccxt

// Markets book: the four market/currency tables live in one immutable snapshot.
// One owner goroutine applies every edit; writers hand the edit over a channel and
// wait for the swap, so the read-modify-write is serialized without a lock.

type marketsBook struct {
	markets        map[string]any
	marketsById    map[string]any
	currencies     map[string]any
	currenciesById map[string]any
}

// A request either swaps in a new snapshot (edit) or hands the current one back (read),
// so the owner goroutine is the only goroutine that ever touches the live book.
type marketsBookRequest struct {
	edit  func(*marketsBook)
	reply chan any
}

func marketsBookNext(current *marketsBook) *marketsBook {
	next := &marketsBook{}
	if current != nil {
		*next = *current
	}
	return next
}

func marketsBookCopied(source map[string]any) map[string]any {
	if source == nil {
		return nil
	}
	copied := make(map[string]any, len(source)+1)
	for key, value := range source {
		copied[key] = value
	}
	return copied
}

func marketsBookWithEntry(source map[string]any, key any, value any) map[string]any {
	text, ok := derefScalar(key).(string)
	if !ok {
		return source // AddElementToObject writes string keys only
	}
	copied := marketsBookCopied(source)
	if copied == nil {
		copied = map[string]any{}
	}
	copied[text] = derefScalar(value)
	return copied
}

// marketsBookRequests returns the book owner's channel, created by startOwners at
// construction, so a caller can never observe a half-started owner.
func (this *BaseExchange) marketsBookRequests() chan marketsBookRequest {
	if this.marketsBookChannel == nil {
		this.startOwners()
	}
	return this.marketsBookChannel
}

// publishMarketsBook is the single write path: hand one edit to the owner goroutine
// and wait for the swap, so a returned write is already visible to the caller.
func (this *BaseExchange) publishMarketsBook(edit func(*marketsBook)) {
	reply := make(chan any, 1)
	this.marketsBookRequests() <- marketsBookRequest{edit: edit, reply: reply}
	if recovered := <-reply; recovered != nil {
		panic(recovered)
	}
}

// ownMarketsBook is the book's only reader and writer: it applies edits one at a time
// and serves each read with the snapshot it has already published.
func (this *BaseExchange) ownMarketsBook(requests <-chan marketsBookRequest) {
	current := &marketsBook{}
	for request := range requests {
		if request.edit == nil {
			request.reply <- current
			continue
		}
		next := marketsBookNext(current)
		recovered := marketsBookApplied(request.edit, next)
		if recovered == nil {
			current = next
		}
		request.reply <- recovered
	}
}

func marketsBookApplied(edit func(*marketsBook), next *marketsBook) (recovered any) {
	defer func() {
		recovered = recover()
	}()
	edit(next)
	return
}

// marketsBookNow returns the published snapshot without copying: the owner never
// mutates a book it has handed out, it publishes a fresh one instead.
func (this *BaseExchange) marketsBookNow() *marketsBook {
	reply := make(chan any, 1)
	this.marketsBookRequests() <- marketsBookRequest{reply: reply}
	book, _ := (<-reply).(*marketsBook)
	return book
}

func (this *BaseExchange) Markets() map[string]any {
	book := this.marketsBookNow()
	if book == nil {
		return nil
	}
	return book.markets
}

func (this *BaseExchange) Markets_by_id() map[string]any {
	book := this.marketsBookNow()
	if book == nil {
		return nil
	}
	return book.marketsById
}

func (this *BaseExchange) Currencies() map[string]any {
	book := this.marketsBookNow()
	if book == nil {
		return nil
	}
	return book.currencies
}

func (this *BaseExchange) Currencies_by_id() map[string]any {
	book := this.marketsBookNow()
	if book == nil {
		return nil
	}
	return book.currenciesById
}

func (this *BaseExchange) PublishMarkets(markets any) {
	this.publishMarketsBook(func(next *marketsBook) {
		next.markets = MapTyped(markets)
	})
}

func (this *BaseExchange) PublishMarketsById(marketsById any) {
	this.publishMarketsBook(func(next *marketsBook) {
		next.marketsById = MapTyped(marketsById)
	})
}

func (this *BaseExchange) PublishCurrencies(currencies any) {
	this.publishMarketsBook(func(next *marketsBook) {
		next.currencies = MapTyped(currencies)
	})
}

func (this *BaseExchange) PublishCurrenciesById(currenciesById any) {
	this.publishMarketsBook(func(next *marketsBook) {
		next.currenciesById = MapTyped(currenciesById)
	})
}

func (this *BaseExchange) AddMarketsEntry(key any, value any) {
	this.publishMarketsBook(func(next *marketsBook) {
		next.markets = marketsBookWithEntry(next.markets, key, value)
	})
}

func (this *BaseExchange) AddMarketsByIdEntry(key any, value any) {
	this.publishMarketsBook(func(next *marketsBook) {
		next.marketsById = marketsBookWithEntry(next.marketsById, key, value)
	})
}
