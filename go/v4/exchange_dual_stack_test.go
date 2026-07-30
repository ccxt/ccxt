package ccxt

import (
	"context"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// newTestExchange builds a base exchange the same way generated exchange
// constructors do (InitParent wires up the HTTP client transport).
func newTestExchange() *Exchange {
	ex := &Exchange{}
	ex.InitParent(map[string]any{}, ex.Describe().(map[string]any), ex)
	return ex
}

// The base exchange HTTP client must use an explicit dual-stack transport
// (DialContext set, dialing network "tcp") instead of a bare &http.Transport{}.
func TestDualStackHTTPClientTransport(t *testing.T) {
	ex := newTestExchange()
	if ex.httpClient == nil {
		t.Fatal("httpClient must be initialized")
	}
	tr, ok := ex.httpClient.Transport.(*http.Transport)
	if !ok {
		t.Fatalf("expected *http.Transport, got %T", ex.httpClient.Transport)
	}
	if tr.DialContext == nil {
		t.Fatal("base httpClient transport must set DialContext (dual-stack)")
	}
}

// The dual-stack dialer must use the most aggressive Fast Fallback setting:
// the smallest positive duration (1ns). Zero would mean the 300ms default and
// a negative value would disable Happy Eyeballs fast fallback altogether.
func TestDualStackDialerFallbackDelay(t *testing.T) {
	d := newDualStackDialer()
	if d.FallbackDelay != time.Nanosecond {
		t.Fatalf("expected FallbackDelay == 1ns, got %v", d.FallbackDelay)
	}
	if d.FallbackDelay <= 0 {
		t.Fatal("FallbackDelay must be positive (negative disables fast fallback, zero means 300ms)")
	}
}

// newDualStackTransport must actually dial with network "tcp" (dual-stack,
// Happy Eyeballs). Prove it against a real local listener.
func TestDualStackTransportDialsTCP(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	defer ln.Close()
	go func() {
		for {
			c, err := ln.Accept()
			if err != nil {
				return
			}
			c.Close()
		}
	}()

	tr := newDualStackTransport()
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	conn, err := tr.DialContext(ctx, "tcp", ln.Addr().String())
	if err != nil {
		t.Fatalf("dual-stack transport failed to dial tcp: %v", err)
	}
	conn.Close()
}

// When IPv6 loopback is available, the same transport must reach an
// IPv6-only listener using network "tcp" (i.e. it is not IPv4-only).
func TestDualStackTransportDialsIPv6Loopback(t *testing.T) {
	ln, err := net.Listen("tcp", "[::1]:0")
	if err != nil {
		t.Skipf("IPv6 loopback not available: %v", err)
	}
	defer ln.Close()
	go func() {
		for {
			c, err := ln.Accept()
			if err != nil {
				return
			}
			c.Close()
		}
	}()

	tr := newDualStackTransport()
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	conn, err := tr.DialContext(ctx, "tcp", ln.Addr().String())
	if err != nil {
		t.Fatalf("dual-stack transport failed to dial IPv6 loopback over tcp: %v", err)
	}
	if _, ok := conn.LocalAddr().(*net.TCPAddr); !ok {
		t.Fatalf("expected TCP connection, got %T", conn.LocalAddr())
	}
	conn.Close()
}

// Proxy transports built by SetProxyAgents must keep the dual-stack dialer on
// the HTTP/HTTPS branches; the SOCKS branch keeps its custom SOCKS5 dial
// (created with network "tcp", never "tcp4").
func TestDualStackProxyTransports(t *testing.T) {
	ex := newTestExchange()

	for name, args := range map[string][3]any{
		"http":  {"http://127.0.0.1:8888", "", ""},
		"https": {"", "http://127.0.0.1:8888", ""},
	} {
		trAny, err := ex.SetProxyAgents(args[0], args[1], args[2])
		if err != nil {
			t.Fatalf("%s proxy: %v", name, err)
		}
		tr, ok := trAny.(*http.Transport)
		if !ok {
			t.Fatalf("%s proxy: expected *http.Transport, got %T", name, trAny)
		}
		if tr.DialContext == nil {
			t.Fatalf("%s proxy transport must set DialContext (dual-stack)", name)
		}
		if tr.Proxy == nil {
			t.Fatalf("%s proxy transport must keep its Proxy func", name)
		}
	}

	// SOCKS branch: custom dialer is preserved and no tcp4 sneaks in
	trAny, err := ex.SetProxyAgents("", "", "socks5://127.0.0.1:1080")
	if err != nil {
		t.Fatalf("socks proxy: %v", err)
	}
	socksTr, ok := trAny.(*http.Transport)
	if !ok {
		t.Fatalf("socks proxy: expected *http.Transport, got %T", trAny)
	}
	if socksTr.Dial == nil && socksTr.DialContext == nil {
		t.Fatal("socks proxy transport must keep its SOCKS5 dialer")
	}
}

// The WebSocket dialer must set NetDialContext so WS connections are
// dual-stack too, and it must be able to dial network "tcp".
func TestDualStackWSDialer(t *testing.T) {
	d := newWSDialer(nil)
	if d.NetDialContext == nil && d.NetDial == nil {
		t.Fatal("WS dialer must set NetDialContext/NetDial for dual-stack dialing")
	}

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	defer ln.Close()
	go func() {
		for {
			c, err := ln.Accept()
			if err != nil {
				return
			}
			c.Close()
		}
	}()

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	conn, err := d.NetDialContext(ctx, "tcp", ln.Addr().String())
	if err != nil {
		t.Fatalf("WS dual-stack dialer failed to dial tcp: %v", err)
	}
	conn.Close()
}

// Regression guard: no Go source file in this package may force a single-stack
// network ("tcp4"/"tcp6"). All dialing must use "tcp".
func TestDualStackNoSingleStackNetworks(t *testing.T) {
	files, err := filepath.Glob("*.go")
	if err != nil {
		t.Fatalf("glob: %v", err)
	}
	for _, f := range files {
		if strings.HasSuffix(f, "_test.go") {
			continue // test files may mention the literals
		}
		data, err := os.ReadFile(f)
		if err != nil {
			t.Fatalf("read %s: %v", f, err)
		}
		for _, banned := range []string{`"tcp4"`, `"tcp6"`} {
			if strings.Contains(string(data), banned) {
				t.Errorf("%s uses single-stack network %s; dial with \"tcp\" for dual-stack", f, banned)
			}
		}
	}
}
