// CCXT cross-language benchmark — Go
//
// Mirrors examples/benchmarks/bench.mjs: same workload, same metrics, same
// ##RESULT## output.
//
//	latency / CPU (getrusage) / peak RSS (/proc/self/status VmHWM) / bandwidth
//
// Run from the go/ module root:
//
//	go run ./benchmark rest   |   go run ./benchmark ws
//
// Config via env: BENCH_EXCHANGE, BENCH_SYMBOL, BENCH_REST_ITERS,
//
//	BENCH_WS_UPDATES, BENCH_SLEEP_MS
package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
	ccxtpro "github.com/ccxt/ccxt/go/v4/pro"
)

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func round2all(xs []float64) []float64 {
	out := make([]float64, len(xs))
	for i, x := range xs {
		out[i] = math.Round(x*100) / 100
	}
	return out
}

func envInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}

func nowMs() float64 {
	return float64(time.Now().UnixNano()) / 1e6
}

func statusKb(field string) int {
	f, err := os.Open("/proc/self/status")
	if err != nil {
		return 0
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := sc.Text()
		if strings.HasPrefix(line, field+":") {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				n, _ := strconv.Atoi(fields[1])
				return n
			}
		}
	}
	return 0
}

func peakRssKb() int    { return statusKb("VmHWM") }
func currentRssKb() int { return statusKb("VmRSS") }

// deterministic synthetic order book (integer values), matching the other languages
func buildRawBook(levels int) string {
	bids := make([][]int, levels)
	asks := make([][]int, levels)
	for i := 0; i < levels; i++ {
		bids[i] = []int{1000000 - i, 500 + i}
		asks[i] = []int{1000000 + i, 500 + i}
	}
	b, _ := json.Marshal(map[string]any{"bids": bids, "asks": asks, "timestamp": 1700000000000})
	return string(b)
}

func cpuSecs() (float64, float64) {
	var ru syscall.Rusage
	syscall.Getrusage(syscall.RUSAGE_SELF, &ru)
	user := float64(ru.Utime.Sec) + float64(ru.Utime.Usec)/1e6
	sys := float64(ru.Stime.Sec) + float64(ru.Stime.Usec)/1e6
	return user, sys
}

func round(v float64, d int) float64 {
	p := 1.0
	for i := 0; i < d; i++ {
		p *= 10
	}
	return float64(int64(v*p+0.5)) / p
}

func stats(arr []float64) map[string]float64 {
	if len(arr) == 0 {
		return map[string]float64{"min": 0, "median": 0, "avg": 0, "p95": 0, "max": 0}
	}
	s := make([]float64, len(arr))
	copy(s, arr)
	sort.Float64s(s)
	n := len(s)
	q := func(p float64) float64 {
		idx := int(p * float64(n))
		if idx >= n {
			idx = n - 1
		}
		return s[idx]
	}
	sum := 0.0
	for _, v := range s {
		sum += v
	}
	return map[string]float64{
		"min": round(s[0], 2),
		"p50": round(q(0.5), 2),
		"p90": round(q(0.9), 2),
		"p95": round(q(0.95), 2),
		"p99": round(q(0.99), 2),
		"max": round(s[n-1], 2),
		"avg": round(sum/float64(n), 2),
	}
}

func emit(obj map[string]any) {
	b, _ := json.Marshal(obj)
	fmt.Println("##RESULT## " + string(b))
}

func main() {
	mode := "rest"
	if len(os.Args) > 1 {
		mode = os.Args[1]
	}
	exchange := env("BENCH_EXCHANGE", "coinbase")
	symbol := env("BENCH_SYMBOL", "BTC/USD")
	if mode == "rest" {
		benchRest(exchange, symbol)
	} else if mode == "ws" {
		benchWs(exchange, symbol)
	} else {
		benchLoad(exchange, symbol)
	}
}

// offline compute-bound load: parse a large order book in a tight loop (no network).
func benchLoad(exchange, symbol string) {
	seconds := envInt("BENCH_LOAD_SECONDS", 8)
	levels := envInt("BENCH_LOAD_LEVELS", 1000)
	retain := envInt("BENCH_LOAD_RETAIN", 2000)
	ex := ccxt.NewCoinbase(map[string]any{})
	raw := buildRawBook(levels)
	for i := 0; i < 200; i++ {
		ex.ParseOrderBook(ex.ParseJson(raw), symbol)
	}
	// Part A — CPU throughput, time-boxed
	u0, s0 := cpuSecs()
	t0 := nowMs()
	deadline := t0 + float64(seconds)*1000
	ops := 0
	sink := 0
	for nowMs() < deadline {
		ob := ex.ParseOrderBook(ex.ParseJson(raw), symbol)
		if m, ok := ob.(map[string]any); ok {
			if b, ok := m["bids"].([]any); ok {
				sink += len(b)
			}
		}
		ops++
	}
	wallA := nowMs() - t0
	u1, s1 := cpuSecs()
	cpu := (u1 - u0) + (s1 - s0)
	// Part B — memory footprint of retained structures
	rssBefore := currentRssKb()
	kept := make([]any, 0, retain)
	for i := 0; i < retain; i++ {
		kept = append(kept, ex.ParseOrderBook(ex.ParseJson(raw), symbol))
	}
	rssAfter := currentRssKb()
	perBookKb := round(float64(rssAfter-rssBefore)/float64(retain), 2)
	_ = sink
	emit(map[string]any{
		"language":     "Go",
		"runtime":      runtime.Version(),
		"ccxt":         ccxt.Version,
		"mode":         "load",
		"levels":       levels,
		"seconds":      seconds,
		"ops":          ops,
		"opsPerSec":    round(float64(ops)/(wallA/1000.0), 1),
		"cpuUserSec":   round(u1-u0, 3),
		"cpuSystemSec": round(s1-s0, 3),
		"cpuPerOpUs":   round(cpu*1e6/float64(ops), 2),
		"peakRssMb":    round(float64(peakRssKb())/1024.0, 1),
		"retainBooks":  retain,
		"perBookKb":    perBookKb,
		"keptLen":      len(kept),
	})
}

