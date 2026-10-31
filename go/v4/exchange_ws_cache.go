package ccxt

// The ws caches on BaseExchange (Orderbooks / Ohlcvs / Trades / FundingRates / Tickers / Bidsasks),
// the markets book and the boxed Balance / Positions fields are touched by exactly one goroutine:
// the exchange's ws dispatch loop. Handlers run there and touch them directly; user-path code hands
// the loop an operation, so a use site needs no lock and no concurrent map.
//
// Ownership argument: the loop is the only reader and writer, frames and operations arrive on one
// select, the ws client registry is read and written by the loop alone (user-path reads ask for a
// copy), and a Positions cache's own mutex still guards its rows. Not verified with -race.
//

const (
	wsOpGet = iota
	wsOpHas
	wsOpSet
	wsOpGetScalar
	wsOpSnapshot
	wsOpReset
	wsOpReplace
	wsOpApplySnapshot
	wsOpDelete
	wsOpKeys
	wsOpObjGet
	wsOpObjSet
	// registry operations: the same loop owns the ws client registry
	wsOpClientGetOrCreate
	wsOpClientDelete
	wsOpClientDeleteIfErrored
	wsOpClientDeleteIfSame
	wsOpClientDrain
	wsOpClientList
	// wsOpStop ends the loop from inside the loop, so stopping needs no lock
	wsOpStop
)

type wsFrame struct {
	client  any
	message any
}

// wsFrameHandler routes a decoded frame to the venue handler that takes its shape, mirroring the
// base routeMessage of ts/src/base/Exchange.ts: a text frame goes to HandleTextMessage, a json array
// to HandleListMessage, raw bytes to HandleBinaryMessage and a json object to HandleMessage. An
// object-framed venue declares map[string]any (GP12), any other venue the untyped frame. Resolved
// once per exchange, so dispatching a frame costs one call and no interface lookup; a frame whose
// handler the venue does not declare is dropped, as the base stubs would.
func (this *BaseExchange) wsFrameHandler() func(client any, message any) {
	text, _ := this.DerivedExchange.(interface {
		HandleTextMessage(client any, message any)
	})
	list, _ := this.DerivedExchange.(interface {
		HandleListMessage(client any, message any)
	})
	binary, _ := this.DerivedExchange.(interface {
		HandleBinaryMessage(client any, message any)
	})
	object := func(client any, message map[string]any) {}
	if venue, ok := this.DerivedExchange.(interface {
		HandleMessage(client any, message map[string]any)
	}); ok {
		object = venue.HandleMessage
	} else if venue, ok := this.DerivedExchange.(interface {
		HandleMessage(client any, message any)
	}); ok {
		object = func(client any, message map[string]any) { venue.HandleMessage(client, message) }
	}
	return func(client any, message any) {
		switch frame := message.(type) {
		case string:
			if text != nil {
				text.HandleTextMessage(client, frame)
			}
		case []any:
			if list != nil {
				list.HandleListMessage(client, frame)
			}
		case []byte:
			if binary != nil {
				binary.HandleBinaryMessage(client, frame)
			}
		case map[string]any:
			object(client, frame)
		}
	}
}

// wsCacheRead carries the comma-ok answer of a read, so the caller learns both the value and
// whether the key was there.
type wsCacheRead struct {
	value  any
	exists bool
}

type wsCacheOp struct {
	op     int
	field  string
	key    any
	book   OrderBookInterface
	value  any
	create func() any
	reply  chan any
}

type wsCacheStore struct {
	frames chan wsFrame
	ops    chan *wsCacheOp
	done   chan struct{}
}

// wsCacheStoreNow returns the exchange's dispatch loop. startOwners created it at construction,
// before the exchange was published, so a use site needs no lock.
func (this *BaseExchange) wsCacheStoreNow() *wsCacheStore {
	if this.wsStore == nil {
		this.startOwners()
	}
	return this.wsStore
}

// WsDispatch is the ws client's onMessage callback: it hands the frame to the dispatch loop, the
// owner of the ws caches and the only goroutine that runs HandleMessage.
func (this *BaseExchange) WsDispatch(client any, message any) {
	store := this.wsCacheStoreNow()
	select {
	case store.frames <- wsFrame{client: client, message: message}:
	case <-store.done:
		// the exchange was closed while the read loop was still draining
	}
}

