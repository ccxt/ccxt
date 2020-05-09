package models

import "time"

// Quote Best Bid/Offer Snapshots & Historical Bins
type Quote struct {
	AskPrice  float64   `json:"askPrice,omitempty"`
	AskSize   int64     `json:"askSize,omitempty"`
	BidPrice  float64   `json:"bidPrice,omitempty"`
	BidSize   int64     `json:"bidSize,omitempty"`
	Symbol    string    `json:"symbol"`
	Timestamp time.Time `json:"timestamp"`
}
