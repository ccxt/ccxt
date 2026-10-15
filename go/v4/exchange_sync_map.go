package ccxt

import "sync"

// SyncMap is a typed, concurrency-safe string-keyed cache (ws tickers / bidsasks).
// Keys arrive as the transpiled symbol box (string, *string or any); a nil or
// non-string key is absent, like the javascript object it replaces.
type SyncMap[T any] struct {
	m sync.Map
}

// TickerCache holds the ws ticker and bidask caches.
type TickerCache = SyncMap[any]

func syncMapKey(k any) (string, bool) {
	s, ok := derefScalar(k).(string)
	return s, ok
}

func (s *SyncMap[T]) Store(k any, v T) {
	if key, ok := syncMapKey(k); ok {
		s.m.Store(key, v)
	}
}

func (s *SyncMap[T]) Load(k any) (T, bool) {
	var zero T
	key, ok := syncMapKey(k)
	if !ok || s == nil {
		return zero, false
	}
	v, found := s.m.Load(key)
	if !found {
		return zero, false
	}
	return v.(T), true
}

// Get answers the stored value or T's zero value when absent.
func (s *SyncMap[T]) Get(k any) T {
	v, _ := s.Load(k)
	return v
}

func (s *SyncMap[T]) Has(k any) bool {
	_, ok := s.Load(k)
	return ok
}

func (s *SyncMap[T]) Delete(k any) {
	if key, ok := syncMapKey(k); ok && s != nil {
		s.m.Delete(key)
	}
}

func (s *SyncMap[T]) Keys() []string {
	keys := []string{}
	if s == nil {
		return keys
	}
	s.m.Range(func(k, _ any) bool {
		keys = append(keys, k.(string))
		return true
	})
	return keys
}

// ToMap is a snapshot of the cache as a plain map.
func (s *SyncMap[T]) ToMap() map[string]T {
	out := map[string]T{}
	if s == nil {
		return out
	}
	s.m.Range(func(k, v any) bool {
		out[k.(string)] = v.(T)
		return true
	})
	return out
}
