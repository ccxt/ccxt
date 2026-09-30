package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
)

var (
	addr          = flag.String("port", ":8080", "http service address")
	rate          = flag.Int("rate", 1000, "messages per second")
	simulateError = flag.String("simulate-error", "", "simulate connection error after X seconds: 'close', 'network-error', or 'network-drop'")
	errorDelay    = flag.Int("error-delay", 10, "delay in seconds before simulating the error")
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type client struct {
	conn          *websocket.Conn
	simulateError string
	errorDelay    int
	connectedAt   time.Time
	symbols       []string   // Store subscribed symbols for this client
	writeMu       sync.Mutex // Protect concurrent writes to the WebSocket connection
}

func (c *client) shouldSimulateError() bool {
	if c.simulateError == "" {
		return false
	}
	return time.Since(c.connectedAt) >= time.Duration(c.errorDelay)*time.Second
}

func (c *client) simulateConnectionError() {
	switch c.simulateError {
	case "close":
		log.Printf("Simulating graceful close for client")
		c.writeMu.Lock()
		c.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "simulated close"))
		c.writeMu.Unlock()
		c.conn.Close()
	case "network-error":
		log.Printf("Simulating network error for client")
		// Close the underlying connection abruptly
		if tcpConn, ok := c.conn.UnderlyingConn().(*net.TCPConn); ok {
			tcpConn.SetLinger(0) // Don't wait to send remaining data
		}
		c.conn.Close()
	case "network-drop":
		log.Printf("Simulating network drop for client - stopping message transmission")
		// Don't close the connection, just stop sending messages
		// This is handled in the broadcast loop
	}
}

// SubscriptionMessage represents a subscription request
type SubscriptionMessage struct {
	Method string   `json:"method"`
	Params []string `json:"params"`
	ID     int      `json:"id"`
}

// extractSymbolsFromMessage extracts symbols from subscription messages
func extractSymbolsFromMessage(message string) []string {
	var subMsg SubscriptionMessage
	if err := json.Unmarshal([]byte(message), &subMsg); err != nil {
		log.Printf("Failed to parse subscription message: %v", err)
		return nil
	}

	if subMsg.Method != "SUBSCRIBE" {
		return nil
	}

	var symbols []string
	for _, param := range subMsg.Params {
		// Extract symbol from params like "btcusdt@ticker"
		if strings.Contains(param, "@") {
			parts := strings.Split(param, "@")
			if len(parts) > 0 {
				symbol := strings.ToUpper(parts[0])
				symbols = append(symbols, symbol)
				log.Printf("Extracted symbol: %s from param: %s", symbol, param)
			}
		}
	}

	return symbols
}

func main() {
	flag.Parse()

	// Validate simulate-error flag
	if *simulateError != "" && *simulateError != "close" && *simulateError != "network-error" && *simulateError != "network-drop" {
		log.Fatalf("Invalid simulate-error value: %s. Must be 'close', 'network-error', or 'network-drop'", *simulateError)
	}

	clients := make(map[*client]struct{})
	clientsMu := sync.Mutex{}

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)

	// Accept WebSocket connections on any path
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("New connection request from %s on path: %s", r.RemoteAddr, r.URL.Path)
		log.Printf("Full URL: %s", r.URL.String())

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			// If not a websocket upgrade, return 404
			log.Printf("WebSocket upgrade failed: %v", err)
			w.WriteHeader(http.StatusNotFound)
			return
		}
		c := &client{conn: conn, simulateError: *simulateError, errorDelay: *errorDelay, connectedAt: time.Now()}
		clientsMu.Lock()
		clients[c] = struct{}{}
		clientsMu.Unlock()
		log.Printf("Client connected successfully on path: %s", r.URL.Path)

		go func() {
			defer func() {
				clientsMu.Lock()
				delete(clients, c)
				clientsMu.Unlock()
				conn.Close()
				log.Println("Client disconnected")
			}()
			for {
				messageType, message, err := conn.ReadMessage()
				if err != nil {
					log.Printf("Read error from client: %v", err)
					break
				}
				log.Printf("Received message from client on %s - Type: %d, Message: %s", r.URL.Path, messageType, string(message))

				// Extract symbols from subscription messages
				if messageType == websocket.TextMessage {
					symbols := extractSymbolsFromMessage(string(message))
					if len(symbols) > 0 {
						clientsMu.Lock()
						c.symbols = append(c.symbols, symbols...)
						clientsMu.Unlock()
						log.Printf("Client subscribed to symbols: %v", symbols)

						// Send subscription confirmation
						response := fmt.Sprintf(`{"result":null,"id":1}`)
						c.writeMu.Lock()
						if err := conn.WriteMessage(websocket.TextMessage, []byte(response)); err != nil {
							log.Printf("Failed to send subscription confirmation: %v", err)
						}
						c.writeMu.Unlock()
					}
				}
			}
		}()
	})

	// Pre-generate the static part of the message template
	staticMsgTemplate := `{"e":"24hrTicker","s":"%s","p":"-0.00004000","P":"-0.209","w":"0.01920495","x":"0.01916500","c":"0.01912500","Q":"0.10400000","b":"0.01912200","B":"4.10400000","a":"0.01912500","A":"0.00100000","o":"0.01916500","h":"0.01956500","l":"0.01887700","v":"173518.11900000","q":"3332.40703994","O":1579399197842,"C":1579485597842,"F":158251292,"L":158414513,"n":163222}`

	// Broadcast goroutine
	go func() {
		interval := time.Second / time.Duration(*rate)
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		var msgID uint64 = 0
		for {
			select {
			case <-ticker.C:
				msgID++
				clientsMu.Lock()
				for c := range clients {
					if c.shouldSimulateError() {
						if c.simulateError == "network-drop" {
							// For network-drop, just skip sending messages but keep connection
							continue
						}
						c.simulateConnectionError()
						delete(clients, c)
						continue
					}

					// Send message for each subscribed symbol
					for _, symbol := range c.symbols {
						msg := fmt.Sprintf(`{"e":"24hrTicker","E":%d,"id":%d,%s`, time.Now().UnixNano(), msgID, fmt.Sprintf(staticMsgTemplate, symbol)[1:])
						c.conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
						c.writeMu.Lock()
						if err := c.conn.WriteMessage(websocket.TextMessage, []byte(msg)); err != nil {
							log.Println("Write error:", err)
							c.conn.Close()
							delete(clients, c)
							c.writeMu.Unlock()
							break
						}
						c.writeMu.Unlock()
					}
				}
				clientsMu.Unlock()
			}
		}
	}()

	server := &http.Server{Addr: *addr}
	go func() {
		log.Printf("WebSocket server started on %s, broadcasting %d msg/sec\n", *addr, *rate)
		if *simulateError != "" {
			log.Printf("Error simulation enabled: %s after %d seconds", *simulateError, *errorDelay)
		}
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe: %v", err)
		}
	}()

	<-interrupt
	log.Println("Shutting down server...")
	server.Close()
}
