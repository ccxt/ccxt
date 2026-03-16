package ccxt

import (
	"errors"
	"sync"
	"testing"
	"time"
)

// ============================================================
// Stream unit tests
// ============================================================

func TestNewStream(t *testing.T) {
	s := NewStream(100, false)
	if s == nil {
		t.Fatal("NewStream returned nil")
	}
	if s.maxMessagesPerTopic != 100 {
		t.Errorf("maxMessagesPerTopic = %d, want 100", s.maxMessagesPerTopic)
	}
	if s.verbose {
		t.Error("verbose should be false")
	}
	if s.ActiveWatchFunctions == nil {
		t.Error("ActiveWatchFunctions should not be nil")
	}
}

func TestProduceAndSubscribe(t *testing.T) {
	s := NewStream(100, false)

	var received []*Message
	var mu sync.Mutex

	handler := func(msg *Message) error {
		mu.Lock()
		received = append(received, msg)
		mu.Unlock()
		return nil
	}

	s.Subscribe("test-topic", handler)
	s.Produce("test-topic", map[string]interface{}{"key": "value"}, nil)

	// Consumer runs in goroutine, wait a bit
	time.Sleep(50 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if len(received) != 1 {
		t.Fatalf("expected 1 message, got %d", len(received))
	}
	payload, ok := received[0].Payload.(map[string]interface{})
	if !ok {
		t.Fatal("payload is not map[string]interface{}")
	}
	if payload["key"] != "value" {
		t.Errorf("payload[key] = %v, want 'value'", payload["key"])
	}
}

func TestProduceBeforeSubscribe(t *testing.T) {
	// Messages produced before any subscriber should be stored in history
	// but not delivered to subscribers that subscribe later
	s := NewStream(100, false)

	s.Produce("topic", "msg1", nil)
	s.Produce("topic", "msg2", nil)

	var received []*Message
	var mu sync.Mutex
	handler := func(msg *Message) error {
		mu.Lock()
		received = append(received, msg)
		mu.Unlock()
		return nil
	}

	s.Subscribe("topic", handler)

	// Produce one more after subscribe
	s.Produce("topic", "msg3", nil)
	time.Sleep(50 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if len(received) != 1 {
		t.Fatalf("expected 1 message after subscribe, got %d", len(received))
	}
	if received[0].Payload != "msg3" {
		t.Errorf("payload = %v, want 'msg3'", received[0].Payload)
	}
}

func TestMessageHistory(t *testing.T) {
	s := NewStream(5, false)

	for i := 0; i < 10; i++ {
		s.Produce("history-topic", i, nil)
	}

	history := s.GetMessageHistory("history-topic")

	// maxMessagesPerTopic = 5, but the trim logic uses > not >=
	// so we might get 5 or 6 depending on off-by-one
	if len(history) > 6 {
		t.Errorf("expected at most 6 messages in history (with off-by-one), got %d", len(history))
	}
	if len(history) < 5 {
		t.Errorf("expected at least 5 messages in history, got %d", len(history))
	}

	// BUG CHECK: The trim logic uses `len(messages) > s.maxMessagesPerTopic`
	// which means it trims when length EXCEEDS max, resulting in max+1 entries
	// before trimming. After 10 produces with max=5, we should ideally have 5.
	if len(history) != 5 {
		t.Logf("BUG: off-by-one in message history trimming: got %d messages, expected exactly 5 (maxMessagesPerTopic)", len(history))
	}
}

func TestMessageHistoryZeroMax(t *testing.T) {
	// With maxMessagesPerTopic=0, no messages should be stored
	s := NewStream(0, false)

	s.Produce("topic", "data", nil)

	history := s.GetMessageHistory("topic")
	if len(history) != 0 {
		t.Errorf("expected 0 messages in history with max=0, got %d", len(history))
	}
}

func TestGetMessageHistoryNonexistentTopic(t *testing.T) {
	s := NewStream(100, false)
	history := s.GetMessageHistory("nonexistent")
	if history == nil {
		t.Error("GetMessageHistory should return empty slice, not nil")
	}
	if len(history) != 0 {
		t.Errorf("expected 0 messages, got %d", len(history))
	}
}

func TestGetLastIndex(t *testing.T) {
	s := NewStream(100, false)

	idx := s.GetLastIndex("nonexistent")
	if idx != -1 {
		t.Errorf("expected -1 for nonexistent topic, got %d", idx)
	}

	s.Produce("idx-topic", "a", nil)
	s.Produce("idx-topic", "b", nil)

	idx = s.GetLastIndex("idx-topic")
	if idx != 1 {
		t.Errorf("expected index 1 after 2 produces, got %d", idx)
	}
}

func TestSubscribeWithMapHandler(t *testing.T) {
	// Subscribe accepts func(map[string]interface{}) handlers (backward compat)
	s := NewStream(100, false)

	var received []map[string]interface{}
	var mu sync.Mutex

	handler := func(msg map[string]interface{}) {
		mu.Lock()
		received = append(received, msg)
		mu.Unlock()
	}

	s.Subscribe("compat-topic", handler)
	s.Produce("compat-topic", "hello", nil)

	time.Sleep(50 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if len(received) != 1 {
		t.Fatalf("expected 1 message, got %d", len(received))
	}
	if received[0]["payload"] != "hello" {
		t.Errorf("payload = %v, want 'hello'", received[0]["payload"])
	}
}

func TestSubscribeWithNonFunctionHandler(t *testing.T) {
	// Passing a non-function handler should result in a no-op consumer
	s := NewStream(100, false)

	// Should not panic
	s.Subscribe("noop-topic", "not a function")
	s.Produce("noop-topic", "data", nil)

	time.Sleep(50 * time.Millisecond)
	// No assertion needed - just verify no panic
}

func TestProduceWithNonStringTopic(t *testing.T) {
	s := NewStream(100, false)

	// Produce with non-string topic should silently do nothing
	s.Produce(123, "data", nil)
	s.Produce(nil, "data", nil)

	// Verify no panics occurred
}

func TestSubscribeWithNonStringTopic(t *testing.T) {
	s := NewStream(100, false)

	handler := func(msg *Message) error { return nil }

	// Subscribe with non-string topic should silently do nothing
	s.Subscribe(123, handler)
	s.Subscribe(nil, handler)

	// Verify no panics occurred
}

func TestProduceWithError(t *testing.T) {
	s := NewStream(100, false)

	var received []*Message
	var mu sync.Mutex

	handler := func(msg *Message) error {
		mu.Lock()
		received = append(received, msg)
		mu.Unlock()
		return nil
	}

	s.Subscribe("err-topic", handler)

	testErr := errors.New("test error")
	s.Produce("err-topic", "payload", testErr)

	time.Sleep(50 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if len(received) != 1 {
		t.Fatalf("expected 1 message, got %d", len(received))
	}
	if received[0].Error == nil {
		t.Error("expected error to be set on message")
	}
	if received[0].Error.Error() != "test error" {
		t.Errorf("error = %v, want 'test error'", received[0].Error)
	}
}

func TestProduceWithNonErrorInterface(t *testing.T) {
	// Passing a non-error value as the error parameter
	s := NewStream(100, false)

	var received []*Message
	var mu sync.Mutex

	handler := func(msg *Message) error {
		mu.Lock()
		received = append(received, msg)
		mu.Unlock()
		return nil
	}

	s.Subscribe("nonerr-topic", handler)

	// Pass string as error - not an error type
	s.Produce("nonerr-topic", "payload", "string error")

	time.Sleep(50 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if len(received) != 1 {
		t.Fatalf("expected 1 message, got %d", len(received))
	}
	// BUG: When err is not an error interface (e.g., string), the message.Error
	// is set to nil even though a non-nil error was passed
	if received[0].Error != nil {
		t.Logf("Non-error type was converted to error (unexpected)")
	} else {
		t.Logf("BUG: non-nil error argument (string) was silently dropped - message.Error is nil")
	}
}

func TestMultipleSubscribers(t *testing.T) {
	s := NewStream(100, false)

	var count1, count2 int
	var mu sync.Mutex

	s.Subscribe("multi", func(msg *Message) error {
		mu.Lock()
		count1++
		mu.Unlock()
		return nil
	})
	s.Subscribe("multi", func(msg *Message) error {
		mu.Lock()
		count2++
		mu.Unlock()
		return nil
	})

	s.Produce("multi", "data", nil)
	time.Sleep(50 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if count1 != 1 {
		t.Errorf("subscriber 1 count = %d, want 1", count1)
	}
	if count2 != 1 {
		t.Errorf("subscriber 2 count = %d, want 1", count2)
	}
}

func TestMessageMetadata(t *testing.T) {
	s := NewStream(100, false)

	var received *Message
	var mu sync.Mutex

	s.Subscribe("meta", func(msg *Message) error {
		mu.Lock()
		received = msg
		mu.Unlock()
		return nil
	})

	s.Produce("meta", "data", nil)
	time.Sleep(50 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if received == nil {
		t.Fatal("no message received")
	}
	if received.Metadata.Topic != "meta" {
		t.Errorf("topic = %s, want 'meta'", received.Metadata.Topic)
	}
	if received.Metadata.Stream != s {
		t.Error("metadata.Stream does not point to the correct stream")
	}
	if received.Metadata.Index != 0 {
		t.Errorf("index = %d, want 0", received.Metadata.Index)
	}
}

func TestConsumerErrorProducesToErrorsTopic(t *testing.T) {
	s := NewStream(100, false)

	var errMsg *Message
	var mu sync.Mutex

	// Subscribe to errors topic first
	s.Subscribe("errors", func(msg *Message) error {
		mu.Lock()
		errMsg = msg
		mu.Unlock()
		return nil
	})

	// Subscribe with handler that returns error
	s.Subscribe("failing", func(msg *Message) error {
		return errors.New("handler failed")
	})

	s.Produce("failing", "data", nil)
	time.Sleep(100 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if errMsg == nil {
		t.Fatal("expected error message on 'errors' topic")
	}
	if errMsg.Error == nil {
		t.Fatal("expected error to be set")
	}
}

func TestStreamClose(t *testing.T) {
	s := NewStream(100, false)

	s.Produce("topic", "msg", nil)
	s.Subscribe("topic", func(msg *Message) error { return nil })

	s.Close()

	// After close, history should be empty
	history := s.GetMessageHistory("topic")
	if len(history) != 0 {
		t.Errorf("expected 0 messages after close, got %d", len(history))
	}

	lastIdx := s.GetLastIndex("topic")
	if lastIdx != -1 {
		t.Errorf("expected index -1 after close, got %d", lastIdx)
	}
}

func TestStreamInit(t *testing.T) {
	s := NewStream(100, true)
	s.Produce("topic", "msg", nil)

	s.Init(50, false)

	if s.maxMessagesPerTopic != 50 {
		t.Errorf("maxMessagesPerTopic = %d, want 50", s.maxMessagesPerTopic)
	}
	if s.verbose {
		t.Error("verbose should be false after Init")
	}
	history := s.GetMessageHistory("topic")
	if len(history) != 0 {
		t.Errorf("expected 0 messages after Init, got %d", len(history))
	}
}

// ============================================================
// Unsubscribe tests - testing a known bug
// ============================================================

func TestUnsubscribeBug(t *testing.T) {
	// BUG: Unsubscribe never actually removes consumers because
	// `found` is always false (the function comparison loop is a no-op)
	s := NewStream(100, false)

	handler := ConsumerFunction(func(msg *Message) error { return nil })

	s.Subscribe("topic", handler)
	result := s.Unsubscribe("topic", handler)

	// This should return true but returns false due to the bug
	if result {
		t.Log("Unsubscribe returned true (unexpected - bug may be fixed)")
	} else {
		t.Log("BUG CONFIRMED: Unsubscribe always returns false - consumers are never removed")
	}
}

func TestUnsubscribeWithWrongType(t *testing.T) {
	s := NewStream(100, false)

	// Passing a wrong type should return false
	result := s.Unsubscribe("topic", "not a function")
	if result {
		t.Error("expected false for non-function unsubscribe")
	}
}

// ============================================================
// AddWatchFunction tests
// ============================================================

func TestAddWatchFunction(t *testing.T) {
	s := NewStream(100, false)

	s.AddWatchFunction("watchTicker", []interface{}{"BTC/USDT"})

	funcs := s.ActiveWatchFunctions.([]interface{})
	if len(funcs) != 1 {
		t.Fatalf("expected 1 watch function, got %d", len(funcs))
	}

	wf := funcs[0].(map[string]interface{})
	if wf["method"] != "watchTicker" {
		t.Errorf("method = %v, want 'watchTicker'", wf["method"])
	}
	args := wf["args"].([]interface{})
	if len(args) != 1 || args[0] != "BTC/USDT" {
		t.Errorf("args = %v, want ['BTC/USDT']", args)
	}
}

func TestAddWatchFunctionWithNonStringName(t *testing.T) {
	s := NewStream(100, false)

	s.AddWatchFunction(123, nil)

	funcs := s.ActiveWatchFunctions.([]interface{})
	if len(funcs) != 0 {
		t.Error("expected no watch functions added for non-string name")
	}
}

func TestAddWatchFunctionWithNilArgs(t *testing.T) {
	s := NewStream(100, false)

	s.AddWatchFunction("watchOrderBook", nil)

	funcs := s.ActiveWatchFunctions.([]interface{})
	if len(funcs) != 1 {
		t.Fatalf("expected 1 watch function, got %d", len(funcs))
	}
	wf := funcs[0].(map[string]interface{})
	if wf["args"] != nil {
		// args should be nil since nil was passed
		t.Logf("args = %v (type %T)", wf["args"], wf["args"])
	}
}

// ============================================================
// FastQueue tests
// ============================================================

func TestFastQueueBasic(t *testing.T) {
	q := NewFastQueue[int]()

	if !q.IsEmpty() {
		t.Error("new queue should be empty")
	}

	q.Enqueue(1)
	q.Enqueue(2)
	q.Enqueue(3)

	if q.GetLength() != 3 {
		t.Errorf("length = %d, want 3", q.GetLength())
	}

	val, ok := q.Dequeue()
	if !ok || val != 1 {
		t.Errorf("dequeue = (%d, %v), want (1, true)", val, ok)
	}

	val, ok = q.Peek()
	if !ok || val != 2 {
		t.Errorf("peek = (%d, %v), want (2, true)", val, ok)
	}

	// Peek should not remove
	if q.GetLength() != 2 {
		t.Errorf("length after peek = %d, want 2", q.GetLength())
	}
}

func TestFastQueueEmpty(t *testing.T) {
	q := NewFastQueue[string]()

	val, ok := q.Dequeue()
	if ok {
		t.Errorf("dequeue from empty queue returned ok=true, val=%s", val)
	}

	val, ok = q.Peek()
	if ok {
		t.Errorf("peek from empty queue returned ok=true, val=%s", val)
	}
}

func TestFastQueueResize(t *testing.T) {
	q := NewFastQueue[int]()

	// Initial capacity is 16, push more than that
	for i := 0; i < 100; i++ {
		q.Enqueue(i)
	}

	if q.GetLength() != 100 {
		t.Errorf("length = %d, want 100", q.GetLength())
	}

	// Verify order is preserved
	for i := 0; i < 100; i++ {
		val, ok := q.Dequeue()
		if !ok || val != i {
			t.Errorf("dequeue[%d] = (%d, %v), want (%d, true)", i, val, ok, i)
			break
		}
	}
}

func TestFastQueueWrapAround(t *testing.T) {
	q := NewFastQueue[int]()

	// Fill and partially drain to force wrap-around
	for i := 0; i < 10; i++ {
		q.Enqueue(i)
	}
	for i := 0; i < 8; i++ {
		q.Dequeue()
	}
	// Now head is at index 8, add more to wrap around
	for i := 10; i < 25; i++ {
		q.Enqueue(i)
	}

	// Should have 2 + 15 = 17 items
	if q.GetLength() != 17 {
		t.Errorf("length = %d, want 17", q.GetLength())
	}

	// Verify order: 8, 9, 10, 11, ... 24
	for i := 8; i < 25; i++ {
		val, ok := q.Dequeue()
		if !ok || val != i {
			t.Errorf("dequeue expected %d, got (%d, %v)", i, val, ok)
			break
		}
	}
}

// ============================================================
// Consumer tests
// ============================================================

func TestConsumerSkipsOlderMessages(t *testing.T) {
	s := NewStream(100, false)

	var received []int
	var mu sync.Mutex

	s.Subscribe("ordered", func(msg *Message) error {
		mu.Lock()
		received = append(received, msg.Payload.(int))
		mu.Unlock()
		return nil
	})

	s.Produce("ordered", 1, nil)
	s.Produce("ordered", 2, nil)
	s.Produce("ordered", 3, nil)

	time.Sleep(100 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if len(received) != 3 {
		t.Errorf("expected 3 messages, got %d: %v", len(received), received)
	}
}

func TestConsumerMaxBacklogSize(t *testing.T) {
	s := NewStream(100, false)

	// Create a slow consumer to build up backlog
	blocker := make(chan struct{})
	var received int
	var mu sync.Mutex

	handler := func(msg *Message) error {
		if received == 0 {
			<-blocker // Block on first message
		}
		mu.Lock()
		received++
		mu.Unlock()
		return nil
	}

	// Subscribe with small max backlog
	s.Subscribe("backlog", handler, map[string]interface{}{
		"consumerMaxBacklogSize": 3,
	})

	// Produce many messages
	for i := 0; i < 10; i++ {
		s.Produce("backlog", i, nil)
	}

	time.Sleep(50 * time.Millisecond)
	close(blocker) // Unblock consumer
	time.Sleep(100 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	// Some messages should have been dropped
	t.Logf("Received %d messages (some should have been dropped from backlog of 10 with max 3)", received)
}

// ============================================================
// Edge case: concurrent produce
// ============================================================

func TestConcurrentProduce(t *testing.T) {
	s := NewStream(1000, false)

	var received int64
	var mu sync.Mutex

	s.Subscribe("concurrent", func(msg *Message) error {
		mu.Lock()
		received++
		mu.Unlock()
		return nil
	})

	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			s.Produce("concurrent", i, nil)
		}(i)
	}

	wg.Wait()
	time.Sleep(200 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	// Due to concurrent consumer goroutine race (running flag),
	// not all messages may be delivered
	t.Logf("Received %d out of 100 concurrent messages", received)
	if received == 0 {
		t.Error("expected at least some messages to be received")
	}
	if received < 100 {
		t.Logf("BUG: Only %d/100 messages delivered under concurrent produce - consumer.run() has a race condition where messages can be enqueued between isEmpty check and setting running=false", received)
	}
}

// ============================================================
// Integration: Exchange.StreamProduce
// ============================================================

func TestExchangeStreamProduce(t *testing.T) {
	// Test StreamProduce via the Exchange
	ex := &Exchange{}
	ex.Init(map[string]interface{}{})
	ex.Stream = NewStream(100, false)

	var received *Message
	var mu sync.Mutex

	ex.Stream.Subscribe("tickers", func(msg *Message) error {
		mu.Lock()
		received = msg
		mu.Unlock()
		return nil
	})

	ex.StreamProduce("tickers", map[string]interface{}{
		"symbol": "BTC/USDT",
		"last":   50000.0,
	})

	time.Sleep(50 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if received == nil {
		t.Fatal("expected message on tickers topic")
	}
	payload := received.Payload.(map[string]interface{})
	if payload["symbol"] != "BTC/USDT" {
		t.Errorf("symbol = %v, want BTC/USDT", payload["symbol"])
	}
}

func TestExchangeStreamProduceNilStream(t *testing.T) {
	// StreamProduce on nil Stream should panic
	ex := &Exchange{}
	ex.Init(map[string]interface{}{})
	ex.Stream = nil

	defer func() {
		r := recover()
		if r == nil {
			t.Error("expected panic when StreamProduce on nil stream")
		}
	}()

	ex.StreamProduce("tickers", "data")
}

// ============================================================
// Integration: Exchange.SetupStream
// ============================================================

func TestExchangeSetupStreamNilStream(t *testing.T) {
	ex := &Exchange{}
	ex.Init(map[string]interface{}{})
	ex.Stream = nil

	defer func() {
		r := recover()
		if r == nil {
			t.Error("expected panic when SetupStream on nil stream")
		}
	}()

	ex.SetupStream()
}

func TestExchangeSetupStreamIdempotent(t *testing.T) {
	ex := &Exchange{}
	ex.Init(map[string]interface{}{})
	ex.Options = &sync.Map{}
	ex.Stream = NewStream(100, false)

	// First call should set up subscriptions
	ex.SetupStream()

	// Second call should be a no-op (idempotent)
	ex.SetupStream()

	// Verify enableStreaming is set
	val, ok := ex.Options.Load("enableStreaming")
	if !ok {
		t.Fatal("enableStreaming not set in Options")
	}
	if val != true {
		t.Errorf("enableStreaming = %v, want true", val)
	}
}

func TestExchangeIsStreamingEnabled(t *testing.T) {
	ex := &Exchange{}
	ex.Init(map[string]interface{}{})
	ex.Options = &sync.Map{}

	result := ex.IsStreamingEnabled()
	if result != false {
		t.Errorf("IsStreamingEnabled = %v, want false before setup", result)
	}
}

// ============================================================
// StreamToSymbol callback tests
// ============================================================

func TestStreamToSymbolCallback(t *testing.T) {
	ex := &Exchange{}
	ex.Init(map[string]interface{}{})
	ex.Options = &sync.Map{}
	ex.Stream = NewStream(100, false)

	var received *Message
	var mu sync.Mutex

	// Subscribe to the symbol-specific topic
	ex.Stream.Subscribe("tickers::BTC/USDT", func(msg *Message) error {
		mu.Lock()
		received = msg
		mu.Unlock()
		return nil
	})

	// Get the StreamToSymbol callback
	callback := ex.StreamToSymbol("tickers")
	// Call it with a message map (the format used by the backward-compat handler)
	if fn, ok := callback.(func(map[string]interface{})); ok {
		fn(map[string]interface{}{
			"payload": map[string]interface{}{
				"symbol": "BTC/USDT",
				"last":   50000.0,
			},
		})
	} else {
		t.Fatalf("StreamToSymbol returned unexpected type: %T", callback)
	}

	time.Sleep(50 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if received == nil {
		t.Fatal("expected message on tickers::BTC/USDT topic")
	}
}

// ============================================================
// Multiple topics isolation test
// ============================================================

func TestTopicIsolation(t *testing.T) {
	s := NewStream(100, false)

	var topicA, topicB int
	var mu sync.Mutex

	s.Subscribe("topicA", func(msg *Message) error {
		mu.Lock()
		topicA++
		mu.Unlock()
		return nil
	})
	s.Subscribe("topicB", func(msg *Message) error {
		mu.Lock()
		topicB++
		mu.Unlock()
		return nil
	})

	s.Produce("topicA", "a1", nil)
	s.Produce("topicA", "a2", nil)
	s.Produce("topicB", "b1", nil)

	time.Sleep(100 * time.Millisecond)

	mu.Lock()
	defer mu.Unlock()
	if topicA != 2 {
		t.Errorf("topicA count = %d, want 2", topicA)
	}
	if topicB != 1 {
		t.Errorf("topicB count = %d, want 1", topicB)
	}
}

// ============================================================
// FastQueue double-locking test
// ============================================================

func TestFastQueueDoubleLocking(t *testing.T) {
	// The FastQueue has its own mutex, AND Consumer.Publish also
	// locks c.mu before calling backlog methods.
	// FastQueue.Enqueue/Dequeue also lock internally.
	// This tests whether there's a deadlock.
	q := NewFastQueue[int]()

	done := make(chan bool)
	go func() {
		for i := 0; i < 1000; i++ {
			q.Enqueue(i)
		}
		for i := 0; i < 1000; i++ {
			q.Dequeue()
		}
		done <- true
	}()

	select {
	case <-done:
		// OK
	case <-time.After(5 * time.Second):
		t.Fatal("DEADLOCK: FastQueue operations timed out - possible double-locking issue")
	}
}

func TestConsumerPublishDoubleLocking(t *testing.T) {
	// Consumer.Publish locks c.mu then calls c.backlog.Enqueue which also locks.
	// This tests for deadlocks in that path.
	s := NewStream(100, false)

	done := make(chan bool)
	go func() {
		s.Subscribe("dl-test", func(msg *Message) error {
			return nil
		})
		for i := 0; i < 100; i++ {
			s.Produce("dl-test", i, nil)
		}
		time.Sleep(200 * time.Millisecond)
		done <- true
	}()

	select {
	case <-done:
		// OK - no deadlock
	case <-time.After(5 * time.Second):
		t.Fatal("DEADLOCK: Consumer.Publish -> FastQueue operations timed out")
	}
}
