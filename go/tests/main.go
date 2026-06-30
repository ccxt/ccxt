package main

import (
	"fmt"
	"sync"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

func main() {
	TestClientSubscriptionsDataRace()
	// RUN_BASE_TESTS := base.GetCliArgValue("--baseTests")
	// WS_TESTS := base.GetCliArgValue("--ws")
	// if RUN_BASE_TESTS {
	// 	if WS_TESTS {
	// 		cache.TestWsCache()
	// 		cache.TestWsOrderBook()
	// 		fmt.Println("Base WS tests passed!")
	// 	} else {
	// 		res := <-base.BaseTestsInit()
	// 		base.PanicOnError(res)
	// 		fmt.Println("Base REST tests passed!")
	// 	}

	// 	return
	// }
	// tests := base.NewTestMainClass()

	// argvExchange := base.GetCliPositionalArg(0)
	// argvSymbol := base.GetCliPositionalArg(1)
	// argvMethod := base.GetCliPositionalArg(2)

	// res := <-tests.Init(argvExchange, argvSymbol, argvMethod)
	// base.Print("Got res: " + base.ToString(res))
	// base.PanicOnError(res)
}

// TestClientSubscriptionsDataRace stresses concurrent access to Client.Subscriptions.
// Writers add/remove subscriptions the same way Subscribe/unsubscribe do, while readers
// access them through the public GetSubscriptions() accessor and iterate the result -
// exactly how external callers consume it. Subscriptions is backed by a sync.Map, so this
// must run cleanly with no data race; `go run -race` would flag any unsynchronized access.
func TestClientSubscriptionsDataRace() {
	client := ccxt.NewClient("wss://example.com/ws", nil, nil, nil, nil)
	var wg sync.WaitGroup
	const workers = 8
	const iterations = 5000
	// writers: add then remove a subscription, mirroring exchange.Subscribe / unsubscribe
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for i := 0; i < iterations; i++ {
				hash := fmt.Sprintf("sub-%d-%d", id, i)
				client.Subscriptions.Store(hash, true)
				client.Subscriptions.Delete(hash)
			}
		}(w)
	}
	// readers: consume the subscriptions through the public accessor and iterate them
	for r := 0; r < workers; r++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := 0; i < iterations; i++ {
				subs := client.GetSubscriptions()
				count := 0
				for range subs {
					count++
				}
				_ = count
			}
		}()
	}
	wg.Wait()
	fmt.Println("Client.Subscriptions data race test passed!")
}
