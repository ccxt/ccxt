package ccxt

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	coderws "github.com/coder/websocket"
)

func TestWSCompressionOption(t *testing.T) {
	cases := []struct {
		name    string
		options map[string]any
		want    bool
	}{
		{"unset keeps the default transport", nil, false},
		{"empty options", map[string]any{}, false},
		{"bool true", map[string]any{"compress": true}, true},
		{"bool false", map[string]any{"compress": false}, false},
		{"int width", map[string]any{"compress": 15}, true},
		{"zero width", map[string]any{"compress": 0}, false},
		{"float width", map[string]any{"compress": 15.0}, true},
		{"nested ws map", map[string]any{"ws": map[string]any{"compress": true}}, true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			client := &WSClient{Options: tc.options}
			if got := client.compressionEnabled(); got != tc.want {
				t.Fatalf("compressionEnabled() = %v, want %v", got, tc.want)
			}
		})
	}
}

// compressionTestServer rejects handshakes that do not offer permessage-deflate,
// exactly like nado's subscription gateway, and echoes data frames back.
func compressionTestServer(t *testing.T, offered chan<- string) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		extension := r.Header.Get("Sec-WebSocket-Extensions")
		if !strings.Contains(strings.ToLower(extension), "permessage-deflate") {
			http.Error(w, `{"reason":"Invalid compression headers: 'Sec-WebSocket-Extensions' must include 'permessage-deflate'"}`, http.StatusForbidden)
			return
		}
		if offered != nil {
			select {
			case offered <- extension:
			default:
			}
		}
		conn, err := coderws.Accept(w, r, &coderws.AcceptOptions{CompressionMode: coderws.CompressionContextTakeover})
		if err != nil {
			return
		}
		defer conn.CloseNow()
		for {
			messageType, data, err := conn.Read(context.Background())
			if err != nil {
				return
			}
			if err := conn.Write(context.Background(), messageType, data); err != nil {
				return
			}
		}
	}))
}

func TestCompressedTransportNegotiatesBarePerMessageDeflate(t *testing.T) {
	offered := make(chan string, 1)
	server := compressionTestServer(t, offered)
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")
	messages := make(chan any, 1)
	noop := func(_ any, _ any) {}
	client := NewWSClient(wsURL, func(_ any, message any) {
		messages <- message
	}, noop, noop, noop, "")
	client.Options = map[string]any{"compress": true}
	if err := client.CreateConnection(); err != nil {
		t.Fatalf("CreateConnection() with compress=true: %v", err)
	}
	defer client.Close()

	select {
	case extension := <-offered:
		if !strings.Contains(strings.ToLower(extension), "permessage-deflate") {
			t.Fatalf("handshake extension = %q, want permessage-deflate", extension)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("server never saw the handshake")
	}

	if _, err := client.writeText("hello"); err != nil {
		t.Fatalf("writeText: %v", err)
	}
	select {
	case message := <-messages:
		if message != "hello" {
			t.Fatalf("echo = %v, want the sent frame", message)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("no echoed frame through the compressed transport")
	}
}

func TestCompressionStaysOffByDefault(t *testing.T) {
	server := compressionTestServer(t, nil)
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")
	noop := func(_ any, _ any) {}
	client := NewWSClient(wsURL, noop, noop, noop, noop, "")
	if err := client.CreateConnection(); err == nil {
		client.Close()
		t.Fatal("default transport negotiated a gateway that requires permessage-deflate")
	}
	client.ClearConnectionTimeout()
}
