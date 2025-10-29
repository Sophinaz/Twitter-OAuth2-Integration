package services

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/configs"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/models"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/repositories"
)

type TwitterService struct {
	twitterRepository repositories.TwitterRepositoryImpl
}

func NewTwitterService(twitterRepository repositories.TwitterRepositoryImpl) *TwitterService {
	return &TwitterService{twitterRepository: twitterRepository}
}

func (s *TwitterService) Callback(code string, codeVerifier string) error {
	token, err := s.exchangeCodeForToken(code, codeVerifier)
	if err != nil {
		return err
	}

	userData, err := s.fetchUserProfile(token.AccessToken)
	if err != nil {
		return err
	}

	// Convert OAuthToken to TwitterUserToken
	twitterUser := &models.TwitterUser{
		TwitterID:    userData.TwitterID,
		Name:         userData.Name,
		Username:     userData.Username,
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		Scope:        token.Scope,
		TokenType:    token.TokenType,
		ExpiresAt:    time.Now().Add(time.Duration(token.ExpiresIn) * time.Second),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	return s.twitterRepository.SaveTwitterUser(twitterUser)
}

func (s *TwitterService) exchangeCodeForToken(code string, codeVerifier string) (*models.OAuthToken, error) {
	// Prepare form data
	form := url.Values{}
	form.Set("code", code)
	form.Set("grant_type", "authorization_code")
	form.Set("client_id", configs.ENVS.TwitterClientID)
	form.Set("redirect_uri", configs.ENVS.TwitterRedirectURI)
	form.Set("code_verifier", codeVerifier)

	// Create the request
	req, err := http.NewRequest("POST", "https://api.twitter.com/2/oauth2/token", strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}

	// Set Content-Type header
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// Create basic auth header: base64(client_id:client_secret)
	credentials := configs.ENVS.TwitterClientID + ":" + configs.ENVS.TwitterClientSecret
	encodedCredentials := base64.StdEncoding.EncodeToString([]byte(credentials))
	req.Header.Set("Authorization", "Basic "+encodedCredentials)

	// Execute the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var token models.OAuthToken
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return nil, err
	}

    fmt.Println("token response", token)
	return &token, nil
}

func (s *TwitterService) fetchUserProfile(accessToken string) (*models.TwitterUserProfile, error) {
	// Create the request to get user profile
	req, err := http.NewRequest("GET", "https://api.x.com/2/users/me", nil)
	if err != nil {
		return nil, err
	}

	// Set Authorization header with Bearer token
	req.Header.Set("Authorization", "Bearer "+accessToken)

	// Execute the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Parse the response
	var response struct {
		Data models.TwitterUserProfile `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}
    fmt.Println("user profile response", response)
	return &response.Data, nil
}
