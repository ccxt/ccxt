package ccxt

// WebSocket transport for streaming (pro) exchanges.
// supports
// 	- concurrent subscriptions,
// 	- automatic JSON encoding/decoding
// 	- graceful shutdown.
// Higher-level exchange code decides which messages belong to which subscription;
// the client only multiplexes frames to a per-channel inbox.
//

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

type ClientInterface interface {
	Resolve(data any, subHash any) any
	Future(messageHash any) <-chan AsyncResult[any]
	ReusableFuture(messageHash any) *Future
	Reject(err any, messageHash ...any)
	SendAsync(message any) <-chan AsyncResult[bool]
	Reset(err any)
	OnPong()
	GetError() error
	SetError(err error)
	GetUrl() string
	SubscriptionHas(key any) bool
	SubscriptionGet(key any) any
	SubscriptionDict(key any) map[string]any
	SubscriptionSet(key any, value any)
	SubscriptionDel(key any)
	SubscriptionLoadOrStore(key any, value any) (any, bool)
	SubscriptionKeys() []string
	SubscriptionValues() []any
	SubscriptionsSnapshot() map[string]any
	SubscriptionSafe(key any) any
	GetRejections() map[string]any
	GetLastPong() any
	SetLastPong(lastPong any)
	GetKeepAlive() any
	SetKeepAlive(keepAlive any)
	GetFutures() map[string]*Future
	FutureHas(key any) bool
	FutureGet(key any) any
	FutureKeys() []string
}

// Client is a thin wrapper around a single ws:// or wss:// connection.
// Subscriptions are identified by an arbitrary hash string
// Each Subscribe call returns a receive-only channel that the caller reads updates from.
type Client struct {
	Url string

	// Futures is the published snapshot of the pending futures: the store owner builds
	// a whole map and swaps it in, so a reader never sees a map being mutated
	Futures map[string]*Future

	// every piece of shared client state below is owned by exactly one goroutine and
	// reached only through its request channel: futures/rejections/pong by the store,
	// the transport handle by the conn owner, the once-only dial by the dial owner.
	// NewClient creates all four owners before it returns the client.
	store *clientStore

	connState *connOwner

	dials *dialOwner

	subscriptions *subscriptionMap // map[string]any, owned by its own goroutine

	ReadLoopClosed chan struct{}

	Error error // last error, nil if connection considered healthy

	Connected             any  // *Future             		// signal channel for connection established
	Disconnected          any  // *Future             	// future for disconnection
	KeepAlive             any  // number in milliseconds or seconds
	ConnectionTimeout     any  // e.g. *time.Timer or context.CancelFunc
	Verbose               bool // default false
	DecompressBinary      bool
	IsMock                bool                          // static ws tests: transport is stubbed, sends are recorded
	MockSentMessages      []any                         // frames recorded in mock mode
	ConnectionTimer       any                           // e.g. *time.Timer or custom timer
	MaxPingPongMisses     any                           // int or counter type
	PingInterval          any                           // time.Duration recommended
	ConnectionEstablished any                           // signal or state variable
	Gunzip                any                           // gzip decompressor (e.g. io.Reader)
	Inflate               any                           // zlib inflater or similar
	URL                   string                        // URL string
	IsConnected           any                           // bool or state variable
	OnConnectedCallback   func(client any, message any) // callback function signature - adjust as needed
	OnMessageCallback     func(client any, message any) // example callback with message
	OnErrorCallback       func(client any, err any)     // error callback
	OnCloseCallback       func(client any, err any)     // connection closed callback
	Ping                  any                           // e.g. timer or pong/ping state
	Throttle              any                           // throttling mechanism (rate limiter, etc.)
	// Owner any 											// pointer to the exchange that created the client
}

func (this *Client) Resolve(data any, subHash any) any {
	// message hashes are built in generated WS code from Safe* values, so they
	// arrive pointer-carried; normalize before asserting
	hash, ok := derefScalar(subHash).(string)
	if !ok {
		panic(fmt.Sprintf("subHash must be a string, got %T: %v", subHash, subHash))
	}

	// the store takes the future out before it is resolved here, so a second
	// message for the same hash finds no consumer and cannot deliver twice
	if reply := this.storeCall(storeTake, hash, nil); reply.ok {
		reply.value.(*Future).Resolve(data)
	}
	return data
}

