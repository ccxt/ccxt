package models

import "time"

// Chat Trollbox Data
type Chat struct {
	ChannelID float64   `json:"channelID,omitempty"`
	Date      time.Time `json:"date"`
	FromBot   bool      `json:"fromBot,omitempty"`
	HTML      string    `json:"html"`
	ID        int32     `json:"id,omitempty"`
	Message   string    `json:"message"`
	User      string    `json:"user"`
}
