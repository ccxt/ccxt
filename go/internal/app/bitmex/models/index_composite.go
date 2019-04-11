package models

import "time"

// IndexComposite index composite
type IndexComposite struct {
	IndexSymbol string    `json:"indexSymbol,omitempty"`
	LastPrice   float64   `json:"lastPrice,omitempty"`
	Logged      time.Time `json:"logged,omitempty"`
	Reference   string    `json:"reference,omitempty"`
	Symbol      string    `json:"symbol,omitempty"`
	Timestamp   time.Time `json:"timestamp"`
	Weight      float64   `json:"weight,omitempty"`
}
