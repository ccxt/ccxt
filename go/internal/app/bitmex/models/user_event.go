package models

import "time"

// UserEvent User Events for auditing
type UserEvent struct {
	Created        time.Time   `json:"created"`
	CreatedByID    float64     `json:"createdById"`
	EventMeta      interface{} `json:"eventMeta,omitempty"`
	EventStatus    string      `json:"eventStatus,omitempty"`
	EventType      string      `json:"eventType,omitempty"`
	GeoipCountry   string      `json:"geoipCountry,omitempty"`
	GeoipRegion    string      `json:"geoipRegion,omitempty"`
	GeoipSubRegion string      `json:"geoipSubRegion,omitempty"`
	ID             float64     `json:"id,omitempty"`
	IP             string      `json:"ip,omitempty"`
	Status         string      `json:"status"`
	Type           string      `json:"type"`
	UserID         float64     `json:"userId"`
}
