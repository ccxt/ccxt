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
	"encoding/json"
	"fmt"
	"log"
	"regexp"
	"strings"
	"sync"
	"time"

	"runtime/debug"

	"github.com/gorilla/websocket"
)

// Client is a thin wrapper around a single ws:// or wss:// connection.
// Subscriptions are identified by an arbitrary hash string
// Each Subscribe call returns a receive-only channel that the caller reads updates from.
type Client struct {
	Futures       map[string]Future
	Url string

	Connection *websocket.Conn
	Mu   sync.Mutex 												// protects conn writes

	SubsMu         sync.RWMutex
	Subscriptions  map[string]chan interface{}
	ReadLoopClosed chan struct{}

	Error error 														// last error, nil if connection considered healthy

	Connected             Future	             					// signal channel for connection established
    Disconnected          Future                 					// future for disconnection
    Rejections            map[string]interface{} 					// map for rejection info
    KeepAlive             interface{}                  				// number in milliseconds or seconds
    ConnectionTimeout     interface{}            					// e.g. *time.Timer or context.CancelFunc
    Verbose               bool                   					// default false
    ConnectionTimer       interface{}            					// e.g. *time.Timer or custom timer
    LastPong              interface{}            					// time or timestamp type recommended
    MaxPingPongMisses     interface{}            					// int or counter type
    PingInterval          interface{}            					// time.Duration recommended
    ConnectionEstablished interface{}            					// signal or state variable
    Gunzip                interface{}            					// gzip decompressor (e.g. io.Reader)
    Inflate               interface{}            					// zlib inflater or similar
    URL                   string                 					// URL string
    IsConnected           interface{}            					// bool or state variable
    OnConnectedCallback   func(client interface{}, message interface{}) // callback function signature - adjust as needed
    OnMessageCallback     func(client interface{}, message interface{}) // example callback with message
    OnErrorCallback       func(client interface{}, err interface{})   	// error callback
    OnCloseCallback       func(client interface{}, err interface{})   	// connection closed callback
    Ping                  interface{}            					// e.g. timer or pong/ping state
    Throttle              interface{}            					// throttling mechanism (rate limiter, etc.)
    // Owner interface{} 											// pointer to the exchange that created the client
}

func (this *Client) Resolve(data interface{}, subHash interface{}) {
	hash, ok := subHash.(string)
	if !ok {
		panic(fmt.Sprintf("subHash must be a string, got %T: %v", subHash, subHash))
	}
	
	if ch, exists := this.Subscriptions[hash]; exists {  // checks if the Client.Subscriptions map has a channel for that hash
		select {
		case ch <- data:	// Try to deliver the snapshot immediately
		default:			// if the channel buffer is full (no receiver ready yet) 
			// fall back to a goroutine so the send will eventually succeed without dropping the message
			go func(d interface{}) { ch <- d }(data)
		}
	}
	
	// Send to Future channel for ongoing updates (non-blocking)
	if fut, exists := this.Futures[hash]; exists {
		fut.ResolveOngoing(data)
	}
}

func (this *Client) Future(hash interface{}) Future {
    key := hash.(string)
    if fut, ok := this.Futures[key]; ok { 
        return fut 
    }

    fut := NewFuture()
    this.Futures[key] = fut
    if err, ok := this.Rejections[key]; ok {
        fut.Reject(err)
        delete(this.Rejections, key)
    }
    return fut
}

// Reject rejects specific future or all
func (this *Client) Reject(err interface{}, messageHash ...interface{}) {
	if len(messageHash) == 0 {
		for hash := range this.Futures {
			this.Futures[hash].Reject(err)
			delete(this.Futures, hash)
		}
		return
	}
	hash := messageHash[0]
	if fut, ok := this.Futures[hash.(string)]; ok {
		fut.Reject(err)
		delete(this.Futures, hash.(string))
	}
}

// Close terminates the underlying websocket connection (if any)
func (this *Client) Close() error {
	this.Mu.Lock()
	defer this.Mu.Unlock()
	if this.Connection != nil {
		err := this.Connection.Close()
		this.Connection = nil
		this.IsConnected = false
		
		// Signal disconnection
		select {
		case <-this.Disconnected:
			// Already closed
		default:
			close(this.Disconnected)
		}
		
		return err
	}
	return nil
}

