package models

import "time"

// Transaction transaction
type Transaction struct {
	Account        int64     `json:"account,omitempty"`
	Address        string    `json:"address,omitempty"`
	Amount         int64     `json:"amount,omitempty"`
	Currency       string    `json:"currency,omitempty"`
	Fee            int64     `json:"fee,omitempty"`
	Text           string    `json:"text,omitempty"`
	Timestamp      time.Time `json:"timestamp,omitempty"`
	TransactID     string    `json:"transactID"`
	TransactStatus string    `json:"transactStatus,omitempty"`
	TransactTime   time.Time `json:"transactTime,omitempty"`
	TransactType   string    `json:"transactType,omitempty"`
	Tx             string    `json:"tx,omitempty"`
}
