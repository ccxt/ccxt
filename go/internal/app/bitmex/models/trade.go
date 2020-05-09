package models

import "time"

// Trade Individual & Bucketed Trades
type Trade struct {
	ForeignNotional float64   `json:"foreignNotional,omitempty"`
	GrossValue      int64     `json:"grossValue,omitempty"`
	HomeNotional    float64   `json:"homeNotional,omitempty"`
	Price           float64   `json:"price,omitempty"`
	Side            string    `json:"side,omitempty"`
	Size            int64     `json:"size,omitempty"`
	Symbol          string    `json:"symbol"`
	TickDirection   string    `json:"tickDirection,omitempty"`
	Timestamp       time.Time `json:"timestamp"`
	TrdMatchID      string    `json:"trdMatchID,omitempty"`
}
