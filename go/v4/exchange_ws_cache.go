package ccxt

// Ws frame routing and the ws client registry: handlers run on the reading goroutine and touch
// the plain cache maps on BaseExchange directly. The registry itself (this.Clients) is shared by
// every subscription goroutine and is only reached through clientsMu-guarded helpers.

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

// WsDispatch is the ws client's onMessage callback: it runs the venue handler for the frame.
func (this *BaseExchange) WsDispatch(client any, message any) {
	if this.wsHandler == nil {
		this.wsHandler = this.wsFrameHandler()
	}
	this.wsHandler(client, message)
}

// ApplyOrderBookSnapshot applies a fetched snapshot to the cached book and reports whether the
// book was behind the cache.
func (this *BaseExchange) ApplyOrderBookSnapshot(stored any, snapshot any) bool {
	book, bookIsMap := snapshot.(map[string]any)
	orderBook, _ := stored.(OrderBookInterface)
	if !bookIsMap || orderBook == nil {
		return false
	}
	deltas := orderBook.GetCache()
	if deltas == nil {
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

// wsClients returns the registry; callers must hold clientsMu.
func (this *BaseExchange) wsClients() map[string]any {
	if this.Clients == nil {
		this.Clients = map[string]any{}
	}
	return this.Clients
}

// wsClientGetOrCreate answers the client registered for url, building it when absent.
func (this *BaseExchange) wsClientGetOrCreate(url string, create func() any) any {
	this.clientsMu.Lock()
	defer this.clientsMu.Unlock()
	clients := this.wsClients()
	if existing, ok := clients[url]; ok {
		return existing
	}
	created := create()
	if created == nil {
		return nil
	}
	clients[url] = created
	return created
}

func (this *BaseExchange) wsClientDelete(url string) {
	this.clientsMu.Lock()
	defer this.clientsMu.Unlock()
	delete(this.Clients, url)
}

func (this *BaseExchange) wsClientDeleteIfErrored(url string) {
	this.clientsMu.Lock()
	defer this.clientsMu.Unlock()
	if existing, ok := this.Clients[url]; ok {
		if client, isClient := existing.(ClientInterface); isClient && client.GetError() != nil {
			delete(this.Clients, url)
		}
	}
}

func (this *BaseExchange) wsClientDeleteIfSame(url string, client any) {
	this.clientsMu.Lock()
	defer this.clientsMu.Unlock()
	if existing, ok := this.Clients[url]; ok && existing == client {
		delete(this.Clients, url)
	}
}

// wsClientDrain empties the registry and returns the clients it held.
func (this *BaseExchange) wsClientDrain() []*WSClient {
	this.clientsMu.Lock()
	defer this.clientsMu.Unlock()
	clients := make([]*WSClient, 0, len(this.Clients))
	for _, client := range this.Clients {
		clients = append(clients, client.(*WSClient))
	}
	this.Clients = map[string]any{}
	return clients
}

// wsClientKey normalizes a url argument to the registry key. Generated venue code hands the WsClient*
// helpers either a plain string or a pointer-carried string (a SafeString/SafeStringPtr result); the
// registry map is keyed by the string itself, so dereference once here instead of at every call site.
func wsClientKey(url any) (string, bool) {
	url = derefScalar(url)
	key, ok := url.(string)
	return key, ok
}

// WsClientSnapshot returns the registered ws clients, copied under the read lock. Generated
// Object.values(this.clients) iterates this snapshot, so a client created or dropped by another
// subscription goroutine cannot mutate the map mid-iteration.
func (this *BaseExchange) WsClientSnapshot() []any {
	this.clientsMu.RLock()
	defer this.clientsMu.RUnlock()
	clients := make([]any, 0, len(this.Clients))
	for _, client := range this.Clients {
		clients = append(clients, client)
	}
	return clients
}

// WsClientLookup answers the client registered for url, nil when none is. It is the read path
// generated from this.safeValue(this.clients, url).
func (this *BaseExchange) WsClientLookup(url any) any {
	key, ok := wsClientKey(url)
	if !ok {
		return nil
	}
	this.clientsMu.RLock()
	defer this.clientsMu.RUnlock()
	return this.Clients[key]
}

// WsClientGet answers the client registered for url and whether one exists. It is the read path
// generated from `this.clients[url]` lookups, including comma-ok bindings.
func (this *BaseExchange) WsClientGet(url any) (any, bool) {
	key, ok := wsClientKey(url)
	if !ok {
		return nil, false
	}
	this.clientsMu.RLock()
	defer this.clientsMu.RUnlock()
	client, found := this.Clients[key]
	return client, found
}

// WsClientHas reports whether a client is registered for url. It replaces the generated
// `url in this.clients` membership check.
func (this *BaseExchange) WsClientHas(url any) bool {
	_, found := this.WsClientGet(url)
	return found
}

// WsClientIs reports whether the client registered for url is the given one. It replaces the
// generated `this.clients[url] === client` identity check made before dropping a dead connection.
func (this *BaseExchange) WsClientIs(url any, client any) bool {
	key, ok := wsClientKey(url)
	if !ok {
		return false
	}
	this.clientsMu.RLock()
	defer this.clientsMu.RUnlock()
	existing, found := this.Clients[key]
	return found && existing == client
}

// WsClientDelete drops the client registered for url. It replaces the generated
// `delete(this.clients, url)` so the removal takes the write lock.
func (this *BaseExchange) WsClientDelete(url any) {
	key, ok := wsClientKey(url)
	if !ok {
		return
	}
	this.clientsMu.Lock()
	defer this.clientsMu.Unlock()
	delete(this.Clients, key)
}
