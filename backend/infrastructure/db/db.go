package db

import (
	"fmt"
	"log"
	config "github.com/Sophinaz/chapa-digital-wallet-system-assignment/internal/configs"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DBConfig struct {
	host     string
	port     string
	user     string
	password string
	dbname   string
}

func NewDBConfig() DBConfig {
	return DBConfig{
		host:     config.ENVS.DatabaseHost,
		port:     config.ENVS.DatabasePort,
		user:     config.ENVS.DatabaseUser,
		password: config.ENVS.DatabasePassword,
		dbname:   config.ENVS.DatabaseName,
	}
}

func GetConnection(cfg DBConfig) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.host, cfg.port, cfg.user, cfg.password, cfg.dbname,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	log.Println("DB Connection established...")
	return db
}