func (this *Client) Future(messageHash any) <-chan AsyncResult[any] {
	future := this.NewFuture(messageHash)
	return future.Await()
}

func (this *Client) ReusableFuture(messageHash any) *Future {
	future := this.NewFuture(messageHash)
	return future
}

func (this *Client) NewFuture(messageHash any) *Future {
	hash, _ := derefScalar(messageHash).(string)
	// a retained rejection fails this consumer fast and is drained once inside the
	// owner, so the spent future never reaches the map
	return this.storeCall(storeNewFuture, hash, nil).value.(*Future)
}

// Reject rejects specific future or all
func (this *Client) Reject(err any, messageHash ...any) {
	if len(messageHash) == 0 {
		for _, future := range this.storeCall(storeTakeAll, "", nil).value.([]any) {
			rejectFuture(future, err)
		}
		return
	}
	hash := derefScalar(messageHash[0]).(string)
	if reply := this.storeCall(storeTake, hash, nil); reply.ok {
		rejectFuture(reply.value, err)
		return
	}
	// ts parity: an error arriving while no consumer future exists is retained
	// so the next NewFuture fails fast instead of the error being dropped
	this.storeCall(storeRetain, hash, err)
}

// rejectFuture rejects a taken future, unwrapping the reason like the map path did.
func rejectFuture(future any, err any) {
	if failure, ok := err.(error); ok {
		future.(*Future).Reject(failure)
		return
	}
	future.(*Future).Reject(err)
}

// Close terminates the underlying websocket connection (if any)
func (this *Client) Close() error {
	closed, err := this.closeConnection()
	if !closed {
		return nil
	}
	this.IsConnected = false

	// Signal disconnection
	this.Disconnected.(*Future).Resolve(true)

	return err
}

// NewClient creates a new WebSocket client with the given URL and callbacks
// Matches the TypeScript constructor exactly with all the same properties
func NewClient(url string, onMessageCallback func(client any, err any), onErrorCallback func(client any, err any), onCloseCallback func(client any, err any), onConnectedCallback func(client any, err any), config ...map[string]any) *Client {
	// Set up defaults exactly like TypeScript constructor
	defaults := map[string]any{
		"Url":                   url,
		"OnMessageCallback":     onMessageCallback,
		"OnErrorCallback":       onErrorCallback,
		"OnCloseCallback":       onCloseCallback,
		"OnConnectedCallback":   onConnectedCallback,
		"Verbose":               false,
		"Protocols":             nil,
		"Options":               nil,
		"Futures":               make(map[string]*Future),
		"Rejections":            make(map[string]any),
		"Connected":             nil,
		"Error":                 nil,
		"ConnectionStarted":     nil,
		"ConnectionEstablished": nil,
		"IsConnected":           false,
		"ConnectionTimer":       nil,
		"ConnectionTimeout":     10000,
		"PingInterval":          nil,
		"Ping":                  nil,
		"keepAlive":             30000,
		"MaxPingPongMisses":     2.0,
		"Connection":            nil,
		"StartedConnecting":     false,
		"gunzip":                false,
		"inflate":               false,
		"DecompressBinary":      true,
	}

	// Apply config overrides if provided
	finalConfig := defaults
	if len(config) > 0 {
		for key, value := range config[0] {
			if value != nil {
				finalConfig[key] = value
			}
		}
	}

	// Create the client with all properties from TypeScript constructor
	c := &Client{
		Url:                   url,
		Futures:               finalConfig["Futures"].(map[string]*Future),
		subscriptions:         newSubscriptionMap(),
		Verbose:               derefScalar(finalConfig["Verbose"]).(bool),
		KeepAlive:             ParseInt(finalConfig["keepAlive"]),
		MaxPingPongMisses:     finalConfig["MaxPingPongMisses"],
		IsConnected:           finalConfig["IsConnected"],
		OnConnectedCallback:   onConnectedCallback,
		OnMessageCallback:     onMessageCallback,
		OnErrorCallback:       onErrorCallback,
		OnCloseCallback:       onCloseCallback,
		ConnectionTimeout:     finalConfig["ConnectionTimeout"],
		ConnectionTimer:       finalConfig["ConnectionTimer"],
		PingInterval:          finalConfig["PingInterval"],
		Ping:                  finalConfig["Ping"],
		ConnectionEstablished: finalConfig["ConnectionEstablished"],
		Gunzip:                finalConfig["gunzip"],
		Inflate:               finalConfig["inflate"],
		Throttle:              finalConfig["Throttle"],
		ReadLoopClosed:        make(chan struct{}),
		Connected:             NewFuture(),
		Disconnected:          NewFuture(),
		DecompressBinary:      derefScalar(finalConfig["DecompressBinary"]).(bool),
	}
	c.store = newClientStore(c)
	c.connState = newConnOwner()
	c.dials = newDialOwner()
	return c
}

