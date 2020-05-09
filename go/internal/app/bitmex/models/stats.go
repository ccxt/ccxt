package models

// Stats Exchange Statistics
type Stats struct {
	Currency     string `json:"currency,omitempty"`
	OpenInterest int64  `json:"openInterest,omitempty"`
	OpenValue    int64  `json:"openValue,omitempty"`
	RootSymbol   string `json:"rootSymbol"`
	Turnover24h  int64  `json:"turnover24h,omitempty"`
	Volume24h    int64  `json:"volume24h,omitempty"`
}
