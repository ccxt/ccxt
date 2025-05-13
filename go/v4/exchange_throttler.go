package ccxt

import (
	"time"

	u "github.com/google/uuid"
)

type Throttler struct {
	Queue   Queue
	Running bool
	Config  map[string]interface{}
}

func NewThrottler(config map[string]interface{}) Throttler {
	defaultConfig := map[string]interface{}{
		"refillRate":  1.0,
		"delay":       0.001,
		"capacity":    1.0,
		"maxCapacity": 2000,
		"tokens":      0,
		"cost":        1.0,
	}

	return Throttler{
		Queue:   NewQueue(),
		Running: false,
		Config:  ExtendMap(defaultConfig, config),
	}
}

func (t *Throttler) Throttle(cost2 interface{}) <-chan bool {
	var cost float64 = -1

	if cost2 != nil {
		cost = cost2.(float64)
	} else {
		cost = ToFloat64(t.Config["cost"])
	}
	task := make(chan bool)

	queueElement := QueueElement{
		Cost: cost,
		Task: task,
		Id:   u.New().String(),
	}

	t.Queue.Enqueue(queueElement)

	if !t.Running {
		t.Running = true
		go t.Loop()
	}

	return task
}

func (t *Throttler) Loop() {

	lastTimestamp := Milliseconds()
	for t.Running {
		if t.Queue.IsEmpty() {
			t.Running = false
			continue
		}
		first, _ := t.Queue.Peek()
		task := first.Task
		cost := first.Cost

		tokens := ToFloat64(t.Config["tokens"])

		if tokens >= 0 {
			t.Config["tokens"] = tokens - cost

			if task != nil {
				task <- true
				close(task)
			}
			t.Queue.Dequeue()

			if t.Queue.IsEmpty() {
				t.Running = false
			}
		} else {
			sleepTime := ToFloat64(t.Config["delay"]) * 1000
			time.Sleep(time.Duration(sleepTime) * time.Millisecond)
			current := Milliseconds()
			elapsed := current - lastTimestamp
			lastTimestamp = current
			sumTokens := ToFloat64(t.Config["refillRate"]) * ToFloat64(elapsed)
			tokens := ToFloat64(t.Config["tokens"]) + sumTokens
			t.Config["tokens"] = MathMin(tokens, ToFloat64(t.Config["capacity"]))
		}
	}

}

func Milliseconds() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}