func (this *Client) OnPong() {
	this.SetLastPong(time.Now().UnixMilli())
	if this.Verbose {
		log.Println(time.Now(), "onPong")
	}
}

func (this *Client) Reset(err any) {
	// Stop any active timers/intervals
	if t, ok := this.ConnectionTimer.(*time.Timer); ok {
		t.Stop()
	}
	if tk, ok := this.PingInterval.(*time.Ticker); ok {
		tk.Stop()
	}
	// Clear error and close connection
	_ = this.Close()
	// Reject all pending futures with provided error (or generic)
	if err == nil {
		err = "connection reset"
	}
	this.Reject(err)
}

func (this *Client) Log(args ...any) {
	fmt.Println(args...)
	// fmt.Printf("%+v\n", args) // equivalent to console.dir with depth
}

func (this *Client) OnConnectionTimeout() {
	if !derefScalar(this.IsConnected).(bool) {
		err := RequestTimeout("Connection to " + this.Url + " failed due to a connection timeout")
		this.OnError(err)
		// the conn owner drops the handle; a client without one is a no-op
		this.closeConnection()
		// ? this.Connection.Close(1006)
	}
}

func (this *Client) SetConnectionTimeout() {
	if this.ConnectionTimeout != nil && this.ConnectionTimeout != false {
		if timeout, ok := this.ConnectionTimeout.(int); ok {
			this.ConnectionTimer = time.AfterFunc(time.Duration(timeout)*time.Millisecond, this.OnConnectionTimeout)
		}
	}
}

func (this *Client) ClearConnectionTimeout() {
	if this.ConnectionTimer != nil && this.ConnectionTimer != false {
		if timer, ok := this.ConnectionTimer.(*time.Timer); ok {
			timer.Stop()
		}
		this.ConnectionTimer = nil
	}
}

func (this *Client) OnError(err any) {
	if this.Verbose {
		this.Log(time.Now(), "onError", err)
	}
	// Convert error to appropriate type if needed
	if errStr, ok := err.(string); ok {
		err = NetworkError(errStr)
	}
	this.Error = err.(error)
	this.Reset(this.Error)
	if this.OnErrorCallback != nil {
		this.OnErrorCallback(this, this.Error)
	}
}

func (this *Client) OnClose(event any) {
	if this.Verbose {
		this.Log(time.Now(), "onClose", event)
	}
	if this.Error == nil {
		// todo: exception types for server-side disconnects
		// this.Reset(NetworkError("connection closed by remote server, closing code " + event.code)) // TODO: what type is event?
		eventStr := fmt.Sprintf("%v", event)
		this.Reset(NetworkError("connection closed by remote server, closing code " + eventStr))
	}
	// if err, ok := this.Error.(ExchangeClosedByUser); ok {  // TODO: how to do this
	// 	this.Reset(err)
	// }
	if this.Disconnected != nil {
		this.Disconnected.(*Future).Resolve(true)
	}
	this.OnCloseCallback(this, event) // TODO: What to do with event? parameter is error
}

