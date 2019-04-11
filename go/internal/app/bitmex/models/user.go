package models

import "time"

// User Account Operations
type User struct {
	TFAEnabled             string          `json:"TFAEnabled,omitempty"`
	AffiliateID            string          `json:"affiliateID,omitempty"`
	Country                string          `json:"country,omitempty"`
	Created                time.Time       `json:"created,omitempty"`
	Email                  string          `json:"email"`
	Firstname              string          `json:"firstname,omitempty"`
	GeoipCountry           string          `json:"geoipCountry,omitempty"`
	GeoipRegion            string          `json:"geoipRegion,omitempty"`
	ID                     int32           `json:"id,omitempty"`
	LastUpdated            time.Time       `json:"lastUpdated,omitempty"`
	Lastname               string          `json:"lastname,omitempty"`
	OwnerID                int32           `json:"ownerId,omitempty"`
	PgpPubKey              string          `json:"pgpPubKey,omitempty"`
	Phone                  string          `json:"phone,omitempty"`
	Preferences            UserPreferences `json:"preferences,omitempty"`
	RestrictedEngineFields interface{}     `json:"restrictedEngineFields,omitempty"`
	Typ                    string          `json:"typ,omitempty"`
	Username               string          `json:"username"`
}
