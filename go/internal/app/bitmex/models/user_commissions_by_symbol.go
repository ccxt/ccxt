package models

// UserCommissionsBySymbol user commissions by symbol
type UserCommissionsBySymbol struct {
	Symbol                  UserCommission            `json:"__symbol__,omitempty"`
	UserCommissionsBySymbol map[string]UserCommission `json:"-"`
}
