package models

// StatsUSD stats u s d
type StatsUSD struct {
	Currency     string `json:"currency,omitempty"`
	RootSymbol   string `json:"rootSymbol"`
	Turnover     int64  `json:"turnover,omitempty"`
	Turnover24h  int64  `json:"turnover24h,omitempty"`
	Turnover30d  int64  `json:"turnover30d,omitempty"`
	Turnover365d int64  `json:"turnover365d,omitempty"`
}
