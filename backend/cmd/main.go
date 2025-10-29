package main

import (
	"log"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/cmd/routers"
	db "github.com/Sophinaz/Twitter-OAuth2-Integration/infrastructure/db"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/configs"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	// database connection
	dbConfig := db.NewDBConfig()
	database := db.GetConnection(dbConfig)

	log.Println("Database connection established...")
	
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Allow all origins for now
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}))
	router := routers.NewRouter(r, database)

	if err := routers.Run(router); err != nil {
		log.Fatalf("Failed to run the server: %v", err)
	}

	log.Println("Server is running on", configs.ENVS.ServerHost+":"+configs.ENVS.ServerPort)
}
