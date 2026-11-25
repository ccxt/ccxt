package ccxt

import (
	"fmt"
	"math"
	"math/rand"
	"sync"
	"testing"
)

// ---------------------------------------------------------------------------
// Writer-race regression tests for the ws order book sides.
//
// The generated watchOrderBook methods return orderbook.Limit() from the
// consumer goroutine while the ws message handler goroutine keeps applying
// deltas to the same book. Both paths copy-on-write Data / Index and publish,
// so without mutual exclusion they interleave and leave Data, Index and Length
// out of sync: duplicate levels, undeleted levels, crossed books or a panic
// inside StoreArray (seen live on krakenfutures, which sends one message per
// price level).
// ---------------------------------------------------------------------------

const raceRounds = 5
const raceStoresPerRound = 2000

type raceSide struct {
	name    string
	side    IOrderBookSide
	store   func(r *rand.Rand)
	data    func() [][]any
	index   func() []float64
	length  func() int
	hashmap func() map[any]float64 // indexed side only
	strict  bool                   // one row per price level
}

func newRaceSide(kind string, bids bool, depth any) raceSide {
	price := func(r *rand.Rand) float64 { return float64(1 + r.Intn(60)) }
	size := func(r *rand.Rand) float64 { return float64(r.Intn(3)) }
	switch kind {
	case "plain":
		side := NewOrderBookSide(bids, []any{}, depth)
		return raceSide{
			name:   kind,
			side:   side,
			store:  func(r *rand.Rand) { _ = side.Store(price(r), size(r)) },
			data:   func() [][]any { return side.Data },
			index:  func() []float64 { return side.Index },
			length: func() int { return side.Length },
			strict: true,
		}
	case "counted":
		side := NewCountedOrderBookSide(bids, []any{}, depth)
		return raceSide{
			name:   kind,
			side:   side,
			store:  func(r *rand.Rand) { side.StoreArray([]any{price(r), size(r), float64(r.Intn(3))}) },
			data:   func() [][]any { return side.OrderBookSide.Data },
			index:  func() []float64 { return side.OrderBookSide.Index },
			length: func() int { return side.OrderBookSide.Length },
			strict: true,
		}
	case "indexed":
		side := NewIndexedOrderBookSide(bids, []any{}, depth)
		return raceSide{
			name:    kind,
			side:    side,
			store:   func(r *rand.Rand) { side.StoreArray([]any{price(r), size(r), fmt.Sprintf("id%d", r.Intn(40))}) },
			data:    func() [][]any { return side.Data },
			index:   func() []float64 { return side.Index },
			length:  func() int { return side.Length },
			hashmap: func() map[any]float64 { return side.Hashmap },
		}
	}
	panic("unknown side kind " + kind)
}

// checkSideConsistent asserts the structural invariants every writer must
// leave behind once all goroutines are done.
func checkSideConsistent(t *testing.T, rs raceSide, bids bool) {
	t.Helper()
	data := rs.data()
	index := rs.index()
	length := rs.length()
	if len(data) != length {
		t.Fatalf("%s: len(Data)=%d differs from Length=%d", rs.name, len(data), length)
	}
	if length > len(index) {
		t.Fatalf("%s: Length=%d exceeds len(Index)=%d", rs.name, length, len(index))
	}
	for i := 0; i < length; i++ {
		row := data[i]
		if len(row) < 2 {
			t.Fatalf("%s: row %d is malformed: %v", rs.name, i, row)
		}
		expected := row[0].(float64)
		if bids {
			expected = -expected
		}
		if index[i] != expected {
			t.Fatalf("%s: Index[%d]=%v does not match Data[%d][0]=%v", rs.name, i, index[i], i, row[0])
		}
		if i > 0 {
			if rs.strict && !(index[i-1] < index[i]) {
				t.Fatalf("%s: Index is not strictly increasing at %d: %v, %v", rs.name, i, index[i-1], index[i])
			}
			if !rs.strict && index[i-1] > index[i] {
				t.Fatalf("%s: Index is not sorted at %d: %v, %v", rs.name, i, index[i-1], index[i])
			}
		}
	}
	for i := length; i < len(index); i++ {
		if index[i] != math.MaxFloat64 {
			t.Fatalf("%s: Index[%d]=%v past Length=%d is not the sentinel", rs.name, i, index[i], length)
		}
	}
	if rs.hashmap != nil {
		ids := rs.hashmap()
		if len(ids) != length {
			t.Fatalf("%s: len(Hashmap)=%d differs from Length=%d", rs.name, len(ids), length)
		}
		for i := 0; i < length; i++ {
			id := normalizeId(data[i][2])
			mapped, ok := ids[id]
			if !ok || mapped != index[i] {
				t.Fatalf("%s: Hashmap[%s]=%v (present=%v) does not match Index[%d]=%v", rs.name, id, mapped, ok, i, index[i])
			}
		}
	}
	// the published view must describe the same final state
	if published := rs.side.GetData(); len(published) != length {
		t.Fatalf("%s: published view has %d rows, Length=%d", rs.name, len(published), length)
	}
}

