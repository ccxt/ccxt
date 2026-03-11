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
	"sync"
	"time"
	"unicode/utf8"

	"github.com/gorilla/websocket"
)

type ClientInterface interface {
	Resolve(data any, subHash any) any
	Future(messageHash any) <-chan any
	ReusableFuture(messageHash any) *Future
	Reject(err any, messageHash ...any)
	Send(message any) <-chan any
	Reset(err any)
	OnPong()
	GetError() error
	SetError(err error)
	GetUrl() string
	GetSubscriptions() map[string]any
	GetLastPong() any
	SetLastPong(lastPong any)
	GetKeepAlive() any
	SetKeepAlive(keepAlive any)
	GetFutures() map[string]any
}

// Client is a thin wrapper around a single ws:// or wss:// connection.
// Subscriptions are identified by an arbitrary hash string
// Each Subscribe call returns a receive-only channel that the caller reads updates from.
type Client struct {
	Futures   map[string]any
	FuturesMu sync.RWMutex // protects Futures map
	Url       string

	Connection   *websocket.Conn
	ConnectionMu sync.Mutex // protects conn writes

	PongSetMu sync.RWMutex // protects LastPong set

	Subscriptions   map[string]any // map[string]chan any
	SubscriptionsMu sync.RWMutex
	ConnectMu       sync.RWMutex // protects Connect calls
	ReadLoopClosed  chan struct{}

	Error error // last error, nil if connection considered healthy

	Connected             any            // *Future             		// signal channel for connection established
	Disconnected          any            // *Future              	// future for disconnection
	Rejections            map[string]any // map for rejection info
	KeepAlive             any            // number in milliseconds or seconds
	ConnectionTimeout     any            // e.g. *time.Timer or context.CancelFunc
	Verbose               bool                   // default false
	DecompressBinary      bool
	ConnectionTimer       any                                   // e.g. *time.Timer or custom timer
	LastPong              any                                   // time or timestamp type recommended
	MaxPingPongMisses     any                                   // int or counter type
	PingInterval          any                                   // time.Duration recommended
	ConnectionEstablished any                                   // signal or state variable
	Gunzip                any                                   // gzip decompressor (e.g. io.Reader)
	Inflate               any                                   // zlib inflater or similar
	URL                   string                                        // URL string
	IsConnected           any                                   // bool or state variable
	OnConnectedCallback   func(client any, message any) // callback function signature - adjust as needed
	OnMessageCallback     func(client any, message any) // example callback with message
	OnErrorCallback       func(client any, err any)     // error callback
	OnCloseCallback       func(client any, err any)     // connection closed callback
	Ping                  any                                   // e.g. timer or pong/ping state
	Throttle              any                                   // throttling mechanism (rate limiter, etc.)
	// Owner any 											// pointer to the exchange that created the client
}

func (this *Client) Resolve(data any, subHash any) any {
	hash, ok := subHash.(string)
	if !ok {
		panic(fmt.Sprintf("subHash must be a string, got %T: %v", subHash, subHash))
	}

	// Send to Future channel for ongoing updates (non-blocking)
	this.FuturesMu.Lock()
	if fut, exists := this.Futures[hash]; exists {
		// Print("Inside resolve, existed future for hash: " + hash)
		fut.(*Future).Resolve(data)
		delete(this.Futures, hash)
	}
	this.FuturesMu.Unlock()
	return data
}

func (this *Client) Future(messageHash any) <-chan any {
	future := this.NewFuture(messageHash)
	return future.Await()
}

func (this *Client) ReusableFuture(messageHash any) *Future {
	future := this.NewFuture(messageHash)
	return future
}

func (this *Client) NewFuture(messageHash any) *Future {
	hash, _ := messageHash.(string)
	this.FuturesMu.Lock()
	if _, ok := this.Futures[hash]; !ok {
		this.Futures[hash] = NewFuture()
	}
	future := this.Futures[hash]
	this.FuturesMu.Unlock()
	if err, ok := this.Rejections[hash]; ok {
		future.(*Future).Reject(err.(error))
		delete(this.Rejections, hash)
	}
	return future.(*Future)
}

