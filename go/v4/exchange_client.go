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
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Client is a thin wrapper around a single ws:// or wss:// connection.
// Subscriptions are identified by an arbitrary hash string
// Each Subscribe call returns a receive-only channel that the caller reads updates from.
type Client struct {
	Futures       map[string]Future
	Url string

	Conn *websocket.Conn
	Mu   sync.Mutex // protects conn writes

	SubsMu         sync.RWMutex
	Subscriptions  map[string]chan interface{}
	ReadLoopClosed chan struct{}

	Err error // last error, nil if connection considered healthy

	Connected chan struct{} // closed once the websocket handshake succeeds
    Disconnected interface{}
    Rejections map[string]interface{}
    KeepAlive interface{}
    Connection interface{}
    ConnectionTimeout interface{}
    Verbose interface{}
    ConnectionTimer interface{}
    LastPong interface{}
    MaxPingPongMisses interface{}
    PingInterval interface{}
    ConnectionEstablished interface{}
    Gunzip interface{}
    Inflate interface{}
    IsConnected interface{}
    OnConnectedCallback interface{}
    OnMessageCallback interface{}
    OnErrorCallback interface{}
    OnCloseCallback interface{}
    Ping interface{}
    Throttle interface{}
    Owner interface{} // pointer to the exchange that created the client
}

func (c *Client) Resolve(data interface{}, subHash interface{}) {
	hash, ok := subHash.(string)
	if !ok {
		panic(fmt.Sprintf("subHash must be a string, got %T: %v", subHash, subHash))
	}
	
	if ch, exists := c.Subscriptions[hash]; exists {  // checks if the Client.Subscriptions map has a channel for that hash
		select {
		case ch <- data:	// Try to deliver the snapshot immediately
		default:			// if the channel buffer is full (no receiver ready yet) 
			// fall back to a goroutine so the send will eventually succeed without dropping the message
			go func(d interface{}) { ch <- d }(data)
		}
	}
	
	// Send to Future channel for ongoing updates (non-blocking)
	if fut, exists := c.Futures[hash]; exists {
		fut.ResolveOngoing(data)
	}
}

func (c *Client) Future(hash interface{}) Future {
    key := hash.(string)
    if fut, ok := c.Futures[key]; ok { 
        return fut 
    }

    fut := NewFuture()
    c.Futures[key] = fut
    if err, ok := c.Rejections[key]; ok {
        fut.Reject(err)
        delete(c.Rejections, key)
    }
    return fut
}

// Reject rejects specific future or all
func (c *Client) Reject(err interface{}, messageHash ...interface{}) {
	if len(messageHash) == 0 {
		for hash := range c.Futures {
			c.Futures[hash].Reject(err)
			delete(c.Futures, hash)
		}
		return
	}
	hash := messageHash[0]
	if fut, ok := c.Futures[hash.(string)]; ok {
		fut.Reject(err)
		delete(c.Futures, hash.(string))
	}
}

// Close terminates the underlying websocket connection (if any)
func (c *Client) Close() error {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	if c.Conn != nil {
		err := c.Conn.Close()
		c.Conn = nil
		return err
	}
	return nil
}

// NewClient dials the given WebSocket URL and returns an initialised Client
// A minimal read-loop is started to keep the connection alive and dispatch incoming messages (future work)
// For now messages are ignored until higher level code wires Resolve/Reject logic.
func NewClient(urlStr interface{}, headers interface{}) (*Client, error) {
	dialer := websocket.DefaultDialer
	// headers may be nil – a direct type assertion on a nil interface panics.
	var hdr http.Header
	if h, ok := headers.(http.Header); ok {
	    hdr = h
	}
	conn, _, err := dialer.Dial(urlStr.(string), hdr)
	if err != nil {
		return nil, err
	}

	c := &Client{
		Url:            urlStr.(string),
		Conn:           conn,
		Futures:        make(map[string]Future),
		Subscriptions:  make(map[string]chan interface{}),
		ReadLoopClosed: make(chan struct{}),
		Connected:      make(chan struct{}),
	}

	// mark as connected immediately – in future could wait for hello/ack
	close(c.Connected)

	go c.readLoop()
	return c, nil
}

// Send writes the payload and returns a channel that yields an error (nil on success).
func (c *Client) Send(message interface{}) <-chan interface{} {
	ch := make(chan interface{}, 1)

	go func() {
		c.Mu.Lock()
		defer c.Mu.Unlock()

		var err error
		if c.Conn == nil {
			err = fmt.Errorf("websocket connection closed")
		} else {
			switch v := message.(type) {
			case []byte:
				err = c.Conn.WriteMessage(websocket.BinaryMessage, v)
			default:
				err = c.Conn.WriteJSON(v)
			}
		}
		ch <- err
		close(ch)
	}()

	return ch
}

func (c *Client) readLoop() {
	defer close(c.ReadLoopClosed)
	for {
		if c.Conn == nil {
			return
		}
		_, data, err := c.Conn.ReadMessage()
		if err != nil {
			c.Err = err
			_ = c.Close()
			return
		}

		// forward decoded JSON frames to exchange.HandleMessage
		if c.Owner != nil {
			var msg interface{}
			if err := json.Unmarshal(data, &msg); err == nil {
				if h, ok := c.Owner.(interface{ HandleMessage(client interface{}, message interface{}) }); ok {
					h.HandleMessage(c, msg)
				}
			}
		}
	}
}

// updates the LastPong timestamp and optionally logs the event when the client is running in verbose mode
func (c *Client) OnPong() {
	c.LastPong = time.Now().UnixMilli()
	if v, ok := c.Verbose.(bool); ok && v {
		log.Println(time.Now(), "onPong")
	}
}

func (c *Client) Reset(err interface{}) {
	// Stop any active timers/intervals
	if t, ok := c.ConnectionTimer.(*time.Timer); ok {
		t.Stop()
	}
	if tk, ok := c.PingInterval.(*time.Ticker); ok {
		tk.Stop()
	}
	// Clear error and close connection
	_ = c.Close()
	// Reject all pending futures with provided error (or generic)
	if err == nil {
		err = "connection reset"
	}
	c.Reject(err)
}

type wsMessageHandler interface {
    HandleMessage(client *Client, msg interface{})
}
