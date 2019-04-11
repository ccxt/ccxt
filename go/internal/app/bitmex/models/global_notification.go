package models

import "time"

// GlobalNotification Account Notifications
type GlobalNotification struct {
	Body              string    `json:"body"`
	Closable          bool      `json:"closable,omitempty"`
	Date              time.Time `json:"date"`
	ID                int32     `json:"id,omitempty"`
	Persist           bool      `json:"persist,omitempty"`
	Sound             string    `json:"sound,omitempty"`
	Title             string    `json:"title"`
	TTL               int32     `json:"ttl"`
	Type              string    `json:"type,omitempty"`
	WaitForVisibility bool      `json:"waitForVisibility,omitempty"`
}
