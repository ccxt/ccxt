package models

import "time"

// Settlement Historical Settlement Data
type Settlement struct {
	Bankrupt              int64     `json:"bankrupt,omitempty"`
	OptionStrikePrice     float64   `json:"optionStrikePrice,omitempty"`
	OptionUnderlyingPrice float64   `json:"optionUnderlyingPrice,omitempty"`
	SettledPrice          float64   `json:"settledPrice,omitempty"`
	SettlementType        string    `json:"settlementType,omitempty"`
	Symbol                string    `json:"symbol"`
	TaxBase               int64     `json:"taxBase,omitempty"`
	TaxRate               float64   `json:"taxRate,omitempty"`
	Timestamp             time.Time `json:"timestamp"`
}