func (this *BaseExchange) wsCacheLoop(store *wsCacheStore) {
	defer close(store.done)
	// bound on the first frame: the store starts before the venue sets DerivedExchange
	var handle func(client any, message any)
	for {
		select {
		case frame := <-store.frames:
			if handle == nil {
				handle = this.wsFrameHandler()
			}
			handle(frame.client, frame.message)
		case req := <-store.ops:
			if req.op == wsOpStop {
				req.reply <- true
				return
			}
			req.reply <- this.wsCacheApply(req)
		}
	}
}

// wsCacheStop ends the dispatch loop and waits for it, so no second owner can overlap the first.
// The stop is queued on the loop like any other operation: the loop is the only one that closes
// done, and a caller that arrives after it exited returns at once.
func (this *BaseExchange) wsCacheStop() {
	store := this.wsCacheStoreNow()
	select {
	case <-store.done:
		return
	default:
	}
	// a stop queued behind another stop finds the loop gone and returns on done
	reply := make(chan any, 1)
	select {
	case store.ops <- &wsCacheOp{op: wsOpStop, reply: reply}:
		<-reply
		<-store.done
	case <-store.done:
	}
}

func (this *BaseExchange) wsCacheField(name string) map[string]any {
	switch name {
	case "FundingRates":
		return this.FundingRates
	case "Balance":
		return this.wsBalanceMap()
	case "Tickers":
		return map[string]any(this.Tickers)
	case "Bidsasks":
		return map[string]any(this.Bidsasks)
	}
	return nil
}

// wsCacheObjectField names a ws cache that is a cache object rather than a map: the owner reads
// and writes the field, the object it holds guards its own rows.
func (this *BaseExchange) wsCacheObjectField(name string) *any {
	switch name {
	case "Positions":
		return &this.Positions
	}
	return nil
}

// wsBalanceMap answers the balance map the owner works on. The field is a plain map, and a cleared
// field is refilled here so every later operation writes the map handler code reads. Runs on the
// dispatch goroutine, or on the caller once the loop is gone (wsCacheDo's fallback).
func (this *BaseExchange) wsBalanceMap() map[string]any {
	if this.Balance == nil {
		this.Balance = map[string]any{}
	}
	return this.Balance
}

// wsCacheApply runs one map operation on the dispatch goroutine. Keys are pointer-carried in
// generated code, so every key is dereferenced first; a non-string key finds nothing.
func (this *BaseExchange) wsCacheApply(req *wsCacheOp) any {
	switch req.op {
	case wsOpClientGetOrCreate, wsOpClientDelete, wsOpClientDeleteIfErrored, wsOpClientDeleteIfSame, wsOpClientDrain, wsOpClientList:
		return this.wsClientsApply(req)
	case wsOpObjGet:
		if field := this.wsCacheObjectField(req.field); field != nil {
			return *field
		}
		return nil
	case wsOpObjSet:
		if field := this.wsCacheObjectField(req.field); field != nil {
			*field = req.value
		}
		return nil
	}
	if req.op == wsOpApplySnapshot {
		return this.wsApplyOrderBookSnapshot(req)
	}
	if req.field == "Orderbooks" {
		return this.wsOrderBookApply(req)
	}
	if req.field == "Trades" {
		return this.wsTradesApply(req)
	}
	cache := this.wsCacheField(req.field)
	if (cache == nil) && (req.op == wsOpReset) && (req.field == "Ohlcvs") {
		// the ohlcv book is typed per timeframe: clearing its symbols keeps the map
		// handler code points at, like every other cache reset does
		clear(this.Ohlcvs)
		return nil
	}
	if cache == nil {
		return nil
	}
	key, keyIsString := derefScalar(req.key).(string)
	switch req.op {
	case wsOpGet:
		if keyIsString {
			return wsCacheRead{value: cache[key], exists: true}
		}
		return wsCacheRead{}
	case wsOpHas:
		if keyIsString {
			_, exists := cache[key]
			return exists
		}
		return false
	case wsOpSet:
		if keyIsString {
			cache[key] = req.value
		}
		return nil
	case wsOpGetScalar:
		// GetValue answered derefScalar's value, so a boxed pointer reads back unboxed
		if keyIsString {
			return wsCacheRead{value: derefScalar(cache[key]), exists: true}
		}
		return wsCacheRead{}
	case wsOpReplace:
		// the whole map is replaced: keep the map handler code and earlier snapshots point at, so
		// only the entries move. An unprovable source (non-map, nil) empties the cache like the
		// assignment of an empty map would.
		source := MapTyped(req.value)
		for k := range cache {
			delete(cache, k)
		}
		for k, v := range source {
			cache[k] = v
		}
		return nil
	case wsOpDelete:
		if keyIsString {
			delete(cache, key)
		}
		return nil
	case wsOpKeys:
		keys := make([]string, 0, len(cache))
		for k := range cache {
			keys = append(keys, k)
		}
		return keys
	case wsOpSnapshot:
		out := make(map[string]any, len(cache))
		for k, v := range cache {
			out[k] = v
		}
		return out
	case wsOpReset:
		// a fresh empty map for the typed caches, so a handler can store into it again
		switch req.field {
		case "Tickers":
			this.Tickers = TickerCache{}
			return nil
		case "Bidsasks":
			this.Bidsasks = TickerCache{}
			return nil
		}
		for k := range cache {
			delete(cache, k)
		}
		return nil
	}
	return nil
}