// Reject rejects specific future or all
func (this *Client) Reject(err any, messageHash ...any) {
	this.FuturesMu.Lock()
	if len(messageHash) == 0 {
		for hash := range this.Futures {
			this.Futures[hash].(*Future).Reject(err.(error))
			delete(this.Futures, hash)
		}
		this.FuturesMu.Unlock()
		return
	}
	hash := messageHash[0]
	if fut, ok := this.Futures[hash.(string)]; ok {
		fut.(*Future).Reject(err.(error))
		delete(this.Futures, hash.(string))
	}
	this.FuturesMu.Unlock()
}

// Close terminates the underlying websocket connection (if any)
func (this *Client) Close() error {
	this.ConnectionMu.Lock()
	defer this.ConnectionMu.Unlock()
	if this.Connection != nil {
		err := this.Connection.Close()
		this.Connection = nil
		this.IsConnected = false

		// Signal disconnection
		this.Disconnected.(*Future).Resolve(true)

		return err
	}
	return nil
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
		"Futures":               make(map[string]any),
		"Subscriptions":         make(map[string]any), // map[string]chan any
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
		Url:                 url,
		Futures:             finalConfig["Futures"].(map[string]any),
		Subscriptions:       finalConfig["Subscriptions"].(map[string]any), // map[string]chan any
		Rejections:          finalConfig["Rejections"].(map[string]any),
		Verbose:             finalConfig["Verbose"].(bool),
		KeepAlive:           ParseInt(finalConfig["keepAlive"]),
		MaxPingPongMisses:   finalConfig["MaxPingPongMisses"],
		IsConnected:         finalConfig["IsConnected"],
		OnConnectedCallback: onConnectedCallback,
		OnMessageCallback:   onMessageCallback,
		OnErrorCallback:     onErrorCallback,
		OnCloseCallback:     onCloseCallback,
		ConnectionTimeout:   finalConfig["ConnectionTimeout"],
		ConnectionTimer:     finalConfig["ConnectionTimer"],
		PingInterval:        finalConfig["PingInterval"],
		Ping:                finalConfig["Ping"],
		Connection: func() *websocket.Conn {
			if finalConfig["connection"] != nil {
				if conn, ok := finalConfig["Connection"].(*websocket.Conn); ok {
					return conn
				}
			}
			return nil
		}(),
		ConnectionEstablished: finalConfig["ConnectionEstablished"],
		Gunzip:                finalConfig["gunzip"],
		Inflate:               finalConfig["inflate"],
		Throttle:              finalConfig["Throttle"],
		ReadLoopClosed:        make(chan struct{}),
		Connected:             NewFuture(),
		Disconnected:          NewFuture(),
		DecompressBinary:      finalConfig["DecompressBinary"].(bool),
	}

	return c
}

// func (this *Client) readLoop() {
// 	defer close(this.ReadLoopClosed)
// 	defer func() {
// 		// Call onCloseCallback when read loop exits
// 		if this.OnCloseCallback != nil {
// 			this.OnCloseCallback()
// 		}
// 	}()

// 	for {
// 		if this.Connection == nil {
// 			return
// 		}
// 		_, data, err := this.Connection.ReadMessage()
// 		if err != nil {
// 			this.Err = err
// 			this.IsConnected = false

// 			// Call onErrorCallback if provided
// 			if this.OnErrorCallback != nil {
// 				this.OnErrorCallback(err)
// 			}

// 			_ = this.Close()
// 			return
// 		}

// 		// Call onMessageCallback if provided
// 		if this.OnMessageCallback != nil {
// 			this.OnMessageCallback(data)
// 		}

