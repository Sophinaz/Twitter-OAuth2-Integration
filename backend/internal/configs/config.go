package configs

import (
	"log"
	"os"
	"strconv"
	"github.com/joho/godotenv"
)

type Config struct {
	ServerHost          string
	ServerPort          string
	DatabaseHost        string
	DatabasePort        string
	DatabaseUser        string
	DatabasePassword    string
	DatabaseName        string
	DBConnectionString  string
	TwitterClientID     string
	TwitterClientSecret string
	TwitterRedirectURI  string
}

var ENVS, _ = LoadConfig()

func LoadConfig() (*Config, error) {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	cfg := &Config{
		ServerHost:          getEnv("SERVER_HOST", "localhost"),
		ServerPort:          getEnv("SERVER_PORT", "8080"),
		DatabaseHost:        getEnv("DATABASE_HOST", "postgres"),
		DatabasePort:        getEnv("DATABASE_PORT", "5432"),
		DatabaseUser:        getEnv("DATABASE_USER", "ccdevtech"),
		DatabasePassword:    getEnv("DATABASE_PASSWORD", "12345678"),
		DatabaseName:        getEnv("DATABASE_NAME", "twitter"),
		DBConnectionString:  getEnv("DATABASE_URL", ""),
		TwitterClientID:     getEnv("TWITTER_CLIENT_ID", "TnlOMnVXcmNfdDA3dE1BSTlTeDQ6MTpjaQ"),
		TwitterClientSecret: getEnv("TWITTER_CLIENT_SECRET", "A5KvCQAaJs27_hGtuRaVgFYgJHq1VATaI6E1WxVthWfe7KbzB2"),
		TwitterRedirectURI:  getEnv("TWITTER_REDIRECT_URI", "http://localhost:3000"),
	}

	return cfg, nil
}

func getEnv(key string, defaultValue string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return defaultValue
}

func getTimeEnv(key string, defaultValue int64) int64 {
	if value, ok := os.LookupEnv(key); ok {
		i, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return defaultValue
		}
		return i
	}
	return defaultValue
}
