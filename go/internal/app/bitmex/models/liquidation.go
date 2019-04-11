package models

// Liquidation Active Liquidations
type Liquidation struct {
	LeavesQty int64   `json:"leavesQty,omitempty"`
	OrderID   string  `json:"orderID"`
	Price     float64 `json:"price,omitempty"`
	Side      string  `json:"side,omitempty"`
	Symbol    string  `json:"symbol,omitempty"`
}
