package ccxt

import "sync"

// FastQueue is a thread-safe O(1) queue implementation using a circular buffer
type FastQueue[T any] struct {
	head     int
	tail     int
	items    []T
	size     int
	capacity int
	mu       sync.Mutex
}

// NewFastQueue creates a new FastQueue with initial capacity
func NewFastQueue[T any]() *FastQueue[T] {
	initialCapacity := 16
	return &FastQueue[T]{
		head:     0,
		tail:     0,
		items:    make([]T, initialCapacity),
		size:     0,
		capacity: initialCapacity,
	}
}

// Enqueue adds an item to the queue
func (q *FastQueue[T]) Enqueue(item T) {
	q.mu.Lock()
	defer q.mu.Unlock()

	// Check if we need to resize BEFORE writing
	if q.size == q.capacity {
		q.resize()
	}

	q.items[q.tail] = item
	q.tail = (q.tail + 1) % q.capacity
	q.size++
}

// Dequeue removes and returns the first item from the queue
func (q *FastQueue[T]) Dequeue() (T, bool) {
	q.mu.Lock()
	defer q.mu.Unlock()

	var zero T
	if q.isEmpty() {
		return zero, false
	}

	item := q.items[q.head]
	q.items[q.head] = zero // Clear reference for GC
	q.head = (q.head + 1) % q.capacity
	q.size--

	return item, true
}

// Peek returns the first item without removing it
func (q *FastQueue[T]) Peek() (T, bool) {
	q.mu.Lock()
	defer q.mu.Unlock()

	var zero T
	if q.isEmpty() {
		return zero, false
	}
	return q.items[q.head], true
}

// IsEmpty returns true if the queue is empty
func (q *FastQueue[T]) IsEmpty() bool {
	q.mu.Lock()
	defer q.mu.Unlock()
	return q.isEmpty()
}

// internal isEmpty without lock
func (q *FastQueue[T]) isEmpty() bool {
	return q.size == 0
}

// GetLength returns the current size of the queue
func (q *FastQueue[T]) GetLength() int {
	q.mu.Lock()
	defer q.mu.Unlock()
	return q.size
}

// GetCapacity returns the current capacity of the queue
func (q *FastQueue[T]) GetCapacity() int {
	q.mu.Lock()
	defer q.mu.Unlock()
	return q.capacity
}

// resize doubles the capacity of the queue (must be called with lock held)
func (q *FastQueue[T]) resize() {
	newCapacity := q.capacity * 2
	if newCapacity < 1 {
		newCapacity = 1
	}
	newItems := make([]T, newCapacity)

	// Copy items in order
	for i := 0; i < q.size; i++ {
		newItems[i] = q.items[(q.head+i)%q.capacity]
	}

	q.items = newItems
	q.head = 0
	q.tail = q.size
	q.capacity = newCapacity
}