// wsOrderBookApply is wsCacheApply for the typed order book cache: the same operations on
// OrderBookCache, which holds books rather than boxed values.
func (this *BaseExchange) wsOrderBookApply(req *wsCacheOp) any {
	cache := this.Orderbooks
	key, keyIsString := derefScalar(req.key).(string)
	switch req.op {
	case wsOpGet, wsOpGetScalar:
		if keyIsString {
			return wsCacheRead{value: cache[key], exists: true}
		}
		return wsCacheRead{}
	case wsOpHas:
		if keyIsString {
			_, exists := cache[key]
			return exists
		}
		return false
	case wsOpSet:
		if keyIsString {
			cache.Store(key, req.value)
		}
		return nil
	case wsOpReplace:
		clear(cache)
		for k, v := range MapTyped(req.value) {
			cache.Store(k, v)
		}
		return nil
	case wsOpDelete:
		cache.Delete(key)
		return nil
	case wsOpKeys:
		return cache.Keys()
	case wsOpSnapshot:
		return cache.ToMap()
	case wsOpReset:
		if this.Orderbooks == nil {
			this.Orderbooks = OrderBookCache{}
		}
		clear(this.Orderbooks)
		return nil
	}
	return nil
}

// wsTradesApply is wsCacheApply for the typed trades cache: the same operations on TradesCache,
// which holds list caches rather than boxed values.
func (this *BaseExchange) wsTradesApply(req *wsCacheOp) any {
	cache := this.Trades
	key, keyIsString := derefScalar(req.key).(string)
	switch req.op {
	case wsOpGet, wsOpGetScalar:
		if keyIsString {
			return wsCacheRead{value: cache[key], exists: true}
		}
		return wsCacheRead{}
	case wsOpHas:
		return keyIsString && cache.Has(key)
	case wsOpSet:
		if keyIsString {
			cache.Store(key, req.value)
		}
		return nil
	case wsOpReplace:
		clear(cache)
		for k, v := range MapTyped(req.value) {
			cache.Store(k, v)
		}
		return nil
	case wsOpDelete:
		cache.Delete(key)
		return nil
	case wsOpKeys:
		return cache.Keys()
	case wsOpSnapshot:
		return cache.ToMap()
	case wsOpReset:
		if this.Trades == nil {
			this.Trades = TradesCache{}
		}
		clear(this.Trades)
		return nil
	}
	return nil
}

// wsApplyOrderBookSnapshot applies a REST snapshot to the cached book on the owner:
// reading the book's cache, resetting it and feeding it deltas happen where handlers run.
func (this *BaseExchange) wsApplyOrderBookSnapshot(req *wsCacheOp) any {
	// loadOrderBook applies a REST snapshot to the cached book: reading the book's cache,
	// resetting it and feeding it deltas must happen on the owner like every handler does
	book, bookIsMap := req.value.(map[string]any)
	orderBook := req.book
	if !bookIsMap || orderBook == nil {
		return false
	}
	deltas, deltasAreList := (*orderBook.GetCache()).([]any)
	if !deltasAreList {
		return false
	}
	index := ToFloat64(this.DerivedExchange.GetCacheIndex(book, deltas))
	if index < 0 {
		return false
	}
	orderBook.Reset(book)
	this.DerivedExchange.HandleBookDeltas(orderBook, deltas[int(index):])
	orderBook.SetCache(map[string]any{})
	return true
}