func (this *Client) SendAsync(message any) <-chan AsyncResult[bool] {
	var msgStr string
	if str, ok := message.(string); ok {
		msgStr = str
	} else {
		msgBytes, _ := json.Marshal(message)
		msgStr = string(msgBytes)
	}

	if this.Verbose {
		this.Log(time.Now(), "sending", msgStr)
	}

	future := NewFuture()
	ch := make(chan AsyncResult[bool])
	go func() {
		// ? if (isNode)
		if this.IsMock {
			// static ws tests: record the outgoing frame so the test can assert it
			var parsed any
			if err := json.Unmarshal([]byte(msgStr), &parsed); err == nil {
				this.MockSentMessages = append(this.MockSentMessages, parsed)
			}
			future.Resolve(true)
			ch <- AsyncResult[bool]{Value: true}
			return
		}
		// the write goes through the conn owner, which reports "no handle" itself so
		// the check and the write cannot straddle a close
		sent, err := this.writeText(msgStr)
		if !sent && err == nil {
			err = NetworkError("not connected to " + this.Url)
		}
		if err != nil {
			future.Reject(err)
			// the caller receives on ch (see Exchange.watch); without sending here
			// it would block forever when the connection is not established
			ch <- AsyncResult[bool]{Err: err}
			return
		}
		future.Resolve(true)
		ch <- AsyncResult[bool]{Value: true}
	}()

	return ch
}

func gunzipData(data []byte) ([]byte, error) {
	r, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	defer r.Close()

	var out bytes.Buffer
	if _, err := io.Copy(&out, r); err != nil {
		return nil, err
	}
	return out.Bytes(), nil
}

func IsJSON(b []byte) bool {
	var js any
	return json.Unmarshal(b, &js) == nil
}

func (this *Client) OnMessage(messageEvent any) {
	// if we use onmessage we get MessageEvent objects
	// MessageEvent {isTrusted: true, data: "{"e":"depthUpdate","E":1581358737706,"s":"ETHBTC",…"0.06200000"]],"a":[["0.02261300","0.00000000"]]}", origin: "wss://stream.binance.com:9443", lastEventId: "", source: null, …}

	var message any
	if eventMap, ok := messageEvent.(map[string]any); ok {
		if data, exists := eventMap["data"]; exists {
			message = data
		}
	} else {
		message = messageEvent
	}

	var messageStr string
	var messageIsBinary = false
	var messageBytes []byte
	if str, ok := message.(string); ok {
		messageStr = str
	} else if bytes, ok := message.([]byte); ok {
		// Handle binary data
		if this.Gunzip != nil && derefScalar(this.Gunzip).(bool) {
			// Would need to implement gzip decompression
			gunzipOut, _ := gunzipData(bytes)
			messageStr = string(gunzipOut)
		} else if this.Inflate != nil && derefScalar(this.Inflate).(bool) {
			// Would need to implement zlib inflation
			messageStr = string(bytes)
		} else {
			// some exchanges send a regular json message as a binary frame, so json
			// is still read as text. text frames arrive here as strings, a utf-8 check
			// would turn the binary payloads that happen to be valid utf-8 into text
			if this.DecompressBinary || IsJSON(bytes) {
				messageStr = string(bytes)
			} else {
				messageIsBinary = true
				messageBytes = bytes
			}
		}
	} else {
		messageStr = fmt.Sprintf("%v", message)
	}

	// Try to parse as JSON
	var parsedMessage any
	if this.IsJsonEncodedObject(messageStr) {
		// Replace large numbers with strings to prevent precision loss
		re := regexp.MustCompile(`:(\d{15,}),`)
		messageStr = re.ReplaceAllString(messageStr, `:"$1",`)

		parsedMessage = ParseJSON(messageStr)
		if parsedMessage == nil {
			if this.Verbose {
				this.Log(time.Now(), "onMessage JSON.parse", "failed to parse message")
			}
		}
	}

	if this.Verbose {
		if messageIsBinary && !this.DecompressBinary {
			this.Log(time.Now(), "onMessage [binary]", messageBytes)
		} else if parsedMessage != nil {
			this.Log(time.Now(), "onMessage", parsedMessage)
		} else {
			this.Log(time.Now(), "onMessage", messageStr)
		}
		// unlimited depth
		// this.Log(time.Now(), "onMessage", util.inspect(message, false, null, true))
		// this.Log(time.Now(), "onMessage", JSON.stringify(message, null, 4))
	}
	if messageIsBinary && !this.DecompressBinary {
		this.OnMessageCallback(this, messageBytes)
	} else if parsedMessage != nil {
		this.OnMessageCallback(this, parsedMessage)
	} else {
		this.OnMessageCallback(this, messageStr)

	}
}

