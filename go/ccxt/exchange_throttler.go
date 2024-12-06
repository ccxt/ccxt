package ccxt

import "time"

type Throttler struct {
	Queue   Queue
	Running bool
	Config  map[string]interface{}
}

func NewThrottler(config map[string]interface{}) Throttler {
	return Throttler{
		Queue:   NewQueue(),
		Running: false,
		Config:  config,
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
	}

	t.Queue.Enqueue(queueElement)

	if !t.Running {
		t.Running = true
		t.Loop()
	}

	return task
}

func (t *Throttler) Loop() {

	lastTimestamp := Milliseconds()
	for true {
		if t.Queue.IsEmpty() {
			t.Running = false
			continue
		}
		first, _ := t.Queue.Dequeue()
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
			sleepTime := (t.Config["delay"].(int)) * 1000
			time.Sleep(time.Duration(sleepTime) * time.Millisecond)
			current := Milliseconds()
			elapsed := current - lastTimestamp
			lastTimestamp = current
			tokens := ToFloat64(t.Config["tokens"]) + (ToFloat64(t.Config["refillRate"]) * ToFloat64(elapsed))
			t.Config["tokens"] = MathMin(tokens, ToFloat64(t.Config["capacity"]))
		}
	}

}

func Milliseconds() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}
