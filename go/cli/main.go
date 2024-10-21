package main

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

func main() {
	// fmt.Println("Let's GO CCXT!")
	// bybit := ccxt.Bybit{}
	// bybit.Init(map[string]interface{}{})
	// bybit.SetSandboxMode(true)
	// start := time.Now()
	// log.Printf("will load markets")
	// <-bybit.LoadMarkets()
	// // bybit.Verbose = true
	// elapsed := time.Since(start)
	// log.Printf("Loading markets took %s", elapsed)
	// bybit.ApiKey = "luDbnc4jVrDF7F4HFM"
	// bybit.Secret = "AO2jICPaoERif6VBntB7WqOibqSLBkYrAEPx"
	// // orderCh := bybit.CreateOrder("ADA/USDT:USDT", "limit", "buy", 20, 0.3)
	// orderCh := bybit.FetchMyTrades("ADA/USDT:USDT", nil, nil, nil)
	// order := <-orderCh
	// fmt.Println(bybit.Json(order))

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
