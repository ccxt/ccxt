package ccxt

import (
	"time"

	u "github.com/google/uuid"
)

type TimestampedCost struct {
	Timestamp int64
	Cost      float64
}

// throttlerState is the mutable half of a Throttler; whoever holds it out of
// the state channel is its only owner, so the draining loop alone touches the
// running flag, the token count and the rolling-window history.
type throttlerState struct {
	Running    bool
	Tokens     float64
	Timestamps []TimestampedCost
}

type Throttler struct {
	Queue  Queue
	Config map[string]any // immutable after NewThrottler
	state  chan throttlerState
}

func NewThrottler(config map[string]any) *Throttler {
	defaultConfig := map[string]any{
		"refillRate": 1.0,   // leaky bucket refill rate in tokens per second
		"delay":      0.001, // leaky bucket seconds before checking the queue after waiting
		"capacity":   1.0,   // leaky bucket
		"tokens":     0,     // leaky bucket
		"cost":       1.0,   // leaky bucket and rolling window
		"algorithm":  "leakyBucket",
		"rateLimit":  0.0,
		"windowSize": 60000.0, // rolling window size in milliseconds
		"maxWeight":  0.0,     // rolling window - rollingWindowSize / rateLimit   // ms_of_window / ms_of_rate_limit
	}
	config = ExtendMap(defaultConfig, config)
	if config["algorithm"] != "leakyBucket" {
		config["maxWeight"] = derefScalar(config["windowSize"]).(float64) / derefScalar(config["rateLimit"]).(float64)
	}

	throttler := &Throttler{
		Queue:  NewQueue(),
		Config: config,
		state:  make(chan throttlerState, 1),
	}
	throttler.state <- throttlerState{Tokens: ToFloat64(config["tokens"])}
	return throttler
}

func (t *Throttler) Throttle(cost2 any) <-chan bool {
	if cost2 == nil {
		cost2 = t.Config["cost"]
	}
	cost := ToFloat64(cost2)
	task := make(chan bool)

	queueElement := QueueElement{
		Cost: cost,
		Task: task,
		Id:   u.New().String(),
	}

	t.Queue.Enqueue(queueElement)
	t.startDrain()

	return task
}

// startDrain hands the start decision to the state owner, so a loop that is
// already draining the queue is never doubled and a loop that is exiting its
// empty check under the same token cannot miss the element just enqueued.
func (t *Throttler) startDrain() {
	st := <-t.state
	if st.Running {
		t.state <- st
		return
	}
	st.Running = true
	t.state <- st

	if t.Config["algorithm"] == "leakyBucket" {
		go t.leakyBucketLoop()
	} else {
		go t.rollingWindowLoop()
	}
}

// stopDrain is called by the draining loop while it still owns the state.
func (t *Throttler) stopDrain(st throttlerState) {
	st.Running = false
	t.state <- st
}

func (t *Throttler) leakyBucketLoop() {
	lastTimestamp := Milliseconds()
	for {
		st := <-t.state
		if t.Queue.IsEmpty() {
			t.stopDrain(st)
			return
		}
		t.state <- st

		first, _ := t.Queue.Peek()
		task := first.Task
		cost := first.Cost

		st = <-t.state
		if st.Tokens >= 0 {
			st.Tokens -= cost
			t.state <- st

			if task != nil {
				task <- true
				close(task)
			}
			t.Queue.Dequeue()
		} else {
			sleepTime := ToFloat64(t.Config["delay"]) * 1000
			t.state <- st
			time.Sleep(time.Duration(sleepTime) * time.Millisecond)

			current := Milliseconds()
			elapsed := current - lastTimestamp
			lastTimestamp = current

			st = <-t.state
			sumTokens := ToFloat64(t.Config["refillRate"]) * ToFloat64(elapsed)
			tokens := st.Tokens + sumTokens
			capacity := ToFloat64(t.Config["capacity"])
			if tokens < capacity {
				st.Tokens = tokens
			} else {
				st.Tokens = capacity
			}
			t.state <- st
		}
	}
}

func (t *Throttler) rollingWindowLoop() {
	for {
		st := <-t.state
		if t.Queue.IsEmpty() {
			t.stopDrain(st)
			return
		}
		t.state <- st

		first, _ := t.Queue.Peek()
		task := first.Task
		cost := first.Cost
		now := Milliseconds()

		st = <-t.state
		windowSize := ToFloat64(t.Config["windowSize"])
		maxWeight := ToFloat64(t.Config["maxWeight"])
		st.Timestamps = filterTimestamps(st.Timestamps, now, windowSize)
		totalCost := sumCosts(st.Timestamps)

		if totalCost+cost <= maxWeight {
			st.Timestamps = append(st.Timestamps, TimestampedCost{Timestamp: now, Cost: cost})
			t.state <- st

			if task != nil {
				task <- true
				close(task)
			}
			t.Queue.Dequeue()
		} else {
			waitTime := int64((st.Timestamps[0].Timestamp + int64(windowSize)) - now)
			t.state <- st

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
