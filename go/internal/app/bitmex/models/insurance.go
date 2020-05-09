package models

import "time"

// Insurance Insurance Fund Data
type Insurance struct {
	Currency      string    `json:"currency"`
	Timestamp     time.Time `json:"timestamp"`
	WalletBalance int64     `json:"walletBalance,omitempty"`
}
