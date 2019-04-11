package models

// CommunicationToken User communication SNS token
type CommunicationToken struct {
	Channel     string `json:"channel"`
	DeviceToken string `json:"deviceToken"`
	ID          string `json:"id"`
	UserID      int32  `json:"userId"`
}
