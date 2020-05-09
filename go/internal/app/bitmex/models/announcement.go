package models

import "time"

// Announcement Public Announcements
type Announcement struct {
	Content string    `json:"content,omitempty"`
	Date    time.Time `json:"date,omitempty"`
	ID      int32     `json:"id"`
	Link    string    `json:"link,omitempty"`
	Title   string    `json:"title,omitempty"`
}
