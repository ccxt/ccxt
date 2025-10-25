package ccxt

import (
	"fmt"
	"sync"
)

// ConsumerFunction is a function that processes messages
type ConsumerFunction func(message *Message) error

// ConsumerOptions configures consumer behavior
type ConsumerOptions struct {
	Synchronous     bool
	MaxBacklogSize  int
}

// Consumer processes messages from a stream
type Consumer struct {
	fn              ConsumerFunction
	synchronous     bool
	currentIndex    int
	running         bool
	backlog         *FastQueue[*Message]
	maxBacklogSize  int
	mu              sync.Mutex
	runningMu       sync.Mutex
}

const DefaultMaxBacklogSize = 1000

// NewConsumer creates a new consumer
func NewConsumer(fn ConsumerFunction, currentIndex int, options *ConsumerOptions) *Consumer {
	if options == nil {
		options = &ConsumerOptions{}
	}

	maxBacklogSize := options.MaxBacklogSize
	if maxBacklogSize == 0 {
		maxBacklogSize = DefaultMaxBacklogSize
	}

	return &Consumer{
		fn:             fn,
		synchronous:    options.Synchronous,
		currentIndex:   currentIndex,
		running:        false,
		backlog:        NewFastQueue[*Message](),
		maxBacklogSize: maxBacklogSize,
	}
}

// Publish adds a message to the consumer's backlog and triggers processing
func (c *Consumer) Publish(message *Message) {
	c.mu.Lock()
	c.backlog.Enqueue(message)
	backlogLength := c.backlog.GetLength()

	// Check if backlog is too large and drop oldest message
	if backlogLength > c.maxBacklogSize {
		fmt.Printf("WebSocket consumer backlog is too large (%d messages). This might indicate a performance issue or message processing bottleneck. Dropping oldest message.\n", backlogLength)
		c.backlog.Dequeue()
	}
	c.mu.Unlock()

	// Trigger processing
	c.run()
}

// run processes messages from the backlog
func (c *Consumer) run() {
	// Check if already running
	c.runningMu.Lock()
	if c.running {
		c.runningMu.Unlock()
		return
	}
	c.running = true
	c.runningMu.Unlock()

	// Process messages in a goroutine
	go func() {
		defer func() {
			c.runningMu.Lock()
			c.running = false
			c.runningMu.Unlock()
		}()

		for {
			c.mu.Lock()
			message, ok := c.backlog.Dequeue()
			c.mu.Unlock()

			if !ok {
				break
			}

			c.handleMessage(message)
		}
	}()
}

// handleMessage processes a single message
func (c *Consumer) handleMessage(message *Message) {
	// Skip if message index is not newer
	if message.Metadata.Index <= c.currentIndex {
		return
	}

	c.currentIndex = message.Metadata.Index
	stream := message.Metadata.Stream
	fn := c.fn

	produceError := func(err error) {
		var errorMsg string
		if err != nil {
			errorMsg = err.Error()
		} else {
			errorMsg = "unknown error"
		}
		consumerErr := ConsumerFunctionError(errorMsg)
		stream.Produce("errors", message, consumerErr)
	}

	if c.synchronous {
		// Synchronous execution - wait for completion
		if err := fn(message); err != nil {
			produceError(err)
		}
	} else {
		// Asynchronous execution - fire and forget
		// Wrap in a recovery handler to catch panics
		func() {
			defer func() {
				if r := recover(); r != nil {
					produceError(fmt.Errorf("panic: %v", r))
				}
			}()

			if err := fn(message); err != nil {
				produceError(err)
			}
		}()
	}
}