// ---- ws client registry: owned by the same dispatch goroutine ----
// The registry field is read and written by this loop alone. Generated Go reads it from a user
// goroutine, so those reads are rewritten (build/hx10w6-OG03.ts) to WsClientsSnapshot, which asks
// the owner for a copy: no caller ever touches the field, so its publication needs no lock.

// wsClientsPublished is the registry as the owner holds it; only this goroutine reads it.
func (this *BaseExchange) wsClientsPublished() map[string]any {
	if this.Clients == nil {
		return map[string]any{}
	}
	return this.Clients
}

// wsClientsCopy is the next registry: a copy of the owner's one, safe to edit and swap in.
func (this *BaseExchange) wsClientsCopy() map[string]any {
	next := make(map[string]any, len(this.Clients)+1)
	for url, client := range this.Clients {
		next[url] = client
	}
	return next
}

// wsClientsApply is the registry's only write path and runs on the dispatch goroutine.
func (this *BaseExchange) wsClientsApply(req *wsCacheOp) any {
	url, keyIsString := req.key.(string)
	registry := this.wsClientsPublished()
	switch req.op {
	case wsOpClientGetOrCreate:
		if !keyIsString {
			return nil
		}
		if existing, ok := registry[url]; ok {
			return existing
		}
		created := req.create()
		if created == nil {
			return nil
		}
		next := this.wsClientsCopy()
		next[url] = created
		this.Clients = next
		return created
	case wsOpClientDelete:
		if _, ok := registry[url]; keyIsString && ok {
			next := this.wsClientsCopy()
			delete(next, url)
			this.Clients = next
		}
		return nil
	case wsOpClientDeleteIfErrored:
		// the owner answers with the entry's own error, exactly as the locked read did
		if existing, ok := registry[url]; keyIsString && ok && existing.(ClientInterface).GetError() != nil {
			next := this.wsClientsCopy()
			delete(next, url)
			this.Clients = next
		}
		return nil
	case wsOpClientDeleteIfSame:
		if existing, ok := registry[url]; keyIsString && ok && existing == req.value {
			next := this.wsClientsCopy()
			delete(next, url)
			this.Clients = next
		}
		return nil
	case wsOpClientDrain:
		clients := make([]*WSClient, 0, len(registry))
		for _, client := range registry {
			clients = append(clients, client.(*WSClient))
		}
		this.Clients = map[string]any{}
		return clients
	case wsOpClientList:
		// a copy taken on the owner: the caller walks it on its own goroutine, so the registry
		// map itself never leaves this loop
		out := make(map[string]any, len(registry))
		for key, client := range registry {
			out[key] = client
		}
		return out
	}
	return nil
}

// wsClientsDo hands one registry operation to the dispatch goroutine and waits for the answer. Only
// user-path code and the ws client's own loops call it: a handler runs on that goroutine and never
// touches the registry, so no caller waits on itself.
func (this *BaseExchange) wsClientsDo(req *wsCacheOp) any {
	store := this.wsCacheStoreNow()
	req.reply = make(chan any, 1)
	select {
	case store.ops <- req:
		return <-req.reply
	case <-store.done:
		// the loop is gone, so the caller is the only writer
		return this.wsClientsApply(req)
	}
}

// wsClientGetOrCreate answers the client registered for url, letting the owner build it when absent.
func (this *BaseExchange) wsClientGetOrCreate(url string, create func() any) any {
	return this.wsClientsDo(&wsCacheOp{op: wsOpClientGetOrCreate, key: url, create: create})
}

func (this *BaseExchange) wsClientDelete(url string) {
	this.wsClientsDo(&wsCacheOp{op: wsOpClientDelete, key: url})
}

