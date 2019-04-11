package models

import "time"

// AccessToken access token
type AccessToken struct {
	Created time.Time `json:"created,omitempty"`
	ID      string    `json:"id"`
	TTL     float64   `json:"ttl,omitempty"`
	UserID  float64   `json:"userId,omitempty"`
}
