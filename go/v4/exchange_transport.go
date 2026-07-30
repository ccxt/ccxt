package ccxt

// Dual-stack (IPv4 + IPv6) networking helpers for the hand-written Go base.
//
// Every HTTP transport and WebSocket dialer constructed by the base exchange
// must dial with network "tcp" so that Go's Happy Eyeballs (RFC 8305)
// implementation can race IPv4 and IPv6 and pick whichever works. Hard-coding
// a single-stack network like tcp4 (or leaving dialing to components that do)
// breaks IPv6-only hosts, so these helpers centralize the dialer/transport
// construction in one place.

import (
	"net"
	"net/http"
	"time"
)

// newDualStackDialer returns a *net.Dialer whose Dial/DialContext methods are
// intended to be called with network "tcp" (the http.Transport and
// websocket.Dialer defaults), which dials dual-stack via Happy Eyeballs.
// The deprecated net.Dialer.DualStack field is intentionally not set: since
// Go 1.20 dual-stack is always enabled when dialing "tcp".
func newDualStackDialer() *net.Dialer {
	return &net.Dialer{
		Timeout:   30 * time.Second,
		KeepAlive: 30 * time.Second,
	}
}

// newDualStackTransport returns an *http.Transport with an explicit
// dual-stack DialContext. Never dial with a single-stack network such as
// tcp4 — always use "tcp".
func newDualStackTransport() *http.Transport {
	return &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		// network "tcp" → dual-stack Happy Eyeballs
		DialContext:           newDualStackDialer().DialContext,
		ForceAttemptHTTP2:     false, // keep HTTP/1.1 semantics of the previous bare Transport
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}
}
