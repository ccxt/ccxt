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
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// WSClient is a thin wrapper around a single ws:// or wss:// connection.
// Subscriptions are identified by an arbitrary hash string (often equal to the
// messageHash used in the JS/C# layers).  Each Subscribe call returns a
// receive-only channel that the caller reads updates from.

type WSClient struct {
	client *Client
	url string

	conn *websocket.Conn
	mu   sync.Mutex // protects conn writes

	subsMu         sync.RWMutex
	subscriptions  map[string]chan interface{}
	readLoopClosed chan struct{}
}

// NewWSClient dials the given URL and starts the read-loop.
func NewWSClient(url interface{}, headers interface{}) (*WSClient, error) {
	d := websocket.Dialer{
		Proxy:             http.ProxyFromEnvironment,
		HandshakeTimeout:  10 * time.Second,
		EnableCompression: true,
	}

	conn, _, err := d.Dial(url.(string), headers.(http.Header))
	if err != nil {
		return nil, err
	}

	c := &WSClient{
		url:            url.(string),
		conn:           conn,
		subscriptions:  make(map[string]chan interface{}),
		readLoopClosed: make(chan struct{}),
	}

	go c.readLoop()
	return c, nil
}

// Subscribe sends the payload over the wire and returns a channel that will
// receive messages tagged with the given subHash by the higher-level handler.
func (c *WSClient) Subscribe(subHash interface{}, payload interface{}) (<-chan interface{}, error) {
	c.subsMu.Lock()
	defer c.subsMu.Unlock()
	if _, exists := c.subscriptions[subHash.(string)]; exists {
		return nil, fmt.Errorf("subscription %s already exists", subHash.(string))
	}

	if err := c.Send(payload); err != nil {
		return nil, err
	}

	ch := make(chan interface{}, 1024) // buffered to decouple producer
	c.subscriptions[subHash.(string)] = ch
	return ch, nil
}

// Unsubscribe closes and deletes the subscription, optionally sending a WS
// message to the server (payload may be nil).
func (c *WSClient) Unsubscribe(subHash interface{}, payload interface{}) error {
	if payload != nil {
		if err := c.Send(payload); err != nil {
			return err
		}
	}
	c.subsMu.Lock()
	if ch, ok := c.subscriptions[subHash.(string)]; ok {
		close(ch)
		delete(c.subscriptions, subHash.(string))
	}
	c.subsMu.Unlock()
	return nil
}

// Send encodes v as JSON and writes it to the socket.
func (c *WSClient) Send(v interface{}) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.conn == nil {
		return errors.New("websocket connection closed")
	}
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(v); err != nil {
		return err
	}
	return c.conn.WriteMessage(websocket.TextMessage, buf.Bytes())
}

// readLoop pumps frames from the socket and broadcasts them to all
// subscription channels.  Higher-level code is responsible for inspecting the
// raw JSON and routing it further (or closing the sub).
func (c *WSClient) readLoop() {
	defer close(c.readLoopClosed)

	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			// propagate error to all subs and exit
			c.subsMu.Lock()
			for _, ch := range c.subscriptions {
				ch <- err
				close(ch)
			}
			c.subscriptions = nil
			c.subsMu.Unlock()
			return
		}

		// deliver raw bytes so exchange-specific decoder can inspect quickly
		var msg interface{}
		if err := json.Unmarshal(data, &msg); err != nil {
			msg = err // forward decoding error for diagnosis
		}

		c.subsMu.RLock()
		for _, ch := range c.subscriptions {
			select {
			case ch <- msg:
			default:
				// drop if receiver is slow; could implement back-pressure
			}
		}
		c.subsMu.RUnlock()
	}
}

// Close shuts down the socket and all subscription channels.
func (c *WSClient) Close() error {
	c.mu.Lock()
	if c.conn != nil {
		_ = c.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
		_ = c.conn.Close()
		c.conn = nil
	}
	c.mu.Unlock()

	<-c.readLoopClosed // wait for graceful exit

	c.subsMu.Lock()
	for _, ch := range c.subscriptions {
		close(ch)
	}
	c.subscriptions = nil
	c.subsMu.Unlock()
	return nil
}

// Resolve delivers result to every listener of messageHash.
func (c *WSClient) Resolve(result interface{}, messageHash interface{}) {
	// Normalise the hash to string – generated code always passes a string.
	hash, ok := messageHash.(string)
	if !ok {
		return // or panic/log if that should never happen
	}

	if ch, exists := c.subscriptions[hash]; exists {
		// non-blocking send; drop if receiver is slow or gone
		select {
		case ch <- result:
		default:
		}
	}
}
