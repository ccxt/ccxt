package main

import (
	"ccxt"
	"fmt"
	"log"
	"strings"
	"time"
)

type MyStruct struct {
	OptionalBool *bool
}

// Function to create MyStruct
func CreateMyStruct(optionalValue interface{}) MyStruct {
	var optionalBool *bool
	if v, ok := optionalValue.(bool); ok {
		optionalBool = &v
	}
	return MyStruct{
		OptionalBool: optionalBool,
	}
}

// func first() {
// 	go func() {
// 		defer func() {
// 			if r := recover(); r != nil {
// 				// Re-panic to propagate the error to the main goroutine
// 				panic(r)
// 			}
// 		}()
// 		// Simulate a panic
// 		panic("panic in first")
// 	}()
// }

// func second() bool {
// 	var wg sync.WaitGroup
// 	wg.Add(1)

// 	go func() {
// 		defer wg.Done() // Mark WaitGroup as done when the goroutine completes
// 		defer func() {
// 			if r := recover(); r != nil {
// 				// Re-panic to propagate the error further
// 				panic(r)
// 			}
// 		}()
// 		// Call first, which might panic in its goroutine
// 		first()
// 	}()

// 	wg.Wait() // Wait for the goroutine in `first()` to complete
// 	return true
// }

// func first() <-chan interface{} {
// 	ch := make(chan interface{})
// 	var panicError interface{} = nil
// 	var wg sync.WaitGroup
// 	wg.Add(1)
// 	go func() interface{} {
// 		defer close(ch)
// 		defer wg.Done()
// 		defer func() {
// 			if r := recover(); r != nil {
// 				panicError = r
// 				return
// 			}
// 		}()
// 		panic("Method not implemented.")
// 		ch <- 1
// 		return nil
// 	}()
// 	wg.Wait()
// 	if panicError != nil {
// 		panic(panicError)
// 	}
// 	return ch
// }

// func First2() <-chan interface{} {
// 	ch := make(chan interface{})
// 	go func() interface{} {
// 		defer close(ch)
// 		// const res = await this.first()
// 		retRes745 := (<-first())
// 		PanicOnError(retRes745)
// 		ch <- 1
// 		return nil
// 	}()
// 	return ch
// }

// func first() <-chan interface{} {
// 	ch := make(chan interface{}, 1) // Buffered channel to handle result

// 	go func() {
// 		defer func() {
// 			if r := recover(); r != nil {
// 				// If a panic occurs, re-panic in the main execution context
// 				// to ensure it gets properly propagated.
// 				ch <- r // Send the panic to the channel as an indicator
// 			}
// 			close(ch) // Ensure the channel is closed once the operation is done
// 		}()

// 		// Simulate a situation where either a panic or a normal value is produced
// 		panic("Method not implemented.") // Simulate a panic
// 		// ch <- "normal value" // Uncomment to simulate normal operation
// 	}()

// 	return ch
// }

// func first() <-chan interface{} {
// 	ch := make(chan interface{})
// 	var panicError interface{} = nil

// 	go func() {
// 		defer func() {
// 			if r := recover(); r != nil {
// 				panicError = r
// 			}
// 		}()
// 		defer close(ch)
// 	}()

// 	go func() interface{} {
// 		panic(("Method not implemented."))
// 		ch <- 1
// 		return nil
// 	}()

// 	if panicError != nil {
// 		panic(panicError)
// 	}
// // 	return ch
// // }

// func first2() <-chan interface{} {
// 	ch := make(chan interface{})
// 	go func() interface{} {
// 		defer close(ch)

// 		{
// 			ret__ := func() (ret_ interface{}) {
// 				defer func() {
// 					if e := recover(); e != nil {
// 						if e == "break" {
// 							return
// 						}
// 						ret_ = func() interface{} {
// 							// catch block:
// 							fmt.Println("will not throw")
// 							return nil
// 						}()
// 					}
// 				}()
// 				// try block:
// 				var x interface{} = "1"
// 				_ = x
// 				return nil
// 			}()
// 			if ret__ != nil {
// 				ch <- ret__
// 			}
// 		}
// 		ch <- 2
// 		return nil
// 	}()
// 	return ch
// }