func (this *BaseExchange) wsClientDeleteIfErrored(url string) {
	this.wsClientsDo(&wsCacheOp{op: wsOpClientDeleteIfErrored, key: url})
}

func (this *BaseExchange) wsClientDeleteIfSame(url string, client any) {
	this.wsClientsDo(&wsCacheOp{op: wsOpClientDeleteIfSame, key: url, value: client})
}

// wsClientDrain clears the registry on its owner and returns the clients it held.
func (this *BaseExchange) wsClientDrain() []*WSClient {
	clients, _ := this.wsClientsDo(&wsCacheOp{op: wsOpClientDrain}).([]*WSClient)
	if clients == nil {
		return []*WSClient{}
	}
	return clients
}

// WsClientsSnapshot copies the ws client registry on the dispatch goroutine. Generated Go walks the
// whole registry from a user goroutine (cleanCache over Object.values(this.clients)), so it reads
// this copy instead of the field the owner keeps editing.
func (this *BaseExchange) WsClientsSnapshot() map[string]any {
	snapshot, _ := this.wsClientsDo(&wsCacheOp{op: wsOpClientList}).(map[string]any)
	if snapshot == nil {
		return map[string]any{}
	}
	return snapshot
}

// WsClientRemove drops the entry for url on the owner: generated venue overrides unregister a client
// with Remove(this.clients, url), and a delete has to run where the registry lives.
func (this *BaseExchange) WsClientRemove(url any) {
	if key, ok := derefScalar(url).(string); ok {
		this.wsClientDelete(key)
	}
}

// wsCacheDo hands one operation to the dispatch goroutine and waits for its answer. Only
// user-path code may call this: a handler already runs on the dispatch goroutine and would wait
// on itself, so handlers keep indexing the maps directly.
func (this *BaseExchange) wsCacheDo(op int, field string, key any, value any) any {
	return this.wsCacheSend(&wsCacheOp{op: op, field: field, key: key, value: value, reply: make(chan any, 1)})
}

func (this *BaseExchange) wsCacheSend(req *wsCacheOp) any {
	store := this.wsCacheStoreNow()
	select {
	case store.ops <- req:
		return <-req.reply
	case <-store.done:
		// the loop is gone, so the caller runs the operation itself
		return this.wsCacheApply(req)
	}
}

func (this *BaseExchange) WsCacheGet(field string, key any) any {
	read, _ := this.wsCacheDo(wsOpGet, field, key, nil).(wsCacheRead)
	return read.value
}

// WsCacheGetOk is WsCacheGet with the map's comma-ok: loadOrderBook must tell an absent book from
// a stored one, exactly as `stored, exists := this.Orderbooks[key]` did.
func (this *BaseExchange) WsCacheGetOk(field string, key any) (any, bool) {
	read, _ := this.wsCacheDo(wsOpGet, field, key, nil).(wsCacheRead)
	return read.value, read.exists
}

func (this *BaseExchange) WsCacheHas(field string, key any) bool {
	exists, _ := this.wsCacheDo(wsOpHas, field, key, nil).(bool)
	return exists
}

func (this *BaseExchange) WsCacheSet(field string, key any, value any) {
	this.wsCacheDo(wsOpSet, field, key, value)
}

// WsCacheDelete removes one entry on the owner (the ticker caches unsubscribe by symbol).
func (this *BaseExchange) WsCacheDelete(field string, key any) {
	this.wsCacheDo(wsOpDelete, field, key, nil)
}

// WsCacheKeys lists the symbols of a cache, taken on the owner.
func (this *BaseExchange) WsCacheKeys(field string) []string {
	keys, _ := this.wsCacheDo(wsOpKeys, field, nil, nil).([]string)
	if keys == nil {
		return []string{}
	}
	return keys
}

// WsCacheObjGet reads a cache-object field on the owner: user-path code gets the object, whose
// own mutex guards its rows, but never touches the field itself.
func (this *BaseExchange) WsCacheObjGet(field string) any {
	return this.wsCacheDo(wsOpObjGet, field, nil, nil)
}

// WsCacheObjSet replaces a cache-object field on the owner.
func (this *BaseExchange) WsCacheObjSet(field string, value any) {
	this.wsCacheDo(wsOpObjSet, field, nil, value)
}

