package models

// OrderBookL2 order book l2
type OrderBookL2 struct {
	ID     int64   `json:"id"`
	Price  float64 `json:"price,omitempty"`
	Side   string  `json:"side"`
	Size   int64   `json:"size,omitempty"`
	Symbol string  `json:"symbol"`
}