// 		// forward decoded JSON frames to exchange.HandleMessage
// 		if this.Owner != nil {
// 			var msg any
// 			if err := json.Unmarshal(data, &msg); err == nil {
// 				if h, ok := this.Owner.(interface{ HandleMessage(client any, message any) }); ok {
// 					h.HandleMessage(this, msg)
// 				}
// 			}
// 		}
// 	}
// }

// updates the LastPong timestamp and optionally logs the event when the client is running in verbose mode
func (this *Client) OnPong() {
	this.PongSetMu.Lock()
	defer this.PongSetMu.Unlock()
	this.LastPong = time.Now().UnixMilli()
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

func (this *Client) Connect(backoffDelay ...int) (any, error) {
	return nil, NotSupported(this.Url + " connect() not implemented yet")
}

func (this *Client) IsOpen() (any, error) {
	return nil, NotSupported(this.Url + " isOpen() not implemented yet")
}

func (this *Client) OnConnectionTimeout() {
	if !this.IsConnected.(bool) {
		err := RequestTimeout("Connection to " + this.Url + " failed due to a connection timeout")
		this.OnError(err)
		if this.Connection != nil {
			this.Connection.Close()
		}
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

// this method is not used at this time, because in JS the ws client will
// respond to pings coming from the server with pongs automatically
// however, some devs may want to track connection states in their app
func (this *Client) OnPing() {
	if this.Verbose {
		this.Log(time.Now(), "onPing")
	}
}

func (this *Client) OnPongTS() {
	this.LastPong = time.Now().UnixNano() / int64(time.Millisecond)
	if this.Verbose {
		this.Log(time.Now(), "onPong")
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

// this method is not used at this time
// but may be used to read protocol-level data like cookies, headers, etc
func (this *Client) OnUpgrade(message any) {
	if this.Verbose {
		this.Log(time.Now(), "onUpgrade")
	}
}

func (this *Client) Send(message any) <-chan any {
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
	ch := make(chan any)
	go func() {
		this.ConnectionMu.Lock()
		// ? if (isNode)
		if this.Connection == nil {
			err := NetworkError("not connected to " + this.Url)
			future.Reject(err)
		} else {
			err := this.Connection.WriteMessage(websocket.TextMessage, []byte(msgStr))
			if err != nil {
				future.Reject(err)
				ch <- err
			} else {
				future.Resolve(true)
				ch <- true
			}
		}

		this.ConnectionMu.Unlock()
	}()

	return ch
}

func (this *Client) CloseConnection() (any, error) {
	return nil, NotSupported(this.Url + " close() not implemented yet")
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
		if this.Gunzip != nil && this.Gunzip.(bool) {
			// Would need to implement gzip decompression
			gunzipOut, _ := gunzipData(bytes)
			messageStr = string(gunzipOut)
		} else if this.Inflate != nil && this.Inflate.(bool) {
			// Would need to implement zlib inflation
			messageStr = string(bytes)
		} else {
			// some exchanges send a regular json/string message as a binary frame
			// so we check if it is json/string first to avoid unnecessary conversion
			if this.DecompressBinary || IsJSON(bytes) || utf8.Valid(bytes) {
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

func (this *Client) GetSubscriptions() map[string]any {
	return this.Subscriptions
}

func (this *Client) GetLastPong() any {
	this.PongSetMu.RLock()
	defer this.PongSetMu.RUnlock()
	return this.LastPong
}
func (this *Client) SetLastPong(lastPong any) {
	this.PongSetMu.Lock()
	defer this.PongSetMu.Unlock()
	this.LastPong = lastPong
}
func (this *Client) SetKeepAlive(keepAlive any) {
	this.KeepAlive = keepAlive
}
func (this *Client) GetKeepAlive() any {
	return this.KeepAlive
}
func (this *Client) GetFutures() map[string]any {
	return this.Futures
}

type wsMessageHandler interface {
	HandleMessage(client *Client, msg any)
}
