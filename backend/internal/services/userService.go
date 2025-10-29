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
    userRepository repositories.UserRepository
}

func NewUserService(userRepository repositories.UserRepository) *UserService {
    return &UserService{userRepository: userRepository}
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

func (s *UserService) GetUserProfile(userID string) (*models.TwitterUser, error) {
    user, err := s.userRepository.GetUserProfile(userID)
    if err != nil {
        return nil, err
    }
    return user, nil
}