func benchRest(exchange, symbol string) {
	iters := envInt("BENCH_REST_ITERS", 60)
	warmup := envInt("BENCH_REST_WARMUP", 5)
	sleepMs := envInt("BENCH_SLEEP_MS", 250)
	// We report wall clock around FetchOrderBook only. An earlier version split
	// that into "network" and "processing" via an instrumented base; the control
	// in examples/benchmarks/net-baseline showed those spans are not comparable
	// across languages, so the split was dropped rather than reported.
	// NOTE: the Go build does not populate Last_http_response, so bytesTotal stays 0.
	ex := ccxt.NewCoinbase(map[string]any{"enableRateLimit": false})
	w0 := nowMs()
	ex.LoadMarkets()
	loadMarketsMs := nowMs() - w0
	// warmup: prime the TCP/TLS connection and let tiered JITs settle before we measure
	for w := 0; w < warmup; w++ {
		ex.FetchOrderBook(symbol)
	}
	u0, s0 := cpuSecs()
	latency := []float64{}
	totalBytes := 0
	for i := 0; i < iters; i++ {
		t0 := nowMs()
		ex.FetchOrderBook(symbol)
		total := nowMs() - t0
		latency = append(latency, total)
		if ex.Last_http_response != nil {
			totalBytes += len(fmt.Sprint(ex.Last_http_response))
		}
		time.Sleep(time.Duration(sleepMs) * time.Millisecond)
	}
	u1, s1 := cpuSecs()
	emit(map[string]any{
		"language":      "Go",
		"runtime":       runtime.Version(),
		"ccxt":          ccxt.Version,
		"mode":          "rest",
		"exchange":      exchange,
		"symbol":        symbol,
		"iterations":    iters,
		"loadMarketsMs": round(loadMarketsMs, 2),
		"latencyMs":     stats(latency),
		// raw per-call samples so any percentile can be recomputed from the data
		"latencySamplesMs": round2all(latency),
		"cpuUserSec":       round(u1-u0, 3),
		"cpuSystemSec":     round(s1-s0, 3),
		"peakRssMb":        round(float64(peakRssKb())/1024.0, 1),
		"bytesTotal":       totalBytes,
		"bytesPerCall":     totalBytes / iters,
	})
}

func benchWs(exchange, symbol string) {
	updates := envInt("BENCH_WS_UPDATES", 200)
	ex := ccxtpro.NewCoinbase(map[string]any{})
	ex.LoadMarkets()
	// the first update builds the full snapshot (a large one-time cost); measure it
	// separately and start the CPU/steady-state counters only AFTER it
	st0 := nowMs()
	ex.WatchOrderBook(symbol)
	firstMs := nowMs() - st0
	steady := updates - 1
	u0, s0 := cpuSecs()
	t0 := nowMs()
	last := t0
	gaps := []float64{}
	for i := 0; i < steady; i++ {
		ex.WatchOrderBook(symbol)
		t := nowMs()
		gaps = append(gaps, t-last)
		last = t
	}
	steadyMs := nowMs() - t0
	u1, s1 := cpuSecs()
	cpuUser := u1 - u0
	emit(map[string]any{
		"language":       "Go",
		"runtime":        runtime.Version(),
		"ccxt":           ccxt.Version,
		"mode":           "ws",
		"exchange":       exchange,
		"symbol":         symbol,
		"updates":        steady,
		"firstUpdateMs":  round(firstMs, 2),
		"gapMs":          stats(gaps),
		"updatesPerSec":  round(float64(steady)/(steadyMs/1000.0), 2),
		"cpuPerUpdateMs": round(cpuUser*1000.0/float64(steady), 3),
		"cpuUserSec":     round(cpuUser, 3),
		"cpuSystemSec":   round(s1-s0, 3),
		"peakRssMb":      round(float64(peakRssKb())/1024.0, 1),
	})
}
