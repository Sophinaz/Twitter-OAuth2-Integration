package repositories

import (
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/models"
	"gorm.io/gorm"
)

type TwitterRepository interface {
	SaveTwitterUser(user *models.TwitterUser) error
}

type TwitterRepositoryImpl struct {
	db *gorm.DB
}

func NewTwitterRepository(db *gorm.DB) TwitterRepository {
	return &TwitterRepositoryImpl{db: db}
}


func (r *TwitterRepositoryImpl) SaveTwitterUser(user *models.TwitterUser) error {
    // insert or update user record
	result := r.db.Save(&user)
    return result.Error
}