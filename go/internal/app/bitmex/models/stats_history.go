package models

import "time"

// StatsHistory stats history
type StatsHistory struct {
	Currency   string    `json:"currency,omitempty"`
	Date       time.Time `json:"date"`
	RootSymbol string    `json:"rootSymbol"`
	Turnover   int64     `json:"turnover,omitempty"`
	Volume     int64     `json:"volume,omitempty"`
}
