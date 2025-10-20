package ccxt

import (
	"fmt"
	"sync"
)

// SubscribeParams contains options for subscribing to a topic
type SubscribeParams struct {
	Synchronous            bool
	ConsumerMaxBacklogSize int
}

// Stream manages pub/sub message streaming for WebSocket event handling
type Stream struct {
	maxMessagesPerTopic  int
	topics               sync.Map // map[string][]*Message
	verbose              bool
	consumers            sync.Map // map[string][]*Consumer
	topicIndexes         sync.Map // map[string]int
	ActiveWatchFunctions interface{} // Public property for transpiled code access
	mu                   sync.RWMutex
}

// NewStream creates a new Stream instance
func NewStream(maxMessagesPerTopic int, verbose bool) *Stream {
	return &Stream{
		maxMessagesPerTopic:  maxMessagesPerTopic,
		verbose:              verbose,
		ActiveWatchFunctions: []interface{}{},
	}
}

// Init initializes or resets the stream
func (s *Stream) Init(maxMessagesPerTopic int, verbose bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.maxMessagesPerTopic = maxMessagesPerTopic
	s.verbose = verbose
	s.topics = sync.Map{}
	s.consumers = sync.Map{}
	s.topicIndexes = sync.Map{}
	s.ActiveWatchFunctions = []interface{}{}
}

// Produce publishes a message to a topic
func (s *Stream) Produce(topic interface{}, payload interface{}, err interface{}) {
	topicStr, ok := topic.(string)
	if !ok {
		return
	}

	// Initialize topic messages if not exists
	if _, exists := s.topics.Load(topicStr); !exists {
		s.topics.Store(topicStr, []*Message{})
	}

	// Initialize topic index if not exists
	if _, exists := s.topicIndexes.Load(topicStr); !exists {
		s.topicIndexes.Store(topicStr, -1)
	}

	// Increment and store index
	indexInterface, _ := s.topicIndexes.Load(topicStr)
	index := indexInterface.(int) + 1
	s.topicIndexes.Store(topicStr, index)

	// Get current messages
	messagesInterface, _ := s.topics.Load(topicStr)
	messages := messagesInterface.([]*Message)

	// Create message with history
	var errorVal error
	if err != nil {
		if e, ok := err.(error); ok {
			errorVal = e
		}
	}

	// Create a copy of history
	history := make([]*Message, len(messages))
	copy(history, messages)

	message := &Message{
		Payload: payload,
		Error:   errorVal,
		Metadata: MessageMetadata{
			Stream:  s,
			Topic:   topicStr,
			Index:   index,
			History: history,
		},
	}

	// Add to history if maxMessagesPerTopic > 0
	if s.maxMessagesPerTopic > 0 {
		if len(messages) > s.maxMessagesPerTopic {
			// Remove oldest message
			messages = messages[1:]
		}
		messages = append(messages, message)
		s.topics.Store(topicStr, messages)
	}

	// Send to consumers
	consumersInterface, ok := s.consumers.Load(topicStr)
	if ok {
		if consumers, ok := consumersInterface.([]*Consumer); ok {
			s.sendToConsumers(consumers, message)
		}
	} else {
		// Initialize empty consumers array if not exists
		s.consumers.Store(topicStr, []*Consumer{})
	}
}

// Subscribe registers a consumer function for a topic
func (s *Stream) Subscribe(topic interface{}, handler interface{}, params ...interface{}) {
	topicStr, ok := topic.(string)
	if !ok {
		return
	}

	// Convert handler to ConsumerFunction
	var consumerFn ConsumerFunction
	if fn, ok := handler.(func(*Message) error); ok {
		consumerFn = fn
	} else if fn, ok := handler.(func(map[string]interface{})); ok {
		// Wrap the old-style handler
		consumerFn = func(msg *Message) error {
			// Convert Message to map format for backward compatibility
			messageMap := map[string]interface{}{
				"payload": msg.Payload,
				"error":   msg.Error,
			}
			fn(messageMap)
			return nil
		}
	} else {
		// Default no-op handler
		consumerFn = func(msg *Message) error { return nil }
	}

	// Parse parameters with defaults
	synchronous := true
	var consumerMaxBacklogSize int

	if len(params) > 0 && params[0] != nil {
		if paramsMap, ok := params[0].(map[string]interface{}); ok {
			if sync, ok := paramsMap["synchronous"].(bool); ok {
				synchronous = sync
			}
			if maxBacklog, ok := paramsMap["consumerMaxBacklogSize"].(int); ok {
				consumerMaxBacklogSize = maxBacklog
			}
		} else if paramsBool, ok := params[0].(bool); ok {
			synchronous = paramsBool
		}
	}

	// Create consumer
	lastIndex := s.GetLastIndex(topicStr)
	consumer := NewConsumer(consumerFn, lastIndex, &ConsumerOptions{
		Synchronous:    synchronous,
		MaxBacklogSize: consumerMaxBacklogSize,
	})

	// Add consumer to topic
	if _, exists := s.consumers.Load(topicStr); !exists {
		s.consumers.Store(topicStr, []*Consumer{})
	}
	consumersInterface, _ := s.consumers.Load(topicStr)
	consumers := consumersInterface.([]*Consumer)
	consumers = append(consumers, consumer)
	s.consumers.Store(topicStr, consumers)

	if s.verbose {
		fmt.Printf("subscribed function to topic: %s, synchronous: %v, maxBacklogSize: %d\n",
			topicStr, synchronous, consumerMaxBacklogSize)
	}
}

