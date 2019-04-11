package models

import "time"

// Affiliate affiliate
type Affiliate struct {
	Account          int64     `json:"account"`
	AffiliatePayout  float64   `json:"affiliatePayout,omitempty"`
	Currency         string    `json:"currency"`
	ExecComm         int64     `json:"execComm,omitempty"`
	ExecTurnover     int64     `json:"execTurnover,omitempty"`
	PayoutPcnt       float64   `json:"payoutPcnt,omitempty"`
	PendingPayout    int64     `json:"pendingPayout,omitempty"`
	PrevComm         int64     `json:"prevComm,omitempty"`
	PrevPayout       int64     `json:"prevPayout,omitempty"`
	PrevTimestamp    time.Time `json:"prevTimestamp,omitempty"`
	PrevTurnover     int64     `json:"prevTurnover,omitempty"`
	ReferralDiscount float64   `json:"referralDiscount,omitempty"`
	ReferrerAccount  float64   `json:"referrerAccount,omitempty"`
	Timestamp        time.Time `json:"timestamp,omitempty"`
	TotalComm        int64     `json:"totalComm,omitempty"`
	TotalReferrals   int64     `json:"totalReferrals,omitempty"`
	TotalTurnover    int64     `json:"totalTurnover,omitempty"`
}
