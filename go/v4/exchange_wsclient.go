package ccxt

// WebSocket transport for streaming ("pro") exchanges.
// ----------------------------------------------------
// This is intentionally minimal: it supports concurrent subscriptions,
// automatic JSON encoding/decoding and graceful shutdown.  Higher-level
// exchange code decides which messages belong to which subscription;
// the client only multiplexes frames to a per-channel inbox.
//
// The implementation uses github.com/gorilla/websocket – ensure that
// dependency is present in go.mod (go get if needed).

import (
	"context"
	"crypto/tls"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	coderws "github.com/coder/websocket"
	"github.com/gorilla/websocket"
)

// WSClient is a thin wrapper around a single ws:// or wss:// connection.
// Subscriptions are identified by an arbitrary hash string (often equal to the
// messageHash used in the JS/C# layers).  Each Subscribe call returns a
// receive-only channel that the caller reads updates from.

// newWSDialer returns a websocket.Dialer with an explicit dual-stack
// NetDialContext (network "tcp", Happy Eyeballs). Never use tcp4.
func newWSDialer(proxyFunc func(*http.Request) (*url.URL, error)) websocket.Dialer {
	return websocket.Dialer{
		Proxy:             proxyFunc,
		HandshakeTimeout:  10 * time.Second,
		EnableCompression: false,
		NetDialContext:    newDualStackDialer().DialContext,
	}
}

// wsCompressionDialTimeout bounds the compressed handshake the same way
// newWSDialer's HandshakeTimeout bounds the default one.
const wsCompressionDialTimeout = 10 * time.Second

// compressionEnabled reports whether this client's exchange opted into
// permessage-deflate. The venue declares `options.ws.compress`; BaseExchange
// flattens that map into the client options, so the value lands at "compress"
// (a nested "ws" map is also accepted for callers that build options directly).
// Undefined keeps every other venue on the gorilla transport unchanged.
func (this *WSClient) compressionEnabled() bool {
	if this.Options == nil {
		return false
	}
	if enabled, ok := wsCompressionValue(this.Options["compress"]); ok {
		return enabled
	}
	if nested, ok := this.Options["ws"].(map[string]any); ok {
		if enabled, ok := wsCompressionValue(nested["compress"]); ok {
			return enabled
		}
	}
	return false
}

// wsCompressionValue mirrors the python client's `compress` option: false/0
// disables the offer, true or any non-zero width enables it.
func wsCompressionValue(value any) (bool, bool) {
	switch typed := derefScalar(value).(type) {
	case bool:
		return typed, true
	case int:
		return typed != 0, true
	case int64:
		return typed != 0, true
	case float64:
		return typed != 0, true
	case string:
		return typed != "" && typed != "0" && typed != "false", true
	}
	return false, false
}

// dialCompressed dials with coder/websocket and offers permessage-deflate.
// gorilla v1.5.3 cannot be used here: it offers the extension with both
// no-context-takeover parameters and then requires the server to echo both,
// while nado's gateway answers with a bare `permessage-deflate` (RFC 7692 allows
// that omission). coder negotiates the bare response and inflates it correctly.
func (this *WSClient) dialCompressed(headers http.Header, proxy func(*http.Request) (*url.URL, error)) (wsConn, error) {
	transport := &http.Transport{
		Proxy:                 proxy,
		DialContext:           newDualStackDialer().DialContext,
		ForceAttemptHTTP2:     false, // the handshake is HTTP/1.1
		TLSHandshakeTimeout:   wsCompressionDialTimeout,
		ExpectContinueTimeout: time.Second,
		TLSClientConfig:       &tls.Config{MinVersion: tls.VersionTLS12},
	}
	if !this.validatesServerSsl() {
		transport.TLSClientConfig = &tls.Config{InsecureSkipVerify: true} //nolint:gosec // opt-in via ValidateServerSsl = false
	}
	var subprotocols []string
	if this.Protocols != nil {
		if protocols, ok := this.Protocols.([]string); ok {
			subprotocols = protocols
		}
	}
	adapter := &coderWSConn{}
	ctx, cancel := context.WithTimeout(context.Background(), wsCompressionDialTimeout)
	defer cancel()
	conn, resp, err := coderws.Dial(ctx, this.Url, &coderws.DialOptions{
		HTTPClient:      &http.Client{Transport: transport},
		HTTPHeader:      headers,
		Subprotocols:    subprotocols,
		CompressionMode: coderws.CompressionContextTakeover,
		OnPongReceived: func(_ context.Context, payload []byte) {
			adapter.pong(string(payload))
		},
	})
	if err != nil {
		if resp != nil && resp.Body != nil {
			_ = resp.Body.Close()
		}
		return nil, err
	}
	// gorilla places no limit on a message size; coder defaults to 32 KiB,
	// which would truncate exchange snapshots, so disable its limit.
	conn.SetReadLimit(-1)
	adapter.conn = conn
	return adapter, nil
}