func First1() <-chan interface{} {
	ch := make(chan interface{})

	defer func() {
		if r := recover(); r != nil {
			if r != "break" {
				ch <- "panic:" + r.(string)
			}
		}
	}()
	go func() interface{} {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				ch <- r
			}
		}()
		panic("panic:Not implemented yet from first 1")
		ch <- 1
		return nil
	}()
	return ch
}
func First2() <-chan interface{} {
	ch := make(chan interface{})
	go func() interface{} {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				ch <- r
			}
		}()

		retRes375 := (<-First1())
		PanicOnError(retRes375)
		ch <- retRes375
		return nil
	}()
	return ch
}

func aux() <-chan interface{} {
	fmt.Println("Aux")
	ch := make(chan interface{})
	go func() interface{} {
		defer close(ch)
		defer func() {
			if r := recover(); r != nil {
				ch <- r
			}
		}()
		{
			ret__ := func() (ret_ interface{}) {
				defer func() {
					if e := recover(); e != nil {
						if e == "break" {
							return
						}
						ret_ = func() interface{} {
							// catch block:
							fmt.Println("Will handle error without throwing" + e.(string))
							return nil
						}()
					}
				}()
				// try block:
				res := (<-First2())
				PanicOnError(res)
				ch <- res
				return nil
			}()
			if ret__ != nil {
				ch <- ret__
			}
		}
		ch <- 1
		return nil
	}()
	return ch
}

func second() bool {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in second:", r)
			// panic(r)
		}
	}()
	res := <-First2()
	PanicOnError(res)
	fmt.Println(res)
	return false
}

func third() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered in third:", r)
		}
	}()

	second() // Call second, which could panic if `first()` has an issue
}

func main() {
	// second()
	// third()
	fmt.Println("Let's GO CCXT!")
	bybit := ccxt.NewBybit()
	bybit.Init(map[string]interface{}{})
	// bybit.Verbose = true
	bybit.SetSandboxMode(true)
	start := time.Now()
	log.Printf("will load markets")
	<-bybit.LoadMarkets()
	elapsed := time.Since(start)
	// fmt.Println(res)
	log.Printf("Loading markets took %s", elapsed)
	fmt.Println(("num of markets:"), len(bybit.Markets))
	// return
	bybit.ApiKey = "luDbnc4jVrDF7F4HFM"
	bybit.Secret = "AO2jICPaoERif6VBntB7WqOibqSLBkYrAEPx"
	start = time.Now()
	orderCh := bybit.CreateOrder("ADA/USDT:USDT", "limit", "buy", 20, 0.3)
	// orderCh := bybit.FetchMyTrades("ADA/USDT:USDT", nil, nil, nil)
	order := <-orderCh
	elapsed = time.Since(start)
	log.Printf("Creating order took %s", elapsed)
	fmt.Println(bybit.Json(order))
}

// func longRunningTask(id string) <-chan int32 {
// 	r := make(chan int32)

// 	go func() {
// 		// Simulate a workload.
// 		time.Sleep(time.Second * 3)
// 		fmt.Println(id)
// 		if 1 == 2 {
// 			r <- 5
// 			return

// 		}
// 		r <- 7
// 	}()

// 	return r
// }

// func main() {
// 	// r := <-longRunningTask("1")
// 	// <-longRunningTask("2")
// 	// aC, bC := longRunningTask("1"), longRunningTask("2")
// 	// a, b := <-aC, <-bC
// 	// fmt.Println(a, b)
// 	// fmt.Println(r)
// 	aa := (<-longRunningTask("1"))
// 	fmt.Println(aa)

// }

type main2 struct {
}

func PanicOnError(msg interface{}) {
	if str, ok := msg.(string); ok && strings.HasPrefix(str, "panic:") {
		panic(msg)
	}
}

// func (this *main2) Teste() <-chan interface{} {
// 	ch := make(chan interface{})
// 	go func() {
// 		defer close(ch)
// 		if IsTrue(1) {
// 			fmt.Println("teste")
// 			ch <- 1
// 			return
// 		}
// 		ch <- 2
// 		return
// 	}()
// 	return ch
// }

// func (this *main2) Main() {
// 	ch := make(chan interface{})
// 	go func() {
// 		defer close(ch)
// 		fmt.Println("main")
// 		var result interface{} = (<-this.Teste())
// 		fmt.Println(result)
// 	}()
// 	return ch
// }
