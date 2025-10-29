package repositories

import (
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	GetUserProfile(userID string) (*models.TwitterUser, error)
}

type UserRepositoryImpl struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &UserRepositoryImpl{db: db}
}


func (r *UserRepositoryImpl) GetUserProfile(userID string) (*models.TwitterUser, error) {
    var user models.TwitterUser
    result := r.db.Where("twitter_id = ?", userID).First(&user)
    if result.Error != nil {
        return nil, result.Error
    }
    return &user, nil
}