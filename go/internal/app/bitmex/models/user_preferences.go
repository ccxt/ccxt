package models

import "time"

// UserPreferences user preferences
type UserPreferences struct {
	AlertOnLiquidations     bool        `json:"alertOnLiquidations,omitempty"`
	AnimationsEnabled       bool        `json:"animationsEnabled,omitempty"`
	AnnouncementsLastSeen   time.Time   `json:"announcementsLastSeen,omitempty"`
	ChatChannelID           float64     `json:"chatChannelID,omitempty"`
	ColorTheme              string      `json:"colorTheme,omitempty"`
	Currency                string      `json:"currency,omitempty"`
	Debug                   bool        `json:"debug,omitempty"`
	DisableEmails           []string    `json:"disableEmails"`
	DisablePush             []string    `json:"disablePush"`
	HideConfirmDialogs      []string    `json:"hideConfirmDialogs"`
	HideConnectionModal     bool        `json:"hideConnectionModal,omitempty"`
	HideFromLeaderboard     bool        `json:"hideFromLeaderboard,omitempty"`
	HideNameFromLeaderboard bool        `json:"hideNameFromLeaderboard,omitempty"`
	HideNotifications       []string    `json:"hideNotifications"`
	Locale                  string      `json:"locale,omitempty"`
	MsgsSeen                []string    `json:"msgsSeen"`
	OrderBookBinning        interface{} `json:"orderBookBinning,omitempty"`
	OrderBookType           string      `json:"orderBookType,omitempty"`
	OrderClearImmediate     bool        `json:"orderClearImmediate,omitempty"`
	OrderControlsPlusMinus  bool        `json:"orderControlsPlusMinus,omitempty"`
	ShowLocaleNumbers       bool        `json:"showLocaleNumbers,omitempty"`
	Sounds                  []string    `json:"sounds"`
	StrictIPCheck           bool        `json:"strictIPCheck,omitempty"`
	StrictTimeout           bool        `json:"strictTimeout,omitempty"`
	TickerGroup             string      `json:"tickerGroup,omitempty"`
	TickerPinned            bool        `json:"tickerPinned,omitempty"`
	TradeLayout             string      `json:"tradeLayout,omitempty"`
}
