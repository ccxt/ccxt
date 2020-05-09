package models

import "time"

// Funding Swap Funding History
type Funding struct {
	FundingInterval  time.Time `json:"fundingInterval,omitempty"`
	FundingRate      float64   `json:"fundingRate,omitempty"`
	FundingRateDaily float64   `json:"fundingRateDaily,omitempty"`
	Symbol           string    `json:"symbol"`
	Timestamp        time.Time `json:"timestamp"`
}