// WsCacheSnapshot copies the cache on the dispatch goroutine, for callers that walk the whole map
// (FilterByArray, ...) instead of reading one key.
func (this *BaseExchange) WsCacheSnapshot(field string) map[string]any {
	snapshot, _ := this.wsCacheDo(wsOpSnapshot, field, nil, nil).(map[string]any)
	return snapshot
}

func (this *BaseExchange) WsCacheReset(field string) {
	this.wsCacheDo(wsOpReset, field, nil, nil)
}

// WsCacheSetScalar is WsCacheSet with the helper's own derefScalar on the value, so a boxed pointer
// stores the way AddElementToObject stored it.
func (this *BaseExchange) WsCacheSetScalar(field string, key any, value any) {
	this.wsCacheDo(wsOpSet, field, key, derefScalar(value))
}

// WsCacheGetScalar is WsCacheGet with the helper's derefScalar on the answer: GetValue and SafeValue
// unbox a stored pointer, so the plain read would not match them.
func (this *BaseExchange) WsCacheGetScalar(field string, key any) any {
	read, _ := this.wsCacheDo(wsOpGetScalar, field, key, nil).(wsCacheRead)
	return read.value
}

// WsCacheReplace moves the entries of a freshly built map into the cache on the owner, which is what
// a whole-map assignment (this.Balance = this.Extend(...)) means for a map nobody else may write.
func (this *BaseExchange) WsCacheReplace(field string, value any) {
	this.wsCacheDo(wsOpReplace, field, nil, value)
}

// WsCacheApplyOrderBookSnapshot applies a fetched snapshot to the cached book on the owner and
// reports whether the book was behind the cache.
func (this *BaseExchange) WsCacheApplyOrderBookSnapshot(stored any, orderBook any) bool {
	book := OrderBookTyped(stored)
	if book == nil {
		return false
	}
	applied, _ := this.wsCacheSend(&wsCacheOp{op: wsOpApplySnapshot, field: "Orderbooks", book: book, value: orderBook, reply: make(chan any, 1)}).(bool)
	return applied
}

// WsBalanceReplace moves value's entries into the balance map in place: handler code and anything a
// handler already resolved keep one map. A value that is not a dictionary empties it, like the
// assignment of a fresh map did. Runs on the dispatch goroutine, the field's only writer.
func (this *BaseExchange) WsBalanceReplace(value any) {
	source, _ := derefScalar(value).(map[string]any)
	current := this.wsBalanceMap()
	// drop only keys value lacks, so a value that is this same map (safeBalance merges in place) survives
	for key := range current {
		if _, kept := source[key]; !kept {
			delete(current, key)
		}
	}
	for key, entry := range source {
		current[key] = entry
	}
}

// WsBalanceEntry answers the account entry a handler reads through: the entry's own map, or nil for an
// absent entry, which is what the read helper answered. Runs on the dispatch goroutine.
func (this *BaseExchange) WsBalanceEntry(key any) map[string]any {
	name, ok := derefScalar(key).(string)
	if !ok {
		return nil
	}
	entry, _ := this.Balance[name].(map[string]any)
	return entry
}

// WsBalanceEntryForWrite answers the account entry a handler writes into, creating the map an absent
// entry needs: indexing created it under TS too. Runs on the dispatch goroutine, the field's only writer.
func (this *BaseExchange) WsBalanceEntryForWrite(key any) map[string]any {
	name, ok := derefScalar(key).(string)
	if !ok {
		return nil
	}
	balance := this.wsBalanceMap()
	if entry, isMap := balance[name].(map[string]any); isMap {
		return entry
	}
	entry := map[string]any{}
	balance[name] = entry
	return entry
}

// WsCacheTickerMap is the typed read of a ticker cache: the owner's snapshot as map[string]Ticker,
// narrowed to the symbols in the optional first argument the way FilterByArray(.., "symbol", symbols) did.
func (this *BaseExchange) WsCacheTickerMap(field string, optionalArgs ...any) map[string]Ticker {
	snapshot := this.WsCacheSnapshot(field)
	if len(optionalArgs) == 0 {
		return TickerMapFromMap(snapshot)
	}
	return TickerMapFromMap(this.FilterByArray(snapshot, "symbol", optionalArgs[0]))
}
