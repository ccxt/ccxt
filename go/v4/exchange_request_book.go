package ccxt

// Request book: one goroutine per exchange instance owns the "last request/response"
// bookkeeping fields (timestamp, request headers/body/url, response headers, last http
// response) and the request id / nonce counters. A request goroutine hands a value over the
// channel and waits for the owner to apply it; readers receive an immutable snapshot through
// the same channel, so no field below is ever written from a request goroutine.

type requestBookKind int

const (
	requestBookStamp requestBookKind = iota
	requestBookRequest
	requestBookResponse
	requestBookReset
	requestBookIdNext
	requestBookNonce
	requestBookRead
)

type requestBookOp struct {
	kind       requestBookKind
	request    any
	headers    map[string]any
	stamp      int64
	key        string
	seed       int64
	current    any
	reply      chan requestBookSnapshot
	idReply    chan int64
	nonceReply chan any
	done       chan any
}

// requestBookSnapshot is what a reader receives; the owner never touches a snapshot after
// the send, so the reader owns the value and the maps it holds.
type requestBookSnapshot struct {
	stamp           int64
	requestHeaders  any
	requestBody     any
	requestUrl      any
	responseHeaders any
	httpResponse    any
}

// requestBook is the owner goroutine's own state: the counters are never stored in Options,
// so no other goroutine reads or writes them.
type requestBook struct {
	exchange  *BaseExchange
	counters  map[string]int64
	lastNonce int64
	nonceSet  bool
}

func (this *BaseExchange) requestBookChannel() chan requestBookOp {
	if this.requestBookOps == nil {
		this.startOwners()
	}
	return this.requestBookOps
}

// handOffRequestBook hands one write to the owner and returns once it is applied.
func (this *BaseExchange) handOffRequestBook(op requestBookOp) {
	done := make(chan any)
	op.done = done
	this.requestBookChannel() <- op
	if recovered := <-done; recovered != nil {
		panic(recovered)
	}
}

// readRequestBook returns the owner's current bookkeeping snapshot.
func (this *BaseExchange) readRequestBook() requestBookSnapshot {
	reply := make(chan requestBookSnapshot, 1)
	this.requestBookChannel() <- requestBookOp{kind: requestBookRead, reply: reply}
	return <-reply
}

// NextRequestId asks the owner for the next value of one request id counter: the call that
// first uses a key seeds it from the option of the same name, later calls continue the
// owner's count.
func (this *BaseExchange) NextRequestId(key string) int64 {
	seed := *this.SafeInteger(this.Options, key, 0)
	reply := make(chan int64, 1)
	this.requestBookChannel() <- requestBookOp{kind: requestBookIdNext, key: key, seed: seed, idReply: reply}
	return <-reply
}

// nextNonce asks the owner for the next strictly-increasing nonce.
func (this *BaseExchange) nextNonce(current any) any {
	seed := *this.SafeInteger(this.Options, "lastNonce", 0)
	reply := make(chan any, 1)
	this.requestBookChannel() <- requestBookOp{kind: requestBookNonce, current: current, seed: seed, nonceReply: reply}
	return <-reply
}

// GetLast_http_response returns the owner's snapshot of the last raw http response.
func (this *BaseExchange) GetLast_http_response() any {
	return this.readRequestBook().httpResponse
}

func (book *requestBook) run(ops <-chan requestBookOp) {
	for op := range ops {
		book.apply(op)
	}
}

// apply is the book's only writer: a panic is relayed to the caller instead of killing the
// owner goroutine and wedging every later hand-off.
func (book *requestBook) apply(op requestBookOp) (recovered any) {
	defer func() {
		recovered = recover()
		if op.done != nil {
			op.done <- recovered
		}
	}()
	this := book.exchange
	switch op.kind {
	case requestBookStamp:
		this.LastRestRequestTimestamp = op.stamp
	case requestBookRequest:
		this.Last_request_headers = GetValue(op.request, "headers")
		this.Last_request_body = GetValue(op.request, "body")
		this.Last_request_url = GetValue(op.request, "url")
	case requestBookResponse:
		this.Last_response_headers = op.headers
		this.LastResponseHeaders = op.headers
	case requestBookReset:
		// the owner's own reset, written through a local so the printer pass cannot
		// rewrite it into a hand-off (build/hx10w6-OG02.ts)
		target := book.exchange
		target.Last_http_response = nil
		target.Last_request_headers = nil
		target.Last_response_headers = nil
		target.LastResponseHeaders = nil
	case requestBookIdNext:
		next, seen := book.counters[op.key]
		if !seen {
			next = op.seed
		}
		next++
		book.counters[op.key] = next
		op.idReply <- next
	case requestBookNonce:
		if !book.nonceSet {
			book.lastNonce = op.seed
			book.nonceSet = true
		}
		var result any
		if IsGreaterThan(op.current, book.lastNonce) {
			result = op.current
		} else {
			result = book.lastNonce + 1
		}
		book.lastNonce = requestBookInt64(result)
		op.nonceReply <- result
	case requestBookRead:
		op.reply <- book.snapshot()
	}
	return
}

func (book *requestBook) snapshot() requestBookSnapshot {
	this := book.exchange
	return requestBookSnapshot{
		stamp:           this.LastRestRequestTimestamp,
		requestHeaders:  this.Last_request_headers,
		requestBody:     this.Last_request_body,
		requestUrl:      this.Last_request_url,
		responseHeaders: this.Last_response_headers,
		httpResponse:    this.Last_http_response,
	}
}

// requestBookInt64 is the numeric view of a nonce the owner keeps for the next comparison.
func requestBookInt64(v any) int64 {
	switch n := v.(type) {
	case int64:
		return n
	case int:
		return int64(n)
	case float64:
		return int64(n)
	case *int64:
		if n != nil {
			return *n
		}
	}
	return 0
}
