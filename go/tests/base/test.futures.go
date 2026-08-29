package base

import (
	"fmt"
	"sync"
	"time"

	ccxt "github.com/ccxt/ccxt/go/v4"
)

func TestFutures() {
	fmt.Println("Running Futures tests...")
	BroadCastResultToMultipleReceivers()
	FuturesRaceMultipleReceiversTest()
	AwaitAfterResolveTest()
	fmt.Println("Futures tests passed!")
}

func BroadCastResultToMultipleReceivers() {

	fut := ccxt.NewFuture()

	var wg sync.WaitGroup
	wg.Add(3)

	go func() {
		defer wg.Done()
		time.Sleep(1 * time.Second)
		fut.Resolve("hello")
	}()

	go func() {
		defer wg.Done()
		f := fut.Await()
		<-f
		// fmt.Println("res1:", res1)
	}()

	go func() {
		defer wg.Done()
		f := fut.Await()
		<-f
		// fmt.Println("res2:", res2)
	}()

	wg.Wait()
}

func AwaitAfterResolveTest() {
	fut := ccxt.NewFuture()
	ch2 := fut.Await()
	// ch1 will be awaited after fut is resolved

	var wg sync.WaitGroup
	wg.Add(3)

	go func() {
		defer wg.Done()
		time.Sleep(1 * time.Second)
		ch1 := fut.Await()
		<-ch1
		// fmt.Println("Got result from ch1:", res)
	}()

	go func(ch2 <-chan interface{}) {
		defer wg.Done()
		<-ch2
		// fmt.Println("Got result from ch2:", res)
	}(ch2)

	go func() {
		defer wg.Done()
		time.Sleep(500 * time.Millisecond)
		fut.Resolve("Hello world!")
		// fmt.Println("Resolved future")
	}()

	wg.Wait()
	// fmt.Println("All done!")
}

func FuturesRaceMultipleReceiversTest() {

	client := ccxt.NewClient("url", nil, nil, nil, nil, nil)
	fut := client.NewFuture("ob:BTC/USDT")

	go func(fut *ccxt.Future) {
		time.Sleep(2 * time.Second)
		// fmt.Println("[main]resolving future now", fut)
		fut.Resolve("hello")
		// fmt.Println("[main]resolved future", fut)
	}(fut)

	futures := []*ccxt.Future{fut}
	race1 := ccxt.FutureRace(futures)
	race2 := ccxt.FutureRace(futures)

	r1 := waitFuture(client, race1)
	r2 := waitFuture(client, race2)
	<-r1
	<-r2
}

func waitFuture(client *ccxt.Client, fut *ccxt.Future) <-chan interface{} {
	ch := make(chan interface{})
	go func() {
		defer close(ch)
		f := fut.Await()
		<-f
		ch <- true
	}()

	return ch
}

// to do: add this use case later
// var futureMap = map[string]interface{}{}
// var authToken string
// var exchange = ccxt.NewExchange()

// func fakeAuthRequest() <-chan interface{} {
//     ch := make(chan interface{}, 1)

//     go func() {
//         // ch <- nil
//         fmt.Println("Will request auth...")
//         time.Sleep(5 * time.Second)
//         authToken = "tokennn"
//         ch <- authToken
//     }()
//     return ch
// }

// func authenticate() <-chan interface{} {
//     ch := make(chan interface{}, 1)

//     go func() {

//         if future, ok := futureMap["auth"]; ok {
//             fmt.Println("Reusing existing auth future...")
//             ch <- <-future.(<-chan interface{})
//         } else {
//             fmt.Println("Spawning new auth future...")
//             authFutur := exchange.Spawn(fakeAuthRequest)
//             futureMap["auth"] = authFutur
//             ch <- <-authFutur
//         }

//     }()
//     return ch
// }

// func privateRequest(id string) <-chan interface{} {
//     ch := make(chan interface{}, 1)

//     go func() {
//         <-authenticate()
//         fmt.Println("Private request done: "+id, ":", authToken)

//     }()
//     return ch
// }

// func main() {

//     ch1 := privateRequest("req1")
//     ch2 := privateRequest("req2")
//     ch3 := privateRequest("req3")

//     <-ch1
//     <-ch2
//     <-ch3

//     fmt.Println("All done")

// }
