package ccxt

import (
	"errors"
	"sync"
)

type QueueElement struct {
	Cost float64
	Task chan bool
	Id   string
}

type Queue struct {
	elements []QueueElement
	mu       sync.Mutex
}

func NewQueue() Queue {
	return Queue{
		elements: []QueueElement{},
	}
}

func (q *Queue) Enqueue(element QueueElement) {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.elements = append(q.elements, element)
}

func (q *Queue) Dequeue() (QueueElement, error) {
	q.mu.Lock()
	defer q.mu.Unlock()

	if len(q.elements) == 0 {
		return QueueElement{}, errors.New("queue is empty")
	}

	front := q.elements[0]
	q.elements = q.elements[1:]
	return front, nil
}

func (q *Queue) Length() int {
	q.mu.Lock()
	defer q.mu.Unlock()
	return len(q.elements)
}

func (q *Queue) IsEmpty() bool {
	q.mu.Lock()
	defer q.mu.Unlock()
	return len(q.elements) == 0
}

func (q *Queue) Peek() (QueueElement, error) {
	q.mu.Lock()
	defer q.mu.Unlock()

	if len(q.elements) == 0 {
		return QueueElement{}, errors.New("queue is empty")
	}

	return q.elements[0], nil
}
