package ccxt

// Request book: the "last request/response" bookkeeping fields and the request id / nonce
// counters, updated in place on the calling goroutine.

type requestBookKind int

const (
	requestBookStamp requestBookKind = iota
	requestBookRequest
	requestBookResponse
	requestBookReset
)

type requestBookOp struct {
	kind    requestBookKind
	request map[string]any
	headers map[string]any
	stamp   int64
}

// requestBookSnapshot is the bookkeeping fields as one value.
type requestBookSnapshot struct {
	stamp           int64
	requestHeaders  any
	requestBody     any
	requestUrl      any
	responseHeaders any
	httpResponse    any
}

// handOffRequestBook applies one bookkeeping write.
func (this *BaseExchange) handOffRequestBook(op requestBookOp) {
	switch op.kind {
	case requestBookStamp:
		this.LastRestRequestTimestamp = op.stamp
	case requestBookRequest:
		this.Last_request_headers = op.request["headers"]
		this.Last_request_body = op.request["body"]
		this.Last_request_url = op.request["url"]
	case requestBookResponse:
		this.Last_response_headers = op.headers
		this.LastResponseHeaders = op.headers
	case requestBookReset:
		this.Last_http_response = nil
		this.Last_request_headers = nil
		this.Last_response_headers = nil
		this.LastResponseHeaders = nil
	}
}

// readRequestBook returns the current bookkeeping fields.
func (this *BaseExchange) readRequestBook() requestBookSnapshot {
	return requestBookSnapshot{
		stamp:           this.LastRestRequestTimestamp,
		requestHeaders:  this.Last_request_headers,
		requestBody:     this.Last_request_body,
		requestUrl:      this.Last_request_url,
		responseHeaders: this.Last_response_headers,
		httpResponse:    this.Last_http_response,
	}
}

// NextRequestId returns the next value of one request id counter, seeded on first use from
// the option of the same name.
func (this *BaseExchange) NextRequestId(key string) int64 {
	if this.requestIds == nil {
		this.requestIds = map[string]int64{}
	}
	next, seen := this.requestIds[key]
	if !seen {
		next = *this.SafeInteger(this.Options, key, 0)
	}
	next++
	this.requestIds[key] = next
	return next
}

// nextNonce returns the next strictly-increasing nonce, seeded from Options["lastNonce"].
func (this *BaseExchange) nextNonce(current int64) int64 {
	if !this.lastNonceSet {
		this.lastNonce = *this.SafeInteger(this.Options, "lastNonce", 0)
		this.lastNonceSet = true
	}
	result := this.lastNonce + 1
	if current > this.lastNonce {
		result = current
	}
	this.lastNonce = result
	return result
}

// GetLast_http_response returns the last raw http response.
func (this *BaseExchange) GetLast_http_response() any {
	return this.Last_http_response
}
