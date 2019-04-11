package models

// Leaderboard Information on Top Users
type Leaderboard struct {
	IsRealName bool    `json:"isRealName,omitempty"`
	Name       string  `json:"name"`
	Profit     float64 `json:"profit,omitempty"`
}
