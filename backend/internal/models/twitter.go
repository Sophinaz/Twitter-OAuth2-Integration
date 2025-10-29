package models

import "time"

type TwitterUser struct {
	ID           uint      `gorm:"primaryKey"`
	TwitterID    string    `gorm:"column:twitter_id"` // link to your app user if needed
	Name         string    `gorm:"column:name"`
	Username     string    `gorm:"column:username"`
	AccessToken  string    `gorm:"column:access_token"`
	RefreshToken string    `gorm:"column:refresh_token"`
	ExpiresAt    time.Time `gorm:"column:expires_at"`
	TokenType    string    `gorm:"column:token_type"`
	Scope        string    `gorm:"column:scope"`
	CreatedAt    time.Time `gorm:"column:created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at"`
}

func (TwitterUser) TableName() string {
	return "twitter_users"
}

type OAuthToken struct {
    AccessToken  string `json:"access_token" bson:"access_token"`
    RefreshToken string `json:"refresh_token" bson:"refresh_token"`
    TokenType    string `json:"token_type" bson:"token_type"`
    ExpiresIn    int    `json:"expires_in" bson:"expires_in"`
	Scope        string `json:"scope" bson:"scope"`
}

type TwitterUserProfile struct {
	TwitterID    string `json:"id" bson:"id"`
	Name         string `json:"name" bson:"name"`
	Username     string `json:"username" bson:"username"`
}