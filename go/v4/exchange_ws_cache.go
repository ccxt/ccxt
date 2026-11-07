package ccxt

// Ws frame routing and the ws client registry: handlers run on the reading goroutine and touch
// the plain cache maps on BaseExchange directly; the registry is the plain map this.Clients.

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

func (this *BaseExchange) wsClients() map[string]any {
	if this.Clients == nil {
		this.Clients = map[string]any{}
	}
	return this.Clients
}

// wsClientGetOrCreate answers the client registered for url, building it when absent.
func (this *BaseExchange) wsClientGetOrCreate(url string, create func() any) any {
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
	delete(this.Clients, url)
}

func (this *BaseExchange) wsClientDeleteIfErrored(url string) {
	if existing, ok := this.Clients[url]; ok && existing.(ClientInterface).GetError() != nil {
		delete(this.Clients, url)
	}
}

func (this *BaseExchange) wsClientDeleteIfSame(url string, client any) {
	if existing, ok := this.Clients[url]; ok && existing == client {
		delete(this.Clients, url)
	}
}

// wsClientDrain empties the registry and returns the clients it held.
func (this *BaseExchange) wsClientDrain() []*WSClient {
	clients := make([]*WSClient, 0, len(this.Clients))
	for _, client := range this.Clients {
		clients = append(clients, client.(*WSClient))
	}
	this.Clients = map[string]any{}
	return clients
}
