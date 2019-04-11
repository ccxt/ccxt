package models

// UserCommission user commission
type UserCommission struct {
	MakerFee      float64 `json:"makerFee,omitempty"`
	MaxFee        float64 `json:"maxFee,omitempty"`
	SettlementFee float64 `json:"settlementFee,omitempty"`
	TakerFee      float64 `json:"takerFee,omitempty"`
}