// coderWSConn adapts coder/websocket to the wsConn surface the conn owner
// serializes. MessageText/MessageBinary are 1/2, matching gorilla's constants.
type coderWSConn struct {
	conn *coderws.Conn

	mu     sync.Mutex
	onPong func(string) error
}

func (this *coderWSConn) ReadMessage() (int, []byte, error) {
	messageType, data, err := this.conn.Read(context.Background())
	if err != nil {
		return 0, nil, err
	}
	return int(messageType), data, nil
}

func (this *coderWSConn) WriteMessage(messageType int, data []byte) error {
	typ := coderws.MessageText
	if messageType == websocket.BinaryMessage {
		typ = coderws.MessageBinary
	}
	return this.conn.Write(context.Background(), typ, data)
}

func (this *coderWSConn) WriteControl(messageType int, data []byte, deadline time.Time) error {
	if messageType != websocket.PingMessage {
		return nil
	}
	ctx := context.Background()
	if !deadline.IsZero() {
		var cancel context.CancelFunc
		ctx, cancel = context.WithDeadline(ctx, deadline)
		defer cancel()
	}
	return this.conn.Ping(ctx)
}

func (this *coderWSConn) SetPongHandler(h func(appData string) error) {
	this.mu.Lock()
	this.onPong = h
	this.mu.Unlock()
}

func (this *coderWSConn) pong(payload string) {
	this.mu.Lock()
	h := this.onPong
	this.mu.Unlock()
	if h != nil {
		_ = h(payload)
	}
}

func (this *coderWSConn) Close() error {
	return this.conn.CloseNow()
}

type WSClient struct {
	*Client

	ConnectionStarted int64
	Protocols         any
	Options           map[string]any
	StartedConnecting bool
	ProxyUrl          string
}

// NewWSClient dials the given URL and starts the read-loop.
func NewWSClient(url string, onMessageCallback func(client any, err any), onErrorCallback func(client any, err any), onCloseCallback func(client any, err any), onConnectedCallback func(client any, err any), proxyUrl string, config ...map[string]any) *WSClient {
	// Call NewClient to do exactly the same initialization
	client := NewClient(url, onMessageCallback, onErrorCallback, onCloseCallback, onConnectedCallback, config...)

	// Wrap the Client in a WSClient
	wsClient := &WSClient{
		Client:   client,
		ProxyUrl: proxyUrl,
	}
	wsClient.StartedConnecting = false

	if len(config) > 0 {
		opt, ok := config[0]["options"]
		if ok {
			if options, ok := opt.(map[string]any); ok {
				wsClient.Options = options
			}
		} else {
			wsClient.Options = config[0]
		}
	}

	return wsClient
}

// validatesServerSsl reads ValidateServerSsl from the client options, Exchange.Client
// nests it under "Options" while NewWSClient keeps the whole config map
func (this *WSClient) validatesServerSsl() bool {
	if this.Options == nil {
		return true
	}
	if validate, ok := derefScalar(this.Options["ValidateServerSsl"]).(bool); ok {
		return validate
	}
	if nested, ok := this.Options["Options"].(map[string]any); ok {
		if validate, ok := derefScalar(nested["ValidateServerSsl"]).(bool); ok {
			return validate
		}
	}
	return true
}

