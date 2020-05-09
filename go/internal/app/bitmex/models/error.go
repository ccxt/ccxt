package models

// Error error
type Error struct {
	Error ErrorError `json:"error"`
}

// ErrorError error error
type ErrorError struct {
	Message string `json:"message,omitempty"`
	Name    string `json:"name,omitempty"`
}
