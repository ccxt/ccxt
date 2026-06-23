```go
package examples

// Prediction markets example
//
// Prediction-market exchanges live in the ccxtprediction package and embed
// PredictionExchange, which adds events/outcomes helpers on top of Exchange.

import (
	"fmt"

	ccxtprediction "ccxt/go/ccxt/prediction"
)

func PredictionMarketsExample() {
	exchange := ccxtprediction.NewPolymarket(nil)
	fmt.Println("id:", exchange.Id)
	fmt.Println("isPrediction:", exchange.IsPrediction())
	markets, err := exchange.LoadMarkets()
	if err != nil {
		fmt.Println("fetchMarkets skipped (offline/geo):", err)
		return
	}
	fmt.Println("fetched markets:", len(markets))
}

```