func (this *WSClient) CreateConnection() error {
	if this.Verbose {
		this.Log(time.Now(), "connecting to", this.Url)
	}
	this.ConnectionStarted = Milliseconds()
	this.SetConnectionTimeout()

	var proxy func(*http.Request) (*url.URL, error)
	if this.ProxyUrl != "" {
		urlproxyURL, _ := url.Parse(this.ProxyUrl)
		proxy = http.ProxyURL(urlproxyURL)
	} else {
		proxy = http.ProxyFromEnvironment
	}
	// Create WebSocket dialer (dual-stack: NetDialContext dials network "tcp"
	// via Happy Eyeballs, so IPv4 and IPv6 are both attempted)
	dialer := newWSDialer(proxy)
	if !this.validatesServerSsl() {
		dialer.TLSClientConfig = &tls.Config{InsecureSkipVerify: true} //nolint:gosec // opt-in via ValidateServerSsl = false
	}

	// Set up headers for protocols
	headers := http.Header{}
	if this.Protocols != nil {
		if protocols, ok := this.Protocols.([]string); ok {
			headers.Set("Sec-WebSocket-Protocol", strings.Join(protocols, ", "))
		}
	}

	// read from options headers if present
	if this.Options != nil {
		if headersOption, ok := this.Options["headers"]; ok {
			if headersMap, ok := headersOption.(map[string]any); ok {
				for key, value := range headersMap {
					if strValue, ok := value.(string); ok {
						headers.Set(key, strValue)
					}
				}
			}
		}
	}

	// Connect to WebSocket. The default transport is gorilla (dual-stack
	// NetDialContext via Happy Eyeballs, so IPv4 and IPv6 are both attempted);
	// a venue that opted into permessage-deflate uses the coder transport
	// because gorilla refuses nado's bare extension response.
	var conn wsConn
	if this.compressionEnabled() {
		compressedConn, err := this.dialCompressed(headers, proxy)
		if err != nil {
			return err
		}
		conn = compressedConn
	} else {
		dialer := newWSDialer(proxy)
		gorillaConn, _, err := dialer.Dial(this.Url, headers)
		if err != nil {
			return err
		}
		conn = gorillaConn
	}
	// the conn owner holds the handle from here on: writes and the close go through it
	this.AdoptConnection(conn)

	// handle connection pong here:
	conn.SetPongHandler(func(string) error {
		this.OnPong()
		return nil
	})

	// Start event handling goroutines
	go this.handleOpen()
	go this.handleMessages(conn)

	return nil
}

// Handle WebSocket open event
func (this *WSClient) handleOpen() {
	this.OnOpen()
}

// Handle incoming WebSocket messages; conn is this loop's own reference to the
// handle the conn owner adopted, the owner performs the close.
func (this *WSClient) handleMessages(conn wsConn) {
	defer func() {
		this.OnClose(nil)
		this.ReleaseConnection(conn)
	}()

	for {
		messageType, data, err := conn.ReadMessage()
		if err != nil {
			this.OnError(NetworkError(err))
			return
		}

		// gorilla routes control frames to the Ping/Pong/Close handlers during
		// the read, ReadMessage only ever returns Text or Binary, so the former
		// Ping, Pong and Close arms here were unreachable dead code; the Ping
		// arm also replied with an unsynchronized WriteMessage that would have
		// raced Send's writes had it ever run, gorilla's default ping handler
		// already answers with a concurrency safe WriteControl pong
		switch messageType {
		case websocket.TextMessage:
			// the frame type travels with the payload, a text frame as a string and
			// a binary frame as []byte, so OnMessage never has to guess it from the
			// bytes, which a binary payload (protobuf, SBE) can pass for utf-8 text
			this.OnMessage(string(data))
		case websocket.BinaryMessage:
			this.OnMessage(data)
		}
	}
}

func (this *WSClient) Connect(backoffDelay ...int) (*Future, error) {
	delay := 0
	if len(backoffDelay) > 0 {
		delay = backoffDelay[0]
	}
	if err := this.connectOnce(func() int { return delay }); err != nil {
		return nil, err
	}
	return this.Connected.(*Future), nil
}

// ConnectWithBackoff is Connect for callers that must compute the first-dial
// backoff themselves; estimate runs on the dial owner, only when this call is the
// one that starts the socket, so counting real dials needs no lock.
func (this *WSClient) ConnectWithBackoff(estimate func() int) (*Future, error) {
	if err := this.connectOnce(estimate); err != nil {
		return nil, err
	}
	return this.Connected.(*Future), nil
}

// connectOnce performs the once-only dial decision on the client's dial owner; a
// backoff dial is started from its own goroutine afterwards so the caller is not
// held, and the dial itself still runs on the owner.
func (this *WSClient) connectOnce(estimate func() int) error {
	var dialErr error
	delay := 0
	this.Client.dialTable().run(func() {
		if this.StartedConnecting {
			return
		}
		this.StartedConnecting = true
		if estimate != nil {
			delay = estimate()
		}
		if delay <= 0 {
			dialErr = this.CreateConnection()
		}
	})
	if delay > 0 {
		go func() {
			time.Sleep(time.Duration(delay) * time.Millisecond)
			this.Client.dialTable().run(func() { _ = this.CreateConnection() })
		}()
	}
	return dialErr
}

func (this *WSClient) SetPingInterval() {
	if derefScalar(this.KeepAlive).(int64) > 0 {
		ticker := time.NewTicker(time.Duration(derefScalar(this.KeepAlive).(int64)) * time.Millisecond)
		this.PingInterval = ticker
		go func() {
			defer ticker.Stop() // Ensure ticker is stopped when goroutine exits
			for {
				select {
				case <-ticker.C:
					this.OnPingInterval()
				case <-this.Disconnected.(*Future).Await(): // Exit when client is disconnected
					return
				}
			}
		}()
	}
}

