package models

import "time"

// Execution Raw Order and Balance Data
type Execution struct {
	Account               int64     `json:"account,omitempty"`
	AvgPx                 float64   `json:"avgPx,omitempty"`
	ClOrdID               string    `json:"clOrdID,omitempty"`
	ClOrdLinkID           string    `json:"clOrdLinkID,omitempty"`
	Commission            float64   `json:"commission,omitempty"`
	ContingencyType       string    `json:"contingencyType,omitempty"`
	CumQty                int64     `json:"cumQty,omitempty"`
	Currency              string    `json:"currency,omitempty"`
	DisplayQty            int64     `json:"displayQty,omitempty"`
	ExDestination         string    `json:"exDestination,omitempty"`
	ExecComm              int64     `json:"execComm,omitempty"`
	ExecCost              int64     `json:"execCost,omitempty"`
	ExecID                string    `json:"execID"`
	ExecInst              string    `json:"execInst,omitempty"`
	ExecType              string    `json:"execType,omitempty"`
	ForeignNotional       float64   `json:"foreignNotional,omitempty"`
	HomeNotional          float64   `json:"homeNotional,omitempty"`
	LastLiquidityInd      string    `json:"lastLiquidityInd,omitempty"`
	LastMkt               string    `json:"lastMkt,omitempty"`
	LastPx                float64   `json:"lastPx,omitempty"`
	LastQty               int64     `json:"lastQty,omitempty"`
	LeavesQty             int64     `json:"leavesQty,omitempty"`
	MultiLegReportingType string    `json:"multiLegReportingType,omitempty"`
	OrdRejReason          string    `json:"ordRejReason,omitempty"`
	OrdStatus             string    `json:"ordStatus,omitempty"`
	OrdType               string    `json:"ordType,omitempty"`
	OrderID               string    `json:"orderID,omitempty"`
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
	TradePublishIndicator string    `json:"tradePublishIndicator,omitempty"`
	TransactTime          time.Time `json:"transactTime,omitempty"`
	TrdMatchID            string    `json:"trdMatchID,omitempty"`
	Triggered             string    `json:"triggered,omitempty"`
	UnderlyingLastPx      float64   `json:"underlyingLastPx,omitempty"`
	WorkingIndicator      bool      `json:"workingIndicator,omitempty"`
}