func (this *Client) IsJsonEncodedObject(str string) bool {
	str = strings.TrimSpace(str)
	return (strings.HasPrefix(str, "{") && strings.HasSuffix(str, "}")) ||
		(strings.HasPrefix(str, "[") && strings.HasSuffix(str, "]"))
}

func (this *Client) GetError() error {
	return this.Error
}

func (this *Client) SetError(err error) {
	this.Error = err
}

func (this *Client) GetUrl() string {
	return this.Url
}

// subscriptionMap is the client's subscription table: a plain map[string]any that only the
// goroutine below ever touches, so concurrent subscribe/handler/enqueue paths hand off a
// request instead of sharing the map.
type subscriptionMap struct {
	req chan subsOp
}

type subsKind int

const (
	subsHas subsKind = iota
	subsGet
	subsSet
	subsDel
	subsLoadOrStore
	subsKeys
	subsValues
	subsSnapshot
)

type subsOp struct {
	kind  subsKind
	key   string
	value any
	reply chan subsReply
}

type subsReply struct {
	value any
	ok    bool
}

func newSubscriptionMap() *subscriptionMap {
	subs := &subscriptionMap{req: make(chan subsOp)}
	go subs.own()
	return subs
}

// own is the only function that reads or writes the table; it never calls back out.
func (this *subscriptionMap) own() {
	data := map[string]any{}
	for op := range this.req {
		switch op.kind {
		case subsHas:
			_, ok := data[op.key]
			op.reply <- subsReply{ok: ok}
		case subsGet:
			op.reply <- subsReply{value: derefScalar(data[op.key])}
		case subsSet:
			data[op.key] = op.value
			op.reply <- subsReply{}
		case subsDel:
			delete(data, op.key)
			op.reply <- subsReply{}
		case subsLoadOrStore:
			if existing, ok := data[op.key]; ok {
				op.reply <- subsReply{value: existing, ok: true}
			} else {
				data[op.key] = op.value
				op.reply <- subsReply{value: op.value}
			}
		case subsKeys:
			keys := make([]string, 0, len(data))
			for key := range data {
				keys = append(keys, key)
			}
			op.reply <- subsReply{value: keys}
		case subsValues:
			values := make([]any, 0, len(data))
			for _, value := range data {
				values = append(values, value)
			}
			op.reply <- subsReply{value: values}
		case subsSnapshot:
			snapshot := make(map[string]any, len(data))
			for key, value := range data {
				snapshot[key] = value
			}
			op.reply <- subsReply{value: snapshot}
		}
	}
}

func (this *subscriptionMap) call(kind subsKind, key string, value any) subsReply {
	reply := make(chan subsReply)
	this.req <- subsOp{kind: kind, key: key, value: value, reply: reply}
	return <-reply
}

// subsTable returns the subscription owner NewClient created.
func (this *Client) subsTable() *subscriptionMap {
	return this.subscriptions
}

// subsKey normalizes a subscription key like the table helpers did: pointers are unwrapped
// and anything but a string cannot address the table.
func subsKey(key any) (string, bool) {
	keyStr, ok := derefScalar(key).(string)
	return keyStr, ok
}

// SubscriptionHas reports membership; a nil or non-string key is never a member.
func (this *Client) SubscriptionHas(key any) bool {
	keyStr, ok := subsKey(key)
	if !ok {
		return false
	}
	return this.subsTable().call(subsHas, keyStr, nil).ok
}

// SubscriptionGet reads a subscription, unwrapping a pointer-carried value like GetValue.
func (this *Client) SubscriptionGet(key any) any {
	keyStr, ok := subsKey(key)
	if !ok {
		return nil
	}
	return this.subsTable().call(subsGet, keyStr, nil).value
}

// SubscriptionDict reads a subscription that holds a dictionary, nil otherwise.
func (this *Client) SubscriptionDict(key any) map[string]any {
	if asMap, ok := this.SubscriptionGet(key).(map[string]any); ok {
		return asMap
	}
	return nil
}

// SubscriptionSet stores a subscription; a nil or non-string key stores nothing.
func (this *Client) SubscriptionSet(key any, value any) {
	keyStr, ok := subsKey(key)
	if !ok {
		return
	}
	this.subsTable().call(subsSet, keyStr, value)
}

