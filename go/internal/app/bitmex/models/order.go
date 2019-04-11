package models

import "time"

// Order Placement, Cancellation, Amending, and History
type Order struct {
	Account               int64     `json:"account,omitempty"`
	AvgPx                 float64   `json:"avgPx,omitempty"`
	ClOrdID               string    `json:"clOrdID,omitempty"`
	ClOrdLinkID           string    `json:"clOrdLinkID,omitempty"`
	ContingencyType       string    `json:"contingencyType,omitempty"`
	CumQty                int64     `json:"cumQty,omitempty"`
	Currency              string    `json:"currency,omitempty"`
	DisplayQty            int64     `json:"displayQty,omitempty"`
	ExDestination         string    `json:"exDestination,omitempty"`
	ExecInst              string    `json:"execInst,omitempty"`
	LeavesQty             int64     `json:"leavesQty,omitempty"`
	MultiLegReportingType string    `json:"multiLegReportingType,omitempty"`
	OrdRejReason          string    `json:"ordRejReason,omitempty"`
	OrdStatus             string    `json:"ordStatus,omitempty"`
	OrdType               string    `json:"ordType,omitempty"`
	OrderID               string    `json:"orderID"`
	OrderQty              int64     `json:"orderQty,omitempty"`
	PegOffsetValue        float64   `json:"pegOffsetValue,omitempty"`
	PegPriceType          string    `json:"pegPriceType,omitempty"`
	Price                 float64   `json:"price,omitempty"`
	SettlCurrency         string    `json:"settlCurrency,omitempty"`
	Side                  string    `json:"side,omitempty"`
	SimpleCumQty          float64   `json:"simpleCumQty,omitempty"`
	SimpleLeavesQty       float64   `json:"simpleLeavesQty,omitempty"`
	SimpleOrderQty        float64   `json:"simpleOrderQty,omitempty"`
	StopPx                float64   `json:"stopPx,omitempty"`
	Symbol                string    `json:"symbol,omitempty"`
	Text                  string    `json:"text,omitempty"`
	TimeInForce           string    `json:"timeInForce,omitempty"`
	Timestamp             time.Time `json:"timestamp,omitempty"`
	TransactTime          time.Time `json:"transactTime,omitempty"`
	Triggered             string    `json:"triggered,omitempty"`
	WorkingIndicator      bool      `json:"workingIndicator,omitempty"`
}
