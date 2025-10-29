package routers

import (
	"errors"
	"fmt"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/cmd/handlers"
	config "github.com/Sophinaz/Twitter-OAuth2-Integration/internal/configs"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/repositories"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewRouter(router *gin.Engine, db *gorm.DB) *gin.Engine {
	new_router := router.Group("/api/v1")

	// Initialize JWT service
	twitterRepository := repositories.NewTwitterRepository(db)
	twitterService := services.NewTwitterService(twitterRepository)
	twitterHandler := handlers.NewTwitterHandler(twitterService)
	NewTwitterRoute(new_router, twitterHandler)

	userRepository := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepository)
	userHandler := handlers.NewUserHandler(userService)
	NewUserRoute(new_router, userHandler)
	
	return router
}

// Run starts the Gin server with the configured host and port.
func Run(router *gin.Engine) error {
	serverHost := config.ENVS.ServerHost
	serverPort := config.ENVS.ServerPort

	if serverHost == "" || serverPort == "" {
		return errors.New("server host or port is not configured")
	}
	fmt.Printf("Starting server at %s:%s\n", serverHost, serverPort)

	address := serverHost + ":" + serverPort
	return router.Run(address)
}