// SubscriptionDel removes a subscription, panicking on a non-string key like Remove.
func (this *Client) SubscriptionDel(key any) {
	keyStr, ok := derefScalar(key).(string)
	if !ok {
		panic("provided key is not a string")
	}
	this.subsTable().call(subsDel, keyStr, nil)
}

// SubscriptionLoadOrStore registers a subscription, reporting whether it was already there.
func (this *Client) SubscriptionLoadOrStore(key any, value any) (any, bool) {
	keyStr, ok := derefScalar(key).(string)
	if !ok {
		panic("provided key is not a string")
	}
	reply := this.subsTable().call(subsLoadOrStore, keyStr, value)
	return reply.value, reply.ok
}

// SubscriptionKeys lists the subscription hashes.
func (this *Client) SubscriptionKeys() []string {
	keys, _ := this.subsTable().call(subsKeys, "", nil).value.([]string)
	return keys
}

// SubscriptionValues lists the stored subscriptions.
func (this *Client) SubscriptionValues() []any {
	values, _ := this.subsTable().call(subsValues, "", nil).value.([]any)
	return values
}

// SubscriptionsSnapshot copies the table for read-only iteration.
func (this *Client) SubscriptionsSnapshot() map[string]any {
	snapshot, _ := this.subsTable().call(subsSnapshot, "", nil).value.(map[string]any)
	return snapshot
}

// SubscriptionSafe reads a subscription like SafeValue: nil and the empty string are absent.
func (this *Client) SubscriptionSafe(key any) any {
	key = derefScalar(key)
	if key == nil {
		return nil
	}
	value := this.subsTable().call(subsGet, fmt.Sprintf("%v", key), nil).value
	if value == nil || value == "" {
		return nil
	}
	return value
}

// GetRejections copies the retained rejections for read-only inspection.
func (this *Client) GetRejections() map[string]any {
	rejections, _ := this.storeCall(storeRejections, "", nil).value.(map[string]any)
	return rejections
}

func (this *Client) GetLastPong() any {
	return this.storeCall(storePongGet, "", nil).value
}
func (this *Client) SetLastPong(lastPong any) {
	this.storeCall(storePongSet, "", lastPong)
}
func (this *Client) SetKeepAlive(keepAlive any) {
	this.KeepAlive = keepAlive
}
func (this *Client) GetKeepAlive() any {
	return this.KeepAlive
}

// GetFutures is the published snapshot of the pending futures; the map is never
// mutated after publication, so generated ws code can read it without a lock.
func (this *Client) GetFutures() map[string]*Future {
	this.storeTable()
	return this.Futures
}

// FutureHas reports whether a future is pending for the hash; a nil or non-string key is never pending.
func (this *Client) FutureHas(key any) bool {
	keyStr, ok := subsKey(key)
	if !ok {
		return false
	}
	_, found := this.GetFutures()[keyStr]
	return found
}

// FutureGet is the pending future for the hash, an untyped nil when none (never a typed-nil *Future).
func (this *Client) FutureGet(key any) any {
	keyStr, ok := subsKey(key)
	if !ok {
		return nil
	}
	if future, found := this.GetFutures()[keyStr]; found {
		return future
	}
	return nil
}

// FutureKeys lists the hashes of the pending futures.
func (this *Client) FutureKeys() []string {
	futures := this.GetFutures()
	keys := make([]string, 0, len(futures))
	for hash := range futures {
		keys = append(keys, hash)
	}
	return keys
}

// AwaitExistingFuture is the pending consumer channel for a hash, nil when none.
func (this *Client) AwaitExistingFuture(messageHash any) <-chan AsyncResult[any] {
	hash, _ := derefScalar(messageHash).(string)
	reply := this.storeCall(storePeek, hash, nil)
	if !reply.ok {
		return nil
	}
	return reply.value.(*Future).Await()
}

// PendingFutureCount reports how many futures are waiting for a message.
func (this *Client) PendingFutureCount() int {
	return this.storeCall(storePending, "", nil).count
}

type wsMessageHandler interface {
	HandleMessage(client *Client, msg any)
}

