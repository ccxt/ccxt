package ccxt

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

// Header values produced by a transpiled sign() can be *string (SafeString returns a pointer),
// e.g. ndax's "APToken": sessionToken. FetchAsync must send the string, not the pointer address.
func TestFetchAsyncDereferencesPointerHeaders(t *testing.T) {
	received := make(chan string, 1)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		received <- r.Header.Get("APToken")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"result":true}`))
	}))
	defer server.Close()

	exchange := NewNdax(map[string]any{
		"apiKey":   "key",
		"secret":   "secret",
		"uid":      "1",
		"login":    "login",
		"password": "password",
		"urls": map[string]any{
			"api": map[string]any{
				"public":  server.URL,
				"private": server.URL,
			},
		},
		"options": map[string]any{
			"sessionToken": "my-session-token",
		},
	})

	signed := exchange.Sign("GetAccountInfo", "private", "GET", map[string]any{}).(map[string]any)
	headers := signed["headers"].(map[string]any)
	if _, isPointer := headers["APToken"].(*string); !isPointer {
		t.Fatalf("expected the transpiled Sign to put a *string in APToken, got %T", headers["APToken"])
	}

	result := <-exchange.FetchAsync(signed["url"], signed["method"], headers, signed["body"])
	if result.Error != nil {
		t.Fatalf("FetchAsync failed: %v", result.Error)
	}

	got := <-received
	if got != "my-session-token" {
		t.Fatalf("APToken header sent as %q, want %q", got, "my-session-token")
	}
}
