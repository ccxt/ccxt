package ccxt

import (
	"sync"
	"time"

	u "github.com/google/uuid"
)

type TimestampedCost struct {
	Timestamp int64
	Cost      float64
}

type Throttler struct {
	Queue   Queue
	Running bool
	Config  map[string]interface{}
	Timestamps []TimestampedCost
	Mutex      sync.Mutex
}

func NewThrottler(config map[string]interface{}) Throttler {
	defaultConfig := map[string]interface{}{
		"refillRate":  1.0,
		"delay":       0.001,
		"capacity":    1.0,
		"maxLimiterRequests": 2000,
		"tokens":      0,
		"cost":        1.0,
		"algorithm":   "leakyBucket",
		"rateLimit":   0.0,
		"windowSize":  60000.0,
	}

	return Throttler{
		Queue:   NewQueue(),
		Running: false,
		Config:  ExtendMap(defaultConfig, config),
		Timestamps: []TimestampedCost{},
	}
}

func (t *Throttler) Throttle(cost2 interface{}) <-chan bool {
	var cost float64 = -1

	if cost2 != nil {
		cost = cost2.(float64)
	} else {
		t.Mutex.Lock()
		cost = ToFloat64(t.Config["cost"])
		t.Mutex.Unlock()
	}
	task := make(chan bool)

	queueElement := QueueElement{
		Cost: cost,
		Task: task,
		Id:   u.New().String(),
	}

	t.Queue.Enqueue(queueElement)

	t.Mutex.Lock()
	if !t.Running {
		t.Running = true
		algorithm := t.Config["algorithm"]
		t.Mutex.Unlock()

		if algorithm == "leakyBucket" {
			go t.leakyBucketLoop()
		} else {
			go t.rollingWindowLoop()
		}
	} else {
		t.Mutex.Unlock()
	}

	return task
}

func (t *Throttler) leakyBucketLoop() {

	lastTimestamp := Milliseconds()
	for {
		if t.Queue.IsEmpty() {
			t.Mutex.Lock()
			t.Running = false
			t.Mutex.Unlock()
			return
		}

		first, _ := t.Queue.Peek()
		task := first.Task
		cost := first.Cost

		t.Mutex.Lock()
		tokens := ToFloat64(t.Config["tokens"])
		if tokens >= 0 {
			t.Config["tokens"] = tokens - cost
			t.Mutex.Unlock()

			if task != nil {
				task <- true
				close(task)
			}
			t.Queue.Dequeue()
		} else {
			sleepTime := ToFloat64(t.Config["delay"]) * 1000
			t.Mutex.Unlock()
			time.Sleep(time.Duration(sleepTime) * time.Millisecond)

			current := Milliseconds()
			elapsed := current - lastTimestamp
			lastTimestamp = current

			t.Mutex.Lock()
			sumTokens := ToFloat64(t.Config["refillRate"]) * ToFloat64(elapsed)
			tokens = ToFloat64(t.Config["tokens"]) + sumTokens
			t.Config["tokens"] = MathMin(tokens, ToFloat64(t.Config["capacity"]))
			t.Mutex.Unlock()
		}
	}
}

func (t *Throttler) rollingWindowLoop() {
	for {
		if t.Queue.IsEmpty() {
			t.Mutex.Lock()
			t.Running = false
			t.Mutex.Unlock()
			return
		}

		first, _ := t.Queue.Peek()
		task := first.Task
		cost := first.Cost
		now := Milliseconds()

		t.Mutex.Lock()
		windowSize := ToFloat64(t.Config["windowSize"])
		maxWeight := ToFloat64(t.Config["maxWeight"])
		t.Timestamps = filterTimestamps(t.Timestamps, now, windowSize)
		totalCost := sumCosts(t.Timestamps)

		if totalCost+cost <= maxWeight {
			t.Timestamps = append(t.Timestamps, TimestampedCost{Timestamp: now, Cost: cost})
			t.Mutex.Unlock()

			if task != nil {
				task <- true
				close(task)
			}
			t.Queue.Dequeue()
		} else {
			waitTime := int64((t.Timestamps[0].Timestamp + int64(windowSize)) - now)
			t.Mutex.Unlock()

			if waitTime > 0 {
				time.Sleep(time.Duration(waitTime) * time.Millisecond)
			}
		}
	}
}

func filterTimestamps(timestamps []TimestampedCost, now int64, windowSize float64) []TimestampedCost {
	result := []TimestampedCost{}
	for _, t := range timestamps {
		if float64(now-t.Timestamp) < windowSize {
			result = append(result, t)
		}
	}
	return result
}

func sumCosts(timestamps []TimestampedCost) float64 {
	sum := 0.0
	for _, t := range timestamps {
		sum += t.Cost
	}
	return sum
}

func Milliseconds() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}
