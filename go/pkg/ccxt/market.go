package ccxt

// Market struct
type Market struct {
	ID             string      `json:"id"`     // exchange specific
	Symbol         string      `json:"symbol"` // ccxt unified
	Base           string      `json:"base"`
	BaseNumericID  string      `json:"baseNumericId"`
	Quote          string      `json:"quote"`
	QuoteNumericID string      `json:"quoteNumericId"`
	BaseID         string      `json:"baseId"`     // from bitmex
	QuoteID        string      `json:"quoteId"`    // from bitmex
	Active         bool        `json:"active"`     // from bitmex
	Taker          float64     `json:"taker"`      // from bitmex
	Maker          float64     `json:"maker"`      // from bitmex
	Type           string      `json:"type"`       // from bitmex
	Spot           bool        `json:"spot"`       // from bitmex
	Swap           bool        `json:"swap"`       // from bitmex
	Future         bool        `json:"future"`     // from bitmex
	Prediction     bool        `json:"prediction"` // from bitmex
	Precision      Precision   `json:"precision"`
	Limits         Limits      `json:"limits"`
	Lot            float64     `json:"lot"`
	Info           interface{} `json:"info"`
}

// Precision struct
type Precision struct {
	Amount int `json:"amount"`
	Base   int `json:"base"`
	Price  int `json:"price"`
	Cost   int `json:"cost"`
}

// Limits struct
type Limits struct {
	Amount MinMax `json:"amount"`
	Price  MinMax `json:"price"`
	Cost   MinMax `json:"cost"`
}

// MinMax struct
type MinMax struct {
	Min float64 `json:"min"`
	Max float64 `json:"max"`
}
