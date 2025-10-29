package services

import (
    // "encoding/json"
    // "fmt"
    // "net/http"

    "github.com/Sophinaz/Twitter-OAuth2-Integration/internal/models"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/repositories"
)

type userResponse struct {
    Data models.TwitterUser `json:"data"`
}

type UserService struct {
    twitterRepository repositories.UserRepository
}

func NewUserService(twitterRepository repositories.UserRepository) *UserService {
    return &UserService{twitterRepository: twitterRepository}
}
// func (s *TwitterService) fetchUserProfile(accessToken string) (*models.TwitterUser, error) {
//     req, _ := http.NewRequest("GET", "https://api.x.com/2/users/me", nil)
//     req.Header.Set("Authorization", "Bearer "+accessToken)

//     resp, err := http.DefaultClient.Do(req)
//     if err != nil {
//         return nil, err
//     }
//     defer resp.Body.Close()

//     if resp.StatusCode != http.StatusOK {
//         return nil, fmt.Errorf("failed to fetch user: %s", resp.Status)
//     }

//     var result userResponse
//     if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
//         return nil, err
//     }

//     return &result.Data, nil
// }

func (s *UserService) GetUserProfile(userID uint) (*models.TwitterUser, error) {
    return s.twitterRepository.GetUserProfile(userID)
}