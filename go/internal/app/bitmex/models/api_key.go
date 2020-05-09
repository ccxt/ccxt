package models

import "time"

// APIKey Persistent API Keys for Developers
type APIKey struct {
	Cidr        string        `json:"cidr,omitempty"`
	Created     time.Time     `json:"created,omitempty"`
	Enabled     bool          `json:"enabled,omitempty"`
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Nonce       int64         `json:"nonce"`
	Permissions []interface{} `json:"permissions"`
	Secret      string        `json:"secret"`
	UserID      int32         `json:"userId"`
}