// NewClient creates a new WebSocket client with the given URL and callbacks
// Matches the TypeScript constructor exactly with all the same properties
func NewClient(url string, onMessageCallback func(client interface{}, err interface{}), onErrorCallback func(client interface{}, err interface{}), onCloseCallback func(client interface{}, err interface{}), onConnectedCallback func(client interface{}, err interface{}), config ...map[string]interface{}) (interface{}, error) {
	// Set up defaults exactly like TypeScript constructor
	defaults := map[string]interface{}{
		"url":                     url,
		"onMessageCallback":       onMessageCallback,
		"onErrorCallback":         onErrorCallback,
		"onCloseCallback":         onCloseCallback,
		"onConnectedCallback":     onConnectedCallback,
		"verbose":                 false,
		"protocols":               nil,
		"options":                 nil,
		"futures":                 make(map[string]Future),
		"subscriptions":           make(map[string]chan interface{}),
		"rejections":              make(map[string]interface{}),
		"connected":               nil,
		"error":                   nil,
		"connectionStarted":       nil,
		"connectionEstablished":   nil,
		"isConnected":             false,
		"connectionTimer":         nil,
		"connectionTimeout":       10000,
		"pingInterval":            nil,
		"ping":                    nil,
		"keepAlive":               30000,
		"maxPingPongMisses":       2.0,
		"connection":              nil,
		"startedConnecting":       false,
		"gunzip":                  false,
		"inflate":                 false,
	}

	// Apply config overrides if provided
	finalConfig := defaults
	if len(config) > 0 {
		for key, value := range config[0] {
			finalConfig[key] = value
		}
	}

	// Create the client with all properties from TypeScript constructor
	c := &Client{
		Url:                   url,
		Futures:               finalConfig["futures"].(map[string]Future),
		Subscriptions:         finalConfig["subscriptions"].(map[string]chan interface{}),
		Rejections:            finalConfig["rejections"].(map[string]interface{}),
		Verbose:               finalConfig["verbose"].(bool),
		KeepAlive:             int64(finalConfig["keepAlive"].(int)),
		MaxPingPongMisses:     finalConfig["maxPingPongMisses"],
		IsConnected:           finalConfig["isConnected"],
		OnConnectedCallback:   onConnectedCallback,
		OnMessageCallback:     onMessageCallback,
		OnErrorCallback:       onErrorCallback,
		OnCloseCallback:       onCloseCallback,
		ConnectionTimeout:     finalConfig["connectionTimeout"],
		ConnectionTimer:       finalConfig["connectionTimer"],
		PingInterval:          finalConfig["pingInterval"],
		Ping:                  finalConfig["ping"],
		Connection: func() *websocket.Conn {
			if finalConfig["connection"] != nil {
				if conn, ok := finalConfig["connection"].(*websocket.Conn); ok {
					return conn
				}
			}
			return nil
		}(),
		ConnectionEstablished: finalConfig["connectionEstablished"],
		Gunzip:                finalConfig["gunzip"],
		Inflate:               finalConfig["inflate"],
		ReadLoopClosed:        make(chan struct{}),
		Connected:             NewFuture(),
		Disconnected:          NewFuture(),
	}

	return c, nil
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
// 			var msg interface{}
// 			if err := json.Unmarshal(data, &msg); err == nil {
// 				if h, ok := this.Owner.(interface{ HandleMessage(client interface{}, message interface{}) }); ok {
// 					h.HandleMessage(this, msg)
// 				}
// 			}
// 		}
// 	}
// }

// updates the LastPong timestamp and optionally logs the event when the client is running in verbose mode
func (this *Client) OnPong() {
	this.LastPong = time.Now().UnixMilli()
	if this.Verbose {
		log.Println(time.Now(), "onPong")
	}
}

func (this *Client) Reset(err interface{}) {
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

func (this *Client) Log(args ...interface{}) {
	fmt.Println(args...)
	// fmt.Printf("%+v\n", args) // equivalent to console.dir with depth
}

func (this *Client) Connect(backoffDelay ...int) (interface{}, error) {
	return nil, NotSupported(this.Url + " connect() not implemented yet")
}

func (this *Client) IsOpen() (interface{}, error) {
	return nil, NotSupported(this.Url + " isOpen() not implemented yet")
}

func (this *Client) ResetConnection(err interface{}) {
	this.ClearConnectionTimeout()
	this.ClearPingInterval()
	this.Reject(err)
}

func (this *Client) OnConnectionTimeout() {
	if isOpen, _ := this.IsOpen(); isOpen == nil || isOpen == false {
		err := RequestTimeout("Connection to " + this.Url + " failed due to a connection timeout")
		this.OnError(err)
		this.Connection.Close()
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

func (this *Client) SetPingInterval() {
	if this.KeepAlive.(int64) > 0 {
		ticker := time.NewTicker(time.Duration(this.KeepAlive.(int64)) * time.Millisecond)
		this.PingInterval = ticker
		go func() {
			defer ticker.Stop() // Ensure ticker is stopped when goroutine exits
			for {
				select {
				case <-ticker.C:
					this.OnPingInterval()
				case <-this.Disconnected: // Exit when client is disconnected
					return
				}
			}
		}()
	}
}

func (this *Client) ClearPingInterval() {
	if this.PingInterval != nil {
		if ticker, ok := this.PingInterval.(*time.Ticker); ok {
			ticker.Stop()
		}
		this.PingInterval = nil
	}
}

func (this *Client) OnPingInterval() {
	if this.KeepAlive.(int64) > 0 {
		if isOpen, _ := this.IsOpen(); isOpen != nil && isOpen != false {
			now := time.Now().UnixNano() / int64(time.Millisecond)
			if this.LastPong == nil {
				this.LastPong = now
			}
			lastPong := this.LastPong.(int64)
			maxPingPongMisses := float64(2.0)
			if this.MaxPingPongMisses != nil {
				if misses, ok := this.MaxPingPongMisses.(float64); ok {
					maxPingPongMisses = misses
				}
			}
			if (lastPong + this.KeepAlive.(int64) * int64(maxPingPongMisses)) < now {
				err := RequestTimeout("Connection to " + this.Url + " timed out due to a ping-pong keepalive missing on time")
				this.OnError(err)
			} else {
				var message interface{}
				if this.Ping != nil {
					if pingFunc, ok := this.Ping.(func(*Client) interface{}); ok {
						message = pingFunc(this)
					}
				}
				if message != nil {
					go func() {
						ch := this.Send(message)
						if err := <-ch; err != nil {
							this.OnError(err)
						}
					}()
				} else {
					// In Go, we can ping directly on websocket connection
					if this.Connection != nil {
						this.Connection.WriteMessage(websocket.PingMessage, []byte{})
					}
				}
			}
		}
	}
}

func (this *Client) OnOpen() {
	if this.Verbose {
		this.Log(time.Now(), "onOpen")
	}
	this.ConnectionEstablished = Milliseconds()
	this.IsConnected = true
	// Signal connected channel
	select {
	case <-this.Connected:
		// Already closed
	default:
		close(this.Connected)
	}
	this.ClearConnectionTimeout()
	this.SetPingInterval()
	if this.OnConnectedCallback != nil {
		this.OnConnectedCallback(this, nil)
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

func (this *Client) OnError(err interface{}) {
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

func (this *Client) OnClose(event interface{}) {
	if this.Verbose {
		this.Log(time.Now(), "onClose", event)
	}
	if this.Error == nil {
		// todo: exception types for server-side disconnects
		// this.Reset(NetworkError("connection closed by remote server, closing code " + event.code)) // TODO: what type is event?
		this.Reset(NetworkError("connection closed by remote server, closing code " + event.(string))) // Temp to make error go away
	}
	// if err, ok := this.Error.(ExchangeClosedByUser); ok {  // TODO: how to do this
	// 	this.Reset(err)
	// }
	if this.Disconnected != nil {
		this.Disconnected.Resolve(true)
	}
	this.OnCloseCallback(this, event)  // TODO: What to do with event? parameter is error
}

// this method is not used at this time
// but may be used to read protocol-level data like cookies, headers, etc
func (this *Client) OnUpgrade(message interface{}) {
	if this.Verbose {
		this.Log(time.Now(), "onUpgrade")
	}
}

func (this *Client) Send(message interface{}) Future {
	if this.Verbose {
		this.Log(time.Now(), "sending", message)
	}
	
	var msgStr string
	if str, ok := message.(string); ok {
		msgStr = str
	} else {
		msgBytes, _ := json.Marshal(message)
		msgStr = string(msgBytes)
	}
	
	future := NewFuture()
	
	go func() {
		this.Mu.Lock()
		defer this.Mu.Unlock()
		
		if this.Connection == nil {
			future.Reject(fmt.Errorf("websocket connection closed"))
			return
		}
		
		err := this.Connection.WriteMessage(websocket.TextMessage, []byte(msgStr))
		if err != nil {
			future.Reject(err)
		} else {
			future.Resolve(nil)
		}
	}()
	
	return future
}

// TODO: Another implementation, maybe it's better?
// Send writes the payload and returns a channel that yields an error (nil on success).
// func (this *Client) Send(message interface{}) <-chan interface{} {
// 	ch := make(chan interface{}, 1)

// 	go func() {
// 		this.Mu.Lock()
// 		defer this.Mu.Unlock()

// 		var err error
// 		if this.Connection == nil {
// 			err = fmt.Errorf("websocket connection closed")
// 		} else {
// 			switch v := message.(type) {
// 			case []byte:
// 				err = this.Connection.WriteMessage(websocket.BinaryMessage, v)
// 			default:
// 				err = this.Connection.WriteJSON(v)
// 			}
// 		}
// 		ch <- err
// 		close(ch)
// 	}()

// 	return ch
// }

func (this *Client) CloseConnection() (interface{}, error) {
	return nil, NotSupported(this.Url + " close() not implemented yet")
}

func (this *Client) OnMessage(messageEvent interface{}) {
	// if we use onmessage we get MessageEvent objects
	// MessageEvent {isTrusted: true, data: "{"e":"depthUpdate","E":1581358737706,"s":"ETHBTC",…"0.06200000"]],"a":[["0.02261300","0.00000000"]]}", origin: "wss://stream.binance.com:9443", lastEventId: "", source: null, …}

	var message interface{}
	if eventMap, ok := messageEvent.(map[string]interface{}); ok {
		if data, exists := eventMap["data"]; exists {
			message = data
		}
	} else {
		message = messageEvent
	}

	var messageStr string
	if str, ok := message.(string); ok {
		messageStr = str
	} else if bytes, ok := message.([]byte); ok {
		// Handle binary data
		if this.Gunzip != nil && this.Gunzip.(bool) {
			// Would need to implement gzip decompression
			messageStr = string(bytes)
		} else if this.Inflate != nil && this.Inflate.(bool) {
			// Would need to implement zlib inflation
			messageStr = string(bytes)
		} else {
			messageStr = string(bytes)
		}
	} else {
		messageStr = fmt.Sprintf("%v", message)
	}

	// Try to parse as JSON
	var parsedMessage interface{}
	if this.IsJsonEncodedObject(messageStr) {
		// Replace large numbers with strings to prevent precision loss
		re := regexp.MustCompile(`:(\d{15,}),`)
		messageStr = re.ReplaceAllString(messageStr, `:"$1",`)
		
		if err := json.Unmarshal([]byte(messageStr), &parsedMessage); err == nil {
			message = parsedMessage
		} else {
			if this.Verbose {
				this.Log(time.Now(), "onMessage JSON.parse", err)
			}
			// reset with a json encoding error ?
		}
	}

	if this.Verbose {
		this.Log(time.Now(), "onMessage", message)
		// unlimited depth
		// this.Log(time.Now(), "onMessage", util.inspect(message, false, null, true))
		// this.Log(time.Now(), "onMessage", JSON.stringify(message, null, 4))
	}

	defer func() {
		if r := recover(); r != nil {
			stack := debug.Stack()
			panicMsg := fmt.Sprintf("panic: %v\nStack trace:\n%s", r, stack)
			this.Reject(panicMsg)
		}
	}()

	if this.OnMessageCallback != nil {
		this.OnMessageCallback(this, message)
	}
}

func (this *Client) IsJsonEncodedObject(str string) bool {
	str = strings.TrimSpace(str)
	return (strings.HasPrefix(str, "{") && strings.HasSuffix(str, "}")) ||
		   (strings.HasPrefix(str, "[") && strings.HasSuffix(str, "]"))
}

type wsMessageHandler interface {
    HandleMessage(client *Client, msg interface{})
}
