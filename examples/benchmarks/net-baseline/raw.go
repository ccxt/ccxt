// Raw keep-alive HTTPS GET baseline — no CCXT. net/http through the agent proxy.
package main

import ("encoding/json";"fmt";"io";"net/http";"os";"strconv";"time")

func main() {
	url := "https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD"
	n := 10
	if len(os.Args) > 1 { n, _ = strconv.Atoi(os.Args[1]) }
	c := &http.Client{Transport: &http.Transport{Proxy: http.ProxyFromEnvironment, MaxIdleConnsPerHost: 10, IdleConnTimeout: 60 * time.Second}}
	get := func() int { r, e := c.Get(url); if e != nil { panic(e) }; b, _ := io.ReadAll(r.Body); r.Body.Close(); return len(b) }
	for i := 0; i < 3; i++ { get() }
	t := []float64{}; bytes := 0
	for i := 0; i < n; i++ {
		a := time.Now(); bytes = get()
		t = append(t, float64(time.Since(a).Microseconds())/1000.0)
		time.Sleep(250 * time.Millisecond)
	}
	o, _ := json.Marshal(map[string]any{"lang": "Go", "samples": t, "bytes": bytes})
	fmt.Println(string(o))
}
