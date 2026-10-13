package ccxt

import (
	"testing"
)

// With DecompressBinary off, a binary frame reaches the exchange as []byte even
// when its bytes happen to be valid utf-8: an SBE heartbeat is mostly small
// integers, so before text frames were told apart by type it came through as a
// string and the exchange could not decode it.
func TestOnMessageKeepsUtf8ValidBinaryFramesAsBytes(t *testing.T) {
	var received any
	client := NewClient("wss://example.invalid", func(client any, message any) { received = message }, nil, nil, nil)
	client.DecompressBinary = false
	frame := []byte{0x10, 0x00, 0x28, 0x00, 0x01, 0x00, 0x02, 0x00, 0x41, 0x42, 0x43, 0x01, 0x02, 0x03, 0x04, 0x05}
	client.OnMessage(frame)
	got, ok := received.([]byte)
	if !ok {
		t.Fatalf("expected []byte, got %T: %v", received, received)
	}
	if string(got) != string(frame) {
		t.Fatalf("frame bytes changed: %x", got)
	}
}

// A JSON payload is still parsed whichever frame type carried it.
func TestOnMessageParsesJsonFromTextAndBinaryFrames(t *testing.T) {
	for _, frame := range []any{`{"result":{"ok":true}}`, []byte(`{"result":{"ok":true}}`)} {
		var received any
		client := NewClient("wss://example.invalid", func(client any, message any) { received = message }, nil, nil, nil)
		client.DecompressBinary = false
		client.OnMessage(frame)
		if _, ok := received.(map[string]any); !ok {
			t.Fatalf("expected a parsed map for %T, got %T: %v", frame, received, received)
		}
	}
}
