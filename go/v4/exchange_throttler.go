package ccxt

import (
	"time"

	u "github.com/google/uuid"
)

type TimestampedCost struct {
	Timestamp int64
	Cost      float64
}

type Throttler struct {
	Queue      Queue
	Running    bool
	Config     map[string]interface{}
	Timestamps []TimestampedCost
}

func NewThrottler(config map[string]interface{}) Throttler {
	defaultConfig := map[string]interface{}{
		"refillRate":         1.0,
		"delay":              0.001,
		"capacity":           1.0,
		"maxLimiterRequests": 2000,
		"tokens":             0,
		"cost":               1.0,
		"algorithm":          "leakyBucket",
		"rateLimit":          0.0,
		"windowSize":         60000.0,
	}

	return Throttler{
		Queue:      NewQueue(),
		Running:    false,
		Config:     ExtendMap(defaultConfig, config),
		Timestamps: []TimestampedCost{},
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
		if t.Config["algorithm"] == "leakyBucket" {
			go t.leakyBucketLoop()
		} else {
			go t.rollingWindowLoop()
		}
	}

	return task
}

func (t *Throttler) leakyBucketLoop() {

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

func (t *Throttler) rollingWindowLoop() {
	for t.Running {
		if t.Queue.IsEmpty() {
			t.Running = false
			continue
		}
		first, _ := t.Queue.Peek()
		task := first.Task
		cost := first.Cost
		now := Milliseconds()
		windowSize := ToFloat64(t.Config["windowSize"])
		maxWeight := ToFloat64(t.Config["maxWeight"])

		t.Timestamps = filterTimestamps(t.Timestamps, now, windowSize)
		totalCost := sumCosts(t.Timestamps)

		if totalCost+cost <= maxWeight {
			t.Timestamps = append(t.Timestamps, TimestampedCost{Timestamp: now, Cost: cost})
			if task != nil {
				task <- true
				close(task)
			}
			t.Queue.Dequeue()
			if t.Queue.IsEmpty() {
				t.Running = false
			}
		} else {
			waitTime := int64((t.Timestamps[0].Timestamp + int64(windowSize)) - now)
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
