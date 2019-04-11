package models

import "time"

// TradeBin trade bin
type TradeBin struct {
	Close           float64   `json:"close,omitempty"`
	ForeignNotional float64   `json:"foreignNotional,omitempty"`
	High            float64   `json:"high,omitempty"`
	HomeNotional    float64   `json:"homeNotional,omitempty"`
	LastSize        int64     `json:"lastSize,omitempty"`
	Low             float64   `json:"low,omitempty"`
	Open            float64   `json:"open,omitempty"`
	Symbol          string    `json:"symbol"`
	Timestamp       time.Time `json:"timestamp"`
	Trades          int64     `json:"trades,omitempty"`
	Turnover        int64     `json:"turnover,omitempty"`
	Volume          int64     `json:"volume,omitempty"`
	Vwap            float64   `json:"vwap,omitempty"`
}
