package models

import "time"

// Margin margin
type Margin struct {
	Account            int64     `json:"account"`
	Action             string    `json:"action,omitempty"`
	Amount             int64     `json:"amount,omitempty"`
	AvailableMargin    int64     `json:"availableMargin,omitempty"`
	Commission         float64   `json:"commission,omitempty"`
	ConfirmedDebit     int64     `json:"confirmedDebit,omitempty"`
	Currency           string    `json:"currency"`
	ExcessMargin       int64     `json:"excessMargin,omitempty"`
	ExcessMarginPcnt   float64   `json:"excessMarginPcnt,omitempty"`
	GrossComm          int64     `json:"grossComm,omitempty"`
	GrossExecCost      int64     `json:"grossExecCost,omitempty"`
	GrossLastValue     int64     `json:"grossLastValue,omitempty"`
	GrossMarkValue     int64     `json:"grossMarkValue,omitempty"`
	GrossOpenCost      int64     `json:"grossOpenCost,omitempty"`
	GrossOpenPremium   int64     `json:"grossOpenPremium,omitempty"`
	IndicativeTax      int64     `json:"indicativeTax,omitempty"`
	InitMargin         int64     `json:"initMargin,omitempty"`
	MaintMargin        int64     `json:"maintMargin,omitempty"`
	MarginBalance      int64     `json:"marginBalance,omitempty"`
	MarginBalancePcnt  float64   `json:"marginBalancePcnt,omitempty"`
	MarginLeverage     float64   `json:"marginLeverage,omitempty"`
	MarginUsedPcnt     float64   `json:"marginUsedPcnt,omitempty"`
	PendingCredit      int64     `json:"pendingCredit,omitempty"`
	PendingDebit       int64     `json:"pendingDebit,omitempty"`
	PrevRealisedPnl    int64     `json:"prevRealisedPnl,omitempty"`
	PrevState          string    `json:"prevState,omitempty"`
	PrevUnrealisedPnl  int64     `json:"prevUnrealisedPnl,omitempty"`
	RealisedPnl        int64     `json:"realisedPnl,omitempty"`
	RiskLimit          int64     `json:"riskLimit,omitempty"`
	RiskValue          int64     `json:"riskValue,omitempty"`
	SessionMargin      int64     `json:"sessionMargin,omitempty"`
	State              string    `json:"state,omitempty"`
	SyntheticMargin    int64     `json:"syntheticMargin,omitempty"`
	TargetExcessMargin int64     `json:"targetExcessMargin,omitempty"`
	TaxableMargin      int64     `json:"taxableMargin,omitempty"`
	Timestamp          time.Time `json:"timestamp,omitempty"`
	UnrealisedPnl      int64     `json:"unrealisedPnl,omitempty"`
	UnrealisedProfit   int64     `json:"unrealisedProfit,omitempty"`
	VarMargin          int64     `json:"varMargin,omitempty"`
	WalletBalance      int64     `json:"walletBalance,omitempty"`
	WithdrawableMargin int64     `json:"withdrawableMargin,omitempty"`
}
