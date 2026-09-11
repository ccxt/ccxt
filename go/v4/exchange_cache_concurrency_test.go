package ccxt

import (
	"fmt"
	"reflect"
	"runtime"
	"strconv"
	"sync"
	"testing"
)

// Native concurrency tests: goroutine interleavings have no counterpart in
// the shared single-event-loop TypeScript cache tests. Run with go test -race.
type concurrentCache interface {
	Append(any)
	GetLimit(any, any) any
	Clear()
	ToArray() []any
}

type concurrentCacheCase struct {
	name     string
	cache    concurrentCache
	row      func(int) any
	validate func() string
}

func concurrentCacheCases() []concurrentCacheCase {
	cases := []concurrentCacheCase{}
	for _, name := range []string{"plain", "id", "outcome", "side"} {
		var cache concurrentCache
		var inner *ArrayCache
		field, key := "symbol", "id"
		switch name {
		case "plain":
			inner = NewArrayCache(8)
			cache = inner
		case "id":
			c := NewArrayCacheBySymbolById(8)
			cache, inner = c, c.ArrayCache
		case "outcome":
			c := NewArrayCacheByOutcomeById(8)
			cache, inner = c, c.ArrayCache
			field = "outcome"
		case "side":
			c := NewArrayCacheBySymbolBySide()
			cache, inner = c, c.ArrayCache
			key = "side"
		}
		cases = append(cases, concurrentCacheCase{
			name: name, cache: cache,
			row: func(i int) any {
				return map[string]any{field: "A", key: strconv.Itoa(i % 8), "value": i}
			},
			validate: func() string {
				inner.Mu.Lock()
				defer inner.Mu.Unlock()
				indexed := 0
				for _, bucket := range inner.Hashmap {
					indexed += len(bucket)
				}
				if len(inner.Data) != indexed {
					return fmt.Sprintf("clear exposed mismatched rows/index: %d/%d", len(inner.Data), indexed)
				}
				for _, row := range inner.Data {
					m := row.(map[string]any)
					stored, found := inner.Hashmap[cacheKeyOf(m, field)][cacheKeyOf(m, key)]
					if !found || !reflect.DeepEqual(stored, row) {
						return "clear left an orphaned or stale row"
					}
				}
				return ""
			},
		})
	}
	timestamp := NewArrayCacheByTimestamp(8)
	cases = append(cases, concurrentCacheCase{
		name: "timestamp", cache: timestamp,
		row: func(i int) any { return []any{i % 8, i} },
		validate: func() string {
			timestamp.Mu.Lock()
			defer timestamp.Mu.Unlock()
			if len(timestamp.Data) != len(timestamp.Hashmap) {
				return "timestamp clear exposed mismatched rows/index"
			}
			for _, row := range timestamp.Data {
				ts, _ := cacheTimestampOf(row)
				stored, found := timestamp.Hashmap[ts]
				if !found || !reflect.DeepEqual(stored, row) {
					return "timestamp clear left an orphaned or stale row"
				}
			}
			return ""
		},
	})
	return cases
}

func runCacheWorkers(workers ...func()) {
	var joined sync.WaitGroup
	start := make(chan struct{})
	for _, work := range workers {
		joined.Add(1)
		go func() {
			defer joined.Done()
			<-start
			work()
		}()
	}
	close(start)
	joined.Wait()
}

func TestArrayCacheConcurrentPolling(t *testing.T) {
	for _, test := range concurrentCacheCases() {
		t.Run(test.name, func(t *testing.T) {
			// Fresh inputs belong to the writer. Snapshots remain shallow, so
			// readers only inspect length, not maps being merged by Append.
			runCacheWorkers(func() {
				for i := 0; i < 2000; i++ {
					test.cache.Append(test.row(i))
					runtime.Gosched()
				}
			}, func() {
				for i := 0; i < 2000; i++ {
					for _, symbol := range []any{nil, "A", "unknown"} {
						count := ParseInt(test.cache.GetLimit(symbol, 16))
						if count < 0 || count > 16 {
							t.Errorf("invalid concurrent update count: %v", count)
							return
						}
					}
					runtime.Gosched()
				}
			}, func() {
				for i := 0; i < 2000; i++ {
					if len(test.cache.ToArray()) > 8 {
						t.Error("concurrent append exceeded the retained key count")
						return
					}
					runtime.Gosched()
				}
			})
			if err := test.validate(); err != "" {
				t.Fatal(err)
			}
		})
	}
}

func TestArrayCacheClearIsAtomic(t *testing.T) {
	for _, test := range concurrentCacheCases() {
		t.Run(test.name, func(t *testing.T) {
			for i := 0; i < 8; i++ {
				test.cache.Append(test.row(i))
			}
			runCacheWorkers(func() {
				for i := 0; i < 4000; i++ {
					test.cache.Append(test.row(i))
					if err := test.validate(); err != "" {
						t.Error(err)
						return
					}
					runtime.Gosched()
				}
			}, func() {
				for i := 0; i < 4000; i++ {
					test.cache.Clear()
					if err := test.validate(); err != "" {
						t.Error(err)
						return
					}
					runtime.Gosched()
				}
			}, func() {
				for i := 0; i < 4000; i++ {
					test.cache.GetLimit(nil, nil)
					test.cache.GetLimit("A", nil)
					runtime.Gosched()
				}
			})
			test.cache.Clear()
			if len(test.cache.ToArray()) != 0 || test.cache.GetLimit(nil, nil) != 0 {
				t.Fatal("final clear must reset both storage and counters")
			}
		})
	}
}

func TestArrayCacheLockedPollingPreservesDeferredReset(t *testing.T) {
	for _, test := range concurrentCacheCases() {
		t.Run(test.name, func(t *testing.T) {
			test.cache.Append(test.row(0))
			test.cache.Append(test.row(1))
			for i := 0; i < 2; i++ {
				if test.cache.GetLimit(nil, nil) != 2 || test.cache.GetLimit("A", nil) != 2 {
					t.Fatal("polling must defer reset until the next append")
				}
			}
			test.cache.Append(test.row(1))
			if test.cache.GetLimit(nil, nil) != 1 || test.cache.GetLimit("A", nil) != 1 {
				t.Fatal("append must consume the pending resets")
			}
			test.cache.Clear()
			if len(test.cache.ToArray()) != 0 || test.cache.GetLimit(nil, nil) != 0 {
				t.Fatal("clear must reset cache and counters")
			}
			test.cache.Append(test.row(0))
			if test.cache.GetLimit(nil, nil) != 1 || test.cache.GetLimit("A", nil) != 1 {
				t.Fatal("append after clear must start fresh")
			}
		})
	}
}
