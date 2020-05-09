package models

// ConnectedUsers connected users
type ConnectedUsers struct {
	Bots  int32 `json:"bots,omitempty"`
	Users int32 `json:"users,omitempty"`
}