func (this *WSClient) OnPingInterval() {
	if derefScalar(this.KeepAlive).(int64) > 0 {
		if derefScalar(this.IsConnected).(bool) == true {
			now := time.Now().UnixNano() / int64(time.Millisecond)
			lastPong := this.GetLastPong()
			if lastPong == nil {
				lastPong = now
				this.SetLastPong(lastPong)
			}
			lastPongVal := derefScalar(lastPong).(int64)
			maxPingPongMisses := float64(2.0)
			if this.MaxPingPongMisses != nil {
				if misses, ok := this.MaxPingPongMisses.(float64); ok {
					maxPingPongMisses = misses
				}
			}
			if (lastPongVal + derefScalar(this.KeepAlive).(int64)*int64(maxPingPongMisses)) < now {
				err := RequestTimeout("Connection to " + this.Url + " timed out due to a ping-pong keepalive missing on time")
				this.OnError(err)
			} else {
				var message any
				if this.Ping != nil {
					if pingFunc, ok := this.Ping.(func(*WSClient) any); ok {
						message = pingFunc(this)
					}
					if pingFunc, ok := this.Ping.(func(any) any); ok { // todo: type Ping() function properly inside derived files
						message = pingFunc(this)
					}
				}
				if message != nil {
					go func() {
						if err := (<-this.SendAsync(message)).Err; err != nil {
							this.OnError(err)
						}
					}()
				} else {
					// the conn owner serializes this control frame with the message
					// writes; no handle means the connection is already gone
					if this.HasConnection() {
						if this.Verbose {
							this.Log(time.Now(), "sending connection ping")
						}
						_, err := this.writePing()
						if err != nil {
							// a swallowed ping failure only surfaced two keepAlive
							// periods later as a misattributed pong-miss timeout,
							// route the transport death promptly instead, see
							// https://github.com/ccxt/ccxt/issues/22075 for the
							// python cousin of this pattern
							this.OnError(NetworkError(err))
						}
					}
				}
			}
		}
	}
}

func (this *WSClient) OnOpen() {
	if this.Verbose {
		this.Log(time.Now(), "onOpen")
	}
	this.ConnectionEstablished = Milliseconds()
	this.IsConnected = true
	// Signal connected channel
	this.Connected.(*Future).Resolve(true)
	this.ClearConnectionTimeout()
	this.SetPingInterval()
	if this.OnConnectedCallback != nil {
		this.OnConnectedCallback(this, nil)
	}
}

func (this *WSClient) Close() *Future {
	if this.HasConnection() {
		if this.Disconnected == nil {
			this.Disconnected = NewFuture()
		}
		// the conn owner closes the handle and drops it, so the next HasConnection
		// reads false without a reader having to observe a nil
		this.closeConnection()
	}
	return this.Disconnected.(*Future)
}

func (this *WSClient) Resolve(data any, subHash any) any {
	return this.Client.Resolve(data, subHash)
}

func (this *WSClient) Future(messageHash any) <-chan AsyncResult[any] {
	return this.Client.Future(messageHash)
}

func (this *WSClient) Reject(err any, messageHash ...any) {
	this.Client.Reject(err, messageHash...)
}

func (this *WSClient) SendAsync(message any) <-chan AsyncResult[bool] {
	return this.Client.SendAsync(message)
}

func (this *WSClient) Reset(err any) {
	this.Client.Reset(err)
}

func (this *WSClient) OnPong() {
	this.Client.OnPong()
}

func (this *WSClient) GetError() error {
	return this.Client.GetError()
}

func (this *WSClient) SetError(err error) {
	this.Client.SetError(err)
}

func (this *WSClient) GetUrl() string {
	return this.Client.GetUrl()
}

func (this *WSClient) GetLastPong() any {
	return this.Client.GetLastPong()
}
func (this *WSClient) SetLastPong(lastPong any) {
	this.Client.SetLastPong(lastPong)
}
func (this *WSClient) GetKeepAlive() any {
	return this.Client.GetKeepAlive()
}
func (this *WSClient) SetKeepAlive(keepAlive any) {
	this.Client.SetKeepAlive(keepAlive)
}
func (this *WSClient) GetFutures() map[string]*Future {
	return this.Client.GetFutures()
}

// AsClient normalizes the two client implementations to the embedded *Client —
// generated code passes whichever the transport produced (*Client offline mocks,
// *WSClient live/ws) into base helpers typed against *Client, and a hard type
// assertion on the wrong one panics at runtime
func AsClient(client any) *Client {
	if typed, ok := client.(*Client); ok {
		return typed
	}
	if typed, ok := client.(*WSClient); ok {
		return typed.Client
	}
	panic("AsClient: unsupported client implementation")
}