// clientStore is a client's futures map, retained rejections and last-pong stamp:
// a plain map and a plain value that only the goroutine below ever touches, so the
// resolve, reject and keepalive paths hand over a request instead of sharing them.
type clientStore struct {
	client  *Client
	req     chan storeOp
	initial map[string]*Future
}

type storeKind int

const (
	storeNewFuture storeKind = iota
	storeTake
	storeTakeAll
	storeRetain
	storePeek
	storeRejections
	storePending
	storePongGet
	storePongSet
)

type storeOp struct {
	kind  storeKind
	hash  string
	value any
	reply chan storeReply
}

type storeReply struct {
	value any
	ok    bool
	count int
}

func newClientStore(client *Client) *clientStore {
	initial := map[string]*Future{}
	// adopt a futures map handed in through the client config; from here on the
	// store goroutine is its only writer
	for hash, future := range client.Futures {
		initial[hash] = future
	}
	store := &clientStore{client: client, req: make(chan storeOp), initial: initial}
	// publish the first snapshot before the owner exists, so it is the only
	// unsynchronized write of the field and no reader can straddle it
	store.publish(initial)
	go store.own()
	return store
}

// publish swaps in a whole new snapshot of the pending futures; the store goroutine
// is the only writer of the field, and no reader can observe a map being mutated.
func (this *clientStore) publish(futures map[string]*Future) {
	snapshot := make(map[string]*Future, len(futures))
	for hash, future := range futures {
		snapshot[hash] = future
	}
	this.client.Futures = snapshot
}

// own is the only function that reads or writes the futures, rejections or pong
// stamp; it never calls back out, so a request can wait for its reply safely.
func (this *clientStore) own() {
	futures := this.initial
	this.initial = nil
	rejections := map[string]any{}
	var lastPong any
	for op := range this.req {
		switch op.kind {
		case storeNewFuture:
			// a retained rejection fails this consumer fast and is drained once, so
			// the next consumer is not poisoned by the old error
			if retained, ok := rejections[op.hash]; ok {
				delete(rejections, op.hash)
				spent := NewFuture()
				rejectFuture(spent, retained)
				op.reply <- storeReply{value: spent}
				continue
			}
			if _, ok := futures[op.hash]; !ok {
				futures[op.hash] = NewFuture()
				this.publish(futures)
			}
			op.reply <- storeReply{value: futures[op.hash]}
		case storeTake:
			future, ok := futures[op.hash]
			if ok {
				delete(futures, op.hash)
				this.publish(futures)
			}
			op.reply <- storeReply{value: future, ok: ok}
		case storeTakeAll:
			pending := make([]any, 0, len(futures))
			for hash, future := range futures {
				pending = append(pending, future)
				delete(futures, hash)
			}
			this.publish(futures)
			op.reply <- storeReply{value: pending}
		case storeRetain:
			rejections[op.hash] = op.value
			op.reply <- storeReply{}
		case storePeek:
			future, ok := futures[op.hash]
			op.reply <- storeReply{value: future, ok: ok}
		case storeRejections:
			snapshot := make(map[string]any, len(rejections))
			for hash, err := range rejections {
				snapshot[hash] = err
			}
			op.reply <- storeReply{value: snapshot}
		case storePending:
			op.reply <- storeReply{count: len(futures)}
		case storePongGet:
			op.reply <- storeReply{value: lastPong}
		case storePongSet:
			lastPong = op.value
			op.reply <- storeReply{}
		}
	}
}

func (this *clientStore) call(kind storeKind, hash string, value any) storeReply {
	reply := make(chan storeReply)
	this.req <- storeOp{kind: kind, hash: hash, value: value, reply: reply}
	return <-reply
}

// storeTable returns the futures owner NewClient created; it published the first
// Futures snapshot before NewClient returned.
func (this *Client) storeTable() *clientStore {
	return this.store
}

func (this *Client) storeCall(kind storeKind, hash string, value any) storeReply {
	return this.storeTable().call(kind, hash, value)
}

// connOwner is the one goroutine holding a client's transport handle: every
// hand-off, write, control frame and close goes through it, so no two paths touch
// the socket at once and the handle needs no lock.
type connOwner struct {
	req chan connOp
}

type connKind int

const (
	connAdopt connKind = iota
	connSend
	connPing
	connClose
	connRelease
	connCurrent
)