// Unsubscribe removes a consumer function from a topic
func (s *Stream) Unsubscribe(topic interface{}, consumerFn interface{}) bool {
	// Cast/assert the interface to ConsumerFunction
	_, ok := consumerFn.(ConsumerFunction)
	if !ok {
		if s.verbose {
			fmt.Printf("unsubscribe failed: invalid consumer function type for topic: %s\n", topic)
		}
		return false
	}

	consumersInterface, ok := s.consumers.Load(topic)
	if !ok {
		if s.verbose {
			fmt.Printf("unsubscribe failed: consumer not found for topic: %s\n", topic)
		}
		return false
	}

	consumers, ok := consumersInterface.([]*Consumer)
	if !ok {
		return false
	}

	// Filter out the consumer
	filtered := []*Consumer{}
	found := false
	for _, consumer := range consumers {
		// Note: In Go, we can't directly compare functions, so this is a limitation
		// We'll keep all consumers for now as function comparison is not possible
		// This is a known limitation compared to TypeScript where function references can be compared
		filtered = append(filtered, consumer)
	}

	if found {
		s.consumers.Store(topic, filtered)
		if s.verbose {
			fmt.Printf("unsubscribed function from topic: %s\n", topic)
		}
		return true
	}

	if s.verbose {
		fmt.Printf("unsubscribe failed: consumer not found for topic: %s\n", topic)
	}
	return false
}

// GetMessageHistory returns the message history for a topic
func (s *Stream) GetMessageHistory(topic string) []*Message {
	messagesInterface, ok := s.topics.Load(topic)
	if !ok {
		return []*Message{}
	}

	messages, ok := messagesInterface.([]*Message)
	if !ok {
		return []*Message{}
	}

	// Return the messages directly (no copy needed for this implementation)
	return messages
}

// GetLastIndex returns the last index for a topic
func (s *Stream) GetLastIndex(topic string) int {
	indexInterface, ok := s.topicIndexes.Load(topic)
	if !ok {
		return -1
	}

	index, ok := indexInterface.(int)
	if !ok {
		return -1
	}

	return index
}

// sendToConsumers sends a message to all consumers
func (s *Stream) sendToConsumers(consumers []*Consumer, message *Message) {
	if s.verbose {
		fmt.Printf("sending message from topic %s to %d consumers\n",
			message.Metadata.Topic, len(consumers))
	}

	for i := 0; i < len(consumers); i++ {
		// Simulate async behavior with a small yield
		// In Go, we don't need Promise.resolve() like in TypeScript
		consumers[i].Publish(message)
	}
}

// AddWatchFunction adds a watch function to the stream for reconnection
func (s *Stream) AddWatchFunction(name interface{}, args interface{}) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Lazy initialization if ActiveWatchFunctions is nil
	if s.ActiveWatchFunctions == nil {
		s.ActiveWatchFunctions = []interface{}{}
	}

	nameStr, ok := name.(string)
	if !ok {
		return
	}

	var argsSlice []interface{}
	if args != nil {
		if slice, ok := args.([]interface{}); ok {
			argsSlice = slice
		} else {
			argsSlice = []interface{}{args}
		}
	}

	// Create watch function as map for transpiled code
	watchFunc := map[string]interface{}{
		"method": nameStr,
		"args":   argsSlice,
	}

	// Append directly to public property
	watchFuncs := s.ActiveWatchFunctions.([]interface{})
	s.ActiveWatchFunctions = append(watchFuncs, watchFunc)

	// Debug logging
	if s.verbose {
		fmt.Printf("Added watch function: %s (total: %d)\n", nameStr, len(s.ActiveWatchFunctions.([]interface{})))
	}
}

// Close closes the stream by resetting topics and unsubscribing consumers
func (s *Stream) Close() {
	if s.verbose {
		fmt.Println("closing stream")
	}
	s.Init(s.maxMessagesPerTopic, s.verbose)
}
