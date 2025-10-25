package ccxt

// Message represents a message in the stream
type Message struct {
	Payload  interface{}
	Error    error
	Metadata MessageMetadata
}

// MessageMetadata contains metadata about a message
type MessageMetadata struct {
	Stream  *Stream
	Topic   string
	Index   int
	History []*Message
}
