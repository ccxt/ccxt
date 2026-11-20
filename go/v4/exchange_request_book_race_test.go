package ccxt

import (
	"sync"
	"testing"
)

// Parallel fetches on one exchange (e.g. Derive's paginated loadMarkets) record their
// request/response bookkeeping from different goroutines. Those fields and the request
// id / nonce counters are guarded by requestBookMu; without it -race flags the writes
// in handOffRequestBook and the reads in readRequestBook.
func TestRequestBookConcurrentWriteRead(t *testing.T) {
	ex := &BaseExchange{Options: map[string]any{}}
	var wg sync.WaitGroup
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			for n := 0; n < 200; n++ {
				ex.SetLastRestRequestTimestamp()
				ex.SetLastRequest(map[string]any{"headers": map[string]any{"n": i}, "body": n, "url": "u"})
				ex.handOffRequestBook(requestBookOp{kind: requestBookResponse, headers: map[string]any{"n": n}})
				ex.handOffRequestBook(requestBookOp{kind: requestBookReset})
				_ = ex.GetLast_request_headers()
				_ = ex.GetLast_response_headers()
				_ = ex.GetLast_request_url()
				_ = ex.GetLast_http_response()
				_ = ex.NextRequestId("requestId")
				_ = ex.nextNonce(int64(n))
			}
		}(i)
	}
	wg.Wait()
}

// Mock-mode sends append to MockSentMessages from SendAsync's goroutine while the test
// harness reads the recorded frames; both sides go through mockSentMu.
func TestClientMockSentConcurrentAppendRead(t *testing.T) {
	client := NewClient("wss://example.invalid", nil, nil, nil, nil)
	client.IsMock = true
	var wg sync.WaitGroup
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			for n := 0; n < 50; n++ {
				<-client.SendAsync(map[string]any{"op": "subscribe", "i": i, "n": n})
				_ = client.MockSent()
			}
		}(i)
	}
	wg.Wait()
	if got := len(client.MockSent()); got != 400 {
		t.Fatalf("expected 400 recorded frames, got %d", got)
	}
}