// unsortedRows describes the first ordering violation in a published copy:
// asks ascend, bids descend, strictly so when a price level holds one row.
func unsortedRows(rows [][]any, bids bool, strict bool) string {
	for i := 1; i < len(rows); i++ {
		previous := rows[i-1][0].(float64)
		current := rows[i][0].(float64)
		if bids {
			previous, current = -previous, -current
		}
		if previous > current || (strict && previous == current) {
			return fmt.Sprintf("is out of order at row %d: %v then %v", i, rows[i-1][0], rows[i][0])
		}
	}
	return ""
}

// runGuarded runs f and reports a panic as a test failure instead of killing
// the whole test binary.
func runGuarded(t *testing.T, wg *sync.WaitGroup, label string, f func()) {
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer func() {
			if r := recover(); r != nil {
				t.Errorf("%s panicked: %v", label, r)
			}
		}()
		f()
	}()
}

func TestOrderBookSideConcurrentStoreAndLimit(t *testing.T) {
	for _, kind := range []string{"plain", "counted", "indexed"} {
		for _, bids := range []bool{false, true} {
			for _, depth := range []any{nil, 10} {
				name := fmt.Sprintf("%s/bids=%v/depth=%v", kind, bids, depth)
				t.Run(name, func(t *testing.T) {
					for round := 0; round < raceRounds; round++ {
						rs := newRaceSide(kind, bids, depth)
						r := rand.New(rand.NewSource(int64(round + 1)))
						done := make(chan struct{})
						var writer, limiter sync.WaitGroup
						runGuarded(t, &limiter, name+" Limit", func() {
							for {
								select {
								case <-done:
									return
								default:
									rs.side.Limit()
								}
							}
						})
						// what a consumer sees: every published copy must be sorted
						runGuarded(t, &limiter, name+" reader", func() {
							for {
								select {
								case <-done:
									return
								default:
									if problem := unsortedRows(rs.side.GetDataCopy(), bids, rs.strict); problem != "" {
										t.Errorf("%s: published copy %s", name, problem)
										return
									}
								}
							}
						})
						runGuarded(t, &writer, name+" Store", func() {
							for i := 0; i < raceStoresPerRound; i++ {
								rs.store(r)
							}
						})
						writer.Wait()
						close(done)
						limiter.Wait()
						if t.Failed() {
							return
						}
						checkSideConsistent(t, rs, bids)
					}
				})
			}
		}
	}
}

func raceSnapshot(r *rand.Rand, third string) map[string]any {
	rows := func() []any {
		out := []any{}
		for price := 1; price <= 60; price++ {
			if r.Intn(2) == 0 {
				continue
			}
			row := []any{float64(price), float64(1 + r.Intn(3))}
			switch third {
			case "count":
				row = append(row, float64(1+r.Intn(3)))
			case "id":
				row = append(row, fmt.Sprintf("snap%d", price))
			}
			out = append(out, row)
		}
		return out
	}
	return map[string]any{"asks": rows(), "bids": rows()}
}

