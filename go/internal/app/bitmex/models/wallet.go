package models

import "time"

// Wallet wallet
type Wallet struct {
	Account          int64     `json:"account"`
	Addr             string    `json:"addr,omitempty"`
	Amount           int64     `json:"amount,omitempty"`
	ConfirmedDebit   int64     `json:"confirmedDebit,omitempty"`
	Currency         string    `json:"currency"`
	DeltaAmount      int64     `json:"deltaAmount,omitempty"`
	DeltaDeposited   int64     `json:"deltaDeposited,omitempty"`
	DeltaTransferIn  int64     `json:"deltaTransferIn,omitempty"`
	DeltaTransferOut int64     `json:"deltaTransferOut,omitempty"`
	DeltaWithdrawn   int64     `json:"deltaWithdrawn,omitempty"`
	Deposited        int64     `json:"deposited,omitempty"`
	PendingCredit    int64     `json:"pendingCredit,omitempty"`
	PendingDebit     int64     `json:"pendingDebit,omitempty"`
	PrevAmount       int64     `json:"prevAmount,omitempty"`
	PrevDeposited    int64     `json:"prevDeposited,omitempty"`
	PrevTimestamp    time.Time `json:"prevTimestamp,omitempty"`
	PrevTransferIn   int64     `json:"prevTransferIn,omitempty"`
	PrevTransferOut  int64     `json:"prevTransferOut,omitempty"`
	PrevWithdrawn    int64     `json:"prevWithdrawn,omitempty"`
	Script           string    `json:"script,omitempty"`
	Timestamp        time.Time `json:"timestamp,omitempty"`
	TransferIn       int64     `json:"transferIn,omitempty"`
	TransferOut      int64     `json:"transferOut,omitempty"`
	WithdrawalLock   []string  `json:"withdrawalLock"`
	Withdrawn        int64     `json:"withdrawn,omitempty"`
}