type connOp struct {
	kind  connKind
	conn  *websocket.Conn
	data  []byte
	reply chan connReply
}

type connReply struct {
	conn *websocket.Conn
	ok   bool
	err  error
}

func newConnOwner() *connOwner {
	owner := &connOwner{req: make(chan connOp)}
	go owner.own()
	return owner
}

// own is the only function that holds the handle; the write path blocks here, as
// it blocked on the old lock, and the read loop gets its own reference on adopt.
func (this *connOwner) own() {
	var conn *websocket.Conn
	for op := range this.req {
		switch op.kind {
		case connAdopt:
			if conn != nil && conn != op.conn {
				_ = conn.Close()
			}
			conn = op.conn
			op.reply <- connReply{conn: conn, ok: conn != nil}
		case connSend:
			if conn == nil {
				op.reply <- connReply{}
				continue
			}
			err := conn.WriteMessage(websocket.TextMessage, op.data)
			op.reply <- connReply{ok: err == nil, err: err}
		case connPing:
			if conn == nil {
				op.reply <- connReply{}
				continue
			}
			err := conn.WriteControl(websocket.PingMessage, nil, time.Now().Add(5*time.Second))
			op.reply <- connReply{ok: err == nil, err: err}
		case connClose:
			if conn == nil {
				op.reply <- connReply{}
				continue
			}
			closing := conn
			conn = nil
			op.reply <- connReply{ok: true, err: closing.Close()}
		case connRelease:
			if conn == nil || conn != op.conn {
				op.reply <- connReply{}
				continue
			}
			closing := conn
			conn = nil
			op.reply <- connReply{ok: true, err: closing.Close()}
		case connCurrent:
			op.reply <- connReply{conn: conn, ok: conn != nil}
		}
	}
}

func (this *connOwner) call(op connOp) connReply {
	op.reply = make(chan connReply)
	this.req <- op
	return <-op.reply
}

// connTable returns the conn owner NewClient created.
func (this *Client) connTable() *connOwner {
	return this.connState
}

// AdoptConnection hands a freshly dialed handle to the owner; the caller keeps at
// most a read reference and must not write or close it.
func (this *Client) AdoptConnection(conn *websocket.Conn) {
	this.connTable().call(connOp{kind: connAdopt, conn: conn})
}

// HasConnection reports whether the owner still holds a handle.
func (this *Client) HasConnection() bool {
	return this.connTable().call(connOp{kind: connCurrent}).ok
}

// writeText sends one text frame through the owner; ok is false with a nil error
// when there is no handle.
func (this *Client) writeText(message string) (bool, error) {
	reply := this.connTable().call(connOp{kind: connSend, data: []byte(message)})
	return reply.ok, reply.err
}

// writePing sends one control ping through the owner; ok is false when there is
// no handle, an error carries the transport failure.
func (this *Client) writePing() (bool, error) {
	reply := this.connTable().call(connOp{kind: connPing})
	return reply.ok, reply.err
}

// closeConnection drops the handle and closes it; ok is false when there was none.
func (this *Client) closeConnection() (bool, error) {
	reply := this.connTable().call(connOp{kind: connClose})
	return reply.ok, reply.err
}

// ReleaseConnection closes a handle the caller still refers to, but only while it
// is the current one: a handle the owner already replaced is left alone.
func (this *Client) ReleaseConnection(conn *websocket.Conn) {
	this.connTable().call(connOp{kind: connRelease, conn: conn})
}

// dialOwner is the one goroutine that may start a connection for a client: the
// once-only "started connecting" decision and the dial itself run on it, so
// neither needs a lock.
type dialOwner struct {
	req chan func()
}

func newDialOwner() *dialOwner {
	owner := &dialOwner{req: make(chan func())}
	go owner.own()
	return owner
}

func (this *dialOwner) own() {
	for fn := range this.req {
		fn()
	}
}

// run performs a dial request on the owner goroutine and returns when it is done.
func (this *dialOwner) run(fn func()) {
	done := make(chan struct{})
	this.req <- func() {
		defer close(done)
		fn()
	}
	<-done
}

// dialTable returns the dial owner NewClient created.
func (this *Client) dialTable() *dialOwner {
	return this.dials
}