// a snapshot reset from one goroutine (the spawned rest snapshot loader), live
// deltas from the handler and Limit from the consumer, all on the same book
func TestOrderBookConcurrentResetStoreAndLimit(t *testing.T) {
	type bookCase struct {
		name  string
		third string // extra snapshot column: "", "count" or "id"
		book  func() OrderBookInterface
		store func(side IOrderBookSide, r *rand.Rand)
		wrap  func(side IOrderBookSide) raceSide
	}
	plainStore := func(side IOrderBookSide, r *rand.Rand) {
		_ = side.Store(float64(1+r.Intn(60)), float64(r.Intn(3)))
	}
	cases := []bookCase{
		{
			name:  "plain",
			book:  func() OrderBookInterface { return NewWsOrderBook(nil, 10) },
			store: plainStore,
			wrap: func(side IOrderBookSide) raceSide {
				s := side.(*OrderBookSide)
				return raceSide{name: "plain", side: s, strict: true,
					data: func() [][]any { return s.Data }, index: func() []float64 { return s.Index }, length: func() int { return s.Length }}
			},
		},
		{
			name:  "counted",
			third: "count",
			book:  func() OrderBookInterface { return NewCountedOrderBook(nil, 10) },
			store: func(side IOrderBookSide, r *rand.Rand) {
				side.StoreArray([]any{float64(1 + r.Intn(60)), float64(r.Intn(3)), float64(r.Intn(3))})
			},
			wrap: func(side IOrderBookSide) raceSide {
				s := side.(*CountedOrderBookSide).OrderBookSide
				return raceSide{name: "counted", side: side, strict: true,
					data: func() [][]any { return s.Data }, index: func() []float64 { return s.Index }, length: func() int { return s.Length }}
			},
		},
		{
			name:  "indexed",
			third: "id",
			book:  func() OrderBookInterface { return NewIndexedOrderBook(nil, 10) },
			store: func(side IOrderBookSide, r *rand.Rand) {
				side.StoreArray([]any{float64(1 + r.Intn(60)), float64(r.Intn(3)), fmt.Sprintf("id%d", r.Intn(40))})
			},
			wrap: func(side IOrderBookSide) raceSide {
				s := side.(*IndexedOrderBookSide)
				return raceSide{name: "indexed", side: s,
					data: func() [][]any { return s.Data }, index: func() []float64 { return s.Index }, length: func() int { return s.Length },
					hashmap: func() map[any]float64 { return s.Hashmap }}
			},
		},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			for round := 0; round < raceRounds; round++ {
				book := c.book()
				storeRand := rand.New(rand.NewSource(int64(round + 1)))
				resetRand := rand.New(rand.NewSource(int64(round + 1000)))
				done := make(chan struct{})
				var writer, background sync.WaitGroup
				runGuarded(t, &background, c.name+" Limit", func() {
					for {
						select {
						case <-done:
							return
						default:
							book.Limit()
						}
					}
				})
				runGuarded(t, &background, c.name+" Reset", func() {
					for {
						select {
						case <-done:
							return
						default:
							book.Reset(raceSnapshot(resetRand, c.third))
						}
					}
				})
				runGuarded(t, &writer, c.name+" Store", func() {
					for i := 0; i < raceStoresPerRound; i++ {
						c.store(book.GetAsks(), storeRand)
						c.store(book.GetBids(), storeRand)
					}
				})
				writer.Wait()
				close(done)
				background.Wait()
				if t.Failed() {
					return
				}
				checkSideConsistent(t, c.wrap(book.GetAsks()), false)
				checkSideConsistent(t, c.wrap(book.GetBids()), true)
			}
		})
	}
}

// BenchmarkOrderBookSideStore measures the per-delta cost on a 100 level side:
// an insert, a size update and a delete per iteration.
func BenchmarkOrderBookSideStore(b *testing.B) {
	side := NewOrderBookSide(false, []any{}, nil)
	for i := 1; i <= 100; i++ {
		_ = side.Store(float64(i*2), 1.0)
	}
	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		price := float64((i%100)*2 + 1)
		_ = side.Store(price, 1.0)
		_ = side.Store(price, 2.0)
		_ = side.Store(price, 0.0)
	}
}

func BenchmarkIndexedOrderBookSideStore(b *testing.B) {
	side := NewIndexedOrderBookSide(false, [][]any{}, nil)
	for i := 1; i <= 100; i++ {
		side.StoreArray([]any{float64(i * 2), 1.0, fmt.Sprintf("seed%d", i)})
	}
	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		price := float64((i%100)*2 + 1)
		side.StoreArray([]any{price, 1.0, "bench"})
		side.StoreArray([]any{price, 2.0, "bench"})
		side.StoreArray([]any{price, 0.0, "bench"})
	}
}
