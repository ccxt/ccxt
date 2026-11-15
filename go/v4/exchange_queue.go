package ccxt

import (
	"errors"
)

type QueueElement struct {
	Cost float64
	Task chan bool
	Id   string
}

// Queue keeps its element list in a one-slot channel: the goroutine that takes
// the list out of the slot is its only owner until it puts it back, so every
// method is a hand-off instead of a critical section and no lock is involved.
type Queue struct {
	elements chan []QueueElement
}

func NewQueue() Queue {
	q := Queue{
		elements: make(chan []QueueElement, 1),
	}
	q.elements <- []QueueElement{}
	return q
}

func (q *Queue) Enqueue(element QueueElement) {
	elements := <-q.elements
	q.elements <- append(elements, element)
}

func (q *Queue) Dequeue() (QueueElement, error) {
	elements := <-q.elements
	if len(elements) == 0 {
		q.elements <- elements
		return QueueElement{}, errors.New("queue is empty")
	}
	front := elements[0]
	q.elements <- elements[1:]
	return front, nil
}

func (q *Queue) Length() int {
	elements := <-q.elements
	q.elements <- elements
	return len(elements)
}

func (q *Queue) IsEmpty() bool {
	return q.Length() == 0
}

func (q *Queue) Peek() (QueueElement, error) {
	elements := <-q.elements
	q.elements <- elements
	if len(elements) == 0 {
		return QueueElement{}, errors.New("queue is empty")
	}
	return elements[0], nil
}
