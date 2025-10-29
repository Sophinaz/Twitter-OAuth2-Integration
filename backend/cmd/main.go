package main

import (
	"log"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/cmd/routers"
	db "github.com/Sophinaz/Twitter-OAuth2-Integration/infrastructure/db"
	"github.com/Sophinaz/Twitter-OAuth2-Integration/internal/configs"
	"github.com/gin-gonic/gin"
)

func main() {
	// database connection
	dbConfig := db.NewDBConfig()
	database := db.GetConnection(dbConfig)

	log.Println("Database connection established...")
	
	r := gin.Default()


	router := routers.NewRouter(r, database)

	if err := routers.Run(router); err != nil {
		log.Fatalf("Failed to run the server: %v", err)
	}

	log.Println("Server is running on", configs.ENVS.ServerHost+":"+configs.ENVS.ServerPort)
}
